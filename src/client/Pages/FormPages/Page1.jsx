import {Button, Col, Form, InputGroup, Row} from "react-bootstrap";
import {Link} from "react-router-dom";
import {fieldIsHidden, FormGroupDate, FormGroupSelect, FormGroupText, getAge} from "../../Components/FormGroups";
import PropTypes from "prop-types";
import React from "react";
import HelpIcon from "../../Components/HelpIcon/HelpIcon";
import config from "../../config";

export function Page1(props) {
  const {form, setForm, selectOptions, url} = props;
  const errors = form.errors ?? {};
  const xs = 1;
  const sm = 1;
  const md = 3;

  return <><Form.Row as={Row} md={md} sm={sm} xs={xs}>
    <PersonalIdentifier
      label={'Personal Identifier'}
      tooltop={'Not required. Can be DL number, Student ID, or left blank.'}
      prop={'patient_dl'}
      errors={errors}
      form={form}
      setForm={setForm}
      errorMsg={'Only A-Z and 0-9 characters allowed.'}
      linkTo={`${url}/dl`}>
    </PersonalIdentifier>
    <FormGroupText
      label={'First Name'}
      prop={'patient_first_name'}
      errors={errors}
      form={form}
      setForm={setForm}
      errorMsg={"This field is required."}>
    </FormGroupText>
    <FormGroupText
      label={'Last Name'}
      prop={'patient_last_name'}
      errors={errors}
      form={form}
      setForm={setForm}
      errorMsg={"This field is required."}>
    </FormGroupText>
    <FormGroupDate
      label={'Date of Birth'}
      prop={'patient_dob'}
      errors={errors}
      form={form}
      setForm={obj => {
        const dob = obj['patient_dob'];
        setForm({
          ['patient_dob']: dob,
          ['patient_age']: getAge(dob)
        });
      }}
      mask={'00/00/0000'}
      placeholder={'MM/DD/YYYY'}
    />
    <Form.Group as={Col} controlId={"patient_age"}>
      <Form.Label>{"Age"}</Form.Label>
      <Form.Control
        disabled
        type="text"
        value={form['patient_age'] || ''}
        placeholder={"Calculated automatically"}
      />
    </Form.Group>
    <FormGroupSelect
      label={(((config.client.formOverrides || {}).covid_test || {}).patient_sex || {}).label  || "Sex"}
      prop={'patient_sex'}
      errors={errors}
      form={form}
      setForm={setForm}
      options={selectOptions['patient_sex']}
      errorMsg={"Choose one of the options."}/>
    <FormGroupSelect
      label={'Race'}
      prop={'patient_race'}
      errors={errors}
      form={form}
      setForm={setForm}
      options={selectOptions['patient_race']}
      errorMsg={"Choose one of the options."}/>
    <FormGroupSelect
      label={'Ethnicity'}
      prop={'patient_ethnicity'}
      errors={errors}
      form={form}
      setForm={setForm}
      options={selectOptions['patient_ethnicity']}
      errorMsg={"Choose one of the options."}/>
    <FormGroupText
      label={'Email'}
      prop={'patient_email'}
      errors={errors}
      form={form}
      setForm={setForm}
      errorMsg={"Your email is required."}/>
    <FormGroupText
      type={'tel'}
      label={'Phone'}
      prop={'patient_callback_number'}
      errors={errors}
      form={form}
      setForm={setForm}
      errorMsg={"10-digit phone number with area code."}
      mask={'000-000-0000'}
      placeholder={"000-000-0000"}/>
  </Form.Row>
  </>;
}
Page1.propTypes = {
  form: PropTypes.object.isRequired,
  setForm: PropTypes.func.isRequired,
  selectOptions: PropTypes.object.isRequired,
  url: PropTypes.string.isRequired
};

function PersonalIdentifier(props) {
  const {label, form, setForm, prop, errors, placeholder, linkTo, tooltip} = props;

  if (fieldIsHidden(props.prop, props.form.formName)) { // Don't display hidden field.
    return <Form.Group as={Col}>
      <Form.Label>&nbsp;</Form.Label>
      <InputGroup>
        <Button
          variant="outline-primary"
          as={Link}
          to={linkTo}
          block
        >
          Scan QR or DL
        </Button>
      </InputGroup>
    </Form.Group>;
  }

  return <Form.Group as={Col} controlId={prop}>
    <Form.Label>{label}<HelpIcon tooltip={tooltip}/></Form.Label>
    <InputGroup>
      <Form.Control
        required
        type="text"
        onChange={(e) => setForm(
          {[prop]: e.target.value}
        )}
        value={form[prop] || ''}
        isInvalid={!!errors[prop]}
        placeholder={placeholder}
      />
      <InputGroup.Append>
        <Button
          variant="outline-primary"
          as={Link}
          to={linkTo}
        >
          Scan
        </Button>
      </InputGroup.Append>
      {errors[prop] ? <Form.Control.Feedback type="invalid">
        {props.errorMsg}
      </Form.Control.Feedback> : null}
    </InputGroup>
  </Form.Group>
}
PersonalIdentifier.propTypes = {
  label: PropTypes.string.isRequired,
  form: PropTypes.object.isRequired,
  setForm: PropTypes.func.isRequired,
  prop: PropTypes.string.isRequired,
  errors: PropTypes.object.isRequired,
  placeholder: PropTypes.string,
  errorMsg: PropTypes.string,
  linkTo: PropTypes.string,
  tooltip: PropTypes.string
};
