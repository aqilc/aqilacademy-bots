const { font: font } = require("/app/data/wpa.js");

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

function Text() {
  
}
function setup() {
  createCanvas(windowWidth - 20, 2000);
  frameRate(1000);
}

function draw() {
  background(255);
  noStroke();
  rectMode(CENTER);
  fill(200);
  ellipse(mouseX, mouseY, 200, 200);
  
  fill(0, 1);
  for(let i = 0; i < 255; i += 2)
    rect(width/2, height - i/2, width, i);
  
  fill(0);
  noStroke();
  for(let i = 0; i < font.a.length; i ++) {
    for(let j = 0; j < font.a[i].length; j ++) {
      if(font.a[i][j] === "1") {
        rect(100 + j*5, 100 + i*5, 5, 5);
      }
    }
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