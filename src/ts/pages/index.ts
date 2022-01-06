import '../../css/index.css';
import { connectSocket } from '../client';
import { validate } from '../util/validFormat';

const socket = connectSocket('client');

let price: number = 0;

/* EVENTS */
// price event
socket.on('price', msg => {
	// animation
	const el = document.getElementById('preis');
	el.innerHTML = msg + '€';
	el.style.animation = 'none';
	el.offsetHeight; /* trigger reflow */
	el.style.animation = null;

	// update price
	price = parseFloat(msg);
});

// product event
socket.on('product', msg => {
	// update product data
	document.getElementById('name').innerHTML = msg.name;

	document.getElementById('image')
		.setAttribute('src', msg.image);

	// TODO: description
});

// error event
socket.on('error', () => document.getElementById('bid')
	.classList
	.add('invalid'));

/* LISTENERS */
// button send onclick listener
document.getElementById('sendbid').onclick = () => {
	// fetch input
	const text = (document.getElementById('bid') as HTMLInputElement).value;

	// validation
	if (!(validate(text, price) instanceof Error)) socket.emit('bid', text);
	else document.getElementById('bid')
		.classList
		.add('invalid');
};

// price input oninput listener - removing invalid class
document.getElementById('bid').oninput = () => document.getElementById('bid')
	.classList
	.remove('invalid');
