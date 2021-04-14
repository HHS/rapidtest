const express = require('express');
const https = require('https');
const fs = require('fs');
const bodyParser = require("body-parser");
const path = require('path');
const nocache = require('nocache');
const sql = require('mssql');
const config = require("./config");
const {setPassword, setAccountDisabledStatus} = require("./firebase");

const Bugsnag = require('@bugsnag/js');
const BugsnagPluginExpress = require('@bugsnag/plugin-express');

const app = express();
const router = express.Router();
require('@knuckleswtf/scribe-express')(app)

// Enable CORS.
//FIXME: Do for specific routes/origins.
var cors = require('cors');
app.use(cors());

// require request-ip and register it as middleware
var requestIp = require('request-ip');
const {getTimezone} = require("./sql");
const retrieve = require("./Resources/retrieve");
app.use(requestIp.mw())

let middleware;
if (config.isNotLocalDev()) {
  const docker_env = (typeof process.env.docker_env === 'undefined') ? 'local-server' : process.env.docker_env.slice(0,2) + '-server';
  const docker_sha = (typeof process.docker_sha === 'undefined') ? 'local' : process.env.docker_sha;
  Bugsnag.start({
    apiKey: config.bugsnag.apikey,
    releaseStage: docker_env,
    appVersion: docker_sha,
    plugins: [BugsnagPluginExpress]
  });
  middleware = Bugsnag.getPlugin('express');
  app.use(middleware.requestHandler);
}
app.use(nocache());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({limit: '250mb'}));

console.log("process.env.RECAPTCHA_ENABLED: " + process.env.RECAPTCHA_ENABLED);
console.log("process.env.RECAPTCHA_VERIFY: " + process.env.RECAPTCHA_VERIFY);
console.log("process.env.RECAPTCHA_MIN_SCORE: " + process.env.RECAPTCHA_MIN_SCORE);

const {
  sqlDateNow
} = require('./sql.js');
const {
  getKitRecord,
  getProctorLogin
}  = require('./login.js');
const {
  getOptions,
  getSites
} = require('./select-options.js');
const {
  createRecord,
  saveForm
} = require('./form-submit.js');
const {
  getHistory
} = require("./form-history");
const { cryptr } = require('./cryptr');
const { fail } = require('assert');

/**
 * Get SQL date.
 * 
 * Sends the client the datetime from the sql server.
 */
router.post('/api/sql_date_now', async(req,res, next) => {
  Promise.resolve().then(async () => {
    res.send({results: true, now: await sqlDateNow()});
  }).catch(next);
});

/**
 * Proctor login.
 *
 * Verifies proctor fields from login page.
 */
router.post('/api/login', (req,res, next) => {
  Promise.resolve().then(async () => {
    let loginStatus = await getProctorLogin(req.body, undefined, req.clientIp);

    if (loginStatus.recaptchaError === true || loginStatus.invalid === true) {
      loginStatus.options = {};
    } else {
      loginStatus.options = await getOptions([
        'patient_sex',
        'patient_race',
        'patient_ethnicity',
        'patient_county',
        'patient_state',
        'patient_previous_test',
        'patient_positive',
        'site_type'
      ]);
    }
    loginStatus.results = true;
    res.send(loginStatus);
  }).catch(next);
});

/**
 * Search test sites.
 */
router.post('/api/search_sites', (req,res, next) => {
  Promise.resolve().then(async () => {
    let loginStatus = await getProctorLogin(req.body, false, req.clientIp);
    if (loginStatus.invalid === true) {
      loginStatus.sites = [];
    } else {
      loginStatus.sites = await getSites(req.body.searchTerm, req.body.site_type);
    }
    loginStatus.results = true;
    res.send(loginStatus);
  }).catch(next);
});

/**
* History of incomplete or completed records.
*/
router.post('/api/history', (req,res, next) => {
  Promise.resolve().then(async () => {
    const loginStatus = await getProctorLogin(req.body.login, undefined, req.clientIp);
    if (loginStatus.recaptchaError === true) {res.send({recaptchaError: true, results: true}); return;}
    if (loginStatus.invalid === true) {res.send({prohibited: true}); return;}
    res.send({...await getHistory(loginStatus.proctor_id, req.body.patient_site_assigned, req.body.incomplete, req.body.offset), results: true});
  }).catch(next);
});

