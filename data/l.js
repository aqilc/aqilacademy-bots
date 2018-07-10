let levels = [
  {
    points: 100,
    ul: {
      [
      cat: "exp",
      ignore: ["stats"],
      ]
    }
  },
];
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