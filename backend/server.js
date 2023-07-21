import express from "express";
const app = express();
import { createServer } from "http";
import { Server } from "socket.io";
const httpServer = createServer(app);
const port = 5000
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

io.on('connection',(socket)=>{
  // console.log("socket connection started");
    socket.emit('me', socket.id)

    socket.on("callUser",(data)=>{
      // console.log("user call detected");
      // console.log(data);
      io.to(data.userToCall).emit("callUser",{signal: data.signalData, from: data.from, name: data.name})
    })

    socket.on("answerCall",(data)=>{
      console.log(data);
      // console.log("To: " + data.to);
      // console.log(data.signal);
      io.to(data.to).emit("callAccepted", data.signal)
    })

    socket.on('disconnect',()=>{
      socket.broadcast.emit('callEnded')
    })

    socket.on('close-connection',(data)=>{
      // data.destroy()
      io.emit('close-remote')
    })
})

httpServer.listen(port, () => {
  console.log(`Server is running at port: ${port}`);
});
