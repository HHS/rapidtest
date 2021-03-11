# Site maintenance


## List sites.




> Example request:

```javascript
const url = new URL(
    "https://app.warapidtest.org/api/maintenance/v1/sites"
);

let params = {{
    "filter": "STR%C",
};
Object.keys(params)
    .forEach(key => url.searchParams.append(key, params[key]));

let headers = {
    "Content-Type": "application/json",
    "Accept": "application/json",
};


fetch(url, {
    method: "GET",
    headers: headers,
})
.then(response => response.json())
.then(json => console.log(json));
```

```bash
curl -X GET \
    -G "https://app.warapidtest.org/api/maintenance/v1/sites" 

```


<div id="execution-results-GET-api-maintenance-v1-sites" hidden>
    <blockquote>Received response<span id="execution-response-status-GET-api-maintenance-v1-sites"></span>:</blockquote>
    <pre class="json"><code id="execution-response-content-GET-api-maintenance-v1-sites"></code></pre>
</div>
<div id="execution-error-GET-api-maintenance-v1-sites" hidden>
    <blockquote>Request failed with error:</blockquote>
    <pre><code id="execution-error-message-GET-api-maintenance-v1-sites"></code></pre>
</div>

<form id="form-GET-api-maintenance-v1-sites" data-method="GET" data-path="/api/maintenance/v1/sites" data-authed="0" data-hasfiles="0" data-headers='{"Content-Type":"application/json","Accept":"application/json"}' onsubmit="event.preventDefault(); executeTryOut('GET-api-maintenance-v1-sites', this);">
<h3>
    Request
    <button type="button" style="background-color: #8fbcd4; padding: 5px 10px; border-radius: 5px; border-width: thin;" id="btn-tryout-GET-api-maintenance-v1-sites" onclick="tryItOut('GET-api-maintenance-v1-sites');">Try it out ⚡</button>
    <button type="button" style="background-color: #c97a7e; padding: 5px 10px; border-radius: 5px; border-width: thin;" id="btn-canceltryout-GET-api-maintenance-v1-sites" onclick="cancelTryOut('GET-api-maintenance-v1-sites');" hidden>Cancel</button>&nbsp;&nbsp;
    <button type="submit" style="background-color: #6ac174; padding: 5px 10px; border-radius: 5px; border-width: thin;" id="btn-executetryout-GET-api-maintenance-v1-sites" hidden>Send Request 💥</button>
</h3>
<p>
<small class="badge badge-green">GET</small>
 <b><code>/api/maintenance/v1/sites</b></code>
</p>
<h4 class="fancy-heading-panel"><b>Query Parameters</b></h4>
<p>
<b><code>filter</code></b>&nbsp;&nbsp;<small>string</small> 
    <i>optional</i>
<input type="text" name="filter" data-endpoint="GET-api-maintenance-v1-sites" data-component="query" hidden>
<br>
Filter by keyword in site_name.</p>
</form>

## Add site.




> Example request:

```javascript
const url = new URL(
    "https://app.warapidtest.org/api/maintenance/v1/site"
);

let headers = {
    "Content-Type": "application/json",
    "Accept": "application/json",
};

let body = {
    "county": "Bexar",
    "state": "TX",
    "site_type": "School",
    "site_name": "STRAC",
    "street": "7500 US-90 #1",
    "city": "San Antonio",
    "zip": 78227,
    "clia": "45D2193699",
    "contact_name": "Fake Person",
    "contact_phone": "999-999-9999",
    "contact_email": "fake.person@strac.org",
    "district": "Texas Division of Emergency Management",
    "latitude": "29.400960",
    "longitude": "-98.638720"
}

fetch(url, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(body),
})
.then(response => response.json())
.then(json => console.log(json));
```

```bash
curl -X POST \
    "https://app.warapidtest.org/api/maintenance/v1/site"  \
    -d '{"county":"Bexar","state":"TX","site_type":"School","site_name":"STRAC","street":"7500 US-90 #1","city":"San Antonio","zip":78227,"clia":"45D2193699","contact_name":"Fake Person","contact_phone":"999-999-9999","contact_email":"fake.person@strac.org","district":"Texas Division of Emergency Management","latitude":"29.400960","longitude":"-98.638720"}'


```


