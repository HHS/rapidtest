import {Button, Col, Row, Form, InputGroup, Card, ButtonGroup} from "react-bootstrap";
import React from "react";
import PropTypes from "prop-types";
import {Link, useLocation} from "react-router-dom";

export function DashboardLinks (props) {
  const location = useLocation();
  return <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
    <ButtonGroup>
      {props.links.map((link, index) => {
        return <Button
          key={index}
          variant={("/" + link === location.pathname ? "" : "outline-") + "dark"}
          disabled={props.loading}
          to={link}
          as={Link}
        >
          {link.slice(0,1).toUpperCase() + link.slice(1).toLowerCase()}
        </Button>
      })}
    </ButtonGroup>
  </div>
}
DashboardLinks.propTypes = {
  loading: PropTypes.bool.isRequired,
  links: PropTypes.array.isRequired
};

export function ScanInstructions () {
  return <Card body>
    <Row>
      <Col>
        Scan the Test Kit to create a new form.
      </Col>
    </Row>
  </Card>;
}

export function PatientScan (props) {
  const onClear = () => {
    props.onClear();
  };

  const enabled = !!props.value;

  return <Card body>
    <Row>
      <Col>
        <InputGroup>
          <InputGroup.Prepend>
            <Button
              variant={enabled ? "danger" : "secondary"}
              onClick={(e) => {
                e.preventDefault();
                onClear();
              }}
              disabled={!enabled}
            >
              Clear Patient
            </Button>
          </InputGroup.Prepend>
          <Form.Control
            type="text"
            value={enabled ? props.value : ''}
            placeholder={'Scan QR or DL'}
            disabled
          />
        </InputGroup>
      </Col>
    </Row>
  </Card>
}
PatientScan.propTypes = {
  onClear: PropTypes.func,
  value: PropTypes.string
};
