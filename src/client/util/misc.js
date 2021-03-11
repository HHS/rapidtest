export function appVersion () {
  return process.env.docker_env + ":" + process.env.docker_sha;
}

export function copyThenApplyObj (form, obj, prop) {
  const output = {};
  Object.keys(form).forEach(k => output[k] = form[k]);
  if (typeof prop == 'string') {
    Object.keys(obj).forEach(k => output[prop][k] = obj[k]);
  } else {
    Object.keys(obj).forEach(k => output[k] = obj[k]);
  }
  return output;
}

export function getPatientName (form) {
  const last_name = form.patient_last_name ? form.patient_last_name.toUpperCase() + ', ' : '';
  const first_name = form.patient_first_name ? form.patient_first_name.toUpperCase() : '';
  return last_name + first_name;
}
