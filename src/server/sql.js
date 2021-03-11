const sql = require('mssql');
const config = require("./config");

/* GetDate() from database
* Returns Date object */

async function sqlDateNow() {
  const pool = await sql.connect(config.sql);
  return new Promise(res => pool.request()
    .query("select GETDATE()")
    .then(results => {
      res(results.recordset[0]['']);
    }));
}

async function sqlTimezone() {
  const pool = await sql.connect(config.sql);
  return new Promise(res => pool.request()
    .query("select CURRENT_TIMEZONE()")
    .then(results => {
      res(results.recordset[0]['']);
    }));
}
async function getTimezone () {
  if (typeof this.timezone !== 'undefined') return Promise.resolve(this.timezone);
  this.timezone = await sqlTimezone();
  return Promise.resolve(this.timezone);
}

async function combineQueryAndArray(queriesObj, arraysObj, keys) {
  if (typeof keys === undefined) keys = Object.keys(queriesObj).concat(Object.keys(arraysObj));
  let sqlPromises = [];
  const pool = await sql.connect(config.sql);
  let response = {};
  keys.forEach(k => {
    let query = queriesObj[k];
    if (query) {
      sqlPromises.push({
        k: k,
        promise: pool.request().query(query).then(result => response[k] = result.recordset)
      });
    } else if (arraysObj[k]) {
      response[k] = arraysObj[k];
    }
  });
  await Promise.all(sqlPromises.map((obj) => {
    return obj.promise;
  })).catch(() => response.errorExists = true);
  return Promise.resolve(response);
}

async function getCountiesFromDB() {
  const pool = await sql.connect(config.sql);
  return new Promise(res => pool.request()
    .query("SELECT county AS value, county AS label, state FROM sys_county")
    .then(results => {
      res(results.recordset);
    }));
}

module.exports = {
  sqlDateNow,
  getTimezone,
  combineQueryAndArray,
  getCountiesFromDB
};