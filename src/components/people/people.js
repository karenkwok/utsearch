import { useContext } from "react";
import "./people.css";
import "../../index.css";
import Maps from "./maps/maps";
import Tabs from "../../components/tabs";
import { Context } from "../../Store";
import { client } from "../../index";
import { gql } from "@apollo/client";
import { Link } from "react-router-dom";

const EDIT_FRIEND_RESPONSE = gql`
  mutation($user: String!, $acceptRequest: Boolean!) {
    FriendRequestResponse(user: $user, acceptRequest: $acceptRequest) {
      username
      email
      bio
      tags
      friends
      friendRequestsReceived
      friendRequestsSent
      blocked
    }
  }
`;

function People() {
  const [state, dispatch] = useContext(Context);

  let blockedResults;
  if (state.user.blocked.length === 0) {
    blockedResults = <div>You're not blocking anyone &#128526;</div>;
  } else {
    blockedResults = (
      <div>
        {state.user.blocked.map((block) => {
          return (
            <div>
              <Link className="people" to={"/profile/" + block}>
                {block}
              </Link>
            </div>
          );
        })}
      </div>
    );
  }

  let friendResults;
  if (state.user.friends.length === 0) {
    friendResults = <div>You have no friends &#128546;</div>;
  } else {
    friendResults = (
      <div>
        {state.user.friends.map((friend) => {
          return (
            <div>
              <Link className="people" to={"/profile/" + friend}>
                {friend}
              </Link>
            </div>
          );
        })}
      </div>
    );
  }

  let friendRequestResults;
  if (state.user.friendRequestsReceived.length === 0) {
    friendRequestResults = <div>You have no friend requests &#128550;</div>;
  } else {
    friendRequestResults = (
      <div>
        {state.user.friendRequestsReceived.map((friendRequest) => {
          return (
            <div>
              <Link className="people" to={"/profile/" + friendRequest}>
                {friendRequest}
              </Link>
              <button
                id="people-accept"
                onClick={() => {
                  client
                    .mutate({
                      variables: { user: friendRequest, acceptRequest: true },
                      mutation: EDIT_FRIEND_RESPONSE,
                    })
                    .then((result) => {
                      dispatch({
                        type: "SET_USER",
                        payload: result.data.FriendRequestResponse,
                      });
                    });
                }}
              >
                Accept
              </button>
              <button
                id="people-reject"
                onClick={() => {
                  client
                    .mutate({
                      variables: { user: friendRequest, acceptRequest: false },
                      mutation: EDIT_FRIEND_RESPONSE,
                    })
                    .then((result) => {
                      dispatch({
                        type: "SET_USER",
                        payload: result.data.FriendRequestResponse,
                      });
                    });
                }}
              >
                Reject
              </button>
            </div>
          );
        })}
      </div>
    );
  }
  return (
    //Tabs functionality from https://www.digitalocean.com/community/tutorials/react-tabs-component
    <div id="button-wrapper">
      <Tabs>
        <div className="profile-buttons" label="Requests">
          {friendRequestResults}
        </div>
        <div className="profile-buttons" label="Friends">
          {friendResults}
        </div>
        <div className="profile-buttons" label="Blocked">
          {blockedResults}
        </div>
      </Tabs>
      <Maps></Maps>
    </div>
  );
}

export default People;
