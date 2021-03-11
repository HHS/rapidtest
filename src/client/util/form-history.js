import {convertServerTimeString, displayDifferenceFromTime, getServerTime} from "./time";

export function calcHistoryTimeAndVariant (item) {
  if (typeof item === 'undefined') item = {};
  const cookTime = 15; // how long test take to get results from when they started in minutes
  const waitTime = 15; // how long results are valid after they are ready in minutes after this they are LATE
  const minToMs = 60000;
  const patient_appt_datetime = convertServerTimeString(item.patient_appt_datetime);
  const patient_test_started = convertServerTimeString(item.patient_test_started);
  const patient_results = convertServerTimeString(item.patient_results);
  const kit_access_expired = convertServerTimeString(item.kit_access_expired);
  const now = +getServerTime();
  let _variant = "";
  let _time = +patient_appt_datetime;
  if (!+patient_test_started) {
    _variant = "dark";
  } else if (!+patient_results) {
    _time = +patient_test_started + minToMs * cookTime;
    if (now < _time) {
      _variant = "primary";
    } else {
      _time = +patient_test_started + minToMs * (cookTime + waitTime);
      _variant = "warning";
      if (now > _time) {
        _variant = "danger";
      }
    }
  }

  if (+patient_results) {
    _variant = "success";
    if (+kit_access_expired) {
      _time = +kit_access_expired;
      if (+kit_access_expired < now) {
        _variant = "secondary";
      }
    }
  }
  return {
    variant: _variant,
    time: _time,
    timerStarted: !!patient_test_started,
    timerFinished: _variant === 'warning' || _variant === 'danger',
    testSubmitted: !!patient_results,
  };
}

export function sortFormHistory (first, second) {
  const sortedBy = ['dark', 'primary', 'warning', 'danger', 'success', 'secondary'];
  const firstVariant = calcHistoryTimeAndVariant(first);
  const secondVariant = calcHistoryTimeAndVariant(second);

  if (firstVariant.variant === secondVariant.variant) {
    return secondVariant.time - firstVariant.time; // later is first
  } else {
    const firstIdx = sortedBy.findIndex(v => v === firstVariant.variant);
    const secondIdx = sortedBy.findIndex(v => v === secondVariant.variant);
    return firstIdx - secondIdx; // lower is first
  }
}

export function timerProperties (item) {
  const p = calcHistoryTimeAndVariant(item);
  return {
    ...p,
    difference: displayDifferenceFromTime(p.time, false)
  }
}
