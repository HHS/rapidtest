import PropTypes from "prop-types";
import React, {useEffect, useState} from "react";
import {
  Button,
  Col,
  Row,
  Form,
  Spinner,
  ButtonGroup
} from "react-bootstrap";
import {
  Switch,
  Route,
  Link,
  Redirect,
  useParams,
  useRouteMatch,
} from 'react-router-dom';
import Bugsnag from '@bugsnag/js';
import {Page1} from './FormPages/Page1';
import {Page2} from './FormPages/Page2';
import {Page3} from './FormPages/Page3';
import {Page4} from './FormPages/Page4';
import {PageDL} from './FormPages/PageDL';
import {StatusBar} from "../Components/Misc";
import {IconContext} from "react-icons";
import {BsExclamationTriangle} from "react-icons/bs";
import mysql from "../mysql";
import {getRouterBaseUrl} from "../util/router";
import date from "date-and-time";
import {FormTimer} from "../Components/FormHistory";
import {getServerTime} from "../util/time";
import config from "../config";

function skipPage3() {
  return config.client.formOverrides
    && config.client.formOverrides['covid_test']
    && config.client.formOverrides['covid_test']['page3']
    && config.client.formOverrides['covid_test']['page3'].display === false;
}

function TopRow (props) {
  const { statusBarProps, loading, maybeExit, showHelp, url, timer } = props;
  const { page } = useParams();

  const Back = () => {
    return <>{ loading ? <Spinner as="span" animation="border" variant="light" size="sm"/> : page === "1" ? "Exit" : "Back" }</>
  }

  return <>
    <div className={'mb-3'}>
      <StatusBar
        ta={statusBarProps.ta}
        site={statusBarProps.site}
        loading={loading}
        cancelButton={page === "1" ? <Button
          variant="secondary"
          onClick={loading ? null : () => maybeExit() }
          disabled={loading}
        >
          <Back/>
        </Button> : <Button
          variant="secondary"
          disabled={loading}
          as={Link}
          to={`${url}/${page - 1}`}
        >
          <Back/>
        </Button>}
      />
    </div>
    <Form.Row>
      {timer ? <Col className={'mb-2 float-left'}>
        {timer}
      </Col> : null}

      <Col xs={'auto'} className={'mb-2 float-right'}>
        <Button
          variant="outline-info"
          onClick={() => showHelp()}
          disabled={loading}
          className="float-right"
        >
          Help
        </Button>
      </Col>

      <Col xs={'auto'} className={'mb-2 float-right'}>
        <ButtonGroup size={'md'} className="float-right">
          {(skipPage3() ? ["1","2","3"] : ["1","2","3", "4"]).map((p) => <Button
            key={p}
            as={Link}
            to={`${url}/${p}`}
            variant={(page !== p ? 'outline-' : '') + 'primary'}
          >{p}</Button>)}
        </ButtonGroup>
      </Col>
    </Form.Row>
  </>;
}
TopRow.propTypes = {
  statusBarProps: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
  maybeExit: PropTypes.func.isRequired,
  showHelp: PropTypes.func.isRequired,
  url: PropTypes.string.isRequired,
  timer: PropTypes.node,
};

function Pages(props) {
  const {
    form,
    setForm,
    selectOptions,
    setPlaceId,
    loading,
    save,
    resetForm,
    showModal,
    url,
  } = props;
  const { page } = useParams();

  const autoSave = () => {
    if (save) save(() => {}, 'autosave').catch(console.error);
  };

  useEffect(() => {
    if (!loading && form.kit_id && form.kit_id !== "pending") autoSave();
  }, [page])

  if (page === "1") {
    return <Page1 form={form} setForm={setForm} selectOptions={selectOptions} url={url}/>
  } else if (page === "2") {
    return <Page2 form={form} setForm={setForm} selectOptions={selectOptions} setPlaceId={setPlaceId}/>
  } else if (!skipPage3() && page === "3") {
    return <Page3 form={form} setForm={setForm} selectOptions={selectOptions}/>
  } else if (skipPage3() && page === "3" || page === "4") {
    return <Page4
      form={form}
      setForm={setForm}
      selectOptions={selectOptions}
      loading={loading}
      save={save}
      resetForm={resetForm}
      showModal={showModal}
    />
  }
}
Pages.propTypes = {
  form: PropTypes.object.isRequired,
  setForm: PropTypes.func.isRequired,
  selectOptions: PropTypes.object.isRequired,
  setPlaceId: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  save: PropTypes.func.isRequired,
  resetForm: PropTypes.func.isRequired,
  showModal: PropTypes.func.isRequired,
  url: PropTypes.string.isRequired,
};

