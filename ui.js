const controls = document.getElementById("controls");

function addSelect(id, options) {
	const select = document.createElement("select");
	select.size = Object.keys(options).length;
	select.id = id;
	select.addEventListener("focus", e => select.blur());

	for(var k in options) {
		const optionElement = document.createElement("option");
		optionElement.value = k;
		optionElement.innerText = options[k];
		select.appendChild(optionElement);
	}

	controls.appendChild(select);
	return select;
}







// Output volume

const range = document.getElementById("outputVolume");
range.style.width = 500;
range.min = 0.0;
range.max = 2.0;
range.step = .1;
range.value = .1;
range.oninput = () => context.masterOut.gain.value = range.value;



// "Enter a base frequency (tonality) or select a standard one"

const tonalities = {}; Object.keys(standardFrequencies).slice(0, 12).forEach(k => tonalities[k] = k);
tonalities["custom"] = "Custom";
const tonalitySelect = addSelect("tonality", tonalities);

const tonalityInput = document.createElement("input");
tonalityInput.id = "tonalityInput";
tonalityInput.type = "number";
controls.appendChild(tonalityInput);
tonalityInput.addEventListener("focus", e => tonalitySelect.value = "Custom");





const intonationSelect = addSelect("intonation", {
	"just": "Just intonation",
	"equal": "Equal temperament",
});



const scaleSelect = addSelect("scale", {
	"minorBlues": "Minor Blues Pentatonic",
	"minorPentatonic": "Minor Pentatonic",
	"chromatic": "Chromatic",
	"harmonic": "Harmonic Keyboard (disregard intonation)",
});



function updateKeyboard() {

	var intonation;
	if(intonationSelect.value == "just") intonation = justScale;
	if(intonationSelect.value == "equal") intonation = equalScale;

	var tonality;
	if(tonalitySelect.value == "custom") tonality = tonalityInput.value;
	else tonality = standardFrequencies[tonalitySelect.value];

	var keyboard;
	if(scaleSelect.value == "harmonic") keyboard = harmonicKeyboard;
	if(scaleSelect.value == "chromatic") keyboard = flatKeyboard( intonation );
	if(scaleSelect.value == "minorPentatonic") keyboard = flatKeyboard( padToRow( minorPentatonic( intonation ), 12 ) );
	if(scaleSelect.value == "minorBlues") keyboard = flatKeyboard( padToRow( minorBlues( intonation ), 12 ) );

	changeKeyboard(tonality, keyboard);
}


function init() {

	tonalitySelect.value = "D";
	intonationSelect.value = "just";
	scaleSelect.value = "minorBlues";


	controls.addEventListener("change", updateKeyboard);
	updateKeyboard();

}

init();


// Convenience features
document.addEventListener("keydown", e => {
	//console.log(e);

	// Cmd+R being preventDefaulted() is pretty annoying when debugging.
	if(e.code == "KeyR" && e.metaKey || e.ctrlKey) window.location.reload();

	// Change tonality up or down with Tab / Shift+Tab
	if(e.code == "Tab")
	{
		const currentOption = document.querySelector(`#tonality option[value="${tonalitySelect.value}"]`);
		const newOption = e.shiftKey ? currentOption.previousSibling : currentOption.nextSibling;

		if(newOption && newOption.value != "custom") {
			tonalitySelect.value = newOption.value;
			updateKeyboard();
		}
	}
})