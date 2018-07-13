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

// Logs in
client.login(process.env.TOKENM);

// A function for the whole bot to run on
function run() {

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
    
    // Returns if the message is obviously not a command
    if(!message.content.startsWith(prefix))
      return;
    
    // Blocks all non-admins from using the bot
    if(!["294115380916649986"].includes(message.author.id))
      return message.reply("This bot is still in production. Please wait for it to be fully developed");
    
    // Does commands
    for(let i in c) {
      let cmd = message.content.slice(prefix.length).split(" ")[0];
      if(c !== cmd && !c.a.includes(cmd))
        continue;
      
      c[cmd].f(message, message.content.slice(prefix.length + cmd.length).trim());
    }
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
  
  getId(url) {
    if(yt.validateID(url) || yt.validateURL(url))
      return yt.getVideoID(url);
    
    return false;
  },
  
  // Searches a video from YouTube and returns it... or adds it into the queue
  search(message, search, info = { add: false, info: false }) {
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
          if(info.add)
            this.add(json.items[0].id.videoId, message);
          
          if(info.info) {
          
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
  test: {
    f: (msg, content) => {
      if(!m.getId(content))
        return msg.channel.send("Not a valid URL");
      
      msg.channel.startTyping();
      let stream = yt(content, { filter : 'audioonly' });
      let aData = [];

      stream.on('data', function(data) {
        aData.push(data);
      });

      stream.on('end', function() {
        let buffer = Buffer.concat(aData);
        let title = "nightcore";//results[0].replace(/[^a-zA-Z0-9]/g,'_');
        msg.channel.stopTyping();
        msg.channel.send({
          files: [
            {
              attachment: buffer,
              name: `${title}.mp3`
            }
          ]
        });
      });
    }
  },
};

module.exports = run;