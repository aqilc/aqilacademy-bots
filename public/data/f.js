class Button {
  constructor(w, h, colors = [255, 0], options = { border: 2, px: 2 }) {
    let args = ["w", "h", "colors"];
    for(let i = 0; i < arguments.length; i ++) {
      this[args[i > args.length ? args.length : i]] = arguments[i];
    }
    
    this.pxart = [];
    for(let i = 0; i < w/options.px; i ++) {
      
    }
  }
  draw(txt, x, y) {
    
  }
  
}