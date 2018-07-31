class Button {
  constructor(w, h, cols = [255, 0], opt = { border: 2, px: 2 }) {
    w = Math.round(w / opt.px) * opt.px;
    h = Math.round(h / opt.px) * opt.px;
    let args = ["w", "h", "cols", "opt"];
    for(let i = 0; i < arguments.length; i ++) {
      this[args[i > args.length ? args.length : i]] = arguments[i];
    }
    
    this.pxart = [];
    for(let i = 0; i < w/opt.px; i ++) {
      for(let j = 1; j < h/opt.px; j ++) {
        
      }
    }
  }
  draw(txt, x, y) {
    
  }
  
}