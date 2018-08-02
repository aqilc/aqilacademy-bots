/* global
fonts, fill, blue, red, green, hue, color, saturation, brightness, stroke, noStroke, strokeWeight, noFill, background, rect, textSize, textAlign */

Array.prototype.width = function (arr) {
  let w = arr ? [] : 1;
  for(let i = 0; i < this.length; i ++) {
    if(this[i].length > (arr ? w.length : w))
      w = arr ? this[i] : this[i].length;
  }
  return w;
};
class Button {
  constructor(w, h, cols = [255, 0], opt = { border: 2, px: 2 }) {
    w = Math.round(w / opt.px) * opt.px;
    h = Math.round(h / opt.px) * opt.px;
    
    this.w = w;
    this.h = h;
    this.cols = cols;
    this.opt = opt;
    
    this.pxart = [[""]];
    this.pxart[h/opt.px - 1] = [""];
    
    // Makes the edge of the border
    for(let i = 1; i < w/opt.px - 1; i ++)
      this.pxart[0].push("1"), this.pxart[h/opt.px - 1].push("1");
    
    // Makes the border as thick as it should be
    if(opt.border > 1) {
      for(let i = 0; i < opt.border - 1; i ++) {
        this.pxart[i + 1] = [];
        this.pxart[h/opt.px - i - 2] = [];
        for(let j = 0; j < w/opt.px; j ++)
          this.pxart[i + 1].push("1"), this.pxart[h/opt.px - i - 2].push("1");
      }
    }
    
    // Makes the content of the button
    for(let i = opt.border; i < h/opt.px - opt.border; i ++) {
      this.pxart[i] = "1".repeat(opt.border).split("");
      for(let j = opt.border; j < w/opt.px - opt.border; j ++)
        this.pxart[i].push("2");
      "1".repeat(opt.border).split("").forEach(v => this.pxart[i].push(v));
    }
  }
  draw(txt, x, y) {
    for(let i = 0; i < this.pxart.length; i ++) {
      for(let j = 0; j < this.pxart[i].length; j ++) {
        if(this.pxart[i][j] === "1") {
          fill(this.cols[1]);
          rect(x + j * this.opt.px, y + i * this.opt.px, this.opt.px, this.opt.px);
        }
      }
    }
  }
}