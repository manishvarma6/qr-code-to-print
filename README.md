# QR Print Shop System — Setup Guide

Saara code ready hai. Bas neeche diye steps follow karo (~2 hrs ek baar).

## Files

| File | Kya karta hai |
|---|---|
| `index.html` | Customer wali website — multiple PDF upload, page count, price, send |
| `qr-generator.html` | Counter pe lagane wala QR code generate + print karta hai |
| `bot.js` | Aapke PC pe chalta hai — Telegram order sunta hai, printer ko bhejta hai |
| `config.js` | Token, printer naam, price — bot.js ki settings |
| `install.bat` | Ek baar double-click — packages install karta hai |
| `start.bat` | Roz double-click — bot chalu karta hai |

## Step 1 — Telegram Bot banao

1. Telegram mein **@BotFather** ko message karo → `/newbot` → naam aur username do.
2. Wo aapko ek **token** dega (kuch aisa dikhega: `123456789:AAFxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`). Isko copy kar lo.
3. Apna **Telegram User ID** lene ke liye **@userinfobot** ko message karo. Wo numbers ka ek ID dega (e.g. `123456789`).
4. **Zaroori:** apne naye bot ko Telegram mein dhoondo aur use ek baar `/start` zaroor bhejo — warna bot aapko message nahi bhej payega.

## Step 2 — Printer ka exact naam confirm karo

Windows mein **Settings → Devices → Printers & scanners** kholo aur printer ka naam jaisa-ka-jaisa dekho. `config.js` mein jo naam diya hai (`HP LaserJet Pro MFP M126 plus series`) usse match karke confirm kar lo — ek bhi letter idhar-udhar hua to print fail ho jayega.

## Step 3 — `config.js` bharo

`config.js` kholo aur teen jagah bharo:

```js
TELEGRAM_BOT_TOKEN: "yahan apna token paste karo",
TELEGRAM_CHAT_ID: "yahan apna user ID paste karo",
PRINTER_NAME: "...", // Step 2 se confirm kiya naam
```

## Step 4 — `index.html` mein bhi wahi values bharo

`index.html` ke andar `<script>` tag ke top mein yeh block hai:

```js
const CONFIG = {
  BOT_TOKEN: "PASTE_YOUR_BOT_TOKEN_HERE",
  CHAT_ID: "PASTE_YOUR_TELEGRAM_USER_ID_HERE",
  PRICE_PER_PAGE: 5,
  SHOP_NAME: "QR Print Shop"
};
```

Yahan bhi **same** token aur chat ID daalo (`config.js` wali values).

## Step 5 — PC pe bot install + chalu karo

1. Is poore folder ko PC pe rakho.
2. `install.bat` double-click karo (sirf ek baar — Node.js packages install karega).
3. `start.bat` double-click karo — bot chalu ho jayega ("Orders ka wait kar rahe hain" dikhega).
4. Dukan band karte waqt is window ko band kar do, bot ruk jayega.

> **Node.js zaroori hai.** Agar pehle se install nahi hai, [nodejs.org](https://nodejs.org) se LTS version install karo, phir Step 5 repeat karo.

## Step 6 — Website deploy karo (free)

1. `index.html` ko GitHub repo mein push karo.
2. [vercel.com](https://vercel.com) pe jaake GitHub se connect karo, repo select karo, deploy daba do.
3. Aapko ek link milega jaise `yourshop.vercel.app`.

## Step 7 — QR code print karo

1. `qr-generator.html` ko browser mein kholo.
2. Apne Vercel link (Step 6) ko box mein daalo → **Generate QR**.
3. **Print** dabao → kaagaz pe print karke laminate kara lo → counter pe chipka do.

## Roz ka routine

- Dukan kholte waqt → `start.bat` double-click.
- Customer QR scan karke order bhejega → aapke Telegram pe PDF + price + **PRINT/REJECT** buttons aayenge.
- **PRINT** dabao → kuch second mein printer pe nikal aayega.
- Dukan band karte waqt → bot wali window band kar do.

> **Multiple files:** Customer ek se zyada PDF select kar sakta hai (tap-tap karke add bhi kar sakta hai). Website unhe automatically ek hi combined PDF mein jod deti hai (jis order mein add kiye, usi order mein), aur aapko sirf ek hi message + ek hi PRINT button milta hai poore order ke liye.

---

## ⚠️ Ek zaroori security note

Is simple setup mein, **website (`index.html`) seedha Telegram ko file bhejti hai apne browser se** — isliye Bot Token aur Chat ID `index.html` ke andar (public code) mein dikhte hain. Koi bhi "View Page Source" karke yeh dono nikal sakta hai aur:
- Aapke Telegram pe fizool messages/PDFs bhej sakta hai (spam),
- Ya bot token use karke aapke bot se "padh" sakta hai jo functionality break kar sakta hai.

Real PRINT button sirf aapke apne Telegram app mein dikhta hai, isliye koi customer ke jagah se "fake print" nahi kara sakta — lekin spam ka risk rehta hai. Ek chhote, free serverless function (Vercel `/api` route) se token chhupaya ja sakta hai agar chahiye — bata dena, main wo upgrade bhi bana dunga.
