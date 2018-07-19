// Makes unnecessary distractions go away XD
/* global
 * Envirnment
  createCanvas, windowWidth, windowHeight, width, height, mouseX, mouseY, 
 * Events
  mouseIsPressed, 
 * Modes/Aligns
  rectMode, ellipseMode, CENTER, CORNER, TOP, BOTTOM, LEFT, RIGHT
 * Color
  fill, stroke, strokeWeight, noFill, background, 
 * Transformations
  push, pop,
 * Shapes
  ellipse, rect
 */

function setup() {
  createCanvas(windowWidth - 20, windowHeight - 20);
}
function draw() {
  background(255);
  rectMode(CENTER);
  fill(0);
  ellipse(mouseX, mouseY, 200, 200);
  
  push();
  noFill();
  strokeWeight(3);
  for(let i = 0; i < 10; i ++) {
    stroke(255, ((10 - i)/10) * 255);
    rect(width/2, height/2, width - i, height - i, (i/10) * 5);
  }
  pop();
}