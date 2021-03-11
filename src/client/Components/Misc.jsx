import React from "react";
import {
  CenteredRow,
} from "./FormGroups";
import {
  Button,
  Card,
  Col,
  Image,
  Row
} from "react-bootstrap";
import PropTypes from "prop-types";
import {appVersion} from "../util/misc";
const config = require("../config");

export function Logo () {
  return <CenteredRow xs={'auto'}><Image className={"m-3"} src={config.logo} width={250}/></CenteredRow>;
}

export function AppVersion () {
  return <Row>
    <Col/>
    <Col xs={"auto"}>
      <div className="text-muted fixed-bottom version-footer">
        {appVersion()}
      </div>
    </Col>
    <Col/>
  </Row>
}

export function StatusBar (props) {
  const {
    ta,
    site,
    cancelText,
    cancel,
    cancelButton,
    loading
  } = props;

  const smallTextStyle = {
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    textAlign: "center",
    width: "100%"
  };

  return <Card body>
    <Row>
      <Col xs={'auto'} md={3}>
        {cancelText ? <Button
          onClick={(e) => {
            e.preventDefault();
            if (typeof cancel === 'function') cancel();
          }}
          variant="secondary"
          disabled={loading}
        >
          {cancelText}
        </Button> : cancelButton ?? null }
      </Col>
      <Col style={smallTextStyle}>
        {ta ?
          <Row>
            <small style={smallTextStyle}>TA: {ta}</small>
          </Row>
          : null }
        {site ?
          <Row>
            <small style={smallTextStyle}>Site: {site}</small>
          </Row>
          : null }
      </Col>
      <Col xs={'auto'} md={3}/>
    </Row>
  </Card>;
}
StatusBar.propTypes = {
  ta: PropTypes.string,
  site: PropTypes.string,
  cancelText: PropTypes.string,
  cancel: PropTypes.func,
  cancelButton: PropTypes.node,
  loading: PropTypes.bool
};