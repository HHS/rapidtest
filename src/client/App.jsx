import React, { Component } from 'react';
import {
  Toast,
  Container,
  Button,
  Modal,
} from 'react-bootstrap';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';
import { parse } from 'parse-usdl';
import date from 'date-and-time';
import PropTypes from 'prop-types';
import {IconContext} from "react-icons";
import {
  BsExclamationTriangle,
} from 'react-icons/bs';
import {getAge, numberMask} from "./Components/FormGroups";
import { load } from 'recaptcha-v3';
import yj from 'yieldable-json';
import './style.css';
import mysql from './mysql';
import Bugsnag from '@bugsnag/js';
import {AppVersion, Logo} from "./Components/Misc";
import FormPage from './Pages/FormPage';
import LoginPage from './Pages/LoginPage';
import SiteSelectPage from "./Pages/SiteSelectPage";
import PatientPage from "./Pages/PatientPage";
import {HistoryNotifications, HistoryPage} from "./Pages/HistoryPage";
import AccountPage from "./Pages/AccountPage";
import {getRouterBaseUrl} from "./util/router";
import { forceCheck } from 'react-lazyload';
import {EULA} from "./Components/EULA";
import {appVersion, copyThenApplyObj} from "./util/misc";
import {ScanditWarning} from "./Components/Scanner/ScanditWarning";
import {getServerTime, convertServerTimeString} from "./util/time";
import {getCueMacFromURL} from "./Components/KitScanAddon";
import config from "./config";
import {getAddressComponents} from "./util/google-maps";

class App extends Component {
  defaultDelay = 2500;
  loading = 0;
  loginAge = 3600 * 24; // a day
  siteAge = 3600 * 12; // 12 hours
  rootDir = getRouterBaseUrl() + '/';

  constructor(props) {
    super(props);
    this.state = {
      // senerios
      scanDlOnLogin: true,

      // toast messages
      toastMsg: "",
      toastDelay: this.defaultDelay,
      toastShow: false,
      //modal
      modalHeader: "",
      modalBody: "",
      modalFooter: "",
      modalOnClose: null,
      modalShow: false,

      loggedIn: false,
      patient_site_assigned: null,

      form: this.defaultForm(),
      dlScanning: false,
      kitScanAddon: '', // device code for cue, first part of kit_id
      selectOptions: {},

      loading: 0,
      historyComplete: {},
      historyIncomplete: {},

      routerBase: getRouterBaseUrl() || ''
    };
  }

  componentDidMount() {
    document.title = config.client.localization.page_title;
    this.resetForm();
    this.getRecaptchaToken('initial').catch(console.log);
    this.listener = this.props.firebase.auth.onAuthStateChanged(
      loggedIn => {
        this.setState({ loggedIn: loggedIn ? loggedIn : null}, () => {
          if (loggedIn) this.selectOptions().catch(console.error);
        });
      },
    );

    /*if (false) {
      this.setState({
        patient_site_assigned: {value: 5, label: 'Demo School (virtual)'}
      }, () => this.setForm({kit_id:'testing', patient_appt_datetime: date.format(getServerTime(),'YYYY-MM-DD HH:mm:ss.SSS')}));
    }*/

  }

  componentWillUnmount() {
    this.listener();
  }

  LogAnalyticsEvent(type, location) {
    if (!this.analytics)
      if (type == 'page-view')
        this.analytics = this.props.firebase.analytics;
      else
        return; // Don't load analytics unless main page load.
    this.analytics.logEvent(type, { path_name: location });
    return;
  }

  /* Begin UI functions */

  p = () => {
    this.loading++;
    this.setState({
      loading: this.loading,
    });
  };

  v = () => {
    if (this.loading > 0) this.loading--;
    this.setState({
      loading: this.loading,
    });
  };

  defaultForm = () => {
    return {
      formName: 'covid_test',
      kit_id: null,
      patient_dl: '',
      // others prefilled by FormPage.jsx

      //hidden
      place_id: null,
      patient_dl_race: null,
      patient_dl_ethnicity: null,
      errors: {},

      // Radios
      ctrl_first: -1,
      patient_hcw: -1,
      ctrl_symp: -1,
      qual_temperature: -1,
      qual_fever: -1,
      qual_chills: -1,
      qual_cough: -1,
      qual_short_breath: -1,
      qual_diff_breath: -1,
      qual_fatigue: -1,
      qual_body_ache: -1,
      qual_headache: -1,
      qual_loss_taste: -1,
      qual_loss_smell: -1,
      qual_sore_throat: -1,
      qual_nasal_congestion: -1,
      qual_nose: -1,
      qual_nausea: -1,
      qual_vomit: -1,
      qual_diarrhea: -1,
      patient_pregnant: -1,

      app_version:appVersion()
    }
  };

