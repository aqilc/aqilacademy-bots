let l = {
  1: 0,
  2: 100,
  3: 250,
  4: 500,
  5: 800,
  6: 1000,
  7: 1300,
  8: 1700,
  9: 2500,
  10: 3000,
  11: 4000,
  12: 5000,
  13: 7500,
  14: 10000,
  15: 13000,
  16: 16000,
  17: 20000,
  18: 25000,
  19: 35000,
  20: 50000,
  21: 70000,
  22: 100000,
  23: 150000,
  24: 225000,
  25: 300000,
  26: 375000,
  27: 450000,
  28: 500000,
  29: 650000,
  30: 800000,
  31: 1000000,
  32: 1250000,
  33: 1550000,
  34: 1700000,
  35: 2000000,
  36: 2400000,
  37: 2900000,
  38: 3500000,
  39: 4200000,
  40: 5000000,
  41: 6000000,
  42: 7300000,
  43: 8500000,
  44: 10000000,
  42: 12000000,
  43: 15000000,
  44: 20000000,
  45: 28000000,
  46: 35000000,
  47: 45000000,
  48: 50000000,
};
Object.defineProperty(l, "levels", {
  enumerable: false,
  value(points) {
    let l = Object.values(this);
    return l.indexOf(l.filter(l => l >= points)[0])
  }
});
module.exports = l;