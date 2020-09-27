// Saves options to localStorage.
function save_options() {
	var server = document.getElementById( "server" ).value;

	window.localStorage.setItem("server", server);

	// Update status to let user know options were saved.
	var status = document.createElement( "div" );
	status.innerHTML = "<br>Options saved";
	document.body.appendChild( status );
	setTimeout( function() { document.body.removeChild( status ) }, 2000 );
}

// Restores options dialog state to saved value from localStorage.
function restore_options() {
	strs = window.localStorage.getItem("server");
	if (strs != null) {
		document.getElementById( "server" ).value = strs;
	}
}

function sendMessage() {
	var mess = document.getElementById( "message" ).value;
	var meth = document.getElementById( "method" ).value;

	if (meth == "書置き") {
		chrome.tabs.getSelected(null,function(tab) {
			var strs = tab.url.split("@")[1].split(",");
			mess = strs[0] + "," + strs[1] + ":" + mess;
			var port = chrome.extension.connect({name: "sendMess"});
			port.postMessage({command: meth, message: mess});
		});
	} else {
		var port = chrome.extension.connect({name: "sendMess"});
		port.postMessage({command: meth, message: mess});
	}

	// Update status to let user know options were saved.
	var send = document.createElement( "div" );
	send.innerHTML = "<br>Message send";
	document.body.appendChild( send );
	setTimeout( function() { document.body.removeChild( send ) }, 2000 );
}

document.addEventListener( 'DOMContentLoaded', restore_options );
document.querySelector( '#save' ).addEventListener( 'click', save_options );
document.querySelector( '#send' ).addEventListener( 'click', sendMessage );
