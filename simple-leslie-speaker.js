var SimpleLeslie = {
	
	// A much simpler approximation that doesn't sound as good but is a lot faster to run
	init: function(){

		const frequency = 6;
		const vibratoRange = 25;

		this.input = context.createGain();
		this.output = context.createGain();
		
		this.phase = context.createOscillator();
		this.phase.frequency.value = frequency;
		this.phase.start();

		this.vibratoRange = context.createGain();
		this.vibratoRange.gain.value = vibratoRange/context.sampleRate;

		this.vibrato = context.createDelay();

		// Connect phases
		this.phase.connect(this.vibratoRange);
		this.vibratoRange.connect(this.vibrato.delayTime);

		// Connect main line
		this.input.connect(this.output);
		this.input.connect(this.vibrato);
		this.vibrato.connect(this.output);

	}

}