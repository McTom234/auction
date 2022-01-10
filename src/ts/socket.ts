import express from 'express';
import { readFileSync } from 'fs';
import { createServer } from 'http';
import { verify } from 'jsonwebtoken';
import fetch from 'node-fetch';
import { Server } from 'socket.io';
import { AuctionSocket, State, UserData, BidHistory } from './models';
import { validate } from './util/validFormat';
import fs from "fs";

// products DB file
const products = JSON.parse(readFileSync('./products.json', 'utf-8'));

// socket.io and http server setup
const app = express();
const server = createServer(app);
app.use(express.static('dist'));
const io = new Server(server);

// auth data
const jwtSecret = '$2a$10$wrLKVqw6/3hw+SE3LR0YmA9t4i5zDOgab23iLnMM6BpvbeIucwzoE';
const serverUrl = 'https://vbid.cluborganizer.de/token';

// current state
let state: State = {
	auctionId: 0,
	currentProduct: 0,
	currentPrice: 0,
	state: 'lobby',
	currentHistory: []
};

// auth middleware
io.use(async(socket: AuctionSocket, next) => {
	fetch(serverUrl, {
		method: 'POST',
		body: JSON.stringify({ secret: socket.handshake.auth.token })
	})
		.then(res => res.json())
		.then((json: any) => {
			try {
				socket.user_data = verify(json.token, jwtSecret) as UserData;
				socket.type = socket.handshake.auth.type;
				next();
			} catch (e) {
				next(new Error('Scanne den QR-Code erneut oder überprüfe, ob Du den Link richtig abgeschrieben hast!'));
			}
		})
		.catch(error => {
			console.error(error);
			next(new Error('Authentifizierungsserver nicht erreichbar. Überprüfe deine Internetverbindung!'));
		});
});

// user count
function getUserCount () {
	let users = io.sockets.adapter.rooms.get('client')?.size || 0;
	if (!users) users = 0;
	return users;
}

let sendUserCount = () => {
	console.log('Sending user count');
	io.in('overlay')
		.in('presenter')
		.emit('user-count', getUserCount());
};
io.use((socket, next) => {
	socket.on('disconnect', () => {
		sendUserCount();
	});
	next();
});


// bid logging
function logBid(hist: BidHistory){
	fs.appendFile("log.csv", [hist.date,hist.product, hist.user_id, hist.name, hist.value].join(",") + "\n" , (err)=>{
		if(err) throw err;
	})
}

// connection observer
io.on('connection', (socket: AuctionSocket) => {
	console.log(`User ${ socket.user_data.user_id } (${ socket.user_data.given_name } ${ socket.user_data.family_name }) connected.`);

	// client socket
	if (socket.type === 'client') {
		socket.join('client');

		sendUserCount();

		// bid event
		socket.on('bid', msg => {
			if (!msg) return;

			if (socket.user_data.user_type !== 'bidder') {
				return socket.emit('error', 'Dein Nutzer hat keine Berechtigung, Gebote abzusenden. ');
			}

			// validation
			const newPriceInput = validate(msg, state.currentPrice);

			if (newPriceInput instanceof Error) return socket.emit('error', newPriceInput.message);

			// add bid
			state.currentPrice = newPriceInput;
			io.emit('price', state.currentPrice);
			const bidHistory:BidHistory = {
				date: Date.now(),
				name: `${ socket.user_data.given_name } ${ socket.user_data.family_name }`,
				value: state.currentPrice,
				product: state.currentProduct,
				user_id: socket.user_data.user_id
			};
			state.currentHistory.push(bidHistory);
			logBid(bidHistory);

			// emit to presenters
			io.in('presenter')
				.emit('history', {
					reset: false,
					payload: [state.currentHistory[state.currentHistory.length - 1]]
				});
		});
	}

	// presenter socket
	if (socket.type === 'presenter') {
		socket.join('presenter');

		// status updates
		socket.emit('history', {
			reset: true,
			payload: state.currentHistory
		});
		socket.emit('user-count', getUserCount());

		// start event
		socket.on('start', () => {
			// init
			state.state = 'started';
			state.currentProduct = 0;
			state.currentPrice = products[state.currentProduct].price;
			state.currentHistory = [];
			state.auctionId = Math.round(Math.random() * 100000);

			io.in('presenter')
				.emit('history', {
					reset: true,
					payload: []
				});

			// publish data
			io.emit('state', state.state);
			io.emit('price', state.currentPrice);
			io.emit('product', products[state.currentProduct]);
		});

		// next-product event
		socket.on('next-product', () => {
			// validation
			if (products.length <= state.currentProduct + 1) {
				state.state = 'over';
				return io.emit('state', state.state);
			}

			// state update
			state.currentProduct += 1;
			state.currentPrice = products[state.currentProduct].price;
			state.currentHistory = [];
 
			// publish
			io.in('presenter')
				.emit('history', {
					reset: true, 
					payload: []
				});
			io.emit('product', products[state.currentProduct]);
			io.emit('price', state.currentPrice);
		});
	}

	// stream socket
	if (socket.type === 'overlay') {
		socket.join('overlay');

		// status updates
		socket.emit('user-count', getUserCount());
	}

	// status updates
	socket.emit('state', state.state);
	if (state.state === 'started') {
		socket.emit('price', state.currentPrice);
		socket.emit('product', products[state.currentProduct]);
	}
});

// start server
const port = (parseInt(process.env.PORT) || 3000);
server.listen(port, '0.0.0.0', () => {
	console.log('listening on *:' + port);
});

