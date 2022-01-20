import { io } from 'socket.io-client';

// component change
function showPage (name: string, msg?: { id: string, text: string }) {
	let empty: boolean = true;

	// iterate components
	Array.from((document.getElementById('content').children as HTMLCollection))
		.forEach((child: HTMLElement) => {
			if (child.id === name) {
				child.style.display = null;
				empty = false;
				if (msg) document.getElementById(msg.id).innerText = msg.text;
			} else {
				child.style.display = 'none';
			}
		});

	// TODO: fallback
	// if (empty) {
	// 	if (name !== 'empty') document.getElementById('emptyErrorPane').style.display = 'block';
	// 	else return;
	// } else document.getElementById('emptyErrorPane').style.display = 'none';
}

// connect socket to server default function
export function connectSocket (room: any) {
	const socket = io({ autoConnect: false });

	// auth
	socket.auth = {
		token: new URLSearchParams(window.location.search).get('t'),
		type: room
	};

	// connect
	socket.connect();

	// connect_error event
	socket.on('connect_error', err => {
		console.log('Server returned error during connection: ' + JSON.stringify(err));
		showPage('error', {id: 'error-text', text: err.message});
	});

	// state event
	socket.on('state', msg => {
		showPage(msg);
	});

	// error event
	socket.on('error', msg => {
		console.error('Server returned error: ' + JSON.stringify(msg));
		showPage('error', {id: 'error-text', text: msg});
	});

	return socket;
}
