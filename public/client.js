/* global createCanvas, windowWidth, windowHeight, background, mouseIsPressed, fill, mouseX, mouseY, ellipse, rect */

function setup() {
  createCanvas(windowWidth - 20, windowHeight - 20);
}
function draw() {
  background(0);
  rectMode(CENTER);
  fill(0);
  ellipse(mouseX, mouseY, 20, 20);
  
  push();
  noFill();
  stroke(255, 255, 255, 50);
  for(let i = -1; i < 10; i ++) {
    strokeWeight(10);
    rect(width/2, height/2, width - i, height - i);
  }
  pop();
}