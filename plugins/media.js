module.exports = async (conn, from, command, msg) => {
    if (command === '.sticker') {
        const isQuotedImage = msg.message.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage;
        const isImage = msg.message.imageMessage;

        if (isImage || isQuotedImage) {
            await conn.sendMessage(from, { text: '🎨 ස්ටිකරය නිර්මාණය කරමින් පවතිනවා...' });
        } else {
            await conn.sendMessage(from, { text: 'ඡායාරූපයකට .sticker ලෙස Reply කරන්න.' });
        }
    }
};
