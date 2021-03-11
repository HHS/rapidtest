import {
  CenteredRow,
  FormGroupDate,
  FormGroupSelect,
  FormGroupRadioButtons
} from "../../Components/FormGroups";
import {Card, Collapse, Form, Row} from "react-bootstrap";
import PropTypes from "prop-types";
import React from "react";

export function Page3 (props) {
  const {form, setForm, selectOptions} = props;
  const errors = form.errors ?? {};
  return <>
    <CenteredRow xs={12} sm={10} md={6}>
      <Form.Row>
        <FormGroupRadioButtons
          label={'Is this the first test (of any kind) the patient has had for COVID-19?'}
          prop={'ctrl_first'}
          errors={errors}
          form={form}
          setForm={setForm}/>
      </Form.Row>
    </CenteredRow>

    <CenteredRow xs={12} sm={10} md={6}>
      <Collapse in={form['ctrl_first'] === 0}>
        <Card body style={{marginBottom: "1rem"}}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <FormGroupSelect
              label={'IF NO, what type of test have you had before?'}
              prop={'patient_previous_test'}
              errors={errors}
              form={form}
              setForm={setForm}
              options={selectOptions['patient_previous_test']}
              errorMsg={"Please select one."}/>
            <FormGroupDate
              label={'IF NO, what is the date of the last test?'}
              prop={'patient_previous_test_datetime'}
              errors={errors}
              form={form}
              setForm={setForm}
              mask={'00/0000'}
              placeholder={'MM/YYYY'}/>
          </div>
        </Card>
      </Collapse>
    </CenteredRow>

    <CenteredRow xs={12} sm={10} md={6}>
      <Form.Row as={Row}>
        <FormGroupRadioButtons
          label={'Is the patient employed in healthcare with direct patient contact?'}
          prop={'patient_hcw'}
          errors={errors}
          form={form}
          setForm={setForm}/>
      </Form.Row>
    </CenteredRow>

    <CenteredRow xs={12} sm={10} md={6}>
      <Form.Row as={Row}>
        <FormGroupRadioButtons
          label={'Is the patient symptomatic?'}
          prop={'ctrl_symp'}
          errors={errors}
          form={form}
          setForm={setForm}/>
      </Form.Row>
    </CenteredRow>

    <CenteredRow xs={12} sm={10} md={6}>
      <Collapse in={form['ctrl_symp'] === 1}>
        <Card body style={{marginBottom: "1rem"}}>
          <div>
            <FormGroupDate
              label={'IF YES, date symptom onset?'}
              prop={'patient_symptom_onset'}
              errors={errors}
              form={form}
              setForm={setForm}
              mask={'00/00/0000'}
              placeholder={'MM/DD/YYYY'}
            />
            <FormGroupRadioButtons
              label={'Fever over 100.4F?'}
              prop={'qual_temperature'}
              errors={errors}
              form={form}
              setForm={setForm}/>
            <FormGroupRadioButtons
              label={'Feeling feverish?'}
              prop={'qual_fever'}
              errors={errors}
              form={form}
              setForm={setForm}/>
            <FormGroupRadioButtons
              label={'Chills?'}
              prop={'qual_chills'}
              errors={errors}
              form={form}
              setForm={setForm}/>
            <FormGroupRadioButtons
              label={'Cough?'}
              prop={'qual_cough'}
              errors={errors}
              form={form}
              setForm={setForm}/>
            <FormGroupRadioButtons
              label={'Shortness of breath?'}
              prop={'qual_short_breath'}
              errors={errors}
              form={form}
              setForm={setForm}/>
            <FormGroupRadioButtons
              label={'Difficulty breathing?'}
              prop={'qual_diff_breath'}
              errors={errors}
              form={form}
              setForm={setForm}/>
            <FormGroupRadioButtons
              label={'Fatigue?'}
              prop={'qual_fatigue'}
              errors={errors}
              form={form}
              setForm={setForm}/>
            <FormGroupRadioButtons
              label={'Muscle or body aches?'}
              prop={'qual_body_ache'}
              errors={errors}
              form={form}
              setForm={setForm}/>
            <FormGroupRadioButtons
              label={'Headache?'}
              prop={'qual_headache'}
              errors={errors}
              form={form}
              setForm={setForm}/>
            <FormGroupRadioButtons
              label={'New loss of taste?'}
              prop={'qual_loss_taste'}
              errors={errors}
              form={form}
              setForm={setForm}/>
            <FormGroupRadioButtons
              label={'New loss of smell?'}
              prop={'qual_loss_smell'}
              errors={errors}
              form={form}
              setForm={setForm}/>
            <FormGroupRadioButtons
              label={'Sore throat?'}
              prop={'qual_sore_throat'}
              errors={errors}
              form={form}
              setForm={setForm}/>
            <FormGroupRadioButtons
              label={'Nasal congestion?'}
              prop={'qual_nasal_congestion'}
              errors={errors}
              form={form}
              setForm={setForm}/>
            <FormGroupRadioButtons
              label={'Runny nose?'}
              prop={'qual_nose'}
              errors={errors}
              form={form}
              setForm={setForm}/>
            <FormGroupRadioButtons
              label={'Nausea?'}
              prop={'qual_nausea'}
              errors={errors}
              form={form}
              setForm={setForm}/>
            <FormGroupRadioButtons
              label={'Vomiting?'}
              prop={'qual_vomit'}
              errors={errors}
              form={form}
              setForm={setForm}/>
            <FormGroupRadioButtons
              label={'Diarrhea?'}
              prop={'qual_diarrhea'}
              errors={errors}
              form={form}
              setForm={setForm}/>
          </div>
        </Card>
      </Collapse>
    </CenteredRow>

    {form['patient_sex'] !== 'male' ?
      <CenteredRow xs={12} sm={10} md={6}>
        <Form.Row as={Row}>
          <FormGroupRadioButtons
            label={'Is the patient pregnant?'}
            prop={'patient_pregnant'}
            errors={errors}
            form={form}
            setForm={setForm}/>
        </Form.Row>
      </CenteredRow> : null
    }
  </>;
}
Page3.propTypes = {
  form: PropTypes.object.isRequired,
  setForm: PropTypes.func.isRequired,
  selectOptions: PropTypes.object.isRequired,
};