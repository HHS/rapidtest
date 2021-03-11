import {Button, Col, Row, Form, InputGroup, Card} from "react-bootstrap";
import React from "react";
import PropTypes from "prop-types";
import qp from "query-parse";

export function getCueMacFromURL(url) {
  if (!url) return '';
  const split = url.split('?');
  const query = split.length && split.length === 2 ? split[1] : '';
  const obj = qp.toObject(query);
  return obj.address ?? '';
}

export function KitScanAddon (props) {
  const onClear = () => {
    props.onClear();
  };

  const enabled = !!props.value;
  if (!enabled) return null;
  const mac = getCueMacFromURL(props.value);
  if (!mac) return null;
  const value = 'CUE: ' + mac;
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
              Clear Device
            </Button>
          </InputGroup.Prepend>
          <Form.Control
            type="text"
            value={enabled ? value : ''}
            placeholder={''}
            disabled
          />
        </InputGroup>
      </Col>
    </Row>
  </Card>
}
KitScanAddon.propTypes = {
  onClear: PropTypes.func,
  value: PropTypes.string
};
