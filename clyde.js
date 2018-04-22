
//All requires and dependencies
const express = require('express');
const app = express();
const fs = require('fs');
const exists = fs.existsSync('./.data/sqlite.db');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./.data/sqlite.db');
const Discord = require("discord.js");

//The client
var client = new Discord.Client({ autoreconnect: true });

//All channels needed to run bot
const chnls = {
  a: "382353531837087745",
}

//Keeps app running
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});
app.listen(process.env.PORT);

// if ./.data/sqlite.db does not exist, create it, otherwise print records to console
db.serialize(function(){
  db.run("CREATE TABLE IF NOT EXISTS users (id TEXT, points INTEGER, lastDaily INTEGER, messages INTEGER, realpoints INTEGER)");
  db.run("CREATE TABLE IF NOT EXISTS warns (num INTEGER PRIMARY KEY, warn TEXT, mod TEXT, date INTEGER)");
  db.run("CREATE TABLE IF NOT EXISTS items (name TEXT, price TEXT, user TEXT)");
  db.run("CREATE TABLE IF NOT EXISTS expstore (num INTEGER PRIMARY KEY, item TEXT, desc TEXT, stock INTEGER, price INTEGER, approved TEXT, bought TEXT, seller TEXT, buyer TEXT)");
  db.run("CREATE TABLE IF NOT EXISTS elections (num INTEGER PRIMARY KEY, winner TEXT, end INTEGER, start INTEGER, vp TEXT)");
  db.run("CREATE TABLE IF NOT EXISTS election (num INTEGER PRIMARY KEY, id TEXT, vId TEXT, votes INTEGER, msgId TEXT)");
  db.run("CREATE TABLE IF NOT EXISTS voters (id TEXT, for TEXT, date INTEGER)");
  
});

var f = {
  checkelections: () => {
    db.all("SELECT * FROM elections ORDER BY end", (err, res) => {
      res.reverse();
      if(res[0].end > new Date().valueOf()) {
        setTimeout(() => {
          db.run("SELECT * FROM election ORDER BY votes", (err, res) => {
            let winner = "";
            let sqlwin = "";
            for(var i = 1; i < res.length; i ++) {
              if(res[i].votes === res[0].votes) {
                winner += `${i + 1}. ${client.users.get(res[i].id).tag}\n   Vice: ${client.users.get(res[i].vId).tag}`;
                sqlwin += ` ${res[i].id}`;
              }
            }
            client.guilds.get("294115797326888961").channels.get(chnls.a).send(`**:yes: The election has officially ended. Winner(s):**\`\`\`\n\`\`\``);
          })
        }, res[0].end - new Date().valueOf());
      }
    });
  }
};

const cmds = {
  
};

client.on("message", (message, channel) => {});
client.on("ready", () => { console.log(client.user.tag + " has started. Ready for action"); });