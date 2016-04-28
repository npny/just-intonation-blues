var LeslieSpeaker = {


	init: function(){

		// Original Leslie 122 has bass/treble cut-off set at 800Hz

		trebleFilter = context.createBiquadFilter()
		trebleFilter.type = "highpass";
		trebleFilter.frequency = 800;
		//trebleFilter.Q = 
		trebleGain = context.createGain();
		//trebleGain.gain.value = .8;
		

		bassFilter = context.createBiquadFilter()
		bassFilter.type = "lowpass";
		bassFilter.frequency = 800;
		//bassFilter.Q = 
		bassGain = context.createGain();
		//bassGain.gain.value = 2.0;
		

		//treblePanner = new RotaryPanner();
		//bassPanner = new RotaryPanner();
		//bassPanner.rotFreq = 10;

		
		//context.listener.setPosition(-3, 0, 0);
		input = context.createGain();

		input.connect(trebleFilter);
		input.connect(bassFilter);

		trebleFilter.connect(trebleGain);
		bassFilter.connect(bassGain);

		//trebleGain.connect(treblePanner.input);
		//bassGain.connect(bassPanner.input);

		output = context.createGain();
		output.gain.value = .1;
		//bassPanner.output.connect(output);
		//treblePanner.output.connect(output);


		const trebleStage = new RotaryStage({rotFreq: 5});
		const bassStage = new RotaryStage({rotFreq: 6});

		trebleGain.connect(trebleStage.input);
		bassGain.connect(bassStage.input);

		//trebleStage.output.connect(output);
		//bassStage.output.connect(output);

		//
		input.connect(trebleStage.input);
		input.connect(bassStage.input);
		trebleStage.output.connect(output);
		bassStage.output.connect(output);
		//

		this.input = input;
		this.output = output;
		//this.treblePanner = treblePanner;
		//this.bassPanner = bassPanner;


		/*setInterval( () => {
			const t = context.currentTime;

			treblePanner.update(t);
			bassPanner.update(t);

		}, 10);*/

	}


}

/*
function RotaryPanner(options) {

	this.panner = context.createPanner();
	//this.panner.coneInnerAngle = 45;
	//this.panner.coneOuterAngle = 60;
	//this.panner.coneOuterGain = .5;
	this.input = context.createGain();
	this.output = context.createGain();

	this.input.connect(this.panner);
	this.panner.connect(this.output);

	this.armLength = 1;
	this.rotFreq = 13;

	return this;

}

RotaryPanner.prototype.update = function(t) {

	const x = this.armLength * Math.cos(t * this.rotFreq * Math.PI);
	const y = this.armLength * Math.sin(t * this.rotFreq * Math.PI);

	this.panner.setPosition(x, y, 0);
	this.panner.setOrientation(x, y, 0);
	//this.doppler.delayTime.value = x * this.frequencyExcursion / context.sampleRate;
	//this.panner.setVelocity(y * this.dopplerFactor, x * this.dopplerFactor, 0); // Switch X and Y components because velocity is tangential

}
*/


