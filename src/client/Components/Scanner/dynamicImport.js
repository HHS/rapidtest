/*
import {
  Barcode,
  BarcodePicker,
  CameraAccess,
  CameraSettings,
  ScanSettings,
  SingleImageModeSettings,
} from from scandit-sdk;
import ScanditBarcodeScanner from scandit-sdk-react;
*/
export let {
  Barcode,
  BarcodePicker,
  CameraAccess,
  CameraSettings,
  ScanSettings,
  SingleImageModeSettings,
  ScanditBarcodeScanner
} = {};

let errors = 0;
function handleError(e) {
  errors += 1;
  console.log(e);
}

export let scanditSdk = null;
export let scanditSdkReact = null;
import("scandit-sdk").then(module => {
  scanditSdk = module;
  Barcode = module.Barcode;
  BarcodePicker = module.BarcodePicker;
  CameraAccess = module.CameraAccess;
  CameraSettings = module.CameraSettings;
  ScanSettings = module.ScanSettings;
  SingleImageModeSettings = module.SingleImageModeSettings;
}).catch(handleError);
import("scandit-sdk-react").then(module => {
  scanditSdkReact = module;
  ScanditBarcodeScanner = module.default;
}).catch(handleError);

export function isEnabled () {
  return scanditSdk && scanditSdkReact;
}
export function hasFailed () {
  return errors > 0;
}
