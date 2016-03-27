// 3 rows of 12 keys. All neat and convenient for a few octaves of 12-notes scales
const reducedKeyboard = 
[
	["Digit1", "Digit2", "Digit3", "Digit4", "Digit5", "Digit6", "Digit7", "Digit8", "Digit9", "Digit0", "Minus", "Equal"],
	["KeyQ", "KeyW", "KeyE", "KeyR", "KeyT", "KeyY", "KeyU", "KeyI", "KeyO", "KeyP", "BracketLeft", "BracketRight"],
	["KeyA", "KeyS", "KeyD", "KeyF", "KeyG", "KeyH", "KeyJ", "KeyK", "KeyL", "Semicolon", "Quote", "Backslash"],
]

// When you need all the keys you can get. This layout is not as straightforward to map to notes though
const fullKeyboard = 
[
	["IntlBackslash", "Digit1", "Digit2", "Digit3", "Digit4", "Digit5", "Digit6", "Digit7", "Digit8", "Digit9", "Digit0", "Minus", "Equal", "Backspace"],
	["Tab", "KeyQ", "KeyW", "KeyE", "KeyR", "KeyT", "KeyY", "KeyU", "KeyI", "KeyO", "KeyP", "BracketLeft", "BracketRight", "Enter"],
	["KeyA", "KeyS", "KeyD", "KeyF", "KeyG", "KeyH", "KeyJ", "KeyK", "KeyL", "Semicolon", "Quote", "Backslash", "Enter"],
	["ShiftLeft", "Backquote", "KeyZ", "KeyX", "KeyC", "KeyV", "KeyB", "KeyN", "KeyM", "Comma", "Period", "Slash", "ShiftRight"],
	["Space"]
]


var sourceKeyMap = {};

const handler = e => {
	e.preventDefault();
	//console.log(e.code);
	if(sourceKeyMap[e.code])
		sourceKeyMap[e.code][e.type == "keydown" ? "turnOn" : "turnOff"]();
}

document.addEventListener("keydown", handler);
document.addEventListener("keyup", handler);