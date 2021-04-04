/* jshint esversion: 6 */

//TODO why does it crash when you refresh????

import React, { useContext, useEffect, useState, useRef } from 'react';
import { Context } from "../Store";
import io from "socket.io-client";
import Peer from "simple-peer";
import "../index.css";
import styled from "styled-components";

/*
Base Video Chat Structure
https://github.com/coding-with-chaim/react-video-chat
https://www.youtube.com/watch?v=BpN6ZwFjbCY

Handling Disconnected Call
https://www.youtube.com/watch?v=7a_vgmEZrhE
*/

const Container = styled.div`
  height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  justify-content: center;
  margin: 0 0 10px 0;
`;

const Title = styled.h1`
  margin: 0;
`;

const Box = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: center;
  width: 50%;
`;

const UserList = styled.div`
  display: flex;
  flex-direction: column;
  height: 100px;
  overflow: scroll;
  padding: 20px;
  min-height: 0;
`;

//TODO put an image?
const AudioPlayer = styled.audio`

`;

const EmptyAudio = styled.div`
  display: none;
`;

function CallComponent(){
  // States for the call connection steps
  const [yourID, setYourID] = useState("");
  const [users, setUsers] = useState({});
  const [stream, setStream] = useState();
  const [callerStream, setCallerStream] = useState();
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState("");
  const [callerSignal, setCallerSignal] = useState();
  const [callAccepted, setCallAccepted] = useState(false);

  const [callerUsername, setCallerUsername] = useState("");

  const [state, dispatch] = useContext(Context);

  // Audio Call Button option states
  const [muteBtnState, setMuteBtnState] = useState("Mute Me");
  const [muteCallerBtnState, setMuteCallerBtnState] = useState("Mute");

  //Hooks for the audio streams
  const userAudio = useRef();
  const partnerAudio = useRef();

  //Hooks for the socket and peer
  const socket = useRef();
  const peerRef = useRef();

  /* Events for the connected user */
  function connectUser() {
    socket.current = io.connect('/video-chat');

    //Get the user's microphone as the stream
    navigator.mediaDevices.getUserMedia({ video: false, audio: true }).then(stream => {
      setStream(stream);
      if (userAudio.current) {
        userAudio.current.srcObject = stream;
      }
    })

    socket.current.on("yourID", (id) => {
      setYourID(id);
      socket.current.emit("ConnectUsername", {username: state.user.username});
    });

    socket.current.on("allUsers", (users) => {
      setUsers(users);
    })

    socket.current.on("hey", (data) => {
      setReceivingCall(true);
      setCaller(data.from);
      setCallerSignal(data.signal);

      setCallerUsername(data.fromUsername);
    })

    socket.current.on("user left", () => {
      setMuteBtnState("Mute Me");
      setMuteCallerBtnState("Mute");
      socket.current.destroy();
      setCallAccepted(false);
      connectUser();
    })
  }

  /* Upon clicking past intro, automatically attempt to connect user */
  useEffect(() => {
    connectUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  var signOutButtonXpath = "//li[text()='Sign Out']";
  var signOutButton = document.evaluate(signOutButtonXpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

  var profileXpath = "//li[text()='Profile']";
  var profileButton = document.evaluate(profileXpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

  var searchXpath = "//li[text()='Search']";
  var searchButton = document.evaluate(searchXpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

  signOutButton.onclick = function() {
    leavePageDisconnect();
  }

  profileButton.onclick = function() {
    leavePageDisconnect();
  }

  searchButton.onclick = function() {
    leavePageDisconnect();
  }

  /* Connection events if user is the caller */
  function callPeer(id) {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream,
    });

    peer.on("signal", data => {
      socket.current.emit("callUser", { userToCall: id, signalData: data, from: yourID })
    })

    peer.on("stream", stream => {
      setCallerStream(stream);
      if (partnerAudio.current) {
        partnerAudio.current.srcObject = stream;
      }
    });

    socket.current.on("callAccepted", data => {
      setUsers({});

      setCallAccepted(true);
      setReceivingCall(false);
      socket.current.removeListener('allUsers');
      peer.signal(data.signal);
      setCallerUsername(data.username);
    })
    peerRef.current = peer;
  }

  /* Accept the call and share stream from receiving end */
  function acceptCall() {
    setCallAccepted(true);
    setReceivingCall(false);
    socket.current.removeListener('allUsers');
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream,
    });
    peer.on("signal", data => {
      socket.current.emit("acceptCall", { signal: data, to: caller, from: yourID })
    })

    peer.on("stream", stream => {
      setUsers({});
      setReceivingCall(false);
      setCallerStream(stream);

      partnerAudio.current.srcObject = stream;
    });
    peerRef.current = peer;

    peer.signal(callerSignal);
  }

  function leavePageDisconnect() {
    stream.getTracks().forEach(function(track) {
      track.stop();
    });

    socket.current.destroy();
    setCallAccepted(false);
    setMuteBtnState("Mute Me");
    setMuteCallerBtnState("Mute");
  }

  // Disconnect from the call
  function disconnectCall() {
    socket.current.destroy();
    setCallAccepted(false);
    setMuteBtnState("Mute Me");
    setMuteCallerBtnState("Mute");
    connectUser();
  }

  /* Functions for muting sound */
  function muteMySound(){
    if (muteBtnState === "Mute Me") {
      setMuteBtnState("Unmute Me");
    } else {
      setMuteBtnState("Mute Me");
    }
    stream.getAudioTracks()[0].enabled = !stream.getAudioTracks()[0].enabled;
  }

  function muteTheirSound(){
    if (muteCallerBtnState === "Mute") {
      setMuteCallerBtnState("Unmute");
    } else {
      setMuteCallerBtnState("Mute");
    }
    callerStream.getAudioTracks()[0].enabled = !callerStream.getAudioTracks()[0].enabled;
  }

  /* Conditional Elements */

  let userAudioPlayer;
  if (stream) {
    userAudioPlayer = (
      <AudioPlayer playsInline muted ref={userAudio} autoPlay />
    );
  }

  let partnerAudioPlayer;
  if (callAccepted) {
    partnerAudioPlayer = (
      <AudioPlayer playsInline ref={partnerAudio} autoPlay />
    );
  } else {
    partnerAudioPlayer = (
      <EmptyAudio />
    );
  }

  let disconnectButton;
  if (!receivingCall && Object.keys(users).length === 0) {
    disconnectButton = (
      <div>
        <button onClick={disconnectCall}>Disconnect</button>
      </div>
    )
  }

  let videoText;
  if (!receivingCall) {
    videoText = (
      <>
        <Box>You</Box>
        <Box>{callerUsername}</Box>
      </>
    )
  } else {
    videoText = (
      <>
        <Box>You</Box>
        <Box>
            {callerUsername} is calling you
        </Box>
      </>
    )
  }

  let userButtons;
  if (Object.keys(users).length > 1) {
    userButtons = (
      <UserList>
        <Title>Current Callers Available:</Title>
        {users.map((user, index) => {

          if (user[0] === yourID) {
            return null;
          }
          console.log(state.user.blocked);
          return (
            <button key={user[0]} onClick={() => callPeer(user[0])}>Call {user[1]}</button>
          );
        })}
      </UserList>
    )
  } else if (!callAccepted) {
    userButtons = (
      <UserList>You are the only one here</UserList>
    )
  }

  let muteButtons;
  if (callAccepted) {
    muteButtons =  (
      <>
      <Box>
      <button key="muteMySound" onClick={() => muteMySound()}>{muteBtnState}</button>
      </Box>

      <Box>
      <button key="muteTheirSound" onClick={() => muteTheirSound()}>{muteCallerBtnState}</button>
      </Box>
      </>
    )
  } else {
    if (!receivingCall) {
      muteButtons =  (
        <>
          <Box>
            <button key="muteMySound" onClick={() => muteMySound()}>{muteBtnState}</button>
          </Box>

          <Box></Box>
        </>
      )
    } else {
      muteButtons =  (
        <>
          <Box>
            <button key="muteMySound" onClick={() => muteMySound()}>{muteBtnState}</button>
          </Box>

          <Box>
              <button onClick={acceptCall}>Accept</button>
          </Box>
        </>
      )
    }
  }

  /* Render the elements onto the page */
  return (
    <Container>
      <Row>
        <Title>UTSCall - Call Your Friends!</Title>
      </Row>
      <Row>
        {userAudioPlayer}
        {partnerAudioPlayer}
      </Row>
      <Row>
        {videoText}
      </Row>
      <Row>
        {muteButtons}
      </Row>

      <Row>
        {userButtons}
      </Row>
      <Row>
        {disconnectButton}
      </Row>
    </Container>
  );
}

export default CallComponent;
