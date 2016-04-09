const clamp = (min, x, max) => x < min ? min : (x > max ? max : x);


var Spectrogram = function( analyserNode, canvasElement ) {



	this.analyserNode = analyserNode;
	//this.analyserNode.fftSize = 512;
	this.analyserNode.minDecibel = - 110;
	this.analyserNode.maxDecibel = - 30;
	this.analyserNode.smoothingTimeConstant = 0;

	this.audioContext = this.analyserNode.context;
	this.canvasContext = canvasElement.getContext( "2d" );


	// Set the dataBuffer to what it would be with max size FFT. (at 32k FFT size that's 16K bins, or about 65Ko of memory)
	// Then if we happen to use less than that no big deal. Point is we don't have to resize.
	// And by definition we won't be able to use more.
	this.dataBuffer = new Float32Array( 16384 );


	this.octaveCount = 4;
	this.baseFrequency = 263;
	this.drawList = [];



	this.setResolutionLevel(3);
	this.recomputeDrawRects();
	this.update();
	return this;

}


Spectrogram.prototype.setResolutionLevel = function(n) {

	this.resolutionLevel = clamp(8, 8+n, 15);
	this.analyserNode.fftSize = Math.pow(2, this.resolutionLevel);
	//this.analyserNode

	this.amplitudeFactor = 1/(this.analyserNode.maxDecibel - this.analyserNode.minDecibel);
	this.amplitudeConstant = this.analyserNode.minDecibel;

}


// Precompute the drawing parameters (bin index, position, size, relation to the octave, etc.) so that the act of rendering is completely straightforward : apply the dataBuffer values and draw.
Spectrogram.prototype.recomputeDrawRects = function() {

	const frequencyStep = this.audioContext.sampleRate / this.analyserNode.fftSize;
	const canvasHeight = this.canvasContext.canvas.height;
	const canvasWidth = this.canvasContext.canvas.width;
	const octaveHeight = canvasHeight/this.octaveCount;

	this.drawList.splice(0, this.drawList.length);
	//var rowFrequency = this.baseFrequency;

	for(var row = 0; row < this.octaveCount; row++) {
		const rowFrequency = this.baseFrequency * Math.pow(2, row);
		const startIndex = Math.floor(rowFrequency/frequencyStep);
		const endIndex   = Math.ceil(2*rowFrequency/frequencyStep);
		const range = endIndex - startIndex;
		const binWidth = canvasWidth/range;

		for(var i = 0; i < range; i++) {
			this.drawList.push({
				binIndex: startIndex+i,
				x: i*binWidth,
				y: canvasHeight - row*octaveHeight,
				width: binWidth,
				height: -octaveHeight,
				hue: (i/range)*360,
				frequency: rowFrequency + i*frequencyStep,
			});
		}
	}

}


Spectrogram.prototype.update = function() {

	this.analyserNode.getFloatFrequencyData( this.dataBuffer );
	this.render();
	requestAnimationFrame( () => this.update() );

}


Spectrogram.prototype.render = function() {

	this.canvasContext.fillStyle = "rgb( 38, 50, 56 )";
	this.canvasContext.fillRect( 0, 0, this.canvasContext.canvas.width, this.canvasContext.canvas.width);

	for(var i = 0; i < this.drawList.length; i++) {

		const drawRect = this.drawList[i];
		const value = this.dataBuffer[drawRect.binIndex];
		const adjustedValue = (value - this.analyserNode.minDecibel) / (this.analyserNode.maxDecibel - this.analyserNode.minDecibel);

		//this.canvasContext.fillStyle = "rgb( 128, 203, 196 )";
		this.canvasContext.fillStyle = `hsla(${drawRect.hue}, 18%, 46%, ${adjustedValue})`;
		//this.canvasContext.fillRect( drawRect.x, drawRect.y, drawRect.width, drawRect.height);

		// Draw pixel-aligned boxes instead
		const x = Math.round(drawRect.x);
		const y = Math.round(drawRect.y);
		const width = Math.round(drawRect.x + drawRect.width) - x;
		const height = Math.round(drawRect.y + drawRect.height) - y;
		this.canvasContext.fillRect( x, y, width, height );

	}

}