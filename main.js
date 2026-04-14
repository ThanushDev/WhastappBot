const { default: makeWASocket, useMultiFileAuthState, jidDecode } = require("@whiskeysockets/baileys");
const P = require("pino");
const fs = require('fs');
const path = require('path');
const config = require('./config');

// Plugin Loader එක
const plugins = {};
const loadPlugins = () => {
    const pluginPath = path.join(__dirname, 'plugins');
    if (!fs.existsSync(pluginPath)) fs.mkdirSync(pluginPath);
    fs.readdirSync(pluginPath).forEach(file => {
        if (file.endsWith('.js')) {
            plugins[file] = require(path.join(pluginPath, file));
        }
    });
};

async function startDigiBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    const conn = makeWASocket({
        logger: P({ level: 'silent' }),
        printQRInTerminal: true,
        auth: state,
        browser: [config.BOT_NAME, "Safari", "3.0"]
    });

    conn.ev.on('creds.update', saveCreds);
    loadPlugins();

    conn.ev.on('messages.upsert', async m => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const from = msg.key.remoteJid;
        const body = (msg.message.conversation || msg.message.extendedTextMessage?.text || "").trim();
        const command = body.toLowerCase();

        // සියලුම Plugins එකවර ක්‍රියාත්මක කිරීම
        for (let name in plugins) {
            try {
                await plugins[name](conn, from, command, body, msg);
            } catch (err) {
                console.error(`Plugin Error (${name}):`, err);
            }
        }
    });

    conn.ev.on('connection.update', (up) => {
        if (up.connection === 'open') console.log(`✅ ${config.BOT_NAME} සාර්ථකව සම්බන්ධ වුණා!`);
        if (up.connection === 'close') startDigiBot();
    });
}

startDigiBot();
