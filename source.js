function createSource(frequency) {

	const output = context.createGain();
	output.connect(context.masterOut);
	output.gain.value = 0.0;

	// For now just a single oscillator, but a few more harmonics and a more complex effect network would produce a richer sound
	const oscillator = context.createOscillator();
	oscillator.type = "square"; // "square", "triangle", "sawtooth", "sine"
	oscillator.frequency.value = frequency;
	oscillator.start();
	oscillator.connect(output);
	

	return {
		node: output,
		turnOn: () => output.gain.value = 1.0,
		turnOff: () => output.gain.value = 0.0,
		kill: () => output.disconnect(context.masterOut),
	};
}
