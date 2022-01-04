import express from "express";
import {createServer} from "http";
import {Server} from "socket.io";
import {State, AuctionSocket, UserData} from "./models";
import fetch from "node-fetch";
import {verify} from "jsonwebtoken"
import {readFileSync} from "fs";

const products = JSON.parse(readFileSync('./products.json', 'utf-8'))

const app = express();

const server = createServer(app)

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
	}).then(res => res.json())
		.then((json: any) =>{
			try {
				socket.user_data = verify(json.token, jwtSecret) as UserData;
				next();
			} catch (e) {
				const err = new Error("Invalid token");
				next(err);
			}
		}).catch(error => {
			console.error(error);
		next(new Error("Error while validating token."));
	})
});

function getUserCount(){
	let users = io.sockets.adapter.rooms.get("client")?.size || 0;
	if (!users) users = 0;
	return users;
}
let sendUserCount = () => {
	console.log("Sending user count");
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

			if(socket.user_data.user_type !== "bidder"){
				socket.emit("error", "Only bidders are not allowed to bid.");
				return;
			}

			if (msg <= state.currentPrice) return;
			state.currentPrice = msg;
			io.emit("price", state.currentPrice);
			state.currentHistory.push({
				date: Date.now(),
				name: `${socket.user_data.given_name} ${socket.user_data.family_name}`,
				value: state.currentPrice,
				product: state.currentProduct,
				user_id: socket.user_data.user_id
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
			// const db = new sqlite3.Database("bids.sqlite");
			//
			// const statement = db.prepare("INSERT INTO bids(user_id, product, bid) VALUES (?,?,?,?,?)");
			// for(const bid of state.currentHistory){
			// 	statement.run(bid.user_id, bid.product, bid.value);
			// }
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
		socket.emit("user-count", getUserCount())
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

