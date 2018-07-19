// All requires and dependencies
const { createCanvas, loadImage, Image } = require("canvas");
const snekfetch = require("snekfetch");
const app = require('express')();
const fs = require('fs');
const exists = fs.existsSync('./.data/sqlite.db');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./.data/sqlite.db');
const Discord = require("discord.js");
const data = require("/app/data/d.js");
const levels = require("/app/data/l.js");
const globalfunctions = require("/app/data/f.js");

// Prefix
const prefix = "c.";

// Cooldowns
const cooldowns = {};

// The Client
const client = new Discord.Client();
client.login(process.env.TOKENC);

// Runs the bot
function run() {
  
  // Events
  client.on("message", async msg => {
    try {
      //What happens when DMed
      if(msg.channel.type !== "text" && msg.author.id === client.user.id) {
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
                    client.guilds.get("294115797326888961").members.get(id).addRole(client.guilds.get("294115797326888961").roles.find("name", "Candidate").id, "Elections")
                    client.guilds.get("294115797326888961").members.get(msg.author.id).addRole(client.guilds.get("294115797326888961").roles.find("name", "Candidate").id, "Elections")
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
  client.on('raw', async event => {
    const events = {
      MESSAGE_REACTION_ADD: 'messageReactionAdd',
      MESSAGE_REACTION_REMOVE: 'messageReactionRemove',
    };
    if (!events.hasOwnProperty(event.t)) return;

    const { d: data } = event;
    const user = client.users.get(data.user_id);
    const channel = client.channels.get(data.channel_id) || await user.createDM();

    if (channel.messages.has(data.message_id)) return;

    const message = await channel.fetchMessage(data.message_id);
    const emojiKey = (data.emoji.id) ? `${data.emoji.name}:${data.emoji.id}` : data.emoji.name;
    let reaction = message.reactions.get(emojiKey);

    if (!reaction) {
      const emoji = new Discord.Emoji(client.guilds.get(data.guild_id), data.emoji);
      reaction = new Discord.MessageReaction(message, emoji, 1, data.user_id === client.user.id);
    }

    client.emit(events[event.t], reaction, user);
  });
};

// All channels needed to run bot
const chnls = {
  announce: "382353531837087745",
  staff: "382530174677417984",
}

// All functions needed to run the bot
Array.prototype.getObj = function (num, value, before) {
  (this).forEach((obj) => {
    if(typeof obj !== "object")
      return {};
  });
  
  let arr = (this).filter(a => a[value] >= num), val;
  if(arr[0][value] <= arr[arr.length - 1][value]) {
    if(before)
      arr = [this[(this).indexOf(arr[0]) - 1] || {}, arr[0] || {}];
    else
      arr = arr[0];
  }
  else {
    if(before)
      arr = [this[(this).indexOf(arr[arr.length - 1]) - 1] || {}, arr[arr.length - 1] || {}];
    else
      arr = arr[arr.length - 1];
  }
  
  return arr;
};
Array.prototype.shuffle = function () {
  let arr = this, narr = [];
  while(arr.length > 0) {
    let num = f.random(0, arr.length - 1, true);
    narr.push(arr[num]);
    arr.splice(num, 1);
  }
  return narr;
};
const f = {
  log: (type, log) => {
    let chnl = { main: "382499510401630209", chat: "433004874930716673", announce: "382353531837087745", staff: "382530174677417984", exp: "407643635358892032" }[type];
    if(!chnl)
      throw new Error(`Incorrect channel type on something. All channel types: \n{ main: "382499510401630209", chat: "433004874930716673", announce: "382353531837087745", staff: "382530174677417984", exp: "407643635358892032" }`);

    client.channels.get(chnl).send(log);
    return f;
  },
  checkelections: () => {
    db.get("SELECT * FROM elections ORDER BY end DESC", (err, elec) => {
      if(!elec || elec.end < new Date().valueOf())
        return;
      
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
          client.guilds.get("294115797326888961").channels.get(data.echnl).overwritePermissions(client.guilds.get("294115797326888961").guild.roles.get("294115797326888961"), { READ_MESSAGES: true });
        })
      }, elec.end - new Date().valueOf());
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
        db.get(`SELECT * FROM blacklist WHERE user = "${message.author.id}"`, (err, black) => {
          if(black)
            return message.reply("You are blacklisted from the bot! You cannot use any of its commands").then(m => {
              m.delete(5000);
              message.delete(5000);
            }).catch(console.log);
          db.get(`SELECT * FROM users WHERE id = "${message.author.id}"`, (err, res) => {
            if(perms[cmds[i].perms][0])
              return perms[cmds[i].perms][1]();
            if(content.endsWith("-d"))
              message.delete() && content.slice(0, -2);
            cmdDone = true;
            if(cmds[i].del === true)
              message.delete();
            cmds[i].do(message, content.includes(" ") ? content.slice(message.content.indexOf(" ")).trim() : "");
          });
        });
        break;
      }
    }
    return cmdDone;
  },// Does a command
  evalclean: globalfunctions.eclean,// Cleans "evalled"
  color: globalfunctions.ecol,// Random color
  page_maker: globalfunctions.page_maker,// Makes pages for all the things we need pages for :P
  add_exp: globalfunctions.add_exp,// Adds EXP to a person
  add_message: (id) => {
    let xp = f.random(10, 20, true), jackpot = 0;
    if(Math.random() >= 0.999) {
      jackpot = f.random(500, 50000, true) * 10;
      client.users.get(id).send(new Discord.RichEmbed().setAuthor("YOU JUST WON A JACKPOT!", client.users.get(id).avatarURL).setDescription(`You have earned **${jackpot} EXP**!\nGreat job, keep talking to earn more prizes like these.`).setColor(f.color()));
    }
    if([0, 6].includes(new Date().getDay()))
      xp *= 2;
    db.get(`SELECT * FROM users WHERE id = "${id}"`, (err, res) => {
      if(!res)
        return db.run(`INSERT INTO users (id, points, realpoints, messages, created) VALUES (?, ?, ?, ?, ?)`, [id, xp + jackpot, xp, 1, new Date().valueOf()]) && console.log("Created user: " + id);
      db.run(`UPDATE users SET messages = ${res.messages + 1}, points = ${res.points + xp + jackpot}, realpoints = ${res.realpoints + xp} WHERE id = "${id}"`);
    });
    return f;
  },// Adds a "message"'s amount of stuff to a person
  random: globalfunctions.random,
  has_roles: globalfunctions.has_roles,
  warn: (mId, id, reason = "Unknown", severity = 1) => {
    db.run(`INSERT INTO warns (warn, user, mod, severity, date) VALUES ("${reason}", "${id}", "${mId}", ${severity}, ${new Date().valueOf()})`);
    client.users.get(id).send(new Discord.RichEmbed().setAuthor("You have been warned in AqilAcademy by " + client.users.get(mId).tag, client.users.get(mId).avatarURL).setDescription(reason).setColor(f.color()).setFooter(`Severity(Level of warn): ${severity}`));
  },// Adds a warn to a user
  get_id: globalfunctions.get_id,
  calculate_stats: async (id) => {
    if(!client.users.get(id))
      return false;
    return globalfunctions.calculate_stats(id);
  },
  round_rect: globalfunctions.round_rect,
  autofont: globalfunctions.autofont,
};

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
          return msg.channel.send(new Discord.RichEmbed().setAuthor(prefix + content.toLowerCase(), client.user.avatarURL).setDescription(cmds[content.toLowerCase()].desc).setColor(f.color()).addField("Usage", `\`\`\`\n${prefix + content.toLowerCase() + (cmds[content.toLowerCase()].usage ? cmds[content.toLowerCase()].usage : "")}\`\`\``).addField("Permissions", ["admin", "mod"].includes(cmds[content.toLowerCase()].perms) ? `You need the \`${{ mod: "Moderator", admin: "Administrator" }[cmds[content.toLowerCase()].perms]}\` role to use this command` : { "bot admin": "You need to be a Bot Administrator to use this command", "admin perm": "You need the `ADMINISTRATOR` permission to use this command", "": "You do not need ANY permissions to use this command", undefined: "You do not need ANY permissions to use this command" }[cmds[content.toLowerCase()].perms], true).addField("Category", `${cmds[content.toLowerCase()].cat} (${prefix}help ${cmds[content.toLowerCase()].cat})`, true).addField("Alias(es)", (cmds[content.toLowerCase()].a && cmds[content.toLowerCase()].a.length > 0) ? (cmds[content.toLowerCase()].a.length > 1 ? cmds[content.toLowerCase()].a.slice(0, -1).join(", ") + " and " + cmds[content.toLowerCase()].a[cmds[content.toLowerCase()].a.length-1] : cmds[content.toLowerCase()].a[0]) : "None", true));
        else if(["utility", "bot admin", "exp", "election", "fun"].includes(content.toLowerCase()))
          return msg.channel.send(new Discord.RichEmbed().setAuthor(content.slice(0, 1).toUpperCase() + content.slice(1, content.length) + " Commands", client.user.avatarURL).setDescription({ fun: "A bunch of fun commands you can just play around with!", utility: "Commands used for modding, and commands that also give us some info about the bot. ", "bot admin": "A bunch of commands only the Clyde Administrators(people who coded Clyde) can use", exp: "These commands let you interact with Clyde EXP and the EXP Store.", election: "Commands you can use to interact with the AqilAcademy Elections!" }[content.toLowerCase()]).addField("Commands", (function(cat) { let cmd = ""; for(let i in cmds) { if(cmds[i].cat === cat) return " "; } return ""})(content.toLowerCase()) === "" ? "No commands yet" : (function(cat) { let cmd = ""; for(let i in cmds) { if(cmds[i].cat === cat && !cmds[i].hidden) cmd += `**${prefix + i + (cmds[i].usage ? cmds[i].usage : "")}:** ${cmds[i].desc.split("\n")[0]}\n`; } return cmd})(content.toLowerCase())).setColor(f.color()));
        else
          return msg.channel.send(new Discord.RichEmbed().setAuthor(`Error: No command or category named "${content}" found.`, client.user.avatarURL).setColor(f.color()).setFooter(`Do "${prefix}help" to see all commands and categories.`));
        return console.log(`help error: "${content}"`);
      }
      let comds = "";
      for(let i in cmds) {
        if(!cmds[i].hidden)
          comds += prefix + i + "                    ".slice(prefix.length + i.length);
      }
      let embed = new Discord.RichEmbed()
        .setColor(f.color())
        .setAuthor("List of Clyde's commands", msg.author.avatarURL)
        .setDescription("```md\n" + comds + "```")
        .addField(`Categories (${prefix}help [category name])`, "bot admin, election, exp, fun, and utility");
      msg.channel.send(embed);
    },
  },
  stats: {
    desc: "Shows someone's EXP stats.",
    usage: " (user)",
    cat: "exp",
    do: async (msg, content) => {
      let [embed, id] = [new Discord.RichEmbed(), f.get_id(msg, content) || msg.author.id];
      
      if(!client.users.get(id))
        return msg.reply("Please enter a valid ID/User Mention");
      let stats = await f.calculate_stats(id) || {};
      embed.setAuthor(client.users.get(id).tag + "'s stats", client.users.get(id).avatarURL)
        .setColor(f.color())
        .addField("<:exp:458774880310263829> EXP", `**Points:** ${stats.points}\n**Real Points:** ${stats.realpoints}\n**Last Daily at:** ${new Date(stats.lastDaily).toLocaleString('en', { timeZone: 'UTC' })}\n**Streak:** ${stats.streak}\n**Place on leaderboard:** \`${stats.leaderboard_place + (JSON.parse(JSON.stringify(stats.leaderboard_place)[JSON.stringify(stats.leaderboard_place).length - 1]) < 4 ? ["th", "st", "nd", "rd"][JSON.stringify(stats.leaderboard_place)[JSON.stringify(stats.leaderboard_place).length - 1]] : "th")}\``, true)
        .addField("📈 Stats", `**Recorded Messages:** ${stats.messages}\n**Account added at:** ${new Date(stats.created).toLocaleString('en', { timeZone: 'UTC' })}\n**Blacklisted:** ${stats.blacklisted ? "Yes" : "No"}`, true)
        .addField(`⚠ Total Infractions: ${stats.warns.length}`, `**Total Severity:** ${stats.severity}`, true);
      msg.channel.send(embed);
      console.log(stats);
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
    do: (msg, content, nodaily) => {
      db.get(`SELECT * FROM users WHERE id = "${msg.author.id}"`, (err, res) => {
        if(!res)
          return msg.reply("Please talk in <#433004874930716673> to get registered into the **EXP** database!\n**Reminder:** <#433004874930716673> is the only place you earn **EXP** by talking");
        
        // Fake Daily
        let exp = f.random(res.realpoints/20, res.realpoints/10, true);
        if(nodaily)
          return msg.channel.send(new Discord.RichEmbed().setAuthor("Daily Recieved", msg.author.avatarURL).setColor(f.color()).setDescription(`You have recieved **${exp}** points`));
        
        if(new Date().getDate() === new Date(res.lastDaily).getDate() && new Date().getFullYear() === new Date(res.lastDaily).getFullYear() && new Date().getMonth() === new Date(res.lastDaily).getMonth())
          return msg.channel.send(new Discord.RichEmbed().setAuthor("Please wait till tomorrow to recieve your daily", msg.author.avatarURL).setColor(f.color()).setFooter("You can get it anytime tomorrow or after"));
        db.run(`UPDATE users SET points = ${res.points + exp}, lastDaily = ${new Date().valueOf()} WHERE id = "${msg.author.id}"`);
        msg.channel.send(new Discord.RichEmbed().setAuthor("Daily Recieved", msg.author.avatarURL).setColor(f.color()).setDescription(`You have recieved **${exp}** points`));
      });
    },
  },
  edit: {
    a: [],
    desc: "Edits a user's stats.\n**Three categories:**```md\n1. Warns(Actions: remove [IPK], reset)\n2. Items(Actions: add [ID], remove [IPK])\n3. EXP(Actions: delete, add [EXP amount], sub [EXP amount], set [EXP amount])```",
    usage: " [user mention or id] [category] [action] (a number of some sort)",
    cat: "bot admin",
    perms: "bot admin",
    do: async (msg, content) => {
      let args = content.split(" "), embed,
          id = f.get_id(msg, args[0]);
      if(args.length < 3)
        return msg.reply("Please fill up ALL parameters.\n**Parameters:** `[user mention or id] [category] [action]`");
      
      if(!client.fetchUser(id))
        return msg.reply("Please enter a valid user mention/id");
      
      switch(args[1].toLowerCase()) {
        case "xp":
        case "exp":
          embed = new Discord.RichEmbed()
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
        case "infraction":
        case "warn":
        case "warns":
          embed = new Discord.RichEmbed()
            .setColor(f.color())
            .setAuthor("Edited Rule Infractions for " + (client.users.get(id) ? client.users.get(id).tag : id), msg.author.avatarURL);
          if(args[2].toLowerCase() === "remove" && isNaN(Number(args[3])))
            return msg.reply("Please enter a valid number for the fourth argument!");
          db.all(`SELECT * FROM warns WHERE user = "${id}"`, (err, res) => {
            if(!res)
              return msg.reply("User doesn't exist!");
            
            if(res.length == 0)
              return msg.reply("This user doesn't have any warns!");
            
            switch(args[2].toLowerCase()) {
              case "remove":
                db.get(`SELECT * FROM warns WHERE user = "${id}" AND num = ${Number(args[3])}`, (err, warn) => {
                  if(!warn)
                    return msg.reply("IPK and User don't match");
                  embed.setDescription(`Removed Infraction #${args[3]}:\`\`\`${warn.warn}\`\`\``);
                  db.run(`DELETE FROM warns WHERE num = ${Number(args[3])}`);
                });
                break;
              case "reset":
                embed.setDescription(`Removed ALL[${res.length}] infractions from <@${id}>`);
                db.run(`DELETE FROM warns WHERE user = "${id}"`);
                break;
              default:
                return msg.reply("Please enter a valid action! **Actions:** `remove [IPK], reset`");
            }
            msg.channel.send(embed);
          });
          break;
        case "item":
        case "items":
          
          break;
        default:
          return msg.reply("Please enter a valid category!\n**Available categories:**```md\n1. Warns(Actions: remove [IPK])\n2. Items(Actions: add [ID], remove [IPK])\n3. EXP(Actions: delete, add [EXP amount], subtract [EXP amount], set [EXP amount])```");
      }
    },
  },
  transfer: {
    a: ["give"],
    desc: "Transfers given amount of EXP from you to the user mentioned",
    usage: " [id or mention] [exp amount]",
    cat: "exp",
    do: (msg, content) => {
      content = content.split(" ");
      if(content.length < 2)
        return msg.reply("Please enter the required parameters!\n**Required Parameters:** `[id or mention] [exp amount]`");
      if(content[0].replace(/[^0-9]/g, "") === msg.author.id)
        return msg.reply("You cannot transfer EXP to yourself!");
      if(!client.users.get(content[0].replace(/[^0-9]/g, "")));
        return msg.reply("Please enter a valid user ID/mention!");
      if(isNaN(Number(content[1])) || Number(content[1]) < 1)
        return msg.reply("Please enter a positive integer value for the EXP Amount");
      
      db.get(`SELECT * FROM users WHERE id = "${msg.author.id}"`, (err, user) => {
        if(!user)
          return msg.reply("You don't have any points!");
        if(user.points < Number(content[1]))
          return msg.reply("You do not have enough EXP!");
        f.add_exp(msg.author.id, -Number(content[1])).add_exp(f.get_id(content[0]), Number(content[1]));
        msg.channel.send("<:exp:458774880310263829> EXP Transfer complete!", new Discord.RichEmbed().setAuthor("EXP Transfer", msg.guild.iconURL).setDescription(`<@${msg.author.id}> sent **${content[1]} EXP** to <@${content[0].replace(/[^0-9]/g, "")}>`).setColor(f.color()));
      });
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
      let [roles, reason, id, embed] = [undefined, content.slice(content.indexOf(" ")), msg, content.split(" ")[0].replace(/[^0-9]/g, ""), new Discord.RichEmbed()];
      
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
  suggest: {
    a: ["sug"],
    desc: "Suggests stuff from these categories: trivia, server, rules, emoji, and bot",
    usage: " (trivia { (question) --- [(answer) || (answer) (true if right)] --- (difficulty(1-5)) }) OR (server (suggestion)) OR (rules (suggestion)) OR (emoji :(name): (link or attached image)) OR (bot (bot name) --- (bot description) --- (bot invite link))",
    cat: "utility",
    hidden: true,
    do(msg, content) {
    
    },
  },
  warn: {
    desc: "Warns (adds an infraction to) a user.",
    usage: " [user id or mention] [reason] (S:[severity])",
    cat: "utility",
    perms: "mod",
    do(msg, content) {
      let id,
          reason,
          severity;
      
      id = f.get_id(msg, content.split(" ")[0]);
      if(!id)
        return msg.reply("Please include a VALID user ID/Mention!");
      
      content = content.slice(content.split(" ")[0].length + 1);
      if(!content || content === "")
        return msg.reply("You HAVE to include a reason!");
      if(content.includes("S:"))
        reason = content.split("S:")[0],
        severity = isNaN(Number(content.split("S:")[1])) || Number(content.split("S:")[1]) < 1 ? 1 : Number(content.split("S:")[1]);
      else
        reason = content;
      msg.channel.send(new Discord.RichEmbed().setAuthor(`Warned ${client.users.get(id) || id}`, client.users.get(id).avatarURL || msg.author.avatarURL).setDescription(`**For:** ${reason}`));
      f.warn(msg.author.id, id, reason, severity);
    },
  },
  infractions: {
    a: ["warns"],
    desc: "Shows you your warns/infractions",
    cat: "utility",
    do(msg, content) {
      let id = f.get_id(msg, content.split(" ")[0]) || msg.author.id,
          txt = "";
      
      if(!client.fetchUser(id))
        return msg.reply("User doesn't exist!");
      db.all(`SELECT * FROM warns WHERE user = "${id}"`, async (err, warns) => {
        if(!warns || warns.length == 0)
          return id === msg.author.id ? msg.reply("You do not have any warns! Nice Job! 🎉") : msg.channel.send(`${await client.fetchUser(id).tag} doesn't have any warns!`);
        
        txt += `You have ${warns.length} Infractions. Page 1:\`\`\`md\n`;
        
        f.page_maker(warns, 10, 0, (i, warn) => {
          txt += `# Reason: ${warn.warn}\n- IPK: ${warn.num} | Moderator: ${client.users.get(warn.mod) ? client.users.get(warn.mod).tag : warn.mod} | Severity: ${warn.severity}\n\n`;
        });
        txt += "```";
        
        msg.channel.send(txt);
      });
    },
  },
  bot: {
    desc: "Displays some stats for the bot",
    cat: "utility",
    do(msg, content) {
      msg.channel.send(new Discord.RichEmbed().setAuthor("Clyde Stats", client.user.avatarURL).setDescription(`**Memory Usage:** ${(process.memoryUsage().heapUsed / 1048576).toFixed(2)} MB\n**node.js Version:** \`${process.version}\`\n**discord.js Version:** \`v${require("discord.js").version}\`\n**Uptime:** ${globalfunctions.time(client.uptime)}`).setColor(f.color()));
    },
  },
  blacklist: {
    a: ["bl"],
    desc: "Blocks/unblocks someone from using Clyde.",
    usage: " [user name, id, or mention] (reason) (T:[time])",
    cat: "bot admin",
    perms: "bot admin",
    do: async (msg, content) => {
      let reason = content.slice(content.indexOf(" ") + 1) || "",
          time = Number(content.slice(content.indexOf("T:") + 1)),
          user = await client.fetchUser(f.get_id(msg, content.split(" ")[0]));
      if(isNaN(time))
        time = void 0;
      if(!user)
        return msg.reply("Specified user does not exist!");
      db.get(`SELECT * FROM blacklist WHERE user = "${user.id}"`, (err, black) => {
        if(!black) {
          db.run(`INSERT INTO blacklist (user, reason, by, date, time) VALUES (?, ?, ?, ?, ?)`, [user.id, reason === "" ? "No Reason" : reason, msg.author.id, new Date().valueOf(), time || 0]);
          msg.channel.send(new Discord.RichEmbed().setAuthor(`${user.tag} has been blacklisted!`, user.avatarURL).setDescription(`**Reason:** ${reason + (time ? `\n**For:** ${globalfunctions.time(time * 60000)}` : "")}`).setColor(f.color()));
        } else {
          db.run(`DELETE FROM blacklist WHERE user = "${user.id}"`);
          msg.channel.send(new Discord.RichEmbed().setAuthor(`${user.tag} has been removed from the blacklist!`, user.avatarURL).setDescription(`**Had been blacklisted for:** ${globalfunctions.time(new Date().valueOf() - black.date)}`).setColor(f.color()));
        }
      });
    },
  },
  tag: {
    a: ["t"],
    desc: "Like another set of commands... made only for fun!",
    usage: " (tag name) (args)",
    cat: "fun",
    do: async (msg, content) => {
      let tags = {
        randomcat: {
          a: ["rc"],
          i: "Sends a random cat picture!",
          f: async function(mess) {
            try {
              let { body } = await snekfetch.get('https://aws.random.cat/meow');
              msg.channel.send("🐱 **Here is your random cat:**", new Discord.RichEmbed().setImage(body.file).setColor(f.color()));
            } catch (err) {
              msg.channel.send("Sorry, we are experiencing technical difficulties... Try again later");
              console.log(`Cat Error: ${err}`);
            }
          }
        },
        daily: {
          i: "Does a fake daily for you",
          f: () => cmds.daily(msg, content, true),
        }
      };
      for(let i in tags) {
        if(content.split(" ")[0] == i || (tags[i].a && tags[i].a.includes(content.split(" ")[0])))
          return tags[i].f(content.slice(content.indexOf(" ") + 1));
      }
      msg.reply("Tag doesn't exist!");
    },
  },
  
  // Election commands
  startelection: {
    desc: "Starts an AqilAcademy Election.",
    usage: " (title)",
    cat: "election",
    perms: "bot admin",
    del: true,
    do: (msg, content) => {
      db.get(`SELECT * FROM elections ORDER BY end DESC`, (err, res) => {
        console.log(res);
        if(res && (res !== {} || res !== []) && res.end > new Date().valueOf())
          return msg.reply("An election is already in progress!");
        let embed = new Discord.RichEmbed()
          .setAuthor("A New Election has started!", client.user.avatarURL)
          .setColor(f.color())
          .addField("How to run", `To run, use the \`${prefix}president\` command. To learn more about the command, do \`${prefix}help president\`.\n**Requirnments:**\`\`\`md\n1. Your should have a 1000 REAL EXP\n2. You need to be a member for AqilAcademy for over 2 weeks\`\`\``)
          .addField("How to vote", "There is **1** reaction, a :thumbsup:. This is your personal voting button. You can vote for anyone but yourself. You technically have unlimited votes untill Aqil finds a fix for that :P")
          .addField("Election Rules", "Here are the current election rules. They can also be found in <#382676611205693441>")
          .setImage("https://cdn.glitch.com/87717c00-94ec-4ab4-96ea-8f031a709af4%2FCapture.PNG?1525539358951");
        setTimeout(() => {
          f.checkelections();
        }, 2000);
        db.run(`INSERT INTO elections (end, start, title) VALUES (${new Date().valueOf() + 172800000}, ${new Date().valueOf()}, "${content === "" || !content ? "" : content}")`);
        msg.guild.channels.get(data.echnl).overwritePermissions(msg.guild.roles.get("294115797326888961"), { READ_MESSAGES: true });
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
        db.run(`DELETE FROM waiting WHERE id = 0`);
        db.run("DELETE FROM election");
        msg.guild.channels.get(data.echnl).overwritePermissions(msg.guild.roles.get("294115797326888961"), { READ_MESSAGES: false });
        msg.guild.members.array().forEach(m => {
          if(m.roles.get(msg.guild.roles.find("name", "Candidate").id))
            m.removeRole(msg.guild.roles.find("name", "Candidate").id);
        });
        client.channels.get(data.echnl).send(new Discord.RichEmbed().setAuthor("Election has officially stopped by " + msg.author.tag, msg.author.avatarURL).setDescription("There might have been technical problems so please don't be angry").setColor(f.color()));
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
          embed.addField(row.title ? `${row.title} (#${row.num})` : `Election #${row.num}`, `**Start:** ${new Date(row.start).toUTCString()}\n${row.end < new Date().valueOf() ? `**End:** ${new Date(row.end).toUTCString()}` : "Ongoing"}\n**Winner:** ${client.users.get(row.winner) ? client.users.get(row.winner).tag : row.winner} (VP: ${client.users.get(row.vp) ? client.users.get(row.vp).tag : row.vp})`);
        });
        msg.channel.send(embed);
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
      let vp = f.get_id(msg, args[0]);
      
      if(!args[2])
        return msg.reply("Please fill in all required parameters.\n**Required Parameters:** ` [Vice President mention or id] |=| [slogan] |=| [description of term]`");
      if(!msg.guild.members.get(vp))
        return msg.reply("Please enter a valid member of AqilAcademy for your Vice President");
      if(msg.author.id === vp)
        return msg.reply("Your Vice President cannot be yourself :face_palm:");
      if(client.users.get(vp).bot)
        return msg.reply("Your Vice President has to be a human user");
      if(args[1] === "" || args[2] === "")
        return msg.reply("No empty parameters allowed");
      db.get("SELECT * FROM elections ORDER BY end DESC", (err, res) => {
        if(!res || res.end < new Date().valueOf())
          return msg.reply("There isn't an election going on yet!");
        db.get(`SELECT * FROM election WHERE id = "${msg.author.id}"`, (err, row) => {
          if(row)
            return msg.reply("You are already in the election!");
          db.get(`SELECT * FROM waiting WHERE for = "${msg.author.id}" AND id = 0`, (err, w) => {
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
  withdraw: {
    desc: "Withdraws you from the AqilAcademy Election",
    cat: "election",
    del: true,
    do: (msg, content) => {
      db.get("SELECT * FROM elections ORDER BY end DESC", (err, res) => {
        if(!res || res.end < new Date().valueOf())
          return msg.reply("There isn't an election going on yet!");
        db.get(`SELECT * FROM waiting WHERE for = "${msg.author.id}" AND id = 0`, (err, w) => {
          if(w) {
            db.run(`DELETE FROM waiting WHERE for = "${w.for}" AND id = 0`);
            msg.channel.send(`You and <@${w.user}> have been taken off the waiting list to put you both in the elections`);
            client.users.get(w.user).send("Sorry, you have been taken off the waiting list for Vice President because your President withdrew");
            return;
          }
          db.get(`SELECT * FROM election WHERE id = "${msg.author.id}"`, async (err, row) => {
            if(!row)
              return msg.reply("You are not waiting for a Vice President to confirm AND you are not in the election.");
            
            client.users.get(row.vId).send(`Your President(<@${row.id}>) has withdrawn from the elections! You are not his Vice President anymore`);
            msg.channel.send(`You and <@${row.vId}> have been taken out of the election`);
            let mess = await client.channels.get(data.echnl).fetchMessage(row.msgId);
            mess.delete();
          });
        });
      });
    },
  },
  election: {
    desc: "Shows you some stats for elections",
    usage: " [candidates or voters] (page num)",
    cat: "election",
    do: (msg, content) => {
      db.get("SELECT * FROM elections ORDER BY end DESC", (err, elec) => {
        if(!elec || elec.end < new Date().valueOf())
          return msg.reply("An election isn't running");
        let type = content.split(" ")[0] || "candidates",
            page = !isNaN(Number(content.split(" ")[1])) && Number(content.split(" ")[1]) > 0 ? Number(content.split(" ")[1]) - 1 : 0;
        switch (type) {
          case "presidents":
          case "pres":
          case "cands":
          case "candidate":
          case "candidates":
            db.all("SELECT * FROM election", (err, res) => {
              let embed = new Discord.RichEmbed()
                .setAuthor("Candidates " + (res.length <= 10 ? "(All)" : `(Page: ${page + 1})`), msg.guild.iconURL)
                .setColor(f.color())
                .setFooter(`Check #elections for more info | 10 candidates per page | ${res.length} candidates`);
              
              if(res.length === 0)
                embed.setDescription("No candidates (yet)!")
              else
                f.page_maker(res, 10, res.length <= 10 ? 0 : 1, (i, row) => {
                  embed.addField(`${row.num}. ${client.users.get(row.id).tag}`, `**Vice:** ${client.users.get(row.vId).tag} (ID: \`${row.vId}\`)\n**Votes:** ${row.votes} votes`);
                });
              
              msg.channel.send(embed);
            });
            break;
          case "v":
          case "vote":
          case "voters":
            db.all("SELECT * FROM voters WHERE election = " + elec.num, (err, res) => {
              let embed = new Discord.RichEmbed()
                .setAuthor("Voters " + (res.length <= 10 ? "(All)" : `(Page: ${page + 1})`), msg.guild.iconURL)
                .setColor(f.color())
                .setFooter(`Check #elections for more info | 10 voters per page | ${res.length} voters`);
              
              if(res.length === 0)
                embed.setDescription("No voters (yet)!")
              else
                f.page_maker(res, 10, res.length <= 10 ? 0 : 1, (i, row) => {
                  embed.addField(client.users.get(row.id).tag, `**For:** ${client.users.get(row.for).tag}\n**When:** ${new Date(row.date).toUTCString()}`);
                });
              
              msg.channel.send(embed);
            });
            break;
          default:
            return msg.reply("The first parameter has to be either `candidates` or `voters`")
        }
      });
    },
  },
  
  // For testing purposes
  run: {
    a: ["eval"],
    desc: "Runs code through Clyde",
    usage: " [code]",
    cat: "bot admin",
    perms: "bot admin",
    hidden: true,
    do: async (msg, content) => {
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
  testtrivia: {
    a: ["tt"],
    desc: "Mimics a trivia question(for testing purposes)",
    cat: "bot admin",
    perms: "bot admin",
    hidden: true,
    async do (msg, content) {
      
          // Question related variables
      let question = (await globalfunctions.get_question(31, f.random(0, 3, true), 0)).results[0], correct,
      
          // Answer-related variables
          answers = [question.correct_answer].concat(question.incorrect_answers), string = "", answered,
      
          exp = [1000, 2500, 10000][["easy", "medium", "hard"].indexOf(question.difficulty)];
      
      // Shuffles the answer in with the incorrect so it isn't always the first choice
      answers = answers.shuffle();
      
      // Makes a string we can use for showing the answers
      for(let i = 0; i < answers.length; i ++)
        string += `    **${i + 1}.** ${answers[i].replace(/&quot;/g, '"').replace(/&#039;/g, "'")}\n`;
      
      // Created an embed for us to use later
      let embed = new Discord.RichEmbed().setAuthor(question.question.replace(/&quot;/g, '"').replace(/&#039;/g, "'"), msg.author.avatarURL)
        .setDescription(`**Answers:**\n${string}`)
        .setColor(f.color())
        .addField("Stats", `**Difficulty:** ${question.difficulty}\n**Category:** ${question.category}`, true)
      
      // Sends the message and stores it so we can edit it later
      let mess = await msg.channel.send(embed.setFooter("You have 15 seconds left")),
          
          // Max time we get to answer the question
          timer = 15000,
          
          // Edits the message each second showing how much time we have.
          int = setInterval(() => {
            timer -= 1000;
            if(timer > 999)
              mess.edit(embed.setFooter(`You have ${timer/1000} seconds left`))
            else {
              if(!correct)
                mess.edit(embed.setDescription("_  _" + string + `\nBTW, ${answers.indexOf(question.correct_answer.replace(/&quot;/g, '"').replace(/&#039;/g, "'")) + 1} was the right one`).setFooter(""));
              else
                mess.edit(embed.setDescription("Great Job, you got it right!").setFooter(""));
              clearInterval(int);
            }
            
          }, 1000);
      
      // Creates a message collector so we can get the next message the person sends immediately
      let collect = msg.channel.createMessageCollector(m => ["1", "2", "3", "4", "one", "two", "three", "four"].includes(m.content.toLowerCase()) && m.author.id == msg.author.id, { maxMatches: 1, time: timer });
      
      // When it collects the answer
      collect.on("collect", m => {
        
        // Determines your answer
        answered = [["1", "one"], ["2", "two"], ["3", "three"], ["4", "four"]];
        for(var i = 0; i < answered.length; i ++) {
          if(answered[i].includes(m.content.toLowerCase())) {
            answered = answers[i];
          }
        }
        
        // Deterines if you got it right or wrong
        correct = answered === question.correct_answer;
        
        // If correct, send a message that you got it right, and edit the embed
        if(correct)
          return msg.reply("You got it right!") && mess.edit(embed.setDescription("Great Job, you got it right!").setFooter(""));
        
        // If wrong, send a message that you got it wrong, then edit the embed
        else
          return msg.reply("You got it wrong :P") && mess.edit(embed.setDescription("_  _" + string + `\nBTW, ${answers.indexOf(question.correct_answer.replace(/&quot;/g, '"').replace(/&#039;/g, "'")) + 1} was the right one`).setFooter(""));
        
        // Destroys the interval so the bot is spared
        clearInterval(int);
      })
      
      // If the person ran out of time
      collect.on("end", c => {
        if(!answered)
          msg.reply("You ran out of time... :P");
      });
    },
  },
  testimage: {
    a: ['ti'],
    desc: "For testing image production",
    usage: " [type] (parameters)",
    cat: "bot admin",
    perms: "bot admin",
    hidden: true,
    do: async (msg, content) => {
      let canvas, ctx;
      switch(content.split(" ")[0]) {
        case "hello":
          canvas = createCanvas(400, 100),
            ctx = canvas.getContext("2d");
          
          // Background
          let { body: buffer } = await snekfetch.get("https://png.pngtree.com/thumb_back/fw800/back_pic/03/70/42/7957b6808adc0e9.jpg"),
              img = await loadImage(buffer);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          // Displays user tag
          ctx.font = "50px sans-serif";
          ctx.fillStyle = "#000000";
          for(let i = 0; i < 360; i += 20) {
            ctx.fillText(msg.author.tag + "!", canvas.width/2 - ctx.measureText(msg.author.tag + "!").width/2 + Math.sin(i) * 3, canvas.height/2 + 20 + Math.cos(i) * 3);
          }
          ctx.fillStyle = "#ffffff";
          ctx.fillText(msg.author.tag + "!", canvas.width/2 - ctx.measureText(msg.author.tag + "!").width/2, canvas.height/2 + 20);

          // Says "Hello,"
          ctx.font = "20px sans-serif";
          ctx.fillStyle = "#000000";
          for(let i = 0; i < 360; i += 20) {
            ctx.fillText("Hello,", canvas.width/2 - ctx.measureText("Hello,").width/2 + Math.sin(i) * 3, 25 + Math.cos(i) * 3);
          }
          ctx.fillStyle = "#ffffff";
          ctx.fillText("Hello,", canvas.width/2 - ctx.measureText("Hello,").width/2, 25);

          msg.channel.send(new Discord.Attachment(canvas.toBuffer(), "test-image.png"));
          break;
        case "profile":
          let canvas = createCanvas(400, 200),
                ctx = canvas.getContext("2d");
          
          // Starts typing to indicate that its calculating something
          msg.channel.startTyping();
          
              // User ID
          let id = f.get_id(msg, content.slice(content.indexOf(" ") + 1)) || msg.author.id,
              
              // Gets all the exp stats from your profile
              stats = await f.calculate_stats(id) || {},
              
              // Gets the user so we can use the data later
              user = id === msg.author.id ? msg.author : await client.fetchUser(id),
              
              // Excludes all values except the ones that have more points than the requested user's real points
              bar_exp = levels.getObj(stats.realpoints, "points", true) || [{ points: 0 }, { points: stats.realpoints }],
          
              // The background
              { body: buffer2 } = await snekfetch.get("https://i.pinimg.com/originals/90/cd/dc/90cddc7eeddbac6b17b4e25674e9e971.jpg"),
              bg = await loadImage(buffer2),
              
              // User's Avatar
              { body: buffer3 } = await snekfetch.get(user.displayAvatarURL),
              avatar = await loadImage(buffer3);
          
          // Background
          ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
          
          // Boxes for stats to be put on
          ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
          f.round_rect(ctx, 20, 100, canvas.width - 40, canvas.height - 120, { tl: 4, br: 4, bl: 4 }, true, false);
          f.round_rect(ctx, 100, 20, canvas.width - 120, 80, { tl: 4, tr: 4 }, true, false);
          
          // Exp Bar
          let p = [180, 30, canvas.width - 210, 25, 3, (stats.realpoints - bar_exp[0].points) / (bar_exp[1].points - bar_exp[0].points) <= 1 ? (stats.realpoints - bar_exp[0].points) / (bar_exp[1].points - bar_exp[0].points) : 1];
          ctx.fillStyle = "rgb(255, 255, 255)";
          ctx.strokeStyle = "rgb(150, 150, 150)";
          ctx.lineWidth = 4;
          ctx.strokeRect(p[0], p[1], p[2], p[3]);
          ctx.fillRect(p[0], p[1], p[2], p[3]);
          ctx.fillStyle = "rgba(0, 100, 250, 0.4)";
          ctx.fillRect(p[0] + p[4], p[1] + p[4], (p[2] - p[4]*2) * (p[5]), p[3] - p[4] * 2);
          
          // Text
          ctx.fillStyle = "rgba(50, 50, 50, 0.7)";
          ctx.font = "bold 12px monospace";
          let text = `${stats.realpoints} Points`;
          ctx.fillText(text, p[0] + p[2]/2 - ctx.measureText(text).width/2, p[1] + p[3]/2 + 4);
          
          // Level text
          let text2 = "Level " + levels.indexOf(bar_exp[0]);
          let { font: font1, size: size1 } = f.autofont(text2, canvas, 105, 175, 30, { before: "bold", after: "Arial" });
          ctx.font = font1;
          ctx.fillText(text2, 140 - ctx.measureText(text2).width/2, 42 + size1/2);
          
          // Avatar
          ctx.save();
          f.round_rect(ctx, 10, 10, 85, 85, 4, false, false);
          ctx.clip();
          ctx.drawImage(avatar, 10, 10, 85, 85);
          
          // Labels avatar with user tag
          let { font: font2, size: size2 } = f.autofont(user.tag, canvas, 20, 85, 12, { before: "bold", after: "Arial" });
          ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
          ctx.font = font2;
          f.round_rect(ctx, 85 - ctx.measureText(user.tag).width, 95 - size2 - size2/4, ctx.measureText(user.tag).width + 10, size2 + size2/4, { tl: 4 }, true, false);
          ctx.fillStyle = "rgb(50, 50, 50)";
          ctx.fillText(user.tag, 90 - ctx.measureText(user.tag).width, 95 - size2/4);
          
          // Stops typing to show its done calculating
          msg.channel.stopTyping();
          
          // Sends the image
          msg.channel.send(`📃 **| Here is ${id === msg.author.id ? "your" : user.tag + "'s"} profile**`, new Discord.Attachment(canvas.toBuffer(), "profile.png"));
          break;
        default:
          cmds.testimage.do(msg, "profile " + content.slice(content.indexOf(" ") + 1));
      }
    },
  },
};

// Exports a function that runs Clyde
module.exports = run;