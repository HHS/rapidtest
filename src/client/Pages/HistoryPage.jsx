import React, {useEffect} from 'react';
import PropTypes from "prop-types";
import {CenteredRow} from "../Components/FormGroups";
import {Col, Row, Spinner} from "react-bootstrap";
import {StatusBar} from "../Components/Misc";
import {DashboardLinks} from "../Components/Dashboard";
import {HistoryScan} from "../Components/FormHistory"
import LazyLoad from 'react-lazyload';
import {sortFormHistory} from "../util/form-history";

export function HistoryNotifications (props) {
  const {loading, loadHistory, historyIncomplete} = props;
  const reloadTime = 30; // in seconds

  useEffect(() => {
    loadHistory(0);
    const interval = setInterval(() => {
      loadHistory(0);
    }, reloadTime * 1000);
    return () => clearInterval(interval);
  }, []);

  return null;
}
HistoryNotifications.propTypes = {
  loadHistory: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  historyIncomplete: PropTypes.object.isRequired
};

export function HistoryPage (props) {
  const {statusBarProps, loading, loadHistory, loadForm, historyIncomplete, historyComplete} = props;
  const history = {...historyIncomplete, ...historyComplete};

  useEffect(() => {
    loadHistory(true, 0);
  }, []);

  const historyKeys = Object.keys(history).sort((k1, k2) => {
    const first = history[k1];
    const second = history[k2];
    return sortFormHistory(first, second);
  });

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
    {historyKeys.map((key) => {
      return <Row key={key}>
        <Col className={"mb-3"}>
          <HistoryScan
            value={key}
            item={history[key]}
            onEdit={() => loadForm(key)}
          />
        </Col>
      </Row>
    })}
    <Row>
      <Col className={"mb-3"}>
        <LazyLoad height={200} offset={100} throttle={300} once={false} unmountIfInvisible={true}>
          <Loader loading={loading} effect={() => loadHistory(false, Object.keys(historyIncomplete).length)}/>
        </LazyLoad>
      </Col>
    </Row>
  </CenteredRow>;
}
HistoryPage.propTypes = {
  statusBarProps: PropTypes.object.isRequired,
  loadHistory: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  loadForm: PropTypes.func.isRequired,
  historyIncomplete: PropTypes.object.isRequired,
  historyComplete: PropTypes.object.isRequired
};

function Loader (props) {
  const {loading, effect} = props;
  useEffect(() => {
    effect();
  }, []);
  if (loading) {
    return <Spinner animation="border" size="sm"/>
  } else {
    return <small>No more items.</small>
  }
}
Loader.propTypes = {
  loading: PropTypes.bool.isRequired,
  effect: PropTypes.func.isRequired
};


