
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./.data/sqlite.db');

// All Functions
const f = ( prefix, cmds, client, data ) => {
  return {
    
    
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
    },// Adds EXP to a person
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
    },// Adds a "message"'s amount of stuff to a person
    random: (min, max, round) => {
      return round ? Math.round(Math.random() * (max-min) + min) : Math.random() * (max-min) + min;
    },// Simplifies "Math.random()"
    has_roles: (member, role_name = ["Moderator"]) => {
      if(typeof role_name === "string")
        role_name = [role_name];
      let has = true;
      for(let i of role_name) {
        if(!member.roles.map(r => r.name).includes(i))
          has = false;
      }
      return has;
    },// Checks if a user has the roles
    warn: (mId, id, reason = "Unknown", severity = 1) => {
      db.run(`INSERT INTO warns (warn, user, mod, severity, date) VALUES ("${reason}", "${id}", "${mId}", ${severity}, ${new Date().valueOf()})`);
      client.users.get(id).send(new Discord.RichEmbed().setAuthor("You have been warned in AqilAcademy by " + client.users.get(mId).tag, client.users.get(mId).avatarURL).setDescription(reason).setColor(f.color()).setFooter(`Severity(Level of warn): ${severity}`));
    },// Adds a warn to a user
    get_id: (msg, text) => {
      if(!text || text === "")
        return false;
      if(msg === "me")
        return msg.author.id;

      let id = text.replace(/[^0-9]/g, ""), person;
      if(id.length === 18)
        return id;
      else if(text.includes("#") && text.split("#")[1].trim().length === 4)
        person = msg.guild.members.array().filter(m => m.user.tag.toLowerCase() === text.toLowerCase())[0];
      else {
        person = msg.guild.members.array().filter(m => m.user.username.toLowerCase() === text.toLowerCase() || (m.nickname ? m.nickname : "").toLowerCase() === text.toLowerCase())[0];
        if(!person)
          person = msg.guild.members.array().filter(m => m.user.username.toLowerCase().startsWith(text.toLowerCase()) || (m.nickname ? m.nickname.toLowerCase().startsWith(text.toLowerCase()) : false))[0];
      }
      if(person)
        return person.id;
      return false;
    },
    calculate_stats: (id) => {
      if(!client.users.get(id))
        return false;

      return new Promise(function(resolve, reject) {
        let stats = {
          elections_won: 0,

          realpoints: 0,
          points: 0,
          messages: 0,
          created: 0,
          streak: 0,
          lastDaily: 0,
          leaderboard_place: 1,

          blacklisted: false,

          warns: [],
          severity: 0,
        };
        db.all(`SELECT * FROM users ORDER BY points DESC`, (err, res) => {
          if(!res.filter(r => r.id === id)[0])
            stats.leaderboard_place = res.length + 1;
          else {
            for(let i = 0; i < res.length; i ++) {
              if(res[i].id === id) {
                stats.leaderboard_place = i + 1;

                delete res[i].id;
                for(let j in res[i])
                  stats[j] = res[i][j];
              }
            }
          }

          db.all(`SELECT * FROM warns WHERE user = "${id}"`, (error, warn) => {
            if(warn)
              warn.forEach((w) => { stats.severity += w.severity; });
            stats.warns = warn;
            db.get(`SELECT * FROM blacklist WHERE id = "${id}"`, (er, black) => {
              if(black)
                stats.blacklisted = true;

              db.get(`SELECT * FROM elections WHERE winner = "${id}"`, (err, elecs) => {
                stats.elections_won = elecs ? elecs.length : 0;
                resolve(stats);
              });
            });
          });
        });
      });
    },
    round_rect: (ctx, x, y, width, height, radius, fill, stroke) => {
      if (typeof stroke == 'undefined') {
        stroke = true;
      }
      if (typeof radius === 'undefined') {
        radius = 5;
      }
      if (typeof radius === 'number') {
        radius = {tl: radius, tr: radius, br: radius, bl: radius};
      } else {
        var defaultRadius = {tl: 0, tr: 0, br: 0, bl: 0};
        for (let side in defaultRadius) {
          radius[side] = radius[side] || defaultRadius[side];
        }
      }
      ctx.beginPath();
      ctx.moveTo(x + radius.tl, y);
      ctx.lineTo(x + width - radius.tr, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
      ctx.lineTo(x + width, y + height - radius.br);
      ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
      ctx.lineTo(x + radius.bl, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
      ctx.lineTo(x, y + radius.tl);
      ctx.quadraticCurveTo(x, y, x + radius.tl, y);
      ctx.closePath();
      if (fill) {
        ctx.fill();
      }
      if (stroke) {
        ctx.stroke();
      }
    },
    autofont: (msg, canvas, x, mX, size = 70, addons) => {
      let ctx = canvas.getContext("2d");

      // Sizes the text size down to fit space
      do { ctx.font = `${addons.before || ""} ${size -= 1}px ${addons.after || "arial"}`; } while(ctx.measureText(msg).width + x > mX);

      // Returns size
      return { font: ctx.font, size: size };
    },
  };
};

module.exports = f;