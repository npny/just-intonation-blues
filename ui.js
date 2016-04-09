// Output volume
const range = document.getElementById("output-volume");
range.min = 0.0;
range.max = 2.0;
range.step = .1;
range.value = 1.3;
range.addEventListener("input", e => context.masterOut.gain.value = range.value);





const chromaticScale_12ET = Array.from(new Array(12), (x, n) => Math.pow(2, n/12));
const minorBluesScale_Just = [
	1/1, 			// 0 Tonic
	6/5,			// 3 Minor third
	4/3,  			// 5 Fourth
	3/2 / (16/15),	// 6 Blue note
	3/2,			// 7 Fifth
	9/5,			// 10 Minor seventh
	9/5 * (16/15),	// 11 Subtonic
];

//const minorBluesScale_Just2 = minorBluesScale_Just.slice(0,-1).concat([1.882]);
//const minorBluesScale_Just2 = minorBluesScale_Just.slice(0,-1).concat([1.875]);
const minorBluesScale_Just2 = minorBluesScale_Just.slice(0,-1)






//55*2^(n/12)

const noteNames = ["A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#"];
var baseNoteIndex = 12; // Note index ranges from 0 to whatever (around 96 for the end of the audible spectrum). It represents how many semi-tones up from A1 (55Hz)
var standardA = 55.0;
var baseFrequency = standardA; // This is the actual frequency. This can be set indirectly by selecting another baseNote, or directly by going up/down 1 Hz


// UI
const UI = {
	baseNoteIndex: 0,
	baseFrequency: 55.0,


	setBaseFrequency: function(baseFrequency) {

		window.baseFrequency = baseFrequency;
		Organ.setBaseFrequency(baseFrequency);
		//updateFreqDisplay();
		//updateSpectr();
		window.spectrogram.baseFrequency = baseFrequency;
		window.spectrogram.recomputeDrawRects();

	},

	setBaseNoteIndex: function(baseNoteIndex) {

		this.baseNoteIndex = baseNoteIndex;
		// updatePad
		updateFrequencyPad()

		this.setBaseFrequency(standardA * Math.pow(2, this.baseNoteIndex/12));

	}
}





//const bluesKeyboard = flatKeyboard( padToRow( minorBluesScale_Just2, 12 ) );
const frequencyPad = document.getElementById("frequency-pad");
function updateFrequencyPad() {
	
	// Build the table of names of nearby notes
	const table = [];
	for(var level = -1; level <= 1; level++) {
		
		const row = [];

		for(var n = -1; n <= 1; n++) {

			const index = (UI.baseNoteIndex + n) + (level * noteNames.length);
			const name = noteNames[index % noteNames.length];
			const octave = Math.round(index / noteNames.length);

			if(index >= 0)
				row.push(name.replace("#", "<sup>#</sup>") + "<sub>" + octave + "</sub>");
			else
				row.push("");

		}

		table.push(row);
	}


	// Reorder from bottom to top and add arrows
	const rows = [
		["", "", "↑", "", ""],
		[].concat([""], table[2], [""]),
		[].concat(["←"], table[1], ["→"]),
		[].concat([""], table[0], [""]),
		["", "", "↓", "", ""],
	];


	// Build HTML
	var html = "";
	for(var i = 0; i < rows.length; i++) {
		html += "<tr>";
		
		for(var j = 0; j < rows[i].length; j++)
			html += "<td>" + rows[i][j] + "</td>";

		html += "</tr>";
	}

	frequencyPad.innerHTML = html;

}





// Convenience features
document.addEventListener("keydown", e => {
	//console.log(e);

	// Cmd+R being preventDefaulted() is pretty annoying when debugging.
	if(e.code == "KeyR" && e.metaKey || e.ctrlKey) window.location.reload();

	// Change tonality up or down with arrow up / down
	if(e.code == "ArrowUp")
		UI.setBaseNoteIndex(UI.baseNoteIndex + 12);

	if(e.code == "ArrowDown")
		UI.setBaseNoteIndex(UI.baseNoteIndex - 12);

	if(e.code == "ArrowRight")
		UI.setBaseNoteIndex(UI.baseNoteIndex + 1);

	if(e.code == "ArrowLeft")
		UI.setBaseNoteIndex(UI.baseNoteIndex - 1);

})
