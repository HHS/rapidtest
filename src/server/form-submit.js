const date = require('date-and-time');
const sql = require('mssql');
const retrieve = require("./Resources/retrieve");
const gs1js = require('gs1js');
const config = require("./config");
const {verifyKitId} = require("./kit-verify");

const {
  sqlDateNow
} = require('./sql.js');
const {
  getOptions
} = require('./select-options.js');

const tableName = 'mod_cvd_list';
// these fields cannot be saved by the client, but the client still needs to read
const readOnly = ['patient_appt_datetime', 'kit_access_expired', 'patient_site_assigned'];
// all fields that are controlled by ctrl_first
const ctrlFirstFields = [ 'patient_previous_test', 'patient_previous_test_datetime' ];
const ctrlSympSwitches = [
  'qual_temperature', 'qual_fever', 'qual_chills', 'qual_cough', 'qual_short_breath', 'qual_diff_breath',
  'qual_fatigue', 'qual_body_ache', 'qual_headache', 'qual_loss_taste', 'qual_loss_smell', 'qual_sore_throat',
  'qual_nasal_congestion', 'qual_nose', 'qual_nausea', 'qual_vomit', 'qual_diarrhea'
];

// all fields that are controlled by ctrl_symp
const ctrlSympFields = ['patient_symptom_onset'].concat(ctrlSympSwitches);
//
const ctrlFields = ctrlFirstFields.concat(ctrlSympFields);
// other switch fields that dont fit in with the ctrl fields
const clientSwitches = ['ctrl_first', 'ctrl_symp', 'patient_hcw', 'patient_pregnant'];
// all fields in the form
const clientFields = [
  'kit_id', 'patient_last_name', 'patient_first_name', 'patient_email', 'patient_callback_number', 'patient_dl',
  'patient_dob', 'patient_age', 'patient_sex', 'patient_race', 'patient_ethnicity', 'patient_address',
  'patient_address2', 'patient_city', 'patient_state', 'patient_zip', 'patient_county', 'patient_lat', 'patient_lng',
  'patient_google_place_id', 'patient_dl_race', 'patient_dl_ethnicity', 'patient_positive', 'patient_results',
  'app_version', 'patient_test_started', 'dl_scan_state'
].concat(ctrlFields.concat(clientSwitches));
// cache of all switch fields
const allSwitches = ctrlSympSwitches.concat(clientSwitches);

async function fieldIsHidden(prop, formName) {
  const formOverrides = await retrieve.formOverrides();
  if (!formOverrides || !formOverrides[formName]) return false;
  return formOverrides[formName][prop] && formOverrides[formName][prop].display == false;
}

