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
const font = {
  a: [],
  A: [],
  b: [],
  B: [],
  c: [],
  C: [],
  d: [],
  D: [],
  e: [],
  E: [],
  f: [],
  F: [],
  g: [],
  G: [],
  h: [],
  H: [],
  i: [],
  I: [],
  j: [],
  J: [],
  k: [],
  K: [],
  l: [],
  L: [],
  m: [],
  M: [],
  n: [],
  N: [],
  o: [],
  O: [],
  
};


module.exports = {
  p: players,
  pa: players.map(p => p.pa),
};