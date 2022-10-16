import { REST, Routes, Client, GatewayIntentBits, roleMention, userMention, bold, italic, underscore } from 'discord.js';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

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

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  
  if (interaction.commandName === "lets") {
    await interaction.reply('@everyone');
  }
  else if (interaction.commandName === "whoami") {
    await interaction.reply(`${bold(interaction.user.tag)}`);
  }
  else if (interaction.commandName === "this") {
    await interaction.reply(`${bold('#' + interaction.channel.name)}`);
  }
});

client.on('messageCreate', async message => {
  if (message.author.bot) return;
  if (message.content.slice(0, 6) === "excite" || message.content.slice(0, 7) === "inspire") {
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
    const rawAnnouncement =  message.content.slice(5, message.content.length);
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
    let currentDate = new Date(message.createdTimestamp).toString();
    let finalDate = currentDate.slice(0, currentDate.indexOf("(")-1).trim()

    let titlePosition = finalAnnouncement.indexOf("-title(");
    if (titlePosition >= 0) {
      let endTitlePosition = finalAnnouncement.indexOf(")", titlePosition+1);
      title = finalAnnouncement.slice(titlePosition+7, endTitlePosition);
      finalAnnouncement = finalAnnouncement.replace(`-title(${title})`, '');
    }

    let announcement = `\n${bold(italic("` Announcer `"))} \t \t ${bold(userMention(message.author.id).trim())}
    \n${bold(italic("` Announcement `"))}\t ${bold(finalAnnouncement)}
    \n${bold(italic("` Mentions `"))}  \t  \t ${bold(userTag)}
    \n${bold(italic("` Timestamp `"))} \t \t ${underscore(bold(finalDate))}
    `

    const starter = "```" + title.toUpperCase() +  " ```";
    const mReply = await message.reply({ content: `${bold(starter)}\n${bold(italic("`<< Start of Announcement >>`"))}\n\n@everyone\n${announcement}\n\n${bold(italic("`<< End of Announcement >>`"))}`, fetchReply: true });

    if (rawAnnouncement.includes("-pin", 3)) {
      if (message.member.roles.cache.some(r => ["boss", "manager", "owner", "admin", "leader", "captain", "head"].includes(r.name.toLowerCase()))) {
        mReply.pin();
      }
    }

    mReply.react('🚀');
    mReply.react('💯');
    mReply.react('✨');
  }
  else if (message.content.slice(0, message.content.length) === "$all") {
    await message.reply(bold("Void/Null Notices cannot be parsed!!"));
  }
});

client.login(process.env.TOKEN);
