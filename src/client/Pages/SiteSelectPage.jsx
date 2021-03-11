import React, { Component } from 'react';
import PropTypes from "prop-types";
import Cookies from 'universal-cookie';
import {CenteredRow} from "../Components/FormGroups";
import {StatusBar} from "../Components/Misc";
import {SitePrevious, SiteSelect} from "../Components/SiteSelect";
import {Row, Col} from 'react-bootstrap';
import mysql from "../mysql";
import {Redirect} from "react-router-dom";
import {getRouterBaseUrl} from "../util/router";

export default class SiteSelectPage extends Component {
  cookies = new Cookies();
  rootDir = getRouterBaseUrl() + '/';
  constructor(props) {
    super(props);
    this.state = {
      siteType: null,
      noOptionsMessage: null,
      bookmarks: [],
      redirect: false
    };
  }

  componentDidMount() {
    this._ismounted = true;
    this.loadBookmarks();
  }

  componentWillUnmount() {
    this._ismounted = false;
    clearTimeout(this.bookmarkTimeout);
  }

  getSavedSites = (uid) => {
    return this.cookies.get('user-' + uid) || [];
  };

  appendSavedSites = (id, uid) => {
    let sites = this.getSavedSites(uid);
    const maxSaves = 10;
    const parsed = parseInt(id);
    if (!isNaN(parsed)) {
      sites = sites.filter(site => site !== parsed);
      sites.unshift(parsed);
      if (sites.length > maxSaves) sites.pop();
      this.cookies.set('user-' + uid, sites);
    }
    this.loadSites(sites, (result) => this.setState({
      bookmarks: result,
      redirect: true
    }));
  };

  loadSites = (inputValue, callback) => {
    Promise.resolve().then(async () => {
      mysql.postFromObj(
        `${this.rootDir}api/search_sites`,
        {
          email: await this.props.firebase.getEmail(),
          firebase_token: await this.props.firebase.getToken(),
          site_type: this.state.siteType,
          searchTerm: inputValue
        },
        result => {
          if (this._ismounted) {
            let a = [];
            if (typeof inputValue === 'string') {
              if (Array.isArray(result.sites)) {
                a = result.sites;
                this.setState({noOptionsMessage: "No results"}, () => callback(a));
              } else if (result.sites.hidden) {
                a = [];
                this.setState({noOptionsMessage: result.sites.hidden + " sites found"}, () => callback(a));
              } else if (result.sites.char) {
                a = [];
                this.setState({noOptionsMessage: "Type in " + result.sites.char + " more"}, () => callback(a));
              } else {
                this.setState({noOptionsMessage: "Cannot find site"}, () => callback(a));
              }
            } else {
              if (Array.isArray(result.sites)) {
                a = result.sites;
              }
              callback(a);
            }
          }
        },
        res => {
          if (this._ismounted) {
            callback([]);
            console.error('Cannot search sites with id. Reason:', res);
          }
        }
      );
    });
  };

  loadBookmarks = () => {
    const handler = () => {
      this.bookmarkTimeout = setTimeout(() => {
        if (!this.props.firebase.auth.currentUser || this.props.loading) {
          handler();
        } else {
          const uid = this.props.firebase.auth.currentUser.uid;
          if (this.getSavedSites(uid)) {
            this.setState({loadingVisited: true}, () => {
              this.loadSites(this.getSavedSites(uid), (result) => {
                const site = this.cookies.get('site-return-' + uid);
                if (site && result.find(res => res.value === site.value)) {
                  this.setState({ patient_site_assigned: site });
                  this.cookies.remove('site-return-' + uid);
                }
                this.setState({bookmarks: result, loadingVisited: false})
              });
            });

          } else {
            this.setState({bookmarks: [], loadingVisited: false});
          }
        }
      }, 1000);
    }

    this.setState({loadingVisited: true});
    handler();
  }

  render() {
    const { noOptionsMessage, bookmarks, patient_site_assigned, loadingVisited } = this.state;
    const { statusBarProps, loading, selectOptions, onSubmit } = this.props;

    return <CenteredRow xs={'12'} sm={'8'} md={'6'} lg={'5'}>
      <Row>
        <Col className={"mb-3"}>
          <StatusBar {...statusBarProps}/>
        </Col>
      </Row>
      <Row>
        <Col className={"mb-3"}>
          <SiteSelect
            noOptionsMessage={noOptionsMessage}
            siteSelected={patient_site_assigned}
            onSiteSelected={(site) => this.setState({ patient_site_assigned: site })}
            onSiteType={(siteType) => this.setState({siteType})}
            loadSites={this.loadSites}
            selectOptions={selectOptions}
            loading={loading}
            onSubmit={() => {
              if (patient_site_assigned) {
                this.appendSavedSites(patient_site_assigned.value, this.props.firebase.auth.currentUser.uid);
                this.cookies.set('site-return-' + this.props.firebase.auth.currentUser.uid, patient_site_assigned);
                onSubmit(patient_site_assigned);
              }
            }}
          />
        </Col>
      </Row>
      <Row>
        <Col className={"mb-3"}>
          <SitePrevious
            onSiteSelected={(site) => this.setState({ patient_site_assigned: site })}
            sitesSaved={bookmarks}
            loading={loading || loadingVisited}
          />
        </Col>
      </Row>
      {this.state.redirect ? <Redirect to={'/dashboard'}/> : null}
    </CenteredRow>
  }
}

SiteSelectPage.propTypes = {
  statusBarProps: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
  firebase: PropTypes.object.isRequired,
  selectOptions: PropTypes.object.isRequired,
  onSubmit: PropTypes.func.isRequired
};
