// Constants
const http = require('http');
const https = require("https");
const Discord = require("discord.js");
const client = new Discord.Client();
const yt = require("ytdl-core");
const fs = require("fs");
const request = require("request");
const events = require("events");
const prefix = ["a."];
const data = require("/app/data/d.js");
const gFuncs = require("/app/data/f.js");

// So undefined stays undefined
undefined = void 0;

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
          if(c[i].cd && data.devs.includes(msg.author.id)) {
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
  
  // Returns the client
  return client;
}

// Music Functions
const m = {
  // My YouTube API Key for searching videos from YouTube
  ytAk: process.env.YT,
  
  // Settings for the quild
  settings: {
    autojoin: true,
    repeat: false,
    connection: undefined,
    handler: undefined,
    channel: undefined,
    queue: [],
    announce: {
      song: true,
    },
    np: 0,
  },
  
  // Return stuff in m.settings because why not
  get np() { return this.settings.np },
  get autojoin() { return this.settings.autojoin },
  get repeat() { return this.settings.repeat },
  get connect() { return this.settings.connection },
  get connection() { return this.settings.connection },
  queue() {
    return new Promise(async (res, rej) => {
      let queue = this.settings.queue.map(async q => await m.info("https://www.youtube.com/watch?v=" + q.id));
      res(queue);
    });
  },
  get queue() { return this.settings.queue },
  get handler() { return this.settings.handler },
  get channel() { return typeof this.settings.channel === "object" ? this.settings.channel : client.guilds.get("294115797326888961").channels.get(this.settings.channel) || void 0 },
  
  // Transforms a url into a video/playlist ID
  url(url) {
    let plm = url.match(/^.*(youtu.be\/|list=)([^#\&\?]*).*/)
    if(yt.validateID(url) || yt.validateURL(url))
      return { v: yt.getVideoID(url), i: yt.getVideoID(url) };
    else if(plm && plm[0].length === 34)
      return { p: plm[0], i: plm[0] };
    return {};
  },
  
  // Plays a song
  async play(id, options = { seek: 0, next: false, options: undefined, repeat: false, carryoptions: false }) {
    if(typeof options !== "object")
      options = false;
    if(typeof id === "number" && this.settings.queue[id])
      this.settings.np = id;
    else if(typeof id === "string" && id.length === 11)
      this.settings.queue.push(id), id = this.settings.np = this.settings.queue.length - 1;
    else
      throw new Error("mpe1 Invalid ID put into the 'play' function");
    if(!this.settings.connection)
      throw new Error("mpe2 No voice connection to play songs on");
    if(options && options.next && !this.settings.queue[id + 1])
      throw new Error("mpe3 Can't play the next song if there is none");
    
    if(this.settings.handler)
      await this.settings.handler.end(), this.settings.handler = null;
    if(options && options.options)
      options.options.options = options.carryoptions ? options.options : null;
    
    let vid = await this.info(this.settings.queue[id].id),
        next = this.settings.queue[id + 1] ? id + 1 : this.settings.queue.length > 1 ? 0 : undefined,
        handler = this.settings.connection
      .playStream(yt("https://www.youtube.com/watch?v=" + this.settings.queue[id].id, { filter: "audioonly" }), { seek: options ? options.seek || 0 : 0 })
      .once("end", reason => {
        if(reason)
          console.log(reason);
        
        // Emits the song end event
        this.e.emit("s:end", vid);
        
        // Goes on to repeat or play the next song
        if(this.settings.repeat || options && options.repeat)
          this.play(id, options);
        else if(options && options.next && next)
          this.play(next, options ? options.options : undefined);
        
      });
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
    if(!yt.validateID(id))
      return new Promise((res, rej) => rej("Invalid ID"));
    return yt.getInfo("https://www.youtube.com/watch?v=" + id);
  },
  
  // Adds a song to queue
  add(ids, msg) {
    if(typeof ids !== "object")
      ids = [ids];
    if(!ids.every(i => typeof i === "string"))
      throw new Error("Every imputted ID must be a string");
    
    this.settings.queue.concat(ids.map(i => new Object({ id: i, user: msg.author })));
  },
  
  // Joins a voice channel
  join(channel) {
    // Returns false if there is no channel to join/No channel to send messages to.
    if(typeof channel !== "object" || channel.type !== "voice")
      return false;
    
    // Changes the voice channel to that of the users and then joins the channel
    this.settings.channel = channel;
    if(this.set("connect", channel) instanceof Error)
      return false;
    
    // Returns a promise including the connection to the channel
    return channel.join();
  },
  
  // Sets stuff in settings
  async set(type, data) {
    try {
      switch(type) {
        case "connect":
          this.settings.connection = await data.join();
          break;
      }
    } catch(err) { console.log(err); return new Error(err) }
  },
  
  // Announces the song
  async announce_song(vid, channel) {
    if(!channel)
      throw new Error("No channel to announce the new song in");
    if(!this.settings.announce.song)
      return;
    
    let message = channel.lastMessageID ? await channel.fetchMessage(channel.lastMessageID) : false,
        embed = new Discord.RichEmbed()
      .setAuthor(`Now Playing "${vid.title}`, channel.guild.iconURL, vid.video_url)
      .setDescription(`**Length:** ${gFuncs(vid.length_seconds * 1000)}\n\n${vid.description.slice(0, 500) + vid.description.length >= 500 ? "..." : ""}`)
      .setThumbnail(vid.thumbnail_url)
    if(!message || message.author.id !== client.user.id)
      channel.send(embed);
    else
      message.edit(embed);
  },
  
  // Event system
  e: new events.EventEmitter(),
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
      if(m.url(content).v)
        vid = await m.info(m.url(content).v);
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
            title = vid.title.replace(/\W/g, "_")
        
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
    usage: " [song name or link/playlist link]",
    async f(msg, content) {
      if(!msg.member.voiceChannel)
        return msg.reply("You need to join a voice channel first!");
      
      let connection;
      if(m.settings.channel && m.settings.connection.channel.id === msg.member.voiceChannel.id)
        connection = m.settings.connection;
      else if(m.settings.autojoin)
        connection = await m.join(msg.member.voiceChannel);
      else
        return msg.reply(`The \`autojoin\` setting is turned off. You will have to manually do ${prefix}join and make the bot join your channel`);
      
      
    }
  },
  join: {
    description: "Makes the bot join your channel.",
    usage: " (id of channel)",
    f(msg, content) {
      if(m.settings.handler)
        return msg.reply("Currently playing music in another channel, sorry");
      
      let channel;
      if(content && content.length === 18)
        channel = msg.guild.channels.get(content) || undefined;
      
      if(channel && msg.guild.channels.get(content).type !== "voice")
        return msg.reply("Invalid channel... Specified channel is not a voice channel");
      
      if(!channel && !msg.member.voiceChannel)
        return msg.reply("Please join a channel or give me the ID of which one to join!");
      else
        channel = msg.member.voiceChannel;
      
      if(m.join(channel))
        return msg.channel.send(new Discord.RichEmbed().setAuthor(`Joined ${channel.name}`, channel.guild.iconURL).setThumbnail("You can play music on me now(if someone is present in the channel with me :P)"));
    }
  }
};

// Events
m.e.on("s:end", v => m.announce_song(v, m.settings.channel));

// Exports the bot so we can run it outside the file
run.client = client;
module.exports = run;