require('dotenv').config();
const { Client, GatewayIntentBits, Collection, EmbedBuilder } = require('discord.js');
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const channelId = process.env.DISCORD_CHANNEL_ID;

// Parse mapped users safely
const users = (process.env.USERS || '').split(',').filter(Boolean);
const userIdToName = {};
for (const user of users) {
  const [id, name] = user.split(':');
  if (id && name) {
    userIdToName[id.trim()] = name.trim();
  }
}

// Webhook endpoint
app.post('/webhook', (req, res) => {
  // Authentication check
  const webhookSecret = process.env.WEBHOOK_SECRET;
  if (webhookSecret) {
    const providedSecret = req.query.secret
      || req.headers['x-webhook-secret']
      || (req.headers.authorization && req.headers.authorization.replace(/^Bearer\s+/i, ''));

    if (providedSecret !== webhookSecret) {
      console.warn('[SECURITY] Unauthorized webhook attempt rejected');
      return res.status(401).json({ error: 'Unauthorized: Invalid or missing webhook secret' });
    }
  }

  // Parse and validate incoming payload safely
  let data;
  try {
    data = req.body && req.body.payload ? JSON.parse(req.body.payload) : req.body;
  } catch (err) {
    console.error('[ERROR] Failed to parse webhook payload JSON:', err.message);
    return res.status(400).json({ error: 'Invalid JSON payload' });
  }

  if (!data || typeof data !== 'object' || !data.task || typeof data.task !== 'object') {
    return res.status(400).json({ error: 'Malformed payload: missing task object' });
  }

  // Acknowledge receipt to the webhook sender
  res.sendStatus(200);

  // Safely extract properties with bounds/fallbacks
  const rawTaskText = typeof data.task.text === 'string' ? data.task.text : 'Unknown task';
  const task = rawTaskText.slice(0, 200);
  const streak = Number.isFinite(data.task.streak) ? data.task.streak : 0;
  const reward = typeof data.task.text === 'string' ? data.task.text.slice(0, 200) : 'Reward';
  const counterUp = Number.isFinite(data.task.counterUp) ? data.task.counterUp : 0;
  const counterDown = Number.isFinite(data.task.counterDown) ? data.task.counterDown : 0;
  const habitCounter = counterUp - counterDown;

  const userId = data.task.userId || (data.user && data.user._id);
  const userName = (userId && userIdToName[userId]) ? userIdToName[userId] : 'Habitica User';

  // Embeds
  // Task completed
  const taskUp = new EmbedBuilder()
    .setAuthor({
      name: "Task completed",
      url: "https://github.com/NereaCassian/habitica-discord-bot",
      iconURL: "https://i.imgur.com/QeqL3hz.png",
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
      iconURL: "https://i.imgur.com/e2c2CZl.png",
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
      iconURL: "https://i.imgur.com/IEP0zOA.png",
    })
    .setTitle(`${userName} - ${task}`)
    .setURL("https://habitica.com")
    .setDescription(`Has progressed in the habit **${task}**. Current counter: **${habitCounter}**`)
    .setThumbnail("https://i.imgur.com/PU7Wzos.png")
    .setColor("#B3508D")
    .setFooter({
      text: "Habitica Bot",
      iconURL: "https://i.imgur.com/PU7Wzos.png",
    })
    .setTimestamp();

  // Habit setback down
  const habitDown = new EmbedBuilder()
    .setAuthor({
      name: "Setback in a habit",
      url: "https://github.com/NereaCassian/habitica-discord-bot",
      iconURL: "https://i.imgur.com/GZpw4VK.png",
    })
    .setTitle(`${userName} - ${task}`)
    .setURL("https://habitica.com")
    .setDescription(`Has regressed in the habit **${task}**. Current counter: **${habitCounter}**`)
    .setThumbnail("https://i.imgur.com/PU7Wzos.png")
    .setColor("#3973AD")
    .setFooter({
      text: "Habitica Bot",
      iconURL: "https://i.imgur.com/PU7Wzos.png",
    })
    .setTimestamp();

  // TODO task completed
  const todoUp = new EmbedBuilder()
    .setAuthor({
      name: "Task completed",
      url: "https://github.com/NereaCassian/habitica-discord-bot",
      iconURL: "https://i.imgur.com/QeqL3hz.png",
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

  // Reward claimed
  const rewardUp = new EmbedBuilder()
    .setAuthor({
      name: "Reward Claimed",
      url: "https://github.com/NereaCassian/habitica-discord-bot",
      iconURL: "https://i.imgur.com/A3A5mFy.png",
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

  // Select embed based on task type and direction
  let embedToSend = null;
  const taskType = data.task.type;
  const direction = data.direction;

  if (taskType === 'habit' && direction === 'down') {
    embedToSend = habitDown;
  } else if (taskType === 'habit' && direction === 'up') {
    embedToSend = habitUp;
  } else if (taskType === 'daily' && direction === 'down') {
    embedToSend = taskDown;
  } else if (taskType === 'daily' && direction === 'up') {
    embedToSend = taskUp;
  } else if (taskType === 'todo' && direction === 'up') {
    embedToSend = todoUp;
  } else if (taskType === 'todo' && direction === 'down') {
    embedToSend = taskDown;
  } else if (taskType === 'reward') {
    embedToSend = rewardUp;
  } else {
    console.warn(`[WARN] Unrecognized task event received: type="${taskType}", direction="${direction}"`);
  }

  // Sends the embed to the configured Discord channel
  const channel = client.channels.cache.get(channelId);
  if (!channel) {
    console.warn(`[WARN] Discord channel ID not found in cache or invalid: ${channelId}`);
    return;
  }

  if (embedToSend) {
    channel.send({ embeds: [embedToSend] }).catch(err => {
      console.error('[ERROR] Failed to send embed to Discord channel:', err.message);
    });
  }
});

// Discord Client Setup (Least Privilege Intents)
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
  ],
});

// Command Collection Setup
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
if (fs.existsSync(commandsPath)) {
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    try {
      const command = require(filePath);
      if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
      } else {
        console.warn(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
      }
    } catch (err) {
      console.error(`[ERROR] Failed to load command at ${filePath}:`, err.message);
    }
  }
}

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error('[ERROR] Interaction execution error:', error);
    const replyPayload = { content: 'There was an error while executing this command!', ephemeral: true };
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(replyPayload).catch(console.error);
    } else {
      await interaction.reply(replyPayload).catch(console.error);
    }
  }
});

// Client Lifecycle & Server Start
const port = process.env.PORT || 8080;

client.once('clientReady', () => {
  console.log(`Bot is ready! Logged in as ${client.user?.tag || 'Discord Bot'}`);
  if (!process.env.WEBHOOK_SECRET) {
    console.warn('[SECURITY WARNING] WEBHOOK_SECRET is not configured. Webhook endpoint is currently unauthenticated.');
  }

  const listener = app.listen(port, () => {
    console.log(`Webhook server listening on port ${listener.address().port}`);
  });
});

if (!process.env.DISCORD_BOT_TOKEN) {
  console.error('[FATAL] DISCORD_BOT_TOKEN is missing in environment.');
} else {
  client.login(process.env.DISCORD_BOT_TOKEN).catch(err => {
    console.error('[FATAL] Failed to login to Discord:', err.message);
  });
}