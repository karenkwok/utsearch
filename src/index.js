import React from "react";
import ReactDOM from "react-dom";
import "./index.css";

class SignupForm extends React.Component {
  render() {
    return (
      <div>
        <h1>UTSearCh</h1>
        <h2>Sign Up</h2>
        <form id="signupform">
          <p className="signupform-labels">Username</p>
          <input type="text" className="signupform-fields" name="username" />

          <p className="signupform-labels">Password</p>
          <input
            type="password"
            className="signupform-fields"
            name="password"
          />

          <p className="signupform-labels">Email</p>
          <input type="text" className="signupform-fields" name="email" />

          <input type="submit" id="createaccount-btn" value="Create Account" />
        </form>
      </div>
    );
  }
}

ReactDOM.render(<SignupForm></SignupForm>, document.getElementById("root"));
