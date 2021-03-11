# Test Kit Scanner

## Configuration

* Replace `YOURKEYHERE` in `public/index.html`.
* Edit `src/server/config.js`.
* Make a directory in `src/server/Resources` to place your EULA/form overrides/logo into.
* Add your Firebase service account private key file in `src/server/`.
* Add SSL server keys into `ssl/`. `ssl/cert.pem` and `ssl/key.pem`.
* Modify `webpack.prod.js` and `Dockerfile`. Replace `YOURBUGSNAGAPIKEY` with your Bugsnag API key.


## Getting Started
Install node modules
```
npm i
```

Run app locally
```
npm run dev
```

Will be running on https://localhost:3000/

## Live Demo
The .gitlab-ci.yml and Dockerfile files are used to deploy the master branch and the develop branch to portainer.
The master branch is here https://10.1.3.250:3105 and the develop branch is here https://10.1.3.250:3106

## Adding Fields to Form

### Add field to database
`field` should be consistant throughout the code.
```
alter table mod_cvd_test_kits
	add field varchar(255) null
```
 
 ### Add field to Server
 Edit [index.js](src/server/index.js)
 
 Add `field` to `clientFields`
 ```
const clientFields = [
  ...,
  'field',
];
```

If the field is required to submit the form or needs to be in a certain format, 
it needs to be checked in `function getFormError(form)`.

```
if (form['field'] is not valid) {
  // Any error set to true will prevent result from being submitted
  // Fields are still saved even if they don't pass
  errors['field'] = true;
}
```
 
### Add fields to Client

Edit [FormPage.jsx](src/client/Pages/FormPage.jsx)

Inside the `render()` function, add one of these components adjacent to one of the others.

```
<FormGroupText
  label={'Field'}
  prop={'field'}
  errors={errors}
  form={form}
  setForm={setForm}/>
```
## Driver's License Scanning
https://github.com/PDF417/pdf417-android/blob/master/DriversLicenseKeys.md#usdlscanresultkraceethnicity
```
/**
 Optional on AAMVA 02, 03, 04, 05, 06, 07, 08 and Compact Encoding
 Codes for race or ethnicity of the cardholder, as defined in ANSI D20.
 Race:
 Code   Description
 AI     Alaskan or American Indian (Having Origins in Any of The Original Peoples of
 North America, and Maintaining Cultural Identification Through Tribal
 Affiliation of Community Recognition)
 AP     Asian or Pacific Islander (Having Origins in Any of the Original Peoples of
 the Far East, Southeast Asia, or Pacific Islands. This Includes China, India,
 Japan, Korea, the Philippines Islands, and Samoa)
 BK     Black (Having Origins in Any of the Black Racial Groups of Africa)
 W      White (Having Origins in Any of The Original Peoples of Europe, North Africa,
 or the Middle East)
 Ethnicity:
 Code   Description
 H      Hispanic Origin (A Person of Mexican, Puerto Rican, Cuban, Central or South
 American or Other Spanish Culture or Origin, Regardless of Race)
 O      Not of Hispanic Origin (Any Person Other Than Hispanic)
 U      Unknown
 */
```

## Running in production

```
docker pull 10.1.3.250:5000/test-kit-scanner:master ; 
docker run -d \
  -p 443:8080 \
  --name test-kit-scanner \
  --restart unless-stopped \
  10.1.3.250:5000/test-kit-scanner:master
```

###To Update

```
docker kill test-kit-scanner ; 
docker rm test-kit-scanner ;
docker pull 10.1.3.250:5000/test-kit-scanner:master ; 
docker run -d ...
```

### Disable ReCaptcha
```
docker run -d \
  -p 443:8080 \
  --name test-kit-scanner \
  --restart unless-stopped \
  --env RECAPTCHA_ENABLED=false \
  --env RECAPTCHA_VERIFY=false \
  --env RECAPTCHA_MIN_SCORE=0.2 \
  10.1.3.250:5000/test-kit-scanner:master
```

### Access logs
```
docker logs test-kit-scanner
```
 