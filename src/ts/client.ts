import {io} from "socket.io-client";

function showPage(name: any){
    Array.from((document.getElementById("content")?.children as HTMLCollection)).forEach((child: any) => {
        if (child.id === name) {
            child.style.display = "block";
        } else {
            child.style.display = "none";
        }
    })
}
export function connectSocket(room: any){
    const socket = io({autoConnect: false});
    const urlParams = new URLSearchParams(window.location.search);

    socket.auth = {token: urlParams.get("t"), type: room};
    socket.connect();

    socket.on("connect_error", (err) => {
        console.log("Server returned error during connection: " + JSON.stringify(err));
        showPage("error");
    });

    socket.on("state", (msg) => {
        showPage(msg);
    });

    socket.on("error", (msg) => {
        console.error("Server returned error: " + JSON.stringify(msg));
    })

    return socket
}
