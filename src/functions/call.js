/* jshint esversion: 6 */

import React from 'react';
import "./randomChat.css";
import "../index.css";

import CallComponent from "../components/call-component";



class Call extends React.Component {
  constructor(props) {
    super(props);
    this.state = {call: false};
  }

  startMeeting = ev => {
    this.setState({ call: !this.state.call });
  }

  render() {
    return (

      <div id="random-chat-wrapper">

        {!this.state.call ?
          <>
            <h1>UTSCall - Call Your Friends</h1>
            <h3>Welcome to UTSCall!</h3>
            <p>
              Here, you will be shown a list of users online and you can call! Blocked users will not be shown.
            </p>

            <button id="meet-student-button" onClick={this.startMeeting}>Let's Call!</button>
          </>
          :
          <CallComponent/>
        }
      </div>
    );
  }
}

export default Call;
