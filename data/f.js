const db = new (require("sqlite3").verbose()).Database('./.data/sqlite.db');
const cdata = require("./cd.js");

module.exports = {
  calculate_stats(id) {
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
  round_rect(ctx, x, y, width, height, radius, fill, stroke) {
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
  autofont(msg, canvas, x, mX, size = 70, addons) {
    let ctx = canvas.getContext("2d");

    // Sizes the text size down to fit space
    do { ctx.font = `${addons.before || ""} ${size -= 1}px ${addons.after || "arial"}`; } while(ctx.measureText(msg).width + x > mX);

    // Returns size
    return { font: ctx.font, size: size };
  },
  get_id(msg, text) {
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
  random(min, max, round) {
    return round ? Math.round(Math.random() * (max-min) + min) : Math.random() * (max-min) + min;
  },// Simplifies "Math.random()"
  has_roles(member, role_name = ["Moderator"]) {
    if(typeof role_name === "string")
      role_name = [role_name];
    let has = true;
    for(let i of role_name) {
      if(!member.roles.map(r => r.name).includes(i))
        has = false;
    }
    return has;
  },// Checks if a user has the roles
  add_exp: (id, exp) => {
    db.get(`SELECT * FROM users WHERE id = "${id}"`, (err, res) => {
      if(!res)
        return console.log("Created user: " + id) && db.run(`INSERT INTO users (id, points, realpoints, messages, created) VALUES ("${id}", 0, 0, 0, ${new Date().valueOf()})`);
      db.run(`UPDATE users SET points = ${res.points + exp} WHERE id = "${id}"`);
    });
    return this;
  },// Adds EXP to a person
  page_maker(array, num = 10, page = 0, func) {
    if(func && typeof func === "function") {
      for(var i = 0; i < array.slice(page*num, page*num + num).length; i ++) {
        func(i + page*num, array.slice(page*num, page*num + num)[i]);
      }
      return this;
    }
    else
      return false;
  },
}