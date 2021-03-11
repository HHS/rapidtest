import {IconContext} from "react-icons";
import {BsCheckCircle, BsExclamationTriangle} from "react-icons/bs";
import {CenteredRow} from "../../Components/FormGroups";
import {Button, Card, Col, Form, Collapse, Row} from "react-bootstrap";
import PropTypes from "prop-types";
import React, {useState} from "react";
import "react-circular-progressbar/dist/styles.css";
import Bugsnag from '@bugsnag/js'
import {timerProperties} from "../../util/form-history";
import {getPatientName} from "../../util/misc";
import date from "date-and-time";
import {convertServerTimeString} from "../../util/time";

export function Page4(props) {
  const {
    form,
    setForm,
    selectOptions,
    loading,
    save,
    resetForm,
    showModal
  } = props;
  const {timerStarted, timerFinished, testSubmitted} = timerProperties(form);
  const startedMessage = "Timer started! Come back later to enter results.";
  const finishedMessage = "Timer finished! Please enter results.";

  return <>

    <Collapse in={timerStarted && !testSubmitted && !timerFinished}>
      <Row>
        <Col className={"mb-3"}>
          <CenteredRow sm={8} md={6} lg={5}>
            <Card body>
              <Form.Row>
                <Col xs={'auto'}>
                  {startedMessage}
                </Col>
              </Form.Row>
            </Card>
          </CenteredRow>
        </Col>
      </Row>
    </Collapse>
    <Collapse in={timerStarted && !testSubmitted && timerFinished}>
      <Row>
        <Col className={"mb-3"}>
          <CenteredRow sm={8} md={6} lg={5}>
            <Card body>
              <Form.Row>
                <Col xs={'auto'}>
                  {finishedMessage}
                </Col>
              </Form.Row>
            </Card>
          </CenteredRow>
        </Col>
      </Row>
    </Collapse>

    <Collapse in={timerStarted}>
      <Row>
        <Col className={"mb-3"}>
          <Links loading={loading} resetForm={resetForm}/>
        </Col>
      </Row>
    </Collapse>
    <Row>
      <Col className={"mb-3"}>
        <SubmitSection
          form={form}
          setForm={setForm}
          selectOptions={selectOptions}
          loading={loading}
          save={save}
          resetForm={resetForm}
          showModal={showModal}
          waitForTimer={!timerFinished && !testSubmitted}
        />
      </Col>
    </Row>
  </>
}
Page4.propTypes = {
  form: PropTypes.object.isRequired,
  setForm: PropTypes.func.isRequired,
  selectOptions: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
  save: PropTypes.func.isRequired,
  resetForm: PropTypes.func.isRequired,
  showModal: PropTypes.func.isRequired,
};

function Links (props) {
  const {loading, resetForm} = props;
  return <CenteredRow sm={8} md={6} lg={5}>
    <Card body>
      <Form.Row>
        <Col>
          <Button
            block
            variant="dark"
            onClick={loading ? null : () => {
              resetForm('patient');
            }}
            disabled={loading}
          >
            New Patient
          </Button>
        </Col>
        <Col>
          <Button
            block
            variant="dark"
            onClick={loading ? null : () => {
              resetForm('history');
            }}
            disabled={loading}
          >
            Test History
          </Button>
        </Col>
      </Form.Row>
    </Card>
  </CenteredRow>
}
Links.propTypes = {
  loading: PropTypes.bool.isRequired,
  resetForm: PropTypes.func.isRequired,
};

