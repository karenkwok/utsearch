# GraphQL
Documentation can be found on the interactive playground: https://utsearch.tech/graphql

# REST API

## Sign-In

- description: signing in to an account
- request: `POST /signin/`
  - content-type: `application/json`
  - body: object
    - username: (string) the username of the user
    - password: (string) the password of the user
- response: 200
  - content-type: `application/json`
  - body: object
    - username: (string) the username of the user
    - email: (string) the email of the user
    - bio: (string) the biography of the user
    - tags: (list of string) the tags of the user
    - friends: (list of string) the list of usernames of the user's friends
    - friendRequestsReceived: (list of string) the list of usernames for which the user received friend requests from
    - friendRequestsSent: (list of string) the list of usernames that the user sent friend requests to
    - blocked: (list of string) the list of usernames that the user blocked
    - myLocation: (object of 2 floats) the latitude and longitude values of the user's location
- response: 400
  - body: Bad Request
- response: 401
  - body: Unauthorized

```
curl --location --request POST 'https://utsearch.tech/signin/' \
--header 'Content-Type: application/json' \
--header 'Cookie: connect.sid=s%3AKLuaSy4J01YPt0mtdE2uM6YpnGo4UcL1.jNHWWK9FAYZZkGWESQGYNdUn4YHQYgyb9GwwBkCxN90' \
--data-raw '{
    "username": "karen",
    "password": "kwok"
}'
```

## Sign-Out

- description: signing out of an account
- request: `GET /signout/`
- response: 200
  - content-type: `application/json`
  - body: You have signed out.

```
curl --location --request GET 'https://utsearch.tech/signout/'
```

# Web Sockets

## Client Events

#### Event: yourID
Description: Upon socket connection, the server sends the client their id.

Action: For random chat, their id is saved in a state. For video chat and call, they also emit a ConnectUser to the server to identify themselves by their username.

Emit: `"ConnectUsername", {username: state.user.username}`

#### Event: allUsers
Description: The server notifies all sockets of all the current online users.

Action: The list of users is saved in a state.

#### Event: hey
Description: This occurs when someone is trying to call them.

Action: Various states are set which then adjusts the UI to show the call invitation.

#### Event: user left
Description: In a conversation, the other person has disconnected.

Action: This user will also call the disconnect method to destroy the socket and reconnect to see the list of users.

#### Event: signal
Description: This event is part of the connection process to initiate the call.

Action: Caller will emit signal data, to and from information. Receiver will emit that they have accepted the call with the signal data, to and from information.

Caller: Emit `"callUser", { userToCall: id, signalData: data, from: yourID }`

Receiver: Emit `"acceptCall", { signal: data, to: caller, from: yourID }`

#### Event: stream
Description: This is when the other user has started sharing their stream.

Action: Various states are set to update the UI that the call has started and the other person's stream is saved in a state.

#### Event: callAccepted
Description: For the caller, this event is fired when the invited user has responded with an accept to the invitation.

Action: States are set to indicate that the call has begun, and stream is shared.

## Server Events

#### Event: connection
Description: A socket has connected to the server.

Action: If random chat, save and broadcast its id as well as emit its presence to all the other sockets. If video chat or call, only broadcast the id to the socket and wait for it to send its username, to identify the user.

Random chat: Emit `"yourID", socket.id` and `"allUsers", connected`

Video chat/ Call: Emit `"yourID", socket.id`

#### Event: disconnect
Description: A socket has disconnected from their chat or left the page.

Action: If the socket is in a call, send "user left" to its partner and then delete the relevant information. Then notify all other users of the updated user list.

Emit: `"allUsers", connected`

#### Event: callUser
Description: A user notifies the server that they want to call another user.

Action: Sends "hey" to the user being called along with signal data and who it's from.

Emit (to receiver)

`"hey", {
  signal: data.signalData,
  from: data.from,
  to: data.userToCall,
}`

#### Event: acceptCall
Description: When a user responds to the invitation, it goes through the server and lets the inviter know to begin the call.

Action: It adds the two users to a list of in-call users and then broadcasts to all the other sockets to inform them that those two are now not available for calling.

Emit (to caller) `"callAccepted", data.signal`

Emit (to everyone) `"allUsers", connected`

#### Event: ConnectUsername
Description: Event is only for video chat and call, but this event is triggered when the user identifies themselves to the server after receiving their socket id.

Action: It saves the id and the username sent by the socket to identify themselves. Then the server broadcasts to all the other sockets in the namespace that a new user has joined, along with their username.

Emit `"allUsers", connected`
