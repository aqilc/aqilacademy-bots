const fs = require("fs");
const exists = fs.existsSync('./.data/sqlite.db');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./.data/sqlite.db');
const http = require('http');
const https = require("https");
const express = require("express");
const app = express();
const functions = require("./data/f.js");
const bodyParser = require("body-parser");

// Keeps app and website running
app.listen(process.env.PORT);

// The Site add-ons, middleware, etc
app.use(express.static('public'));
app.use(express.static('node_modules/p5/lib'));
app.use(express.static('node_modules/p5/lib/addons'));
app.use(express.static('node_modules/sqlite3'));
app.use(express.static('data'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({	extended: true }));

// Keeps website and app up
app.get("/", (request, response) => {
  response.sendFile(__dirname + '/views/lb.html');
});
app.get("/lb", (req, res) => {
  res.sendFile(__dirname + "/views/lb.html");
});
app.get("/user/:id", (req, res) => {
  res.sendFile(__dirname + "/views/profile.html");
});
setInterval(() => {
  http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`);
}, 280000);

// if ./.data/sqlite.db does not exist, create it, and add tables
const tables = [
  
  // Universal
  "users (id TEXT, points INTEGER, lastDaily INTEGER, messages INTEGER, realpoints INTEGER, created INTEGER, streak INTEGER, tags TEXT)",
  "blacklist (user TEXT, reason TEXT, by TEXT, date INTEGER, time INTEGER)",

  // Clyde
  "warns (num INTEGER PRIMARY KEY, warn TEXT, user TEXT, mod TEXT, severity INTEGER, date INTEGER)",
  "expstore (num INTEGER PRIMARY KEY, item TEXT, desc TEXT, stock INTEGER, price INTEGER, approved TEXT, bought TEXT, seller TEXT, buyer TEXT)",
  "elections (num INTEGER PRIMARY KEY, winner TEXT, end INTEGER, start INTEGER, vp TEXT, title TEXT)",
  "election (num INTEGER PRIMARY KEY, id TEXT, vId TEXT, votes INTEGER, msgId TEXT, up TEXT)",
  "voters (id TEXT, for TEXT, date INTEGER, election INTEGER)",
  "suggestions (num INTEGER PRIMARY KEY, suggestion TEXT, by TEXT, votes TEXT, created INTEGER)",
  "waiting (user TEXT, id INTEGER, start INTEGER, time INTEGER, for TEXT, data TEXT)",

  // Music data tables
  "history (dat INTEGER, id TEXT, com TEXT, error NOT NULL)",
  "queue (addedAt INTEGER, vidId TEXT, title TEXT, desc TEXT, thumb TEXT, views TEXT, user TEXT, duration INTEGER)",
  
];
db.serialize(function() {
  for(let i of tables)
    db.run("CREATE TABLE IF NOT EXISTS " + i);
});

// Runs the 2 bots
let client = require("./bots/clyde/clyde.js")();
require("./bots/music/music.js")();

// API Responses
app.get("/db/get/users/:id", async (req, res) => {
  if(!req.params.id || (req.params.id !== "all" && req.params.id.length !== 18))
    res.status(400).send("No ID provided");
  
  if(req.params.id === "all")
    return db.all("SELECT * FROM users", async (err, users) => {
      for(let i = 0; i < users.length; i ++) {
        try {
          let user = client.users.get(users[i].id) || await client.fetchUser(users[i].id),
              nuser = {}, attr = ["tag", "username", "id", "avatar", "avatarURL", "bot", "discriminator", "displayAvatarURL", "lastMessageID", "presence", "send"];
          for(let i = 0; i < attr.length; i ++) {
            nuser[attr[i]] = user[attr[i]];
          }
          users[i].user = nuser;
        } catch(err) {
          console.log("Error sending user data: " + err);
          res.status(403).send(err);
        }
      }
      res.send(users);
    });
  
  let stats = Object.assign(client.users.get(req.params.id), await functions.calculate_stats(req.params.id));
  res.json(stats);
});
app.get("/db/get/black/", (req, res) => {
  db.all("SELECT * FROM blacklist", (err, b) => {
    res.json(b);
  });
});
app.put("/db/set/users/:id", (req, res) => {
  let q = req.query;
  if(!req.params.id)
    res.status(400).send("No ID to edit");
  let id = req.params.id;
  
  if(q === {})
    res.status(400).send(`Nothing to edit ${id} with`);
  
  let params = [];
  for(let i in q) {
    params.push(`${i} = ${q[i]}`);
  }
  db.run(`UPDATE users SET ${params.join(" ")} WHERE id = "${id}"`);
  res.redirect("/");
});

// Process calls
process.on('unhandledRejection', error => console.error('Uncaught Promise Rejection', error));

/*
const path = require('path');
const directoryPath = path.join(__dirname, 'data');
fs.readdir(directoryPath, function (err, files) {
    //handling error
    if (err) {
        return console.log('Unable to scan directory: ' + err);
    } 
    //listing all files using forEach
    files.forEach(function (file) {
        console.log(file); 
    });
});*/