/**
 * Decrypt a QR code.
 */
router.post('/api/decrypt', (req,res, next) => {
  Promise.resolve().then(async () => {
    const loginStatus = await getProctorLogin(req.body.login, false, req.clientIp);
    let result = {};
    if (loginStatus.invalid === true) {
      result.invalid_login = true;
    } else {
      result.decrypted_string = cryptr.decrypt(req.body.encrypted_string);
    }
    result.results = true;
    res.send(result);
  }).catch(next);
});

/**
 * Find a test by kit_id.
 * 
 * Returns the entire test record to the client.
 */
router.post('/api/login_scan', (req,res, next) => {
  Promise.resolve().then(async () => {

    const loginStatus = await getProctorLogin(req.body.login, undefined, req.clientIp);
    if (loginStatus.recaptchaError === true) {res.send({recaptchaError: true, options: false}); return;}
    if (loginStatus.invalid === true) {res.send({prohibited: true, options: {}}); return;}
    let options = await getOptions([
      'patient_sex',
      'patient_race',
      'patient_ethnicity',
      'patient_county',
      'patient_state',
      'patient_previous_test',
      'patient_positive',
      'site_type'
    ]);
    const record = await getKitRecord(req.body.kit_id);

    if (record.invalid === true || record.error === true || record.expired === true) {
      res.send({...record, options: options, results: true});
    } else {
      let form = record;
      let response = {};
      if (record.missing === true) {
        form = { kit_id: record.kit_id, created: true }
      }
      response.form = form;
      response.options = options;
      response.results = true;
      res.send(response);
    }
  }).catch(next);
});

/**
 * Submit test data.
 * 
 * Verifies the submitted form and then saves to database.
 */
router.post('/api/submit', (req,res, next) => {
  Promise.resolve().then(async () => {
    const loginStatus = await getProctorLogin(req.body.login, undefined, req.clientIp);
    if (loginStatus.recaptchaError === true) {res.send({recaptchaError: true, results: true}); return;}
    if (loginStatus.invalid === true) {res.send({prohibited: true, results: true}); return;}
    const record = await getKitRecord(req.body.form.kit_id);
    if (record.invalid === true || record.expired === true) {res.send({...record, results: true}); return;}
    if (record.missing === true) {
      await createRecord( record.kit_id, req.body.login.patient_site_assigned, loginStatus.proctor_id);
    }

    res.send(await saveForm(req.body.form, record));

  }).catch(next);
});

/**
 * Server ping.
 * 
 * Returns "alive" in the body.
 */
router.get('/api/ping', (req, res) => {
  res.send('alive');
});

const deleteTestKit = (res, next) => {
  Promise.resolve().then(async () => {
    const pool = await sql.connect(config.sql);
    pool.request()
      .input('kit_id', sql.VarChar(255), '01008118770112931721020810124073|21CK3te6N5pFVcxKXxz4vA')
      .query('delete from mod_cvd_list where kit_id = @kit_id')
      .catch(err => {
        res.send('fail');
      });
    res.send('ok');
  }).catch(next);
}

/**
 * Browser test prep.
 * 
 * Prepares the server/database for browser testing.
 */
router.get('/api/test/pre', (req, res, next) => {
  deleteTestKit(res, next);
});

/**
 * Browser test clean-up.
 * 
 * Cleans up the server/database after browser testing.
 */
router.get('/api/test/post', (req, res, next) => {
  deleteTestKit(res, next);
});

/**
 * Get client config.
 * 
 * Returns site-specific data to client.
 */
app.get('/api/config.json', (req, res, next) => {
  Promise.resolve().then(async () => {
    const clientConfig = config.getClientConfig(req);
    clientConfig.timezone = await getTimezone();
    clientConfig.serverTime = await sqlDateNow();
    const formOverrides = await retrieve.formOverrides();
    if (formOverrides) {
      if (formOverrides.selectOptions) delete formOverrides.selectOptions;
      clientConfig.formOverrides = formOverrides;
    }
    res.send(clientConfig);
  }).catch(next);
});

