const axios = require('axios');

module.exports = async () => {
    return await axios.get('http://localhost:9222/json/version')
        .then(res => res.data.webSocketDebuggerUrl)
        .catch(console.error);
};