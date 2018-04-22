
//All requires and dependencies
const express = require('express');
const app = express();
const fs = require('fs');
const exists = fs.existsSync('./.data/sqlite.db');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./.data/sqlite.db');

//Keeps app running
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});
app.listen(process.env.PORT);

// if ./.data/sqlite.db does not exist, create it, otherwise print records to console
db.serialize(function(){
  db.run("CREATE TABLE IF NOT EXISTS users (id TEXT, points INTEGER, lastDaily INTEGER)");
  db.run("CREATE TABLE IF NOT EXISTS elections (num INTEGER PRIMARY KEY, start INTEGER, end INTEGER, going TEXT, winner TEXT)");
  db.run("CREATE TABLE IF NOT EXISTS warns (num INTEGER PRIMARY KEY, warn TEXT, mod TEXT, dat INTEGER)");
  db.run("CREATE TABLE IF NOT EXISTS items (name TEXT, price TEXT, user TEXT)");
  db.run("CREATE TABLE IF NOT EXISTS expstore (item TEXT, price TEXT, approv
});
