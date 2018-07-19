/* global createCanvas, windowWidth, windowHeight, background, mouseIsPressed, fill, mouseX, mouseY, ellipse, rect */

function setup() {
  createCanvas(windowWidth, windowHeight);
}
function draw() {
  background(250);
  fill(0);
  ellipse(mouseX, mouseY, 20, 20);
}