  resetForm = () => {
    this.loading = 0;
    this.setState({
      form: this.defaultForm(),
      dlScanning: false,
      loading: 0,
      modalShow: false,
    });
  };

  clearForm = () => {
    const confirm = () => {
      const form = this.defaultForm();
      form.kit_id = this.state.form.kit_id;
      this.setState({
        form: form,
        modalShow: false
      });
    };

    const onClose = () => this.setState({modalShow: false});

    this.showModal(
      <span>
        <IconContext.Provider value={{ className: "text-danger icon m-2", style: {fontSize: "140%", verticalAlign: "bottom"}}}>
          <span><BsExclamationTriangle/></span>
        </IconContext.Provider>
        Clear Form
      </span>,
      "This will clear all data on the form.",
      onClose,
      <span>
        <Button variant="danger" className={'m-2'} onClick={confirm}>Clear Form</Button>
        <Button variant="secondary" className={'m-2'} onClick={onClose}>Continue Editing</Button>
      </span>);
  };

  clearLogin = () => {
    let newState = {};
    this.props.firebase.signOut().catch(console.error);
    //newState.login = this.defaultLogin();
    newState.form = this.defaultForm();
    newState.selectOptions = {};
    newState.patient_site_assigned = null;
    this.loading = 0;
    newState.loading = 0;
    newState.modalShow = false;
    this.setState(newState);
  };

  setForm = (obj, prop) => {
    const { form } = this.state;
    this.setState({form: copyThenApplyObj(form,obj,prop) });
  };

  showHelp = () => {
    this.showModal(
      "Need help?",
      "Send an email to " +
      config.client.localization.support_email +
      " or give us a call at " +
      config.client.localization.support_phone +
      "."
    );
  };

  // toast messages
  showToast = (msg, delay) => {
    let show = true;
    if (typeof msg == 'undefined' || msg == "" || msg == false) {
      // interpret empty or false message as toast close
      msg = this.state.toastMsg;
      show = false;
    }
    if (typeof delay == 'undefined') {
      // revert to default delay if unspecified
      delay = this.defaultDelay;
    }
    this.setState({
      toastMsg: msg,
      toastDelay: delay,
      toastShow: show
    });
  };

  showModal = (header, body, onClose, footer) => {
    if (onClose === undefined) onClose = () => this.setState({modalShow: false});
    if (footer === undefined) footer = <Button variant="secondary" onClick={onClose}>Close</Button>;
    if (header && body) {
      this.setState({
        modalHeader: header,
        modalBody: body,
        modalFooter: footer,
        modalOnClose: onClose,
        modalShow: true,
      });
    } else {
      this.setState({modalShow: false});
    }
  };

  /* End UI functions */

  /* Begin Scanning Functions */

  scanDataMatrix = (barcode) => {
    console.log("Login Barcode", barcode);
    this.loadForm(barcode.data.replace('\u001d', '|')).catch(console.error);
  }

  scanPdf417 = (barcode) => {
    console.log("DL Barcode", barcode);
    const data = parse(barcode.data, {suppressErrors: true});
    console.log("DL Barcode", data);
    const raceDL = data.race ?? '';
    const isHispanic = raceDL.slice(-1) == 'H';
    const race = raceDL ? isHispanic ? raceDL.slice(0,-1) : raceDL : null;
    let raceObj = null;
    if (race) raceObj = this.state.selectOptions['patient_race'].find(obj => {
      return obj['dl'] && obj['dl'] === race|| obj['value'] && obj['value'] === race;
    });

    this.setForm({
      patient_dl: data.documentNumber,
      patient_first_name: data.firstName,
      patient_last_name: data.lastName,
      patient_dob: data.dateOfBirth,
      patient_age: getAge(data.dateOfBirth),
      patient_sex:
        (data.sex || '').toLowerCase().startsWith('m') ?
          'male' : data.sex.toLowerCase().startsWith('f') ?
            'female' : 'unk',
      patient_address: data.addressStreet,
      patient_address2: data.addressStreet2,
      patient_city: data.addressCity,
      patient_state: data.addressState,
      patient_zip: data.addressPostalCode.substr(0,5) ?? null,
      patient_dl_race: raceDL,
      patient_dl_ethnicity: isHispanic ? 'H' : null,
      patient_race: raceObj ? raceObj.value : null,
      patient_ethnicity: raceDL ? (isHispanic ? 'H' : 'NH') : null,
      dl_scan_state: data.addressState,
    });
    this.setState({dlScanning: false});
    this.setPlaceId([data.addressStreet, data.addressCity, data.addressState + ' ' + data.addressPostalCode.substr(0,5) ].join(', '));
  }

