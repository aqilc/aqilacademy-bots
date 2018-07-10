const levels = [
  {
    points: 100,
    ul: [{
      cat: "exp",
      ignore: ["stats"],
    }]
  },
  {
    points: 3000,
    ul: [{
      cmd: "president",
    }]
  },
  {
    points: 1000,
    ul: [
      {
        cmd: "transfer",
      },
      {
        cmd: "infractions",
      }
    ]
  },
  {
    points: 500,
    ul: [{
      cat: "elections",
    }],
  },
  [
    250,
    800,
    1300,
    1700,
    2500,
    4000,
    5000,
    7500,
    10000,
    13000,
    16000,
    20000,
    25000,
    35000,
    50000,
    70000,
    100000,
    150000,
    225000,
    300000,
    375000,
    450000,
    500000,
    650000,
    800000,
    1000000,
    1250000,
    1550000,
    1700000,
    2000000,
    2400000,
    2900000,
    3500000,
    4200000,
    5000000,
    6000000,
    7300000,
    8500000,
    10000000,
    12000000,
    15000000,
    20000000,
    28000000,
    35000000,
    45000000,
    50000000,
  ],
];
levels[levels.length - 1].forEach((e) => {
  levels.push({ points: e });
});
levels.sort((a, b) => b.points - a.points);

console.log(levels);
// Exports the levels array specially prepared for it
module.exports = levels;