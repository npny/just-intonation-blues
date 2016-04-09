// A complex instrument, which contains many keys and set their frequencies, post-process their output, and so on

var Organ = {

	// This corresponds to the drawbar harmonics on say a real Hammond B3 organ
	harmonicRatios: [1/2, 1, 3/2, 2, 3, 4, 5, 6, 8],

	// And these are the actual volume of each harmonic component. Here's a very bluesy preset.
	harmonicLevels: [1, 1, 0, 0, 0, 0, 0, 1, 0],
	//harmonicLevels: [1, 1, 1, 1, 1, 1, 1, 1, 1], // Uniform harmonic content
	//harmonicLevels: [0, 1, 0, 0, 0, 0, 0, 0, 0], // Fundamental tone
	//harmonicLevels: [1, 1, 1, 0, 0, 0, 0, 0, 0], // "Jimmy Smith" preset

	keys: [],


	init: function() {

		this.output = context.createGain();

	
		// Tremolo
		this.tremoloFreq = context.createOscillator();
		this.tremoloDepth = context.createGain()
		this.tremoloNode = context.createGain();
		
		this.tremoloFreq.type = "sine";
		this.tremoloFreq.frequency.value = 10;
		this.tremoloFreq.start();
		this.tremoloDepth.gain.value = .2;
		this.tremoloNode.gain.value = 1.0;

		this.tremoloFreq.connect(this.tremoloDepth);
		this.tremoloDepth.connect(this.tremoloNode.gain);
		this.tremoloNode.connect(this.output);


		// Init keys
		this.keys = [];
		for(var row = 0; row < 4; row++)
			for(var col = 0; col < 12; col++) {
				const key = new Key();
				key.output.connect(this.tremoloNode);
				this.keys.push(key);
			}
	},

	setBaseFrequency: function(baseFrequency) {

		this.baseFrequency = baseFrequency;
		this.keys.forEach(key => {
			key.setFrequency( baseFrequency * key.ratio );
		});

	},

	setScale: function(scale) {
		
		this.keys.forEach((key, i) => {
			const col = i % 12;
			const row = (i-col)/12;

			const index = col % scale.length;
			const octave = (col-index)/scale.length;

			key.ratio = Math.pow(2, row+octave) * scale[index];
		});

	}
}