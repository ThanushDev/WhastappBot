const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion
} = require("@whiskeysockets/baileys");
const P = require("pino");
const config = require('./config');

// Plugins Import කිරීම
const ai = require('./plugins/ai');
const downloader = require('./plugins/downloader');
const media = require('./plugins/media');

async function startDigiBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    const { version } = await fetchLatestBaileysVersion();

    const conn = makeWASocket({
        version,
        logger: P({ level: 'silent' }),
        printQRInTerminal: true,
        auth: state,
        browser: [config.BOT_NAME, "Chrome", "1.0.0"]
    });

    conn.ev.on('creds.update', saveCreds);

    conn.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) startDigiBot();
        } else if (connection === 'open') {
            console.log('✅ ' + config.BOT_NAME + ' සාර්ථකව සම්බන්ධ වුණා!');
        }
    });

    conn.ev.on('messages.upsert', async m => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const from = msg.key.remoteJid;
        const body = (msg.message.conversation || msg.message.extendedTextMessage?.text || "").trim();
        const command = body.toLowerCase();

        // මූලික Menu එක
        if (command === '.menu') {
            await conn.sendMessage(from, { text: `👋 DigiSolutions-MD මෙනුපත\n\n.ai [ප්‍රශ්නය]\n.fb [ලින්ක්]\n.sticker (ඡායාරූපයට Reply කර එවන්න)` });
        }

        // Plugins ක්‍රියාත්මක කිරීම
        await ai(conn, from, command, body);
        await downloader(conn, from, command, body);
        await media(conn, from, command, msg);
    });
}

startDigiBot();
