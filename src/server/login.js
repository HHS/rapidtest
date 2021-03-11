const sql = require('mssql');
const date = require('date-and-time');
const {verifyUser} = require("./firebase");
const {
  verifyKitId
} = require("./kit-verify");
const {
  captchaVerify
} = require('./captcha.js');
const {
  sqlDateNow
} = require('./sql.js');
const {
  tableName,
  readOnly,
  ctrlFirstFields,
  ctrlSympFields,
  clientFields,
  allSwitches
} = require('./form-submit.js');
const config = require("./config");
const NodeCache = require( "node-cache" );
// firebase uid to save proctor info to save on sql queries
const proctorCache = new NodeCache();
const proctorExpire = 5; // refresh every 5 minutes

/* *
The Kit ID is scanned as a GS1 Data matrix.
To prevent issues in the database and regex, the \u001 is replaced with a pipe | on the client.
 */
async function getKitRecord (kitId) {
  const now = await sqlDateNow();
  const pool = await sql.connect(config.sql);

  // Verify valid KitID
  const verifiedKit = await verifyKitId(kitId);
  if (verifiedKit.invalid) return Promise.resolve(verifiedKit);
  kitId = verifiedKit.kit_id;

  // if it's valid then continue
  let result;
  try {
    const request = pool.request().input('kit_id', sql.VarChar(255), kitId);
    result = await request.query('select * from ' + tableName + ' where kit_id = @kit_id');
  } catch (err) {
    return Promise.resolve({
      kit_id: kitId,
      error: true,
      args: err
    });
  }

  const rows = result.recordset;
  let response = {};
  if (result.rowsAffected[0] > 0) {
    const lockedResults = false//rows[0].patient_positive && new Date(rows[0]['patient_results']) < new Date(now.getTime() - lockout * 60000);
    const lockedNew = rows[0]['kit_access_expired'] && new Date(rows[0]['kit_access_expired']) < now;
    if ((lockedResults || lockedNew) && !verifiedKit.is_test) {
      // Kit should not send patient data if it is used up already
      response = {
        kit_id: kitId,
        locked: true
      };
      return Promise.resolve(response);
    } else {
      // if ok load up all the existing data
      response = { expired: false };

      readOnly.concat(clientFields).forEach(k => {
        response[k] = rows[0][k];
      });

      // convert DB types to UI types for N/A null -1, No false 0, Yes true 1
      allSwitches.forEach(k => {
        const v = response[k];
        switch (typeof v) {
        case "object":
        case "undefined":
          response[k] = -1;
          break;
        default:
          response[k] = v === 1 || v === "1" ? 1 : 0;
        }
      });

      ctrlFirstFields.forEach(k => {if (response[k] !== null) response['ctrl_first'] = 0;})
      ctrlSympFields.forEach(k => {if (response[k] !== null && response[k] !== -1) response['ctrl_symp'] = 1;})

      return Promise.resolve(response);
    }
  } else {
    const today = date.format(now, "YYYY-MM-DD");
    const expiredKit = verifiedKit.components.kit_expiration && new Date(verifiedKit.components.kit_expiration) < new Date(today);
    if (expiredKit && !verifiedKit.is_test) {
      response = {
        kit_id: kitId,
        expirationDate: verifiedKit.components.kit_expiration,
        expired: true
      };
      return Promise.resolve(response);
    }
    return Promise.resolve({
      kit_id: kitId,
      missing: true
    });
  }
}

/* *
return true if login credentials are valid
 */
async function getProctorLogin (login, captcha, ip) {
  if (typeof captcha === 'undefined' || captcha)
    captcha = process.env.RECAPTCHA_ENABLED === "true" && process.env.RECAPTCHA_VERIFY === "true";
  if (captcha) {
    if (!login.recaptchaToken) {
      console.log("Expected captcha token but none was provided");
      return new Promise(res => res({recaptchaError: true}));
    }

    const googleResult = await captchaVerify(login.recaptchaToken);
    if (!googleResult["success"] || googleResult["score"] < (process.env.RECAPTCHA_MIN_SCORE || 0.2)) {
      login.googleResult = googleResult;
      console.log("reCAPTCHA fail");
      console.log(login);
      if (captcha) return new Promise(res => res({recaptchaError: true}));
    }
  }
  const email = login.email;
  const token = login.firebase_token;
  let loginError = false;

  if (!email) {
    loginError = true;
  }

  if (!token) {
    loginError = true;
  }

  if (loginError) return new Promise(res => res({ invalid: true }));

  const pool = await sql.connect(config.sql);

  let tokenErr = null;
  const decodedToken = await verifyUser(token).catch(e => tokenErr = e);
  if (tokenErr) {
    console.log("Unable to verify token for firebase user " + email);
    console.log(tokenErr);
    return Promise.resolve({
      invalid: true,
      error: true,
      args: tokenErr
    });
  }
  const uid = decodedToken ? decodedToken.uid : '';

  const cache = proctorCache.get(uid || '');
  if (cache) {
    return new Promise(res => res(cache));
  }

  return new Promise(res => pool.request()
    .input('email', sql.VarChar(255), email)
    .query('select id, agency_id, first_name, last_name, firebase_uid from ' + 'proctor' + ' where email_address = @email')
    .then(result => {
      const rows = result.recordset;
      let response = {};
      if (result.rowsAffected[0] > 0) {
        const row = rows[0];
        const respond = function() {
          response = {
            proctor_name: row.first_name + ' ' + row.last_name,
            proctor_id: row.id,
            proctor_uid: uid,
            agency_id: row.agency_id,
            invalid: false
          };
          Promise.resolve().then(async () => {
            proctorCache.set(uid, response, proctorExpire * 60);
          }).catch(e => console.log("Cannot cache Firebase UID " + uid, e));
          res(response);
        }
        pool.request()
          .input('id', sql.Int, row.id)
          .input('firebase_uid', sql.VarChar(255), uid)
          .input('request_ip', sql.VarChar(255), ip)
          .query([
            'update ',
            'proctor',
            ' SET ',
            'firebase_uid = @firebase_uid, last_login_ip = @request_ip',
            ' WHERE id = @id',
          ].join('')).then(() => {
            respond();
          }).catch(err => res({
            invalid: true,
            error: true,
            args: err
          }));
      } else {
        res({
          invalid: true
        });
      }
    })
    .catch(err => res({
      invalid: true,
      error: true,
      args: err
    })));
}

module.exports = {
  config,
  getProctorLogin,
  getKitRecord
};
