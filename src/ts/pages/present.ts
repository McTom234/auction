import 'bootstrap/dist/css/bootstrap.min.css'
import {connectSocket} from "../client";

const socket = connectSocket("presenter");

socket.on("price", (msg) => {
    const el = document.getElementById("preis");
    el.innerHTML = msg;
});
socket.on("product", (msg) => {
    const el = document.getElementById("name");
    el.innerHTML = msg.name;
    const img = document.getElementById("image");
    img.setAttribute("src", msg.image);
});
socket.on("user-count", (msg)=>{
    document.getElementById("online").innerHTML = msg;
});

socket.on("history", (msg) => {
    const table = document.getElementById("history");

    if (msg.reset) {
        table.innerHTML = "";
    }
    for (const event of msg.payload) {
        const tr = document.createElement("tr");
        for (const value of [event.date, event.name, event.value]) {
            const td = document.createElement("td");
            td.innerText = value;
            tr.appendChild(td);
        }
        table.appendChild(tr);
    }
});
const startButton = document.getElementById("button-start");
startButton.addEventListener("click", () => {
    socket.emit("start");
});
const nextButton = document.getElementById("button-next");
nextButton.addEventListener("click", () => {
    socket.emit("next-product");
});
const restartButton = document.getElementById("button-restart");
restartButton.addEventListener("click", () => {
    socket.emit("start");
});