const SubmitSection = (props) => {
  const {form, setForm, selectOptions, loading, save, resetForm, showModal, waitForTimer} = props;
  const [skipTimer, setSkip] = useState(false);
  const waiting = waitForTimer && !skipTimer;

  let dob = null;
  if (form.patient_dob) {
    if (!Number.isNaN(+date.parse(form.patient_dob, "MM/DD/YYYY"))) {
      dob = form.patient_dob;
    } else if (!Number.isNaN(+date.parse(form.patient_dob, "YYYY-MM-DD"))) {
      dob = date.format(convertServerTimeString(form.patient_dob), "MM/DD/YYYY");
    }
  }

  const submit = () => {
    const confirmSave = () => {
      save(
        (submitted, res, login) => {
          showModal(
            <span>
              <IconContext.Provider
                value={{className: "text-danger icon m-2", style: {fontSize: "140%", verticalAlign: "bottom"}}}>
                <span><BsExclamationTriangle/></span>
              </IconContext.Provider>
              Submission incomplete.
            </span>,
            "Please check your inputs. Your progress has been saved.");
          setForm({
            errors: res.formError
          });
          Bugsnag.notify(new Error('form submission incomplete'), function (event) {
            event.addMetadata("form", "errors", res.formError);
            event.setUser(login.email);
          });
          if (res.gracePeriod) {
            showModal(<>
              <IconContext.Provider
                value={{className: "text-warning icon m-2", style: {fontSize: "140%", verticalAlign: "bottom"}}}>
                <span><BsExclamationTriangle/></span>
              </IconContext.Provider>
              Submission unsuccessful.
            </>, "Please check your inputs. Results have been submitted previously so no changes have been saved.");
          }
          if (submitted) {
            showModal(<>
              <IconContext.Provider
                value={{className: "text-success icon m-2", style: {fontSize: "140%", verticalAlign: "bottom"}}}>
                <span><BsCheckCircle/></span>
              </IconContext.Provider>
              Submission successful.
            </>, "The patient will receive a text and an email within 2 hours with instructions on how to download their results.", resetForm);
          }
        }, 'submit'
      );
    }

    if (form.patient_positive === 'positive') {
      showModal(
        "Are you sure?",
        <>
          <div>Result: <b>{form.patient_positive.toUpperCase()}</b></div>
          <div>Patient: <b>{form.patient_first_name + ' ' + form.patient_last_name}</b></div>
          <div>DOB: <b>{dob}</b></div>
        </>,
        undefined,
        <span>
          <Button variant="danger" className={'m-2'} onClick={() => showModal(false,false)}>Go back</Button>
          <Button variant="primary" className={'m-2'} onClick={() => {
            confirmSave();
            showModal(false,false);
          }}>Confirm</Button>
        </span>
      );
    } else {
      confirmSave();
    }
  };

  return <CenteredRow sm={8} md={6} lg={5}>
    <Card body>
      <Collapse in={waiting}>
        <Form.Row>
          <Button
            block
            variant="primary"
            className={getPatientName(form) || form.patient_dob ? 'mb-3' : ''}
            onClick={loading ? null : () => {
              setSkip(true);
            }}
            disabled={loading}
          >
            Skip timer and enter results.
          </Button>
        </Form.Row>
      </Collapse>
      {getPatientName(form) ? <Form.Row>
        <Form.Group as={Col}>
          <Form.Label>Patient Name</Form.Label>
          <Form.Control defaultValue={getPatientName(form)} readOnly />
        </Form.Group>
      </Form.Row> : null }
      {dob ? <Form.Row>
        <Form.Group as={Col}>
          <Form.Label>Patient Date of Birth</Form.Label>
          <Form.Control defaultValue={dob} readOnly />
        </Form.Group>
      </Form.Row> : null }
    </Card>
    <Form.Row className={'mb-3'}/>
    <ResultsPage
      form={form}
      setForm={setForm}
      options={selectOptions['patient_positive']}
      loading={loading}
      submit={() => {
        submit();
      }}
      waiting={waiting}/>
  </CenteredRow>
}
SubmitSection.propTypes = {
  form: PropTypes.object.isRequired,
  setForm: PropTypes.func.isRequired,
  selectOptions: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
  save: PropTypes.func.isRequired,
  resetForm: PropTypes.func.isRequired,
  showModal: PropTypes.func.isRequired,
  waitForTimer: PropTypes.bool.isRequired,
};

function ResultsPage (props) {
  const {form, setForm, options, loading, submit, waiting} = props;
  const prop = 'patient_positive';
  const selected = form[prop];
  const mainResults = ['negative', 'positive'];
  const mainOptions = options.filter(opt => mainResults.find(x => opt.value === x));
  const otherOptions = options.filter(opt => !mainResults.find(x => opt.value === x));
  const [show, showMore] = useState(!!otherOptions.find(x => x.value === selected));

  return <>
    {/*<Card body className={'mb-3'}>
      <Form.Row>
        <FormGroupSelect
          label={'Result'}
          prop={prop}
          errors={form.errors ?? {}}
          form={form}
          setForm={setForm}
          options={options}
          errorMsg={"This field is required."}/>
      </Form.Row>
    </Card>*/}
    <Collapse in={!waiting}>
      <div>
        {mainOptions.map(option => <ButtonOption
          key={option.value}
          form={form}
          prop={prop}
          option={option}
          setForm={setForm}/>)}
      </div>
    </Collapse>
    <Collapse in={!show && !waiting}>
      <div><Card body onClick={() => showMore(true)}>Indeterminate? Show more options.</Card></div>
    </Collapse>
    <Form.Row className={'mb-3'}/>
    <Collapse in={show && !waiting}>
      <div>
        <Form.Row className={'mb-3'}/>
        <Form.Row className={'mb-3'}/>
        {otherOptions.map(option => <ButtonOption
          key={option.value}
          form={form}
          prop={prop}
          option={option}
          setForm={setForm}
          size={'sm'}/>)}
        <Form.Row className={'mb-3'}/>
        <Form.Row className={'mb-3'}/>
      </div>
    </Collapse>
    <Collapse in={!waiting}>
      <Form.Row className={'mb-3'}>
        <Col/>
        <Col xs={"auto"}>
          <Button
            variant="primary"
            onClick={loading ? null : () => {
              submit();
            }}
            disabled={loading}
            size={'lg'}
          >
            Submit
          </Button>
        </Col>
      </Form.Row>
    </Collapse>
  </>;
}
ResultsPage.propTypes = {
  form: PropTypes.object.isRequired,
  options: PropTypes.array.isRequired,
  setForm: PropTypes.func.isRequired,
  submit: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  waiting: PropTypes.bool,
};

function ButtonOption (props) {
  const {form, prop, setForm, option} = props;
  const selected = form[prop];
  const small = props.size === 'sm';
  return <Card
    className={'mb-3 text-center'}
    border={selected === option.value ? 'primary' : undefined}
    bg={selected === option.value ? 'light' : undefined}
    text={selected === option.value ? 'primary' : 'dark'}>
    <Card.Body
      className={small ? 'p-1' : ''}
      onClick={() => {
        setForm({[prop]: option.value});
      }}>
      {small ? <h4>{option.label}</h4> : <h1>{option.label.toUpperCase()}</h1> }
    </Card.Body>
  </Card>;
}
ButtonOption.propTypes = {
  form: PropTypes.object.isRequired,
  prop: PropTypes.string.isRequired,
  option: PropTypes.object.isRequired,
  setForm: PropTypes.func.isRequired,
  size: PropTypes.string
};

