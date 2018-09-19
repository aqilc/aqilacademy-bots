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

      return msg.channel.send(new Discord.RichEmbed().setDescription(`**Output:**\`\`\`${ran}\`\`\``).setColor(gFuncs.ecol));
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

  // Music Events
  m.e.on("s:start", (i, v) => m.announce_song(i, v, client.channels.get("342877747149930508")));
  
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
    message: undefined,
    queue: [],
    announce: {
      song: true,
    },
    np: 0,
  },
  
  // Turns the queue into a ton of youtube data XD
  queue() {
    return new Promise(async (res, rej) => {
      let queue = this.settings.queue.map(async q => await m.info("https://www.youtube.com/watch?v=" + q.id));
      res(queue);
    });
  },
  
  // Transforms a url into a video/playlist ID
  url(url) {
    let plm = url.match(/^.*(youtu.be\/|list=)([^#\&\?]*).*/)
    if(yt.validateID(url) || yt.validateURL(url))
      return { v: yt.getVideoID(url), i: yt.getVideoID(url) };
    else if(plm && plm[0].length === 34)
      return { p: plm[0], i: plm[0] };
    return false;
  },
  
  // Plays a song
  async play(user, id, options = { seek: 0, next: false, options: undefined, repeat: false, carryoptions: false }) {
    let ID = 0;
    if (!(options instanceof Object))
      options = false;
    if(typeof id === "number" && this.settings.queue[id])
      this.settings.np = id, ID = id, id = this.settings.queue[id];
    else if(typeof id === "string" && id.length === 11)
      this.settings.queue.push({ id: id, user: user }), ID = this.settings.np = this.settings.queue.length - 1;
    else
      throw new Error("mpe1 Invalid ID put into the 'play' function");
    if(!this.settings.connection)
      throw new Error("mpe2 No voice connection to play songs on");
    
    if(this.settings.handler)
      await this.settings.handler.end(), this.settings.handler = null;
    if(options && options.options)
      options.options.options = options.carryoptions ? options.options : null;
    
    // Gets the info on the song
    let vid = await this.info(id || this.settings.queue[ID].id);
    
    // Emits the start of vid event if song exists
    if(vid)
      this.e.emit("s:start", id, vid);
    else throw new Error("Invalid song ID");
    
    let next = this.settings.queue[id + 1] ? id + 1 : this.settings.queue.length > 1 ? 0 : undefined,
        handler = this.settings.connection
      .playStream(yt("https://www.youtube.com/watch?v=" + (id || this.settings.queue[ID].id), { filter: "audioonly" }), { seek: options ? options.seek || 0 : 0 })
      .once("end", reason => {
        if(reason)
          console.log(reason);
        
        // Emits the song end and start event
        this.e.emit("s:end", vid);
        
        // Sets options.options.options to options.options if options exists
        if(options && options.options)
          options.options.options = options.options;
        
        // Goes on to repeat or play the next song
        if(this.settings.repeat || options && options.repeat)
          this.play(user, id, options);
        
        // Plays next song if requested
        else if(options && options.next && next)
          this.play(user, next, options ? options.options : undefined);
        
      });
  },
  
  // Renders info from a search snippet
  sInfo(info) {
    let r = {};
    function get_val(str) {
      let v = info; str = str.split(".");
      for(let i = 0; i < str.length; i ++) {
        if(v[str[i]])
          v = v[str[i]];
        else return undefined;
      }
      return v;
    } function set(arr) {
      if(arr[0] instanceof Array) {
        arr[0].forEach(t => {
          if(get_val(arr[1]))
            r[t] = get_val(arr[1]);
        });
      } else if(get_val(arr[1]))
        r[arr[0]] = get_val(arr[1]);
    } function vidInfo(obj) {
      
    };
    switch (info.kind) {
      case "youtube#videoListResponse":
        
        break;
      case "youtube#searchResult":
        [[["vid", "video_id"], "id.videoId"], ["thumbnail", "snippet.thumbnails.high.url"], ["title", "snippet.title"], ["description", "snippet.description"], ["channel", "channelTitle"]].forEach(set);
        if(r.video_id)
          r.url = r.video_url = "https://www.youtube.com/watch?v=" + r.video_id;
        break;
        
      default:
        throw new Error("Invalid information inputted into the `sInfo` function");
    }

    return r;
  },
  
  // Searches a video from YouTube and returns it... or adds it into the queue
  search(msg, search, info = { results: 1, add: false, info: false }) {
    return new Promise(function (resolve, reject) {
      
      // Search for results
      request("https://www.googleapis.com/youtube/v3/search?part=id,snippet&type=video&maxResults=50&q=" + encodeURIComponent(search) + "&key=" + m.ytAk, (error, response, body) => {
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
            request("https://www.googleapis.com/youtube/v3/videos?part=id,snippet,contentDetails,statistics&id=" + (typeof vids === "string" ? vids : vids.join(",")) + "&key=" + m.ytAk, (err, res, bod) => {
              
            });/*
            if(~~ info.results <= 1)
              data = m.sInfo(json.items[0]);
            else {
              while (data.length < info.results) {
                data.push(m.sInfo(json.items[data.length]));
              }
            }
            resolve(data);*/
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
  join(member) {
    // Returns false if there is no channel to join/No channel to send messages to.
    if(!member.voiceChannel)
      return false;
    
    // Changes the voice channel to that of the users and then joins the channel
    this.settings.channel = member.voiceChannel;
    if(this.set("connect", member.voiceChannel) instanceof Error)
      return false;
    
    // Returns a promise including the connection to the channel
    return member.voiceChannel.join();
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
  async announce_song(id, vid, channel) {
    if(!channel)
      throw new Error("No channel to announce the new song in");
    if(!this.settings.announce.song)
      return;
    
    let message = channel.lastMessageID ? await channel.fetchMessage(channel.lastMessageID) : false,
        embed = new Discord.RichEmbed()
      .setColor(gFuncs.ecol)
      .setAuthor(`Now Playing "${vid.title}`, channel.guild.iconURL, vid.video_url)
      .setDescription(`**Length:** ${gFuncs.time(vid.length_seconds * 1000)}\n**Requested By:** ${m.settings.queue[id].user}\n\n${vid.description.slice(0, 500) + vid.description.length >= 500 ? "..." : ""}`)
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
    usage: " [song name or link/playlist link](, [another song name or link]) (s:[ms you want to skip to in the song])",
    async f(msg, content) {
      
        if(!msg.member.voiceChannel)
          return msg.reply("You need to join a voice channel first!");

        let connection, vid;
        if(m.settings.channel && m.settings.connection.channel.id === msg.member.voiceChannel.id)
          connection = m.settings.connection;
        else if(m.settings.autojoin)
          connection = await m.join(msg.member);
        else
          return msg.reply(`The \`autojoin\` setting is turned off. You will have to manually do \`${prefix}join\` and make the bot join your channel`);
      
        if(content === "")
          content = data.vid;

        if(!m.url(content))
          vid = await m.search(msg, content, { results: 10, info: true });
        else
          vid = await m.info("https://www.youtube.com/watch?v=" + m.url(content).v);

        if(vid instanceof Array && vid.length > 1) {
          msg.channel.send(new Discord.RichEmbed().setColor(gFuncs.ecol).setAuthor("Pick a video", "https://pbs.twimg.com/profile_images/902795135934746628/UfD7Svr8_400x400.jpg").setDescription(vid.map(v => `**${vid.indexOf(v) + 1}. [${v.title}](${v.video_url})**\n`).join("")).setFooter("Respond with the number of the video. You have 30 seconds"));
          msg.channel.createMessageCollector(ms => !isNaN(Number(ms.content)) && Number(ms.content) <= 10 && ms.author.id === msg.author.id, { maxMatches: 1, time: 30000 }).on("end", collected => {
            if(!collected.array()[0])
              return msg.channel.send("No message collected, assuming you didn't want to pick any song.");
            
            let pvid = Number(collected.array()[0].content);
            console.log(vid[pvid]);
            if(!m.handler)
              return m.play(msg.author, vid[pvid].vid, { next: true, options: { next: true } });

            m.add(vid[pvid].id);
          });
        }
    }
  },
  join: {
    cd: 10000,
    description: "Makes the bot join your channel.",
    usage: " (id of channel)",
    f(msg, content) {        
      if(m.settings.handler)
        return msg.reply("Currently playing music in another channel, sorry");
      
      let channel;
      if(content && content.length === 18)
        channel = msg.guild.channels.get(content) || undefined;
      
      if(channel && channel.type !== "voice")
        return msg.reply("Invalid channel... Specified channel is not a voice channel");
      
      if(!channel && !msg.member.voiceChannel)
        return msg.reply("Please join a channel or give me the ID of which one to join!");
      else
        channel = msg.member.voiceChannel;
      
      if(m.join(msg.member))
        return msg.channel.send(new Discord.RichEmbed().setAuthor(`Joined ${channel.name}`, channel.guild.iconURL).setThumbnail("You can play music on me now(if someone is present in the channel with me :P)"));
    }
  }
};

// Exports the bot so we can run it outside the file
run.client = client;
run.m = m;
run.c = c;
module.exports = run;