/* global
fill, blue, red, green, hue, color, saturation, brightness, stroke, noStroke, strokeWeight, noFill, background, */

class Button {
  constructor(w, h, cols = [255, 0], opt = { border: 2, px: 2 }) {
    w = Math.round(w / opt.px) * opt.px;
    h = Math.round(h / opt.px) * opt.px;
    cols.forEach(c => {
      if(!blue(c))
        color(c);
    });
    
    this.w = w;
    this.h = h;
    this.cols = cols;
    this.opt = opt;
    
    this.pxart = [];
    for(let i = 1; i < w/opt.px - 1; i ++) {
      this.pxart[0].push("1");
      this.pxart[h/opt.px].push("1");
    }
    if(opt.border > 1) {
      
    }
    for(let i = opt.border; i < h/opt.px - opt.border; i ++) {
      this.pxart[i] = ["1"];
      for(let j = opt.border; j < w/opt.px - opt.border; j ++) {
        this.pxart[i].push("2")
      }
      this.pxart[i].push("1");
    }
    
  }
  draw(txt, x, y) {
    
  }
  
}