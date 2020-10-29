let menu_flg = false;
let userName;
let userPic;
let serverIP;

window.onload = function() {
	stra = window.localStorage.getItem("server");
	if (stra != null) {
		document.getElementById( "server" ).value = stra;
		serverIP = stra;
	}
	strb = window.localStorage.getItem("logon");
	if (strb != null) {
		document.getElementById( "loginName" ).value = strb;
		userName = strb;
	}
	checkWebsocket();
}

function save_options() {
	serverIP = document.getElementById( "server" ).value;
	window.localStorage.setItem("server", serverIP);

	// Update status to let user know options were saved.
	var status = document.createElement( "div" );
	status.innerHTML = "<br>Options saved";
	document.body.appendChild( status );
	setTimeout( function() { document.body.removeChild( status ) }, 2000 );
}

function restore_menu(socket_Flag) {
	if (socket_Flag == "false") {
		document.getElementById("send").setAttribute("disabled", true);
		document.getElementById("send").style.color = "White";
		document.getElementById("logout").setAttribute("disabled", true);
		document.getElementById("logout").style.color = "White";
	} else {
		if (userName != null && userName.length > 1) {
			document.getElementById("login").setAttribute("disabled", true);
			document.getElementById("login").style.color = "White";
			document.getElementById("save").setAttribute("disabled", true);
			document.getElementById("save").style.color = "White";
		}
	}
}

function sendMessage() {
	var mess = document.getElementById( "message" ).value;
	var meth = document.getElementById( "method" ).value;

	if (meth == "crumb") {
		chrome.tabs.getSelected(null,function(tab) {
			var strs = tab.url.split("@")[1].split(",");
			mess = strs[0] + "," + strs[1] + ":" + mess;
			var port = chrome.extension.connect({name: "sendMess"});
			port.postMessage({command: meth, message: mess});
		});
	} else if (meth == "cast") {
		var port = chrome.extension.connect({name: "sendMess"});
		port.postMessage({command: meth, message: mess});
	} else {
		strs = meth + ":<br>" + mess;
		var port = chrome.extension.connect({name: "sendMess"});
		port.postMessage({command: "to", message: strs});
		console.log(strs);
	}

	// Update status to let user know options were saved.
	var send = document.createElement( "div" );
	send.innerHTML = "<br>Message send";
	document.body.appendChild( send );
	setTimeout( function() { document.body.removeChild( send ) }, 2000 );
}

function logout() {
	var lout = chrome.extension.connect({name: "logout"});
	lout.postMessage({command: "logout", message: userName});

	userName = "";
}

function checkWebsocket() {
	var checkWS = chrome.extension.connect({name: "checkWS"});
	checkWS.postMessage({command: "checkWS", message: ""});
}

chrome.extension.onConnect.addListener(function(resultWS) {
	resultWS.onMessage.addListener(function(msg) {
		console.log(msg);
		console.log(userName);
		console.log(serverIP);
		if (userName != "" && userName != undefined) {
			document.getElementById( "loginName" ).value = userName;
		}
		if (serverIP != "" && serverIP != undefined) {
			document.getElementById( "server" ).value = serverIP;
		}
		restore_menu(msg);
	});
});

function userLogin() {
	var loginName = document.getElementById( "loginName" ).value;
	var avaPicture = document.getElementById( "avaPicture" ).value;

	if (loginName.length < 4) {
		alert("4文字以上のユーザー名を指定してください");
		return
	}

	if (avaPicture.length < 4) {
		alert("アバター画像を指定してください");
		return
	}

	window.localStorage.setItem("logon", loginName);
	userName = loginName;

	window.localStorage.setItem("picture", avaPicture);
	userPic = avaPicture;

	var port = chrome.extension.connect({name: "loginReq"});
	port.postMessage({command: "start", message: userName+";"+userPic});

	// Update status to let user know options were saved.
	var logins = document.createElement( "div" );
	logins.innerHTML = "<br>Login Request";
	document.body.appendChild( logins );
	setTimeout( function() { document.body.removeChild( logins ) }, 2000 );
}

chrome.extension.onConnect.addListener(function(lists) {
	lists.onMessage.addListener(function(msg) {
		console.log(msg.message);

		var sl = document.getElementById('method');
		while(sl.lastChild) {
			sl.removeChild(sl.lastChild);
		}

		var option = document.createElement('option');
		option.setAttribute("value","cast");
		option.innerHTML = "全体に";
		document.getElementById("method").appendChild(option);

		var option = document.createElement('option');
		option.setAttribute("value","crumb");
		option.innerHTML = "書置き";
		document.getElementById("method").appendChild(option);

		var users = msg.message.split(",");
		for (var i = 0 ; i < users.length ; i++ ) {
			if (users[i].length > 1) {
				var option = document.createElement('option');
				option.setAttribute("value",users[i]);
				option.innerHTML = users[i];
				document.getElementById("method").appendChild(option);
			}
		}
	});
});

$(function() {
	$('#method').mouseenter(function() {
	  if (menu_flg == false) {
		menu_flg = true;
		var port = chrome.extension.connect({name: "users"});
		port.postMessage({command: "users", message: userName});
	  }
	})
	.mouseleave(function() {
	  menu_flg = false;
	});
});

document.querySelector( '#save' ).addEventListener( 'click', save_options );
document.querySelector( '#send' ).addEventListener( 'click', sendMessage );
document.querySelector( '#login' ).addEventListener( 'click', userLogin );
document.querySelector( '#logout' ).addEventListener( 'click', logout );