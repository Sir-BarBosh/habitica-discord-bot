# Habitica Discord Bot

A discord bot that listens for [Habitica](https://habitica.com) webhooks and sends the info to a discord channel

# Installation and Usage

This bot listens for Habitica webhooks and sends activity updates to a specified Discord channel.

## Prerequisites

*   **Discord Bot Token:** Obtain a Discord bot token with privileged gateway intents. Follow this [guide](https://www.writebots.com/discord-bot-token/) to get yours.
*   **Discord Developer Mode:** Enable Developer Mode in your Discord settings (`User Settings -> Advanced -> Developer Mode`) to easily copy IDs.

## Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/YellowUmbrellaDev/habitica-discord-bot.git
    cd habitica-discord-bot
    ```
2.  **Configure Environment Variables:**
    Rename `.env.example` to `.env` and fill in the required values:
    ```
    DISCORD_BOT_TOKEN=YOUR_BOT_TOKEN_HERE
    CLIENT_ID=YOUR_BOT_CLIENT_ID_HERE
    GUILD_ID=YOUR_DISCORD_SERVER_ID_HERE
    DISCORD_CHANNEL_ID=YOUR_DISCORD_CHANNEL_ID_HERE
    USERS=HABITICA_USER_ID_1:DiscordName1,HABITICA_USER_ID_2:DiscordName2
    ```
    *   **`DISCORD_BOT_TOKEN`**: Your Discord bot token.
    *   **`CLIENT_ID`**: The client ID of your Discord bot (found in the Discord Developer Portal).
    *   **`GUILD_ID`**: The ID of the Discord server (guild) where you want to deploy slash commands.
        *   To get your Server ID: Right-click on the Server name in Discord and select "Copy Server ID".
    *   **`DISCORD_CHANNEL_ID`**: The ID of the Discord channel where the bot should post messages.
        *   To get your Channel ID: Right-click on the channel name in Discord and select "Copy ID".
    *   **`USERS`**: A comma-separated list mapping Habitica User IDs to the Discord display names you want the bot to use. Example: `habiticaUserID1:MyDiscordName,habiticaUserID2:AnotherDiscordName`. Your Habitica `userId` is the UUID in your profile URL (e.g., `habitica.com/profile/[UUID]`).

3.  **Install Dependencies:**
    ```bash
    npm install
    ```
4.  **Deploy Slash Commands:**
    ```bash
    npm run deploy
    ```
    This registers the bot's slash commands with Discord.

5.  **Invite the bot to your server:**
    Use an invite link like this, replacing `CLIENT_ID` with your bot's client ID:
    `https://discord.com/api/oauth2/authorize?client_id=CLIENT_ID&permissions=2147601408&scope=applications.commands%20bot`

## Running the Bot

### Option 1: Run with Node.js (Recommended for development/simple hosting)

```bash
npm start
```

### Option 2: Run with Docker

1.  Ensure Docker is installed on your computer.
2.  Build and run the Docker container:
    ```bash
    docker compose up -d
    ```

## Habitica Webhook Configuration

Finally, you need to configure a webhook in your Habitica settings to send data to your bot.

1.  Go to your [Habitica settings](https://habitica.com/user/settings/site).
2.  Add a new webhook URL.
    *   If hosting locally, the format will be `http://<your-ip>:8080/webhook`.
    *   **Important:** Habitica webhooks may not be sent to insecure (HTTP) URLs from external networks. It's highly recommended to use a reverse proxy (like Caddy, Nginx, or Apache) to serve your bot over HTTPS.

**Caddy Reverse Proxy Example:**

```conf
<your-domain>.com {
    reverse_proxy host.docker.internal:8080
}
```
In this case, the webhook URL would look like `https://<your-domain>.com/webhook`.

## Features

*   Receives Habitica webhook notifications for task activity.
*   Posts Discord embeds for:
    *   Habit progress (up and down, showing current counter).
    *   Daily task completion and uncompletion (showing streak).
    *   Todo task completion.
    *   Reward claims.
*   Maps Habitica User IDs to custom Discord display names.

# Thanks [YellowUmbrellaDev](https://github.com/YellowUmbrellaDev) which is project is a fork of. They are legen- wait for it... and I hope you're not lactose intolerant, because the second half of that word is-- dairy