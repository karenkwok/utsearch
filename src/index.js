import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

class SignupForm extends React.Component {
  render() {
    return (
      <div>
        <h1>UTSearCh</h1>
        <h2>Sign In or Sign Up to continue</h2>
      </div>
    );
  }
}

ReactDOM.render(<SignupForm></SignupForm>, document.getElementById("root"));

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
