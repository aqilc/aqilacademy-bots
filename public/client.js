// Make unnecessary distractions go away XD
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
  ellipse(mouseX, mouseY, 20, 20);
  
  push();
  noFill();
  for(let i = 0; i < 10; i ++) {
    stroke(255, (10 - i) * 255);
    strokeWeight(4);
    rect(width/2, height/2, width - i, height - i, (i/10) * 5);
  }
  pop();
}