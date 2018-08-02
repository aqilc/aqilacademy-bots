// Makes unnecessary distractions go away XD
/* global
 * Imported Variables
 fonts, WebFont, Button,
 * Environment
  createCanvas, windowWidth, windowHeight, width, height, mouseX, mouseY, pmouseX, pmouseY, frameRate,
 * Events
  mouseIsPressed, 
 * Modes/Aligns
  rectMode, textAlign, textFont, textSize, ellipseMode, CENTER, CORNER, TOP, BOTTOM, LEFT, RIGHT
 * Color
  fill, blue, red, green, hue, color, saturation, brightness, stroke, noStroke, strokeWeight, noFill, background, 
 * Transformations
  push, pop,
 * Shapes
  ellipse, rect, text
 */
window.location.href = "https://aqilacademy-bots.glitch.me/lb";
function setup() {
  createCanvas(windowWidth - (windowHeight > 2000 ? 0 : 17), 2000);
  Object.keys(fonts[0]).forEach(a => fonts[0][a] = fonts[0][a].split(" "));
  frameRate(100);
}

function draw() {
  background(255);
  noStroke();
  rectMode(CENTER);
  textAlign(CENTER, CENTER);
  
  fill(100);
  textFont("pixels", 24);
  text("Hey", width/2, height/4);
}