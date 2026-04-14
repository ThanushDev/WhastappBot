const { generateContent } = require('@google/generative-ai');

module.exports = async (conn, from, text) => {
    if (text.startsWith('.ai ')) {
        const prompt = text.slice(4);
        await conn.sendMessage(from, { text: 'Digi Solutions AI සොයමින් පවතිනවා... 🔍' });
        // මෙතැනට ඔයාගේ Gemini API Key එක දාන්න පුළුවන්
        await conn.sendMessage(from, { text: `ඔයා ඇහුවේ: ${prompt}\n\n(AI පහසුකම දැනට සක්‍රීය වෙමින් පවතී)` });
    }
};
