import '../../css/index.css'
import {connectSocket} from "../client";

const socket = connectSocket("client");

socket.on("price", (msg) => {
    const el = document.getElementById("preis");
    el.innerHTML = msg + "€";
    el.style.animation = 'none';
    el.offsetHeight; /* trigger reflow */
    el.style.animation = null;
});
socket.on("product", (msg) => {
    const el = document.getElementById("name");
    el.innerHTML = msg.name;
    const img = document.getElementById("image");
    img.setAttribute("src", msg.image);
});
document.getElementById("sendbid").addEventListener("click", () => {
    const text = (document.getElementById("bid") as HTMLInputElement).value;
    socket.emit("bid", parseInt(text));
});
