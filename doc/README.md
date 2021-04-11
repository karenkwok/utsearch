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