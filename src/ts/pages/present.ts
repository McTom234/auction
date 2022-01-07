import 'bootstrap/dist/css/bootstrap.min.css';
import { connectSocket } from '../client';

const socket = connectSocket('presenter');

/* EVENTS */
// price event
socket.on('price', msg => document.getElementById('preis').innerHTML = msg);

// product event
socket.on('product', msg => {
	document.getElementById('name').innerHTML = msg.name;

	document.getElementById('image')
		.setAttribute('src', msg.image);
});

// user-count event
socket.on('user-count', msg => document.getElementById('online').innerHTML = msg);

// history event
socket.on('history', msg => {
	const table = document.getElementById('history');

	if (msg.reset) table.innerHTML = '';

	for (const event of msg.payload) {
		const tr = document.createElement('tr');

		for (const value of [event.date, event.name, event.value]) {
			const td = document.createElement('td');
			td.innerText = value;
			tr.appendChild(td);
		}

		table.appendChild(tr);
	}
});

/* BUTTON LISTENERS */
document.getElementById('button-start').onclick = () => socket.emit('start');

document.getElementById('button-next').onclick = () => socket.emit('next-product');

document.getElementById('button-restart').onclick = () => {
	if (confirm('Wirklich neustarten?')) socket.emit('start');
};
