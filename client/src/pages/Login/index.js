import React, { useState } from "react";
import "./index.css";
import {
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  Card,
  CardBody,
  CardTitle,
  CardSubtitle,
} from "reactstrap";
import { login } from "../../utils/API";
import { Redirect } from "react-router-dom";
import { useAppContext } from "../../utils/globalStates/stateProvider";
import { ADD_USER_INFO } from "../../utils/globalStates/actions";

function Login() {
  const [input, setInput] = useState({
    email: "",
    password: "",
  });
  const [warning, setWarning] = useState();
  const [state, dispatch] = useAppContext();

  const validateInput = () => {
    const emailRegex = new RegExp(/^(.+)@(.+)\.(.+)$/i);
    return emailRegex.test(input.email);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateInput()) {
      console.log("here");
      login(input).then((response) => {
        const { data } = response;
        console.log(data);
        if (data.status === "OK") {
          console.log("login screen");
          dispatch({ type: ADD_USER_INFO, payload: data });
        } else if (data.status === "ERROR") {
          setWarning(data.message);
        }
      });
    } else {
      setWarning("INVALID INPUT!");
    }
  };

  const handleInputChange = ({ target: { name, value } }) =>
    setInput({ ...input, [name]: value });

  return (
    <>
      {state.user ? <Redirect to="/budget" /> : ""}
      <Card className="user-div" color="" body={true}>
        <CardBody className="login-body">
          <Form className="login-form" onSubmit={handleSubmit}>
            <CardTitle className="text-center">
              <h1>Y.A.B.A</h1>
            </CardTitle>
            <CardSubtitle className="text-center">
              {state.message || "Welcome!"}
            </CardSubtitle>
            <CardSubtitle className="text-center" style={{ color: "red" }}>
              {warning}
            </CardSubtitle>
            <FormGroup>
              <Label>Email</Label>
              <Input
                name="email"
                type="email"
                placeholder="john@email.com"
                onChange={handleInputChange}
              ></Input>
            </FormGroup>
            <FormGroup>
              <Label>Password</Label>
              <Input
                name="password"
                type="password"
                placeholder="Password"
                onChange={handleInputChange}
              ></Input>
            </FormGroup>
            <Button className="btn-color btn-lg btn-dark btn-block">
              Log In{" "}
            </Button>
            <div className="text-center">
              <a href="/register">Register</a>
              <span className="p-2"></span>
              <a href="/register">Forgot Password</a>
            </div>
          </Form>
        </CardBody>
      </Card>
    </>
  );
}

export default Login;
