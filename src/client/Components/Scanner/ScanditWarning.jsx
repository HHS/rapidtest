import {Card, Col, Row} from "react-bootstrap";
import React, {useEffect, useState} from "react";
import {hasFailed, isEnabled} from './dynamicImport';
const config = require("../../config");

export function ScanditWarning () {
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const interval = setInterval(() => {
      if (hasFailed() || isEnabled()) {
        setFailed(hasFailed());
        clearInterval(interval);
      }
    }, 300);
    return () => clearInterval(interval);
  });

  if (failed) return <Card body className={'mb-2'}>
    <Row>
      <Col>
        Scanner Module failed to load.
        You may need to enable cookies.
        {" Rapid Test helpdesk - " + config.client.localization.support_email}
      </Col>
    </Row>
  </Card>;

  return null;
}
