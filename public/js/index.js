
let cs;
window.addEventListener('load', (event) => {
	console.log('START');
	cs = new ClientSocket({ onOpen, onError, onClose, onMessage });
});

function onOpen () {
	appendMessage('WebSocket open');
	ping();
}

function onError () {
	appendError('WebSocket error');
}

function onClose () {
	appendMessage('WebSocket closed');
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
		setTimeout(ping, 3000);
		return;

		default:
		appendError('Unknown action ' + data.action);
		return;
	}
}

function ping () {
	cs.send(JSON.stringify({ action: 'ping', text: 'echo this' }));
}

function appendMessage (message) {
	document.getElementById('messages').innerHTML += message + '<br>';
}

function appendError (error) {
	document.getElementById('errors').innerHTML += error + '<br>';
}