> Example response (200):

```json
{
  "id": 1
}
Add a site.
```
<div id="execution-results-POST-api-maintenance-v1-site" hidden>
    <blockquote>Received response<span id="execution-response-status-POST-api-maintenance-v1-site"></span>:</blockquote>
    <pre class="json"><code id="execution-response-content-POST-api-maintenance-v1-site"></code></pre>
</div>
<div id="execution-error-POST-api-maintenance-v1-site" hidden>
    <blockquote>Request failed with error:</blockquote>
    <pre><code id="execution-error-message-POST-api-maintenance-v1-site"></code></pre>
</div>

<form id="form-POST-api-maintenance-v1-site" data-method="POST" data-path="/api/maintenance/v1/site" data-authed="0" data-hasfiles="0" data-headers='{"Content-Type":"application/json","Accept":"application/json"}' onsubmit="event.preventDefault(); executeTryOut('POST-api-maintenance-v1-site', this);">
<h3>
    Request
    <button type="button" style="background-color: #8fbcd4; padding: 5px 10px; border-radius: 5px; border-width: thin;" id="btn-tryout-POST-api-maintenance-v1-site" onclick="tryItOut('POST-api-maintenance-v1-site');">Try it out ⚡</button>
    <button type="button" style="background-color: #c97a7e; padding: 5px 10px; border-radius: 5px; border-width: thin;" id="btn-canceltryout-POST-api-maintenance-v1-site" onclick="cancelTryOut('POST-api-maintenance-v1-site');" hidden>Cancel</button>&nbsp;&nbsp;
    <button type="submit" style="background-color: #6ac174; padding: 5px 10px; border-radius: 5px; border-width: thin;" id="btn-executetryout-POST-api-maintenance-v1-site" hidden>Send Request 💥</button>
</h3>
<p>
<small class="badge badge-black">POST</small>
 <b><code>/api/maintenance/v1/site</b></code>
</p>
<h4 class="fancy-heading-panel"><b>Body Parameters</b></h4>

<p>
<b><code>county</code></b>&nbsp;&nbsp;<small>string</small> 
<input type="text" name="county" data-endpoint="POST-api-maintenance-v1-site" data-component="body" required hidden>
<br>
County of the test site.</p>
<p>
<b><code>state</code></b>&nbsp;&nbsp;<small>string</small> 
<input type="text" name="state" data-endpoint="POST-api-maintenance-v1-site" data-component="body" required hidden>
<br>
State of the test site.</p>
<p>
<b><code>site_type</code></b>&nbsp;&nbsp;<small>string</small> 
<input type="text" name="site_type" data-endpoint="POST-api-maintenance-v1-site" data-component="body" required hidden>
<br>
The type of site. Currently available: School, Government, Hospital.</p>
<p>
<b><code>site_name</code></b>&nbsp;&nbsp;<small>string</small> 
<input type="text" name="site_name" data-endpoint="POST-api-maintenance-v1-site" data-component="body" required hidden>
<br>
Name of the test site.</p>
<p>
<b><code>street</code></b>&nbsp;&nbsp;<small>string</small> 
<input type="text" name="street" data-endpoint="POST-api-maintenance-v1-site" data-component="body" required hidden>
<br>
Street address of test site.</p>
<p>
<b><code>city</code></b>&nbsp;&nbsp;<small>string</small> 
<input type="text" name="city" data-endpoint="POST-api-maintenance-v1-site" data-component="body" required hidden>
<br>
City of the test site.</p>
<p>
<b><code>zip</code></b>&nbsp;&nbsp;<small>integer</small> 
<input type="number" name="zip" data-endpoint="POST-api-maintenance-v1-site" data-component="body" required hidden>
<br>
ZIP of the test site.</p>
<p>
<b><code>clia</code></b>&nbsp;&nbsp;<small>string</small> 
<input type="text" name="clia" data-endpoint="POST-api-maintenance-v1-site" data-component="body" required hidden>
<br>
CLIA number that the test site is operating under.</p>
<p>
<b><code>contact_name</code></b>&nbsp;&nbsp;<small>string</small> 
    <i>optional</i>
