const standardFrequencies = {
	"C": 261.63,
	"C#": 277.18,
	"D": 293.66,
	"D#": 311.13,
	"E": 329.63,
	"F": 349.23,
	"F#": 369.99,
	"G": 392.00,
	"G#": 415.30,
	"A": 440.00,
	"A#": 466.16,
	"B": 493.88,
};

// Extend standard
Object.keys(standardFrequencies).forEach(k => {
	for(var i = 0; i <= 4; i++) {
		standardFrequencies[k + (4+i)] = standardFrequencies[k] * Math.pow(2, i);
		standardFrequencies[k + (4-i)] = standardFrequencies[k] / Math.pow(2, i);
	}
});



// Multiply every item of a list by a number
const mul = (list, n) => list.map(x => x * n);

// Builds an object from a list of keys and a list of values
const map = (keys, values) => {
	const ret = {};
	for(var i = 0; i < keys.length; i++)
		ret[keys[i]] = values[i];
	return ret;
}

// Flattens a list of arrays into a single array
const flatten = array => Array.prototype.concat.apply([], array);

// Loop the scale to use the 12 keys of a row
const padToRow = (scale, size) => {
	var ret = [];
	while(ret.length < size) {
		ret = ret.concat(scale);
		scale = mul(scale, 2);
	}
	return ret.slice(0, 12);
}





// Harmonic keyboard
// Where going up one row or right six keys brings you a perfect fifth higher.
// This is somewhat related to the system used on guitars (going up one string or right 5 frets brings you a fourth higher)
// This keyboard is all neat and mathematical, but it lacks a blue note, a semitone, contains redundant notes (octaves and fifths), and contains non-standard intervals (on the OP^$ keys)

const harmonicSerie = [
	1 + 0,
	1 + 1/16,
	1 + 1/8,
	1 + 1/5,
	1 + 1/4,
	1 + 1/3,
];

const harmonicKeyboard = map(
	flatten( reducedKeyboard ),
	[].concat(
		mul( [].concat( harmonicSerie, mul( harmonicSerie, 3/2 ) ), 2 ),
		mul( [].concat( harmonicSerie, mul( harmonicSerie, 3/2 ) ), 3/2 ),
		mul( [].concat( harmonicSerie, mul( harmonicSerie, 3/2 ) ), 1 )
	)
)






// More common keyboards
const equalScale = Array.from(new Array(12), (x, n) => Math.pow(2, n/12));
const justScale = [
	1, 			// 0 Tonic
	1.0625,		// 1 
	1.125,		// 2 
	1.2,		// 3 Minor third
	1.25,		// 4 Major third
	1.3333333,  // 5 Fourth
	1.40625,	// 6 Blue note
	1.5,		// 7 Fifth
	1.59375,	// 8
	1.6875,		// 9
	1.8,		// 10 Minor seventh
	1.875,		// 11
];


// Notes 1 to 12, one octave per row
const flatKeyboard = sourceScale => map(
	flatten( reducedKeyboard ),
	[].concat(
		mul( sourceScale, 4 ),
		mul( sourceScale, 2 ),
		mul( sourceScale, 1 )
	)
)




// And finally, scale-specific keyboards
// Like this minor blues keyboard. You're not getting all the possible notes, but that's because you don't need them.

const minorPentatonic = sourceScale => [
	sourceScale[0],
	sourceScale[3],
	sourceScale[5],
	sourceScale[7],
	sourceScale[10]
];


const minorBlues = sourceScale => [
	sourceScale[0],
	sourceScale[3],
	sourceScale[5],
	sourceScale[6],
	sourceScale[7],
	sourceScale[10],
	sourceScale[11]
];




const bluesScale12 = padToRow(minorBlues(justScale), 12);
const bluesKeyboard = map(
	flatten( reducedKeyboard ),
	[].concat(
		mul( bluesScale12, 4 ),
		mul( bluesScale12, 2 ),
		mul( bluesScale12, 1 )
	)
)
