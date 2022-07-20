var socket = io.connect("http://localhost:3000", {
  // ws:// 를 안쓰고 http를 쓴다
  path: "/socket.io", // 서버 path와 일치시켜준다
  transports: ["websocket"],
});
var Name = "";
$(function () {
  const btn = document.querySelector("#btn");

  // 서버로 자신의 정보를 전송한다.
  socket.emit("login", {
    // name: "ungmo2",
    name: Name,
    userid: "ungmo2@gmail.com",
  });

  // 서버로부터의 메시지가 수신되면
  socket.on("login", function (data) {
    $("#textContainer").append("<div><strong>" + Name + "</strong> joined</div>");
  });

  // 서버로부터의 메시지가 수신되면
  socket.on("chat", function (data) {
    $("#textContainer").append(
      `<div class="text"> <strong>${data.from.name}</strong> : ${data.msg}</div>`
    );
  });

  // Send 버튼이 클릭되면
  $("form").submit(function (e) {
    e.preventDefault();
    var $msgForm = $("#msgForm");

    if ($msgForm.val() == "" || $msgForm.val() == null || $msgForm.val() == undefined) {
      $msgForm.val("");
    } else {
      // 서버로 메시지를 전송한다.
      socket.emit("chat", { msg: $msgForm.val() });

      console.log("적은내용 : " + $("#msgForm").val());

      $("#textContainer").append(`<div class="myText"> ${$msgForm.val()} </div>`);
      $msgForm.val("");
    }
  });
});

function setName() {
  let name = document.getElementById("nickName").value;
  const yourNickName = document.getElementById("yourNickName");

  Name = name;

  socket.name = name;
  yourNickName.innerText = name;

  socket.emit("name", { name });
}
btn.addEventListener("onclick", setName);

window.onload = async function () {
  myIp = "";
  try {
    const response = await axios.get("https://api.ipify.org?format=json");
    myIp = response.data.ip;
  } catch (error) {
    console.error(error);
  }

  console.log(myIp);

  Name = myIp;
  socket.name = myIp;
  yourNickName.innerText = myIp;
};