  scanQr = (barcode) => {
    console.log("QR Barcode", barcode);
    yj.parseAsync(barcode.data || '', async (err, data) => {
      if (!err && typeof data === 'object') {
        // if JSON, parse here
        if (data.encrypted_form && Object.keys(data).length === 1) {
          data = JSON.parse(await this.decrypt(data.encrypted_form));
        }

        const form = {
          patient_first_name: data.patient_first_name,
          patient_last_name: data.patient_last_name,
          patient_dob: data.patient_dob,
          patient_age: getAge(data.patient_dob),
          patient_sex:
            (data.patient_sex || '').toLowerCase().startsWith('m') ?
              'male' : (data.patient_sex || '').toLowerCase().startsWith('f') ?
                'female' : 'unk',
          patient_address: data.patient_address,
          patient_address2: data.patient_address2,
          patient_city: data.patient_city,
          patient_state: data.patient_state,
          patient_zip: (data.patient_zip ?? '').substr(0,5),
          patient_county: data.patient_county,
          patient_race: (data.patient_race || '').toUpperCase().substr(0,2),
          patient_ethnicity: (data.patient_ethnicity || '').toUpperCase().substr(0,2),
          patient_email: data.patient_email,
          patient_google_place_id: data.patient_google_place_id,
          patient_lat: data.patient_lat,
          patient_lng: data.patient_lng
        };

        if (data.patient_county) this.addPatientCounty(data.patient_county);

        if (data.id) {
          form.patient_dl = data.id;
          form.patient_callback_number = numberMask(data.callback_number || '', "000-000-0000");
        } else if (data.patient_dl || data.preregistration) {
          form.patient_dl = data.patient_dl || '';
          form.patient_callback_number = numberMask(data.patient_callback_number || '', "000-000-0000");
        }

        this.setForm({
          ...form,
          prefilled : true
        });
        this.setState({dlScanning: false});
      } else if (!this.state.form.kit_id) {
        // if NOT a JSON then scan as CUE or later Abbott device.
        // also don't attempt to load a new form if we are already working with one
        let addon = this.state.kitScanAddon;
        if (addon) {
          addon += '|'
        }
        this.loadForm(addon + barcode.data);
      }
    });
  }

  decrypt = async (s) => {
    const login = await this.getLogin('decrypt');
    return new Promise  (res => {
      mysql.postFromObj(
        `${this.rootDir}api/decrypt`,
        {
          login: login,
          encrypted_string: s
        },
        obj => {
          res(obj.decrypted_string);
        },
        res => {
          console.log('Failed:', res);
        });
    });
  }
  /* End Scanning Functions */

  /* Begin API functions */

  getRecaptchaToken = (action) => {
    return new Promise (res => {
      if (config.client.recaptcha.site_key === null) {
        res(null);
      } else {
        load(config.client.recaptcha.site_key).then((recaptcha) => {
          recaptcha.execute(action).then((token) => {
            res(token);
          }).catch(err => {
            res(null);
            console.log("recaptcha error:", err);
          });
        });
      }
    });
  }

  getLogin = async (action) => {
    return {
      email: await this.props.firebase.getEmail(),
      firebase_token: await this.props.firebase.getToken(),
      recaptchaToken: await this.getRecaptchaToken(action),
    }
  }

