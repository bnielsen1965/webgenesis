
const Users = require('./users');
const JWT = require('./jwt');

module.exports = {
  baseRoute: '',
  allowRoutes: ['/js', '/css', '/images', '/fonts'],
  disallowRoutes: ['/..'],
  authenticationRoute: '/authentication',
  loginPage: '/login.html',
  logoutPage: '/logout.html',
  homePage: '/index.html',

  JWT: JWT,
  Users: Users
};
