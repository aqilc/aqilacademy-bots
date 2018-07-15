// Constants
const http = require('http');
const https = require("https");
const Discord = require("discord.js");
const client = new Discord.Client();
const yt = require("ytdl-core");
const request = require("request");
const prefix = ["a."];
const gFuncs = require("/app/data/f.js");

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

      return message.channel.send(new Discord.RichEmbed().setDescription(`**Output:**\`\`\`${ran}\`\`\``).setColor(gFuncs.ecol()));
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
    try {
      let cmd = message.content.slice(prefix.length + 1).split(" ")[0];
      for(let i in c) {
        if(i === cmd || (c[i].a ? c[i].a : []).includes(cmd))     
          c[cmd].f(message, message.content.slice(prefix.length + cmd.length + 1).trim());
      }
    } catch(error) {
      console.log("Music error: " + error);
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
  
  id(url) {
    if(yt.validateID(url) || yt.validateURL(url))
      return yt.getVideoID(url);
    
    return false;
  },
  
  // Searches a video from YouTube and returns it... or adds it into the queue
  search(message, search, info = { results: 1, add: false, info: false }) {
    return new Promise(function (resolve, reject) {
      
      // Search for results
      request("https://www.googleapis.com/youtube/v3/search?part=id&type=video&q=" + encodeURIComponent(search) + "&key=" + m.ytAk, async (error, response, body) => {
        var json = JSON.parse(body);
        
        // If it finds an error
        if("error" in json)
          reject([json.error.errors[0].message, json.error.errors[0].reason], true);
        
        // If it didn't find any videos
        else if(json.items.length === 0)
          reject("No videos found using that criteria", false);
        
        // If all goes well...
        else {
          let vids = info && info.results > 1 ? json.items.splice(info.results).map(j => j.id.videoId) : json.items[0].id.videoId;
          
          if(info.add)
            m.add(vids, message);
          
          if(!info || !info.info)
            resolve(vids);
          
          let data = [];
          if(info && info.info) {
            if(!info || ~~ info.results <= 1)
              data = await m.info(json.items[0].id.videoId);
            else {
              do {
                data.push(await m.info(json.items[0].id.videoId));
              } while (data.length < info.results)
            }
            resolve(data);
          }
        }
      });
    });
  },
  
  info(id) {
    return new Promise(function(rs, rj) {
      yt.getInfo("https://www.youtube.com/watch?v=" + id, (err, data) => {
        if(err)
          rj(err);
        rs(data);
      });
    });
  },
  
  // Adds a song to queue
  add(ids, message) {
    
  },
};

// Commands
const c = {
  download: {
    a: ["down"],
    desc: "Downloads a song on the bot and sends the file into the channel",
    f: async (msg, content) => {
      let vid;
      
      // Starts typing to indicate that its working
      msg.channel.startTyping();
      
      // Determines video ID
      if(m.id(content))
        vid = await m.info(m.id(content));
      else
        vid = await m.search(msg, content, { info: true });
      
      // Creates stream and downloads it
      let stream = yt(vid.video_url, { filter : 'audioonly' });
      
      // Sends a message to indicate that the video is being downloaded
      msg.channel.send(new Discord.RichEmbed().setAuthor(vid.title, msg.author.avatarURL, vid.video_url).setDescription(`Length: ${vid.length_seconds} seconds(${gFuncs.time(vid.length_seconds * 1000)})`).setColor(gFuncs.ecol()).setThumbnail(vid.thumbnail_url));
      
      // The downloaded stream buffer data
      let aData = [];
      stream.on('data', function(data) {
        aData.push(data);
      });
      
      // What happens when its done downloading
      stream.on('end', function() {
        
        // Forms data into an attachment
        let buffer = Buffer.concat(aData);
        
        // Stops typing as it sends the attachment
        msg.channel.stopTyping();
        
        // Sends the downloaded attachment
        msg.channel.send({
          files: [
            {
              attachment: buffer,
              name: `${vid.title.replace(/\W[^ .()-]/g, "_")}.mp3`
            }
          ]
        });
      });
    }
  },
  
};

module.exports = run;