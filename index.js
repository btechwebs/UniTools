const TelegramBot = require("node-telegram-bot-api");

// Get token from Render environment variables
const token = process.env.BOT_TOKEN;

// Create bot
const bot = new TelegramBot(token, {
  polling: true
});

console.log("Bot is running...");

/* ================= FIREBASE SETUP ================= */

const admin = require("firebase-admin");

const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

/* ================= FIREBASE FUNCTIONS ================= */

async function updateUserBalance(userId, amount) {
  const userRef = db.collection("users").doc(String(userId));

  const userSnap = await userRef.get();

  if (!userSnap.exists) {
    await userRef.set({
      balance: amount,
      createdAt: new Date().toISOString()
    });
  } else {
    const currentBalance = userSnap.data().balance || 0;

    await userRef.update({
      balance: currentBalance + amount
    });
  }
}

async function saveDeposit(userId, amount) {
  await db.collection("deposits").add({
    userId,
    amount,
    status: "approved",
    createdAt: new Date().toISOString()
  });

  await updateUserBalance(userId, Number(amount));
}

/* ================= TELEGRAM COMMANDS ================= */

// Start command
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "✅ Welcome! Your bot is working.\n\nUse /deposit <amount> to add funds."
  );
});

// Deposit command
bot.onText(/\/deposit (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const amount = match[1];

  if (!amount || isNaN(amount)) {
    return bot.sendMessage(chatId, "❌ Please enter a valid amount.");
  }

  await saveDeposit(chatId, amount);

  bot.sendMessage(
    chatId,
    `💰 Deposit successful!\nAmount: ${amount}\nYour balance has been updated.`
  );
});

// Log all messages
bot.on("message", (msg) => {
  console.log("Message received:", msg.text);
});