  selectOptions = async (showModals) => {
    if (showModals === undefined) showModals = true;
    this.p();
    mysql.postFromObj(
      `${this.rootDir}api/login`,
      await this.getLogin('login'),
      obj => {
        if (obj.options !== false) {
          if (obj.options.errorExists) {
            // indicates there is a problem with selecting from options tables
            if (showModals) {
              this.showModal(
                "A System Error Occurred. SELECT",
                "Rapid Test helpdesk - " + config.client.localization.support_email
              );
            }
          }
          this.setState({selectOptions: obj.options});
        }
        if (obj.recaptchaError) {
          this.showModal("Something went wrong.", "Please try again.");
        }
        this.v();
      },
      res => {
        console.log('Failed:', res);
        if (showModals) {
          this.showModal(
            "A System Error Occurred. UNKNOWN",
            "Rapid Test helpdesk - " + config.client.localization.support_email
          );
        }
        this.v();
      }
    );
  };

  loadHistory = async (incomplete, offset) => {
    if (!incomplete) this.p();
    const login = await this.getLogin('history');
    if (!this.state.patient_site_assigned) {
      if (!incomplete) this.v();
      return;
    }
    mysql.postFromObj(
      `${this.rootDir}api/history`,
      {
        login,
        patient_site_assigned: this.state.patient_site_assigned.value,
        // if offset is undefined, only get incomplete records
        incomplete: !!incomplete,
        // otherwise get a few completed records at a time
        offset: offset || 0
      },
      obj => {
        if (obj.history && !obj.error) {
          const history = {};
          obj.history.forEach(item => history[item.kit_id] = item);
          if (incomplete) {
            this.setState({
              historyIncomplete: {
                ...history
              }
            });
          } else {
            this.setState({
              historyComplete: {
                ...(typeof offset === 'undefined' ? this.state.historyIncomplete : {}),
                ...history
              }
            });
          }
        }
        forceCheck();
        if (!incomplete) this.v();
      },
      res => {
        console.log('Failed:', res);
        if (!incomplete) this.v();
      }
    );
  };

