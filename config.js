const fs = require('fs');
if (fs.existsSync('config.env')) require('dotenv').config({
    path: './config.env'
});

function convertToBool(text, fault = 'true') {
    return text === fault ? true : false;
}

module.exports = {
    SESSION_ID: process.env.SESSION_ID || 'ඔයාගේ_SESSION_ID_එක_මෙතනට',
    PORT: process.env.PORT || 8000,
    SESSION_NAME: process.env.SESSION_NAME || "DigiSolutions_Auth",
    OWNER_NAME: "Digi Solutions",
    BOT_NAME: "DigiSolutions-MD"
};
