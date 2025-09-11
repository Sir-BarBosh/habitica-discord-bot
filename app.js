require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

let channelId = process.env.DISCORD_CHANNEL_ID;

// Split users chain
let users = process.env.USERS.split(',');
// Create a onject to map the name and user ID
let userIdToName = {};
for (let user of users) {
  let [id, name] = user.split(':');
  userIdToName[id] = name;
}

// Webhook endpoint

app.post('/webhook', (req, res) => {
  let data = req.body.payload ? JSON.parse(req.body.payload) : req.body;

  res.sendStatus(200);


  const task = data.task.text;
  const streak = data.task.streak;
  const reward = data.task.text;
  const counterUp = data.task.counterUp;
  const counterDown = data.task.counterDown;

  // Obtains the user name from the user ID

  let userName = userIdToName[data.task.userId];

  //Embeds

  // Task completed
  const taskUp = new EmbedBuilder()
    .setAuthor({
      name: "Task completed",
      url: "https://github.com/NereaCassian/habitica-discord-bot",
      iconURL: "https://i.imgur.com/QeqL3hz.png", //
    })
    .setTitle(`${userName} - ${task}`)
    .setURL("https://habitica.com")
    .setDescription(`Has completed the task **${task}** and is on a streak of **${streak}** days`)
    .setThumbnail("https://i.imgur.com/PU7Wzos.png")
    .setColor("#A3C255")
    .setFooter({
      text: "Habitica Bot",
      iconURL: "https://i.imgur.com/PU7Wzos.png",
    })
    .setTimestamp();

  // Task unchecked
  const taskDown = new EmbedBuilder()
    .setAuthor({
      name: "Task unchecked",
      url: "https://github.com/NereaCassian/habitica-discord-bot",
      iconURL: "https://i.imgur.com/e2c2CZl.png", //
    })
    .setTitle(`${userName} - ${task}`)
    .setURL("https://habitica.com")
    .setDescription(`Has unchecked the task **${task}** and has decreased their score. Current streak: **${streak}** days`)
    .setThumbnail("https://i.imgur.com/PU7Wzos.png")
    .setColor("#B34428")
    .setFooter({
      text: "Habitica Bot",
      iconURL: "https://i.imgur.com/PU7Wzos.png",
    })
    .setTimestamp();

  // Habit progress up
  const habitUp = new EmbedBuilder()
    .setAuthor({
      name: "Progress in a habit",
      url: "https://github.com/NereaCassian/habitica-discord-bot",
      iconURL: "https://i.imgur.com/IEP0zOA.png", //
    })
    .setTitle(`${userName} - ${task}`)
    .setURL("https://habitica.com")
    .setDescription(`Has progressed in the habit **${task}**. Current counter: **${(data.task.counterUp || 0) - (data.task.counterDown || 0)}**`)
    .setThumbnail("https://i.imgur.com/PU7Wzos.png")
    .setColor("#B3508D")
    .setFooter({
      text: "Habitica Bot",
      iconURL: "https://i.imgur.com/PU7Wzos.png",
    })
    .setTimestamp();

  // Habit progress down

  const habitDown = new EmbedBuilder()
    .setAuthor({
      name: "Setback in a habit",
      url: "https://github.com/NereaCassian/habitica-discord-bot",
      iconURL: "https://i.imgur.com/GZpw4VK.png", //
    })
    .setTitle(`${userName} - ${task}`)
    .setURL("https://habitica.com")
    .setDescription(`Has regressed in the habit **${task}**. Current counter: **${(counterUp || 0) - (counterDown || 0)}**`)
    .setThumbnail("https://i.imgur.com/PU7Wzos.png")
    .setColor("#3973AD")
    .setFooter({
      text: "Habitica Bot",
      iconURL: "https://i.imgur.com/PU7Wzos.png",
    })
    .setTimestamp();

  // TODO task compelted
  const todoUp = new EmbedBuilder()
    .setAuthor({
      name: "Task completed",
      url: "https://github.com/NereaCassian/habitica-discord-bot",
      iconURL: "https://i.imgur.com/QeqL3hz.png", //
    })
    .setTitle(`${userName}`)
    .setURL("https://habitica.com")
    .setDescription(`Has completed the task **${task}**`)
    .setThumbnail("https://i.imgur.com/PU7Wzos.png")
    .setColor("#A3C255")
    .setFooter({
      text: "Habitica Bot",
      iconURL: "https://i.imgur.com/PU7Wzos.png",
    })
    .setTimestamp();  
  //Reward claimed
  const rewardUp = new EmbedBuilder()
    .setAuthor({
      name: "Reward Claimed",
      url: "https://github.com/NereaCassian/habitica-discord-bot",
      iconURL: "https://i.imgur.com/A3A5mFy.png", //
    })
    .setTitle(`${userName}`)
    .setURL("https://habitica.com")
    .setDescription(`Has claimed the reward **${reward}**`)
    .setThumbnail("https://i.imgur.com/PU7Wzos.png")
    .setColor("#FEEA00")
    .setFooter({
      text: "Habitica Bot",
      iconURL: "https://i.imgur.com/PU7Wzos.png",
    })
    .setTimestamp(); 
  
  // Sends a embed depending on the Type of task and the direction (up or down)
  let channel = client.channels.cache.get(channelId); 
  if (channel) {
    if (data.task.type === 'habit' && data.direction === 'down') {
      channel.send({ embeds: [habitDown] });
    } else if (data.task.type === 'habit' && data.direction === 'up') {
      channel.send({ embeds: [habitUp] });
    } else if (data.task.type === 'daily' && data.direction === 'down') {
      channel.send({ embeds: [taskDown] });
    } else if (data.task.type === 'daily' && data.direction === 'up'){
      channel.send({ embeds: [taskUp] });
    } else if (data.task.type === 'todo' && data.direction === 'up'){
      channel.send({ embeds: [todoUp] });
    } else if (data.task.type === 'todo' && data.direction === 'down'){
      channel.send({ embeds: [taskDown] });
    } else if (data.task.type === 'reward'){
      channel.send({ embeds: [rewardUp] });
    } else{
      channel.send(`hmmm something went wrong <@!418341963570479124>`);
    }
  }
});