  loadForm = async (barcode) => {
    this.setForm({kit_id: "pending"});
    this.p();
    this.LogAnalyticsEvent('kit-scan-attempt', window.location.pathname);
    const login = await this.getLogin('scan');
    mysql.postFromObj(
      `${this.rootDir}api/login_scan`,
      {
        kit_id: barcode,
        login: login,
      },
      value => {
        if (value.options !== false) {
          if (value.options.errorExists) {
            // indicates there is a problem with selecting from race/ethnicity tables
            this.LogAnalyticsEvent('kit-scan-error-select', window.location.pathname);
            this.showModal(
              "A System Error Occurred. SELECT",
              "Rapid Test helpdesk - " + config.client.localization.support_email,
              this.resetForm
            );
          }
          this.setState({selectOptions: value.options});
        }
        if (value.recaptchaError) {
          this.LogAnalyticsEvent('recaptcha-error', window.location.pathname);
          this.showModal("Something went wrong.", "Please try again.", this.resetForm);
        } else if (value.invalid === true) {
          // show different modal instead if there is another reason
          let skip = false;
          if (value.reason) {
            skip = true;
            const r = value.reason;
            if (r === 'device-only') {
              this.setState({kitScanAddon: barcode});
              this.showModal(
                "CUE device selected.",
                "You may now scan a CUE cartridge and complete the form.",
                this.showModal(false,false),
                <span>
                  <Button variant="secondary" className={'m-2'} onClick={(e) => {
                    e.preventDefault();
                    this.showModal(false,false);
                  }}>OK</Button>
                </span>
              );
            } else if (r === 'cartridge-only') {
              this.showModal(
                "No CUE device selected.",
                "You must first scan the QR code on the CUE reading device.",
                this.showModal(false,false)
              );
            } else if (r === 'device-rescan') {
              this.showModal(
                "CUE device rescanned.",
                "Scan the CUE cartridge instead.",
                this.showModal(false,false)
              );
            } else if (r === 'device-replace' && value.components) {
              this.showModal(
                <>Another CUE device scanned.</>,
                <div>
                  Would you like to replace&nbsp;
                  <span style={{whiteSpace: "nowrap"}}>{getCueMacFromURL(this.state.kitScanAddon)}</span>
                  {" with"}&nbsp;
                  <span style={{whiteSpace: "nowrap"}}>{getCueMacFromURL(value.components.cart)}</span>
                </div>,
                this.showModal(false,false),
                <span>
                  <Button variant="primary" className={'m-2'} onClick={(e) => {
                    e.preventDefault();
                    this.setState({kitScanAddon: value.components.cart}, () => this.showModal(false,false));
                  }}>Replace</Button>
                  <Button variant="secondary" className={'m-2'} onClick={(e) => {
                    e.preventDefault();
                    this.showModal(false,false);
                  }}>Cancel</Button>
                </span>
              );
            } else {
              skip = false;
            }
          }

          if (skip) {
            // skip error message because we dont want to reset the form
            this.setForm({kit_id: this.defaultForm().kit_id});
            this.v();
          } else {
            this.LogAnalyticsEvent('kit-scan-error-barcode-invalid', window.location.pathname);
            this.showModal(
              "Barcode invalid.",
              "Please try again. Ensure that you are scanning the code on the test card to be used and NOT the shipping carton.",
              this.resetForm
            );
          }
        } else if (value.error === true) {
          // indicates there is a problem with inserting into the kit table
          this.LogAnalyticsEvent('kit-scan-error-insert', window.location.pathname);
          this.showModal(
            "A System Error Occurred. INSERT",
            "Rapid Test helpdesk - " + config.client.localization.support_email,
            this.resetForm
          );
        } else if (value.prohibited) {
          this.LogAnalyticsEvent('kit-scan-prohibited', window.location.pathname);
          this.showModal(
            "Authentication failed.",
            "You have been logged out. Please login again.",
            () => {},
            <span><Button variant="danger" onClick={() => this.clearLogin()}>
              Ok
            </Button></span>
          );
          Bugsnag.notify(new Error('kit scan prohibited'), function (event) {
            event.addMetadata("scan", "barcode", barcode);
            event.setUser(login.email);
          });
        } else if (value.locked === true) {
          this.LogAnalyticsEvent('kit-scan-error-used', window.location.pathname);
          this.showModal("This test kit is used.", "Please use another.", this.resetForm);
          Bugsnag.notify(new Error('kit used'), function (event) {
            event.addMetadata("scan", "barcode", barcode);
            event.setUser(login.email);
          });
        } else if (value.expired === true) {
          this.LogAnalyticsEvent('kit-scan-error-expired', window.location.pathname);
          this.showModal("Expired Test Kit.", 
            <span>
              This BinaxNOW test has expired on {value.expirationDate}. You will NOT be able to use this test kit.<br/>
              Expiration dates are printed on the side of the BinaxNOW box.
              {config.client.faqUrl ? <span>
                <br/>If all of your tests are expired you may visit <a href={config.client.faqUrl}>{config.client.faqUrl}</a> for more information.
              </span> : null}
            </span>, this.resetForm);
          Bugsnag.notify(new Error('kit expired'), function (event) {
            event.addMetadata("scan", "barcode", barcode);
            event.addMetadata("scan", "expiration", value.expirationDate);
            event.setUser(login.email);
          });
        } else {
          // success.
          this.showModal(false,false);
          this.LogAnalyticsEvent('kit-scan-success', window.location.pathname);
          ['patient_appt_datetime', 'patient_test_started' ].forEach(k => {
            if (value.form[k]) {
              const d = convertServerTimeString(value.form[k]);
              value.form[k] = date.format(d, "YYYY-MM-DD HH:mm:ss.SSS");
            }
          });
          if (!value.form['patient_appt_datetime']) {
            value.form['patient_appt_datetime'] = date.format(getServerTime(),'YYYY-MM-DD HH:mm:ss.SSS');
          }

          ['patient_dob', 'patient_symptom_onset' ].forEach(k => {
            if (value.form[k]) {
              const d = convertServerTimeString(value.form[k]);
              value.form[k] = date.format(d, "YYYY-MM-DD");
            }
          });

          [ 'patient_previous_test_datetime' ].forEach(k => {
            if (value.form[k]) {
              const d = convertServerTimeString(value.form[k]);
              value.form[k] = date.format(d, "YYYY-MM");
            }
          });

          if (value.form['patient_county']) {
            this.addPatientCounty(value.form['patient_county']);
          } else if (this.state.form['patient_county']) {
            this.addPatientCounty(this.state.form['patient_county']);
          }

          this.v();

          if (this.state.form.prefilled && !value.form.created) {
            const goBack = () => {
              this.setForm({kit_id: null});
              this.setState({modalShow: false});
            };
            const overWrite = () => {
              const prefilled = this.state.form;
              Object.keys(prefilled).forEach(k => {
                if (k !== "kit_id") value.form[k] = prefilled[k];
              });
              this.setForm(value.form);
              this.setState({modalShow: false});
            };
            const useExisting = () => {
              this.setForm(value.form);
              this.setState({modalShow: false});
            };

            this.showModal(
              "This test kit is in progress",
              <span>
                Do you want to prefill this patient&apos;s information? It will overwrite the existing information.
              </span>, // maybe a tooltip that says they can scan in the form if they are unsure
              () => {},
              <span>
                <Button variant="primary" className={'m-2'} onClick={useExisting}>Use Existing</Button>
                <Button variant="danger" className={'m-2'} onClick={overWrite}>Overwrite</Button>
                <Button variant="secondary" className={'m-2'} onClick={goBack}>Go Back</Button>
              </span>
            );
          } else {
            this.setForm(value.form);
          }
        }
      }, e => {
        this.LogAnalyticsEvent('kit-scan-error-system', window.location.pathname);
        this.showModal(
          "A System Error Occurred.",
          "Rapid Test helpdesk - " + config.client.localization.support_email,
          this.resetForm
        );
        console.log(e);
        Bugsnag.notify(e, function (event) {
          event.addMetadata("scan", "barcode", barcode);
          event.setUser(login.email);
        });
      }
    );
  };
  /* End API functions */