<input type="text" name="contact_name" data-endpoint="POST-api-maintenance-v1-site" data-component="body" hidden>
<br>
Contact name for the test site manager.</p>
<p>
<b><code>contact_phone</code></b>&nbsp;&nbsp;<small>string</small> 
    <i>optional</i>
<input type="text" name="contact_phone" data-endpoint="POST-api-maintenance-v1-site" data-component="body" hidden>
<br>
Contact phone number for the test site manager.</p>
<p>
<b><code>contact_email</code></b>&nbsp;&nbsp;<small>string</small> 
    <i>optional</i>
<input type="text" name="contact_email" data-endpoint="POST-api-maintenance-v1-site" data-component="body" hidden>
<br>
Contact email address for the test site manager.</p>
<p>
<b><code>district</code></b>&nbsp;&nbsp;<small>string</small> 
    <i>optional</i>
<input type="text" name="district" data-endpoint="POST-api-maintenance-v1-site" data-component="body" hidden>
<br>
Administrative district that the test site belongs to.</p>
<p>
<b><code>latitude</code></b>&nbsp;&nbsp;<small>string</small> 
    <i>optional</i>
<input type="text" name="latitude" data-endpoint="POST-api-maintenance-v1-site" data-component="body" hidden>
<br>
Latitude of the test site.</p>
<p>
<b><code>longitude</code></b>&nbsp;&nbsp;<small>string</small> 
    <i>optional</i>
<input type="text" name="longitude" data-endpoint="POST-api-maintenance-v1-site" data-component="body" hidden>
<br>
Longitude of the test site.</p>
</form>

## Get a site record.




> Example request:

```javascript
const url = new URL(
    "https://app.warapidtest.org/api/maintenance/v1/site/porro"
);

let headers = {
    "Content-Type": "application/json",
    "Accept": "application/json",
};


fetch(url, {
    method: "GET",
    headers: headers,
})
.then(response => response.json())
.then(json => console.log(json));
```

```bash
curl -X GET \
    -G "https://app.warapidtest.org/api/maintenance/v1/site/porro" 

```


<div id="execution-results-GET-api-maintenance-v1-site--id" hidden>
    <blockquote>Received response<span id="execution-response-status-GET-api-maintenance-v1-site--id"></span>:</blockquote>
    <pre class="json"><code id="execution-response-content-GET-api-maintenance-v1-site--id"></code></pre>
</div>
<div id="execution-error-GET-api-maintenance-v1-site--id" hidden>
    <blockquote>Request failed with error:</blockquote>
    <pre><code id="execution-error-message-GET-api-maintenance-v1-site--id"></code></pre>
</div>

<form id="form-GET-api-maintenance-v1-site--id" data-method="GET" data-path="/api/maintenance/v1/site/:id" data-authed="0" data-hasfiles="0" data-headers='{"Content-Type":"application/json","Accept":"application/json"}' onsubmit="event.preventDefault(); executeTryOut('GET-api-maintenance-v1-site--id', this);">
<h3>
    Request
    <button type="button" style="background-color: #8fbcd4; padding: 5px 10px; border-radius: 5px; border-width: thin;" id="btn-tryout-GET-api-maintenance-v1-site--id" onclick="tryItOut('GET-api-maintenance-v1-site--id');">Try it out ⚡</button>
    <button type="button" style="background-color: #c97a7e; padding: 5px 10px; border-radius: 5px; border-width: thin;" id="btn-canceltryout-GET-api-maintenance-v1-site--id" onclick="cancelTryOut('GET-api-maintenance-v1-site--id');" hidden>Cancel</button>&nbsp;&nbsp;
    <button type="submit" style="background-color: #6ac174; padding: 5px 10px; border-radius: 5px; border-width: thin;" id="btn-executetryout-GET-api-maintenance-v1-site--id" hidden>Send Request 💥</button>
</h3>
<p>
<small class="badge badge-green">GET</small>
 <b><code>/api/maintenance/v1/site/:id</b></code>
</p>
<h4 class="fancy-heading-panel"><b>URL Parameters</b></h4>
<p>
<b><code>id</code></b>&nbsp;&nbsp;<small>string</small> 
<input type="text" name="id" data-endpoint="GET-api-maintenance-v1-site--id" data-component="url" required hidden>
<br>
</p>
</form>

## Update site.




> Example request:

