// Code by bevatsal1122
// Trust God, Your Code Will Work

import { REST, Routes, Client, GatewayIntentBits, roleMention, userMention, bold, italic, underscore } from 'discord.js';
import axios from "axios";
// import dotenv from "dotenv";
import { keepActive } from "./server.js";
// dotenv.config();

const commands = [
  {
    name: "lets",
    description: "Mentions Everyone"
  },
  {
    name: "whoami",
    description: "Replies Interaction User Username"
  },
  {
    name: "this",
    description: "Replies Interaction Channel Name",
  }
];

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
  try {
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
  } catch (error) {
    console.error(error);
  }
})();

const client = new Client({intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.DirectMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessageReactions]});

let active = true;

client.on('ready', () => {
  console.log(`Logged In >> ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  if (!active) {
    await interaction.reply(bold("`Bot is sleeping  😴`\nExecute `$active -on` to wake up the Bot!!"));
    return;
  }
  
  if (interaction.commandName === "lets") {
    await interaction.reply('@everyone');
  }
  else if (interaction.commandName === "whoami") {
    await interaction.reply(bold(interaction.user.tag));
  }
  else if (interaction.commandName === "this") {
    await interaction.reply(bold('#' + interaction.channel.name));
  }
});

client.on('messageCreate', async message => {
  if (message.author.bot) return;
  const mLength = message.content.length;
  if (message.content.slice(0, 7) === "$active") {
    if (message.content.includes("-on", 8) && mLength == 11) {
      active = true;
      message.reply(bold("`Bot woke 🥱`"));
    }
    else if (message.content.includes("-off", 8) && mLength == 12) {
      active = false;
      message.reply(bold("`Bot slept 😴`"));
    }
  }
  if (!active) return;
  if (message.content.slice(0, mLength) === "excite" || message.content.slice(0, mLength) === "inspire") {
    try {
      const response = await axios.get("https://www.affirmations.dev");
      const mReply = await message.reply(bold(response.data.affirmation));
      mReply.react('💯');
      mReply.react('✨');
    } catch (error) {
      console.error(error);
    }
  }
  else if (message.content.slice(0, 5) === "$all ") {
    const rawAnnouncement =  message.content.slice(5, mLength);
    let userTag = "";
    let finalAnnouncement = "";
    let title = "";

    let tag = rawAnnouncement.indexOf("<"), counter=0;
    let data = [];
    while (tag >= 0) {
      let nextEnd = rawAnnouncement.indexOf(">", tag+1);
      finalAnnouncement += rawAnnouncement.slice(counter, tag);
      counter = nextEnd+1;

      if ((nextEnd-tag) >= 2) {
        let userName = rawAnnouncement.slice(tag+1, nextEnd);
        if (client.users.cache.find(u => u.username === userName) != undefined && !data.includes(userName)) {
          const user = userMention(client.users.cache.find(u => u.username === userName).id);
          userTag += user + " ";
          data.push(userName);
        }
        else if (message.guild.roles.cache.find(role => role.name === userName && !data.includes(userName)) != undefined) {
          const role = roleMention(message.guild.roles.cache.find(role => role.name === userName).id);
          userTag += role + " ";
          data.push(userName);
        }
      }
      tag = rawAnnouncement.indexOf("<", nextEnd);
    }

    finalAnnouncement += rawAnnouncement.slice(counter, rawAnnouncement.length);
    
    finalAnnouncement = finalAnnouncement.replace("-pin", '').trim();
    userTag = userTag.trim();
    let rawDate = new Date();
    let currentOffset = rawDate.getTimezoneOffset();
    let ISTOffset = 330;
    let currentDate = new Date(rawDate.getTime() + (ISTOffset + currentOffset)*60000).toString();
    let finalDate = currentDate.slice(0, currentDate.indexOf("GMT")-1).trim();

    let titlePosition = finalAnnouncement.indexOf("-title(");
    if (titlePosition >= 0) {
      let endTitlePosition = finalAnnouncement.indexOf(")", titlePosition+1);
      title = finalAnnouncement.slice(titlePosition+7, endTitlePosition);
      finalAnnouncement = finalAnnouncement.replace(`-title(${title})`, '');
    }

    let announcement = `\n${bold(italic("` Announcer `"))} \t \t ${bold(userMention(message.author.id).trim())}
    \n${bold(italic("` Announcement `"))}\t ${bold(finalAnnouncement)}
    \n${bold(italic("` Mentions `"))}  \t  \t ${bold(userTag)}
    \n${bold(italic("` Timestamp `"))} \t \t ${underscore(bold(finalDate + " IST"))}
    `

    const starter = "```" + title.toUpperCase() +  " ```";
    const currentChannel = await client.channels.fetch(message.channelId);
    
    await currentChannel.send(`${bold(starter)}\n${bold(italic("`<< Start of Announcement >>`"))}\n\n@everyone\n${announcement}\n\n${bold(italic("`<< End of Announcement >>`"))}`)
    .then(async mReply => {
      mReply.react('🚀');
      mReply.react('💯');
      mReply.react('✨');
      if (rawAnnouncement.includes("-pin", 3)) {
        if (message.member.roles.cache.some(r => ["boss", "manager", "owner", "admin", "leader", "captain", "head"].includes(r.name.toLowerCase()))) {
          mReply.pin();
        }
      }
    });

  }
  else if (message.content.slice(0, mLength) === "$all") {
    await message.reply(bold("`Void/Null Notices cannot be parsed 😐`"));
  }
});

keepActive();
client.login(process.env.TOKEN);