  /* Start Google Maps */

  setPlaceId = (address) => {
    this.p();
    getAddressComponents(address, this.addPatientCounty)
      .then(form => this.setForm(form))
      .catch(error => this.showModal("Address Autocomplete Failure", '' + error))
      .finally(() => this.v());
  };

  /* End Google Maps */

  // Add a county to the selectOptions list if it doesnt exist already.
  // will be cleared when another form is loaded, only googleApi and DB can fill this value
  // only modifies this.state.selectOptions
  addPatientCounty = (county, state) => {
    if (this.state.selectOptions && this.state.selectOptions.patient_county) {
      const {selectOptions} = this.state;
      const patient_county = selectOptions.patient_county; // list of counties
      if (!patient_county.find(c => c.label === county)) {
        const obj = {value: county, label: county};
        if (state) obj.state = state;
        patient_county.push(obj);
        this.setState({
          selectOptions: {...selectOptions, patient_county: patient_county}
        });
      }
    }
  }

  render() {
    const { firebase } = this.props;

    const { 
      // toast messages
      toastMsg,
      toastDelay,
      toastShow,

      modalHeader,
      modalBody,
      modalOnClose,
      modalFooter,
      modalShow,

      loggedIn,
      patient_site_assigned,

      form,
      selectOptions,
      historyIncomplete,
      historyComplete
    } = this.state;

    const loading = this.state.loading || loggedIn === false;

    const PageRedirect = () => {
      if (!loading && !loggedIn)
        return <Redirect to={'/login'}/>;
      else if (!patient_site_assigned)
        return <Redirect to={'/site-select'}/>;
      else
        return null;
    };

    const statusBarProps = {
      ta: this.props.firebase.auth.currentUser ?
        (this.props.firebase.auth.currentUser.displayName || this.props.firebase.auth.currentUser.email) :
        loading ? 'loading...' : 'unknown',
      site: patient_site_assigned ? patient_site_assigned.label : '',
      patient_site_assigned_value: patient_site_assigned ? patient_site_assigned.value : '',
      cancelText: patient_site_assigned ? "Select Site" : "Logout",
      cancel: () => {
        if (patient_site_assigned) this.setState({patient_site_assigned: null});
        else this.clearLogin();
      },
      loading: !!loading
    };

    return (
      <BrowserRouter basename={this.state.routerBase}>
        {patient_site_assigned ?
          <HistoryNotifications
            historyIncomplete={historyIncomplete}
            loadHistory={(offset) => this.loadHistory(true, offset)}
            loading={!!loading}
          /> : null}

        <Toast
          className={'horizontal-center'}
          style={{
            zIndex: 5,
            position: 'absolute',
            bottom: '1rem',
          }}
          onClose={() => this.showToast(false)}
          show={toastShow}
          delay={toastDelay}
          autohide
        >
          <Toast.Body>{toastMsg}</Toast.Body>
        </Toast>

        <Modal show={modalShow} onHide={modalOnClose}>
          <Modal.Header closeButton>
            <Modal.Title>{modalHeader}</Modal.Title>
          </Modal.Header>
          <Modal.Body>{modalBody}</Modal.Body>
          <Modal.Footer>{modalFooter}</Modal.Footer>
        </Modal>

        <Route path="/" render={({location}) => {
          this.LogAnalyticsEvent('page-view', location.pathname + location.search);
          return null;
        }} />

        <Switch>
          <Route path={['/reset']} render={() => null}/>
          <Route render={() => <PageRedirect/>}/>
        </Switch>

        <Container>
          <Logo/>
          <ScanditWarning/>

          <Switch>
            <Route path={['/reset', '/login']}>
              <LoginPage
                loading={!!loading}
                showModal={this.showModal}
                firebase={firebase}
                p={this.p}
                v={this.v}
                showHelp={this.showHelp}
              />
            </Route>
            <Route path={'/site-select'}>
              <EULA
                showModal={this.showModal}
                uid={firebase.auth.currentUser ? firebase.auth.currentUser.uid : ''}
                setEula={(eula) => this.setState({eula})}
                eula={this.state.eula}/>
              {!patient_site_assigned ? <SiteSelectPage
                statusBarProps={statusBarProps}
                loading={!!loading}
                firebase={firebase}
                selectOptions={selectOptions}
                onSubmit={(site) => this.setState(
                  {patient_site_assigned: site},
                  () => this.resetForm()
                )}
              /> : <Redirect push to={'/patient'}/> }
            </Route>
            <Route path={'/patient'}>
              {form.kit_id ? <Redirect to={'/form'}/> : null}
              <PatientPage
                statusBarProps={statusBarProps}
                loading={!!loading}
                firebase={firebase}
                onScan={(e) => {
                  e.barcodes.forEach(barcode => {
                    if (barcode.symbology === "data-matrix") {
                      this.scanDataMatrix(barcode);
                    } else if (barcode.symbology === "pdf417") {
                      this.scanPdf417(barcode);
                      this.setForm({prefilled : true});
                    } else if (barcode.symbology === "qr") {
                      this.scanQr(barcode);
                    }
                  });
                }}
                form={form}
                resetForm={() => this.resetForm()}
                p={this.p}
                v={this.v}
                kitScanAddon={this.state.kitScanAddon}
                kitScanAddonClear={() => this.setState({kitScanAddon: ''})}
              />
            </Route>
            <Route path={'/history'}>
              {form.kit_id ? <Redirect to={'/form'}/> : null}
              <HistoryPage
                statusBarProps={statusBarProps}
                loadHistory={(incomplete, offset) => this.loadHistory(incomplete, offset)}
                loading={!!loading}
                loadForm={this.loadForm}
                historyIncomplete={historyIncomplete}
                historyComplete={historyComplete}
              />
            </Route>
            <Route path={'/account'}>
              <AccountPage
                statusBarProps={statusBarProps}
                loading={!!loading}
                firebase={firebase}
                clearLogin={this.clearLogin}
              />
            </Route>
            <Route path={'/form'}>
              <FormPage
                statusBarProps={statusBarProps}
                getLogin={this.getLogin}
                /* https://react-redux.js.org Maybe this can help with this */
                p={this.p}
                v={this.v}
                loading={!!loading}
                form={form}
                setForm={this.setForm}
                selectOptions={selectOptions}
                setPlaceId={this.setPlaceId}
                resetForm={this.resetForm}
                clearForm={this.clearForm}
                clearLogin={this.clearLogin}
                showHelp={this.showHelp}
                showModal={this.showModal}
                showToast={this.showToast}
                scanQr={this.scanQr}
                scanPdf417={this.scanPdf417}
              />
              <div style={{height: "108px"}}/>
            </Route>
            <Route path={'/*'}>
              Page not found.
            </Route>
          </Switch>
          <AppVersion/>
        </Container>
        <div style={{height: "44px"}}/>
      </BrowserRouter>
    );
  }
}
App.propTypes = {
  firebase: PropTypes.object.isRequired
};
export default App;
