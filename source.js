function createSource(frequency) {

	const output = context.createGain();
	output.connect(context.masterOut);
	output.gain.value = 0.0;

	const mix = context.createGain();
	mix.connect(output)

	const tone = context.createOscillator();
	tone.type = "square";
	tone.frequency.value = frequency;
	tone.start();
	tone.connect(mix);

	const overtone = context.createOscillator();
	overtone.type = "triangle";
	overtone.frequency.value = frequency*2;
	overtone.start();
	overtone.connect(mix);

	const tremolo = context.createOscillator();
	tremolo.type = "sine";
	tremolo.frequency.value = 5;
	tremolo.start();

	const depth = context.createGain();
	depth.gain.value = .1;

	tremolo.connect(depth);
	depth.connect(mix.gain);
	

	return {
		node: output,
		turnOn: () => output.gain.value = 1.0,
		turnOff: () => output.gain.value = 0.0,
		kill: () => output.disconnect(),
	};
}
