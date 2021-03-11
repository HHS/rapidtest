import React, {useEffect, useState} from "react";
import {calcHistoryTimeAndVariant, timerProperties} from "../util/form-history";
import {
  BsAlarm,
  BsCheck,
  BsClockHistory,
  BsDash,
  BsExclamationCircle,
  BsLock,
  BsQuestionDiamond,
} from "react-icons/bs";
import {Button, Card, Col, Collapse, Form, InputGroup, Row} from "react-bootstrap";
import {IconContext} from "react-icons";
import PropTypes from "prop-types";
import LazyLoad from 'react-lazyload';
import {calculateTimeDifference, convertServerTimeString, displayDifference, getServerTime} from "../util/time";
import date from 'date-and-time';
import {getPatientName} from "../util/misc";

export function Icon (props) {
  switch (props.variant) {
  case "dark": return <BsDash/>;
  case "primary": return <BsClockHistory/>;
  case "warning": return <BsExclamationCircle/>;
  case "danger": return <BsAlarm/>;
  case "success": return <BsCheck/>;
  case "secondary": return <BsLock/>
  default: return <BsQuestionDiamond/>;
  }
}
Icon.propTypes = {
  variant: PropTypes.string.isRequired, // in ms
};

/* Calls onEffect with (time - now) in MM:SS format  */
function TimeDifference (props) {
  const { time, onEffect, showMs } = props;
  const [difference, setDifference] = useState(calculateTimeDifference(time, showMs));
  useEffect(() => {
    let isMounted = true;
    if (typeof onEffect !== 'undefined') onEffect(displayDifference(difference));
    const timer = setTimeout(() => {
      if (isMounted) {
        setDifference(calculateTimeDifference(time, showMs));
        if (typeof onEffect !== 'undefined') onEffect(displayDifference(difference));
      }
    }, 300);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    }
  }, [difference]);

  return null;
}
TimeDifference.propTypes = {
  time: PropTypes.number.isRequired, // in ms
  onEffect: PropTypes.func,
  showMs: PropTypes.bool
};

export function HistoryItemTimeAndVariant (props) {
  const {item, onTimer} = props;
  const [time, setTime] = useState(calcHistoryTimeAndVariant(item).time);
  const _onEffect = (difference) => {
    const obj = calcHistoryTimeAndVariant(item);
    setTime(obj.time);
    onTimer({...obj,difference});
  }
  return <TimeDifference time={time} onEffect={_onEffect}/>
}
HistoryItemTimeAndVariant.propTypes = {
  item: PropTypes.object,
  onTimer: PropTypes.func
};

export function HistoryScan (props) {
  const item = props.item;

  const timer = timerProperties(item);
  const [time, setTime] = useState(timer.time);
  const [variant, setVariant] = useState(timer.variant);
  const [difference, setDifference] = useState(timer.difference);
  const onTimer = (obj) => {
    setTime(obj.time);
    setVariant(obj.variant);
    setDifference(obj.difference);
  }

  const onEdit = () => {
    if (props.onEdit) props.onEdit();
  };

  const name = getPatientName(item) || 'No Name';
  const dob = item.patient_dob ? "DOB: " + date.format(convertServerTimeString(item.patient_dob), "MM/DD/YYYY") : '';

  return <Card onClick={() => onEdit()}>
    <Card.Body className={'pt-3 pb-1'}>
      <Form.Row>
        {time ? <LazyLoad height={10} offset={0} once={false} unmountIfInvisible={true}>
          <HistoryItemTimeAndVariant item={item} onTimer={onTimer}/>
        </LazyLoad> : null}
        <Col xs={'2'}>
          <Form.Row>
            <IconContext.Provider
              value={{ className: "icon text-" + variant, style: {fontSize: "230%", verticalAlign: "top"}}}
            >
              <span><Icon variant={variant}/></span>
            </IconContext.Provider>
          </Form.Row>
          <Form.Row><small>{difference || '--:--'}</small></Form.Row>
        </Col>
        <Col>
          <Form.Row><h5>{name}</h5></Form.Row>
          <Form.Row>{dob}</Form.Row>
        </Col>
        <Col xs={'auto'}>
          <Button
            variant="primary"
            disabled={!props.item}
          >
            Edit
          </Button>
        </Col>
      </Form.Row>
    </Card.Body>
  </Card>
}
HistoryScan.propTypes = {
  onEdit: PropTypes.func,
  item: PropTypes.object
};

export function FormTimer (props) {
  const {loading, form} = props;

  const start = () => {
    props.start();
  };

  const timer = timerProperties(form);
  const [variant, setVariant] = useState(timer.variant);
  const [difference, setDifference] = useState(timer.difference);
  const [timerStarted, setTimerStarted] = useState(timer.timerStarted);
  const onTimer = (obj) => {
    setVariant(obj.variant);
    setDifference(obj.difference);
    setTimerStarted(obj.timerStarted);
    if (props.onTimer) props.onTimer(obj);
  }
  useEffect(() => {
    onTimer(timerProperties(form));
  }, [form]);

  return <>
    <Collapse in={!timerStarted}>
      <Form.Row>
        <Col xs={'auto'}>
          <Button
            block
            variant="primary"
            onClick={loading ? null : () => {
              start();
            }}
            disabled={loading || timerStarted}
          >
            Start Timer
          </Button>
        </Col>
      </Form.Row>
    </Collapse>
    <Collapse in={form && timerStarted}>
      <Form.Row>
        <Col xs={'auto'}>
          {timerStarted ? <HistoryItemTimeAndVariant item={form} onTimer={onTimer}/> : null}
          <IconContext.Provider value={{ className: "icon text-" + variant, style: {fontSize: "170%", verticalAlign: "top"}}}>
            <span><Icon variant={variant}/></span>
          </IconContext.Provider>
        </Col>
        <Col>
          {difference ?? ''}
        </Col>
      </Form.Row>
    </Collapse>
  </>
}
FormTimer.propTypes = {
  loading: PropTypes.bool,
  start: PropTypes.func,
  form: PropTypes.object,
  onTimer: PropTypes.func,
};

export function HistoryHelp () {
  const now = +getServerTime();
  const minToMs = 60000;
  const item = {
    started: {patient_test_started: now},
    ended: {patient_test_started: now - 15 * minToMs},
    late: {patient_test_started: now - 30 * minToMs},
    complete: {patient_results: now, kit_access_expired: now + 60 * minToMs},
    locked: {patient_results: now, kit_access_expired: now}
  }
  Object.keys(item).forEach((k) => {item[k].patient_last_name = "Doe"; item[k].patient_first_name = "John"});

  return <>
    <h4>Timer icons</h4>
    Test has been administered to patient.
    <HistoryScan item={item.started}/><br/>
    Result is ready to be read and is most accurate.
    <HistoryScan item={item.ended}/><br/>
    Result is ready to be read but may not be accurate.
    <HistoryScan item={item.late}/><br/>
    Result is submitted but can be changed.
    <HistoryScan item={item.complete}/><br/>
    Result cannot be changed and will be sent to the patient.
    <HistoryScan item={item.locked}/>
  </>;
}
