import React, {useState} from "react";
import {CenteredRow} from "../../Components/FormGroups";
import {Link, Redirect} from "react-router-dom";
import {Button, Card, Col, Row} from "react-bootstrap";
import {Scanner} from "../../Components/Scanner";
import PropTypes from "prop-types";

export function PageDL(props) {
  /* Redirect is a hack atm */
  const [scanned, setScanned] = useState(false);
  const { onScan, p, v, loading, url } = props;
  return <CenteredRow xs={'12'} sm={'12'} md={'10'} lg={'8'}>
    {scanned ? <Redirect to={`/form/1`}/> : null }
    <Row className={'mb-3'}>
      <Col>
        <Button
          variant="secondary"
          disabled={loading}
          as={Link}
          to={`${url}/1`}
        >
          Back
        </Button>
      </Col>
    </Row>
    <Row className={'mb-3'}>
      <Col>
        <Card body>
          <Row>
            <Col>
              {'Scan a QR code or the back your Driver\'s License.'}
            </Col>
          </Row>
        </Card>
      </Col>
    </Row>
    <Row>
      <Col>
        <Scanner
          initiallyOpen={true}
          onScan={(e) => {
            onScan(e);
            setScanned(true);
          }}
          notReady={p}
          onReady={v}
        />
      </Col>
    </Row>
  </CenteredRow>;

}
PageDL.propTypes = {
  onScan: PropTypes.func.isRequired,
  p: PropTypes.func.isRequired,
  v: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  url: PropTypes.string.isRequired,
};