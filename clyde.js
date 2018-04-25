
//All requires and dependencies
const express = require('express');
const app = express();
const fs = require('fs');
const exists = fs.existsSync('./.data/sqlite.db');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./.data/sqlite.db');
const Discord = require("discord.js");
const data = require("./data.json");

//Prefix
const prefix = "c.";

//The client
var client = new Discord.Client({ autoreconnect: true });
client.login(process.env.TOKEN);

//All channels needed to run bot
const chnls = {
  a: "382353531837087745",
}

//Keeps app running
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});
app.listen(process.env.PORT);

// if ./.data/sqlite.db does not exist, create it, otherwise print records to console
db.serialize(function(){
  let tables = [
    "users (id TEXT, points INTEGER, lastDaily INTEGER, messages INTEGER, realpoints INTEGER)",
    "warns (num INTEGER PRIMARY KEY, warn TEXT, mod TEXT, date INTEGER)", "items (name TEXT, price TEXT, user TEXT)",
    "expstore (num INTEGER PRIMARY KEY, item TEXT, desc TEXT, stock INTEGER, price INTEGER, approved TEXT, bought TEXT, seller TEXT, buyer TEXT)",
    "elections (num INTEGER PRIMARY KEY, winner TEXT, end INTEGER, start INTEGER, vp TEXT)",
    "election (num INTEGER PRIMARY KEY, id TEXT, vId TEXT, votes INTEGER, msgId TEXT)",
    "voters (id TEXT, for TEXT, date INTEGER, election INTEGER)"
  ];
  for(var i of tables) {
    db.run("CREATE TABLE IF NOT EXISTS " + i);
    console.log(i + " has been created");
  }
});

var f = {
  checkelections: () => {
    db.all("SELECT * FROM elections ORDER BY end", (err, res) => {
      if(res.length === 0)
        return;
      res.reverse();
      let elec = res;
      if(elec[0].end > new Date().valueOf()) {
        setTimeout(() => {
          db.run("SELECT * FROM election ORDER BY votes", (err, res) => {
            let winner = "";
            let sqlwin = "";
            for(var i = 0; i < res.length; i ++) {
              if(res[i].votes === res[0].votes) {
                winner += `${i + 1}. ${client.users.get(res[i].id).tag}\n   Vice: ${client.users.get(res[i].vId).tag}`;
                sqlwin += `${res[i].id} ${res[i].vId}  `;
              }
            }
            db.run(`UPDATE elections SET winners = ${sqlwin} WHERE num = ${elec.num}`);
            client.guilds.get("294115797326888961").channels.get(chnls.a).send(`**:yes: The election has officially ended. Winner(s):**\`\`\`\n${winner}\`\`\``);
          })
        }, elec[0].end - new Date().valueOf());
      }
    });
    return f;
  },
  checksql: () => {
    let print = "";
    db.all("SELECT * FROM users", (err, res) => { print += "Users: " + res; });
    db.all("SELECT * FROM warns", (err, res) => { print += "\nWarns: " + res; });
    db.all("SELECT * FROM items", (err, res) => { print += "\nItems: " + res; });
    db.all("SELECT * FROM expstore", (err, res) => { print += "\nEXP Store: " + res; });
    db.all("SELECT * FROM elections", (err, res) => { print += "\nElections: " + res; });
    db.all("SELECT * FROM election", (err, res) => { print += "\nCurrent Election: " + res; });
    db.all("SELECT * FROM voters", (err, res) => { print += "\nVoters: " + res; });
    setTimeout(() => {
      console.log(print);
    }, 1000);
    return f;
  },
  check_and_do_cmd: (message, content) => {
    var perms = {
      mod: (message) => {
        if(!message.member.permissions.has(["MANAGE_MESSAGES", "MANAGE_ROLES"], true) || !message.member.roles.map(r => r.name).includes("Moderator"))
          return message.react("You need the `Moderator` role to use this command");
      },
      admin: (message) => {
        if(!message.member.permissions.has(["MANAGE_MESSAGES", "MANAGE_ROLES", "MANAGE_SERVER", "BAN_MEMBERS", "KICK_MEMBERS"], true) || !message.member.roles.map(r => r.name).includes("Administrator"))
          return message.react("You need the `Administartor` role to use this command");
      },
      admin_perm: (message) => {
        if(!message.member.permissions.has(["ADMINISTRATOR"], true) || !message.member.roles.map(r => r.name).includes("Moderator"))
          return message.react("You need the `ADMINISTRATOR` permission to use this command");
      },
      ba: (message) => {
        if(!data.devs.includes(message.author.id))
          return message.react("You need to ba a Bot Administrator to use this command.");
      },
    };
    for (var i in cmds) {
      if(cmds[i].perms !== "")
        perms[cmds[i].perms](message);
      if(message.content.slice(prefix.length).split(" ")[0] === i) {
        cmds[i].do(message, message.content.slice(prefix.length).split(" ").slice(1));
      }
    }
    return f;
  }
};

client.on("message", (msg) => {
  if(msg.content.startsWith(prefix)) {
    
  }
});
client.on("ready", () => {
  console.log(client.user.tag + " has started. Ready for action");
  f.checkelections().checksql();
});

const cmds = {
  help: {
    a: ["commands"],
    desc: "Shows you all of Clyde's commands",
    usage: " [command name or category name]",
    cat: "utility",
    perms: "mod",
    del: false,
    do: (msg, content) => {},
  }
};