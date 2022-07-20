var app = require("express")();
var express = require("express");
const { fdatasync } = require("fs");
const { getSystemErrorName } = require("util");
var server = require("http").createServer(app);
// http server를 socket.io server로 upgrade한다
var io = require("socket.io")(server, { path: '/socket.io' });

app.use("/static", express.static(__dirname + "/public"));

// localhost:3000으로 서버에 접속하면 클라이언트로 index.html을 전송한다
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

const names = []
io.on("connection", function (socket) {
  socket.on("login", function (data) {
    socket.emit("all", {names: names})
    console.log(names)
    data.name = getName(data.name)
    names.push(data.name)
    socket.name = data.name;
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

    socket.broadcast.emit("chat", msg);
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

function getName(str) {
  if(names.includes(str)) {
    str = str + '1'
    return getName(str)
  }
  else {
    return str
  }
}