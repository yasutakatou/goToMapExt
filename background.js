
let ws;
let url = "";
let bakAction = "";
var socket;
let socket_Flag = "false";

if (window.WebSocket === undefined) {
	alert("Your browser does not support WebSockets");
}

function initWS() {
	var server = "127.0.0.1:8080";
	strs = window.localStorage.getItem("server");
	if (strs != null) {
		server = strs;
	}
	socket = new WebSocket("ws://" + server + "/ws");

	socket.onopen = function(e) {
		socket_Flag = "true";
		console.log("Server: " + server + " connected!");
		e.preventDefault();
	};
	socket.onmessage = function (e) {
		console.log("Got some shit:" + e.data);
		const obj = JSON.parse(e.data);
		if (obj.Command == "goto") {
			chrome.tabs.create({ url:obj.Data });
		}
		if (obj.Command == "list") {
			var lists = chrome.extension.connect({name: "list"});
			lists.postMessage({command: obj.Command, message: obj.Data});
		}
		if (obj.Command == "message") {
			chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
				chrome.tabs.sendMessage(tabs[0].id, obj.Data);
				bakAction = obj.Data;
			});
		}
		if (obj.Command == "error") {
			alert(obj.Data);
		}
	}
	socket.onclose = function (e) {
		socket_Flag = "false";
		alert("Server: " + server + " not connect.");
		e.preventDefault();
	}
	return socket;
}

chrome.extension.onConnect.addListener(function(checkWS) {
	checkWS.onMessage.addListener(function() {
		var resultWS = chrome.extension.connect({name: "resultWS"});
		resultWS.postMessage(socket_Flag);
	});
});

chrome.extension.onConnect.addListener(function(lout) {
	lout.onMessage.addListener(function(msg) {
		if (msg.command == "lout") {
			sendServer(JSON.stringify({ Command: "logout", Data: msg.message }));
			ws.close();
		}
	});
});

chrome.extension.onConnect.addListener(function(port) {
	port.onMessage.addListener(function(msg) {
		if (msg.command == "start") {
			ws = initWS();
			setTimeout(function () {
				sendServer(JSON.stringify({ Command: msg.command, Data: msg.message }));				
			}, 2000);
		} else {
			sendServer(JSON.stringify({ Command: msg.command, Data: msg.message }));
		}
	});
});

function sendServer(strs) {
	socket.send(strs);
}

// setTimeout(function () {
// 	ws.send(JSON.stringify({ Command: "start", Data: "test" }));
// } ,1000);

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