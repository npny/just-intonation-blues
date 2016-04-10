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
				//x: Math.log2( i/range + 1 ) * canvasWidth,
				x: (i-.5)*binWidth,
				y: canvasHeight - row*octaveHeight,
				//width: ( Math.log2( (i+1) / range + 1 ) - Math.log2( i/range + 1 ) ) * canvasWidth,
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
	this.clear();
	this.renderSpectrogram();
	this.renderSpectralLines();
	requestAnimationFrame( () => this.update() );

}

Spectrogram.prototype.clear = function() {

	this.canvasContext.fillStyle = "rgb( 38, 50, 56 )";
	this.canvasContext.fillRect( 0, 0, this.canvasContext.canvas.width, this.canvasContext.canvas.width);

}


Spectrogram.prototype.renderSpectrogram = function() {

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


Spectrogram.prototype.renderSpectralLines = function() {

	for(var i = 0; i < Organ.keys.length; i++) {
		//if(!Organ.keys[sourceKeyMap[k]]) continue;

		const freq = Organ.keys[i].frequency;
		const octaveIndex = Math.floor(Math.log2(freq / this.baseFrequency));
		const octaveLow = Math.pow(2, octaveIndex) * this.baseFrequency;
		const octaveHigh = octaveLow*2;

		const height = this.canvasContext.canvas.height / this.octaveCount;
		const top = this.canvasContext.canvas.height - (height * octaveIndex) ;
		const left = Math.ceil( (freq - octaveLow) / (octaveHigh - octaveLow)  *  this.canvasContext.canvas.width );

		// Draw line
		this.canvasContext.strokeStyle = Organ.keys[i].isDown ? "hsl( 355, 78%, 40% )" : "rgb( 82, 121, 123 )";
		this.canvasContext.beginPath();
		this.canvasContext.moveTo(left, top - 5);
		this.canvasContext.lineTo(left, top - height + 5);
		this.canvasContext.stroke();

		// Draw text
		this.canvasContext.font = "Georgia";
		this.canvasContext.fillStyle = "rgb( 128, 203, 196 )";
		this.canvasContext.fillText( freq.toFixed(0) + " Hz", left + 5, top - 5);

	}

}