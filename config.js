
module.exports = {
	Authentication: {
		allowRoutes: ['/js', '/css'],		// must be absolute paths
		disallowRoutes: ['/..'],				// must be absolute paths
		authenticationRoute: '/authentication',	// must be absolute path
		loginPage: '/login.html',
		logoutPage: '/logout.html',
		homePage: '/index.html',
		users: [{ username: 'admin', password: 'admin' }],
		jwt: {
			options: {
				algorithm: 'HS512',
				expiresIn: '1 days'
			},
			key: 'supersecretprivatekey'
		}
	},

	WebServer: {
		httpPort: 8880,
		httpsPort: 4443,
		keyFile: "./certs/webserver.key",
		crtFile: "./certs/webserver.crt"
	}
};