/**
 * Get logo.
 * 
 * Returns site-specific logo.
 */
app.get('/api/logo.png', (req, res, next) => {
  Promise.resolve().then(async () => {
    res.sendFile(await retrieve.logoPath());
  }).catch(next);
});

/**
 * Get EULA.
 * 
 * Returns site-specific EULA text.
 */
app.get('/api/eula', (req, res, next) => {
  Promise.resolve().then(async () => {
    const eula = await retrieve.eula();
    res.send({eula});
  }).catch(next);
});

/* --- BEGIN MAINTENANCE APIS --- */

/* ---- BEGIN SITE MAINTENANCE APIS --- */
const site_select = "SELECT mod_cvd_sites.id, reason AS site_name, street, city, state, zip, county, clia, contact_name, contact_phone, contact_email, district, latitude, longitude, mod_cvd_sites.archive, mod_cvd_site_type.site_type FROM mod_cvd_sites, mod_cvd_site_type WHERE mod_cvd_sites.site_type = mod_cvd_site_type.site_type_id";
/**
 * List sites.
 * 
 * @group Site maintenance
 * @queryParam {string} filter Filter by keyword in site_name. Example: STR%C
 * Returns a list of testing sites.
 */
app.get('/api/maintenance/v1/sites', (req, res, next) => {
  Promise.resolve().then(async () => {
    const pool = await sql.connect(config.sql);
    var filter = req.query.filter ? '%' + req.query.filter + '%' : '%';
    pool.request()
      .input('filter', sql.VarChar(255), filter)
      .query(site_select + ' AND reason LIKE @filter')
      .then(results => {
        res.status(200).json(results.recordset);
      })
      .catch(err => res.status(500).send("error"));
  }).catch(next);
});


/**
 * Look up a single county in the sys_county table. Return county_id.
 * 
 * FIXME: This could be merged into the client side API that serves county lists and utilize its caching features.
 * 
 * @param {string} county
 * @param {string} state
 */
async function getCountyId(county, state) {
  const pool = await sql.connect(config.sql);
  try {
    const request = pool.request()
                                  .input('county', sql.VarChar(255), county)
                                  .input('state', sql.VarChar(255), state);
    result = await request.query('SELECT county_id FROM sys_county WHERE county = @county AND state = @state');
  } catch (err) {
    return Promise.resolve({error: err});
  }

  const rows = result.recordset;
  if (rows.length == 0) {
    return Promise.resolve({error: 'County is invalid. Check spelling of county and state.'});
  } else if (rows.length > 1) {
    return Promise.resolve({error: 'Too many results for (county, state) couplet.'});
  }

  return Promise.resolve({county: county, state: state, county_id: rows[0]['county_id']});
}


/**
 * Check request body for blank required fields.
 * 
 * @param {array} fields Array of body inputs to check.
 * @param {obj} req
 */
function checkBlankInputs(fields, req) {
  var errs = {};
  var failure = false;

  fields.forEach(field => {
    if (typeof req.body[field] == 'undefined' || req.body[field] === null || !/.+/.test(req.body[field])) {
      errs[field] = field + " is blank.";
      failure = true;
    }
  });

  return [errs, failure];
}

/**
 * Add site.
 * 
 * @group Site maintenance
 * @bodyParam {string} site_name required Name of the test site. Example: STRAC
 * @bodyParam {string} street required Street address of test site. Example: 7500 US-90 #1
 * @bodyParam {string} city required City of the test site. Example: San Antonio
 * @bodyParam {string} state required State of the test site. Example: TX
 * @bodyParam {integer} zip required ZIP of the test site. Example: 78227
 * @bodyParam {string} county required County of the test site. Example: Bexar
 * @bodyParam {string} clia required CLIA number that the test site is operating under. Example: 45D2193699
 * @bodyParam {string} site_type required The type of site. Currently available: School, Government, Hospital. Example: School
 * @bodyParam {string} contact_name Contact name for the test site manager. Example: Fake Person
 * @bodyParam {string} contact_phone Contact phone number for the test site manager. Example: 999-999-9999
 * @bodyParam {string} contact_email Contact email address for the test site manager. Example: fake.person@strac.org
 * @bodyParam {string} district Administrative district that the test site belongs to. Example: Texas Division of Emergency Management
 * @bodyParam {string} latitude Latitude of the test site. Example: 29.400960
 * @bodyParam {string} longitude Longitude of the test site. Example: -98.638720
 * @response {
 *   "id": 1
 * }
 * Add a site.
 */
