socket.on("state", (msg)=>{
    Array.from(document.getElementById("content").children).forEach((child)=>{
      if(child.id == msg){
        child.style.display = "block";
      }else{
        child.style.display = "none";
      }
    })
  })