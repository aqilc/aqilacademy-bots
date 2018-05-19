# Clyde 3
-----------------------------------------------------------
Makes [AqilAcademy][aa] work perfectly. Still in production

### Links to other Clydes
- [Clyde 1.0][c]
- [Clyde 2.0][c2]

### Command constructor
```
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

### Emergency Vote Check System
```
setInterval(async () => {
  let messages = await client.channels.get(data.echnl).fetchMessages({ limit: 100 });
  db.get("SELECT * FROM elections ORDER BY end DESC", (err, election) => {
    if(!election || election.end < new Date().valueOf())
      return;
    db.all("SELECT * FROM election", (err, res) => {
      if(!res)
        return;
      for(let i of messages.array()) {
        if(res.map(r => r.msgId).includes(i.id)) {
          if(!i.reactions.array().filter(r => r.emoji.name === "👍")[0])
            return;
          db.run(`UPDATE election SET votes = ${i.reactions.array().filter(r => r.emoji.name === "👍")[0].count - 1} WHERE msgId = "${i.id}"`);
        }
      }
    });
  });
}, 1000)
```

[c]: https://github.com/ShadowKA/AqilAcademy-bot "Clyde Repository"
[c2]: https://glitch.com/edit/#!/clyde-backup "Clyde 2.0"
[aa]: https://discord.gg/285cj7j "AqilAcademy"