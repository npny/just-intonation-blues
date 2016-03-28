const controls = document.getElementById("controls");

function addOptions(id, options) {
	const select = document.getElementById(id);
	select.size = Object.keys(options).length;
	select.addEventListener("focus", e => select.blur());

	for(var k in options) {
		const optionElement = document.createElement("option");
		optionElement.value = k;
		optionElement.innerText = options[k];
		select.appendChild(optionElement);
	}

	return select;
}







// Output volume

const range = document.getElementById("output-volume");
range.min = 0.0;
range.max = 2.0;
range.step = .1;
range.value = .1;
range.addEventListener("input", e => context.masterOut.gain.value = range.value);
range.addEventListener("change", e => e.stopPropagation());


// "Enter a base frequency (tonality) or select a standard one"

const tonalityInput = document.getElementById("tonality-input");

const tonalities = {}; Object.keys(standardFrequencies).slice(0, 12).forEach(k => tonalities[k] = k);
tonalities["custom"] = "Custom";
const tonalitySelect = addOptions("tonality-select", tonalities);
tonalitySelect.size = "";

tonalityInput.addEventListener("focus", e => tonalitySelect.value = "custom");
tonalityInput.addEventListener("keydown", e => e.stopPropagation());
tonalityInput.addEventListener("blur", e => updateKeyboard);
tonalitySelect.addEventListener("change", e => tonalityInput.value = standardFrequencies[tonalitySelect.value]);





const intonationSelect = addOptions("intonation-select", {
	"just": "Just intonation",
	"equal": "Equal temperament",
});



const scaleSelect = addOptions("scale-select", {
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
	if(tonalitySelect.value == "custom") tonality = parseFloat(tonalityInput.value);
	else tonality = standardFrequencies[tonalitySelect.value];

	var keyboard;
	if(scaleSelect.value == "harmonic") keyboard = harmonicKeyboard;
	if(scaleSelect.value == "chromatic") keyboard = flatKeyboard( intonation );
	if(scaleSelect.value == "minorPentatonic") keyboard = flatKeyboard( padToRow( minorPentatonic( intonation ), 12 ) );
	if(scaleSelect.value == "minorBlues") keyboard = flatKeyboard( padToRow( minorBlues( intonation ), 12 ) );

	changeKeyboard(tonality, keyboard);
}



// Convenience features
document.addEventListener("keydown", e => {
	//console.log(e);

	// Cmd+R being preventDefaulted() is pretty annoying when debugging.
	if(e.code == "KeyR" && e.metaKey || e.ctrlKey) window.location.reload();

	// Change tonality up or down with arrow up / down
	if(e.code == "ArrowUp" || e.code == "ArrowDown")
	{
		const currentOption = document.querySelector(`#tonality-select option[value="${tonalitySelect.value}"]`);
		const newOption = e.code == "ArrowUp" ? currentOption.previousSibling : currentOption.nextSibling;

		if(newOption && newOption.value != "custom") {
			tonalitySelect.value = newOption.value;
			updateKeyboard();
		}
	}
})