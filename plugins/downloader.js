module.exports = async (conn, from, text) => {
    if (text.startsWith('.fb ')) {
        const url = text.slice(4);
        await conn.sendMessage(from, { text: 'වීඩියෝව ලබා ගනිමින් පවතී... 📥' });
        // මෙතැනට downloader logic එක එකතු කළ හැක
    }
};
