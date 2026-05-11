const TelegramBot = require("node-telegram-bot-api");

// Get token from Render environment variables
const token = process.env.BOT_TOKEN;

// Create bot
const bot = new TelegramBot(token, {
  polling: true
});

// Bot started
console.log("Bot is running...");

// Commands
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "✅ Your Telegram bot is working successfully!"
  );
});

// Normal messages
bot.on("message", (msg) => {
  console.log("Message received:", msg.text);
});
