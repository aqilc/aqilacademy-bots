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
    desc: "",
    usage: "",
    cat: "",
    perms: "",
    hidden: false,
    del: false,
    do: (msg, content) => {},
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