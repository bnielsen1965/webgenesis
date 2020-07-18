
let cs;
let pinging = false;
UI.ready(event => {
  UI.clickAction('websocket', websocketClick);
  UI.clickAction('ping', pingClick);
});


function websocketClick (ev) {
  if (cs && cs.isOpen()) {
    cs.close();
    delete cs;
  }
  else if (cs && !cs.isOpen()) {
    appendError(`Client socket state ${cs.getState()}`);
  }
  else {
    cs = new ClientSocket({ onOpen, onError, onClose, onMessage, tokenName: 'token' });
      console.log(cs.socket.readyState)
  }
}


function pingClick (ev) {
  pinging = !pinging;
  UI.elementHTML('ping', (pinging ? 'Stop Ping' : 'Start Ping'));
  if (pinging) {
    appendMessage('Start ping');
    ping();
    return;
  }
  appendMessage('Stop ping');
}

function onOpen () {
	appendMessage('WebSocket open');
  UI.elementHTML('websocket', 'Close Socket');
}

function onError () {
	appendError('WebSocket error');
}

function onClose () {
  delete cs;
  cs = null;
	appendMessage('WebSocket closed');
  UI.elementHTML('websocket', 'Open Socket');
}

function onMessage (message) {
	let data;
	try {
		data = JSON.parse(message.data);
	}
	catch (error) {
		appendError(error.message);
		return;
	}
	switch (data.action) {
		case 'pong':
		appendMessage('Ping reply ' + JSON.stringify(data));
		return;

		default:
		appendError('Unknown action ' + data.action);
		return;
	}
}

function ping () {
  if (!pinging) return;
  if (cs && cs.isOpen()) cs.send(JSON.stringify({ action: 'ping', text: 'echo this' }));
  else appendError('Client socket is not open');
  setTimeout(ping, 3000);
}

function appendMessage (message) {
	UI.elementAppendHTML('messages', message + '<br>');
}

function appendError (error) {
	UI.elementAppendHTML('errors', error + '<br>');
}
