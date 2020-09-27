
let ws;
let url = "";
let bakAction = "";
var socket;

if (window.WebSocket === undefined) {
	console.log("Your browser does not support WebSockets");
} else {
	ws = initWS();
}

function initWS() {
	var server = "127.0.0.1:8080";
	strs = window.localStorage.getItem("server");
	if (strs != null) {
		server = strs;
	}
	socket = new WebSocket("ws://" + server + "/ws");

	socket.onopen = function(e) {
		console.log("Socket is open");
		e.preventDefault();
	};
	socket.onmessage = function (e) {
		console.log("Got some shit:" + e.data);
		const obj = JSON.parse(e.data);
		if (obj.Command == "goto") {
			chrome.tabs.create({ url:obj.Data });
		}
		if (obj.Command == "message") {
			if (bakAction != obj.Data) {
				chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
					chrome.tabs.sendMessage(tabs[0].id, obj.Data);
					bakAction = obj.Data;
					e.preventDefault();
				});
			}
		}
		e.preventDefault();
	}
	socket.onclose = function (e) {
		console.log("Socket closed");
		e.preventDefault();
	}
	return socket;
}

chrome.extension.onConnect.addListener(function(port) {
	port.onMessage.addListener(function(msg) {
		if (msg.command == "全体に") {
			sendServer(JSON.stringify({ Command: "cast", Data: msg.message }));
		}
		if (msg.command == "書置き") {
			sendServer(JSON.stringify({ Command: "crumb", Data: msg.message }));
		}
	});
  });

function sendServer(strs) {
	socket.send(strs);
}

setTimeout(function () {
	ws.send(JSON.stringify({ Command: "start", Data: "test" }));
} ,1000);

function pushURL(){
	chrome.tabs.getSelected(null,function(tab) {
		if (url != tab.url) {
			url = tab.url;
			ws.send(JSON.stringify({ Command: "move", Data: url }));
		}
	});
}

window.onload = function() {
	setInterval(pushURL, 500);
};