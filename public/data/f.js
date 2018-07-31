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

function Text(txt, x, y, s = 6, w, h, type = 0) {
  if(typeof txt !== "string")
    txt = JSON.stringify(txt);
  
  let font = fonts[type || 0], tx = x, ty = y;
  if(textAlign().horizontal === "center") {
    let tw = (txt.split("").length - 1) * s;
    txt.split("\n").width(true).split("").forEach(c => {
      if(!font[c])
        return;
      tw += font[c].width() * s;
    });
    tx -= tw/2;
  }
  if(textAlign().vertical === "center")
    ty -= txt.split("\n").length * s * 3.5;
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
          rect(tx + h * s - h, ty + j * s, s, s);
      }
    }
    tx += font[i].width() * s + s;
  }
}