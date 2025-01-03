const db = new (require("sqlite3").verbose()).Database('./.data/sqlite.db');
const cdata = require("./d.js"), levels = require("./l.js");
const fs = require("fs");
const https = require("https");

const f = {
  
  // SQL stuff
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
        items: [],
        quests: [],

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
  add_exp(id, exp) {
    db.get(`SELECT * FROM users WHERE id = "${id}"`, (err, res) => {
      if(!res)
        return console.log("Created user: " + id) && db.run(`INSERT INTO users (id, points, realpoints, messages, created) VALUES ("${id}", 0, 0, 0, ${new Date().valueOf()})`);
      if(exp < 0 && res.points + exp < 0)
        exp = - res.points;
      db.run(`UPDATE users SET points = ${res.points + exp} WHERE id = "${id}"`);
    });
    return this;
  },// Adds EXP to a person
  get(statement) {
    console.log(statement);
    return new Promise((res, rej) => {
      db.all(statement, (err, data) => {
        if(err)
          rej(err);
        if(statement.includes(/ WHERE [0-9a-zA-Z]+ = [0-9a-zA-Z]+/g) && data.length === 1)
          res(data[0]);
        res(data);
      })
    });
  },
  
  // Canvas functions
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
  circle(ctx, x, y, radius, color) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI*2, true);
    ctx.closePath();
    ctx.fill();
  },
  autofont(msg, canvas, x, mX, size = 70, addons) {
    let ctx = canvas.getContext("2d");

    // Sizes the text size down to fit space
    do { ctx.font = `${addons.before || ""} ${size -= 1}px ${addons.after || "arial"}`; } while(ctx.measureText(msg).width + x > mX);

    // Returns size
    return { font: ctx.font, size: size };
  },
  
  // Global stuff for anything
  random(min, max, round) {
    return round ? Math.round(Math.random() * (max-min) + min) : Math.random() * (max-min) + min;
  },// Simplifies "Math.random()"
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
  time(time, type) {
    if(type)
      type = type.toLowerCase();
    
    function gnfs(str, num) {
      if(num < 1)
        return false;
      
      let ntg = num;
      if(ntg > 3)
        ntg = 3;
      
      let nstr = str.slice(num - ntg, num);
      if(nstr.length === 1)
        return !isNaN(Number(nstr)) ? Number(nstr) : false;
      else if(nstr.length === 2) {
        if(!isNaN(Number(nstr)))
          return Number(nstr);
        return !isNaN(Number(nstr.slice(1))) ? Number(nstr.slice(1)) : false
      } else {
        for(let i = 0; i < nstr.length; i ++) {
          let strn = nstr.slice(i);
          if(!isNaN(Number(strn)))
            return Number(strn);
        }
        return false;
      }
    }
    function dbldigit(num) {
      if(isNaN(Number(num)))
        return false;
      
      return String(num).length === 1 ? "0" + num : String(num).slice(-2, String(num).length);
    }
    if(!time)
      return { gnfs, dbldigit };
    
    if(typeof time === "string") {
      if(time[0] === "P") {
        if(time.startsWith("PT")) {
          time = time.slice(2);
        } else
          time = time.slice(1);
        
        let str = time,
            dys = gnfs(str, str.indexOf("DT")),
            hrs = gnfs(str, str.indexOf("H")),
            mns = gnfs(str, str.indexOf("M")),
            scs = gnfs(str, str.indexOf("S"));
        time = 0;
        
        if(dys)
          time += dys * 8.64e7;
        if(hrs)
          time += hrs * 3.6e6;
        if(mns)
          time += mns * 6e4;
        if(scs)
          time += scs * 1e3;
        
        if(type === "ms")
          return time;
        if(type === "s")
          return Math.round(time / 1000);
      } else if(time.includes(":")) {
        time = time.split(":");
        let hrs = 0, mins = 0, secs = 0;
        switch(time.length) {
          case 2:
            time = (Number(time[0]) * 60 + Number(time[1])) * 1000;
            break;
          case 3:
            time = (Number(time[0]) * 3600 + Number(time[1]) * 60 + Number(time[2])) * 1000;
            break;
          default:
            return false;
        }
        
        if(isNaN(time))
          return false;
      } else if(!isNaN(Number(time)))
        time = Number(time);
    } else if(typeof time !== "number")
      return false;
    
    let x = time;
    let ms = Math.floor(x % 1000);
    x /= 1000;
    let s = Math.floor(x % 60);
    x /= 60;
    let m = Math.floor(x % 60);
    x /= 60;
    let h = Math.floor(x % 24);
    x /= 24;
    let d = Math.floor(x);
    
    if(typeof type === "string") {
      if(type === "s")
        return Math.round(time / 1000);
      if(type === "ms")
        return time;
      
      let str = type;
      
      str = str.replace(/hh/g, dbldigit(h));
      str = str.replace(/mm/g, dbldigit(m));
      str = str.replace(/ss/g, dbldigit(s));
      str = str.replace(/h/g, h);
      str = str.replace(/m/g, m);
      str = str.replace(/s/g, s);
      str = str.replace(/ms/g, ms);
      str = str.replace(/H/g, time / 3.6e6);
      str = str.replace(/M/g, time / 6e5);
      str = str.replace(/S/g, time / 1000);
      str = str.replace(/MS/g, time);
      
      if(str !== type)
        return str;
    }

    //Shortens the time message by clearing unnecessary things
    let timeStuff = "";
    if (d > 0) {
      timeStuff += `${d} day${(d > 1 ? "s" : "") + ((h > 0 || m > 0 || s > 0) ? ", " : "")}, `;
    } if (h > 0) {
      timeStuff += `${h} hour${(h > 1 ? "s" : "") + ((m > 0 || s > 0) ? ", " : "")}`;
    } if (m > 0) {
      timeStuff += `${m} minute${(m > 1 ? "s" : "")  + (s > 0 ? ", " : "")}`;
    } if (s > 0) {
      timeStuff += `${(d > 0 || h > 0 || m > 0) ? "and " : ""}${s} second${s > 1 ? "s" : ""}`;
    } return timeStuff;
  },
  bytes(bytes) {
    if(bytes > 1000000)
      return `${(bytes/1000000).toFixed(1)} MB`;
    else if(bytes > 1000)
      return `${(bytes/1000).toFixed(1)} KB`;
    else
      return `${bytes} bytes`;
  },
  get_val(obj, str) {
      let v = obj; str = str.split(".");
      for(let i = 0; i < str.length; i ++) {
        if(v[str[i]])
          v = v[str[i]];
        else return undefined;
      }
      return v;
    },
  getLevel(points) {},
  
  // Discord stuff
  has_roles(member, role_name = ["Moderator"]) {
    if(typeof role_name === "string")
      role_name = [role_name];
    for(let i of role_name) {
      if(!member.roles.map(r => r.name).includes(i))
        return false;
    }
    return true;
  },// Checks if a user has the roles.
  get ecol() {
    return Math.round(Math.random() * 16777215);
  },// Randomizes a color for a discord embed
  eclean(string) {
    if (typeof(string) === "string")
      return string.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
    else
      return string;
  },// cleans Eval
  get_id(msg, text, per) {
    if(!text || text === "")
      return false;
    
    let id = text.replace(/[^0-9]/g, ""), person, members = msg.guild.members;
    if(id.length === 18)
      return id;
    else if(text.includes("#") && text.split("#")[1].trim().length === 4)
      person = members.filter(m => m.user.tag.toLowerCase() === text.toLowerCase()).first();
    else {
      person = members.filter(m => m.user.username.toLowerCase() === text.toLowerCase() || (m.nickname ? m.nickname : "").toLowerCase() === text.toLowerCase()).first();
      if(!person)
        person = members.filter(m => m.user.username.toLowerCase().startsWith(text.toLowerCase()) || (m.nickname ? m.nickname.toLowerCase().startsWith(text.toLowerCase()) : false)).first();
    }
    
    // If it asks for the entire user object
    if(per === "u")
      return person.user;
    if(per)
      return person;
    
    return person && person.id;
  },// Gets the ID or object of a member form a name.

  // Gets JSON from a URL
  parseURL(url) {
    return new Promise((resolve, reject) => {
      https
        .get(url, res => {
          var data = "";
          res.on("data", chunk => {
            data += chunk;
          });
          res.on("end", () => {
            try {
              var json = JSON.parse(data);
              resolve(json);
            } catch (error) {
              reject(error);
              console.log(data);
            }
          });
        })
        .on("error", error => {
          reject(error);
        });
    });
  },

  // Trivia Functions
  qclean(text) {
    return decodeURIComponent(text)
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'");
  },
  async get_categories() {
    let data = await f.parseURL("https://opentdb.com/api_category.php");
    return data.trivia_categories;
  },
  async get_question(cat, diff, type) {
    let url = "https://opentdb.com/api.php?amount=1";
    if (cat && cat <= 32 && cat >= 9) url += "&category=" + ~~cat;
    if ([0, 1, 2].includes(diff))
      url += "&difficulty=" + ["easy", "medium", "hard"][diff];
    if ([0, 1].includes(type)) url += "&type=" + ["multiple", "boolean"][type];
    let q = await f.parseURL(url);
    if (q.response_code !== 0) throw new Error(q);
    return q.results[0];
  }
};

f.get.elections = function(election, add) {
  return this(
    `SELECT * FROM elections${(election && ` WHERE num = ${election}`) ||
      ""}${(add && " ") + add || ""}`
  );
};
f.get.election = function(add) {
  return this(`SELECT * FROM election${(add && " ") + add || ""}`);
};
f.get.users = function(id, add) {
  return this(
    `SELECT * FROM users${(id && ` WHERE num = ${id}`) || ""}${(add &&
      " " + add) ||
      ""}`
  );
};
f.get.blacklist = function(id, add) {
  return this(
    `SELECT * FROM blacklist${(id && ` WHERE num = ${id}`) || ""}${(add &&
      " " + add) ||
      ""}`
  );
};
f.get.warns = function(id, add) {
  return this(
    `SELECT * FROM warns${(id && ` WHERE num = ${id}`) || ""}${(add &&
      " " + add) ||
      ""}`
  );
};

module.exports = f;