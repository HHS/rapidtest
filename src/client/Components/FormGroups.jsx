import React from "react";
import PropTypes from "prop-types";
import {Button, Col, Form, InputGroup, Row} from "react-bootstrap";
import Select from "react-select";
import Datetime from "react-datetime";
import date from "date-and-time";
import {IconContext} from "react-icons";
import {
  BsCalendar,
} from 'react-icons/bs';
import config from "../config.js";
import InputMask from 'react-input-mask';
import "react-datetime/css/react-datetime.css";
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import ToggleButton from 'react-bootstrap/ToggleButton';
import {getServerTime} from "../util/time";

export function isValidDate(d) {
  return d instanceof Date && !isNaN(d);
}

export function isPastDate (d) {
  if (typeof d === "string") d = new Date(d);
  const isPast = date.subtract(d, getServerTime()).toDays() < 0;
  return isValidDate(d) && isPast;
}

function isAfter1900 (d) {
  if (typeof d === "string") d = new Date(d);
  const isAfter1900 = date.subtract(date.parse("1899-12-31", 'YYYY-MM-DD'), d).toDays() < 0;
  return isValidDate(d) && isAfter1900;
}

export function getAge(dob) {
  var today = getServerTime();
  var birthDate = new Date(dob);
  var age = today.getFullYear() - birthDate.getFullYear();
  var m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

export function numberMask (value, pattern) {
  let output = "";
  while (value.length > 0 && pattern.length > 0) {
    const v = value[0];
    const p = pattern[0];
    if (p === '0') {
      if (/^\d$/.test(v)) {
        output += v;
        pattern = pattern.substring(1);
      }
      value = value.substring(1);
    } else {
      output += p;
      pattern = pattern.substring(1);
    }
  }
  return output;
}

export function fieldIsHidden(prop, formName) {
  if (!config.client.formOverrides || !config.client.formOverrides[formName]) return false;
  const formOverrides = config.client.formOverrides[formName];
  return formOverrides[prop] && formOverrides[prop].display == false;
}

export function FormGroupText(props) {

  const onChange = (e) => {
    props.setForm({[props.prop]: e.target.value});
  }
  const value = props.form[props.prop] || '';
  const otherProps = {
    required: true,
    type: props.type || "text",
    isInvalid: !!props.errors[props.prop],
    placeholder: props.placeholder || '',
  }

  return (
    <Form.Group as={Col} controlId={props.prop}>
      <Form.Label>{props.label}</Form.Label>
      {props.mask ?
        <InputMask
          formatChars={{
            '0': '[0-9]',
            'a': '[A-Za-z]',
            '*': '[A-Za-z0-9]'
          }}
          mask={props.mask}
          value={value}
          onChange={onChange}
        >
          {(inputProps) => <Form.Control {...inputProps} {...otherProps}/>}
        </InputMask> :
        <Form.Control {...otherProps} value={value} onChange={onChange}/>}
      {props.errorMsg ? <Form.Control.Feedback type="invalid">
        {props.errorMsg}
      </Form.Control.Feedback> : null}
    </Form.Group>
  );
}

FormGroupText.propTypes = {
  label: PropTypes.string.isRequired,
  form: PropTypes.object.isRequired,
  setForm: PropTypes.func.isRequired,
  prop: PropTypes.string.isRequired,
  errors: PropTypes.object.isRequired,
  placeholder: PropTypes.string,
  mask: PropTypes.string,
  errorMsg: PropTypes.string,
  type: PropTypes.string
};

export function FormGroupSelect(props) {
  const isInvalid = props.errors[props.prop];
  const invalidStyles = {
    control: (base, state) => ({
      ...base,
      // state.isFocused can display different borderColor if you need it
      borderColor: state.isFocused ?
        '#ddd' : isInvalid ?
          'red' : '#ddd',
      // overwrittes hover style
      '&:hover': {
        borderColor: state.isFocused ?
          '#ddd' : isInvalid ?
            'red' : '#ddd',
      }
    })
  };
  const value = props.form[props.prop] && props.options ?
    props.options.find(row => row.value.toString().toLowerCase() === (props.form[props.prop] ?? '').toString().toLowerCase()) :
    null;
  return (
    <Form.Group as={Col} controlId={props.prop}>
      <Form.Label>{props.label}</Form.Label>
      <Select
        custom
        as={Select}
        className={'w-100' + (isInvalid ? ' is-invalid' : '')}
        required
        isClearable

        onChange={(e) => {
          props.setForm(
            {[props.prop]: e ? e.value : ''}
          )
        }}
        value={value}
        placeholder={props.placeholder || ''}

        isSearchable={props.isSearchable || true}
        options={props.options}
        styles={invalidStyles}
        isLoading={props.loading || false}
        components={props.components || undefined}
      />
      {props.errorMsg ? <div className="invalid-feedback">
        {props.errorMsg}
      </div> : null}
    </Form.Group>
  );
}

FormGroupSelect.propTypes = {
  label: PropTypes.string.isRequired,
  form: PropTypes.object.isRequired,
  setForm: PropTypes.func.isRequired,
  prop: PropTypes.string.isRequired,
  errors: PropTypes.object.isRequired,
  placeholder: PropTypes.string,
  isSearchable: PropTypes.bool,
  options: PropTypes.array,
  errorMsg: PropTypes.string,
  loading: PropTypes.bool,
  components: PropTypes.object
};

export function FormGroupYesOrNo(props) {
  const errorMsg = props.errorMsg ?? "You must choose Yes or No.";
  const value = parseInt(props.form[props.prop]) ?? -1;
  const isInvalid = !!props.errors[props.prop];
  const options = [{
    value: -1,
    label: 'N/A',
    variant: 'secondary'
  }, {
    value: 0,
    label: 'No',
    variant: 'dark'
  }, {
    value: 1,
    label: 'Yes',
    variant: 'info'
  }];

  if (props.hidden) { // Don't display hidden field.
    return null;
  }
  const variant = (options.find(opt => opt.value === value) ?? options[0]).variant;

  return (
    <div className={'mb-3'} style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      <Form.Label>{props.label}</Form.Label>
      <ButtonGroup
        toggle
        className={(isInvalid ? ' is-invalid' : '')}
      >
        {options.map((radio, idx) => {
          const outline = value !== radio.value ? 'outline-' : '';
          return <ToggleButton
            key={idx}
            size={'md'}
            type="radio"
            variant={outline + variant}
            name="radio"
            value={radio.value}
            checked={value === radio.value}
            onChange={() => props.setForm(
              {[props.prop]: radio.value}
            )}>
            {radio.label}
          </ToggleButton>;
        })}
      </ButtonGroup>
      <div className="invalid-feedback">
        {errorMsg}
      </div>
    </div>
  );
}

FormGroupYesOrNo.propTypes = {
  label: PropTypes.string.isRequired,
  form: PropTypes.object.isRequired,
  setForm: PropTypes.func.isRequired,
  prop: PropTypes.string.isRequired,
  errors: PropTypes.object.isRequired,
  errorMsg: PropTypes.string,
  hidden: PropTypes.bool
};

export function FormGroupRadioButtons(props) {
  const errorMsg = props.errorMsg ?? "Must choose at least one";
  const isInvalid = !!props.errors[props.prop];
  const options = props.options ?? [{
    value: -1,
    variant: 'secondary',
    default: true,
    hidden: true
  },{
    value: 0,
    label: 'No',
    variant: 'dark'
  }, {
    value: 1,
    label: 'Yes',
    variant: 'info'
  }];

  if (fieldIsHidden(props.prop, props.form.formName)) { // Don't display hidden field.
    return null;
  }
  const defaultOption = options.find(opt => opt.default === true) ?? options[0];
  const value = parseInt(props.form[props.prop]) ?? defaultOption.value;
  const variant = (options.find(opt => opt.value === value) ?? defaultOption).variant;

  return (
    <div className={'mb-3'} style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      <Form.Label>{props.label}</Form.Label>
      <ButtonGroup
        toggle
        className={(isInvalid ? ' is-invalid' : '')}
      >
        {options.map((radio, idx) => {
          const outline = value !== radio.value ? 'outline-' : '';
          if (radio.hidden) return null;
          return <ToggleButton
            key={idx}
            size={'md'}
            type="radio"
            variant={outline + variant}
            name="radio"
            value={radio.value}
            checked={value === radio.value}
            onChange={() => props.setForm(
              {[props.prop]: radio.value}
            )}>
            {radio.label}
          </ToggleButton>;
        })}
      </ButtonGroup>
      <div className="invalid-feedback">
        {errorMsg}
      </div>
    </div>
  );
}
FormGroupRadioButtons.propTypes = {
  label: PropTypes.string.isRequired,
  form: PropTypes.object.isRequired,
  setForm: PropTypes.func.isRequired,
  prop: PropTypes.string.isRequired,
  errors: PropTypes.object.isRequired,
  errorMsg: PropTypes.string,
  options: PropTypes.array
};

export function FormGroupDateTime(props) {
  const isInvalid = !!props.errors[props.prop];
  let errorMsg = "Format must be YYYY-MM-DD.";
  if (isInvalid && date.isValid(props.form[props.prop] ?? '', 'YYYY-MM-DD') && !isPastDate(props.form[props.prop])) errorMsg = "Future dates not allowed.";
  return (
    <Form.Group as={Col} controlId={props.prop}>
      <Form.Label>{props.label}</Form.Label>
      <Datetime
        initialViewMode={props.initialViewMode || 'days'}
        className={(isInvalid ? ' is-invalid' : '')}
        style={{width: "auto"}}
        onChange={(e) => {
          if (e) {
            let v;
            if (typeof e !== "string") v = e.format("YYYY-MM-DD") ?? null;
            else v = e;
            props.setForm({[props.prop]: numberMask(v, "0000-00-00")});
          }
        }}
        isInvalid={isInvalid}
        value={props.form[props.prop] || ''}
        dateFormat={"YYYY-MM-DD"}
        timeFormat={false}
        isValidDate={(d) => d < getServerTime()}
        placeholder={props.placeholder || 'YYYY-MM-DD'}
        renderInput={ (propsInput, openCalendar) => {
          return <InputGroup
            className={"w-100" + (isInvalid ? ' is-invalid' : '')}
          >
            <Form.Control
              {...propsInput}
              type="text"
              autoComplete="off"
              placeholder={props.placeholder || 'YYYY-MM-DD'}
              //onClick={() => props.setForm({[props.prop]: date.format(getServerTime, "YYYY-MM-DD")})}
            />
            <InputGroup.Append>
              <Button
                variant="outline-primary"
                onClick={() => {
                  openCalendar();
                  props.setForm({[props.prop]: date.format(getServerTime(), "YYYY-MM-DD")});
                }}>
                <IconContext.Provider value={{ className: "icon" }}>
                  <span><BsCalendar/></span>
                </IconContext.Provider>
              </Button>
            </InputGroup.Append>
          </InputGroup>;
        }}
      />
      <Form.Control.Feedback type="invalid">
        {errorMsg}
      </Form.Control.Feedback>
    </Form.Group>
  );
}

FormGroupDateTime.propTypes = {
  label: PropTypes.string.isRequired,
  form: PropTypes.object.isRequired,
  setForm: PropTypes.func.isRequired,
  prop: PropTypes.string.isRequired,
  errors: PropTypes.object.isRequired,
  placeholder: PropTypes.string,
  errorMsg: PropTypes.string,
  initialViewMode: PropTypes.string, // https://www.npmjs.com/package/react-datetime
};

export function FormGroupDate(props) {
  const isInvalid = !!props.errors[props.prop];
  const defaultFormat = "YYYY-MM-DD";
  const format = (props.placeholder || defaultFormat);
  let errorMsg = "Format must be " + format;

  let value = props.form[props.prop] || '';
  if (format !== defaultFormat && !Number.isNaN(+date.parse(value, defaultFormat))) {
    value = date.transform(value, defaultFormat, format);
  }

  if (isInvalid && date.isValid(props.form[props.prop] ?? '', format))
    if (!isPastDate(date.parse(props.form[props.prop] ?? '', format)))
      errorMsg = "Future dates not allowed.";
    else if (!isAfter1900(date.parse(props.form[props.prop] ?? '', format)))
      errorMsg = "Dates before 1900 are not allowed.";
  return (
    <Form.Group as={Col} controlId={props.prop}>
      <Form.Label>{props.label}</Form.Label>
      <InputGroup
        className={"w-100" + (isInvalid ? ' is-invalid' : '')}
      >
        <InputMask
          formatChars={{
            '0': '[0-9]'
          }}
          mask={props.mask || "0000-00-00"}
          value={value}
          onChange={(e) => {
            if (e) {
              let v = e ? e.target.value : '';
              //if (typeof v === "string") v = numberMask(v, props.mask || "0000-00-00");
              props.setForm({[props.prop]: v });
            }
          }}
        >
          {(inputProps) => <Form.Control
            /*onChange={(e) => {
              if (e) {
                let v = e ? e.target.value : '';
                if (typeof v === "string") v = numberMask(v, props.mask || "0000-00-00");
                props.setForm({[props.prop]: v });
              }
            }}
            value={value}*/
            {...inputProps}
            isInvalid={isInvalid}
            type="tel"
            autoComplete="off"
            placeholder={format}
          />}
        </InputMask>
      </InputGroup>
      <Form.Control.Feedback type="invalid">
        {errorMsg}
      </Form.Control.Feedback>
    </Form.Group>
  );
}

FormGroupDate.propTypes = {
  label: PropTypes.string.isRequired,
  form: PropTypes.object.isRequired,
  setForm: PropTypes.func.isRequired,
  prop: PropTypes.string.isRequired,
  errors: PropTypes.object.isRequired,
  placeholder: PropTypes.string,
  mask: PropTypes.string,
  errorMsg: PropTypes.string,
};

export function CenteredRow (props) {
  return <Row>
    <Col className={"p-0"}/>
    <Col {...props}/>
    <Col className={"p-0"}/>
  </Row>
}

CenteredRow.propTypes = {
  children: PropTypes.node.isRequired,
  lg: PropTypes.any,
  md: PropTypes.any,
  sm: PropTypes.any,
  xl: PropTypes.any,
  xs: PropTypes.any
};
