import date from "date-and-time";
const config = require("../config");

// converts various time formats to new Date()
export function convertServerTimeString(dateString) {
  if (!dateString) return null;
  if (!isNaN(dateString)) {
    return new Date(+dateString);// pass through number
  }
  if (typeof dateString === 'string') {
    let d = date.parse(dateString, "YYYY-MM-DD[T]HH:mm:ss.SSS[Z]");
    if (!d || isNaN(+d)) d = date.parse(dateString, "YYYY-MM-DD HH:mm:ss.SSS");
    return d;
  }
  return null;
}

export function getServerTime() {
  let {serverTime, clientTime} = config.client;
  serverTime = convertServerTimeString(serverTime);
  const d = new Date();
  return new Date(+d + (serverTime - clientTime));
}

export function calculateTimeDifference (time, showMs) {
  const now = +getServerTime();
  const difference = +time - now;
  const c = {
    minutes: Math.floor((difference / 1000 / 60)) + (difference < 0 ? 1 : 0),
    seconds: Math.floor((Math.abs(difference) / 1000) % 60),
  };
  const result = {
    sign: c.minutes > 99 ? '> 99' : c.minutes < -99 ? '< -99' : null,
    minutes: (difference > 0 ? c.minutes < 10 ? '0' : '' : '-') + Math.abs(c.minutes).toString(),
    seconds: (c.seconds < 10 ? '0' : '') + c.seconds.toString(),
  };
  if (showMs) {
    const ms = Math.floor(Math.abs(difference) % 1000);
    result.milliseconds = (ms < 100 ? ms < 10 ? '00' : '0' : '') + ms.toString();
  }
  return result;
}

export function displayDifference (difference) {
  return (difference.sign ?? difference.minutes)
    + ":" + difference.seconds
    + (difference.milliseconds ? (':' + difference.milliseconds) : '');
}

export function displayDifferenceFromTime (time, showMs) {
  return displayDifference(calculateTimeDifference(time,showMs));
}
