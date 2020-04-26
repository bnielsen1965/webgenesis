
class ClientSocket {
	constructor (options) {
		let token = this.getCookie('token');
		let protocols = [(token ? 'token_' + token : '')];
		this.socket = new WebSocket((window.location.protocol === 'https:' ? 'wss' : 'ws') + '://' + window.location.host, protocols);
		this.socket.onopen = options.onOpen || this.onOpen.bind(this);
		this.socket.onerror = options.onError || this.onError.bind(this);
		this.socket.onclose = options.onClose || this.onClose.bind(this);
		this.socket.onmessage = options.onMessage || this.onMessage.bind(this);
	}

	send (message) {
		this.socket.send(message);
	}

	onOpen () {
		console.log('WebSocket opened');
	}

	onError (error) {
		console.log('WebSocket error: ' + error.message);
	}

	onClose () {
		console.log('WebSocket closed');
	}

	onMessage (message) {
		console.log('WebSocket message. ' + message);
	}

	getCookie (cname) {
	  let name = cname + "=";
	  let decodedCookie = decodeURIComponent(document.cookie);
	  let ca = decodedCookie.split(';');
	  for (let i = 0; i < ca.length; i++) {
	    let c = ca[i].trim();
	    if (c.indexOf(name) == 0) {
	      return c.substring(name.length, c.length);
	    }
	  }
	  return "";
	}

}
