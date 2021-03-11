# Proctor maintenance


## List proctors.




> Example request:

```javascript
const url = new URL(
    "https://app.warapidtest.org/api/maintenance/v1/proctors"
);

let params = {{
    "filter": "@strac.org",
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
    -G "https://app.warapidtest.org/api/maintenance/v1/proctors" 

```


<div id="execution-results-GET-api-maintenance-v1-proctors" hidden>
    <blockquote>Received response<span id="execution-response-status-GET-api-maintenance-v1-proctors"></span>:</blockquote>
    <pre class="json"><code id="execution-response-content-GET-api-maintenance-v1-proctors"></code></pre>
</div>
<div id="execution-error-GET-api-maintenance-v1-proctors" hidden>
    <blockquote>Request failed with error:</blockquote>
    <pre><code id="execution-error-message-GET-api-maintenance-v1-proctors"></code></pre>
</div>

<form id="form-GET-api-maintenance-v1-proctors" data-method="GET" data-path="/api/maintenance/v1/proctors" data-authed="0" data-hasfiles="0" data-headers='{"Content-Type":"application/json","Accept":"application/json"}' onsubmit="event.preventDefault(); executeTryOut('GET-api-maintenance-v1-proctors', this);">
<h3>
    Request
    <button type="button" style="background-color: #8fbcd4; padding: 5px 10px; border-radius: 5px; border-width: thin;" id="btn-tryout-GET-api-maintenance-v1-proctors" onclick="tryItOut('GET-api-maintenance-v1-proctors');">Try it out ⚡</button>
    <button type="button" style="background-color: #c97a7e; padding: 5px 10px; border-radius: 5px; border-width: thin;" id="btn-canceltryout-GET-api-maintenance-v1-proctors" onclick="cancelTryOut('GET-api-maintenance-v1-proctors');" hidden>Cancel</button>&nbsp;&nbsp;
    <button type="submit" style="background-color: #6ac174; padding: 5px 10px; border-radius: 5px; border-width: thin;" id="btn-executetryout-GET-api-maintenance-v1-proctors" hidden>Send Request 💥</button>
</h3>
<p>
<small class="badge badge-green">GET</small>
 <b><code>/api/maintenance/v1/proctors</b></code>
</p>
<h4 class="fancy-heading-panel"><b>Query Parameters</b></h4>
<p>
<b><code>filter</code></b>&nbsp;&nbsp;<small>string</small> 
    <i>optional</i>
<input type="text" name="filter" data-endpoint="GET-api-maintenance-v1-proctors" data-component="query" hidden>
<br>
Filter by keyword in email_address.</p>
</form>

## Add proctor.




> Example request:

```javascript
const url = new URL(
    "https://app.warapidtest.org/api/maintenance/v1/proctor"
);

let headers = {
    "Content-Type": "application/json",
    "Accept": "application/json",
};

let body = {
    "first_name": "Fake",
    "last_name": "Person",
    "email_address": "fake.person@strac.org",
    "phone_number_office": "999-999-9999"
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
    "https://app.warapidtest.org/api/maintenance/v1/proctor"  \
    -d '{"first_name":"Fake","last_name":"Person","email_address":"fake.person@strac.org","phone_number_office":"999-999-9999"}'


```


> Example response (200):

```json
{
  "id": 1
}
Add a proctor.
```
<div id="execution-results-POST-api-maintenance-v1-proctor" hidden>
    <blockquote>Received response<span id="execution-response-status-POST-api-maintenance-v1-proctor"></span>:</blockquote>
    <pre class="json"><code id="execution-response-content-POST-api-maintenance-v1-proctor"></code></pre>
</div>
<div id="execution-error-POST-api-maintenance-v1-proctor" hidden>
    <blockquote>Request failed with error:</blockquote>
    <pre><code id="execution-error-message-POST-api-maintenance-v1-proctor"></code></pre>
</div>

<form id="form-POST-api-maintenance-v1-proctor" data-method="POST" data-path="/api/maintenance/v1/proctor" data-authed="0" data-hasfiles="0" data-headers='{"Content-Type":"application/json","Accept":"application/json"}' onsubmit="event.preventDefault(); executeTryOut('POST-api-maintenance-v1-proctor', this);">
<h3>
    Request
    <button type="button" style="background-color: #8fbcd4; padding: 5px 10px; border-radius: 5px; border-width: thin;" id="btn-tryout-POST-api-maintenance-v1-proctor" onclick="tryItOut('POST-api-maintenance-v1-proctor');">Try it out ⚡</button>
    <button type="button" style="background-color: #c97a7e; padding: 5px 10px; border-radius: 5px; border-width: thin;" id="btn-canceltryout-POST-api-maintenance-v1-proctor" onclick="cancelTryOut('POST-api-maintenance-v1-proctor');" hidden>Cancel</button>&nbsp;&nbsp;
    <button type="submit" style="background-color: #6ac174; padding: 5px 10px; border-radius: 5px; border-width: thin;" id="btn-executetryout-POST-api-maintenance-v1-proctor" hidden>Send Request 💥</button>
