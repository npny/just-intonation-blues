// A square wave key, for simplicity and performance

const SimpleKey = function(){

	this.isDown = false;
	this.ratio = 2.4;
	this.frequency = 1;

	this.switch = context.createGain();
	this.output = context.createGain();
	
	this.oscillator = context.createOscillator();
	this.oscillator.type = "triangle";
	this.oscillator.frequency.value = this.frequency;
	this.oscillator.start();

	this.oscillator.connect(this.switch);
	this.switch.connect(this.output);

	this.keyDown();
	this.keyUp();

	return this;

}

SimpleKey.prototype.setFrequency = function(frequency) {

	this.frequency = frequency;
	this.oscillator.frequency.value = frequency;

}

SimpleKey.prototype.keyDown = function(){
	if(this.isDown) return;
	this.isDown = true;
	this.switch.gain.value = 1.0;
}

SimpleKey.prototype.keyUp = function(){
	if(!this.isDown) return;
	this.isDown = false;
	this.switch.gain.value = 0.0;
}