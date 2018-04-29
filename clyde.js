
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
  announce: "382353531837087745",
  staff: "382530174677417984",
}

//Keeps app running
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});
app.listen(process.env.PORT);

// if ./.data/sqlite.db does not exist, create it, otherwise print records to console
db.serialize(function() {
  let tables = [
    "users (id TEXT, points INTEGER, lastDaily INTEGER, messages INTEGER, realpoints INTEGER, created INTEGER)",
    "warns (num INTEGER PRIMARY KEY, warn TEXT, mod TEXT, date INTEGER)", "items (name TEXT, price TEXT, user TEXT)",
    "expstore (num INTEGER PRIMARY KEY, item TEXT, desc TEXT, stock INTEGER, price INTEGER, approved TEXT, bought TEXT, seller TEXT, buyer TEXT)",
    "elections (num INTEGER PRIMARY KEY, winner TEXT, end INTEGER, start INTEGER, vp TEXT)",
    "election (num INTEGER PRIMARY KEY, id TEXT, vId TEXT, votes INTEGER, msgId TEXT)",
    "voters (id TEXT, for TEXT, date INTEGER, election INTEGER)"
  ];
  for(var i of tables) {
    db.run("CREATE TABLE IF NOT EXISTS " + i);
    //console.log(i + " has been created if it didn't exist before");
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
            client.guilds.get("294115797326888961").channels.get(chnls.announce).send(`**:yes: The election has officially ended. Winner(s):**\`\`\`\n${winner}\`\`\``);
          })
        }, elec[0].end - new Date().valueOf());
      }
    });
    return f;
  },// Check if elections are going on and sets up a setTimeout if they are.
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
  },// Checks and console.logs all sql
  check_and_do_cmd: (message) => {
    let cmdDone = false;
    var perms = {
      undefined: [false, () => {}],
      "": [false, () => {}],
      mod: [!message.member.permissions.has(["MANAGE_MESSAGES", "MANAGE_ROLES"], true) || !f.has_roles(message.member, "Moderator"), () => {
        message.reply("You need the `Moderator` role to use this command!");
      }],
      admin: [!message.member.permissions.has(["MANAGE_MESSAGES", "MANAGE_ROLES", "MANAGE_GUILD", "BAN_MEMBERS", "KICK_MEMBERS"], true) || !f.has_roles(message.member, "Administrator"), () => {
        message.reply("You need the `Administrator` role to use this command!");
      }],
      admin_perm: [!message.member.permissions.has(["ADMINISTRATOR"], true), () => {
        message.reply("You need the `ADMINISTRATOR` permission to use this command!");
      }],
      ba: [!data.devs.includes(message.author.id), () => {
        message.reply("You need to be a Clyde Admin to use this command!");
      }],
    };
    for (var i in cmds) {
      if(perms[cmds[i].perms][0])
        return perms[cmds[i].perms][1]();
      if(message.content.endsWith("-d"))
        message.delete() && message.content.slice(0, -2);
      if((cmds[i].a && cmds[i].a.includes(message.content.slice(prefix.length).split(" ")[0])) || message.content.slice(prefix.length).split(" ")[0] === i) {
        cmdDone = true;
        if(cmds[i].del === true)
          message.delete();
        cmds[i].do(message, message.content.includes(" ") ? message.content.slice(message.content.indexOf(" ")).trim() : "");
      }
    }
    return cmdDone;
  },// Does a command
  evalclean: (string) => {
    if (typeof(string) === "string")
      return string.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
    else
      return string;
  },// Cleans "evalled"
  color: () => {
    return Math.round(Math.random() * 16777215);
  },// Random color
  page_maker: (array, num = 10, page = 0, func) => {
    array.slice(page*num, page*num + num);
    if(func && typeof func === "function") {
      for(var i = 0; i < array.length; i ++) {
        func(i, array[i]);
      }
      return f;
    }
    else
      return array;
  },// Makes pages for all the things we need pages for :P
  add_exp: (id, exp) => {
    db.get(`SELECT * FROM users WHERE id = "${id}"`, (err, res) => {
      if(!res)
        return console.log("Created user: " + id) && db.run(`INSERT INTO users (id, points, realPoints, messages, created) VALUES ("${id}", 0, 0, 0, ${new Date().valueOf()})`);
      db.run(`UPDATE users SET points = ${res.points + exp} WHERE id = "${id}"`);
    });
  },
  add_message: (id) => {
    let xp = f.random(10, 20, true);
    db.get(`SELECT * FROM users WHERE id = "${id}"`, (err, res) => {
      if(!res)
        return db.run(`INSERT INTO users (id, points, realPoints, messages, created) VALUES (?, ?, ?, ?, ?)`, [id, 0, 0, 1, new Date().valueOf()]) && console.log("Created user: " + id);
      db.run(`UPDATE users SET messages = ${res.messages + 1}, points = ${res.points + xp}, realPoints = ${res.realPoints + xp} WHERE id = "${id}"`);
    });
  },
  random: (min, max, round) => {
    return round ? Math.round(Math.random() * (max-min) + min) : Math.random() * (max-min) + min;
  },
  has_roles: (member, role_name = ["Moderator"]) => {
    if(typeof role_name === "string")
      role_name = [role_name];
    let has = true;
    for(let i of role_name) {
      if(!member.roles.map(r => r.name).includes(i))
        has = false;
    }
    return has;
  },
};

