import app from 'firebase/app';
import 'firebase/auth';
import 'firebase/analytics';
import React from 'react';
const config = require("../config");

class Firebase {
  constructor() {
    app.initializeApp(config.client.firebase);
    this.auth = app.auth();
    this.analytics = app.analytics();
  }

  loggedIn = () => {
    return !!this.auth.currentUser;
  }

  getEmail = () => {
    return new Promise(res => {
      if (this.auth.currentUser) res(this.auth.currentUser.email);
      else res(null);
    });

  }

  getToken = () => {
    if (!this.loggedIn()) return Promise.resolve(null);
    return new Promise(res => {
      this.auth.currentUser.getIdToken(true).then(function(idToken) {
        res(idToken);
      }).catch(() => {res(null)});
    });
  }

  signInWithEmailAndPassword = (email, password) =>
    this.auth.signInWithEmailAndPassword(email, password);

  signOut = () => this.auth.signOut().catch(console.log);

  sendPasswordResetEmail = email => this.auth.sendPasswordResetEmail(email);

}
const FirebaseContext = React.createContext(null);

export default Firebase;
export { FirebaseContext };