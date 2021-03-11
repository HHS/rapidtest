# RapidTest App Deployment Guide

## Definitions

1. **Managed deployments** - STRAC-maintained software installation and support.
2. **Open source deployments** - Open source version of RapidTest application, installed using the users' own resources.

## Overview

The *RapidTest application* is a React/Node.js web application used to accept rapid COVID-19 test results, patient demographics, and patient symptoms. Results are accepted into an MSSQL database. A separate PHP application reads results from the database, generates results PDFs, and sends notifications to users via text or email.

Maintenance of the system requires functional knowledge with the following technologies:
* Windows Server
* CentOS 8 Server
* MSSQL
* Apache
* Docker or other npm/node deployments

Development of the system requires fluency in:
* MSSQL
* React/Node.js
* PHP

## Installation prerequisites

## Database [for *open source deployments*]

### Server resources (per peak 20,000 tests/day)
- [ ] Windows Server 2016/2019
- [ ] 2 GHz x 16 Core Xeon E55xx or equivalent.
- [ ] 32 GB RAM.
- [ ] 300 GB SSD storage or equivalent. (Potential expansion needed as more tests are completed)

## App (web serving)

### Server resources (per peak 5,000 tests/day) [for *open source deployments*]
- [ ] CentOS Linux 8.0 with root access provided.
- [ ] 2 GHz x 4 Core Xeon E55xx or equivalent.
- [ ] 16 GB RAM.
- [ ] 100 GB SSD storage or equivalent.

### External resources

- [ ] Dedicated subdomain.
- [ ] Dedicated SSL key for subdomain (not wildcard).
- [ ] Scandit Web SDK key (3 scans/test).
- [ ] Google Firebase API key (Handles user accounts).
- [ ] Google ReCAPTCHA v3 key.
- [ ] Google Places API key (1 request/test).
- [ ] Optional - Load balancing provider, if you will house multiple app servers (Cloudflare, AWS, etc).

## Results delivery (web serving and messaging)

### Server resources (per 500,000 total tests) [for *open source deployments*]
- [ ] CentOS Linux 8.0 with root access provided.
- [ ] 2 GHz x 4 Core Xeon E55xx or equivalent.
- [ ] 32 GB RAM.
- [ ] 1 TB storage.

### External resources

- [ ] Dedicated subdomain.
- [ ] Dedicated SSL key for subdomain (not wildcard).
- [ ] Twilio API key (1 text message/test).
- [ ] Mailgun API key (1 email/test).
