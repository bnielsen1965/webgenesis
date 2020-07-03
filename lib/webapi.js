
const Defaults = {};

class WebAPI {
  constructor (Config) {
    this.Config = Object.assign({}, Defaults, Config);
  }

  configure (webServer) {
    this.webServer = webServer;
    this.webServer.app.use('/api/ping', this.onPing.bind(this));
  }

  onPing (req, res, next) {
    res.json({ action: 'pong', timestamp: new Date().toISOString() });
  }
}

module.exports = WebAPI;
