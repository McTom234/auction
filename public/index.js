socket.on("state", (msg)=>{
    Array.from(document.body.children).forEach((child)=>{
      if(child.id == msg){
        child.style.display = "block";
      }else{
        child.style.display = "none";
      }
    })
  })