function BottomRow (props) {
  const { loading, clearForm, url } = props;
  const { page } = useParams();

  return <Row>

    <Col>
      <Button
        variant="outline-danger"
        onClick={() => clearForm()}
        disabled={loading}
        className={"mt-2"}
      >
        Clear Form
      </Button>
    </Col>

    { skipPage3() && page !== "3" || page !== "4"?
      <Col xs={"auto"}>
        <Button
          variant="primary"
          as={Link}
          to={`${url}/${parseInt(page) + 1}`}
          size={'lg'}
        >
          Next
        </Button>
      </Col> : null }

  </Row>
}
BottomRow.propTypes = {
  loading: PropTypes.bool.isRequired,
  clearForm: PropTypes.func.isRequired,
  url: PropTypes.string.isRequired
};

export default function FormPage (props) {
  const rootDir = getRouterBaseUrl() + '/';
  const {
    statusBarProps,
    getLogin,
    p,
    v,
    loading,
    form,
    setForm,
    selectOptions,
    setPlaceId,
    clearForm,
    clearLogin,
    resetForm,
    showHelp,
    showModal,
    showToast,
    scanQr,
    scanPdf417,
  } = props;
  const { path, url } = useRouteMatch();
  const [redirectTo, setRedirect] = useState(null);

  const startTimerNow = () => {
    setForm({patient_test_started: date.format(getServerTime(), 'YYYY-MM-DD HH:mm:ss.SSS')});
    setTimeout(() => {save(() => {}, 'start_timer').catch(console.error)}, 100);
  }

  // TODO this function should check whether the form has unsaved changes, if it does then we show the modal otherwise dont
  const maybeExit = () => {
    const saveAndExit = () => {
      save(() => resetForm()).catch(console.error);
    }
    const justExit = () => {
      resetForm();
    }
    const onClose = () => showModal(false, false);

    showModal(
      <span>
        <IconContext.Provider value={{ className: "text-danger icon m-2", style: {fontSize: "140%", verticalAlign: "bottom"}}}>
          <span><BsExclamationTriangle/></span>
        </IconContext.Provider>
        Exiting Form.
      </span>,
      "Would you like to save your changes?",
      onClose,
      <span>
        <Button variant="primary" className={'m-2'} onClick={saveAndExit}>Save and Exit</Button>
        <Button variant="danger" className={'m-2'} onClick={justExit}>Discard and Exit</Button>
        <Button variant="secondary" className={'m-2'} onClick={onClose}>Continue Editing</Button>
      </span>);
  }

  const safeDateTransform = (d, before, after) => {
    if (d && !Number.isNaN(+date.parse(d, before))) {
      return date.transform(d, before, after);
    }
    return d;
  }

  const save = async (callback, action) => {
    p();
    const login = await getLogin(action || 'save');
    const toSend = {};
    Object.keys(form).forEach(field => {
      toSend[field] = form[field];
    });
    if (toSend['patient_dob'] && !Number.isNaN(+date.parse(toSend['patient_dob'], "MM/DD/YYYY"))) {
      toSend['patient_dob'] = date.transform(toSend['patient_dob'], "MM/DD/YYYY", "YYYY-MM-DD");
    }
    toSend['patient_dob'] = safeDateTransform(toSend['patient_dob'], "MM/DD/YYYY", "YYYY-MM-DD");
    toSend['patient_symptom_onset'] = safeDateTransform(toSend['patient_symptom_onset'], "MM/DD/YYYY", "YYYY-MM-DD");
    toSend['patient_previous_test_datetime'] = safeDateTransform(toSend['patient_previous_test_datetime'], "MM/YYYY", "YYYY-MM");

    mysql.postFromObj(
      `${rootDir}api/submit`,
      {
        login: {
          ...login,
          patient_site_assigned: statusBarProps.patient_site_assigned_value,
        },
        form: toSend
      },
      (res) => {
        v();
        if (res.recaptchaError) {
          Bugsnag.notify(new Error('recaptcha error'), function (event) {
            event.addMetadata("form", "result", res);
            event.setUser(login.email);
          });
          showModal("Something went wrong.", "Information was not be saved. Please try again.");
        } else if (res.prohibited) {
          showModal(
            "Authentication failed.",
            "You have been logged out. Please login again.",
            () => {},
            <span><Button variant="danger" onClick={() => clearLogin()}>
              Ok
            </Button></span>
          );
          Bugsnag.notify(new Error('save prohibited'), function (event) {
            event.addMetadata("form", "result", res);
            event.setUser(login.email);
          });
        } else if (res.locked) {
          Bugsnag.notify(new Error('kit is locked'), function (event) {
            event.addMetadata("form", "result", res);
            event.setUser(login.email);
          });
          showModal("This form is locked.", "It has been too long since results were submitted.", resetForm);
        } else if (Object.values(res.formError).length === 0) {
          callback(true, res, login);
        } else {
          callback(false, res, login);
          if (!res.gracePeriod) showToast("Progress Saved");
        }
      },
      res => {
        v();
        console.log('Failed: ', res);
        Bugsnag.notify(new Error('database error occurred'), function (event) {
          event.addMetadata("form", "submission", {
            login: {
              email: login.email,
              firebase_token: login.firebase_token,
              patient_site_assigned: statusBarProps.patient_site_assigned_value,
              recaptchaToken: login.recaptchaToken
            },
            form: toSend
          });
          event.setUser(login.email);
        });
        showModal("A Database Error Occured", "Information could not be saved.");
      }
    );
  };

  return (
    <Form noValidate>
      <Switch>
        {form.kit_id ?
          null :
          typeof redirectTo === 'string' ?
            <Redirect push to={'/' + redirectTo}/> :
            <Redirect push to={'/patient'}/>
        }
        <Route exact path={`${path}`}>
          <Redirect to={`${path}/1`}/>
        </Route>
        <Route path={`${path}/dl`}>
          <PageDL
            onScan={(e) => {
              e.barcodes.forEach(barcode => {
                if (barcode.symbology === "pdf417") {
                  scanPdf417(barcode);
                } else if (barcode.symbology === "qr") {
                  scanQr(barcode);
                }
              });
            }}
            p={p}
            v={v}
            url={url}
            loading={loading}
          />
        </Route>
        <Route path={`${path}/:page`}>
          <TopRow
            statusBarProps={statusBarProps}
            loading={loading}
            maybeExit={maybeExit}
            showHelp={showHelp}
            url={url}
            startTimerNow={startTimerNow}
            timer={<FormTimer
              loading={loading}
              start={() => startTimerNow()}
              form={form}
            />}
          />
          <Pages
            selectOptions={selectOptions}
            form={form}
            setForm={setForm}
            loading={loading}
            setPlaceId={setPlaceId}
            resetForm={(page) => {
              setRedirect(page);
              //maybeExit();
              save(() => {resetForm()}, 'save_redirect')
            }}
            showModal={showModal}
            save={save}
            url={url}
          />
          <BottomRow
            loading={loading}
            clearForm={clearForm}
            url={url}
          />
        </Route>
      </Switch>
    </Form>
  );
}
FormPage.propTypes = {
  statusBarProps: PropTypes.object.isRequired,
  getLogin: PropTypes.func.isRequired,
  p: PropTypes.func.isRequired,
  v: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  form: PropTypes.object.isRequired,
  setForm: PropTypes.func.isRequired,
  selectOptions: PropTypes.object.isRequired,
  setPlaceId: PropTypes.func.isRequired,
  clearForm: PropTypes.func.isRequired,
  clearLogin: PropTypes.func.isRequired,
  resetForm: PropTypes.func.isRequired,
  showHelp: PropTypes.func.isRequired,
  showModal: PropTypes.func.isRequired,
  showToast: PropTypes.func.isRequired,
  scanQr: PropTypes.func.isRequired,
  scanPdf417: PropTypes.func.isRequired,
};