app.post('/api/maintenance/v1/site', (req, res, next) => {
//TODO: Figure out county_id and site_type.
  Promise.resolve().then(async () => {
    const pool = await sql.connect(config.sql);

    var [errs, failure] = checkBlankInputs([
                                            'site_name',
                                            'street',
                                            'city',
                                            'state',
                                            'zip',
                                            'county',
                                            'clia',
                                            'site_type'
                                          ], req);

    // Get county_id.
    var county_info = await getCountyId(req.body.county, req.body.state);
    if (county_info.error) {
      errs['county_id'] = county_info.error;
      failure = true;
    }

    var options = await getOptions(['site_type']);
    var site_type = options['site_type'].find(site => site.label.toLowerCase() == req.body.site_type.toLowerCase());

    if (!site_type) {
      errs['site_type'] = 'No such site type.'
      failure = true;
    }

    if (failure) {
      res.status(400).json({errors: errs});
    } else {
      pool.request()
        .input('site_name', sql.VarChar(255), req.body.site_name)
        .input('street', sql.VarChar(255), req.body.street)
        .input('city', sql.VarChar(255), req.body.city)
        .input('state', sql.VarChar(255), req.body.state)
        .input('zip', sql.Int, req.body.zip)
        .input('county', sql.VarChar(255), req.body.county)
        .input('county_id', sql.Int, county_info.county_id)
        .input('clia', sql.VarChar(255), req.body.clia)
        .input('contact_name', sql.VarChar(255), req.body.contact_name)
        .input('contact_phone', sql.VarChar(255), req.body.contact_phone)
        .input('contact_email', sql.VarChar(255), req.body.contact_email)
        .input('district', sql.VarChar(255), req.body.district)
        .input('latitude', sql.Float, req.body.latitude)
        .input('longitude', sql.Float, req.body.longitude)
        .input('site_type_id', sql.Int, site_type.value)
        .query(['INSERT INTO mod_cvd_sites',
              '(reason, street, city, state, zip, county, clia, contact_name, contact_phone, contact_email, district, latitude, longitude, site_type, county_id)',
              'values',
              '(@site_name, @street, @city, @state, @zip, @county, @clia, @contact_name, @contact_phone, @contact_email, @district, @latitude, @longitude, @site_type_id, @county_id)',
              'SELECT SCOPE_IDENTITY() as id'].join(' '))
        .then(results => {
          res.status(200).json(results.recordset[0]);
        })
        .catch(err => res.status(500).send({errors: err}));
    }
  }).catch(next);
});


/**
 * Get a site record.
 * 
 * @group Site maintenance
 * @urlParam {integer} id required ID for the test site. Example: 1
 * Returns a site record.
 */
app.get('/api/maintenance/v1/site/:id', (req, res, next) => {
  Promise.resolve().then(async () => {
    const pool = await sql.connect(config.sql);
    pool.request()
      .input('id', sql.Int, req.params.id)
      .query(site_select + ' AND mod_cvd_sites.id = @id')
      .then(results => {
        res.status(200).json(results.recordset);
      })
      .catch(err => res.status(500).send("error"));
  }).catch(next);
});

