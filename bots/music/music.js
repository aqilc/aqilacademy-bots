// Constants
const http = require('http');
const https = require("https");
const Discord = require("discord.js");
const client = new Discord.Client();
const yt = require("ytdl-core");
const download = require("youtube-dl");
const fs = require("fs");
const request = require("request");
const prefix = ["a."];
const data = require("/app/data/d.js");
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
      if(!data.devs.includes(message.author.id))
        return message.reply("You don't have the permissions to run code in this bot");

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
    if(!data.devs.includes(message.author.id))
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
  
  // Transforms a url into a video ID
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
          let vids = info && info.results > 1 ? json.items.slice(0, info.results).map(j => j.id.videoId) : json.items[0].id.videoId;
          
          if(info.add)
            m.add(vids, message);
          
          if(!info || !info.info)
            resolve(vids);
          
          let data = [];
          if(info && info.info) {
            if(!info || info.results <= 1)
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
  
  // Gets some info on a video
  info(id) {
    if(!this.id(id))
      return false;
    
    
    return yt.getInfo("https://www.youtube.com/watch?v=" + id);
  },
  
  // Adds a song to queue
  add(ids, message) {
    if(typeof ids !== "object")
      ids = [ids];
    ids.forEach(i => typeof i === "string" || (() => { throw new Error("m.add: Not all imputted IDs are strings") })());
  },
};

// Commands
const c = {
  download: {
    a: ["down"],
    desc: "Downloads a song on the bot and sends the file into the channel",
    async f(msg, content) {
      
      // Defines variables
      let vid, ms, embed = new Discord.RichEmbed(), downloaded, desc = d => `**File Size:** \`${vid.length_seconds} bytes\`\n**Length:** ${vid.length_seconds} seconds(${gFuncs.time(vid.length_seconds * 1000)})\n**Completed:** \`${d || 0}MB\``, i;
      
      // Starts typing to indicate that its working
      msg.channel.startTyping();
      
      // Determines video ID
      if(m.id(content))
        vid = await m.info(m.id(content));
      else
        vid = await m.search(msg, content, { info: true });
      
      // Alerts that someone is downloading something
      console.log("downloading", vid.video_url);
      
      // Starts an embed
      embed.setAuthor(`Downloading ${vid.title}`, client.user.avatarURL, vid.url).setThumbnail(vid.thumbnail_url)
      
      // Creates stream and downloads it
      let stream = yt(vid.video_url, { filter : 'audioonly' });
      
      // Sends a message to indicate that the video is being downloaded then edits it every 3 seconds
      ms = msg.channel.send(embed.setDescription(desc()));
      i = setInterval(() => ms.edit(embed.setDescription(desc())), 2000);
      
      // The downloaded stream buffer data
      let aData = [];
      stream.on('data', function(data) {
        aData.push(data);
      });
      
      // What happens when its done downloading
      stream.on('end', function() {
        
        // Stops editing the sent message
        clearInterval(i);
        
        // Forms data into an attachment
        let buffer = Buffer.concat(aData),
            
        // Transforms the title into a file name
            title = vid.title.replace(/\W/g, "_")
        
        // Stops typing as it sends the attachment
        msg.channel.stopTyping();
        
        // Sends the downloaded attachment
        msg.channel.send({
          files: [
            {
              attachment: buffer,
              name: `${title}.mp3`
            }
          ]
        });
      });
    },
  },
};

// Exports the bot so we can run it outside the file
module.exports = run;