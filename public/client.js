//let levels = require("/app/data/l.js");

// Makes unnecessary distractions go away XD
/* global
 * Imported Variables
 font,
 * Environment
  createCanvas, windowWidth, windowHeight, width, height, mouseX, mouseY, pmouseX, pmouseY, frameRate,
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
Array.prototype.width = function () {
  let w = 1;
  for(let i = 0; i < this.length; i ++) {
    if(this[i].length > w)
      w = this[i].length;
  }
  return w;
};

function Text(txt, x, y, s = 3, w = x - width, h, type = 1) {
  let font = fonts[type], tx = x, ty = y;
  for(let i = 0; i < txt.length; i ++) {
    i = txt[i];
    if(!font[i])
      continue;
    for(let j = 0; j < font[i].length; j ++) {
      for(let h = 0; h < font[i][j].length; h ++) {
        if(font[i][j][h] === "1")
          rect(tx + h * s, ty + i * s, s, s);
      }
    }
    tx += font[i].width * s + s;
  }
}
function setup() {
  Object.keys(fonts[0]).forEach(a => { fonts[0][a] = fonts[0][a].split(" ") });
  createCanvas(windowWidth - 20, 2000);
  frameRate(100);
}

function draw() {
  background(255);
  noStroke();
  rectMode(CENTER);
  fill(0);
  ellipse(pmouseX, pmouseY, 20, 20);
  
  fill(100);
  /*let x = 20;
  for(let h in fonts[0]) {
    for(let i = 0; i < fonts[0][h].length; i ++) {
      for(let j = 0; j < fonts[0][h][i].length; j ++) {
        if(fonts[0][h][i][j] === "1")
          rect(x + j*2, i*2 + 20, 2, 2);
      }
    }
    x += fonts[0][h].width() * 2 + 2;
  }*/
  Text(this.frameRate().toFixed(1), 100, 100, 10, );
  
  push();
  noFill();
  strokeWeight(3);
  for(let i = 0; i < 5; i ++) {
    stroke(255, ((5 - i)/5) * 255);
    rect(width/2, height/2, width - i, height - i, (i/5) * 5);
  }
  pop();
}