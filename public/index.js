
function showPage(name){
    Array.from(document.getElementById("content").children).forEach((child) => {
        if (child.id === name) {
            child.style.display = "block";
        } else {
            child.style.display = "none";
        }
    })
}
function connectSocket(room){
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
        showPage("error");
    })

    return socket
}



