// Makes unnecessary distractions go away XD
/* global
 * Imported Variables
 font,
 * Environment
  createCanvas, windowWidth, windowHeight, width, height, mouseX, mouseY, frameRate,
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
  ellipse(mouseX, mouseY, 20, 20);
  
  fill(0, 1);
  for(let i = 0; i < 255; i += 2) {
    rect(width/2, height - i/2, width, i);
  }
  
  fill(200);
  let x = 0;
  for(let h in fonts[0]) {
    for(let i = 0; i < fonts[0][h].length; i ++) {
      for(let j = 0; j < fonts[0][h][i].length; j ++) {
        if(fonts[0][h][i][j] === "1")
          rect(x + j*2, i*2 + 20, 2, 2);
      }
    }
    x += fonts[0][h].width() * 2 + 2;
  }
  
  push();
  noFill();
  strokeWeight(3);
  for(let i = 0; i < 10; i ++) {
    stroke(255, ((10 - i)/10) * 255);
    rect(width/2, height/2, width - i, height - i, (i/10) * 5);
  }
  pop();
}

let players = [
  {
    name: "Joe",
    price: 10000,
    pa: {
      standing: [
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      running: [
        [],
        
      ],
    }
  }
];
const fonts = [
  {    
    a: "  .111 1..1 1..1 .111",
    A: " .11. 1..1 1111 1..1 1..1",
    b: " 1 111 1..1 1..1 111",
    B: " 111 1..1 111 1..1 111",
    c: "  .11 1 1 .11",
    C: " .11 1 1 1 .11",
    d: " ...1 .111 1..1 1..1 .111",
    D: " 111 1..1 1..1 1..1 111",
    e: "  .11 1.11 11 .11",
    E: " 111 1 11 1 111",
    f: " .11 .1 111 .1 .1",
    F: " 111 1 111 1 1",
    g: "  .111 1..1 1..1 .111 ...1 .11",
    G: " .111 1 1.11 1..1 .111",
    h: " 1 1 111 1..1 1..1",
    H: " 1..1 1..1 1111 1..1 1..1",
    i: " 1  1 1 1 ",
    I: " 111 .1 .1 .1 111",
    j: " .1  .1 .1 .1 1",
    J: " .111 ...1 ...1 1..1 .11",
    k: " 1 1..1 1.1 111 1..1",
    K: " 1..1 1.1 11 1.1 1..1",
    l: " 1 1 1 1 1",
    L: " 1 1 1 1 111",
    m: "  1111 1.1.1 1.1.1 1.1.1",
    M: " 1...1 11.11 1.1.1 1.1.1 1.1.1",
    n: "  111 1..1 1..1 1..1",
    N: " 1..1 11.1 1.11 1..1 1..1",
    o: "  .11 1..1 1..1 .11",
    O: " .11 1..1 1..1 1..1 .11",
    p: "  111 1..1 1..1 111 1 1",
    P: " 111 1..1 111 1 1",
    q: "  .111 1..1 1..1 .111 ...1 ...1",
    Q: " .11 1..1 1..1 1..1 .11 ...1",
    r: "  1.1 11 1 1",
    R: " 111 1..1 1..1",
    s: "",
    S: "",
    t: "",
    T: "",
    u: "",
    U: "",
    v: "",
    V: "",
    w: "",
    W: "",
    x: "",
    X: "",
    y: "",
    Y: "",
    z: "",
    Z: "",
    
    " ": "..",

    "1": " .1 11 .1 .1 .1",
    "2": "",
    "3": "",
    "4": "",
    "5": "",
    "6": "",
    "7": "",
    "8": "",
    "9": "",

    $: "",
    "^": "",
    "%": "",
    "&": "",
    "(": "",
    ")": "",
    "*": "",
    "#": "",
    "@": "",
    "!": " 1 1 1  1",
    "-": "",
    "_": "",
    "=": "",
    "+": "",
    "`": "",
    "~": "",
    "[": "",
    "]": "",
    "{": "",
    "}": "",
    ":": "",
    ";": "",
    ",": "",
    ".": "",
    "<": "",
    ">": "",
    "?": "",
    "/": "",
    "\\": "",
    "|": "",
  }
];