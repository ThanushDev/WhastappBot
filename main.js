const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion
} = require("@whiskeysockets/baileys");
const P = require("pino");
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');
const config = require('./config');

// ප්ලගින් ලෝඩරය
const plugins = {};
const loadPlugins = () => {
    const pluginPath = path.join(__dirname, 'plugins');
    if (fs.existsSync(pluginPath)) {
        fs.readdirSync(pluginPath).forEach(file => {
            if (file.endsWith('.js')) {
                plugins[file] = require(path.join(pluginPath, file));
            }
        });
    }
};

async function startDigiBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    const { version } = await fetchLatestBaileysVersion();

    const conn = makeWASocket({
        version,
        logger: P({ level: 'silent' }),
        auth: state,
        browser: [config.BOT_NAME, "Chrome", "1.0.0"]
    });

    conn.ev.on('creds.update', saveCreds);
    loadPlugins();

    conn.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;

        // අර Warning එක වෙනුවට මෙතැනින් QR එක පෙන්වයි
        if (qr) {
            console.log('--- DigiSolutions-MD: WhatsApp එකෙන් මේ QR එක Scan කරන්න ---');
            qrcode.generate(qr, { small: true });
        }

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

        // ප්ලගින් ක්‍රියාත්මක කිරීම
        for (let name in plugins) {
            try {
                await plugins[name](conn, from, command, body, msg);
            } catch (err) {
                console.error(err);
            }
        }

        // Default Menu
        if (command === '.menu') {
            const menu = `👋 *Welcome to DigiSolutions-MD*\n\nPrefix: [ . ]\nOwner: Digi Solutions\n\n*Commands:*\n.ai, .sticker, .status, .calc, .tr, .news\n\nUse commands with prefix.`;
            await conn.sendMessage(from, { text: menu });
        }
    });
}

startDigiBot();
