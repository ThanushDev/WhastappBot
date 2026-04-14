const { GoogleGenerativeAI } = require("@google/generative-ai");
const config = require('../config');

module.exports = async (conn, from, body) => {
    if (body.startsWith('.ai ')) {
        const genAI = new GoogleGenerativeAI(config.GEMINI_API);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const res = await model.generateContent(body.slice(4));
        await conn.sendMessage(from, { text: res.response.text() });
    }
};
