import React, { Component } from 'react';
import PropTypes from "prop-types";
import {CenteredRow} from "../Components/FormGroups";
import {Button, Card, Col, Row} from "react-bootstrap";
import {StatusBar} from "../Components/Misc";
import {DashboardLinks } from "../Components/Dashboard";
import {IconContext} from "react-icons";
import {BsQuestionDiamond} from "react-icons/bs";
import {HistoryHelp} from "../Components/FormHistory";
import config from "../config.js";

export default class AccountPage extends Component {
  constructor(props) {
    super(props);
    this.state = {

    };
  }

  render() {
    const { statusBarProps, loading, firebase, clearLogin } = this.props;

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
      {firebase.auth.currentUser ?
        <Row>
          <Col className={"mb-3"}>
            <Card>
              <Card.Header>
                Account Info
              </Card.Header>
              <Card.Body>
                <Card.Title>{firebase.auth.currentUser.displayName ?? 'no name'}</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">{firebase.auth.currentUser.email ?? 'no email'}</Card.Subtitle>
                {clearLogin !== undefined ? <Button className={'float-right'} onClick={() => clearLogin()}>Logout</Button> : null}
              </Card.Body>
            </Card>
          </Col>
        </Row> : null }
      <Row>
        <Col className={"mb-3"}>
          <Card>
            <Card.Header>
              <Row>
                <Col xs={'auto'} className={'pr-0'}>
                  <IconContext.Provider value={{ className: "text-info icon", style: {fontSize: "1.5rem"} }}>
                    <BsQuestionDiamond/>
                  </IconContext.Provider>
                </Col>
                <Col>
                  <h4 className={'m-0'}>
                    Need help?
                  </h4>
                </Col>
              </Row>
            </Card.Header>
            <Card.Body>
              Send an email to {config.client.localization.support_email} or give us a call at {config.client.localization.support_phone}.
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col className={"mb-3"}>
          <Card>
            <Card.Body>
              <HistoryHelp/>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      {/*<Row>
        <Col className={"mb-3"}>
          <Card>
            <Card.Body>
              Enable Notifications
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col className={"mb-3"}>
          <Card>
            <Card.Body>
            Time before results are ready.
            Time before results are late.
            </Card.Body>
          </Card>
        </Col>
      </Row>*/}
    </CenteredRow>;
  }
}

AccountPage.propTypes = {
  statusBarProps: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
  firebase: PropTypes.object.isRequired,
  clearLogin: PropTypes.func
};
