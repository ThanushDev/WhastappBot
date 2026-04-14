const { Sticker, createSticker, StickerTypes } = require('wa-sticker-formatter');

module.exports = async (conn, from, command, body, msg) => {
    // 1. Sticker Maker
    if (command === '.sticker') {
        const buffer = await conn.downloadMediaMessage(msg); // මීඩියා එක බාගත කිරීම
        if (buffer) {
            const sticker = new Sticker(buffer, { pack: 'DigiSolutions', author: 'Bot', type: StickerTypes.FULL });
            await conn.sendMessage(from, await sticker.toMessage());
        }
    }
    // 2. YouTube Downloader
    if (command.startsWith('.yt ')) {
        await conn.sendMessage(from, { text: '📥 YouTube වීඩියෝව සකසමින් පවතී...' });
    }
};
