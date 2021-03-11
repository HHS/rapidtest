import React, {useEffect, useState} from 'react';
import PropTypes from "prop-types";
import {
  Button,
  Card,
  Col,
  Row,
  Form
} from "react-bootstrap";
import {
  Link,
  useLocation
} from "react-router-dom";
import {
  FormGroupText
} from "./FormGroups";
import config from "../config";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function iOS() {
  return [
    'iPad Simulator',
    'iPhone Simulator',
    'iPod Simulator',
    'iPad',
    'iPhone',
    'iPod'
  ].includes(navigator.platform)
    // iPad on iOS > 13 detection
    || (navigator.userAgent.includes("Mac") && "ontouchend" in document)
}

function isSafari() {
  return !!navigator.userAgent.match(/Version\/[\d.]+.*Safari/);
}

export function NotSafari () {
  return <Card body>
    <Row>
      <Col>
        On an iPhone or iPad, please use Safari.
      </Col>
    </Row>
  </Card>;
}

export function Login(props) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const { email, onEmail, submit, loading, showHelp } = props;
  const isIosAndNotSafari = iOS() && !isSafari();

  const handleLogin = () => {
    submit(email || '', password || '', () => {}, () => {
      setError(true);
      setPassword('');
    });
  }

  if (isIosAndNotSafari) {
    return <NotSafari/>
  }

  return <Card body>
    <Form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        handleLogin();
      }}
    >
      <Row>
        <FormGroupText
          label={'Test Administrator Email'}
          type={'email'}
          prop={'email'}
          errors={{email: error}}
          form={{email: email}}
          setForm={form => {
            onEmail(form.email ?? '');
            setError(false);
          }}
          errorMsg={""}/>
      </Row>
      <Row>
        <FormGroupText
          type={'password'}
          label={'Password'}
          prop={'password'}
          errors={{password: error}}
          form={{password: password}}
          setForm={
            form => {
              setPassword(form.password ?? '');
              setError(false);
            }}
          errorMsg={""}/>
      </Row>
      <Row>
        <Form.Group as={Col}>
          <Link
            to={'/reset'}
            className="small">
            Forgot Password or First Login?
          </Link>
        </Form.Group>
      </Row>
      {config.client.noAccount ? <Row><Form.Group as={Col}>
        <a
          className="small"
          href={config.client.noAccount}>
          {"Don't have an account?"}
        </a>
      </Form.Group></Row> : null}
      <Col xs={'auto'}>
        <Button
          variant="outline-info"
          onClick={() => showHelp()}
          disabled={loading}
          className="float-left"
        >
          Help
        </Button>
      </Col>
      <Button
        className={"float-right"}
        type="submit"
        variant="primary"
        disabled={loading}
        size={'lg'}
      >
        Login
      </Button>
    </Form>
  </Card>;
}
Login.propTypes = {
  email: PropTypes.string.isRequired,
  onEmail: PropTypes.func.isRequired,
  submit: PropTypes.func.isRequired,
  showHelp: PropTypes.func.isRequired,
  loading: PropTypes.bool
};

export function Reset(props) {
  const { email, onEmail, submit, cancel, loading } = props;

  const handleReset = () => {
    submit();
  }

  let query = useQuery();

  useEffect(() => {
    const email = query.get("email") ?? '';
    if (email) onEmail(email);
  }, []);

  return <Card body>
    <Form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        handleReset();
      }}
    >
      <Row>
        <FormGroupText
          label={'Confirm your email address.'}
          type={'email'}
          prop={'email'}
          errors={{email: false}}
          form={{email: email}}
          setForm={form => onEmail(form.email ?? '')}
          errorMsg={""}/>
      </Row>
      <Row>
        <Form.Group as={Col}>
          We will send you an email with a link to reset your password.
        </Form.Group>
      </Row>
      <Button
        className={"float-right ml-2"}
        type="submit"
        variant="primary"
        disabled={loading}
      >
        Send
      </Button>
      {typeof cancel === "undefined" ?
        <Button
          className={"float-right"}
          variant="secondary"
          disabled={loading}
          to="/login"
          as={Link}
        >
          Cancel
        </Button>
        :
        <Button
          className={"float-right"}
          variant="secondary"
          disabled={loading}
          onClick={cancel}
        >
          Cancel
        </Button>
      }
    </Form>
  </Card>;
}
Reset.propTypes = {
  email: PropTypes.string.isRequired,
  onEmail: PropTypes.func.isRequired,
  submit: PropTypes.func.isRequired,
  cancel: PropTypes.func,
  loading: PropTypes.bool,
};
