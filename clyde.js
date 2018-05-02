
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

// The exp milestones you have to reach to unlock commands
const needexp = [
  {
    cat: "exp",
    points: 100,
    warn: "You need **100 EXP** to use any commands in the **exp** category",
  },
];

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
            client.guilds.get("294115797326888961").channels.get(chnls.announce).send(`**:yes: The election has officially ended. Winner(s):**\`\`\`\n${winner}\`\`\``);// What
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
    let [content, cmdDone] = [message.content, false];
    let perms = {
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
      "bot admin": [!data.devs.includes(message.author.id), () => {
        message.reply("You need to be a Clyde Admin to use this command!");
      }],
    };
    for (var i in cmds) {
      if((cmds[i].a && cmds[i].a.includes(message.content.slice(prefix.length).split(" ")[0])) || message.content.slice(prefix.length).split(" ")[0] === i) {
        db.get(`SELECT * FROM users WHERE id = "${message.author.id}"`, (err, res) => {
          if(perms[cmds[i].perms][0])
            return perms[cmds[i].perms][1]();
          for(let h of needexp) {
            if(h.cat === cmds[i].cat) {
              if(res.points < h.points)
                return message.channel.send(new Discord.RichEmbed().setColor(f.color()).setAuthor("Not enough EXP", message.author.avatarURL).setDescription(h.warn));
            }
          }
          if(content.endsWith("-d"))
            message.delete() && content.slice(0, -2);
          cmdDone = true;
          if(cmds[i].del === true)
            message.delete();
          cmds[i].do(message, message.content.includes(" ") ? message.content.slice(message.content.indexOf(" ")).trim() : "");
        });
        break;
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
    if(func && typeof func === "function") {
      for(var i = 0; i < array.slice(page*num, page*num + num).length; i ++) {
        func(i + page*num, array.slice(page*num, page*num + num)[i]);
      }
      return f;
    }
    else
      return array;
  },// Makes pages for all the things we need pages for :P
  add_exp: (id, exp) => {
    db.get(`SELECT * FROM users WHERE id = "${id}"`, (err, res) => {
      if(!res)
        return console.log("Created user: " + id) && db.run(`INSERT INTO users (id, points, realpoints, messages, created) VALUES ("${id}", 0, 0, 0, ${new Date().valueOf()})`);
      db.run(`UPDATE users SET points = ${res.points + exp} WHERE id = "${id}"`);
    });
  },
  add_message: (id) => {
    let xp = f.random(10, 20, true);
    db.get(`SELECT * FROM users WHERE id = "${id}"`, (err, res) => {
      if(!res)
        return db.run(`INSERT INTO users (id, points, realpoints, messages, created) VALUES (?, ?, ?, ?, ?)`, [id, 0, 0, 1, new Date().valueOf()]) && console.log("Created user: " + id);
      db.run(`UPDATE users SET messages = ${res.messages + 1}, points = ${res.points + xp}, realpoints = ${res.realpoints + xp} WHERE id = "${id}"`);
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
    if(msg.content.startsWith(prefix) && !msg.author.bot){
      if(!f.check_and_do_cmd(msg) && data.whitelist.includes(msg.channel.id))
        f.add_message(msg.author.id);
      return;
    }
    if(data.whitelist.includes(msg.channel.id) && !msg.author.bot)
      f.add_message(msg.author.id);
  } catch(err) {
    msg.channel.send(new Discord.RichEmbed().setAuthor("Error", client.user.avatarURL).setColor(f.color()).setDescription(`\`\`\`js\n${err}\`\`\``).setTimestamp());
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
    perms: "",
    hidden: false,
    del: false,
    do: (msg, content) => {
      if(content !== "") {
        if(cmds[content.toLowerCase()])
          return msg.channel.send(new Discord.RichEmbed().setAuthor(prefix + content.toLowerCase(), client.user.avatarURL).setDescription(cmds[content.toLowerCase()].desc).setColor(f.color()).addField("Usage", `\`\`\`\n${prefix + content.toLowerCase() + cmds[content.toLowerCase()].usage}\`\`\``).addField("Permissions", ["admin", "mod"].includes(cmds[content.toLowerCase()].perms) ? `You need the \`${{ mod: "Moderator", admin: "Administrator" }[cmds[content.toLowerCase()].perms]} role to use this command` : { "bot admin": "You need to be a Bot Administrator to use this command", "admin perm": "You need the `ADMINISTRATOR` permission to use this command", "": "You do not need ANY permissions to use this command" }[cmds[content.toLowerCase()].perms]).addField("Category", `${cmds[content.toLowerCase()].cat} (${prefix}help ${cmds[content.toLowerCase()].cat})`).addField("Alias(es)", cmds[content.toLowerCase()].a.length > 0 ? (cmds[content.toLowerCase()].a.length > 1 ? cmds[content.toLowerCase()].a.slice(0, -1).join(", ") + " and " + cmds[content.toLowerCase()].a[cmds[content.toLowerCase()].a.length-1] : cmds[content.toLowerCase()].a[0]) : "None"));
        else if(["utility", "bot admin", "exp", "election", "fun"].includes(content.toLowerCase()))
          return msg.channel.send(new Discord.RichEmbed().setAuthor(content.slice(0, 1).toUpperCase() + content.slice(1, content.length) + " Commands", client.user.avatarURL).setDescription({ fun: "A bunch of fun commands you can just play around with!", utility: "Commands used for modding, and commands that also give us some info about the bot. ", "bot admin": "A bunch of commands only the Clyde Administrators(people who coded Clyde) can use", exp: "These commands let you interact with Clyde EXP and the EXP Store.", election: "Commands you can use to interact with the AqilAcademy Elections!" }[content.toLowerCase()]).addField("Commands", (function(cat) { let cmd = ""; for(let i in cmds) { if(cmds[i].cat === cat) return " "; } return ""})(content.toLowerCase()) === "" ? "No commands yet" : (function(cat) { let cmd = ""; for(let i in cmds) { if(cmds[i].cat === cat && !cmds[i].hidden) cmd += `**${prefix + i + cmds[i].usage}:** ${cmds[i].desc.split("\n")[0]}\n`; } return cmd})(content.toLowerCase())).setColor(f.color()));
        else
          return msg.channel.send(new Discord.RichEmbed().setAuthor(`Error: No command or category named "${content}" found.`, client.user.avatarURL).setColor(f.color()).setFooter(`Do "${prefix}help" to see all commands and categories.`));
        return console.log(`help error: "${content}"`);
      }
      let comds = "";
      for(let i in cmds) {
        if(!cmds[i].hidden)
          comds += `**${prefix + i + cmds[i].usage}**, `;
      }
      let embed = new Discord.RichEmbed()
        .setColor(f.color())
        .setAuthor("List of Clyde's commands", msg.author.avatarURL)
        .setDescription(comds)
        .addField(`Categories (${prefix}help [category name])`, "bot admin, election, exp, fun, and utility");
      msg.channel.send(embed);
    },
  },
  run: {
    a: ["eval"],
    desc: "Runs code through Clyde",
    usage: " [code]",
    cat: "bot admin",
    perms: "bot admin",
    hidden: false,
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
  restart: {
    a: ["rs"],
    desc: "Restarts Clyde",
    usage: "",
    cat: "bot admin",
    perms: "bot admin",
    hidden: false,
    del: true,
    do: (msg, content) => {
      process.exit(0);
      console.log(msg.author.tag + " restarted " + client.user.tag);
    },
  },
  stats: {
    a: [],
    desc: "Shows someone's EXP stats.",
    usage: " (user)",
    cat: "exp",
    perms: "",
    hidden: false,
    del: false,
    do: (msg, content) => {
      let [embed, id] = [new Discord.RichEmbed(), undefined];
      
      if(content !== "")
        id = content.replace(/[^0-9]/g, "");
      else
        id = msg.author.id;
      
      if(!client.users.get(id))
        return msg.reply("Please enter a valid ID/User Mention");
      
      db.get(`SELECT * FROM users WHERE id = "${id}"`, (err, res) => {
        embed.setAuthor(client.users.get(id).tag + "'s stats", client.users.get(id).avatarURL)
          .setColor(f.color())
          .setDescription(`**Points(money):** ${res.points}\n**REAL Points:** ${res.realpoints}\n**Messages:** ${res.messages}\n**Account was added in at:** ${new Date(res.created).toUTCString()}`);
        msg.channel.send(embed);
      })
    },
  },
  leaderboard: {
    a: ["lb"],
    desc: "Shows the leaderboard of people with the most EXP.",
    usage: " (page)",
    cat: "exp",
    perms: "",
    hidden: false,
    del: false,
    do: (msg, content) => {
      let embed = new Discord.RichEmbed()
        .setColor(f.color())
        .setAuthor("Clyde Leaderboard", client.user.avatarURL);
      
      let page = 0;
      if(content && !isNaN(Number(content)) && Number(content) > 0)
        page = Number(content)-1;
      
      db.all("SELECT * FROM users ORDER BY points", (err, rows) => {
        embed.setFooter(`Page ${page + 1} | 10 people per page | Total Users: ${rows.length} | To earn more exp, talk in #general`);
        
        if(rows.length < page * 10)
          return msg.channel.send(embed.setDescription(`**Error:**\`\`\`md\nPage does not exist!\n> Total Users: ${rows.length}\`\`\``));
        
        rows.reverse();
        f.page_maker(rows, 10, page, (i, user) => {
          embed.addField(`[${i + 1}] ${client.users.get(user.id).tag}`, `**Points:** ${user.points} (Real: ${user.realpoints}, Messages: ${user.messages})`);
        });
        msg.channel.send(embed);
      });
    },
  },
  daily: {
    a: [],
    desc: "Gives you free EXP every day! The amount itself is based on your number of REAL points.",
    usage: "",
    cat: "exp",
    perms: "",
    hidden: false,
    del: false,
    do: (msg, content) => {
      db.get(`SELECT * FROM users WHERE id = "${msg.author.id}"`, (err, res) => {
        if(new Date().getDate() === new Date(res.lastDaily).getDate() && new Date().getFullYear() === new Date(res.lastDaily).getFullYear() && new Date().getMonth() === new Date(res.lastDaily).getMonth())
          return msg.channel.send(new Discord.RichEmbed().setAuthor("Please wait till tomorrow to recieve your daily :D", msg.author.avatarURL).setColor(f.color()).setDescription("You can get it anytime tomorrow or after"));
        let exp = f.random(res.realpoints/20, res.realpoints/10, true);
        db.run(`UPDATE users SET points = ${res.points + exp}, lastDaily = ${new Date().valueOf()} WHERE id = "${msg.author.id}"`);
        msg.channel.send(new Discord.RichEmbed().setAuthor("Daily Recieved", msg.author.avatarURL).setColor(f.color()).setDescription(`You have recieved **${exp}** points`));
      });
    },
  },
  edit: {
    a: [],
    desc: "Edits a user's stats.\n**Three categories:**```md\n1. Warns(Actions: remove [IPK])\n2. Items(Actions: add [ID], remove [IPK])\n3. EXP(Actions: delete, add [EXP amount], sub [EXP amount], set [EXP amount])```",
    usage: " [user mention or id] [category] [action] (a number of some sort)",
    cat: "bot admin",
    perms: "bot admin",
    hidden: false,
    del: false,
    do: (msg, content) => {
      let args = content.split(" ");
      if(args.length < 3)
        return msg.reply("Please fill up ALL parameters.\n**Parameters:** `[user mention or id] [category] [action]`");
      
      if(!client.users.get(args[0].replace(/[^0-9]/g, "")))
        return msg.reply("Please enter a valid user mention/id");
      
      switch(args[1].toLowerCase()) {
        case "exp":
          if(["add", "sub", "set"].includes(args[2].toLowerCase()) && isNaN(Number(args[3])))
            return msg.reply("Please enter a valid number for the fourth argument!");
          db.get(`SELECT * FROM users WHERE id = "${msg.author.id}"`, () => {
            switch(args[2].toLowerCase()) {
              case "add":
                
                break;
              default:
                return msg.reply("Please enter a valid action! **Actions:** `delete, add [EXP amount], sub [EXP amount], set [EXP amount]`");
            }
          });
          break;
        case "warns":
          
          break;
        case "items":
          
          break;
        default:
          return msg.reply("Please enter a valid category!\n**Available categories:**```md\n1. Warns(Actions: remove [IPK])\n2. Items(Actions: add [ID], remove [IPK])\n3. EXP(Actions: delete, add [EXP amount], subtract [EXP amount], set [EXP amount])```");
      }
    },
  },
};