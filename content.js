
let bakAction = "";
let test = document.createElement('div');
let testText = document.createElement('div');

window.addEventListener('keydown', onKeyDownOrUp);
window.addEventListener('keyup', onKeyDownOrUp);

window.onload = function() {

	test.style.position = 'fixed';
	test.style.width = "100%";
	test.style.height = "100%";
	test.style.top = "0";
	test.style.left = "0";
	test.style.right = "0";
	test.style.bottom = "0";
	test.style.zIndex = "2";
	test.style.backgroundColor = "#AAAAAA";
	test.style.opacity = "0";
	test.style.display = 'none';

	document.body.appendChild(test);

	testText.style.top = "50%";
	testText.style.left = "50%";
	testText.style.fontSize = "50px";
	testText.style.color = "white";
	testText.style.position = "absolute";
	testText.style.display = 'none';
	testText.textContent = "";	
	testText.innerHTML = "";

	document.body.appendChild(testText);
};

chrome.runtime.onMessage.addListener(function (message) {
	if (bakAction != message) {
		if (message.indexOf("avater;") == 0) {
			var strs = message.split(";");
			testText.innerHTML = strs[1] + "<br><img src =\"" + strs[2] + "\">";
			test.style.display = 'block';
			testText.style.display = 'block';
		} else if (message.indexOf("http") == 0) {
			testText.innerHTML = "<img src =\"" + message + "\">";
			test.style.display = 'block';
			testText.style.display = 'block';
		} else {
			testText.innerHTML = message;	
			test.style.display = 'block';
			testText.style.display = 'block';
		}
		bakAction = message;
	}
});

test.onclick = function(e) {
	testText.innerHTML = "";
	testText.textContent = "";
	test.style.display = 'none';
	testText.style.display = 'none';
	e.preventDefault();
};

function onKeyDownOrUp(e) {
	testText.innerHTML = "";
	testText.textContent = "";
	test.style.display = 'none';
	testText.style.display = 'none';
	e.preventDefault();
};
