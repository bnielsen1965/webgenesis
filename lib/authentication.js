
const JWT = require('jsonwebtoken');

const Defaults = {
  baseRoute: '',
	allowRoutes: ['/js', '/css'],		// must be absolute paths
	disallowRoutes: ['/..'],				// must be absolute paths
	authenticationRoute: '/authentication',	// must be absolute path
	loginPage: '/login.html',
	logoutPage: '/logout.html',
	homePage: '/index.html',
	Users: [],
	JWT: {
		options: {
			algorithm: 'HS256',
			expiresIn: '1 days'
		},
		key: 'USER SHOULD PROVIDE A SECRET KEY'
	}
};

// authentication middleware for HTTP requests
class Authentication {
	constructor (Config) {
		this.Config = Object.assign({}, Defaults, Config);
		let allow = [...this.Config.allowRoutes, this.Config.loginPage, this.Config.logoutPage, this.Config.authenticationRoute];
		this.allowRegEx = new RegExp(allow.map(a => '^' + Authentication.escapeRegExp(a)).join('|'));
		this.disallowRegEx = new RegExp(this.Config.disallowRoutes.map(a => Authentication.escapeRegExp(a)).join('|'));
	}

	// configure authentication middleware
	configure (app) {
		// configure authorization checks on all requests
		app.use(async (req, res, next) => {
			// run handlers until one handles the request or end with error
			this.allowedHandler(req, res, next) ||
			await this.authorizedHandler(req, res, next) ||
			this.handleRequestError(req, res, new Error('Authorization failed'));
		});
		// configure logout route
		app.use(this.Config.logoutPage, this.logout.bind(this));
		// configure authentication route
		app.post(this.Config.authenticationRoute, this.authenticate.bind(this));
		// return app to allow for chaining
		return app;
	}


	// handle allowed and disallowed requests
	allowedHandler (req, res, next) {
		// check for allowed and disallowed routes
		if (this.disallowRegEx.test(req.originalUrl)) {
			// request is not allowed
			res.status(403).send('Disallowed');
			return true;
		}
		if (this.allowRegEx.test(req.originalUrl)) {
			// request is allowed to pass
			next();
			return true;
		}
		// not handled
		return false;
	}

	// handle authorized requests
	async authorizedHandler (req, res, next) {
		// validate authorization
		let authorized;
		try {
			authorized = await Authentication.isRequestAuthorized(req, this.Config.JWT.key);
		}
		catch (error) {
			this.handleRequestError(req, res, new Error(error));
			return true;
		}
		if (authorized) {
			next();
			return true;
		}
		// not handled
		return false;
	}


	// logout route handler
	logout (req, res, next) {
		res.clearCookie('token');
		next();
	}


	// authentication route handler
	authenticate (req, res, next) {
		try {
			this.authenticateUser(req.body);
		}
		catch (error) {
			return this.handleRequestError(req, res, new Error(error.message));
		}
		let token = this.createToken({ username: req.body.username })
		if (req.get('accept')) {
			if (req.accepts('text/html')) return this.authenticatedHTML(req, res, token);
			if (req.accepts('application/json')) return this.authenticatedJSON(req, res, token);
		}
		return res.status(500).send('No supported "accept" type detected (application/json, text/html) in request headers');
	}

	// response for HTML authenticaiton
	authenticatedHTML (req, res, token) {
		// send token in cookie
		let decode = JWT.decode(token);
		res.cookie('token', token, { expires: new Date(decode.exp * 1000) });
		// redirect authenticated user
		let path = '/' + this.Config.homePage.replace(/^\//, '');
		return this.redirectToPath(req, res, path);
	}

	// resposne for JSON authentication
	authenticatedJSON (req, res, token) {
		res.json({ token });
	}


	// check if request has been pre-authorized
	static isRequestAuthorized (req, key) {
		return new Promise((resolve, reject) => {
			let token = Authentication.getTokenFromRequest(req);
			if (!token || !token.length) reject(new Error('No token'));
			JWT.verify(token, key, (error, decoded) => {
				if (error) {
					reject(new Error(error));
				}
				resolve(decoded);
			});
		});
	}

	// get token out of the request
	static getTokenFromRequest (req) {
		// check cookies
		if (req.cookies && req.cookies.token) {
			return req.cookies.token;
		}

		// check headers
		let authorizationHeader;
		if (req.headers && req.headers.authorization) {
			authorizationHeader = req.headers.authorization;
		}
		else if (req.header && typeof(req.header) === 'function') {
			authorizationHeader = req.header('Authorization');
		}
		if (authorizationHeader) {
			let match = /([^\s]+)\s+([^\s]+)/.exec(authorizationHeader);
			if (match && !/bearer/i.test(match[1])) {
				// not a bearer token
				return;
			}
			else if (match) {
				// return bearer token
				return match[2];
			}
			// token type is not specified
			return authorizationHeader;
		}

		// check websocket upgrade headers
		if (req.headers && req.headers['sec-websocket-protocol']) {
			let match = /token_([^;]*)/.exec(req.headers['sec-websocket-protocol']);
			if (match) return match[1];
		}

		// check query string
		if (req.url) {
			let match = /\?([^&]*&)?token=([^&]*)/.exec(req.url);
			if (match) return match[2];
		}
	}


	// redirect to login page
	redirectLogin (req, res, queryString) {
		let path = '/' + this.Config.loginPage.replace(/^\//, '') + (queryString ? '?' + queryString : '');
		return this.redirectToPath(req, res, path);
	}

	redirectToPath (req, res, path) {
		let site = req.protocol + '://' + req.headers['host'];
		return res.redirect(302, site + path);
	}

	handleRequestError (req, res, error) {
		if (req.get('accept')) {
			if (req.accepts('text/html')) return this.requestHTMLError(req, res, error);
			if (req.accepts('application/json')) return this.requestJSONError(req, res, error);
		}
		return res.status(500).send('No supported "accept" type detected (application/json, text/html)');
	}

	requestHTMLError (req, res, error) {
		let q = 'error=' + error.message;
		if (req.body.username) q += '&username=' + req.body.username;
		return this.redirectLogin(req, res, q);
	}

	requestJSONError (req, res, error) {
		return res.json({ error: error.message });
	}


	// authenticate user credentials against user list
	authenticateUser (credentials) {
		for (let i = 0; i < this.Config.Users.length; i++) {
			let user = this.Config.Users[i];
			if (credentials.username === user.username && credentials.password === user.password) return true;
		}
		throw new Error('Invalid credentials');
	}

	// create an authorization token
	createToken (payload) {
		return JWT.sign(payload, this.Config.JWT.key, this.Config.JWT.options);
	}

	// escape string that will be used in a RegExp
	static escapeRegExp(string) {
		return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	}

}

module.exports = Authentication;
