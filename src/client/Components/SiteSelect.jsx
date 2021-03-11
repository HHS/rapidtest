import React, {useState} from "react";
import {
  Button,
  Card,
  Col,
  Form, ListGroup,
  Row,
  Spinner
} from "react-bootstrap";
import AsyncSelect from "react-select/async/dist/react-select.esm";
import PropTypes from "prop-types";
import {
  CenteredRow,
  FormGroupSelect
} from "./FormGroups";

export function SiteSelect (props) {
  const [siteType, setSiteType] = useState({});
  const {
    siteSelected,
    onSiteSelected,
    onSiteType,
    selectOptions,
    loadSites,
    loading,
    noOptionsMessage,
    onSubmit
  } = props;

  const handleSubmit = () => {
    onSubmit();
  }

  return <Card body>
    <Form
      noValidate
      onSubmit={(e) => { e.preventDefault(); handleSubmit();}}
    >
      <Row>
        <FormGroupSelect
          label={'Site Type:'}
          prop={'site_type'}
          form={{site_type: siteType}}
          errors={{}}
          setForm={e => {setSiteType(e.site_type); onSiteType(e.site_type)}}
          options={selectOptions['site_type']}
          errorMsg={"Please select one."}
          loading={loading}/>
      </Row>
      <Row>
        <FormGroupAsyncSelect
          label={'Site Assigned'}
          prop={'patient_site_assigned'}
          error={false}
          form={{patient_site_assigned: siteSelected}}
          setForm={(e) => onSiteSelected(e.patient_site_assigned)}
          errorMsg={"Please select one."}
          loadSites={loadSites}
          noOptionsMessage={noOptionsMessage}
          loading={loading}
        />
      </Row>
      {siteSelected ?
        <CenteredRow xs={'auto'} className={'mb-3'}>
          <small>{
            siteSelected['street'] + ' ' + siteSelected['city'] + ' ' +
            siteSelected['state'] + ', ' + siteSelected['zip']
          }</small>
        </CenteredRow> : null
      }
      <Button
        className={"float-right"}
        type="submit"
        variant="primary"
        disabled={loading}
      >
        Select Site
      </Button>
    </Form>
  </Card>;
}
SiteSelect.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  siteSelected: PropTypes.any,
  onSiteSelected: PropTypes.func.isRequired,
  onSiteType: PropTypes.func.isRequired,
  loadSites: PropTypes.func.isRequired,
  selectOptions: PropTypes.object.isRequired,
  loading: PropTypes.bool,
  noOptionsMessage: PropTypes.string
};

export function SitePrevious (props) {
  const {
    onSiteSelected,
    sitesSaved,
    loading
  } = props;

  return <React.Fragment>
    {sitesSaved.length > 0 ?
      <Card>
        <Card.Header>Previously Visited Sites</Card.Header>
        <ListGroup variant="flush" style={{borderBottomLeftRadius: "0.75rem", borderBottomRightRadius: "0.75rem"}}>
          {sitesSaved.map((obj, index) => {
            return (
              <ListGroup.Item
                key={index}
                action
                onClick={() => onSiteSelected(obj)}
              >
                {obj.label}
              </ListGroup.Item>
            );
          })}
        </ListGroup>
      </Card> : loading ? <Card>
        <Card.Header>Previously Visited Sites</Card.Header>
        <Spinner className={"m-3"} as="span" animation="border" variant="secondary"/>
      </Card> : null }
  </React.Fragment>;
}
SitePrevious.propTypes = {
  onSiteSelected: PropTypes.func.isRequired,
  sitesSaved: PropTypes.array.isRequired,
  loading: PropTypes.bool
};

function FormGroupAsyncSelect (props) {
  const [inputValue, setInputValue] = useState('');
  const value = props.form[props.prop] ? props.form[props.prop] : null;
  const isInvalid = props.error && !value;
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
  return (
    <Form.Group as={Col} controlId={props.prop}>
      <Form.Label>{props.label}</Form.Label>
      <AsyncSelect
        custom
        as={AsyncSelect}
        className={'w-100' + (isInvalid ? ' is-invalid' : '')}
        required
        isClearable
        loadOptions={props.loadSites}
        onInputChange={e => setInputValue(e)}
        //cacheOptions
        inputValue={inputValue}
        noOptionsMessage={() => inputValue ? props.noOptionsMessage : "Start typing..."}

        onChange={(e) => {
          props.setForm(
            {[props.prop]: e ? e : ''}
          )
        }}
        value={value || inputValue}
        placeholder={props.placeholder || ''}

        styles={invalidStyles}
        isLoading={props.loading || false}
      />
      {props.errorMsg ? <div className="invalid-feedback">
        {props.errorMsg}
      </div> : null}
    </Form.Group>
  );
}
FormGroupAsyncSelect.propTypes = {
  prop: PropTypes.string.isRequired,
  form: PropTypes.object.isRequired,
  setForm: PropTypes.func.isRequired,
  error: PropTypes.bool,
  loading: PropTypes.bool.isRequired,
  loadSites: PropTypes.func.isRequired,
  label: PropTypes.string,
  noOptionsMessage: PropTypes.string,
  placeholder: PropTypes.string,
  errorMsg: PropTypes.string
};