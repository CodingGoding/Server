var app = require("express")();
var express = require("express");
var server = require("http").createServer(app);
// http server를 socket.io server로 upgrade한다
var io = require("socket.io")(server, { path: '/socket.io' });

app.use("/static", express.static(__dirname + "/public"));

// localhost:3000으로 서버에 접속하면 클라이언트로 index.html을 전송한다
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

const names = []
// connection event handler
// connection이 수립되면 event handler function의 인자로 socket인 들어온다
io.on("connection", function (socket) {
  // 접속한 클라이언트의 정보가 수신되면
  socket.on("login", function (data) {
    names.push(data.name)
    socket.name = data.name;
    socket.emit("all", {names: names})
    socket.broadcast.emit("login", {name: data.name});
  });

  socket.on("name", function (data) {
    socket.name = data.name;
  });

  // 클라이언트로부터의 메시지가 수신되면
  socket.on("chat", function (data) {
    console.log("Message from %s: %s", socket.name, data.msg);

    var msg = {
      from: {
        name: socket.name,
        userid: socket.userid,
      },
      msg: data.msg,
    };

    // 메시지를 전송한 클라이언트를 제외한 모든 클라이언트에게 메시지를 전송한다
    socket.broadcast.emit("move", msg);

    // 메시지를 전송한 클라이언트에게만 메시지를 전송한다
    // socket.emit("s2c chat", msg);

    // 접속된 모든 클라이언트에게 메시지를 전송한다
    // io.emit("s2c chat", msg);

    // 특정 클라이언트에게만 메시지를 전송한다
    // io.to(id).emit('s2c chat', data);
  });


  socket.on("move", function (data) {
    socket.broadcast.emit("move", data);
  });

  // force client disconnect from server
  socket.on("forceDisconnect", function () {
    socket.broadcast.emit("logout", {name: socket.name});
    socket.disconnect();
  });

  socket.on("disconnect", function () {
    socket.broadcast.emit("logout", {name: socket.name});
    console.log("user disconnected: " + socket.name);
  });
});

server.listen(3000, function () {
  console.log("Socket IO server listening on port 3000");
});
