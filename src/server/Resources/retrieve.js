// Resources folder must be specified and it must contain an image logo-400.png
const fs = require("fs");
const {resourcesDir} = require('../config');
const path = `${process.cwd()}/src/server/Resources/${resourcesDir}`;

function logoPath () {
  return new Promise(res => {
    fs.readFile(`${path}/logo-400.png`, (err) => {
      if (err) {
        console.error(err);
        res(null);
      } else res(`${path}/logo-400.png`);
    });
  });
}
function formOverrides () {
  return new Promise(res => {
    fs.readFile(`${path}/form-overrides.json`, (err, data) => {
      if (err) {
        res(null);
      } else res(JSON.parse(data.toString()));
    });
  });
}
function eula () {
  return new Promise(res => {
    fs.readFile(`${path}/eula.txt`, (err, data) => {
      if (err) {
        res(null);
      } else res(data.toString().replace(/\\\n/g, ''));
    });
  });
}

module.exports = {
  logoPath,
  formOverrides,
  eula
};
