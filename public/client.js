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

function setup() {
  Object.keys(fonts[0]).forEach(a => { fonts[0][a] = fonts[0][a].split(" ") });
  createCanvas(windowWidth - 20, 2000);
  frameRate(100);
}

function draw() {
  background(255);
  noStroke();
  rectMode(CENTER);
  fill(200);
  ellipse(mouseX, mouseY, 200, 200);
  
  fill(0, 1);
  for(let i = 0; i < 255; i += 2) {
    rect(width/2, height - i/2, width, i);
  }
  
  fill(0);
  strokeWeight(0.1);
  stroke(0);
  for(let h in fonts[0]) {
  for(let i = 0; i < fonts[0].a.length; i ++) {
    for(let j = 0; j < fonts[0].a[i].length; j ++) {
      if(fonts[0].a[i][j] === "1") {
        rect(100 + j*5, i*5, 5, 5);
      }
    }
  }
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
        [
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
        ],
        [],
        [],
        [],
        [],
        []
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
    d: "",
    D: "",
    e: "",
    E: "",
    f: "",
    F: "",
    g: "",
    G: "",
    h: "",
    H: "",
    i: "",
    I: "",
    j: "",
    J: "",
    k: "",
    K: "",
    l: "",
    L: "",
    m: "",
    M: "",
    n: "",
    N: "",
    o: "",
    O: "",
    p: "",
    P: "",
    q: "",
    Q: "",
    r: "",
    R: "",
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

    1: "",
    2: "",
    3: "",
    4: "",
    5: "",
    6: "",
    7: "",
    8: "",
    9: "",

    $: "",
    "^": "",
    "%": "",
    "&": "",
    "(": "",
    ")": "",
    "*": "",
    "#": "",
    "@": "",
    "!": "",
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