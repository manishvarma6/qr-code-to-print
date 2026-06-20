// ============================================
// QR PRINT SHOP — BOT.JS
// Yeh script aapke PC pe chalta hai (start.bat se).
// Customer ka order Telegram pe aata hai, aap PRINT
// dabate ho, ye file download karke printer ko bhej deta hai.
// ============================================

const TelegramBot = require("node-telegram-bot-api");
const { print } = require("pdf-to-printer");
const fs = require("fs");
const path = require("path");
const config = require("./config");

// ---- Config check ----
if (!config.TELEGRAM_BOT_TOKEN || config.TELEGRAM_BOT_TOKEN.includes("PASTE_")) {
  console.log("❌ config.js mein TELEGRAM_BOT_TOKEN nahi bhara hai. Pehle wo fill karo.");
  process.exit(1);
}
if (!config.TELEGRAM_CHAT_ID || config.TELEGRAM_CHAT_ID.includes("PASTE_")) {
  console.log("❌ config.js mein TELEGRAM_CHAT_ID nahi bhara hai. Pehle wo fill karo.");
  process.exit(1);
}

const ORDERS_DIR = path.join(__dirname, "orders");
if (!fs.existsSync(ORDERS_DIR)) fs.mkdirSync(ORDERS_DIR);

const bot = new TelegramBot(config.TELEGRAM_BOT_TOKEN, { polling: true });

console.log("============================================");
console.log(`✅ ${config.SHOP_NAME} bot chalu ho gaya hai`);
console.log(`🖨️  Printer: ${config.PRINTER_NAME}`);
console.log("📲 Orders ka wait kar rahe hain... (band karne ke liye yeh window band karo)");
console.log("============================================");

bot.on("polling_error", (err) => {
  console.log("⚠️ Polling error:", err.message);
});

bot.on("callback_query", async (query) => {
  const chatId = query.message.chat.id;
  const messageId = query.message.message_id;
  const action = query.data;
  const oldCaption = query.message.caption || "";

  // Sirf shop owner (aap) hi PRINT/REJECT dabaa sako, koi aur nahi
  if (String(chatId) !== String(config.TELEGRAM_CHAT_ID)) {
    await bot.answerCallbackQuery(query.id, { text: "Aap authorized nahi ho." });
    return;
  }

  // ---- REJECT ----
  if (action === "reject") {
    await bot.answerCallbackQuery(query.id, { text: "Order reject kar diya" });
    await bot.editMessageCaption(oldCaption + "\n\n❌ REJECTED", {
      chat_id: chatId,
      message_id: messageId,
      reply_markup: { inline_keyboard: [] },
    });
    return;
  }

  // ---- PRINT ----
  if (action === "print") {
    const document = query.message.document;
    if (!document) {
      await bot.answerCallbackQuery(query.id, { text: "PDF file nahi mili!" });
      return;
    }

    try {
      await bot.answerCallbackQuery(query.id, { text: "Printing shuru ho rahi hai..." });

      // Telegram se file download karo
      const fileLink = await bot.getFileLink(document.file_id);
      const localPath = path.join(ORDERS_DIR, `order_${Date.now()}.pdf`);

      const response = await fetch(fileLink);
      const arrayBuffer = await response.arrayBuffer();
      fs.writeFileSync(localPath, Buffer.from(arrayBuffer));

      // Printer ko bhejo
      await print(localPath, { printer: config.PRINTER_NAME });

      await bot.editMessageCaption(oldCaption + "\n\n✅ PRINTED", {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: { inline_keyboard: [] },
      });

      console.log(`🖨️  Print ho gaya: ${localPath}`);
    } catch (err) {
      console.error("Print error:", err);
      await bot.sendMessage(
        chatId,
        `⚠️ Print fail ho gaya.\nWajah: ${err.message}\n\nCheck karo:\n- Printer ka naam config.js mein EXACT match hai?\n- Printer ON hai aur PC se connected hai?`
      );
    }
  }
});
