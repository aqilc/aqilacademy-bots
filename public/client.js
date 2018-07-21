// Makes unnecessary distractions go away XD
/* global
 * Envirnment
  createCanvas, windowWidth, windowHeight, width, height, mouseX, mouseY, frameRate,
 * Events
  mouseIsPressed, 
 * Modes/Aligns
  rectMode, ellipseMode, CENTER, CORNER, TOP, BOTTOM, LEFT, RIGHT
 * Color
  fill, stroke, noStroke, strokeWeight, noFill, background, 
 * Transformations
  push, pop,
 * Shapes
  ellipse, rect
 */


function setup() {
  createCanvas(windowWidth - 20, windowHeight - 20);
  frameRate(1000);
}

function draw() {
  background(255);
  noStroke();
  rectMode(CENTER);
  fill(250);
  ellipse(mouseX, mouseY, 200, 200);
  print(JSON.stringify(frameRate));
  
  fill(0, 1);
  for(let i = 0; i < 255; i += 2) {
    rect(width/2, height - i/2, width, i);
  }
  
  push();
  noFill();
  strokeWeight(3);
  for(let i = 0; i < 10; i ++) {
    stroke(255, ((10 - i)/10) * 255);
    rect(width/2, height/2, width - i, height - i, (i/10) * 5);
  }
  pop();
}