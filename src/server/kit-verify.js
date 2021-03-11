var gs1js = require('gs1js');
const date = require("date-and-time");
const config = require("./config");
/*
*
*
* */
function binaxComponents (kit_id) {
  const components = {};
  // Parse the GS1 Data Matrix.
  const raw_kitId = kit_id.replace('|', '\u001d') // Undo the replacement to retrieve the value, as scanned.
  const myReader = new gs1js.GS1Reader(raw_kitId, undefined);
  const AIs = myReader.getApplicationIdentifiers();
  if (AIs.length === 4) {
    const codes = {
      "01": {
        identifier: "kit_gtin",
        expectedLength: 14
      },
      "17": {
        identifier: "kit_expiration",
        expectedLength: 6
      },
      "10": {
        identifier: "kit_batch_number",
        expectedLength: 6
      },
      "21": {
        identifier: "kit_serial_number",
        expectedLength: 20
      }
    }

    AIs.forEach(AI => {
      let value = AI.value;
      const component = codes[AI.identifier];
      if (value.length === component.expectedLength) {
        if (component.identifier === "kit_expiration") {
          value = "20" + AI.value.substr(0, 2) + "-" + AI.value.substr(2, 2) + "-" + AI.value.substr(4, 2);
        }
        components[component.identifier] = value;
      }
    });
  }

  return binax9MonthExpiration(components);
}

/* verify validity of kitId
* if invalid, kit_id is the original, if it is valid, kit_id will be the parsed version
* manufacturer is also given for all valid kit_id
* if invalid and a multiple part id, the manufacturer and the reason for invalidation must be given
* if invalid and single part id, manufacturer can be unknown
* */
async function verifyKitId (kitId) {
  const regex = {
    binax: /^[A-Za-z0-9|]+$/,
    cue: {
      whole: /^[a-zA-Z0-9&|?:=/.-]+$/,
      // cue test device is a URL with query values
      device: /^https:\/\/www\.cuehealth\.com\/devices\/[a-zA-Z0-9&?:=/.-]+$/,
      // cue cartridges are 6 to 7 digit numbers
      cart: /^[0-9]{6,7}$/,
      aio: /^([a-zA-Z0-9&?:=/.-]+)?[|]?([0-9]{6,7})$/
    }
  }
  let original = kitId;
  let manufacturer = 'unknown';
  let is_test = false;
  if (typeof original === 'string') {
    // test for binax kit
    kitId = original.match(regex.binax);
    if (kitId && kitId.length > 0 && kitId[0].length === 55) {
      manufacturer = 'binax';
      const components = binaxComponents(kitId[0]);
      is_test = !!config.testKits.binax.find(testKit => testKit === kitId[0]);
      return Promise.resolve({
        kit_id: kitId[0],
        invalid: false,
        manufacturer,
        components,
        is_test
      });
    }

    // test for cue kit
    kitId = original.match(regex.cue.whole);
    if (kitId && kitId.length > 0) {
      kitId = kitId[0];
      manufacturer = 'cue';
      const parts = kitId.split('|');
      if (parts.length === 2) {
        const device = parts[0];
        const cart = parts[1];
        const components = {device, cart};
        is_test = !!config.testKits.cue_readers.find(testKit => testKit === device);
        if (!regex.cue.device.test(device)) {
          return Promise.resolve({
            kit_id: original,
            invalid: true,
            reason: 'device-invalid',
            manufacturer,
            components,
            is_test
          });
        }
        if (!regex.cue.cart.test(cart)) {
          let reason = 'cartridge-invalid';
          if (regex.cue.device.test(cart)) reason = 'device-replace';
          if (device === cart) reason = 'device-rescan';
          return Promise.resolve({
            kit_id: original,
            invalid: true,
            reason: reason,
            manufacturer,
            components,
            is_test
          });
        }
        return Promise.resolve({
          kit_id: device + '|' + cart,
          invalid: false,
          manufacturer,
          components,
          is_test
        });
      } else if (parts.length === 1) {
        if (regex.cue.device.test(parts[0])) {
          is_test = !!config.testKits.cue_readers.find(testKit => testKit === parts[0]);
          return Promise.resolve({
            kit_id: original,
            invalid: true,
            reason: 'device-only',
            manufacturer,
            is_test
          });
        }
        if (regex.cue.cart.test(parts[0])) {
          return Promise.resolve({
            kit_id: original,
            invalid: true,
            reason: 'cartridge-only',
            manufacturer,
            is_test
          });
        }
      }
    }
  }

  return Promise.resolve({kit_id: original, invalid: true, manufacturer: 'unknown', is_test});
}

/**
 * In March 2021, Abbott announced that their expiration date from these batches all have been increase by 3 months.
 *
 * "This letter is to notify you the BinaxNOW COVID-19 Ag Card product in your possession
 * may now have a longer than labeled product expiry date.
 * All BinaxNOW COVID-19 Ag Cards currently have a nine-month expiry date."
 *
 * @param {obj} components Original set of binax components
 * @returns {obj} New set of binax components
 */
