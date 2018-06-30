
// All requires and dependencies
const http = require('http');
const express = require('express');
const canvas = require("canvas");
const snekfetch = require("snekfetch");
const app = express();
const fs = require('fs');
const exists = fs.existsSync('./.data/sqlite.db');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./.data/sqlite.db');
const Discord = require("discord.js");
const data = require("./data.json");

// Prefix
const prefix = "c.";

//
const cmds = require("./commands.js").cmds;
const f = require("./commands.js").f;

// The client
var client = new Discord.Client();
client.login(process.env.TOKEN);

// All channels needed to run bot
const chnls = {
  announce: "382353531837087745",
  staff: "382530174677417984",
}

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

//Keeps app running
app.listen(process.env.PORT);
app.get("/", (request, response) => {
  response.sendStatus(200);
});
setInterval(() => {
  http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`);
}, 280000);

// if ./.data/sqlite.db does not exist, create it, and add tables
db.serialize(function() {
  let tables = [
    "users (id TEXT, points INTEGER, lastDaily INTEGER, messages INTEGER, realpoints INTEGER, created INTEGER, streak INTEGER)",
    "warns (num INTEGER PRIMARY KEY, warn TEXT, user, TEXT, mod TEXT, severity INTEGER, date INTEGER)",
    "items (num INTEGER PRIMARY KEY, id INTEGER, user TEXT)",
    "quests (num INTEGER PRIMARY KEY, do INTEGER, user TEXT)",
    "expstore (num INTEGER PRIMARY KEY, item TEXT, desc TEXT, stock INTEGER, price INTEGER, approved TEXT, bought TEXT, seller TEXT, buyer TEXT)",
    "elections (num INTEGER PRIMARY KEY, winner TEXT, end INTEGER, start INTEGER, vp TEXT, title TEXT)",
    "election (num INTEGER PRIMARY KEY, id TEXT, vId TEXT, votes INTEGER, msgId TEXT, up TEXT)",
    "voters (id TEXT, for TEXT, date INTEGER, election INTEGER)",
    "suggestions (num INTEGER PRIMARY KEY, suggestion TEXT, by TEXT, votes TEXT, created INTEGER)",
    "waiting (user TEXT, id INTEGER, start INTEGER, time INTEGER, for TEXT, data TEXT)",
    "blacklist (user TEXT, reason TEXT, by TEXT, date INTEGER, time INTEGER)",
    "contests (num INTEGER PRIMARY KEY, title TEXT, desc TEXT, start INTEGER, end INTEGER, prize TEXT, channel TEXT)",
    "cvotes (for TEXT, votes INTEGER, contest INTEGER, end INTEGER)",
  ];
  for(var i of tables) {
    db.run("CREATE TABLE IF NOT EXISTS " + i);
    //console.log(i + " has been created if it didn't exist before");
  }
});

// Events
client.on("message", async msg => {
  try {
    //What happens when DMed
    if(msg.channel.type !== "text") {
      f.log("main", `**${msg.author.tag}**(ID: ${msg.author.id}) said:\`\`\`${msg.content}\`\`\``);
      db.get("SELECT * FROM elections ORDER BY end DESC", (err, res) => {
        db.all("SELECT * FROM election", (err, rows) => {
          db.get(`SELECT * FROM users WHERE id = "${msg.author.id}"`, (err, user) => {
            if(res.end < new Date().valueOf())
              return;
            
            // Functions for waiting IDs
            let ids = [
              (id, d) => {
                if(msg.content === "yes") {
                  client.channels.get(data.echnl).send(new Discord.RichEmbed().setAuthor(client.users.get(id).tag + " is running for president!", client.users.get(id).avatarURL).setDescription(`with <@${msg.author.id}> as his/her Vice President!`).addField("Slogan", d.split("|=|")[0]).addField("Description of term", d.split("|=|")[1]).setColor(f.color())).then(message => {
                    message.react("👍");
                    db.run(`INSERT INTO election (id, vId, votes, msgId) VALUES ("${id}", "${msg.author.id}", 0, "${message.id}")`);
                  });
                  db.run(`DELETE FROM waiting WHERE for = "${id}"`);
                  msg.channel.send(`Thanks! You and <@${id}> have been entered into the election!`);
                  client.users.get(id).send(`<@${msg.author.id}> has approved your request to be your Vice President! You both have been put into the Election.`);
                  msg.guild.members.get(id).addRole(msg.guild.roles.find("name", "Candidate").id, "Elections")
                  msg.member.addRole(msg.guild.roles.find("name", "Candidate").id, "Elections")
                } else if (msg.content === "no") {
                  db.run(`DELETE FROM waiting WHERE id = "${msg.author.id}"`);
                  msg.channel.send(`Thanks! <@${id}> has been informed about your rejection immediately.`);
                  client.users.get(id).send(`<@${msg.author.id}> has rejected your request to be your Vice President.`);
                }
              },
            ];

            db.all("SELECT * FROM waiting", (err, rows) => {
              for(let i of rows) {
                ids[i.id](i.for, i.data);
              }
            });
          })
        });
      });
    }
    
    // Does commands
    if(msg.content.startsWith(prefix) && !msg.author.bot) {
      if(!f.check_and_do_cmd(msg) && data.whitelist.includes(msg.channel.id))
        f.add_message(msg.author.id);
      return;
    }
    
    // Adds exp
    if(data.whitelist.includes(msg.channel.id) && !msg.author.bot)
      f.add_message(msg.author.id);
    
    // Tells prefix if mentioned
    if(msg.content.trim() === `<@!${client.user.id}>`)
      return msg.channel.send(`My prefix is: \`${prefix}\``);
  } catch(err) {
    // What happens when an error occurs
    msg.channel.send(new Discord.RichEmbed().setAuthor("Error", client.user.avatarURL).setColor(f.color()).setDescription(`**error on client event "message":**\`\`\`js\n${err}\`\`\``).setTimestamp());
    console.log("Error on the \"message\" event: " + err);
  }
});
client.on("ready", () => {
  console.log(client.user.tag + " has started. Ready for action");
  f.checkelections()//.checksql();
});
client.on("guildMemberRemove", member => {
  db.all(`SELECT * FROM election WHERE id = "${member.user.id}", vId = "${member.user.id}"`, (err, res) => {
    if(!res)
      return;
    for(let i of res) {
      db.run(`DELETE FROM election WHERE id = "${i.id}"`);
      db.run(`DELETE FROM waiting WHERE id = "${i.id}" OR for = "${i.id}"`);
      if(member.user.id === i.id) {
        member.user.send("You and your Vice President have been disqualified from the election");
        if(client.users.get(i.vId))
          client.users.get(i.vId).send("Your President left AqilAcademy so you both have been disqualified from the election.");
      } else if(member.user.id === i.vId) {
        member.user.send("You and your President have been disqualified from the AqilAcademy Election.");
        if(client.users.get(i.vId))
          client.users.get(i.vId).send("Your Vice President left AqilAcademy so you both have been disqualified from the election.");
      }
      client.channels.get(data.echnl).fetchMessage(i.msgId).then(message => {
        message.delete();
      }).catch(console.log);
    }
  })
  db.run(`DELETE * FROM users WHERE id = "${member.user.id}"`);
});

// Exports
module.exports = {
  prefix: prefix,
  Discord: Discord,
  client: client,
}