// Simulate one wall reflection path (with different ToF and doppler shift) using a delay line
function ReflectionPath(options) {

	// Create nodes to simulate audio data being delayed and attenuated as the path length changes
	// (frequency-dependent attenuation with a biQuadFilter isn't implemented yet)
	// This is a more efficient implementation using only audioParams rather than manually setting a panner and a delay values through a timeout
	this.input = context.createGain(); // Audio in
	this.phaseInput = options.phaseInput; // Reference to a common LFO encoding the rotary speaker angle
	
	this.delayNode = context.createDelay();
	this.delayNode.delayTime.value = 0.0;

	//this.delayController = getOscillator({min: 0, max: options.delayRange, frequency: this.phaseInput.frequency.value,})
	//this.delayController.connect(this.delayNode.delayTime);
	//this.bufferingDelayNode = context.createDelay();
	//this.bufferingDelayNode.delayTime.value = options.delayRange;
	//this.input.connect(this.bufferingDelayNode);
	//this.bufferingDelayNode.connect(this.delayNode);

	this.delayPhaseShift = context.createDelay();
	this.delayPhaseShift.delayTime.value = options.delayPhaseShift / this.phaseInput.frequency.value;
	this.delayDepth = context.createGain();
	this.delayDepth.gain.value = options.delayRange || (this.phaseInput.frequency.value / context.sampleRate);

	this.attenuationNode = context.createGain();
	this.attenuationNode.gain.value = 1.0
	this.attenuationPhaseShift = context.createDelay();
	this.attenuationPhaseShift.delayTime.value = options.attenuationPhaseShift / this.phaseInput.frequency.value;
	this.attenuationDepth = context.createGain();
	this.attenuationDepth.gain.value = options.attenuationRange || .2;

	this.output = context.createGain();


	// Wire phase input for doppler/delay effect
	this.phaseInput.connect(this.delayPhaseShift);
	this.delayPhaseShift.connect(this.delayDepth);
	this.delayDepth.connect(this.delayNode.delayTime);

	// Wire a possibly out-of-phase phase input for attenuation effect
	this.phaseInput.connect(this.attenuationPhaseShift);
	this.attenuationPhaseShift.connect(this.attenuationDepth);
	this.attenuationDepth.connect(this.attenuationNode.gain);

	// Wire audio
	this.input.connect(this.delayNode);
	this.delayNode.connect(this.attenuationNode);
	this.attenuationNode.connect(this.output);

	return this;
}


// Simulate a rotary speaker and a bunch of walls (=reflectionPath) all locked to the same phase
function RotaryStage(options) {

	options = options || {};
	options.pathCount = options.pathCount || 4;
	options.rotFreq = options.rotFreq || 5;
	
	options.freqRange = 100;
	options.delayRange = options.freqRange / context.sampleRate;

	this.input = context.createGain();
	this.bufferLine = context.createDelay(); // Avoids null samples when path delay goes negative
	this.output = context.createGain();
	this.output.gain.value = 1 / options.pathCount;

	this.bufferLine.delayTime.value = options.delayRange/2;
	this.input.connect(this.bufferLine);

	const speakerRotation = context.createOscillator();
	speakerRotation.frequency.value = options.rotFreq / options.pathCount;
	speakerRotation.start();

	const paths = [];
	const pathCount = options.pathCount;

	// Compute for that many reflection paths
	for(var i = 0; i < pathCount; i++) {
		
		paths[i] = new ReflectionPath({
			phaseInput: speakerRotation,
			delayPhaseShift: i / options.pathCount,
			attenuationPhaseShift: (i+1) / options.pathCount,
			delayRange: options.delayRange,
			attenuationRange: .2,
		});
		
		this.bufferLine.connect(paths[i].input);
		paths[i].output.connect(this.output);

	}

	return this;
}


// This is a shorthand for the setPeriodicWave oscillator pattern, using only the parameters I'm interested in
function getOscillator(options) {

	options.min = options.min || 1.0;
	options.max = options.max || 2.0;
	options.frequency = options.frequency || 440.0
	options.cosContent = options.cosContent || [0];
	options.sinContent = options.sinContent || [1];

	const range = options.max - options.min;
	const base = options.min + range/2;
	let sinContent = [0]    .concat( options.sinContent.map(x => x*range) );
	let cosContent = [base] .concat( options.cosContent.map(x => x*range) );

	sinContent = [0, 1, 0, 0, 0];
	cosContent = [1, 0, 0, 0, 0];

    const customWave = context.createPeriodicWave(new Float32Array(cosContent), new Float32Array(sinContent), {disableNormalization: true});
    
    const oscillator = context.createOscillator();
    oscillator.setPeriodicWave(customWave);
    oscillator.frequency.value = options.frequency;
    oscillator.start();

    return oscillator;

}