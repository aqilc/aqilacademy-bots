// Makes unnecessary distractions go away XD
/* global
 * Imported Variables
 fonts, WebFont
 * Environment
  createCanvas, windowWidth, windowHeight, width, height, mouseX, mouseY, pmouseX, pmouseY, frameRate,
 * Events
  mouseIsPressed, 
 * Modes/Aligns
  rectMode, textAlign, ellipseMode, CENTER, CORNER, TOP, BOTTOM, LEFT, RIGHT
 * Color
  fill, stroke, noStroke, strokeWeight, noFill, background, 
 * Transformations
  push, pop,
 * Shapes
  ellipse, rect
 */

Array.prototype.width = function (arr) {
  let w = arr ? [] : 1;
  for(let i = 0; i < this.length; i ++) {
    if(this[i].length > (arr ? w.length : w))
      w = arr ? this[i] : this[i].length;
  }
  return w;
};

function setup() {
  Object.keys(fonts[0]).forEach(a => { fonts[0][a] = fonts[0][a].split(" ") });
  createCanvas(windowWidth - 17, 2000);
  frameRate(100);
}

function draw() {
  background(255);
  noStroke();
  rectMode(CENTER);
  textAlign(CENTER, CENTER);
  
  fill(100);
  textFont("pixels", 200);
  text("FPS: " + this.frameRate().toFixed(1), width/2, height/5);
}