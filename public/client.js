// Makes unnecessary distractions go away XD
/* global
 * Imported Variables
 fonts, WebFont, Button,
 * Environment
  createCanvas, windowWidth, windowHeight, width, height, mouseX, mouseY, pmouseX, pmouseY, frameRate,
 * Events
  mouseIsPressed, 
 * Modes/Aligns
  rectMode, textAlign, textFont, ellipseMode, CENTER, CORNER, TOP, BOTTOM, LEFT, RIGHT
 * Color
  fill, blue, red, green, hue, color, saturation, brightness, stroke, noStroke, strokeWeight, noFill, background, 
 * Transformations
  push, pop,
 * Shapes
  ellipse, rect, text
 */

function setup() {
  createCanvas(windowWidth - (windowHeight > 2000 ? 0 : 17), 2000);
  frameRate(100);
}

function draw() {
  background(255);
  noStroke();
  rectMode(CENTER);
  textAlign(CENTER, CENTER);
  
  fill(100);
  textFont("pixels", 200);
  Text("FPS: " + this.frameRate().toFixed(1), width/2, height/5);
}