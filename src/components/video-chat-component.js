import React, { useContext, useEffect, useState, useRef } from "react";
import { Context } from "../Store";
import io from "socket.io-client";
import Peer from "simple-peer";
import "../index.css";
import "./chat-components.css";
import { useHistory } from "react-router-dom";
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

const StrangerList = styled.div`
  display: flex;
  flex-direction: column;
  height: 100px;
  overflow: scroll;
  padding: 20px;
  min-height: 0;
`;

const Video = styled.video`
  border: 1px solid blue;
  width: 320px;
  height: 240px;
  margin: 10px;
`;

const EmptyVideo = styled.div`
  border: 1px solid blue;
  background-color: black;
  width: 320px;
  height: 240px;
  border-radius: 10px;
  margin: 10px;
`;

function VideoChatComponent() {
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

  const [state] = useContext(Context);

  // Video Call Button option states
  const [muteBtnState, setMuteBtnState] = useState("Mute Me");
  const [hideBtnState, setHideBtnState] = useState("Hide Me");
  const [muteCallerBtnState, setMuteCallerBtnState] = useState("Mute");
  const [hideCallerBtnState, setHideCallerBtnState] = useState("Hide");

  //Hooks for the video streams
  const userVideo = useRef();
  const partnerVideo = useRef();

  //Hooks for the socket and peer
  const socket = useRef();
  const peerRef = useRef();

  const history = useHistory();
  const [locationKeys, setLocationKeys] = useState([]);

  /* Events for the connected user */
  function connectUser() {
    socket.current = io.connect("/video-chat");

    socket.current.on("yourID", (id) => {
      setYourID(id);
      socket.current.emit("ConnectUsername", { username: state.user.username });
    });

    socket.current.on("allUsers", (users) => {
      setUsers(users);
    });

    socket.current.on("hey", (data) => {
      setReceivingCall(true);
      setCaller(data.from);
      setCallerSignal(data.signal);

      setCallerUsername(data.fromUsername);
    });

    socket.current.on("user left", () => {
      disconnectCall();
    });
  }

  /* Upon clicking past intro, automatically attempt to connect user */
  useEffect(() => {
    //Get the user's webcam as the stream
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setStream(stream);
        if (userVideo.current) {
          userVideo.current.srcObject = stream;
        }
      });

    connectUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return history.listen((location) => {
      if (history.action === "PUSH") {
        setLocationKeys([location.key]);
        leavePageDisconnect();
      }

      if (history.action === "POP") {
        if (locationKeys[1] === location.key) {
          setLocationKeys(([_, ...keys]) => keys);
          // Handle forward event
          leavePageDisconnect();
        } else {
          setLocationKeys((keys) => [location.key, ...keys]);
          // Handle back event
          leavePageDisconnect();
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationKeys, stream]);

  var signOutButtonXpath = "//li[text()='Sign Out']";
  var signOutButton = document.evaluate(
    signOutButtonXpath,
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  ).singleNodeValue;

  signOutButton.onclick = function () {
    leavePageDisconnect();
  };

  /* Connection events if user is the caller */
  function callPeer(id) {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream,
    });

    peer.on("signal", (data) => {
      socket.current.emit("callUser", {
        userToCall: id,
        signalData: data,
        from: yourID,
      });
    });

    peer.on("stream", (stream) => {
      setCallerStream(stream);
      if (partnerVideo.current) {
        partnerVideo.current.srcObject = stream;
      }
    });

    socket.current.on("callAccepted", (data) => {
      setUsers({});

      setCallAccepted(true);
      setReceivingCall(false);
      socket.current.removeListener("allUsers");
      peer.signal(data.signal);
      setCallerUsername(data.username);
    });
    peerRef.current = peer;
  }

  /* Accept the call and share stream from receiving end */
  function acceptCall() {
    setCallAccepted(true);
    setReceivingCall(false);
    socket.current.removeListener("allUsers");
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream,
    });
    peer.on("signal", (data) => {
      socket.current.emit("acceptCall", {
        signal: data,
        to: caller,
        from: yourID,
      });
    });

    peer.on("stream", (stream) => {
      setUsers({});
      setReceivingCall(false);
      setCallerStream(stream);

      partnerVideo.current.srcObject = stream;
    });
    peerRef.current = peer;

    peer.signal(callerSignal);
  }

  function leavePageDisconnect() {
    stream.getTracks().forEach(function (track) {
      track.stop();
    });

    socket.current.destroy();
    setCallAccepted(false);
    setCallerUsername("");
    setMuteBtnState("Mute Me");
    setHideBtnState("Hide Me");
    setMuteCallerBtnState("Mute");
    setHideCallerBtnState("Hide");
  }

  // Disconnect from the call
  function disconnectCall() {
    socket.current.destroy();
    setCallAccepted(false);
    setCallerUsername("");
    setMuteBtnState("Mute Me");
    setHideBtnState("Hide Me");
    setMuteCallerBtnState("Mute");
    setHideCallerBtnState("Hide");
    connectUser();
  }

  /* Functions for muting/hiding video/sound */
  function muteMyVideo() {
    if (hideBtnState === "Hide Me") {
      setHideBtnState("Show Me");
    } else {
      setHideBtnState("Hide Me");
    }
    stream.getVideoTracks()[0].enabled = !stream.getVideoTracks()[0].enabled;
  }

  function muteMySound() {
    if (muteBtnState === "Mute Me") {
      setMuteBtnState("Unmute Me");
    } else {
      setMuteBtnState("Mute Me");
    }
    stream.getAudioTracks()[0].enabled = !stream.getAudioTracks()[0].enabled;
  }

  function muteTheirVideo() {
    if (hideCallerBtnState === "Hide") {
      setHideCallerBtnState("Show");
    } else {
      setHideCallerBtnState("Hide");
    }
    callerStream.getVideoTracks()[0].enabled = !callerStream.getVideoTracks()[0]
      .enabled;
  }

  function muteTheirSound() {
    if (muteCallerBtnState === "Mute") {
      setMuteCallerBtnState("Unmute");
    } else {
      setMuteCallerBtnState("Mute");
    }
    callerStream.getAudioTracks()[0].enabled = !callerStream.getAudioTracks()[0]
      .enabled;
  }

  function goToProfile() {
    socket.current.destroy();
    setCallAccepted(false);
    setCallerUsername("");
    setMuteBtnState("Mute Me");
    setMuteCallerBtnState("Mute");
    history.push("/profile/" + callerUsername);
  }

  /* Conditional Elements */

  let UserVideo;
  if (stream) {
    UserVideo = <Video playsInline muted ref={userVideo} autoPlay />;
  }

  let PartnerVideo;
  if (callAccepted) {
    PartnerVideo = <Video playsInline ref={partnerVideo} autoPlay />;
  } else {
    PartnerVideo = <EmptyVideo />;
  }

  let disconnectButton;
  if (!receivingCall && Object.keys(users).length === 0) {
    disconnectButton = (
      <div>
        <button onClick={disconnectCall}>Reconnect</button>
      </div>
    );
  }

  let videoText;
  if (callerUsername === "" || state.user.blocked.includes(callerUsername)) {
    videoText = (
      <>
        <Box>You</Box>
        <Box></Box>
      </>
    );
  } else if (!receivingCall) {
    videoText = (
      <>
        <Box>You</Box>
        <Box onClick={() => goToProfile()}>
          <span class="username">{callerUsername}</span>
        </Box>
      </>
    );
  } else {
    videoText = (
      <>
        <Box>You</Box>
        <Box>{callerUsername} is calling you</Box>
      </>
    );
  }

  let userButtons;
  let blockedCount = 0;
  for (var i = 0; i < users.length; i++) {
    if (state.user.blocked.includes(users[i][1])) {
      blockedCount++;
    }
  }
  if (Object.keys(users).length - blockedCount > 1) {
    userButtons = (
      <StrangerList>
        <Title>Current Callers Available:</Title>
        {users.map((user, index) => {
          if (user[1] === state.user.username) {
            return null;
          } else if (state.user.blocked.includes(user[1])) {
            return null;
          }

          return (
            <button key={user[0]} onClick={() => callPeer(user[0])}>
              Call {user[1]}
            </button>
          );
        })}
      </StrangerList>
    );
  } else if (!callAccepted) {
    userButtons = <StrangerList>You are the only one here</StrangerList>;
  }

  let muteButtons;
  if (callAccepted) {
    muteButtons = (
      <>
        <Box>
          <button key="muteMyVid" onClick={() => muteMyVideo()}>
            {hideBtnState}
          </button>
          <button key="muteMySound" onClick={() => muteMySound()}>
            {muteBtnState}
          </button>
        </Box>

        <Box>
          <button key="muteTheirVid" onClick={() => muteTheirVideo()}>
            {hideCallerBtnState}
          </button>
          <button key="muteTheirSound" onClick={() => muteTheirSound()}>
            {muteCallerBtnState}
          </button>
        </Box>
      </>
    );
  } else {
    if (!receivingCall) {
      muteButtons = (
        <>
          <Box>
            <button key="muteMyVid" onClick={() => muteMyVideo()}>
              {hideBtnState}
            </button>
            <button key="muteMySound" onClick={() => muteMySound()}>
              {muteBtnState}
            </button>
          </Box>

          <Box></Box>
        </>
      );
    } else if (!state.user.blocked.includes(callerUsername)) {
      muteButtons = (
        <>
          <Box>
            <button key="muteMyVid" onClick={() => muteMyVideo()}>
              {hideBtnState}
            </button>
            <button key="muteMySound" onClick={() => muteMySound()}>
              {muteBtnState}
            </button>
          </Box>

          <Box>
            <button onClick={acceptCall}>Accept</button>
          </Box>
        </>
      );
    }
  }

  /* Render the elements onto the page */
  return (
    <Container>
      <Row>
        <Title>Video Chat - Chat With Friends!</Title>
      </Row>
      <Row>
        {UserVideo}
        {PartnerVideo}
      </Row>
      <Row>{videoText}</Row>
      <Row>{muteButtons}</Row>

      <Row>{userButtons}</Row>
      <Row>{disconnectButton}</Row>
    </Container>
  );
}

export default VideoChatComponent;
