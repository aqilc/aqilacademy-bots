class Button {
  constructor(w, h, cols = [color(255), color(0)], opt = { border: 2, px: 2 }) {
    w = Math.round(w / opt.px) * opt.px;
    h = Math.round(h / opt.px) * opt.px;
    
    this.w = w;
    this.h = h;
    this.cols = cols;
    this.opt = opt;
    
    this.pxart = [];
    for(let i = 0; i < h/opt.px; i ++) {
      this.pxart[i] = [];
      for(let j = 1; j < w/opt.px; j ++) {
        let arr = [];
        
      }
    }
  }
  draw(txt, x, y) {
    
  }
  
}