function binax9MonthExpiration (components) {
  const lotNumbers = [
    '124008', '124073', '124199', '124380', '124410', '124462', '124557', '124569',
    '124743', '124858', '124865', '125049', '125052', '125406', '125419', '125425',
    '125523', '125525', '125528', '125605', '125781', '125849', '125851', '125957',
    '126028', '126029', '126072', '126138', '126140', '126149', '126265', '126370',
    '126383', '126397', '126404', '126563', '126628', '126639', '126640', '126647',
    '126658', '126692', '126703', '126706', '126750', '126791', '126828', '126833',
    '126842', '126869', '126873', '126929', '126930', '126978', '127092', '127094',
    '127099', '127115', '127128', '127136', '127137', '127139', '127165', '127208',
    '127220', '127254', '127358', '127397', '127426', '127435', '127497', '127566',
    '127578', '127634', '127672', '127676', '127677', '127752', '127762', '127763',
    '127778', '127854', '127857', '127880', '128003', '128004', '128005', '128023',
    '128024', '128146', '128166', '128167', '128226', '128266', '128345', '128385',
    '128397', '128417', '128420', '128427', '128428', '128429', '128430', '128503',
    '128515', '128520', '128524', '128545', '128548', '128563', '128566', '128585',
    '128694', '128758', '128770', '128857', '128874', '128910', '128917', '128931',
    '128938', '128940', '129100', '129106', '129111', '129112', '129113', '129345',
    '129358', '129360', '129364', '129365', '129380', '129381', '129382', '129383',
    '129427', '129436', '129564', '129705', '129711', '129723', '129724', '129736',
    '129737', '129880', '129917', '129929', '129957', '129963', '130017', '130053',
    '130090', '130102', '130107', '130108', '130109', '130110', '130111', '130112',
    '130113', '130194', '130207', '130257', '130300', '130302', '130321', '130322',
    '130323', '130331', '130332', '130333', '130345', '130346', '130360', '130361',
    '130388', '130397', '130445', '130446', '130447', '130653', '130654', '130662',
    '130708', '130748', '130761', '130823', '130852', '130885', '131121', '131155',
    '131167', '131179', '131192', '131235', '131238', '131244', '131245', '131246',
    '131247', '131285', '131347', '131349', '131350', '131351', '131371', '131405',
    '131413', '131414', '131415', '131428', '131511', '131522', '131524', '131534',
    '131556', '131560', '131665', '131673', '131690', '131707', '131710', '131711',
    '131712', '131783', '131848', '131849', '131853', '131854', '131855', '131856',
    '131963', '131966', '131991', '132014', '132026', '132092', '132093', '132096',
    '132097', '132116', '132117', '132118', '132119', '132143', '132144', '132145',
    '132148', '132151', '132152', '132164', '132172', '132184', '132185', '132186',
    '132282', '132361', '132370', '132374', '132529', '132557', '132602', '132613',
    '132617', '132618', '132619', '132685', '132723', '132806', '132807', '132874',
    '132883', '132918', '132921', '132936', '133269', '133292', '133304', '133306',
    '133312', '133328', '133329', '133332', '133343', '133344', '133345', '133346',
    '133347', '133348', '133349', '133350', '133351', '133357', '133366', '133367',
    '133368', '133396', '133397', '133399', '133400', '133403', '133404', '133423',
    '133441', '133514', '133538', '133539', '133584', '133608', '133655', '133670',
    '133699', '133756', '133851', '133940', '133959', '133971', '133987', '134060',
    '134072', '134119', '134125', '134127', '134148', '134399', '134436', '134439',
    '134440', '134467', '134468', '134469', '134508', '134514', '134525', '134532',
    '134533', '134544', '134545', '134553', '134555', '134565', '134575', '134580',
    '134595', '134644', '134690', '134701', '134756', '134759', '134764', '134775',
    '134808', '134815', '134818', '134829', '134830', '134862', '134864', '134867',
    '134907', '134931', '134955', '134984', '135051', '135079', '135168', '135177',
    '135179', '135180', '135248', '135249', '135252', '135266', '135315', '135338',
    '135399', '135406', '135414', '135431', '135504', '135507', '135566', '135589',
    '135738', '135741', '135819', '135826', '135827', '135872', '135887',
  ];
  if (components['kit_batch_number'] > 124007
  && components['kit_batch_number'] < 135888
  && lotNumbers.find(number => number === components['kit_batch_number'])) {
    const oldExpiration = date.parse(components['kit_expiration'], 'YYYY-MM-DD');
    const newExpiration = date.addMonths(oldExpiration, 3);
    components['kit_expiration'] = date.format(newExpiration, 'YYYY-MM-DD');
  }
  return components;
}

module.exports = {
  verifyKitId
};