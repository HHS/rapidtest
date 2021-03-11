import React, { Component } from 'react';
import PropTypes from "prop-types";
import {Route} from "react-router-dom";
import {CenteredRow} from "../Components/FormGroups";
import {Login, Reset} from "../Components/Login";
const config = require("../config");

export default class LoginPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
    };
  }

  render() {
    const { email } = this.state;
    const { firebase, loading, showModal, p, v, showHelp } = this.props;

    const ok = () => {
      showModal(
        "Submission Received",
        "If you do not receive an email within 30 minutes, please contact Rapid Test helpdesk - " +
        config.client.localization.support_email
      );
    };


    return <CenteredRow xs={'12'} sm={'8'} md={'6'} lg={'5'}>
      <Route path={'/reset'}>
        <Reset
          email={email ?? ''}
          onEmail={e => this.setState({email: e})}
          loading={!!loading}
          submit={() => {
            p();
            firebase.auth.sendPasswordResetEmail(
              email, {url: window.location.href})
              .then(function() {
                ok();
                v();
              })
              .catch(function(error) {
                if (error.code === 'auth/user-not-found') {
                  ok();
                } else if (error.code === 'auth/invalid-email') {
                  showModal(
                    "Submission Failed",
                    error.message
                  );
                } else {
                  showModal(
                    "Submission Failed",
                    "Please try again. If you continue to have issues please contact Rapid Test helpdesk - " +
                    config.client.localization.support_email
                  );
                }
                v();
              });

          }}
        />
      </Route>
      <Route path={'/login'}>
        <Login
          email={email ?? ''}
          onEmail={e => this.setState({email: e})}
          loading={!!loading}
          submit={(email, password, success, failed) => {
            p();
            firebase.signInWithEmailAndPassword(email || '', password || '').then(function() {
              success();
              v();
            }).catch(function(error) {
              console.log(error.code);
              console.log(error.message);
              showModal("Invalid credentials.", "Please try again.");
              firebase.auth.signOut().catch(console.log);
              failed();
              v();
            });
          }}
          showHelp={() => showHelp()}
        />
      </Route>
    </CenteredRow>;
  }
}

LoginPage.propTypes = {
  loading: PropTypes.bool.isRequired,
  showModal: PropTypes.func.isRequired,
  firebase: PropTypes.object.isRequired,
  p: PropTypes.func.isRequired,
  v: PropTypes.func.isRequired,
  showHelp: PropTypes.func.isRequired,
};
