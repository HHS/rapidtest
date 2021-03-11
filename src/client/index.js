import '@sagi.io/globalthis';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css';
import Firebase, { FirebaseContext } from './Components/Firebase';
import Bugsnag from '@bugsnag/js'
import BugsnagPluginReact from '@bugsnag/plugin-react';
import {getRouterBaseUrl} from "./util/router";
const config = require("./config");
const axios = require("axios");
const rootDir = getRouterBaseUrl() + '/';

// Load configuration file from server.
axios.get(rootDir + 'api/config.json').then(res => {
  config.client = res.data;
  config.client.clientTime = new Date();
  if (process.env.docker_env && process.env.docker_env !== 'local') {
    Bugsnag.start({
      apiKey: config.client.bugsnag.apikey,
      plugins: [new BugsnagPluginReact()],
      releaseStage: process.env.docker_env,
      appVersion: process.env.docker_sha
    });

    const ErrorBoundary = Bugsnag.getPlugin('react')
      .createErrorBoundary(React);

    ReactDOM.render(
      <ErrorBoundary>
        <FirebaseContext.Provider value={new Firebase()}>
          <FirebaseContext.Consumer>{firebase => <App firebase={firebase}/>}</FirebaseContext.Consumer>
        </FirebaseContext.Provider>
      </ErrorBoundary>, document.getElementById('root'));
  } else {
    ReactDOM.render(
      <FirebaseContext.Provider value={new Firebase()}>
        <FirebaseContext.Consumer>{firebase => <App firebase={firebase}/>}</FirebaseContext.Consumer>
      </FirebaseContext.Provider>, document.getElementById('root'));
  }
}).catch(error => {
  console.log(error);
  ReactDOM.render(
    <div><h4>Error loading configuration file.</h4><div>{error}</div></div>, document.getElementById('root'));
});
