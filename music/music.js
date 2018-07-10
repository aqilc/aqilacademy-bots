// Constants
const http = require('http');
const Discord = require("discord.js");
const client = new Discord.Client();
const yt = require("ytdl-core");
const request = require("request");
const prefix = ["a."];

// Database stuff
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database('./.data/sqlite.db');

function run() {
  db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS history (dat INTEGER, id TEXT, com TEXT, error NOT NULL)");
    db.run("CREATE TABLE IF NOT EXISTS queue (addedAt INTEGER, vidId TEXT, title TEXT, desc TEXT, thumb TEXT, views TEXT, user TEXT, duration INTEGER)");
  });

  // Logs in
  client.login(process.env.TOKENM);

  // Client Events
  client.on("ready", () => console.log(`${client.user.tag} ID: ${client.user.id} logged in at ${new Date().toUTCString()}`));
  client.on("message", message => {

    // Lets the admins run code through the bot
    if(message.content.startsWith("a:")) {
      if(!["294115380916649986"].includes(message.author.id))
        message.reply("You don't have the permissions to run code in this bot");

      let ran;
      try {
        ran = eval(message.content.slice(2).trim());
      } catch(err) {
        ran = err;
      }

      return message.channel.send(new Discord.RichEmbed().setDescription(`**Output:**\`\`\`${eval}\`\`\``).setColor(f.r()));
    }

    // Returns if the user is the bot itself
    if(message.author.id === client.user.id)
      return;

    // Blocks all non-admins from using the bot
    if(!["294115380916649986"].includes(message.author.id) && prefix.includes(message.content.slice(0, 2)))
      return message.reply("This bot is still in production. Please wait for it to be fully developed");
  });
}

// Music Functions
const m = {
  // My YouTube API Key for searching videos from YouTube
  ytAk: process.env.YT,
  
  // Settings for the quild
  settings: {
    loop: false,
    handler: undefined,
    current_queue: [],
  },
  
  // Gets an id from a string
  getID(string) {
    let match = string.match(/(?:\?v=|&v=|youtu\.be\/)(.*?)(?:\?|&|$)/);
    
    if(match && match[1].length === 11)
      return match[1];
    return false;
  },
  
  // Searches a video from YouTube and returns it... or adds it into the queue
  search(message, search, add) {
    return new Promise(function (resolve, reject) {
      
      // Search for results
      request("https://www.googleapis.com/youtube/v3/search?part=id&type=video&q=" + encodeURIComponent(search) + "&key=" + this.ytAK, (error, response, body) => {
        var json = JSON.parse(body);
        
        // If it finds an error
        if("error" in json)
          reject(true, [json.error.errors[0].message, json.error.errors[0].reason]);
        
        // If it didn't find any videos
        else if(json.items.length === 0)
          reject(false, "No videos found using that criteria");
        
        // If all goes well...
        else {
          if(add)
            this.add(json.items[0].id.videoId, message);
          
          resolve(json.items[0].id.videoId);
        }
      });
    });
  },
  
  // Adds a song to queue
  add() {
    
  },
};

// Non-music functions
const f = {
  r: () => {
    return Math.round(Math.random() * 16777215);
  }
};

// Commands
const c = {
  
};

module.exports = run;