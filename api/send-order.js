// ============================================
// api/send-order.js — Vercel Serverless Function
// Yeh server pe chalta hai — token/chat ID
// browser mein bilkul nahi dikhta
// ============================================

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Token aur Chat ID sirf yahan hain — browser ko kabhi nahi jaata
  const BOT_TOKEN = process.env.BOT_TOKEN;
  const CHAT_ID   = process.env.CHAT_ID;

  if (!BOT_TOKEN || !CHAT_ID) {
    return res.status(500).json({ error: "Server config missing" });
  }

  // Customer ka raw multipart body seedha Telegram ko forward karo
  // (caption aur reply_markup already index.html se aa rahe hain)
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const body = Buffer.concat(chunks);

  // Content-Type header se boundary nikalo
  const contentType = req.headers["content-type"] || "";

  // Body parse karke chat_id inject karo (customer ne nahi bheja)
  // Simplest approach: raw body ko re-stream with chat_id override
  // We'll parse the multipart manually — actually easier to just
  // proxy with chat_id from env replacing whatever customer sent
  const boundary = contentType.split("boundary=")[1];
  if (!boundary) {
    return res.status(400).json({ error: "Invalid request" });
  }

  // Replace any chat_id the client sent with our server-side one
  let modifiedBody = body.toString("latin1");

  // Remove any chat_id field sent by client (security)
  const chatIdPartRegex = /--[^\r\n]+\r\nContent-Disposition: form-data; name="chat_id"\r\n\r\n[^\r\n]*\r\n/g;
  modifiedBody = modifiedBody.replace(chatIdPartRegex, "");

  // Inject correct chat_id at the start
  const chatIdPart =
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="chat_id"\r\n\r\n` +
    `${CHAT_ID}\r\n`;

  modifiedBody = modifiedBody.replace(`--${boundary}\r\n`, chatIdPart);

  const finalBody = Buffer.from(modifiedBody, "latin1");

  try {
    const tgRes = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendDocument`,
      {
        method: "POST",
        headers: { "Content-Type": contentType },
        body: finalBody,
      }
    );
    const data = await tgRes.json();
    return res.status(tgRes.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
