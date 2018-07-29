const fs = require("fs");
const exists = fs.existsSync('./.data/sqlite.db');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./.data/sqlite.db');
const http = require('http');
const https = require("https");
const express = require("express");
const app = express();
const functions = require("./data/f.js");

// Keeps app and website running
app.listen(process.env.PORT);
app.use(express.static('public'));
app.use(express.static('node_modules/p5/lib'));
app.use(express.static('node_modules/p5/lib/addons'));
app.use(express.static('data'));
app.get("/", (request, response) => {
  response.sendFile(__dirname + '/views/index.html');
});
setInterval(() => {
  http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`);
}, 280000);

// if ./.data/sqlite.db does not exist, create it, and add tables
const tables = [
  
  // Universal
  "users (id TEXT, points INTEGER, lastDaily INTEGER, messages INTEGER, realpoints INTEGER, created INTEGER, streak INTEGER)",
  "blacklist (user TEXT, reason TEXT, by TEXT, date INTEGER, time INTEGER)",

  // Clyde
  "warns (num INTEGER PRIMARY KEY, warn TEXT, user TEXT, mod TEXT, severity INTEGER, date INTEGER)",
  "items (num INTEGER PRIMARY KEY, id INTEGER, user TEXT)",
  "quests (num INTEGER PRIMARY KEY, do INTEGER, user TEXT)",
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
  for(var i of tables) {
    db.run("CREATE TABLE IF NOT EXISTS " + i);
  }
});

// Runs the 2 bots
require("./bots/clyde/clyde.js")();
require("./bots/music/music.js")();

// API Responses
app.get("/db/get/users/:id", (req, res) => {
  
});
app.put("/db/run/users/:id", (req, res) => {
  console.log("db/run/users: ID: " + JSON.stringify(req.query));
  
  let q = req.query;
  if(!req.params.id)
    res.status(400).send("No ID to edit");
  let id = req.params.id;
  
  if(q === {})
    res.status(400).send(`Nothing to edit ${id} with`);
  
  let params = [];
  for(let i in q) {
    params.push(`${i} = ${typeof q !== "string" ? q : `"${q}"`}`);
  }
  db.run(`UPDATE users SET ${params.join(" ")} WHERE id = "${id}"`);
  res.send("Successfully changed user");
});

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
