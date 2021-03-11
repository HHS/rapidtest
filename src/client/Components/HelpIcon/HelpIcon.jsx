import React, {useRef, useState} from "react";
import {IconContext} from "react-icons";
import {Overlay, Tooltip} from "react-bootstrap";
import PropTypes from "prop-types";
import {
  IoIosHelpCircleOutline,
} from 'react-icons/io';

export default function HelpIcon(props) {
  const [show, setShow] = useState(false);
  const target = useRef(null);

  return (
    <>
      <span ref={target} onClick={() => setShow(!show)}>
        <IconContext.Provider value={{ className: "icon" }}>
          <IoIosHelpCircleOutline/>
        </IconContext.Provider>
      </span>
      <Overlay target={target.current} show={show} rootClose={true} onHide={() => setShow(false)} placement="right">
        {_props => (
          <Tooltip id="overlay-tooltip" {..._props} show={_props.show.toString()}>
            {props.tooltip}
          </Tooltip>
        )}
      </Overlay>
    </>
  );
}

HelpIcon.propTypes = {
  tooltip: PropTypes.string,
};