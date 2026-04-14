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

    conn.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            console.log('--- DigiSolutions-MD: QR Code එක ස්කෑන් කරන්න ---');
            qrcode.generate(qr, { small: true });
        }

        if (connection === 'close') {
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) startDigiBot();
        } else if (connection === 'open') {
            console.log('✅ ' + config.BOT_NAME + ' සාර්ථකව සම්බන්ධ වුණා!');

            // --- Session ID එක WhatsApp එකට එවීමේ කොටස ---
            try {
                const credsPath = path.join(__dirname, 'auth_info_baileys', 'creds.json');
                if (fs.existsSync(credsPath)) {
                    const credsData = fs.readFileSync(credsPath);
                    const sessionId = Buffer.from(credsData).toString('base64');
                    
                    // තමාගේම අංකයට පණිවිඩය යැවීම
                    const myJid = conn.user.id.split(':')[0] + '@s.whatsapp.net';
                    await conn.sendMessage(myJid, { 
                        text: `🚀 *DigiSolutions-MD Session ID* 🚀\n\nමෙන්න ඔයාගේ Session ID එක. මෙය කොපි කර Heroku/Render Config Vars වලට ඇතුළත් කරන්න.\n\n` + 
                        `DigiSolutions;;${sessionId}` 
                    });
                    console.log('📬 Session ID එක ඔයාගේ WhatsApp එකට එව්වා!');
                }
            } catch (err) {
                console.error('Session ID එවීමේදී දෝෂයක්:', err);
            }
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
                console.error(`Error in ${name}:`, err);
            }
        }

        // Default Menu
        if (command === config.PREFIX + 'menu') {
            const menu = `👋 *Welcome to DigiSolutions-MD*\n\nOwner: Digi Solutions\nPrefix: ${config.PREFIX}\n\n*Main Commands:*\n.ai, .sticker, .status, .calc, .tr, .news\n\nUse commands with prefix.`;
            await conn.sendMessage(from, { text: menu });
        }
    });
}

startDigiBot();
