// A single key, that synthetize its own sound and keep track of its own state

const Key = function(){

	this.isDown = false;
	this.ratio = 2.4;
	this.frequency = 1;

	this.switch = context.createGain();
	this.output = context.createGain();
	this.harmonics = [];


	Organ.harmonicRatios.forEach(ratio => {
		
		const oscillator = context.createOscillator();
		oscillator.type = "sine";
		oscillator.start();

		const gain = context.createGain();
		oscillator.connect(gain);
		gain.connect(this.switch);

		this.harmonics.push({ratio, oscillator, gain});

	});

	this.switch.connect(this.output);

	this.updateHarmonicLevels();
	this.keyDown();
	this.keyUp();

	return this;

}

Key.prototype.updateHarmonicLevels = function() {
	Organ.harmonicLevels.forEach((level, index) => this.harmonics[index].gain.gain.value = level);
}

Key.prototype.setFrequency = function(frequency) {

	this.frequency = frequency;
	this.harmonics.forEach(harmonic => {
		harmonic.oscillator.frequency.value = frequency * harmonic.ratio;
	});

}

Key.prototype.keyDown = function(){
	if(this.isDown) return;
	this.isDown = true;
	this.switch.gain.value = 1.0;
}

Key.prototype.keyUp = function(){
	if(!this.isDown) return;
	this.isDown = false;
	this.switch.gain.value = 0.0;
}