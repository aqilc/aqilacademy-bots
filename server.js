
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
var fs = require('fs');
var exists = fs.existsSync('./.data/sqlite.db');
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('./.data/sqlite.db');

// if ./.data/sqlite.db does not exist, create it, otherwise print records to console
db.serialize(function(){
  console.log(db);
});

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});
// listen for requests :)
app.listen(process.env.PORT);
