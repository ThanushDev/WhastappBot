const { GoogleGenerativeAI } = require("@google/generative-ai");
const config = require('../config');

module.exports = async (conn, from, command, body) => {
    if (command.startsWith('.ai ')) {
        const text = body.slice(4);
        if (!config.GEMINI_API) return await conn.sendMessage(from, { text: "කරුණාකර API Key එක ඇතුළත් කරන්න." });

        const genAI = new GoogleGenerativeAI(config.GEMINI_API);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        try {
            const result = await model.generateContent(text);
            const response = await result.response;
            await conn.sendMessage(from, { text: response.text() });
        } catch (e) {
            await conn.sendMessage(from, { text: "AI එකේ දෝෂයක් පවතී." });
        }
    }
};
