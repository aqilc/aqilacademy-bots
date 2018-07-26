// Makes unnecessary distractions go away XD
/* global
 * Imported Variables
 fonts,
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
Array.prototype.width = function () {
  let w = 1;
  for(let i = 0; i < this.length; i ++) {
    if(this[i].length > w)
      w = this[i].length;
  }
  return w;
};
Array.prototype.widest = function () {
  let arr = [];
  for(let i 
}

function Text(txt, x, y, s = 3, w, h, type = 0) {
  if(typeof txt !== "string")
    txt = JSON.stringify(txt);
  
  let font = fonts[type], tx = x, ty = y;
  if(textAlign().horizontal === "center") {
    let tw = 0;
    txt.split("\n")
    tx -= tw/2;
  }
  for(let g = 0; g < txt.length; g ++) {
    let i = txt[g];
    if(i === "\n") {
      tx = x, ty += s * 7;
      continue;
    }
    if(!font[i])
      continue;
    for(let j = 0; j < font[i].length; j ++) {
      for(let h = 0; h < font[i][j].length; h ++) {
        if(font[i][j][h] === "1")
          rect(tx + h * s, ty + j * s, s, s);
      }
    }
    tx += font[i].width() * s + s;
  }
}

function setup() {
  Object.keys(fonts[0]).forEach(a => { fonts[0][a] = fonts[0][a].split(" ") });
  createCanvas(windowWidth - 35, 2000);
  frameRate(100);
}

function draw() {
  background(255);
  noStroke();
  rectMode(CENTER);
  textAlign(CENTER);
  
  fill(100);
  noStroke();
  Text("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890\nhi", 10, 100, 4);
}