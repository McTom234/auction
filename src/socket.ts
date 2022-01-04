import express from "express";
import * as http from "http";
import {Server} from "socket.io";
import {State, AuctionSocket, UserData, History} from "./models/index.js";
import fetch from "node-fetch";
import {verify} from "jsonwebtoken"
import * as sqlite3 from "sqlite3"
import * as fs from "fs";

const products = JSON.parse(fs.readFileSync('./products.json', 'utf-8'))

const app = express();

const server = http.createServer(app)

app.use(express.static("public"));

const io = new Server(server);

const jwtSecret = '$2a$10$wrLKVqw6/3hw+SE3LR0YmA9t4i5zDOgab23iLnMM6BpvbeIucwzoE';

const serverUrl = 'https://vbid.cluborganizer.de/token';

let state: State = {
	auctionId: 0,
	currentProduct: 0,
	currentPrice: 0,
	state: "lobby",
	currentHistory: []
};

io.use(async (socket: AuctionSocket, next) => {
	fetch(serverUrl, {
		method: 'POST',
		body: JSON.stringify({secret: socket.handshake.auth.token})
	})
		.then(res => res.json())
		.then((json: any) =>{
			try {
				socket.user_data = verify(json.token, jwtSecret) as UserData;
				next();
			} catch (e) {
				const err = new Error("Invalid token");
				next(err);
			}
		})
});

function getUserCount(){
	let users = io.sockets.adapter.rooms.get("client")?.size;
	if (!users) users = 0;
	return users;
}
let sendUserCount = () => {
	io.in("stream").in("presenter").emit("user-count", getUserCount());
};

io.use((socket, next) => {
	socket.on("connection", ()=>{
		sendUserCount();
	});
	socket.on("disconnect", ()=>{
		sendUserCount();
	});
	next();
})




io.on("connection", (socket: AuctionSocket) => {
	console.log(`User ${socket.user_data.user_id} (${socket.user_data.given_name} ${socket.user_data.family_name}) connected.`);

	if(socket.type === "client"){
		socket.join("client");
		socket.on("bid", msg => {
			if (!msg) return;

			if (msg <= state.currentPrice) return;
			state.currentPrice = msg;
			io.emit("price", state.currentPrice);
			state.currentHistory.push({
				date: Date.now(),
				name: `${socket.user_data.given_name} ${socket.user_data.family_name}`,
				price: state.currentPrice
			});
			io.in("presenter").emit("history", {
				reset: false,
				payload: [state.currentHistory[state.currentHistory.length - 1]],
			});
		});
	}

	if(socket.type === "presenter"){
		socket.join("presenter");
		socket.emit("history", { reset: true, payload: state.currentHistory });
		socket.emit("user-count", getUserCount());
		socket.on("start", () => {
			state.state = "started";
			state.currentProduct = 0;
			state.currentPrice = products[state.currentProduct].price;
			state.currentHistory = [];
			state.auctionId = Math.round(Math.random()*100000);
			io.in("presenter").emit("history", { reset: true, payload: [] });
			io.emit("state", state.state);
			io.emit("price", state.currentPrice);
			io.emit("product", products[state.currentProduct]);
		});

		socket.on("next-product", () => {
			if (products.length <= state.currentProduct + 1) {
				state.state = "over";
				io.emit("state", state.state);
				return;
			}
			const db = new sqlite3.Database("bids.sqlite");

			const statement = db.prepare("INSERT INTO bids(user_id, given_name, family_name, product, bid) VALUES (?,?,?,?,?)");
			for(const bid in state.currentHistory){
			}
			state.currentProduct += 1;
			state.currentPrice = products[state.currentProduct].price;
			state.currentHistory = [];
			io.in("presenter").emit("history", {reset:true, payload: []});
			io.emit("product", products[state.currentProduct]);
			io.emit("price", state.currentPrice);
		});
	}

	if (socket.type === "stream") {
		socket.join("stream");
		socket.emit(`${getUserCount()}`);
	}

	socket.emit("state", state.state);

	if (state.state === "started") {
		socket.emit("price", state.currentPrice);
		socket.emit("product", products[state.currentProduct]);
	}

});

const port = parseInt(process.env.PORT) || 3000;
server.listen(port,"0.0.0.0", () => {
	console.log("listening on *:" + port);
});

