import React, { Component } from 'react';
import PropTypes from "prop-types";
import {CenteredRow} from "../Components/FormGroups";
import {Col, Row} from "react-bootstrap";
import {StatusBar} from "../Components/Misc";
import {DashboardLinks, PatientScan, ScanInstructions} from "../Components/Dashboard";
import {Scanner} from "../Components/Scanner";
import "../Components/Scanner/style.css"
import {KitScanAddon} from "../Components/KitScanAddon";
import {getPatientName} from "../util/misc";

export default class PatientPage extends Component {
  constructor(props) {
    super(props);
    this.state = {

    };
  }

  render() {
    const {
      statusBarProps,
      loading,
      firebase,
      onScan,
      form,
      resetForm,
      p,
      v,
      kitScanAddon,
      kitScanAddonClear
    } = this.props;


    return <CenteredRow xs={'12'} sm={'12'} md={'10'} lg={'8'}>
      <Row>
        <Col className={"mb-3"}>
          <StatusBar {...statusBarProps}/>
        </Col>
      </Row>
      <Row>
        <Col className={"mb-3"}>
          <DashboardLinks loading={!!loading} links={['patient', 'history', 'account']}/>
        </Col>
      </Row>
      <Row>
        <Col className={"mb-3"}>
          <ScanInstructions/>
        </Col>
      </Row>
      <Row>
        <Col className={"mb-3"}>
          <PatientScan
            onClear={() => resetForm()}
            value={getPatientName(form)}
          />
        </Col>
      </Row>
      {kitScanAddon ? <Row>
        <Col className={"mb-3"}>
          <KitScanAddon
            value={kitScanAddon}
            onClear={() => kitScanAddonClear()}
          />
        </Col>
      </Row> : null}
      <Row>
        <Col className={"mb-3"}>
          { firebase.auth.currentUser ? <Scanner
            initiallyOpen={true}
            onScan={onScan}
            notReady={p}
            onReady={v}
          /> : null }
        </Col>
      </Row>
    </CenteredRow>;
  }
}

PatientPage.propTypes = {
  statusBarProps: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
  firebase: PropTypes.object.isRequired,
  onScan: PropTypes.func.isRequired,
  form: PropTypes.object.isRequired,
  resetForm: PropTypes.func.isRequired,
  p: PropTypes.func.isRequired,
  v: PropTypes.func.isRequired,
  kitScanAddon: PropTypes.string,
  kitScanAddonClear: PropTypes.func,
};
