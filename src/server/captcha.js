const config = require("./config");
const FormData = require('form-data');

function captchaVerify (token) {
  const secret_key = config.recaptcha.secret;
  let formData = new FormData();
  return new Promise(res => formData.submit({
    host: 'www.google.com',
    path: `/recaptcha/api/siteverify?secret=${secret_key}&response=${token}`,
    protocol: 'https:'
  }, function (err, data) {
    if (err) {
      console.log('Unable send token: ' + err);
      res({error: true, msg: 'Unable send token', obj: err});
      return;
    }
    // need to collect the response in chunks
    let body = '';
    data.on('data', function(chunk) {
      body += chunk;
    });
    // once the response body has been parsed, we can check to see if the server actually got it
    data.on('end', function() {
      try {
        res(JSON.parse(body));
      } catch (e) {
        console.log('invalid response from server: ', body);
        res({error: true, msg: 'invalid response from server: ', obj: body});
      }
    });
  }));
}

module.exports = {
  captchaVerify
};