</h3>
<p>
<small class="badge badge-black">POST</small>
 <b><code>/api/maintenance/v1/proctor</b></code>
</p>
<h4 class="fancy-heading-panel"><b>Body Parameters</b></h4>

<p>
<b><code>first_name</code></b>&nbsp;&nbsp;<small>string</small> 
<input type="text" name="first_name" data-endpoint="POST-api-maintenance-v1-proctor" data-component="body" required hidden>
<br>
First name of the test proctor.</p>
<p>
<b><code>last_name</code></b>&nbsp;&nbsp;<small>string</small> 
<input type="text" name="last_name" data-endpoint="POST-api-maintenance-v1-proctor" data-component="body" required hidden>
<br>
Last name of the test proctor.</p>
<p>
<b><code>email_address</code></b>&nbsp;&nbsp;<small>string</small> 
<input type="text" name="email_address" data-endpoint="POST-api-maintenance-v1-proctor" data-component="body" required hidden>
<br>
Email address of the test proctor.</p>
<p>
<b><code>phone_number_office</code></b>&nbsp;&nbsp;<small>string</small> 
    <i>optional</i>
<input type="text" name="phone_number_office" data-endpoint="POST-api-maintenance-v1-proctor" data-component="body" hidden>
<br>
Office phone number of the test proctor:</p>
</form>

## Get a proctor record.




> Example request:

```javascript
const url = new URL(
    "https://app.warapidtest.org/api/maintenance/v1/proctor/exercitationem"
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
    -G "https://app.warapidtest.org/api/maintenance/v1/proctor/exercitationem" 

```


<div id="execution-results-GET-api-maintenance-v1-proctor--id" hidden>
    <blockquote>Received response<span id="execution-response-status-GET-api-maintenance-v1-proctor--id"></span>:</blockquote>
    <pre class="json"><code id="execution-response-content-GET-api-maintenance-v1-proctor--id"></code></pre>
</div>
<div id="execution-error-GET-api-maintenance-v1-proctor--id" hidden>
    <blockquote>Request failed with error:</blockquote>
    <pre><code id="execution-error-message-GET-api-maintenance-v1-proctor--id"></code></pre>
</div>

<form id="form-GET-api-maintenance-v1-proctor--id" data-method="GET" data-path="/api/maintenance/v1/proctor/:id" data-authed="0" data-hasfiles="0" data-headers='{"Content-Type":"application/json","Accept":"application/json"}' onsubmit="event.preventDefault(); executeTryOut('GET-api-maintenance-v1-proctor--id', this);">
<h3>
    Request
    <button type="button" style="background-color: #8fbcd4; padding: 5px 10px; border-radius: 5px; border-width: thin;" id="btn-tryout-GET-api-maintenance-v1-proctor--id" onclick="tryItOut('GET-api-maintenance-v1-proctor--id');">Try it out ⚡</button>
    <button type="button" style="background-color: #c97a7e; padding: 5px 10px; border-radius: 5px; border-width: thin;" id="btn-canceltryout-GET-api-maintenance-v1-proctor--id" onclick="cancelTryOut('GET-api-maintenance-v1-proctor--id');" hidden>Cancel</button>&nbsp;&nbsp;
    <button type="submit" style="background-color: #6ac174; padding: 5px 10px; border-radius: 5px; border-width: thin;" id="btn-executetryout-GET-api-maintenance-v1-proctor--id" hidden>Send Request 💥</button>
</h3>
<p>
<small class="badge badge-green">GET</small>
 <b><code>/api/maintenance/v1/proctor/:id</b></code>
</p>
<h4 class="fancy-heading-panel"><b>URL Parameters</b></h4>
<p>
<b><code>id</code></b>&nbsp;&nbsp;<small>string</small> 
<input type="text" name="id" data-endpoint="GET-api-maintenance-v1-proctor--id" data-component="url" required hidden>
<br>
</p>
</form>

## Update proctor account.




> Example request:

```javascript
const url = new URL(
    "https://app.warapidtest.org/api/maintenance/v1/proctor/cupiditate"
);

let headers = {
    "Content-Type": "application/json",
    "Accept": "application/json",
};

let body = {
    "first_name": "Fake",
    "last_name": "Person",
    "phone_number_office": "999-999-9999",
    "archive": false,
    "resend_email": true,
    "password": "maiores"
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
    "https://app.warapidtest.org/api/maintenance/v1/proctor/cupiditate"  \
    -d '{"first_name":"Fake","last_name":"Person","phone_number_office":"999-999-9999","archive":false,"resend_email":true,"password":"maiores"}'


```


