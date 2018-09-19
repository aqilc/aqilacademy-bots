const db = new (require("sqlite3").verbose()).Database('./.data/sqlite.db');
const cdata = require("./d.js");
const fs = require("fs");
const moment = require("moment");
const https = require("https");

module.exports = {
  
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
              
              stats.items = JSON.parse(res[i].items);
              stats.quests = JSON.parse(res[i].quests);
              delete res[i].id, res[i].items, res[i].quests;
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
  add_exp: (id, exp) => {
    db.get(`SELECT * FROM users WHERE id = "${id}"`, (err, res) => {
      if(!res)
        return console.log("Created user: " + id) && db.run(`INSERT INTO users (id, points, realpoints, messages, created) VALUES ("${id}", 0, 0, 0, ${new Date().valueOf()})`);
      if(exp < 0 && res.points + exp < 0)
        exp = - res.points;
      db.run(`UPDATE users SET points = ${res.points + exp} WHERE id = "${id}"`);
    });
    return this;
  },// Adds EXP to a person
  
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
          let strn = nstr.slice(nstr.length - i);
          if(!isNaN(Number(strn)))
            return Number(strn);
        }
        return false;
      }
    }
    if(!time)
      return { gnfs: gnfs };
    
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
    
    let x = time / 1000;
    let s = Math.floor(x % 60);
    x /= 60;
    let m = Math.floor(x % 60);
    x /= 60;
    let h = Math.floor(x % 24);
    x /= 24;
    let d = Math.floor(x);
    
    if(type === "s")
      return time/1000;
    if(type === "ms")
      return time;
    if(type === "m:s")
      return m + ":" + s;
    if(type === "h:m:s")
      return h + ":" + m + ":" + 

    //Shortens the time message by clearing unnecessary things
    let timeStuff = "";
    if (d > 0){
      timeStuff += `${d} day${(d > 1 ? "s" : "") + ((h > 0 || m > 0 || s > 0) ? ", " : "")}, `;
    } if (h > 0){
      timeStuff += `${h} hour${(h > 1 ? "s" : "") + ((m > 0 || s > 0) ? ", " : "")}`;
    } if (m > 0){
      timeStuff += `${m} minute${(m > 1 ? "s" : "")  + (s > 0 ? ", " : "")}`;
    } if (s > 0) {
      timeStuff += `${(d > 0 || h > 0 || m > 0) ? "and " : ""}${s} second${s > 1 ? "s" : ""}`;
    }
    return timeStuff;
  },
  bytes(bytes) {
    if(bytes > 1000000)
      return `${(bytes/1000000).toFixed(1)} MB`;
    else if(bytes > 1000)
      return `${(bytes/1000).toFixed(1)} KB`;
    else
      return `${bytes} bytes`;
  },
  
  // Discord stuff
  has_roles(member, role_name = ["Moderator"]) {
    if(typeof role_name === "string")
      role_name = [role_name];
    for(let i of role_name) {
      if(!member.roles.map(r => r.name).includes(i))
        return false;
    }
    return true;
  },// Checks if a user has the roles
  get_id(msg, text, per) {
    if(!text || text === "")
      return false;
    if(text === "me")
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
    
    // If it asks for the entire user object
    if(per)
      return person;
    
    return person.id;
  },
  get ecol() {
    return Math.round(Math.random() * 16777215);
  },
  eclean(string) {
    if (typeof(string) === "string")
      return string.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
    else
      return string;
  },
  
  // Gets JSON from a URL
  parseURL(url) {
    return new Promise((resolve, reject) => {
      https.get(url, (res) => {
        var data = "";
        res.on("data", (chunk) => { data += chunk; });
        res.on("end", () => {
          try {
            var json = JSON.parse(data);
            resolve(json);
          } catch(error) {
            reject(error);
            console.log(data);
          }
        });
      }).on("error", (error) => {
        reject(error);
      });
    });
  },
  
  // Trivia Functions
  qclean(text) {
    return text
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/&eacute;/g, "é");
  },
  async get_categories() {
    let data = await require("./f.js").parseURL("https://opentdb.com/api_category.php");
    return data.trivia_categories;
  },
  async get_question(cat, diff, type) {
    let url = "https://opentdb.com/api.php?amount=1";
    if(cat && cat <= 32 && cat >= 9)
      url += "&category=" + ~~ cat;
    if([0, 1, 2].includes(diff))
      url += "&difficulty=" + ["easy", "medium", "hard"][diff];
    if([0, 1].includes(type))
      url += "&type=" + ["multiple", "boolean"][type];
    return require("./f.js").parseURL(url);
  },
};
