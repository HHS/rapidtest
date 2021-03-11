const sql = require('mssql');
const {
  config,
} = require('./sql.js');
const {
  tableName
} = require('./form-submit.js');

const requestedFields = [
  'kit_id', 'patient_first_name', 'patient_last_name', 'patient_appt_datetime',
  'patient_test_started', 'patient_results', 'kit_access_expired', 'patient_dob'
];

function buildQuery (withResults, withOffset, sameProctor, sameSite) {
  if (typeof withResults === 'undefined') withResults = false;
  if (typeof withOffset === 'undefined') withOffset = false;
  if (typeof sameSite === 'undefined') sameSite = true;
  if (typeof sameProctor === 'undefined') sameProctor = true;
  const joiner = ' ';

  const selectFrom = [
    'SELECT',
    requestedFields.join(', '),
    'FROM',
    tableName,
  ].join(joiner);

  let wheres = [];

  // today or within 4 hours
  wheres.push("(CAST( GETDATE() AS Date ) = CAST(patient_appt_datetime as date) OR DATEADD(hh, 4, patient_appt_datetime) > GETDATE() )");

  if (withResults) {
    wheres.push('patient_results IS NOT NULL');
  } else if (!withOffset) {
    // without offset/limiting, we will only get the records that are incomplete
    // otherwise we might load too many records at once if we load the archive of completed records
    wheres.push('patient_results IS NULL');
  }
  if (sameProctor) wheres.push('proctor_id = @proctor_id');
  if (sameSite) wheres.push('patient_site_assigned = @patient_site_assigned');

  let offset = '';
  if (withOffset) offset = 'ORDER BY patient_appt_datetime DESC OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY';

  let query = selectFrom;
  if (wheres.length > 0) query = [query, 'WHERE', wheres.join(' AND ')].join(joiner);

  if (offset) query = [query, offset].join(joiner);
  return query;
}

async function getHistory (proctorId, siteId, incomplete, offset) {
  if (typeof incomplete === 'undefined') {
    incomplete = true;
  }
  if (typeof offset === 'undefined') {
    offset = 0;
  }
  // we want to get ALL incomplete records at once.
  // Otherwise, if we are trying to get completed records,
  // use the offset to select a few at a time
  const query = buildQuery(!incomplete, !incomplete);
  const limit = 10;
  const pool = await sql.connect(config);
  return new Promise(res => pool.request()
    .input('proctor_id', sql.Int, proctorId)
    .input('patient_site_assigned', sql.Int, siteId)
    .input('offset', sql.Int, offset)
    .input('limit', sql.Int, limit)
    .query(query)
    .then(result => {
      const rows = result.recordset;
      let response = {};
      if (result.rowsAffected[0] > 0) {
        response.history = rows.map((row) => {
          const item = {};
          requestedFields.forEach(k => {
            item[k] = row[k];
          });
          return item;
        });
        res(response);
      } else {
        res({history: []});
      }
    })
    .catch(err => res({
      history: [],
      error: true,
      args: err
    })));
}

module.exports = {
  getHistory
};