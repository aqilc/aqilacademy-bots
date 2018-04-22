
//All requires and dependencies
const express = require('express');
const app = express();
const fs = require('fs');
const exists = fs.existsSync('./.data/sqlite.db');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./.data/sqlite.db');
const Discord = require("discord.js");

//Election database
const low = require("lowdb");
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync("election.json");
const elec = low(adapter);

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
  db.run("CREATE TABLE IF NOT EXISTS election (num PRIMARY INTEGER KEY, id TEXT, vId TEXT, votes INTEGER, messageId TEXT");
  
});

var f = {
  checkelections: () => {
    if(elec.end > new Date().valueOf()) {
      setTimeout(() => {
        let winners = "";
        for(var i = 0; i < elec.candidates.length; i++) {
          elec.candidates
        }
        client.guilds.get("294115797326888961").channels.get(chnls.a).send(`**:yes: The election has officially ended. Winner(s):**\`\`\`\n\`\`\``);
      }, elec.end - new Date().valueOf());
    }
  }
};

const cmds = {
  
};

client.on("message", (message, channel) => {});
client.on("ready", () => { console.log(client.user.tag + " has started. Ready for action"); });