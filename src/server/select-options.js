const { states } = require("./us-states");
const retrieve = require("./Resources/retrieve");
const NodeCache = require( "node-cache" );
const {combineQueryAndArray, getCountiesFromDB} = require("./sql");
const optionsCache = new NodeCache();
/* cache select options to reduce load on sql server and speed up responses */
const cachedOptions = ['patient_sex', 'patient_race', 'patient_ethnicity', 'patient_county', 'patient_positive', 'patient_previous_test', 'patient_site_assigned', 'site_type'];
const minutesToExpire = {
  default: 15,
  patient_site_assigned: 1,
};

cachedOptions.forEach(option => cacheOption(option));
optionsCache.on("del", function (key){ cacheOption(key); });
optionsCache.on("flush", function (key){ cacheOption(key); });

function cacheOption(option) {
  Promise.resolve().then(async () => {
    optionsCache.set(option, (await getRawOptions([option]))[option], (minutesToExpire[option] || minutesToExpire['default']) * 60);
  }).catch(e => console.log("Cannot cache " + option, e));
}

/* drop down options
* returns all of the options needed for <select> elements, use option parameter to get a subset
 */
async function getRawOptions(options) {
  const queries = {
    patient_positive: "SELECT result_value as value,result_type as label from mod_cvd_result_type",
    patient_previous_test: "SELECT id as value,reason as label from mod_cvd_test_type",
    patient_site_assigned: "SELECT id as value,reason as label,street,city,state,zip,site_type from mod_cvd_sites WHERE archive != 1",
    site_type: "SELECT site_type_id as value,site_type as label, lock_time from mod_cvd_site_type WHERE archive != 1"
  };
  const fixed = {
    patient_sex: [{value: 'male', label: 'Male'}, {value: 'female', label: 'Female'}, {value: 'unk', label: 'Unknown'}],
    patient_race: [
      {value: 'AI', label: 'AI - American Indian or Alaska Native', dl: 'AI'},
      {value: 'A', label: 'A - Asian', dl: 'AP'},
      {value: 'B', label: 'B - Black or African American', dl: 'BK'},
      {value: 'PI', label: 'PI - Native Hawaiian or Other Pacific Islander'},
      {value: 'W', label: 'W - White', dl: 'W'},
      {value: 'O', label: 'O - Other'},
      {value: 'U', label: 'U - Unknown'},
    ],
    patient_ethnicity: [
      {value: 'H', label: 'H - Hispanic'},
      {value: 'NH', label: 'NH - Non-Hispanic'},
      {value: 'U', label: 'U - Unknown'},
    ],
    patient_state: states.map(state => {return {value: state.abbreviation, label: state.abbreviation, searchBy: state.name }}),
    patient_county: [{value: 'N/A', label: 'N/A'}]
  };
  const formOverrides = await retrieve.formOverrides();
  if (formOverrides && typeof formOverrides.selectOptions !== undefined) {
    // Overrides from config.
    Object.entries(formOverrides.selectOptions).forEach(([key, value]) => {
      if (typeof value === 'string') {
        queries[key] = value;
      } else {
        fixed[key] = value;
      }
    });
  }

  if (typeof options === undefined) options = Object.keys(queries).concat(Object.keys(fixed));

  const response = await combineQueryAndArray(queries, fixed, options);
  if (response['patient_county']) {
    const countiesRes = await getCountiesFromDB();
    response['patient_county'] = countiesRes;
    if (countiesRes.errorExists) response.errorExists = true;
  }

  return Promise.resolve(response);
}

/* retrieved cached sql results */
async function getOptions (options) {
  const response = {};
  let missed = {};
  options.forEach(option => {
    response[option] = optionsCache.get(option);
    if (!response[option]) {
      missed[option] = true;
    }
  });

  if (Object.keys(missed).length > 0) {
    missed = await getRawOptions(Object.keys(missed));
    Object.keys(missed).forEach(option => response[option] = missed[option]);
  }

  return new Promise((res) => {
    res(response);
  });
}

/* get sites list with a search query, or list of ids */
async function getSites(searchTerm, siteType) {
  let sites = (await getOptions(['patient_site_assigned']))['patient_site_assigned'];
  let found = [];
  if (Array.isArray(searchTerm)) {
    const maxSites = 5;
    // search for each saved site in order
    for (let i = 0; found.length < maxSites && i < searchTerm.length; i += 1) {
      const site = sites.find(site => site.value == searchTerm[i]);
      if (site) {
        found.push(site);
      }
    }
  } else {
    searchTerm = typeof searchTerm === 'string' ? searchTerm.toLowerCase() : '';
    const minChar = 3;
    const maxResults = 1000;
    if (searchTerm.length < minChar) {
      // Don't show options if there is not enough in the search term
      return new Promise((res) => {
        res({char: minChar - searchTerm.length});
      });
    }
    if (typeof siteType !== 'undefined' && siteType > 0) {
      sites = sites.filter(site => site.site_type === siteType);
    }
    found = sites.filter(site => {
      return site.label && site.label.toLowerCase().includes(searchTerm);
    });

    if (found.length > maxResults) {
      // Don't show options if there are too many
      return new Promise((res) => {
        res({hidden: found.length});
      });
    }
  }

  return new Promise((res) => {
    res(found);
  });
}

module.exports = {
  getOptions,
  getSites
};
