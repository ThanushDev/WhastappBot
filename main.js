const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion
} = require("@whiskeysockets/baileys");
const P = require("pino");
const qrcode = require('qrcode-terminal'); // QR එක පෙන්වන්න මේක ඕනේ
const config = require('./config');

async function startDigiBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    const { version } = await fetchLatestBaileysVersion();

    const conn = makeWASocket({
        version,
        logger: P({ level: 'silent' }),
        auth: state,
        // printQRInTerminal: true, <-- මේ පේළිය අයින් කළා (Deprecated warning එක එන්නේ මේක නිසා)
        browser: [config.BOT_NAME, "Chrome", "1.0.0"]
    });

    conn.ev.on('creds.update', saveCreds);

    conn.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;

        // අලුත් ක්‍රමයට QR එක Terminal එකේ පෙන්වීම
        if (qr) {
            console.log('--- DigiSolutions-MD: QR Code එක ස්කෑන් කරන්න ---');
            qrcode.generate(qr, { small: true });
        }

        if (connection === 'close') {
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) startDigiBot();
        } else if (connection === 'open') {
            console.log('✅ ' + config.BOT_NAME + ' සාර්ථකව සම්බන්ධ වුණා!');
        }
    });

    // පණිවිඩ ලැබෙන තැන (Messages Upsert) කලින් දුන් පරිදිම තබන්න...
    conn.ev.on('messages.upsert', async m => {
        // (මෙහි කලින් තිබූ codes ඒ ආකාරයටම තබන්න)
    });
}

startDigiBot();
