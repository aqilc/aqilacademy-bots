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

function round(arr, i, j, rad) {
  let r = [0, 0, 0, 0, 0, 0, 0, 0],
      rd = [0, 0, 0, 0];
  
  if(["2", "3"].includes(levels[you.level - 1][i][j])) {
					sides[0] = levels[you.level - 1][i][j - 1] == 1;
					sides[2] = levels[you.level - 1][i - 1] && levels[you.level - 1][i - 1][j] == 1;
					sides[4] = levels[you.level - 1][i][j + 1] == 1;
					sides[6] = levels[you.level - 1][i + 1] && levels[you.level - 1][i + 1][j] == 1;
					if(levels[you.level - 1][i - 1]) {
						sides[1] = levels[you.level - 1][i - 1][j - 1] == 1;// top-left
						sides[3] = levels[you.level - 1][i - 1][j + 1] == 1;// top-right
					}
					if(levels[you.level - 1][i + 1]) {
						sides[7] = levels[you.level - 1][i + 1][j - 1] === 1;// bottom-left
						sides[5] = levels[you.level - 1][i + 1][j + 1] === 1;// bottom-right
					}
				}
				if(sides[0] && sides[1] && sides[2])
					r[0] = 3;
				if(sides[2] && sides[3] && sides[4])
					r[1] = 3;
				if(sides[4] && sides[5] && sides[6])
					r[2] = 3;
				if(sides[6] && sides[7] && sides[0])
					r[3] = 3;
}
function Text(txt, x, y, s = 30, w, h, type = 0) {
  let font = fonts[type], tx = x, ty = y;
  for(let g = 0; g < txt.length; g ++) {
    let i = txt[g];
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
  let x = 20;
  for(let h in fonts[0]) {
    for(let i = 0; i < fonts[0][h].length; i ++) {
      for(let j = 0; j < fonts[0][h][i].length; j ++) {
        if(fonts[0][h][i][j] === "1")
          rect(x + j*2, i*2 + 20, 2, 2);
      }
    }
    x += fonts[0][h].width() * 2 + 2;
  }
  Text("Hi!", 100, 100);
  
  push();
  noFill();
  strokeWeight(3);
  for(let i = 0; i < 5; i ++) {
    stroke(255, ((5 - i)/5) * 255);
    rect(width/2, height/2, width - i, height - i, (i/5) * 5);
  }
  pop();
}