```javascript
const url = new URL(
    "https://app.warapidtest.org/api/maintenance/v1/site/ut"
);

let headers = {
    "Content-Type": "application/json",
    "Accept": "application/json",
};

let body = {
    "county": "Bexar",
    "state": "TX",
    "site_type": "School",
    "site_name": "STRAC",
    "street": "7500 US-90 #1",
    "city": "San Antonio",
    "zip": 78227,
    "clia": "45D2193699",
    "contact_name": "Fake Person",
    "contact_phone": "999-999-9999",
    "contact_email": "fake.person@strac.org",
    "district": "Texas Division of Emergency Management",
    "latitude": 29.40096,
    "longitude": -98.63872,
    "archive": false
}

fetch(url, {
    method: "PATCH",
    headers: headers,
    body: JSON.stringify(body),
})
.then(response => response.json())
.then(json => console.log(json));
```

```bash
curl -X PATCH \
    "https://app.warapidtest.org/api/maintenance/v1/site/ut"  \
    -d '{"county":"Bexar","state":"TX","site_type":"School","site_name":"STRAC","street":"7500 US-90 #1","city":"San Antonio","zip":78227,"clia":"45D2193699","contact_name":"Fake Person","contact_phone":"999-999-9999","contact_email":"fake.person@strac.org","district":"Texas Division of Emergency Management","latitude":29.40096,"longitude":-98.63872,"archive":false}'


```


<div id="execution-results-PATCH-api-maintenance-v1-site--id" hidden>
    <blockquote>Received response<span id="execution-response-status-PATCH-api-maintenance-v1-site--id"></span>:</blockquote>
    <pre class="json"><code id="execution-response-content-PATCH-api-maintenance-v1-site--id"></code></pre>
</div>
<div id="execution-error-PATCH-api-maintenance-v1-site--id" hidden>
    <blockquote>Request failed with error:</blockquote>
    <pre><code id="execution-error-message-PATCH-api-maintenance-v1-site--id"></code></pre>
</div>

<form id="form-PATCH-api-maintenance-v1-site--id" data-method="PATCH" data-path="/api/maintenance/v1/site/:id" data-authed="0" data-hasfiles="0" data-headers='{"Content-Type":"application/json","Accept":"application/json"}' onsubmit="event.preventDefault(); executeTryOut('PATCH-api-maintenance-v1-site--id', this);">
<h3>
    Request
    <button type="button" style="background-color: #8fbcd4; padding: 5px 10px; border-radius: 5px; border-width: thin;" id="btn-tryout-PATCH-api-maintenance-v1-site--id" onclick="tryItOut('PATCH-api-maintenance-v1-site--id');">Try it out ⚡</button>
    <button type="button" style="background-color: #c97a7e; padding: 5px 10px; border-radius: 5px; border-width: thin;" id="btn-canceltryout-PATCH-api-maintenance-v1-site--id" onclick="cancelTryOut('PATCH-api-maintenance-v1-site--id');" hidden>Cancel</button>&nbsp;&nbsp;
    <button type="submit" style="background-color: #6ac174; padding: 5px 10px; border-radius: 5px; border-width: thin;" id="btn-executetryout-PATCH-api-maintenance-v1-site--id" hidden>Send Request 💥</button>
</h3>
<p>
<small class="badge badge-purple">PATCH</small>
 <b><code>/api/maintenance/v1/site/:id</b></code>
</p>
<h4 class="fancy-heading-panel"><b>URL Parameters</b></h4>
<p>
<b><code>id</code></b>&nbsp;&nbsp;<small>string</small> 
<input type="text" name="id" data-endpoint="PATCH-api-maintenance-v1-site--id" data-component="url" required hidden>
<br>
</p>
<h4 class="fancy-heading-panel"><b>Body Parameters</b></h4>

<p>
<b><code>county</code></b>&nbsp;&nbsp;<small>string</small> 
    <i>optional</i>
<input type="text" name="county" data-endpoint="PATCH-api-maintenance-v1-site--id" data-component="body" hidden>
<br>
County of the test site.</p>
<p>
<b><code>state</code></b>&nbsp;&nbsp;<small>string</small> 
    <i>optional</i>
