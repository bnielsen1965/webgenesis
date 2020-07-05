# webgenesis

NodeJS genesis project for applications that need a web server with websocket support.

WebGenesis is a stripped down starting point for the creation of NodeJS web applications
that require a web server that supports HTTP, HTTPS, and WebSockets with authentication
and JSON Web Token based authorization.

Dependencies are kept to a minimum to reduce complexity while retaining simplicity
provided by code reuse. The code comments and function names should be self explanatory
and easy to follow.


# getting started

```shell
> git clone https://github.com/bnielsen1965/webgenesis
> cd webgenesis
> npm install
> node index.js
```

This will bring up a server with the default settings using the provided self signed
certificate. Open a web browser to the server running on the default port, I.E.

http://localhost:8880/


# configuration

The config directory contains discrete configuration files for each functional aspect
of the application.


## authentication

The authentication configuration contains router settings that control which routes
are allowed by anyone, which routes are completely disallowed, and which routes
that are used for the authentication service.

**NOTE:** The authentication configuration requires the users configuration and the
json web token configuration.


## users

The users configuration is a simple an array of users that can authenticate with the
application.

**NOTE:** The users are stored with non-hashed passwords. This is only provided as
an example starting point and should be replaced with more robust user credentials
storage and authentication.


## jwt

The jwt configuration contains the JSON web token settings.


## webserver

The webserver settings define the HTTP and HTTPS ports to use as well as paths to
the HTTPS key and certificate files.

**NOTE:** The application includes a sample self signed certificate in the certs directory.


## socketserver

The socket server configuration requires the jwt settings so websocket connections
can be authorized based on the provided JSON web token.


# API

The lib files include an example webapi module for REST API calls and a socketapi
module for WebSocket API calls.
