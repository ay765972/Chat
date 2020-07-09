const socket = io();

const $messageForm = document.querySelector("#message-form");
const $messageFormInput = $messageForm.querySelector("input");
const $messageButton = $messageForm.querySelector("button");
const $sendLocationButton = document.querySelector("#send-Location");
const $messages = document.querySelector("#messages");
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationMsgTemplate = document.querySelector("#location-msg-template")
  .innerHTML;

const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});
socket.on("message", message => {
  console.log(message);
  const html = Mustache.render(messageTemplate, {
    name: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format("h:mm a")
  });
  $messages.insertAdjacentHTML("beforeend", html);
});

socket.on("locationMsg", url => {
  const html = Mustache.render(locationMsgTemplate, {
    name: url.username,
    url: url.url,
    createdAt: moment(url.createdAt).format("h:mm a")
  });
  $messages.insertAdjacentHTML("beforeend", html);
});

$messageForm.addEventListener("submit", e => {
  e.preventDefault();
  $messageButton.setAttribute("disabled", "disabled");
  const message = e.target.elements.message.value;
  socket.emit("sendMessage", message, error => {
    $messageButton.removeAttribute("disabled");
    $messageFormInput.value = "";
    $messageFormInput.focus();
    if (error) {
      return console.log(error);
    }
    console.log("Message delivered");
  });
});

$sendLocationButton.addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("Goaloaction is not supported by your browser");
  }
  $sendLocationButton.setAttribute("disabled", "disabled");
  navigator.geolocation.getCurrentPosition(position => {
    socket.emit(
      "sendLocation",
      {
        lat: position.coords.latitude,
        long: position.coords.longitude
      },
      () => {
        $sendLocationButton.removeAttribute("disabled");
        console.log("Location Shared");
      }
    );
  });
});

socket.emit("join", { username, room }, error => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});