client.on("message", (msg) => {
  try {
    if(msg.content.startsWith(prefix)){
      if(!f.check_and_do_cmd(msg) && data.whitelist.includes(msg.channel.id))
        f.add_message(msg.author.id);
      return;
    }
    if(data.whitelist.includes(msg.channel.id))
      f.add_message(msg.author.id);
  } catch(err) {
    msg.channel.send(new Discord.RichEmbed().setAuthor("Error", client.user.avaterURL).setColor(f.color()).setDescription(`\`\`\`js\n${err}\`\`\``).setTimestamp());
    console.log("Error on the \"message\" event: " + err);
  }
});
client.on("ready", () => {
  console.log(client.user.tag + " has started. Ready for action");
  f.checkelections()//.checksql();
});

const cmds = {
  help: {
    a: ["commands"],
    desc: "Shows you all of Clyde's commands",
    usage: " [command name or category name]",
    cat: "utility",
    perms: "mod",
    del: false,
    do: (msg, content) => {
      if(content !== "") {
        if(cmds[content]) {
          
        } else if(["utility", "bot admin", "exp", "election", "fun"].includes(content)) {
          msg.channel.send(new Discord.RichEmbed().setAuthor(content.slice(0, 1).toUpperCase() + content.slice(1, content.length) + " Commands", client.user.avatarURL).setDescription(.setColor(f.color())
        } else
          msg.channel.send(new Discord.RichEmbed().setAuthor(`Error: No command or category named "${content}" found.`, client.user.avatarURL).setColor(f.color()).setFooter(`Do "${prefix}help" to see all commands and categories.`));
        return console.log(`"${content}"`);
      }
      let embed = new Discord.RichEmbed()
        .setColor(f.color())
        .setAuthor("List of Clyde's commands", msg.author.avatarURL);
      msg.channel.send(embed);
    },
  },
  run: {
    a: ["eval"],
    desc: "Runs code through Clyde",
    usage: " [code]",
    cat: "utility",
    perms: "ba",
    del: false,
    do: (msg, content) => {
      let evalled;
      if((content.startsWith("```js") || content.startsWith("```")) && content.endsWith("```"))
        content.slice(3, -3);
      if(!content || content === "")
        return msg.reply("Please enter some code to run");
      
      try {
        evalled = f.evalclean(eval(content));
      } catch(err) {
        evalled = `ERROR: ${f.evalclean(err)}`;
      }
      let embed = new Discord.RichEmbed()
        .setColor(f.color())
        .setTimestamp()
        .setAuthor("Run", client.user.avatarURL)
        .setDescription(`**Input:** \`\`\`js\n${content}\`\`\`**Output:** \`\`\`xl\n${evalled}\`\`\``)
        .setFooter(`Input length: ${content.length}`, msg.author.avatarURL);
      msg.channel.send(embed);
      console.log("Input: " + content);
    },
  },
};