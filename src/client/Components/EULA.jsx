import React, {useEffect} from "react";
import PropTypes from "prop-types";
import {IconContext} from "react-icons";
import {BsAward} from "react-icons/bs";
import {
  Form,
  Button
} from 'react-bootstrap';
import axios from "axios";
import Bugsnag from "@bugsnag/js";

export function EULA (props) {
  const {showModal, uid, eula, setEula} = props;
  const storageKey = 'accepted-eula1-' + uid;
  const onClose = () => {};
  const accept = (e) => {
    localStorage.setItem(storageKey, 'accepted yes');
    showModal(false, false);
    onClose(e);
  };
  const checkForEula = () => {
    axios.get('api/eula').then(res => {
      const data = res.data;
      setEula(data.eula);
    }).catch(e => {
      Bugsnag.notify(e);
    });
  };

  useEffect(() => {
    if (uid) {
      const acceptedEULA = localStorage.getItem(storageKey);
      if (!acceptedEULA) {
        if (!eula) {
          checkForEula();
        } else {
          showModal(
            <span>
              <IconContext.Provider value={{ className: "text-warning icon m-2", style: {fontSize: "140%", verticalAlign: "bottom"}}}>
                <span><BsAward/></span>
              </IconContext.Provider>
              End-user license agreement
            </span>,
            <div>
              <Form.Control as="textarea" rows={10} disabled value={eula}/>
            </div>,
            onClose,
            <span>
              <Button variant="primary" className={'m-2'} onClick={accept}>I Accept</Button>
            </span>
          );
        }
      }
    }
  }, [uid,eula]);

  return null;
}

EULA.propTypes = {
  showModal: PropTypes.func.isRequired,
  uid: PropTypes.string,
  eula: PropTypes.string,
  setEula: PropTypes.func.isRequired,
};

