"use strict";

const assert = require( "assert" );
const dotenv = require( "dotenv" );


// read in the .env file
dotenv.config();

// capture the environment variables the application needs
const {
  SQL_SERVER,
  SQL_DATABASE,
  SQL_USER,
  SQL_PASSWORD,
  BINAX_TEST_KIT_IDS,
  CUE_TEST_READER_IDS,
  RECAPTCHA_ENABLED,
  RECAPTCHA_SITE_KEY,
  RECAPTCHA_SECRET,
  BUGSNAG_APIKEY,
  GOOGLE_APPLICATION_CREDENTIALS,
  FIREBASE_APIKEY,
  FIREBASE_AUTHDOMAIN,
  FIREBASE_DATABASEURL,
  FIREBASE_PROJECTID,
  FIREBASE_STORAGEBUCKET,
  FIREBASE_MESSAGINGSENDERID,
  FIREBASE_APPID,
  FIREBASE_MEASUREMENTID,
  RESOURCES_DIR,
  SUPPORT_EMAIL,
  SUPPORT_PHONE,
  NO_ACCOUNT,
  FAQ_URL,
  PAGE_TITLE
} = process.env;

// validate the required configuration information
assert(SQL_SERVER, "SQL_SERVER configuration is required.");
assert(SQL_DATABASE, "SQL_DATABASE configuration is required.");
assert(SQL_USER, "SQL_USER configuration is required.");
assert(SQL_PASSWORD, "SQL_PASSWORD configuration is required.");

if (RECAPTCHA_ENABLED === "true") {
  assert(RECAPTCHA_SITE_KEY, "RECAPTCHA_SITE_KEY is required.");
  assert(RECAPTCHA_SECRET, "RECAPTCHA_SECRET is required.");
}

assert(BUGSNAG_APIKEY, "BUGSNAG_APIKEY is required.");

assert(GOOGLE_APPLICATION_CREDENTIALS, "GOOGLE_APPLICATION_CREDENTIALS is required.");
assert(FIREBASE_APIKEY, "FIREBASE_APIKEY is required.");

assert(RESOURCES_DIR, "RESOURCES_DIR is required.");

const binaxKitIdsArray = (BINAX_TEST_KIT_IDS === undefined) ? [] : BINAX_TEST_KIT_IDS.split(',');
const cueReaderDeviceIdsArray = (CUE_TEST_READER_IDS === undefined) ? [] : CUE_TEST_READER_IDS.split(',');

function isNotLocalDev() {
  return (process.env.docker_env && (process.env.docker_env !== 'local'));
}

let clientConfig = {
  noAccount: NO_ACCOUNT,
  faqUrl: FAQ_URL,
  localization: {
    support_email: SUPPORT_EMAIL,
    support_phone: SUPPORT_PHONE,
    page_title: PAGE_TITLE ?? "Test Kit Scanner"
  },
  bugsnag: {
    apikey: BUGSNAG_APIKEY,
  },
  firebase: {
    apiKey: FIREBASE_APIKEY,
    authDomain: FIREBASE_AUTHDOMAIN,
    databaseURL: FIREBASE_DATABASEURL,
    projectId: FIREBASE_PROJECTID,
    storageBucket: FIREBASE_STORAGEBUCKET,
    messagingSenderId: FIREBASE_MESSAGINGSENDERID,
    appId: FIREBASE_APPID,
    measurementId: FIREBASE_MEASUREMENTID,
  },
  recaptcha: {
    site_key: RECAPTCHA_SITE_KEY
  },
  scandit: "none"
};

let localScanditConfig = {
  "yoursite.local": "scandit key here",
  default: "scandit key here",
}

function getClientConfig(req) {
  if (req && localScanditConfig[req.headers.host] !== undefined) {
    console.log("host: " + req.headers.host);
    clientConfig.scandit = localScanditConfig[req.headers.host];
  } else {
    clientConfig.scandit = localScanditConfig.default;
  }
  return clientConfig;
}

// export the configuration information
module.exports = {
  isNotLocalDev,
  getClientConfig,
  resourcesDir: RESOURCES_DIR,
  sql: {
    server: SQL_SERVER,
    database: SQL_DATABASE,
    user: SQL_USER,
    password: SQL_PASSWORD,
  },
  testKits: {
    binax: binaxKitIdsArray,
    cue_readers: cueReaderDeviceIdsArray
  },
  recaptcha: {
    secret: RECAPTCHA_SECRET
  },
  bugsnag: {
    apikey: BUGSNAG_APIKEY,
  }
};
