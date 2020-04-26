# webgenesis

NodeJS genesis project for applications that need a web server with websocket.

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

Edit the config.js file to adjust the default settings.
