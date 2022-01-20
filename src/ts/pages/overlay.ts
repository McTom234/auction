//import '../../css/overlay.css';
import { connectSocket } from '../client';

const socket = connectSocket('overlay');

/* EVENTS */
// price event
socket.on('price', msg => {
	// animation
	const el = document.getElementById('preis');
	el.innerHTML = msg + '€';
	el.style.animation = 'none';
	el.offsetHeight; /* trigger reflow */
	el.style.animation = null;

	const e = document.getElementById('new-preis');
	e.innerHTML = msg + '€';
	e.style.animationPlayState = 'running';
});

// product event
socket.on('product', msg => {
	// update product data
	document.getElementById('name').innerHTML = msg.name;

	document.getElementById('image')
		.setAttribute('src', msg.image);

	// TODO: description
});

// user-data event
socket.on('user-count', msg => {
	document.getElementById('user-count').innerText = `${ msg } Bieter eingeloggt`;
});

// state event
socket.on('state', msg => {
	if (msg === 'over') document.getElementById('user-wrapper').style.display = 'none';
	else document.getElementById('user-wrapper').style.display = 'block';
});


document.getElementById('new-preis').onanimationiteration = () => document.getElementById('new-preis').style.animationPlayState = 'paused';