/**
 * Update site.
 * 
 * @group Site maintenance
 * @urlParam {integer} id required ID for the test site. Example: 1
 * @bodyParam {string} site_name Name of the test site. Example: STRAC
 * @bodyParam {string} street Street address of test site. Example: 7500 US-90 #1
 * @bodyParam {string} city City of the test site. Example: San Antonio
 * @bodyParam {string} state State of the test site. Example: TX
 * @bodyParam {integer} zip ZIP of the test site. Example: 78227
 * @bodyParam {string} county County of the test site. Example: Bexar
 * @bodyParam {string} clia CLIA number that the test site is operating under. Example: 45D2193699
 * @bodyParam {string} site_type The type of site. Currently available: School, Government, Hospital. Example: School
 * @bodyParam {string} contact_name Contact name for the test site manager. Example: Fake Person
 * @bodyParam {string} contact_phone Contact phone number for the test site manager. Example: 999-999-9999
 * @bodyParam {string} contact_email Contact email address for the test site manager. Example: fake.person@strac.org
 * @bodyParam {string} district Administrative district that the test site belongs to. Example: Texas Division of Emergency Management
 * @bodyParam {number} latitude Latitude of the test site. Example: 29.400960
 * @bodyParam {number} longitude Longitude of the test site. Example: -98.638720
 * @bodyParam {boolean} archive Archive status of test site (archive=true sites do not display to users). Example: false
 * Update a site by id.
 */
app.patch('/api/maintenance/v1/site/:id', (req, res, next) => {
  Promise.resolve().then(async () => {
    const pool = await sql.connect(config.sql);

    var errs = {};
    var failure = false;

    // Validate input.
    // Only required field is `id`.
    if (typeof req.params['id'] == 'undefined' || req.params['id']=== null || !/.+/.test(req.params['id'])) {
        errs['id'] = "id is blank.";
        failure = true;
      }

    var county_id = null;
    if ((typeof req.body['county'] != 'undefined') || (typeof req.body['state'] != 'undefined')) {
      var [countyErr, countyFail] = checkBlankInputs(['county', 'state'], req);
      if (countyFail) {
        errs['county'] = "Both county and state are required when updating either.";
        failure = true;
      }
      // Get county_id.
      county_info = await getCountyId(req.body.county, req.body.state);
      if (county_info.error) {
        errs['county_id'] = county_info.error;
        failure = true;
      } else {
        county_id = county_info.county_id;
      }
    }

    var site_type_id = null;
    if (typeof req.body['site_type'] != 'undefined') {
      var options = await getOptions(['site_type']);
      var site_type = options['site_type'].find(site => site.label.toLowerCase() == req.body.site_type.toLowerCase());

      if (!site_type) {
        errs['site_type'] = 'No such site type.'
        failure = true;
      } else {
        site_type_id = site_type.value;
      }
    }

    if (failure) {
      res.status(400).json({errors: errs});
    } else {
      var updates = {
        reason: {val: req.body.site_name, type: sql.VarChar(255)},
        street: {val: req.body.street, type: sql.VarChar(255)},
        city: {val: req.body.city, type: sql.VarChar(255)},
        state: {val: req.body.state, type: sql.VarChar(255)},
        zip: {val: req.body.zip, type: sql.Int},
        county: {val: req.body.county, type: sql.VarChar(255)},
        county_id: {val: county_id, type: sql.Int},
        clia: {val: req.body.clia, type: sql.VarChar(255)},
        contact_name: {val: req.body.contact_name, type: sql.VarChar(255)},
        contact_phone: {val: req.body.contact_phone, type: sql.VarChar(255)},
        contact_email: {val: req.body.contact_email, type: sql.VarChar(255)},
        district: {val: req.body.district, type: sql.VarChar(255)},
        latitude: {val: req.body.latitude, type: sql.Float},
        longitude: {val: req.body.longitude, type: sql.Float},
        site_type: {val: site_type_id, type: sql.Int},
        archive: {val: req.body.archive, type: sql.Int}
      };

      // Construct the query.
      var updateReq = pool.request();
      var toUpdate = [];
      Object.keys(updates).forEach(key => {
        if (updates[key].val !== null && typeof updates[key].val !== 'undefined') {
          toUpdate.push(key + "=@" + key);
          updateReq.input(key, updates[key].type, updates[key].val);
        }
      });

      updateReq.input('id', sql.Int, req.params.id);
      if (toUpdate.length == 0) {
        // Nothing to update. Return the original record.
        updateReq.query(site_select + " AND id = @id")
        .then(results => {
         res.status(200).json(results.recordset[0]);
        })
        .catch(err => res.status(500).json({errors: err}));
      } else {
        var toUpdateSql = toUpdate.join(',');


        updateReq.query("UPDATE mod_cvd_sites SET " + toUpdateSql + " WHERE id = @id " + site_select + " AND id = @id")
                 .then(results => {
                  res.status(200).json(results.recordset[0]);
                 })
                 .catch(err => res.status(500).json({errors: err}));
      }
    }
  }).catch(next);
});