/* form validation
* a field returning true will prevent results from being saved.
* the user will get feedback from the client
* */
async function getFormError (form) {
  const now = await sqlDateNow();
  let errors = {};
  // things to verify (at the end)
  let options = [ 'patient_race', 'patient_ethnicity', 'patient_positive', 'patient_sex' ];
  let switches = ['ctrl_first', 'ctrl_symp', 'patient_hcw' ];
  let dates = [ 'patient_dob' ];
  const regex = {
    patient_email: /^[a-zA-Z0-9._%+-]+[@][a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    patient_callback_number: /^[0-9]{3}-[0-9]{3}-[0-9]{4}$/, // 10 digit number only
    patient_dl: /^[a-zA-Z0-9- ]*$/,
    patient_dob: /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/, // MM-DD-YYYY,
    patient_state: /^[A-Z]{2}$/, // 2 letter state only
    patient_zip: /^[0-9]{5}$/, // 5 digit zip only
  };

  // all dates currrently dont have time and must happen in the past
  function isPastDate (d) {
    const isValid = d && date.isValid(d, 'YYYY-MM-DD');
    if (!isValid) return false;
    const isPast = date.subtract(date.parse(d, 'YYYY-MM-DD'), now).toDays() < 0
    const isAfter1900 = date.subtract(date.parse("1899-12-31", 'YYYY-MM-DD'), date.parse(d, 'YYYY-MM-DD')).toDays() < 0;
    return isValid && isPast && isAfter1900;
  }

  function isYesOrNo (s) {
    s = parseInt(s);
    return s === 1 || s === 0;
  }

  // required fields, just needs something in there
  [
    'kit_id',
    'patient_last_name',
    'patient_first_name',
    'patient_address',
    'patient_city',
    'patient_county',
    'patient_race',
    'patient_ethnicity'
  ].forEach(prop => {
    if (typeof form[prop] == 'undefined' || form[prop] === null || !/.+/.test(form[prop])) {
      errors[prop] = true;
    }
  });

  // conditional fields
  if (form['ctrl_first'] === 0) {
    regex.patient_previous_test_datetime = /^[0-9]{4}-[0-9]{2}$/; // MM-DD-YYYY,
    dates.push('patient_previous_test_datetime');
    options.push('patient_previous_test');
  }

  if (form['ctrl_symp'] === 1) {
    regex.patient_symptom_onset = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/; // MM-DD-YYYY,
    dates.push('patient_symptom_onset');
    switches.push(...ctrlSympSwitches);
  }

  if ((form['patient_sex'] !== 'male') && !(await fieldIsHidden('patient_pregnant', 'covid_test'))) {
    switches.push('patient_pregnant');
  }

  //regex specified, checks if form value matches expression
  Object.entries(regex).forEach(([k, v]) => {
    const value = v || '';
    if (typeof form[k] == 'undefined' || !value.test(form[k])) {
      errors[k] = true;
    }
  });

  // fields that need to match a foreign table column
  options = await getOptions(options);
  Object.entries(options).forEach(([k,v]) => {
    if (!v.map(x => x.value).find((x) => x === form[k])) errors[k] = true;
  });

  switches.forEach(prop => {
    if (!isYesOrNo(form[prop])) {
      errors[prop] = true;
    }
  });

  dates.forEach(prop => {
    if (!isPastDate(form[prop])) {
      errors[prop] = true;
    }
  });

  return errors;
}

async function createRecord(kit_id, patient_site_assigned, proctor_id) {
  const pool = await sql.connect(config.sql);
  const verifiedKit = await verifyKitId(kit_id);
  let kit_gtin = null,
    kit_expiration = null,
    kit_batch_number = null,
    kit_serial_number = null;
  if (verifiedKit.manufacturer === 'binax') {
    kit_gtin = verifiedKit.components.kit_gtin;
    kit_expiration = verifiedKit.components.kit_expiration;
    kit_batch_number = verifiedKit.components.kit_batch_number;
    kit_serial_number = verifiedKit.components.kit_serial_number;
  } else if (verifiedKit.manufacturer === 'cue') {
    kit_batch_number = verifiedKit.components.device;
    kit_serial_number = verifiedKit.components.cart;
  }

  return pool.request()
    .input('kit_id', sql.VarChar(255), kit_id)
    .input('patient_site_assigned', sql.Int, patient_site_assigned)
    .input('closed_reason', sql.Int, 10)
    .input('proctor_id', sql.Int, proctor_id)
    .input('kit_gtin', sql.VarChar(255), kit_gtin)
    .input('kit_expiration', sql.Date, kit_expiration)
    .input('kit_batch_number', sql.VarChar(255), kit_batch_number)
    .input('kit_serial_number', sql.VarChar(255), kit_serial_number)
    .input('kit_manufacturer', sql.VarChar(255), verifiedKit.manufacturer)
    .query([
      'insert into',
      tableName,
      '(kit_id, patient_appt_datetime, closed_reason, patient_site_assigned, proctor_id, kit_gtin, kit_expiration, kit_batch_number, kit_serial_number, kit_manufacturer)',
      'values',
      '(@kit_id, GETDATE(), @closed_reason, @patient_site_assigned, @proctor_id, @kit_gtin, @kit_expiration, @kit_batch_number, @kit_serial_number, @kit_manufacturer)'].join(' '));
}

async function saveForm(form, oldRecord) {
  const pool = await sql.connect(config.sql);
  const now = await sqlDateNow();
  let response = {};
  let payload = {};

  clientFields.forEach(k => {
    payload[k] = typeof form[k] === 'string' ? form[k].trim() : form[k];
  });

  response['formError'] = await getFormError(form);

  const formOverrides = await retrieve.formOverrides();
  if (formOverrides && formOverrides['covid_test']) {
    Object.keys(formOverrides['covid_test']).forEach((field) => {
      const override = formOverrides['covid_test'][field];
      const dontDisplayField = override && override.display === false;
      if (dontDisplayField) {
        delete response['formError'][field];
        delete payload[field];
      }
    });
  }

  // errors is empty if all fields are valid
  if (Object.keys(response['formError']).length === 0) {
    payload['patient_positive'] = form.patient_positive;
    payload['patient_results'] = now;
    if (!oldRecord.kit_access_expired) {
      // only lock the results if its been a few minutes after submission
      // the time until lockout is determined by the patient_site_assigned's site_type in mod_cvd_site_type
      let lockout = 60; //in minutes

      // try to change lockout time, remains default 60 if cannot find one for this site type
      const options = await getOptions(['patient_site_assigned', 'site_type']);
      const patient_site_assigned = options['patient_site_assigned'].find(site => site.value === oldRecord['patient_site_assigned']);
      if (patient_site_assigned) {
        const site_type = options['site_type'].find(type => type.value === patient_site_assigned['site_type']);
        if (site_type) lockout = site_type['lock_time'] || lockout;
      }
      // lockout in minutes * 60 seconds/min * 1000 ms/sec = lockout in ms
      payload['kit_access_expired'] = new Date(+now + lockout * 60000);
    }
  } else {
    payload['patient_positive'] = oldRecord.patient_positive;
    payload['patient_results'] = oldRecord.patient_results;
    payload['kit_access_expired'] = oldRecord.kit_access_expired;
    if (oldRecord.patient_results) {
      // Do not save any part of record if in grace period and there are errors
      response['results'] = true;
      response['gracePeriod'] = true;
      return Promise.resolve(response);
    }
  }

  function switchToNum (s) {
    return s === -1 ? null : s ? 1 : 0;
  }

  // UI sets N/A as -1 instead of NULL, we can convert it here
  allSwitches.forEach(k => {
    payload[k] = switchToNum(payload[k]);
  });

  const ctrl_first = switchToNum(form['ctrl_first']);
  if (ctrl_first !== 0) {
    ctrlFirstFields.forEach(field => payload[field] = null);
  }
  const ctrl_symp = switchToNum(form['ctrl_symp']);
  if (ctrl_symp !== 1) {
    ctrlSympFields.forEach(field => payload[field] = null);
  }

  //don't change dates if invalid
  ['patient_dob', 'patient_previous_test_datetime', 'patient_symptom_onset'].forEach(field => {
    if (response['formError'][field]) payload[field] = oldRecord[field];
  });

  return new Promise(res => {
    //console.log(payload);

    let update = pool.request()
      .input('kit_id', sql.VarChar(255), payload['kit_id'])
      .input('patient_dl', sql.VarChar(255), payload['patient_dl'])
      .input('patient_first_name', sql.VarChar(255), payload['patient_first_name'])
      .input('patient_last_name', sql.VarChar(255), payload['patient_last_name'])
      .input('patient_dob', sql.Date, payload['patient_dob'])
      .input('patient_age', sql.Int, payload['patient_age'])
      .input('patient_sex', sql.VarChar(255), payload['patient_sex'])
      .input('patient_race', sql.VarChar(255), payload['patient_race'])
      .input('patient_ethnicity', sql.VarChar(255), payload['patient_ethnicity'])
      .input('patient_dl_race', sql.VarChar(255), payload['patient_dl_race'])
      .input('patient_dl_ethnicity', sql.VarChar(255), payload['patient_dl_ethnicity'])
      .input('patient_email', sql.VarChar(255), payload['patient_email'])
      .input('patient_callback_number', sql.VarChar(255), payload['patient_callback_number'])
      .input('patient_address', sql.VarChar(255), payload['patient_address'])
      .input('patient_address2', sql.VarChar(255), payload['patient_address2'])
      .input('patient_city', sql.VarChar(255), payload['patient_city'])
      .input('patient_state', sql.VarChar(255), payload['patient_state'])
      .input('patient_zip', sql.VarChar(255), payload['patient_zip'])
      .input('patient_county', sql.VarChar(255), payload['patient_county'])
      .input('patient_lat', sql.Decimal(12,8), payload['patient_lat'])
      .input('patient_lng', sql.Decimal(12,8), payload['patient_lng'])
      .input('patient_google_place_id', sql.VarChar(255), payload['patient_google_place_id'])
      .input('patient_positive', sql.VarChar(255), payload['patient_positive'])
      .input('patient_results', sql.DateTime, payload[ 'patient_results' ])
      .input('kit_access_expired', sql.DateTime, payload[ 'kit_access_expired' ])
      .input('patient_previous_test', sql.Int, payload[ 'patient_previous_test' ])
      .input('patient_previous_test_datetime', sql.DateTime, payload[ 'patient_previous_test_datetime' ])
      .input('patient_hcw', sql.Int, payload[ 'patient_hcw' ])
      .input('patient_symptom_onset', sql.DateTime, payload[ 'patient_symptom_onset' ])
      .input('qual_temperature', sql.Int, payload[ 'qual_temperature' ])
      .input('qual_fever', sql.Int, payload[ 'qual_fever' ])
      .input('qual_chills', sql.Int, payload[ 'qual_chills'])
      .input('qual_cough', sql.Int, payload[ 'qual_cough' ])
      .input('qual_short_breath', sql.Int, payload[ 'qual_short_breath'])
      .input('qual_diff_breath', sql.Int, payload[ 'qual_diff_breath' ])
      .input('qual_fatigue', sql.Int, payload[ 'qual_fatigue' ])
      .input('qual_body_ache', sql.Int, payload[ 'qual_body_ache' ])
      .input('qual_headache', sql.Int, payload[ 'qual_headache'])
      .input('qual_loss_taste', sql.Int, payload[ 'qual_loss_taste'])
      .input('qual_loss_smell', sql.Int, payload[ 'qual_loss_smell' ])
      .input('qual_sore_throat', sql.Int, payload[ 'qual_sore_throat' ])
      .input('qual_nasal_congestion', sql.Int, payload[ 'qual_nasal_congestion'])
      .input('qual_nose', sql.Int, payload[ 'qual_nose' ])
      .input('qual_nausea', sql.Int, payload[ 'qual_nausea' ])
      .input('qual_vomit', sql.Int, payload[ 'qual_vomit' ])
      .input('qual_diarrhea', sql.Int, payload[ 'qual_diarrhea' ])
      .input('patient_pregnant', sql.Int, payload[ 'patient_pregnant' ])
      .input('app_version', sql.VarChar, payload['app_version'])
      .input('patient_test_started', sql.DateTimeOffset, payload['patient_test_started'])
      .input('dl_scan_state', sql.VarChar, payload['dl_scan_state'])
      .input('ctrl_first', sql.Int, ctrl_first)
      .input('ctrl_symp', sql.Int, ctrl_symp)
      .query([
        'update ',
        tableName,
        ' SET ',
        [Object.keys(payload).map(key => key + ' = @' + key)].join(', '),
        ' WHERE kit_id = @kit_id',
      ].join(''));

    update.then(() => {
      response['results'] = true;
      res(response);
    }).catch((err) => {
      console.log(err);
      response['sqlError'] = true;
      res(response);
    });
  });
}

module.exports = {
  config,
  tableName,
  readOnly,
  ctrlFirstFields,
  ctrlSympFields,
  clientFields,
  allSwitches,
  createRecord,
  saveForm
};