// Intents

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

client.on('interactionCreate', async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});


// Discord bot token
client.login(process.env.DISCORD_BOT_TOKEN);

// Webhook listener
client.once('clientReady', () => {
  console.log('Bot is ready!');
  const listener = app.listen(8080, () => {
    console.log('Your app is listening on port ' + listener.address().port);
  });
});

app.post('/webhook', (req, res) => {
  let data = req.body.payload ? JSON.parse(req.body.payload) : req.body;

  res.sendStatus(200);

  const task = data.task.text;
  const streak = data.task.streak;
  const reward = data.task.text;

  // Obtains the user name from the user ID
  let userName = userIdToName[data.task.userId];

  //Embeds
  // Task completed
  const taskUp = new EmbedBuilder()
    .setAuthor({
      name: "Task completed",
      url: "https://github.com/NereaCassian/habitica-discord-bot",
      iconURL: "https://i.imgur.com/QeqL3hz.png", //
    })
    .setTitle(`${userName}`)
    .setURL("https://habitica.com")
    .setDescription(`Has completed the task **${task}** and is on a streak of **${streak}** days`)
    .setThumbnail("https://i.imgur.com/PU7Wzos.png")
    .setColor("#A3C255")
    .setFooter({
      text: "Habitica Bot",
      iconURL: "https://i.imgur.com/PU7Wzos.png",
    })
    .setTimestamp();

  // Task unchecked
  const taskDown = new EmbedBuilder()
    .setAuthor({
      name: "Task unchecked",
      url: "https://github.com/NereaCassian/habitica-discord-bot",
      iconURL: "https://i.imgur.com/e2c2CZl.png", //
    })
    .setTitle(`${userName}`)
    .setURL("https://habitica.com")
    .setDescription(`Has unchecked the task **${task}** and has decreased their score`)
    .setThumbnail("https://i.imgur.com/PU7Wzos.png")
    .setColor("#B34428")
    .setFooter({
      text: "Habitica Bot",
      iconURL: "https://i.imgur.com/PU7Wzos.png",
    })
    .setTimestamp();

  // Habit progress up
  const habitUp = new EmbedBuilder()
    .setAuthor({
      name: "Progress in a habit",
      url: "https://github.com/NereaCassian/habitica-discord-bot",
      iconURL: "https://i.imgur.com/IEP0zOA.png", //
    })
    .setTitle(`${userName}`)
    .setURL("https://habitica.com")
    .setDescription(`Has progressed in the habit **${task}**`)
    .setThumbnail("https://i.imgur.com/PU7Wzos.png")
    .setColor("#B3508D")
    .setFooter({
      text: "Habitica Bot",
      iconURL: "https://i.imgur.com/PU7Wzos.png",
    })
    .setTimestamp();

  // Habit progress down
  const habitDown = new EmbedBuilder()
    .setAuthor({
      name: "Setback in a habit",
      url: "https://github.com/NereaCassian/habitica-discord-bot",
      iconURL: "https://i.imgur.com/GZpw4VK.png", //
    })
    .setTitle(`${userName}`)
    .setURL("https://habitica.com")
    .setDescription(`Has regressed in the habit **${task}**`)
    .setThumbnail("https://i.imgur.com/PU7Wzos.png")
    .setColor("#3973AD")
    .setFooter({
      text: "Habitica Bot",
      iconURL: "https://i.imgur.com/PU7Wzos.png",
    })
    .setTimestamp();

  // TODO task compelted
  const todoUp = new EmbedBuilder()
    .setAuthor({
      name: "Task completed",
      url: "https://github.com/NereaCassian/habitica-discord-bot",
      iconURL: "https://i.imgur.com/QeqL3hz.png", //
    })
    .setTitle(`${userName}`)
    .setURL("https://habitica.com")
    .setDescription(`Has completed the task **${task}**`)
    .setThumbnail("https://i.imgur.com/PU7Wzos.png")
    .setColor("#A3C255")
    .setFooter({
      text: "Habitica Bot",
      iconURL: "https://i.imgur.com/PU7Wzos.png",
    })
    .setTimestamp();
  //Reward claimed
  const rewardUp = new EmbedBuilder()
    .setAuthor({
      name: "Reward Claimed",
      url: "https://github.com/NereaCassian/habitica-discord-bot",
      iconURL: "https://i.imgur.com/A3A5mFy.png", //
    })
    .setTitle(`${userName}`)
    .setURL("https://habitica.com")
    .setDescription(`Has claimed the reward **${reward}**`)
    .setThumbnail("https://i.imgur.com/PU7Wzos.png")
    .setColor("#FEEA00")
    .setFooter({
      text: "Habitica Bot",
      iconURL: "https://i.imgur.com/PU7Wzos.png",
    })
    .setTimestamp();

  // Sends a embed depending on the Type of task and the direction (up or down)
  let channel = client.channels.cache.get(channelId);
  if (channel) {
    console.log(`Found channel: ${channel.name}`);
    if (data.task.type === 'habit' && data.direction === 'down') {
      channel.send({ embeds: [habitDown] });
    } else if (data.task.type === 'habit' && data.direction === 'up') {
      channel.send({ embeds: [habitUp] });
    } else if (data.task.type === 'daily' && data.direction === 'down') {
      channel.send({ embeds: [taskDown] });
    } else if (data.task.type === 'daily' && data.direction === 'up'){
      channel.send({ embeds: [taskUp] });
    } else if (data.task.type === 'todo' && data.direction === 'up'){
      channel.send({ embeds: [todoUp] });
    } else if (data.task.type === 'todo' && data.direction === 'down'){
      channel.send({ embeds: [taskDown] });
    } else if (data.task.type === 'reward'){
      channel.send({ embeds: [rewardUp] });
    } else{
      channel.send(`hmmm something went wrong <@!418341963570479124>`);
    }
  } else {
    console.log(`Channel ID not found in .env or invalid: ${channelId}`);
  }
});