<div id="execution-results-PATCH-api-maintenance-v1-proctor--id" hidden>
    <blockquote>Received response<span id="execution-response-status-PATCH-api-maintenance-v1-proctor--id"></span>:</blockquote>
    <pre class="json"><code id="execution-response-content-PATCH-api-maintenance-v1-proctor--id"></code></pre>
</div>
<div id="execution-error-PATCH-api-maintenance-v1-proctor--id" hidden>
    <blockquote>Request failed with error:</blockquote>
    <pre><code id="execution-error-message-PATCH-api-maintenance-v1-proctor--id"></code></pre>
</div>

<form id="form-PATCH-api-maintenance-v1-proctor--id" data-method="PATCH" data-path="/api/maintenance/v1/proctor/:id" data-authed="0" data-hasfiles="0" data-headers='{"Content-Type":"application/json","Accept":"application/json"}' onsubmit="event.preventDefault(); executeTryOut('PATCH-api-maintenance-v1-proctor--id', this);">
<h3>
    Request
    <button type="button" style="background-color: #8fbcd4; padding: 5px 10px; border-radius: 5px; border-width: thin;" id="btn-tryout-PATCH-api-maintenance-v1-proctor--id" onclick="tryItOut('PATCH-api-maintenance-v1-proctor--id');">Try it out ⚡</button>
    <button type="button" style="background-color: #c97a7e; padding: 5px 10px; border-radius: 5px; border-width: thin;" id="btn-canceltryout-PATCH-api-maintenance-v1-proctor--id" onclick="cancelTryOut('PATCH-api-maintenance-v1-proctor--id');" hidden>Cancel</button>&nbsp;&nbsp;
    <button type="submit" style="background-color: #6ac174; padding: 5px 10px; border-radius: 5px; border-width: thin;" id="btn-executetryout-PATCH-api-maintenance-v1-proctor--id" hidden>Send Request 💥</button>
</h3>
<p>
<small class="badge badge-purple">PATCH</small>
 <b><code>/api/maintenance/v1/proctor/:id</b></code>
</p>
<h4 class="fancy-heading-panel"><b>URL Parameters</b></h4>
<p>
<b><code>id</code></b>&nbsp;&nbsp;<small>string</small> 
<input type="text" name="id" data-endpoint="PATCH-api-maintenance-v1-proctor--id" data-component="url" required hidden>
<br>
</p>
<h4 class="fancy-heading-panel"><b>Body Parameters</b></h4>

<p>
<b><code>first_name</code></b>&nbsp;&nbsp;<small>string</small> 
    <i>optional</i>
<input type="text" name="first_name" data-endpoint="PATCH-api-maintenance-v1-proctor--id" data-component="body" hidden>
<br>
First name of the test proctor.</p>
<p>
<b><code>last_name</code></b>&nbsp;&nbsp;<small>string</small> 
    <i>optional</i>
<input type="text" name="last_name" data-endpoint="PATCH-api-maintenance-v1-proctor--id" data-component="body" hidden>
<br>
Last name of the test proctor.</p>
<p>
<b><code>phone_number_office</code></b>&nbsp;&nbsp;<small>string</small> 
    <i>optional</i>
<input type="text" name="phone_number_office" data-endpoint="PATCH-api-maintenance-v1-proctor--id" data-component="body" hidden>
<br>
Office phone number of the test proctor:</p>
<p>
<b><code>archive</code></b>&nbsp;&nbsp;<small>boolean</small> 
    <i>optional</i>
    <label data-endpoint="PATCH-api-maintenance-v1-proctor--id" hidden><input type="radio" name="archive" value="true" data-endpoint="PATCH-api-maintenance-v1-proctor--id" data-component="body" ><code>true</code></label>
<label data-endpoint="PATCH-api-maintenance-v1-proctor--id" hidden><input type="radio" name="archive" value="false" data-endpoint="PATCH-api-maintenance-v1-proctor--id" data-component="body" ><code>false</code></label>
<br>
Archive status of test proctor (archive=true users cannot log in).</p>
<p>
<b><code>resend_email</code></b>&nbsp;&nbsp;<small>boolean</small> 
    <i>optional</i>
    <label data-endpoint="PATCH-api-maintenance-v1-proctor--id" hidden><input type="radio" name="resend_email" value="true" data-endpoint="PATCH-api-maintenance-v1-proctor--id" data-component="body" ><code>true</code></label>
<label data-endpoint="PATCH-api-maintenance-v1-proctor--id" hidden><input type="radio" name="resend_email" value="false" data-endpoint="PATCH-api-maintenance-v1-proctor--id" data-component="body" ><code>false</code></label>
<br>
Set to "true" to re-send the proctor welcome email.</p>
<p>
<b><code>password</code></b>&nbsp;&nbsp;<small>string</small> 
    <i>optional</i>
<input type="text" name="password" data-endpoint="PATCH-api-maintenance-v1-proctor--id" data-component="body" hidden>
<br>
Set the user's password.</p>
</form>


