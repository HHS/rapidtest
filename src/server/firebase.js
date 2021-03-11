const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.applicationDefault()
});

function verifyUser (idToken) {
  return admin.auth().verifyIdToken(idToken);
}

function setPassword(uid, password) {
  return admin.auth().updateUser(uid, {
      password: password
    }).then((userRecord) => {
      return true;
    }).catch((err) => {
      console.log(err);
      return false;
    });
}

function setAccountDisabledStatus(uid, disabled) {
  return admin.auth().updateUser(uid, {
    disabled: disabled
  }).then((userRecord) => {
    return true;
  }).catch((err) => {
    console.log(err);
    return false;
  });
}

module.exports = {
  verifyUser,
  setPassword,
  setAccountDisabledStatus
};
