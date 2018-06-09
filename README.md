# Clyde 3
-----------------------------------------------------------
Makes [AqilAcademy][aa] work perfectly. Still in production!

### Links to other Clydes
- [Clyde 1.0][c]
- [Clyde 2.0][c2]

## Random Code
A bunch of random code that might come in handy!

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

### Previous voting system
```
// Election voting systems
client.on("messageReactionAdd", (reaction, user) => {
  console.log(user.tag + " added " + reaction.emoji.name);
  if(reaction.emoji.name !== "👍")
    return;
  if(reaction.message.channel.id !== data.echnl)
    return;
  db.get("SELECT * FROM elections ORDER BY end DESC", (err, row) => {
    if(!row)
      return;
    
    if(row.end < new Date().valueOf())
      return;
    
    db.get(`SELECT * FROM election WHERE msgId = "${reaction.message.id}"`, (err, res) => {
      if(!res)
        return;
      if(user.id === res.id || user.id === res.vId)
        user.send("You can only vote for someone other than you or your vice president!").catch(console.log) && reaction.remove(user);
      
      db.get(`SELECT * FROM users WHERE id = "${user.id}"`, (err, ur) => {
        if(err)
          return console.log(err);
        if(!ur || (ur.realpoints > ur.points && ur.realpoints < 1000) || ur.points < 1000)
          user.send("You need **1000 EXP** to vote in the AqilAcademy Elections!").catch(console.log) && reaction.remove(user);
        db.get(`SELECT * FROM voters WHERE id = "${user.id}"`, (err, voter) => {
          if(err)
            return console.log(err);
          if(voter)
            user.send("You have already voted!").catch(console.log) && reaction.remove(user);
          db.run(`INSERT INTO voters (id, for, date, election) VALUES (?, ?, ?, ?)`, [ user.id, res.id, new Date().valueOf(), row.num ]);
          db.run(`UPDATE election SET votes = ${reaction.count - 1} WHERE id = "${res.id}"`);
          user.send(`Your vote for <@${reaction.message.author.id}> has been recorded!`);
        });
      });
    });
  });
});
client.on("messageReactionRemove", (reaction, user) => {
  console.log(user.tag + " removed " + reaction.emoji.name);
  if(reaction.emoji.name !== "👍")
    return;
  if(reaction.message.channel.id !== data.echnl)
    return;
  db.get("SELECT * FROM elections ORDER BY end DESC", (err, row) => {
    if(!row)
      return;
    
    if(row.end < new Date().valueOf())
      return;
    
    db.get(`SELECT * FROM election WHERE msgId = "${reaction.message.id}"`, (err, res) => {
      if(!res)
        return user.send(`No one running under this message`);
      user.send(`Successfully removed your vote for <@${res.id}>`);
      
      db.run(`DELETE FROM voters WHERE id = "${user.id}"`);
      db.run(`UPDATE election SET votes = ${reaction.count - 1} WHERE id = "${res.id}"`);
    });
  });
});
```

[c]: https://github.com/ShadowKA/AqilAcademy-bot "Clyde Repository"
[c2]: https://glitch.com/edit/#!/clyde-backup "Clyde 2.0"
[aa]: https://discord.gg/285cj7j "AqilAcademy"