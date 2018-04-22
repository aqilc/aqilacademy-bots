
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
    db.all("SELECT * FROM elections", (err, res) => {
      if(res[res.length-1].end > new Date().valueOf()) {
        let winner = "";
        setTimeout(() => {
          db.run("SELECT * FROM election", (err, res) => {
            for(var i of res) {
              if(i.votes
            }
            client.guilds.get("294115797326888961").channels.get(chnls.a).send(`**:yes: The election has officially ended. Winner(s):**\`\`\`\n\`\`\``);
          })
        }, res[length-1].end - new Date().valueOf());
      }
    });
  }
};

const cmds = {
  
};

client.on("message", (message, channel) => {});
client.on("ready", () => { console.log(client.user.tag + " has started. Ready for action"); });