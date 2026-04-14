const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion
} = require("@whiskeysockets/baileys");
const P = require("pino");
const config = require('./config');

async function startBot() {
    // Auth තොරතුරු සේව් වෙන්නේ මේ ෆෝල්ඩරයේයි
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
            if (shouldReconnect) startBot();
        } else if (connection === 'open') {
            console.log('✅ ' + config.BOT_NAME + ' සම්බන්ධ වුණා!');
        }
    });

    conn.ev.on('messages.upsert', async m => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const from = msg.key.remoteJid;
        const body = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
        const isCmd = body.startsWith(config.PREFIX);
        const command = isCmd ? body.slice(config.PREFIX.length).trim().split(' ')[0].toLowerCase() : "";

        // Menu Command එක
        if (command === 'menu') {
            const text = `👋 Hello! මම ${config.BOT_NAME}.\n\n*Digi Solutions* වෙතින් ඉදිරිපත් කරන සේවාවන් මෙන්න:\n1. .ai (AI Chat)\n2. .info (Bot Info)`;
            await conn.sendMessage(from, { text: text });
        }

        if (command === 'info') {
            await conn.sendMessage(from, { text: `මෙය Digi Solutions විසින් නිර්මාණය කරන ලද්දකි.` });
        }
    });
}

startBot();
