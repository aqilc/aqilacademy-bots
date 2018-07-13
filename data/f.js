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
  }
}