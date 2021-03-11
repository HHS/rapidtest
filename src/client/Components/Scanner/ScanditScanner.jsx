import React, { Component } from 'react';
import config from '../../config.js';
import { 
  Spinner
} from 'react-bootstrap';
import PropTypes from "prop-types";
import "./style.css";
import {
  // exports from scandit-sdk
  Barcode,
  BarcodePicker,
  CameraAccess,
  CameraSettings,
  ScanSettings,
  SingleImageModeSettings,
  // default export scandit-sdk-react
  ScanditBarcodeScanner
} from './dynamicImport';

export default class ScanditScanner extends Component {
  constructor(props) {
    super(props);
    this.state = {
      camerasInitialized: false,
      singleImageMode: false,
      clientHeight: 180,
    };
  }

  componentDidMount() {
    this._ismounted = true;
    CameraSettings.resolutionPreference = "full-hd";
    CameraAccess.getCameras()
      .then(cams => {
        if (this._ismounted) {
          this.setState({
            singleImageMode: cams.length === 0 || cams.length === 1 && cams[0].deviceId === "",
            camerasInitialized: true
          })
        }
      }).catch((e) => {
        console.log(e);
        if (this._ismounted) {
          this.setState({singleImageMode: true});
        }
      });
  }

  componentWillUnmount() {
    this._ismounted = false;
  }

  setClientHeight = () => {
    const container = document.getElementById('height-container');
    if (container) {
      this.setState({clientHeight: container.clientHeight});
    }
  }

  getScanSettings = () => {
    let settings = new ScanSettings({
      //maxNumberOfCodesPerFrame: 1,
      gpuAcceleration: true,
      codeDuplicateFilter: 5585, // in milliseconds this should be long if vibration is enabled
      enabledSymbologies: [
        Barcode.Symbology.PDF417,
        Barcode.Symbology.DATA_MATRIX,
        Barcode.Symbology.QR
      ]//,searchArea: { x: 0, y: 0, width: 0.5, height: 1.0 }
    });
    // https://docs.scandit.com/stable/web/classes/symbologysettings.html
    //settings.getSymbologySettings(Barcode.Symbology.CODE128).setActiveSymbolCountsRange(3,8);
    return settings;
  };

  getSingleImageModeSettings = () => {
    const { singleImageMode } = this.state;
    const strategy = singleImageMode ? SingleImageModeSettings.UsageStrategy.ALWAYS : SingleImageModeSettings.UsageStrategy.FALLBACK;
    return {
      desktop: {
        usageStrategy: strategy,
      },
      mobile: {
        usageStrategy: strategy,
      },
    };
  };

  render() {
    const { camerasInitialized, clientHeight } = this.state;
    const { paused, onScan, onReady, opening, closing } = this.props;

    return (
      <React.Fragment>
        {camerasInitialized && (!paused) ?
          <div id={'height-container'} className={"scanner-bg"} style={opening || closing ? {height: (clientHeight + "px"), } : {}}>
            <ScanditBarcodeScanner
              licenseKey={config.client.scandit}
              engineLocation="https://cdn.jsdelivr.net/npm/scandit-sdk@5.x/build"
              preloadBlurryRecognition={true}
              preloadEngine={false}
              onReady={() => {
                onReady();
                this.setClientHeight();
              }}
              onScan={onScan}
              //onScanError={console.log}
              //onSubmitFrame={console.log}
              //onProcessFrame={console.log}
              scanSettings={this.getScanSettings()}
              paused={paused}
              /*️
                ⚠️ Make sure to keep accessCamera and paused synchronized in a sensible way, as resuming scanning accesses
                the camera, so your state might become outdated.
                For example, set accessCamera to true whenever scanning is resumed.
              */
              //camera={undefined}
              //cameraSettings={undefined}
              enableCameraSwitcher={true}
              //enablePinchToZoom={true}
              enableTapToFocus={true}
              //enableTorchToggle={true}
              guiStyle={BarcodePicker.GuiStyle.VIEWFINDER}
              playSoundOnScan={true}
              targetScanningFPS={30}
              vibrateOnScan={true}
              videoFit={BarcodePicker.ObjectFit.COVER}
              //visible={true}
              //viewfinderArea={{ x: 0, y: 0, width: 1, height: 1 }}
              //zoom={0}
              // only set on component creation, can not be changed afterwards
              //cameraType={Camera.Type.BACK}
              singleImageModeSettings={this.getSingleImageModeSettings()}
            />
          </div>:
        // loading spinner if it has not been initialized yet
          <div className={'scandit-placeholder'} style={{height: (clientHeight + "px")}}>
            <div className={'horizontal-center vertical-center'}>
              <Spinner animation="border" variant="light" />
            </div>
          </div>
        }
      </React.Fragment>
    );
  }
}

ScanditScanner.propTypes = {
  onScan: PropTypes.func,
  onReady: PropTypes.func,
  paused: PropTypes.bool,
  opening: PropTypes.bool,
  closing: PropTypes.bool
};

ScanditScanner.defaultProps = {
  onScan: console.log,
  onReady: () => console.log("Scanner Ready"),
  paused: false,
  opening: false,
  closing: false
};
