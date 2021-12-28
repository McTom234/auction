const express = require("express");
const app = express();

const fs = require("fs");

const http = require("http");
const server = http.createServer(app);
app.use(express.static("public"));

const { Server } = require("socket.io");
const io = new Server(server);

const products = require("./products.json");

let state = {
  auktionId: 0,
  currentProduct: 0,
  currentPrice: 0,
  state: "lobby",
  currentHistory: [],
};

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  socket.token = token;
  next();
});
function log(string){
  fs.appendFile("protocol" + state.auktionId + ".txt", (new Date()).toISOString() + ": " + string + "\n", ()=>{

  });
}

io.on("connection", (socket) => {
  console.log("User " + socket.token + " connected.");
  socket.on("room", (msg) => {
    if (msg == "client") {
      socket.join("client");
      socket.on("bid", (msg) => {
        if (!msg) return;
        if (msg <= state.currentPrice) return;

        state.currentPrice = msg;
        io.emit("price", state.currentPrice);
        state.currentHistory.push([
          Date.now(),
          socket.token,
          state.currentPrice,
        ]);
        io.in("presenter").emit("history", {
          reset: false,
          payload: [state.currentHistory[state.currentHistory.length - 1]],
        });
      });
    }
    if (msg == "presenter") {
      socket.join("presenter");

      socket.emit("history", { reset: true, payload: state.currentHistory });

      socket.on("start", () => {
        state.state = "started";
        state.currentProduct = 0;
        state.currentPrice = products[state.currentProduct].price;
        state.currentHistory = [];
        state.auktionId = Math.round(Math.random()*100000);
        log("Auktion gestartet");
        io.in("presenter").emit("history", { reset: true, payload: [] });
        io.emit("state", state.state);
        io.emit("price", state.currentPrice);
        io.emit("product", products[state.currentProduct]);
      });

      socket.on("next-product", () => {
        if (products.length <= state.currentProduct + 1) {
          state.state = "over";
          io.emit("state", state.state);
          log("Auktion beendet");
          return;
        }
        log("Produkt " + state.currentProduct + " verkauft. Gebote: " + JSON.stringify(state.currentHistory))

        state.currentProduct += 1;
        state.currentPrice = products[state.currentProduct].price;
        state.currentHistory = [];
        io.in("presenter").emit("history", {reset:true, payload: []});
        io.emit("product", products[state.currentProduct]);
        io.emit("price", state.currentPrice);
      });
    }
    if (msg == "stream") {
      socket.join("stream");
    }
  });

  socket.emit("state", state.state);
  if (state.state == "started") {
    socket.emit("price", state.currentPrice);
    socket.emit("product", products[state.currentProduct]);
  }
});

let sendUserCount = () => {
  let users = io.sockets.adapter.rooms.get("client")?.size;
  if (!users) users = 0;
  console.log(users + " users online");

  io.in("stream").in("presenter").emit("user-count", users);
};
io.of("/").adapter.on("join-room", sendUserCount);
io.of("/").adapter.on("leave-room", sendUserCount);

server.listen(3000, () => {
  console.log("listening on *:3000");
});
