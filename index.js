const TelegramBot = require("node-telegram-bot-api");
const admin = require("firebase-admin");

// Telegram token from Render env later
const token = process.env.BOT_TOKEN;

const bot = new TelegramBot(token, { polling: true });

// Firebase setup (we will fix key later)
admin.initializeApp({
  credential: admin.credential.cert(require("./serviceAccountKey.json")),
  databaseURL: "https://crypto-earn-86252-default-rtdb.firebaseio.com"
});

const db = admin.database();

bot.on("message", async (msg) => {
  const text = msg.text;

  if (text.startsWith("/approve")) {
    const parts = text.split(" ");

    const userId = parts[1];
    const accountNumber = parts[2];
    const bankName = parts[3];
    const accountName = parts.slice(4).join(" ");

    await db.ref("depositRequests/" + userId).set({
      status: "approved",
      accountNumber,
      bankName,
      accountName
    });

    bot.sendMessage(msg.chat.id, "Sent to user ✅");
  }
});
