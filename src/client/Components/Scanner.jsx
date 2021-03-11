import {Card, Collapse} from "react-bootstrap";
import React, {useState} from "react";
import ScanditScanner from './Scanner/ScanditScanner';
import {isEnabled} from "./Scanner/dynamicImport";
import {IconContext} from "react-icons";
import {BsStop, BsPlay} from "react-icons/bs";
import PropTypes from "prop-types";

class ScannerBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  componentDidCatch(error, info) {
    console.log("Scanner caught an error: ", error, info);
    this.setState({ hasError: true });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return <React.Fragment>
        <div
          className={'scandit-placeholder'} style={{
            height: (this.props.clientHeight ?? 200) + "px",
            color: "white"
          }}
          onClick={() => this.setState({hasError: false})}
        >
          An error occurred within the scanner. Tap to try again.
        </div>
      </React.Fragment>
    }
    return this.props.children;
  }
}
ScannerBoundary.propTypes = {
  children: PropTypes.node,
  clientHeight: PropTypes.number
};

export function Scanner (props) {
  const [open, setOpen] = useState(props.initiallyOpen);
  const [initialized, setInitialized] = useState(!open);
  const [paused, setPause] = useState(!open);
  const [transitioning, setTransitioning] = useState(false);
  const [ready, setReady] = useState(!open);

  const onReady = () => {
    if (initialized) props.onReady();
    setReady(true);
  }

  const notReady = () => {
    props.notReady();
    setReady(false);
  }

  return <Card>
    <Card.Header onClick={() => {
      if (!transitioning && ready) {
        setOpen(!open);
        notReady();
        setTransitioning(true);
        setInitialized(true);
      }
    }}>
      <span>
        <IconContext.Provider value={{ className: "icon", style: {fontSize: "150%", verticalAlign: "top"}}}>
          <span>{open ? <BsStop/> : <BsPlay/>}</span>
        </IconContext.Provider>
        {open ? "Stop " : "Start "}Scanning
      </span>
    </Card.Header>
    <Collapse
      in={open}
      onEntered={() => {
        setPause(false);
        setTransitioning(false);
      }}
      onExit={() => setPause(true)}
      onExited={() => {
        setTransitioning(false);
        onReady();
      }}
    >
      <div>
        <ScannerBoundary>
          {isEnabled() ?
            <ScanditScanner
              onScan={props.onScan}
              paused={paused}
              onReady={() => onReady()}
              opening={transitioning && open}
              closing={transitioning && !open}
            /> : "Scanner is Disabled"}
        </ScannerBoundary>
      </div>
    </Collapse>
  </Card>
}
Scanner.propTypes = {
  notReady: PropTypes.func.isRequired,
  onReady: PropTypes.func.isRequired,
  onScan: PropTypes.func.isRequired,
  initiallyOpen: PropTypes.bool
};
Scanner.defaultProps = {
  notReady: () => console.log("Scanner is not ready."),
  onReady: () => console.log("Scanner is ready."),
  onScan: console.log,
  initiallyOpen: true
};
