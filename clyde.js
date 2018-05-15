// All requires and dependencies
const http = require('http');
const express = require('express');
const app = express();
const fs = require('fs');
const exists = fs.existsSync('./.data/sqlite.db');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./.data/sqlite.db');
const Discord = require("discord.js");
const data = require("./data.json");

// Prefix
const prefix = "c.";

// The exp milestones you have to reach to unlock commands
const needexp = [
  {
    cat: "exp",
    points: 100,
    ignore: ["stats"],
    warn: `You need **100 EXP** to use any commands in the **exp** category excluding \`${prefix}stats\``,
  },
  {
    cmd: "run",
    points: 3000,
    warn: "You need **3000 EXP** to use the **run** command!",
  },
  {
    cat: "elections",
    points: 500,
    warn: "You need **500 EXP** to use any commands in the **election** category",
  },
];

// The client
var client = new Discord.Client({ autoreconnect: true });
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
app.get("/", (request, response) => {
  response.sendStatus(200);
});
app.listen(process.env.PORT);
setInterval(() => {
  http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`);
}, 280000);

// if ./.data/sqlite.db does not exist, create it, and add tables
db.serialize(function() {
  let tables = [
    "users (id TEXT, points INTEGER, lastDaily INTEGER, messages INTEGER, realpoints INTEGER, created INTEGER)",
    "warns (num INTEGER PRIMARY KEY, warn TEXT, mod TEXT, date INTEGER)",
    "items (num INTEGER PRIMARY KEY, id INTEGER, user TEXT)",
    "quests (num INTEGER PRIMARY KEY, do INTEGER, user TEXT)",
    "expstore (num INTEGER PRIMARY KEY, item TEXT, desc TEXT, stock INTEGER, price INTEGER, approved TEXT, bought TEXT, seller TEXT, buyer TEXT)",
    "elections (num INTEGER PRIMARY KEY, winner TEXT, end INTEGER, start INTEGER, vp TEXT, title TEXT)",
    "election (num INTEGER PRIMARY KEY, id TEXT, vId TEXT, votes INTEGER, msgId TEXT, up TEXT)",
    "voters (id TEXT, for TEXT, date INTEGER, election INTEGER)",
    "suggestions (num INTEGER PRIMARY KEY, suggestion TEXT, by TEXT, votes TEXT, created INTEGER)",
    "waiting (user TEXT, id INTEGER, start INTEGER, time INTEGER, for TEXT, data TEXT)",
    "blacklist (user TEXT, reason TEXT, by TEXT, date INTEGER, time INTEGER)",
  ];
  for(var i of tables) {
    db.run("CREATE TABLE IF NOT EXISTS " + i);
    //console.log(i + " has been created if it didn't exist before");
  }
  
});

// All Functions
var f = {
  log: (type, log) => {
    let chnl = { main: "382499510401630209", chat: "433004874930716673", announce: "382353531837087745", staff: "382530174677417984", exp: "407643635358892032" }[type];
    if(!chnl)
      throw new Error(`Incorrect channel type on something. All channel types: \n{ main: "382499510401630209", chat: "433004874930716673", announce: "382353531837087745", staff: "382530174677417984", exp: "407643635358892032" }`);
    
    client.channels.get(chnl).send(log);
    return f;
  },
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
    db.all("SELECT * FROM users", (err, res) => { console.log("users", res); });
    db.all("SELECT * FROM warns", (err, res) => { console.log("warns", res); });
    db.all("SELECT * FROM items", (err, res) => { console.log("items", res); });
    db.all("SELECT * FROM expstore", (err, res) => { console.log("store", res); });
    db.all("SELECT * FROM elections", (err, res) => { console.log("elections", res); });
    db.all("SELECT * FROM election", (err, res) => { console.log("election", res); });
    db.all("SELECT * FROM voters", (err, res) => { console.log("voters", res); });
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
            if(h.cat === cmds[i].cat && res.points < h.points)
              if(h.ignore && !h.ignore.includes(i))
                return message.channel.send(new Discord.RichEmbed().setColor(f.color()).setAuthor("Not enough EXP", message.author.avatarURL).setDescription(h.warn));
            else if (h.cmd === i && res.points < h.points)
                return message.channel.send(new Discord.RichEmbed().setColor(f.color()).setAuthor("Not enough EXP", message.author.avatarURL).setDescription(h.warn));
          }
          if(content.endsWith("-d"))
            message.delete() && content.slice(0, -2);
          cmdDone = true;
          if(cmds[i].del === true)
            message.delete();
          cmds[i].do(message, content.includes(" ") ? content.slice(message.content.indexOf(" ")).trim() : "");
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
    return f;
  },
  add_message: (id) => {
    let xp = f.random(10, 20, true);
    if(Math.random() >= 0.99)
      xp = f.random(0, 5000, true) * 10 && client.users.get(id).send(new Discord.RichEmbed().setAuthor("YOU JUST WON A JACKPOT!", client.users.get(id).avatarURL).setDescription(`You have earned **${xp} EXP**!\nGreat job, keep talking to earn more prizes like these.`).setColor(f.color()));
    if([0, 6].includes(new Date().getDay()))
      xp *= 2;
    db.get(`SELECT * FROM users WHERE id = "${id}"`, (err, res) => {
      if(!res)
        return db.run(`INSERT INTO users (id, points, realpoints, messages, created) VALUES (?, ?, ?, ?, ?)`, [id, xp, 0, 1, new Date().valueOf()]) && console.log("Created user: " + id);
      db.run(`UPDATE users SET messages = ${res.messages + 1}, points = ${res.points + xp}, realpoints = ${res.realpoints + xp} WHERE id = "${id}"`);
    });
    return f;
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

// Events
client.on("message", msg => {
  try {
    
    //What happens when DMed
    if(msg.channel.type !== "text") {
      db.get("SELECT * FROM elections ORDER BY end DESC", (err, res) => {
        db.all("SELECT * FROM election", (err, rows) => {
          db.get(`SELECT * FROM users WHERE id = "${msg.author.id}"`, (err, user) => {
            if(res.end < new Date().valueOf())
              return;
            
            // Functions for waiting IDs
            let ids = [
              (f, d) => {
                if(msg.content === "yes") {
                  client.channels.get(data.echnl).send(new Discord.RichEmbed().setAuthor(client.users.get(f).tag + " is running for president!", client.users.get(f).avatarURL).setDescription(`with <@${msg.author.id}> as his/her Vice President!`).addField("Slogan", d.split("|=|")[0]).addField("Description of term", d.split("|=|")[1]).setColor(f.color())).then(message => {
                    message.react("👍").then(message => { message.react("👎"); });
                    db.run(`INSERT INTO election (id, vId, votes, msgId) VALUES ("${f}", "${msg.author.id}", 0, "${message.id}")`);
                    db.run(`DELETE FROM waiting WHERE id = "${msg.author.id}"`);
                  });
                  
                  msg.channel.send(`Thanks! You and <@${f}> have been entered into the election!`);
                  client.users.get(f).send(`<@${msg.author.id}> has approved your request to be your Vice President! You both have been put into the Election.`);
                } else if (msg.content === "no") {
                  db.run(`DELETE FROM waiting WHERE id = "${msg.author.id}"`);
                  msg.channel.send(`Thanks! <@${f}> has been informed about your rejection immediately.`);
                  client.users.get(f).send(`<@${msg.author.id}> has rejected your request to be your Vice President.`);
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
    if(msg.content.startsWith(prefix) && !msg.author.bot){
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
    for(let i of res) {
      if(!res)
        return;

      db.run(`DELETE FROM election WHERE id = "${i.id}"`);
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
});

// Election voting systems
client.on("messageReactionAdd", (reaction, user) => {
  if(reaction.me)
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
        user.send("You can only vote for someone other than you or your vice president!") && reaction.remove();
      
      db.get(`SELECT * FROM users WHERE id = "${reaction.message.id}"`, (err, ur) => {
        if((ur.realpoints > ur.points && ur.realpoints < 500) || ur.points < 500) 
          user.send("You need **500 EXP** to vote in the AqilAcademy Elections!") && reaction.remove();
        
        db.run(`INSERT INTO voters (id, for, date, election) VALUES ($id, $for, $date, $election)`, { $id: user.id, $for: res.id, $date: new Date().valueOf(), $election: row.num});
        db.run(`UPDATE election SET votes = ${res.votes + 1} WHERE id = "${res.id}", election = ${row.num}`);
      });
    });
  });
});
client.on("messageReactionRemove", (reaction, user) => {
  if(reaction.me)
    return;
  db.get("SELECT * FROM elections ORDER BY end DESC", (err, row) => {
    if(!row)
      return;
    
    if(row.end < new Date().valueOf())
      return;
    
    db.get(`SELECT * FROM election WHERE msgId = "${reaction.message.id}"`, (err, res) => {
      user.send(`Successfully removed your vote for <@${res.id}>`);
      
      db.run(`DELETE FROM voters WHERE id = "${user.id}"`);
      db.run(`UPDATE election SET votes = ${res.votes - 1} WHERE id = "${res.id}", election = ${row.id}`);
    });
  });
});

// Commands
const cmds = {
  help: {
    a: ["commands"],
    desc: "Shows you all of Clyde's commands",
    usage: " [command name or category name]",
    cat: "utility",
    do: (msg, content) => {
      if(content !== "") {
        if(cmds[content.toLowerCase()])
          return msg.channel.send(new Discord.RichEmbed().setAuthor(prefix + content.toLowerCase(), client.user.avatarURL).setDescription(cmds[content.toLowerCase()].desc).setColor(f.color()).addField("Usage", `\`\`\`\n${prefix + content.toLowerCase() + (cmds[content.toLowerCase()].usage ? cmds[content.toLowerCase()].usage : "")}\`\`\``).addField("Permissions", ["admin", "mod"].includes(cmds[content.toLowerCase()].perms) ? `You need the \`${{ mod: "Moderator", admin: "Administrator" }[cmds[content.toLowerCase()].perms]} role to use this command` : { "bot admin": "You need to be a Bot Administrator to use this command", "admin perm": "You need the `ADMINISTRATOR` permission to use this command", "": "You do not need ANY permissions to use this command", undefined: "You do not need ANY permissions to use this command" }[cmds[content.toLowerCase()].perms], true).addField("Category", `${cmds[content.toLowerCase()].cat} (${prefix}help ${cmds[content.toLowerCase()].cat})`, true).addField("Alias(es)", (cmds[content.toLowerCase()].a && cmds[content.toLowerCase()].a.length > 0) ? (cmds[content.toLowerCase()].a.length > 1 ? cmds[content.toLowerCase()].a.slice(0, -1).join(", ") + " and " + cmds[content.toLowerCase()].a[cmds[content.toLowerCase()].a.length-1] : cmds[content.toLowerCase()].a[0]) : "None", true));
        else if(["utility", "bot admin", "exp", "election", "fun"].includes(content.toLowerCase()))
          return msg.channel.send(new Discord.RichEmbed().setAuthor(content.slice(0, 1).toUpperCase() + content.slice(1, content.length) + " Commands", client.user.avatarURL).setDescription({ fun: "A bunch of fun commands you can just play around with!", utility: "Commands used for modding, and commands that also give us some info about the bot. ", "bot admin": "A bunch of commands only the Clyde Administrators(people who coded Clyde) can use", exp: "These commands let you interact with Clyde EXP and the EXP Store.", election: "Commands you can use to interact with the AqilAcademy Elections!" }[content.toLowerCase()]).addField("Commands", (function(cat) { let cmd = ""; for(let i in cmds) { if(cmds[i].cat === cat) return " "; } return ""})(content.toLowerCase()) === "" ? "No commands yet" : (function(cat) { let cmd = ""; for(let i in cmds) { if(cmds[i].cat === cat && !cmds[i].hidden) cmd += `**${prefix + i + (cmds[i].usage ? cmds[i].usage : "")}:** ${cmds[i].desc.split("\n")[0]}\n`; } return cmd})(content.toLowerCase())).setColor(f.color()));
        else
          return msg.channel.send(new Discord.RichEmbed().setAuthor(`Error: No command or category named "${content}" found.`, client.user.avatarURL).setColor(f.color()).setFooter(`Do "${prefix}help" to see all commands and categories.`));
        return console.log(`help error: "${content}"`);
      }
      let comds = "";
      for(let i in cmds) {
        if(!cmds[i].hidden)
          comds += prefix + i + "                    ".split("").slice(prefix.length + i.length).join("");
      }
      let embed = new Discord.RichEmbed()
        .setColor(f.color())
        .setAuthor("List of Clyde's commands", msg.author.avatarURL)
        .setDescription("```md\n" + comds + "```")
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
  stats: {
    desc: "Shows someone's EXP stats.",
    usage: " (user)",
    cat: "exp",
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
          embed.addField(`[${i + 1}] ${!client.users.get(user.id) ? "No Tag found(user should be deleted)" : client.users.get(user.id).tag}`, `**Points:** ${user.points} (Real: ${user.realpoints}) points\n**ID: \`${user.id}\`**`);
        });
        msg.channel.send(embed);
      });
    },
  },
  daily: {
    desc: "Gives you free EXP every day! The amount itself is based on your number of REAL points.",
    cat: "exp",
    do: (msg, content) => {
      db.get(`SELECT * FROM users WHERE id = "${msg.author.id}"`, (err, res) => {
        if(!res)
          return msg.reply("Please talk in <#433004874930716673> to get registered into the **EXP** database!\n**Reminder:** <#433004874930716673> is the only place you earn **EXP** by talking");
        if(new Date().getDate() === new Date(res.lastDaily).getDate() && new Date().getFullYear() === new Date(res.lastDaily).getFullYear() && new Date().getMonth() === new Date(res.lastDaily).getMonth())
          return msg.channel.send(new Discord.RichEmbed().setAuthor("Please wait till tomorrow to recieve your daily", msg.author.avatarURL).setColor(f.color()).setFooter("You can get it anytime tomorrow or after"));
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
    do: (msg, content) => {
      let args = content.split(" ");
      let id = args[0].replace(/[^0-9]/g, "");
      if(args.length < 3)
        return msg.reply("Please fill up ALL parameters.\n**Parameters:** `[user mention or id] [category] [action]`");
      
      if(!client.fetchUser(id))
        return msg.reply("Please enter a valid user mention/id");
      
      switch(args[1].toLowerCase()) {
        case "exp":
          let embed = new Discord.RichEmbed()
            .setColor(f.color())
            .setAuthor("Edited EXP for " + (client.users.get(id) ? client.users.get(id).tag : id), msg.author.avatarURL);
          if(["add", "sub", "set"].includes(args[2].toLowerCase()) && isNaN(Number(args[3])))
            return msg.reply("Please enter a valid number for the fourth argument!");
          db.get(`SELECT * FROM users WHERE id = "${id}"`, (err, res) => {
            if(!res)
              return msg.reply("User doesn't exist!");
            
            switch(args[2].toLowerCase()) {
              case "add":
                embed.setDescription(`Added **${args[3]} EXP** to <@${id}>`);
                db.run(`UPDATE users SET points = ${res.points + Number(args[3])} WHERE id = "${id}"`);
                break;
              case "sub":
                embed.setDescription(`Subtracted **${args[3]} EXP** from <@${id}>`);
                db.run(`UPDATE users SET points = ${(res.points - Number(args[3])) < 0 ? 0 : Math.round(res.points - Number(args[3]))} WHERE id = "${id}"`);
                break;
              case "set":
                embed.setDescription(`<@${id}>'s **EXP** set to **${args[3]} EXP**`);
                db.run(`UPDATE users SET points = ${res.points + Number(args[3])} WHERE id = "${id}"`);
                break;
              case "delete":
                embed.setDescription(`Deleted <@${id}> from the EXP table`);
                db.run(`DELETE FROM users WHERE id = "${id}"`);
                break;
              default:
                return msg.reply("Please enter a valid action! **Actions:** `delete, add [EXP amount], sub [EXP amount], set [EXP amount]`");
            }
            msg.channel.send(embed);
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
  ban: {
    desc: "Bans a user. User can be inside or outside AqilAcademy.",
    usage: " [id/user mention] (reason)",
    cat: "utility",
    perms: "admin",
    del: true,
    do: (msg, content) => {
      //Defines variables
      let [roles, reason, id, embed] = [undefined, content.slice(content.indexOf(" ")), content.split(" ")[0].replace(/[^0-9]/g, ""), new Discord.RichEmbed()];
      
      //Checks for ban
      if(msg.guild.members.get(id)) {
        if(msg.guild.members.find("id", client.user.id).highestRole.comparePositionTo(msg.guild.members.find("id", id).highestRole) < 0) return msg.reply(`Please give me a role higher than <@${id}> for me to execute this command`);
        if(msg.author.id !== msg.guild.owner.id && id !== msg.guild.owner.id && msg.member.roles.highestRole.comparePostionTo(msg.guild.members.find("id", id).highestRole) < 0) return msg.reply(`You need a higher role to ban <@${id}>`);
        roles = msg.guild.members.get(id).roles.map(r => r.name);
      }
      
      //Actually bans the user
      msg.guild.ban(id, `Banned for: ${reason === "" || !reason ? "No reason specified" : reason} (Moderator: ${msg.author.tag})`).then(user => {
        embed.setAuthor(`${user.tag} was banned`, user.avatarURL)
          .setColor(f.color());
        if(reason)
          embed.addField("Reason:", `${reason}`);
        embed.addField("Moderator:", `<@${msg.author.id}> (ID: \`${msg.author.id}\`)`);
        if(roles)
          embed.addField("Roles:", "```" + roles.join("\n") + "```");
        f.log("main", embed);
        msg.channel.send(embed);
      }).catch(err => {
        msg.channel.send(`ERROR:\`\`\`${err}\`\`\``);
      });
    },
  },
  kick: {
    desc: "Kicks a user. User has to be inside AqilAcademy.",
    usage: " [id/user mention] (reason)",
    cat: "utility",
    perms: "mod",
    del: true,
    do: (msg, content) => {
      //Defines variables
      let [roles, reason, id, embed] = [undefined, content.slice(content.indexOf(" ")), content.split(" ")[0].replace(/[^0-9]/g, ""), new Discord.RichEmbed()];
      
      //Checks for ban
      if(msg.guild.members.get(id)) {
        if(msg.guild.members.find("id", client.user.id).highestRole.comparePositionTo(msg.guild.members.find("id", id).highestRole) < 0) return msg.reply(`Please give me a role higher than <@${id}> for me to execute this command`);
        if(msg.author.id !== msg.guild.owner.id && id !== msg.guild.owner.id && msg.member.roles.highestRole.comparePostionTo(msg.guild.members.find("id", id).highestRole) < 0) return msg.reply(`You need a higher role to ban <@${id}>`);
        roles = msg.guild.members.get(id).roles.map(r => r.name);
      } else
        return msg.reply("Message has to be inside AqilAcademy");
      
      //Actually bans the user
      msg.member.kick(id, `Kicked for: ${reason === "" || !reason ? "No reason specified" : reason} (Moderator: ${msg.author.tag})`)
      embed.setAuthor(`${msg.author.tag} was banned`, msg.author.avatarURL);
      if(reason)
        embed.addField("Reason:", `${reason}`);
      embed.addField("Moderator:", `<@${msg.author.id}> (ID: \`${msg.author.id}\`)`)
        .setColor(f.color())
        .addField("Roles:", "```" + roles.join("\n") + "```");
      f.log("main", embed);
      msg.channel.send(embed);
    },
  },
  startelection: {
    desc: "Starts an AqilAcademy Election.",
    usage: " (title)",
    cat: "election",
    perms: "bot admin",
    del: true,
    do: (msg, content) => {
      db.all(`SELECT * FROM elections`, (err, res) => {
        if(res && res[res.length-1].end > new Date().valueOf())
          return msg.reply("An election is already in progress!");
        let embed = new Discord.RichEmbed()
          .setAuthor("A New Election has started!", client.user.avatarURL)
          .setColor(f.color())
          .addField("How to run", `To run, use the \`${prefix}run\` command. To learn more about the command, do \`${prefix}help run\`.\n**Requirnments:**\`\`\`md\n1. Your should have a 1000 REAL EXP\n2. You need to be a member for AqilAcademy for over 2 weeks\`\`\``)
          .addField("How to vote", "There are **2** reactions. A :thumbsup: and a :thumbsdown:. These will be your voting buttons. You can only vote once and you cannot vote for your Vice or yourself. We would advise you to not share who you voted for.")
          .addField("Election Rules", "Here are the current election rules. They can also be found in <#382676611205693441>")
          .setImage("https://cdn.glitch.com/87717c00-94ec-4ab4-96ea-8f031a709af4%2FCapture.PNG?1525539358951");
        f.checkelections();
        db.run(`INSERT INTO elections (end, start, title) VALUES (${new Date().valueOf() + 172800000}, ${new Date().valueOf()}, "${content === "" || !content ? "" : content}")`);
        client.channels.get(data.echnl).send(embed);
      });
    },
  },
  endelection: {
    desc: "Ends the ongoing election",
    cat: "election",
    perms: "bot admin",
    del: true,
    do: (msg, content) => {
      db.all(`SELECT * FROM elections`, (err, res) => {
        if(res[res.length-1].end < new Date().valueOf())
          return msg.reply("No ongoing election.");
        db.run(`UPDATE elections SET end = ${new Date().valueOf()} WHERE num = ${res[res.length-1].num}`);
        client.channels.get(data.echnl).send(new Discord.RichEmbed().setAuthor("Election has officially stopped by " + msg.author.tag, msg.author.avatarURL).setDescription("There might have been technical problems so please don't be angry"));
        msg.reply("Ended Election #" + res[res.length-1].num)
      });
    },
  },
  elections: {
    desc: "Shows some elections from AqilAcademy's history",
    cat: "election",
    usage: " (page)",
    hidden: false,
    del: false,
    do: (msg, content) => {
      let embed = new Discord.RichEmbed()
        .setColor(f.color())
        .setAuthor("AqilAcademy Elections in the past", client.user.avatarURL);
      
      let page = 0;
      if(content && !isNaN(Number(content)) && Number(content) > 0)
        page = Number(content)-1;
      
      db.all("SELECT * FROM elections ORDER BY end", (err, rows) => {
        embed.setFooter(`Page ${page + 1} | 10 per page | Total Elections: ${rows.length}`);
        
        if(rows.length < page * 10)
          return msg.channel.send(embed.setDescription(`**Error:**\`\`\`md\nPage does not exist!\n> Total elections: ${rows.length}\`\`\``));
        
        rows.reverse();
        f.page_maker(rows, 10, page, (i, row) => {
          embed.addField(`Election #${row.num}`, `**Start:** ${new Date(row.start).toUTCString()}\n${row.end < new Date().valueOf() ? `**End:** ${new Date(row.end).toUTCString()}` : "Ongoing"}\n**Winner:** ${client.users.get(row.winner) ? client.users.get(row.winner).tag : row.winner} (VP: ${client.users.get(row.vp) ? client.users.get(row.vp).tag : row.vp})`);
        });
        msg.channel.send(embed);
      });
    },
  },
  gamble: {
    desc: "50/50 chance to recieve or lose a part of the entered EXP",
    usage: " [exp amount or \"all\"(all your exp)]",
    cat: "exp",
    do: (msg, content) => {
      let gambled;
      if(!content)
        content = "10";
      if(content !== "all" && isNaN(Number(content)))
        return msg.reply("Please enter a NUMERIC amount of exp to gamble");

      db.get(`SELECT * FROM users WHERE id = "${msg.author.id}"`, (err, user) => {
        if(!user)
          return msg.reply("Please talk in #general and get registered into the EXP system!");
        if(content === "all")
          gambled = user.points;
        else if (Number(content) > user.points)
          return msg.reply("You do not have the amount of EXP you gambled.");
        else
          gambled = Number(content);
        
        let eygb = Math.round(Math.random() * gambled * 2) - gambled;// Exp You Get Back
        db.run(`UPDATE users SET points = ${user.points + eygb} WHERE id = "${msg.author.id}"`);
        if(eygb >= 0)
          msg.channel.send(`You have gained **${eygb} EXP**. Congrats!`);
        else
          msg.channel.send(`You have lost **${-eygb} EXP**.`);
      });
    },
  },
  president: {
    a: ["pres", "electme"],
    desc: "Run for president in the AqilAcademy elections!",
    usage: " [vice president mention or id(has to be inside the server)] |=| [slogan] |=| [description of term]",
    cat: "elections",
    do: (msg, content) => {
      let args = content.split("|=|").map(a => a.trim());
      let vp = args[0].replace(/[^0-9]/g, "");
      
      if(!args[2])
        return msg.reply("Please fill in all required parameters.\n**Required Parameters:** ` [Vice President mention or id] |=| [slogan] |=| [description of term]`");
      if(!msg.guild.members.get(vp))
        msg.reply("Please enter a valid member of AqilAcademy for your Vice President");
      if(msg.author.id === vp)
        msg.reply("Your Vice President cannot be yourself :face_palm:");
      if(client.users.get(vp).bot)
        msg.reply("Your Vice President has to be a human user");
      if(args[1] === "" || args[2] === "")
        msg.reply("No empty parameters allowed");
      db.get("SELECT * FROM elections ORDER BY end DESC", (err, res) => {
        if(res.end < new Date().valueOf())
          return msg.reply("There isn't an election going on yet!");
        db.get(`SELECT * FROM elections WHERE id = "${msg.author.id}"`, (err, row) => {
          if(row)
            return msg.reply("You are already in the election!");
          db.get(`SELECT * FROM waiting WHERE for = "${msg.author.id}"`, (err, w) => {
            if(w)
              return msg.reply("You are already waiting for a Vice President!");
            
            db.run(`INSERT INTO waiting (user, id, start, time, for, data) VALUES ("${vp}", 0, ${new Date().valueOf()}, ${res.end - new Date().valueOf()}, "${msg.author.id}", "${args[1] + "|=|" + args[2]}")`);
            msg.channel.send(new Discord.RichEmbed().setAuthor("Wait for your VP to approve then you will be put in!", msg.author.avatarURL).setColor(f.color()));
            client.users.get(vp).send(`<@${msg.author.id}> has asked you to be his Vice President! Put a \`yes\` if you agree and \`no\` if you don't.\n**Note:** You CAN be multiple people's Vice President`);
          });
        });
      });
    },
  },
};
