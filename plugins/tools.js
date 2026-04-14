const translate = require('translate-google');
const math = require('mathjs');

module.exports = async (conn, from, command, body) => {
    // 1. Translation
    if (command.startsWith('.tr ')) {
        const result = await translate(body.slice(4), { to: 'si' });
        await conn.sendMessage(from, { text: `🔠 *පරිවර්තනය*: ${result}` });
    }
    // 2. Math Calculator
    if (command.startsWith('.calc ')) {
        const res = math.evaluate(body.slice(6));
        await conn.sendMessage(from, { text: `🔢 *පිළිතුර*: ${res}` });
    }
};