/* ---- END SITE MAINTENANCE APIS --- */
/* ---- BEGIN PROCTOR MAINTENANCE APIS --- */

const proctor_select = "SELECT id, first_name, last_name, email_address, phone_number_office, last_login_ip, welcome_email_sent, archive FROM proctor";
/**
 * List proctors.
 * 
 * @group Proctor maintenance
 * @queryParam {string} filter Filter by keyword in email_address. Example: @strac.org
 * Returns a list of proctor accounts.
 */
app.get('/api/maintenance/v1/proctors', (req, res, next) => {
  Promise.resolve().then(async () => {
    const pool = await sql.connect(config.sql);
    var filter = req.query.filter ? '%' + req.query.filter + '%' : '%';
    pool.request()
      .input('filter', sql.VarChar(255), filter)
      .query(proctor_select + ' WHERE email_address LIKE @filter')
      .then(results => {
        res.status(200).json(results.recordset);
      })
      .catch(err => res.status(500).send("error"));
  }).catch(next);
});

/**
 * Add proctor.
 * 
 * @group Proctor maintenance
 * @bodyParam {string} first_name required First name of the test proctor. Example: Fake
 * @bodyParam {string} last_name required Last name of the test proctor. Example: Person
 * @bodyParam {string} email_address required Email address of the test proctor. Example: fake.person@strac.org
 * @bodyParam {string} phone_number_office Office phone number of the test proctor: Example: 999-999-9999
 * @response {
 *   "id": 1
 * }
 * Add a proctor.
 */
app.post('/api/maintenance/v1/proctor', (req, res, next) => {
  Promise.resolve().then(async () => {
    const pool = await sql.connect(config.sql);

    // Validate input.
    var [errs, failure] = checkBlankInputs([
                                            'first_name',
                                            'last_name',
                                            'email_address'
                                          ], req);

    if (failure) {
      res.status(400).json({errors: errs});
    } else {
      pool.request()
        .input('first_name', sql.VarChar(255), req.body.first_name)
        .input('last_name', sql.VarChar(255), req.body.last_name)
        .input('email_address', sql.VarChar(255), req.body.email_address)
        .input('phone_number_office', sql.VarChar(255), req.body.phone_number_office)
        .query(['INSERT INTO proctor',
              '(first_name, last_name, email_address, phone_number_office)',
              'values',
              '(@first_name, @last_name, @email_address, @phone_number_office)',
              'SELECT SCOPE_IDENTITY() as id'].join(' '))
        .then(results => {
          res.status(200).json(results.recordset[0]);
        })
        .catch(err => res.status(500).send({errors: err}));
    }
  }).catch(next);
});

/**
 * Get a proctor record.
 * 
 * @group Proctor maintenance
 * @urlParam {integer} id required ID for the test proctor. Example: 1
 * Returns a proctor account record.
 */
app.get('/api/maintenance/v1/proctor/:id', (req, res, next) => {
  Promise.resolve().then(async () => {
    const pool = await sql.connect(config.sql);
    pool.request()
      .input('id', sql.Int, req.params.id)
      .query(proctor_select + ' WHERE id = @id')
      .then(results => {
        res.status(200).json(results.recordset);
      })
      .catch(err => res.status(500).send("error"));
  }).catch(next);
});

