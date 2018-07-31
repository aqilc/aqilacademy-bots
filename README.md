# Clyde 3
-----------------------------------------------------------
Makes [AqilAcademy][aa] work perfectly. Still in production!

### Links to other Clydes
- [Clyde 1.0][c]
- [Clyde 2.0][c2]

## Random Code
A bunch of random code that might come in handy!

### Command constructor
```js
: {
    a: [],
    cd: 0,
    desc: "",
    usage: "",
    cat: "",
    perms: "",
    hidden: false,
    del: false,
    do(msg, content) {},
  },
```
### Tag Constructor
```js
: {
          a: [],
          u: "",
          i: "",
          f() {},
        }
```
### Font 1
```js
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
    R: " 111 1..1 1..1 111 1..1",
    s: "  .111 11 ..11 111",
    S: " .111 1 .11 ...1 111",
    t: " .1 111 .1 .1 .11",
    T: " 111 .1 .1 .1 .1",
    u: "  1..1 1..1 1..1 .111",
    U: " 1..1 1..1 1..1 1..1 .11",
    v: "  1..1 1..1 1.1 .1",
    V: " 1..1 1..1 1.1 1.1 .1",
    w: "  1...1 1.1.1 1.1.1 .1.1",
    W: " 1...1 1...1 1.1.1 1.1.1 .1.1",
    x: "  1.1 .1 .1 1.1",
    X: " 1..1 1..1 .11 1..1 1..1",
    y: "  1..1 1..1 .111 ...1 111",
    Y: " 1..1 1..1 .111 ...1 .11",
    z: "  1111 ..1 .1 1111",
    Z: " 111 ..1 .1 1 111",
    
    " ": "..",
    
    0: " -11 1--1 1--1 1--1 -11",
    1: " -1 11 -1 -1 -1",
    2: " -11 1--1 --1 -1 1111",
    3: " 111 ---1 -111 ---1 111",
    4: " --1 -11 1-1 1111 --1",
    5: " 1111 1 111 ---1 111",
    6: " -11 1 111 1--1 -11",
    7: " 1111 ---1 --1 -1 -1",
    8: " -11 1--1 -11 1--1 -11",
    9: " -11 1--1 -111 ---1 -11",

    $: " .1 .111 11 ..11 111 ..1",
    '"': "1.1 1.1",
    "'": "1 1",
    "^": " .1 1.1",
    "%": " 1.1 ..1 .1 1 1.1",
    "&": " .11 1 .11.1 1..1 .11.1",
    "(": ".1 1 1 1 1 1 .1",
    ")": "1 .1 .1 .1 .1 .1 1",
    "*": "1.1 .1 1.1",
    "#": " ..1.1 .1.1 11111 .1.1 1.1",
    "@": "..1111 .1....1 1..11.1 1.1.1.1 1..111 .1 ..1111",
    "!": " 1 1 1  1",
    "-": "   111",
    "_": "      1111",
    "=": "  1111  1111",
    "+": "  .1 111 .1",
    "`": " 1 .1",
    "~": "  .1..1 1.1.1 1..1",
    "[": " 11 1 1 1 1 11",
    "]": " 11 .1 .1 .1 .1 11",
    "{": ".11 .1 .1 1 .1 .1 .11",
    "}": "11 .1 .1 ..1 .1 .1 11",
    ":": "   1  1",
    ";": "   .1  .1 1",
    ",": "     .1 1",
    ".": "     1",
    "<": "  .1 1 .1",
    ">": "  1 .1 1",
    "?": " 111 ...1 .11  .1",
    "/": " ..1 ..1 .1 1 1",
    "\\": " 1 1 .1 ..1 ..1",
    "|": " 1 1 1 1 1",
  },
```
### Translation stuff
```js
// Translates stuff
const trans = {
  1: "one",
  2: "two",
  3: "three",
  4: "four",
  5: "five",
  6: "six",
  7: "seven",
  8: "eight",
  9: "nine",
  0: "zero",
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  
  no: false,
  yes: true,
  false: "no",
  true: "yes",
  undefined: "no",
};
```

### Emergency Voting System
```js
setInterval(async () => {
  db.all("SELECT * FROM election", async (err, cands) => {
    if(!cands) 
      return;

    let cids = cands.map(c => c.id).concat(cands.map(c => c.vId));
    console.log(cids);
    for(let i of cands) {
      let mess = await client.channels.get(data.echnl).fetchMessage(i.msgId);
      if(!mess.reactions.array().filter(r => r.emoji.name === "👍")[0])
        return;
      for(let h of mess.reactions.array().filter(r => r.emoji.name === "👍")[0].users.array()) {
        if(cids.includes(h.id)) {
          let sent = await h.send(`Your vote for <@${i.id === h.id ? i.id : (i.vId === h.id ? i.id : "noone")}> has been removed because you cannot vote for yourself or your VP`).catch(console.log);
          return mess.reactions.array().filter(r => r.emoji.name === "👍")[0].remove(h);
        }
      }
      db.run(`UPDATE election SET votes = ${mess.reactions.array().filter(r => r.emoji.name === "👍")[0].count - 1} WHERE msgId = "${i.msgId}"`);
      db.all("SELECT * FROM voters", (err, voters) => {
        for(let h of mess.reactions.array().filter(r => r.emoji.name === "👍")[0].users.array()) {
          for(let j of voters) {
            if(j.id === h.id && j.for === i.id)
              return;
            //db.run(`INSERT INTO voters (id, for, election, date) VALUES ("${h.id}", "${i.id}", ${elec.num}, ${new Date().valueOf()})`);
          }
        }
      });
    }
  });
}, 60000);
```

[c]: https://github.com/ShadowKA/AqilAcademy-bot "Clyde Repository"
[c2]: https://glitch.com/edit/#!/clyde-backup "Clyde 2.0"
[aa]: https://discord.gg/285cj7j "AqilAcademy"