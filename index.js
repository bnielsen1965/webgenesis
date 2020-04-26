
const Config = require('./config');
const WebServer = require('./lib/webserver');
const SocketServer = require('./lib/socketserver');
const Authentication = require('./lib/authentication');

const JWT = require('jsonwebtoken');

// create web server and configure pre-routing middleware
let webServer = new WebServer(Config.WebServer);
webServer
	.createServer()
	.configureFavIcon()
	.configureParsers();

// create authentication and configure before all other routes
let authentication = new Authentication(Config.Authentication);
authentication.configure(webServer.app);

// congiure routes for static content
webServer.configureStaticRoutes();
webServer.app.use((req, res, next) => {
	if (req.get('accept') && req.accepts('application/json') && !req.accepts('text/html')) {
		// provide a JSON error message when request cannot be handled for a JSON request
		return res.json({ error: 'Invalid request' });
	}
	next();
})

// create websocket server attached to the web server
let socketServer = new SocketServer({ jwt: Config.Authentication.jwt });
socketServer
	.createServer(webServer.server)
	.on('error', error => {
		console.log('ERROR', error);
	})
	.on('connection', ws => {
		console.log('Connection from client');
	})
	.on('message', message => {
		switch (message.data.action) {
			case 'ping':
			ping(message.uuid);
			break;

			default:
			console.log('No action handler for ' + message.data.action);
		}
	});

// start web server listening for connections
webServer
	.listen().then(settings => {
		console.log('Server up on port ' + settings.port);
	});

function ping (uuid) {
	socketServer.sendMessage('pong', { text: 'Hello World' }, uuid);
}