<input type="text" name="state" data-endpoint="PATCH-api-maintenance-v1-site--id" data-component="body" hidden>
<br>
State of the test site.</p>
<p>
<b><code>site_type</code></b>&nbsp;&nbsp;<small>string</small> 
    <i>optional</i>
<input type="text" name="site_type" data-endpoint="PATCH-api-maintenance-v1-site--id" data-component="body" hidden>
<br>
The type of site. Currently available: School, Government, Hospital.</p>
<p>
<b><code>site_name</code></b>&nbsp;&nbsp;<small>string</small> 
    <i>optional</i>
<input type="text" name="site_name" data-endpoint="PATCH-api-maintenance-v1-site--id" data-component="body" hidden>
<br>
Name of the test site.</p>
<p>
<b><code>street</code></b>&nbsp;&nbsp;<small>string</small> 
    <i>optional</i>
<input type="text" name="street" data-endpoint="PATCH-api-maintenance-v1-site--id" data-component="body" hidden>
<br>
Street address of test site.</p>
<p>
<b><code>city</code></b>&nbsp;&nbsp;<small>string</small> 
    <i>optional</i>
<input type="text" name="city" data-endpoint="PATCH-api-maintenance-v1-site--id" data-component="body" hidden>
<br>
City of the test site.</p>
<p>
<b><code>zip</code></b>&nbsp;&nbsp;<small>integer</small> 
    <i>optional</i>
<input type="number" name="zip" data-endpoint="PATCH-api-maintenance-v1-site--id" data-component="body" hidden>
<br>
ZIP of the test site.</p>
<p>
<b><code>clia</code></b>&nbsp;&nbsp;<small>string</small> 
    <i>optional</i>
<input type="text" name="clia" data-endpoint="PATCH-api-maintenance-v1-site--id" data-component="body" hidden>
<br>
CLIA number that the test site is operating under.</p>
<p>
<b><code>contact_name</code></b>&nbsp;&nbsp;<small>string</small> 
    <i>optional</i>
<input type="text" name="contact_name" data-endpoint="PATCH-api-maintenance-v1-site--id" data-component="body" hidden>
<br>
Contact name for the test site manager.</p>
<p>
<b><code>contact_phone</code></b>&nbsp;&nbsp;<small>string</small> 
    <i>optional</i>
<input type="text" name="contact_phone" data-endpoint="PATCH-api-maintenance-v1-site--id" data-component="body" hidden>
<br>
Contact phone number for the test site manager.</p>
<p>
<b><code>contact_email</code></b>&nbsp;&nbsp;<small>string</small> 
    <i>optional</i>
<input type="text" name="contact_email" data-endpoint="PATCH-api-maintenance-v1-site--id" data-component="body" hidden>
<br>
Contact email address for the test site manager.</p>
<p>
<b><code>district</code></b>&nbsp;&nbsp;<small>string</small> 
    <i>optional</i>
<input type="text" name="district" data-endpoint="PATCH-api-maintenance-v1-site--id" data-component="body" hidden>
<br>
Administrative district that the test site belongs to.</p>
<p>
<b><code>latitude</code></b>&nbsp;&nbsp;<small>number</small> 
    <i>optional</i>
<input type="number" name="latitude" data-endpoint="PATCH-api-maintenance-v1-site--id" data-component="body" hidden>
<br>
Latitude of the test site.</p>
<p>
<b><code>longitude</code></b>&nbsp;&nbsp;<small>number</small> 
    <i>optional</i>
<input type="number" name="longitude" data-endpoint="PATCH-api-maintenance-v1-site--id" data-component="body" hidden>
<br>
Longitude of the test site.</p>
<p>
<b><code>archive</code></b>&nbsp;&nbsp;<small>boolean</small> 
    <i>optional</i>
    <label data-endpoint="PATCH-api-maintenance-v1-site--id" hidden><input type="radio" name="archive" value="true" data-endpoint="PATCH-api-maintenance-v1-site--id" data-component="body" ><code>true</code></label>
<label data-endpoint="PATCH-api-maintenance-v1-site--id" hidden><input type="radio" name="archive" value="false" data-endpoint="PATCH-api-maintenance-v1-site--id" data-component="body" ><code>false</code></label>
<br>
Archive status of test site (archive=true sites do not display to users).</p>
</form>


