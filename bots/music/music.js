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

// Cooldowns
let cd = [];

// A function for the whole bot to run on
function run() {

  // Client Events
  client.on("ready", () => console.log(`${client.user.tag} ID: ${client.user.id} logged in at ${new Date().toUTCString()}`));
  client.on("message", msg => {
    
    // Lets the admins run code through the bot
    if(msg.content.startsWith("a:")) {
      let snips = [
        "process.exit(0)",
      ];
      
      if(!data.devs.includes(msg.author.id))
        return msg.reply("You don't have the permissions to run code in this bot");

      let ran, code = msg.content.slice(2).trim();
      if(!isNaN(Number(code)))
        code = snips[Number(code)] || msg.content.slice(2).trim();
      
      try {
        ran = eval(code);
      } catch(err) {
        ran = err;
      }

      return msg.channel.send(new Discord.RichEmbed().setDescription(`**Output:**\`\`\`${ran}\`\`\``).setColor(gFuncs.ecol()));
    }

    // Returns if the user is the bot itself
    if(msg.author.id === client.user.id)
      return;
    
    // Returns if the msg is obviously not a command
    if(!msg.content.startsWith(prefix))
      return;
    
    // Depermines command name
    let cmd = msg.content.slice(prefix.length + 1).split(" ")[0];
    
    let cdu = cd.find(c => c.id === msg.author.id);
    if(cdu)
      return msg.reply(`Please wait! ${gFuncs.time(cdu.edate - Date.now())} left until you can use it again.`);
    
    // Blocks all non-admins from using the bot
    if(!data.devs.includes(msg.author.id))
      return msg.reply("This bot is still in production. Please wait for it to be fully developed");
    
    // Does commands
    try {
      for(let i in c) {
        if(i === cmd || (c[i].a || []).includes(cmd)) {
          
          // Command Cooldowns
          if(c[i].cd) {
            let push = { id: msg.author.id, d: { e: Date.now() + c[i].cd, s: Date.now() } };
            cd.push(push);
            setTimeout(() => cd.splice(cd.findIndex(cdu => cdu === push), 1), c[i].cd);
          }
          
          c[i].f(msg, msg.content.slice(prefix.length + cmd.length + 1).trim());
        }
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
    autojoin: true,
    loop: false,
    handler: undefined,
    channel: undefined,
    current_queue: [],
  },
  
  // Transforms a url into a video ID
  id(url) {
    if(yt.validateID(url) || yt.validateURL(url))
      return yt.getVideoID(url);
    
    return false;
  },
  
  // Searches a video from YouTube and returns it... or adds it into the queue
  search(msg, search, info = { results: 1, add: false, info: false }) {
    return new Promise(function (resolve, reject) {
      
      // Search for results
      request("https://www.googleapis.com/youtube/v3/search?part=id&type=video&q=" + encodeURIComponent(search) + "&key=" + m.ytAk, async (error, response, body) => {
        var json = JSON.parse(body);
        
        // If it finds an error
        if("error" in json)
          reject([json.error.errors[0].msg, json.error.errors[0].reason], true);
        
        // If it didn't find any videos
        else if(json.items.length === 0)
          reject("No videos found using that criteria", false);
        
        // If all goes well...
        else {
          let vids = info && info.results > 1 ? json.items.splice(info.results).map(j => j.id.videoId) : json.items[0].id.videoId;
          
          if(info.add)
            m.add(vids, msg);
          
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
  
  // Gets some info on a video
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
  add(ids, msg) {
    if(typeof ids !== "object")
      ids = [ids];
    if(!ids.every(i => typeof i === "string"))
      throw new Error("Every imputted ID must be a string");
    
    
  },
  
  // Joins a voice channel
  join(member) {
    if(member.voiceChannel)
      return false;
    
    // Changes the voice channel to that of the users and then joins the channel
    this.settings.channel = member.voiceChannel;
    member.voiceChannel.join();
    
    return member.voiceChannel;
  },
};

// Commands
const c = {
  download: {
    cd: 60000,
    a: ["down"],
    desc: "Downloads a song on the bot and sends the file into the channel",
    async f(msg, content) {
      
      // Defines variables
      let vid, ms, downloaded, start = Date.now(), desc = d => `[**Link to video**](${vid.video_url})\n**File Size:** \`${vid.size || 0} bytes(${gFuncs.bytes(vid.size || 0)})\`\n**Length:** ${vid.length_seconds} seconds(${gFuncs.time(vid.length_seconds * 1000)})\n${d === vid.size ? "" : `**Completed:** \`${d || 0} bytes(${gFuncs.bytes(d || 0)})(${((d || 0)/(vid.size || 0) * 100).toFixed(1)}%)\`\n`}**Time Taken:** ${Date.now() - start} ms(${gFuncs.time(Date.now() - start)})`, i;
      
      // Starts typing to indicate that its working
      msg.channel.startTyping();
      
      // Determines video ID
      if(m.id(content))
        vid = await m.info(m.id(content));
      else
        vid = await m.search(msg, content, { info: true });
      
      // Alerts that someone is downloading something
      console.log("downloading", vid.video_url);
      
      // Creates stream and downloads it
      let stream = yt(vid.video_url, { filter : 'audioonly' });
      
      // Sends a message to indicate that the video is being downloaded then edits it every 3 seconds
      ms = await msg.channel.send(new Discord.RichEmbed().addField(`<a:loadinggif:406945578967367680> Downloading "${vid.title}"`, desc(vid.downloaded)).setThumbnail(vid.thumbnail_url).setColor(757203))
      i = setInterval(() => ms.edit(new Discord.RichEmbed().addField(`<a:loadinggif:406945578967367680> Downloading "${vid.title}"`, desc(vid.downloaded)).setThumbnail(vid.thumbnail_url).setColor(757203)), 3000);
      
      // Video Information recieved when downloading
      stream.on('progress', function(chunk, down, total) {
        vid.size = total;
        vid.downloaded = down;
      })
      
      // The downloaded stream buffer data
      let aData = [];
      stream.on('data', function(data) {
        aData.push(data);
      });
      
      // What happens when its done downloading
      stream.on('end', function() {
        
        // Stops editing the sent message
        clearInterval(i);
        ms.edit(new Discord.RichEmbed().addField(`<:yes:416019413314043914> Downloaded and sent "${vid.title}"`, desc(vid.downloaded)).setThumbnail(vid.thumbnail_url).setColor(757203));
        
        // Forms data into an attachment
        let buffer = Buffer.concat(aData),
            
        // Transforms the title into a file name
            title = vid.title.replace(/\W^[-]/g, "_")
        
        // Stops typing as it sends the attachment
        msg.channel.stopTyping();
        
        // Sends the downloaded attachment
        msg.channel.send({
          files: [{
            attachment: buffer,
            name: `${title}.mp3`
          }]
        });
      });
    },
  },
  play: {
    description: "Plays music in your voice channel!",
    f(msg, content) {
      if(!msg.member.voiceChannel)
        return msg.reply("You need to join a voice channel first!");
      
      let connection;
      if(m.autojoin)
        m.join(msg.member);
      
      
    }
  }
};

// Exports the bot so we can run it outside the file
module.exports = run;