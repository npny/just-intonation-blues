// Groovy Ray Charles. With love =D

const imagesContainer = document.querySelector("#groovy-charles .images-container");
const gauge = document.querySelector("#groovy-charles .gauge");
const status = document.querySelector("#groovy-charles .text-status");


function loadCharles() {
	for(var i = 0; i < 12; i++) {
		const img = document.createElement("img");
		img.src = "groovy-charles/" + i + ".png";
		imagesContainer.appendChild(img);
	}

	imagesContainer.children[0].classList.add("visible");
}
loadCharles();


var points = 0;
const maxPoints = 30;
const pointsPerKeystroke = 1.3;
const pointsDecayRate = 15; // per sec

var phase = 0;
const maxLevel = 3;
const framesPerLevel = 3;
const frameDuration = 200;

function updateCharles() {

	const frame = Math.round(points/maxPoints * maxLevel) * framesPerLevel + phase;
	phase = (phase + 1) % framesPerLevel;

	// Change the visible image
	imagesContainer.querySelector(".visible").classList.remove("visible")
	imagesContainer.children[frame].classList.add("visible");

}

setInterval(updateCharles, frameDuration);


// Add points on keystrokes
document.addEventListener("keydown", e => {
	points += pointsPerKeystroke;
	if(points > .7*maxPoints) points -= .6;
	if(points > maxPoints) points = maxPoints;
});

// Remove points over time (and visually update the gauge periodically)
var lastTime = 0;
function update(newTime) {
	window.requestAnimationFrame(update);
	if(!newTime) return;
	const delta = (newTime - lastTime)/1000;
	lastTime = newTime;

	points -= delta * pointsDecayRate;
	if(points < 0) points = 0;

	gauge.style.height = (points/maxPoints*100).toFixed(2) + "%";
}

update();