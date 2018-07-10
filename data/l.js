const levels = [
  {
    points: 100,
    ul: [
      {
        cat: "exp",
        ignore: ["stats"],
      }
    ]
  },
  [
    250,
    500,
    800,
    1000,
    1300,
    1700,
    2500,
    3000,
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
  ],
];

console.log(levels[levels.length - 1].length + 1);
const needexp = [
  {
    cat: "exp",
    desc: {
      simple: "",
      detailed: "Unlocks all EXP commands except `c.stats`(which you can already use) and `c.transfer`(which requires more EXP)!"
    },
    points: 100,
    ignore: ["stats"],
    warn: `You need **100 EXP** to use any commands in the **exp** category excluding \`stats\``,
  },
  {
    cmd: "president",
    desc: "Lets you run in the AqilAcademy elections!",
    points: 3000,
    warn: "You need **3000 EXP** to use the **run** command!",
  },
  {
    cat: "elections",
    desc: "Unlocks all election commands(Except `c.president`)!",
    points: 500,
    warn: "You need **500 EXP** to use any commands in the **election** category",
  },
  {
    cmd: "transfer",
    desc: "Lets you transfer EXP to other users!",
    points: 1000,
    warn: "You need **1000 EXP** to use this command!",
  },
  {
    cmd: "infractions",
    desc: "Lets you view your infractions(if you have any).",
    points: 1500,
    warn: "You need **1000 EXP** to use the `c.infractions` command!",
  }
];
exports = levels;