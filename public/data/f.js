class Button {
  constructor(w, h, colors = [255, 0]) {
    let args = ["w", "h", "colors"];
    for(let i = 0; i < arguments.length; i ++) {
      this[args[i > args.length ? args.length : i]] = arguments[i];
    }
    
    this.pxart = [];
  }
  draw(txt, x, y) {
    
  }
  
}