const { default: Bugsnag } = require('@bugsnag/js');
const yj = require('yieldable-json');

function getFromObj (name, obj, callback) {
  fetch(name.toString() + '?' + jsonToQuery(obj))
    .then(res => res.json())
    .then(result => callback(result))
    .catch(() => callback({'results': []}));
}

function getOnly (name, callback) {
  fetch(name.toString())
    .then(res => res.json())
    .then(result => callback(result))
    .catch(() => callback({'results': []}));
}

function bugsnagCallbackIntermediary(err, errorCallback) {
  Bugsnag.notify(err);
  errorCallback(err);
}

function postFromObj (name, obj, callback, errorCallback) {
  Promise.resolve().then(async () => {
    fetch(name.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(obj)
    })
      .then(res => res.json())
      .then(result => {
        callback(result);
      })
      .catch(error => bugsnagCallbackIntermediary(error, errorCallback));
  }).catch(err => bugsnagCallbackIntermediary(err, errorCallback));
}

function jsonToQuery(obj) {
  let output = [];
  Object.keys(obj).forEach(key => {
    if (Array.isArray(obj[key])) {
      obj[key].forEach(item => {
        output.push(key.toString() + '[]=' + item.toString());
      });
    } else {
      output.push(key.toString() + '=' + obj[key].toString());
    }
  });
  return output.join('&');
}

module.exports = { getOnly, getFromObj, postFromObj };
