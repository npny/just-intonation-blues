var LeslieSpeaker = {


	init: function(){

		// Original Leslie 122 has bass/treble cut-off set at 800Hz

		trebleFilter = context.createBiquadFilter()
		trebleFilter.type = "highpass";
		trebleFilter.frequency = 800;
		//trebleFilter.Q = 
		trebleGain = context.createGain();
		trebleGain.gain.value = .8;
		

		bassFilter = context.createBiquadFilter()
		bassFilter.type = "lowpass";
		bassFilter.frequency = 800;
		//bassFilter.Q = 
		bassGain = context.createGain();
		bassGain.gain.value = 2.0;
		

		treblePanner = new RotaryPanner();
		bassPanner = new RotaryPanner();
		bassPanner.rotFreq = 10;

		
		context.listener.setPosition(-3, 0, 0);
		input = context.createGain();

		input.connect(trebleFilter);
		input.connect(bassFilter);

		trebleFilter.connect(trebleGain);
		bassFilter.connect(bassGain);

		trebleGain.connect(treblePanner.panner);
		bassGain.connect(bassPanner.panner);

		output = context.createGain();
		bassPanner.panner.connect(output);
		treblePanner.panner.connect(output);


		this.input = input;
		this.output = output;
		this.treblePanner = treblePanner;
		this.bassPanner = bassPanner;


		setInterval( () => {
			const t = context.currentTime;

			treblePanner.update(t);
			bassPanner.update(t);

		}, 10);

	}


}


function RotaryPanner(options) {

	this.panner = context.createPanner();
	//this.panner.coneInnerAngle = 45;
	//this.panner.coneOuterAngle = 60;
	//this.panner.coneOuterGain = .5;
	//this.dopplerFactor = 800;
	this.armLength = 1;
	this.rotFreq = 13;

	return this;

}

RotaryPanner.prototype.update = function(t) {

	const x = this.armLength * Math.cos(t * this.rotFreq * Math.PI);
	const y = this.armLength * Math.sin(t * this.rotFreq * Math.PI);

	this.panner.setPosition(x, y, 0);
	this.panner.setOrientation(x, y, 0);
	//this.panner.setVelocity(y * this.dopplerFactor, x * this.dopplerFactor, 0); // Switch X and Y components because velocity is tangential

}