/**
 * Update proctor account.
 * 
 * @group Proctor maintenance
 * @urlParam {integer} id required ID for the test proctor. Example: 1
 * @bodyParam {string} first_name First name of the test proctor. Example: Fake
 * @bodyParam {string} last_name Last name of the test proctor. Example: Person
 * @bodyParam {string} phone_number_office Office phone number of the test proctor: Example: 999-999-9999
 * @bodyParam {string} password Set the user's password.
 * @bodyParam {boolean} archive Archive status of test proctor (archive=true users cannot log in). Example: false
 * @bodyParam {boolean} resend_email Set to "true" to re-send the proctor welcome email. Example: true
 * Update a proctor account by id.
 */
app.patch('/api/maintenance/v1/proctor/:id', (req, res, next) => {
  Promise.resolve().then(async () => {
    const pool = await sql.connect(config.sql);

    var errs = {};
    var failure = false;

    // Validate input.
    // Only required field is `id`.
    if (typeof req.params['id'] == 'undefined' || req.params['id']=== null || !/.+/.test(req.params['id'])) {
        errs['id'] = "id is blank.";
        failure = true;
    }

    if (failure) {
      res.status(400).json({errors: errs});
    } else {
      var updates = {
        first_name: {val: req.body.first_name, type: sql.VarChar(255)},
        last_name: {val: req.body.last_name, type: sql.VarChar(255)},
        phone_number_office: {val: req.body.phone_number_office, type: sql.VarChar(255)},
        archive: {val: req.body.archive, type: sql.Int}
      };

      // Construct the query.
      var updateReq = pool.request();
      var toUpdate = [];
      Object.keys(updates).forEach(key => {
        if (updates[key].val !== null && typeof updates[key].val !== 'undefined') {
          toUpdate.push(key + "=@" + key);
          updateReq.input(key, updates[key].type, updates[key].val);
        }
      });

      if (req.body.resend_email === true) {
        updateReq.input('welcome_email_sent', sql.DateTime, null);
        toUpdate.push('welcome_email_sent=@welcome_email_sent');
      }

      var passwordSet = null;
      // Attempt to update password stored in Firebase, if needed.
      if ((typeof req.body.password !== 'undefined') && (req.body.password.length > 0)) {
        passwordSet = await setPassword(req.params.id, req.body.password);
      }

      // Update disabled status in Firebase if "archive" was modified.
      if (typeof req.body.archive !== 'undefined') {
        await setAccountDisabledStatus(req.params.id, req.body.archive);
      }

      updateReq.input('id', sql.Int, req.params.id);
      if (toUpdate.length == 0) {
        // Nothing to update. Return the original record.
        updateReq.query(proctor_select + " WHERE id = @id")
                 .then(results => {
                    var ret = results.recordset[0];
                    if (passwordSet !== null) ret.passwordSet = passwordSet;
                    res.status(200).json(ret);
                  })
                 .catch(err => {
                    res.status(500).json({errors: err});
                    return;
                  });
      } else {
        var toUpdateSql = toUpdate.join(',');
        updateReq.query("UPDATE proctor SET " + toUpdateSql + " WHERE id = @id " + proctor_select + " WHERE id = @id")
                 .then(results => {
                  var ret = results.recordset[0];
                  if (passwordSet !== null) ret.passwordSet = passwordSet;
                  res.status(200).json(ret);
                })
                 .catch(err => {
                   res.status(500).json({errors: err});
                   return;
                  });
      }
    }
  }).catch(next);
});

/* ---- END PROCTOR MAINTENANCE APIS --- */
/* --- END MAINTENANCE APIS --- */

let options = {
  key: fs.readFileSync('./ssl/key.pem'),
  cert: fs.readFileSync('./ssl/cert.pem'),
  passphrase: 'YOURPASSPHRASE',
  rejectUnauthorized: false
};

if (config.isNotLocalDev()) {
  app.use(middleware.errorHandler);
}

app.use(express.static('dist'));
app.use('/public', express.static('public'));
router.use(function (req, res) {
  if (req.path.includes('bundle.js')) {
    res.sendFile(path.resolve('dist', 'bundle.js'));
  } else {
    res.sendFile(path.resolve('dist', 'index.html'));
  }
});
app.use(router);

https.createServer(options, app).listen(process.env.PORT || "8080", () => console.log(`Listening on port ${process.env.PORT || 8080}!`));

module.exports = app;
