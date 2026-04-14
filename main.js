const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys");
const P = require("pino");
const fs = require('fs');
const path = require('path');
const config = require('./config');

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    const conn = makeWASocket({
        logger: P({ level: 'silent' }),
        printQRInTerminal: true,
        auth: state,
        browser: [config.BOT_NAME, "Chrome", "1.0.0"]
    });

    conn.ev.on('creds.update', saveCreds);

    conn.ev.on('messages.upsert', async m => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const from = msg.key.remoteJid;
        const body = (msg.message.conversation || msg.message.extendedTextMessage?.text || "").trim();
        
        // Plugins ඔක්කොම එකපාර Load කිරීම
        const pluginPath = path.join(__dirname, 'plugins');
        const pluginFiles = fs.readdirSync(pluginPath).filter(file => file.endsWith('.js'));

        for (const file of pluginFiles) {
            const plugin = require(path.join(pluginPath, file));
            try {
                await plugin(conn, from, body, msg);
            } catch (e) {
                console.error(`Error in ${file}:`, e);
            }
        }
    });

    conn.ev.on('connection.update', (update) => {
        if (update.connection === 'open') console.log('✅ DigiSolutions-MD Online!');
    });
}
startBot();
