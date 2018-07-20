let players = [
  {
    name: "Joe",
    price: 10000,
    pa: [
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
    ]
  }
];

module.exports = {
  p: players,
  pa: players.map(p => p.pa),
};