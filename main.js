const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion
} = require("@whiskeysockets/baileys");
const P = require("pino");
const config = require('./config');

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
            console.log('✅ DigiSolutions-MD සාර්ථකව ක්‍රියාත්මකයි!');
        }
    });

    conn.ev.on('messages.upsert', async m => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const from = msg.key.remoteJid;
        const body = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
        const command = body.toLowerCase();

        // සරල Commands කිහිපයක්
        if (command === 'menu') {
            const menuText = `👋 Hello! මම DigiSolutions Bot.\n\nමෙන්න මගේ පහසුකම්:\n1. .ai [ප්‍රශ්නය]\n2. .fb [ලින්ක් එක]\n3. .sticker [ඡායාරූපය]`;
            await conn.sendMessage(from, { text: menuText });
        }
        
        if (command.startsWith('.ai')) {
             await conn.sendMessage(from, { text: 'මම මේ ගැන සොයා බලමින් සිටිනවා...' });
             // මෙතැනට package.json හි ඇති @google/generative-ai සම්බන්ධ කළ හැක
        }
    });
}

startDigiBot();
