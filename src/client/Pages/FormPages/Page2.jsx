import {components} from "react-select";
import {Col, Form, InputGroup, Row} from "react-bootstrap";
import PlacesAutocomplete from "react-places-autocomplete";
import {FormGroupSelect, FormGroupText} from "../../Components/FormGroups";
import PropTypes from "prop-types";
import React from "react";

export function Page2(props) {
  const {form, setForm, selectOptions, setPlaceId} = props;
  const errors = form.errors ?? {};
  const xs = 1;
  const sm = 1;
  const md = 3;

  const SingleValue = props => {
    return <components.SingleValue {...props}>
      {/* eslint-disable-next-line react/prop-types */}
      {props.data.label}
      {/* eslint-disable-next-line react/prop-types */}
      {props.data.state ? <small className="text-muted"> | {props.data.state}</small> : null}
    </components.SingleValue>
  }

  const Option = props => {
    return <components.Option {...props}>
      {/* eslint-disable-next-line react/prop-types */}
      {props.data.label}
      {/* eslint-disable-next-line react/prop-types */}
      {props.data.state ? <small className="text-muted"> | {props.data.state}</small> : null}
    </components.Option>
  }

  return <><Form.Row as={Row} md={md} sm={sm} xs={xs}>
    <PlacesAutocomplete
      value={form.patient_address || ''}
      onChange={(address) => setForm({patient_address: address})}
      onSelect={setPlaceId}
    >
      {({getInputProps, suggestions, getSuggestionItemProps, gloading}) => (
        <Form.Group as={Col} controlId={'patient_address'}>
          <Form.Label>{'Address'}</Form.Label>
          <InputGroup>
            <Form.Control
              required
              type="text"
              isInvalid={!!errors['patient_address']}
              {...getInputProps({
                className: 'location-search-input',
              })}
            />
            <div className="invalid-feedback">
              {"This field is required."}
            </div>
          </InputGroup>
          <div className="autocomplete-dropdown-container">
            {gloading && <div>Loading...</div>}
            {suggestions.map((suggestion) => {
              const className = suggestion.active
                ? 'suggestion-item--active'
                : 'suggestion-item';
              // inline style for demonstration purpose
              const style = suggestion.active
                ? {backgroundColor: '#fafafa', cursor: 'pointer'}
                : {backgroundColor: '#ffffff', cursor: 'pointer'};
              return (
                <div
                  {...getSuggestionItemProps(suggestion, {
                    className,
                    style,
                  })}
                  key={suggestion.placeId}
                >
                  <span>{suggestion.description}</span>
                </div>
              );
            })}
          </div>
        </Form.Group>
      )}
    </PlacesAutocomplete>
    <FormGroupText
      label={'Address Line 2'}
      prop={'patient_address2'}
      errors={errors}
      form={form}
      setForm={setForm}/>
    <FormGroupText
      label={'City'}
      prop={'patient_city'}
      errors={errors}
      form={form}
      setForm={setForm}
      errorMsg={"This field is required."}/>
    <FormGroupSelect
      label={'State'}
      prop={'patient_state'}
      errors={errors}
      form={form}
      setForm={setForm}
      options={selectOptions['patient_state']}
      isSearchable={true}
      errorMsg={"2 letter state e.g. TX for Texas."}/>
    <FormGroupText
      label={'Zip'}
      prop={'patient_zip'}
      errors={errors}
      form={form}
      setForm={setForm}
      errorMsg={"5-digit zip code."}/>
    <FormGroupSelect
      label={'County'}
      prop={'patient_county'}
      errors={errors}
      form={form}
      setForm={setForm}
      options={form.patient_state
        ? selectOptions['patient_county'].filter(county => !county.state || county.state === form.patient_state)
        : selectOptions['patient_county']
      }
      isSearchable={true}
      errorMsg={"Spelling must be exact."}
      components={{SingleValue, Option}}
    />
  </Form.Row>
  </>;
}
Page2.propTypes = {
  form: PropTypes.object.isRequired,
  setForm: PropTypes.func.isRequired,
  selectOptions: PropTypes.object.isRequired,
  setPlaceId: PropTypes.func.isRequired
};