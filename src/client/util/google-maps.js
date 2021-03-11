import {geocodeByAddress} from "react-places-autocomplete";

function getPlaceComponent (name, place) {
  return place.find(component => {
    return component.types.find(type => type == name);
  });
}

export function getAddressComponents (address, addPatientCounty) {
  return geocodeByAddress(address)
    .then(results => {
      const output = {};
      let preferredAddress = results[0]["address_components"];
      const components = {
        'street_number': null,
        'route': null,
        'administrative_area_level_1': null,
        'locality': null,
        'postal_code': null,
        'administrative_area_level_2': null
      };
      Object.keys(components).forEach(component => components[component] = getPlaceComponent(component, preferredAddress));
      if (components.street_number && components.route)
        output['patient_address'] = components.street_number.short_name + " " + components.route.short_name;
      if (components.administrative_area_level_1)
        output['patient_state'] = components.administrative_area_level_1.short_name;
      if (components.locality)
        output['patient_city'] = components.locality.short_name;
      if (components.postal_code)
        output['patient_zip'] = components.postal_code.short_name;
      output['patient_lat'] = results[0]['geometry']['location']['lat']();
      output['patient_lng'] = results[0]['geometry']['location']['lng']();
      if (components.administrative_area_level_2) {
        output['patient_county'] = components.administrative_area_level_2.short_name.split(" ").filter(word => word.toLowerCase() !== 'county').join(" ");
        if (typeof addPatientCounty === 'function') {
          addPatientCounty(output['patient_county'], output['patient_state']);
        }
      }
      output['patient_google_place_id'] = results[0]['place_id'];
      return Promise.resolve(output);
    });
}