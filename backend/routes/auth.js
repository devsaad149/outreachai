const express = require('express');
const router = express.Router();
const { getAuthUrl, getTokens, setClientCredentials } = require('../services/googleAuth');

router.get('/url', (req, res) => {
    res.json({ url: getAuthUrl() });
});

router.get('/callback', async (req, res) => {
    const { code } = req.query;
    try {
        const tokens = await getTokens(code);
        // In a real app, store these tokens in DB/Session associated with user
        setClientCredentials(tokens);
        res.send('Authentication successful! You can close this window.');
    } catch (error) {
        console.error('Auth Error:', error);
        res.status(500).send('Authentication failed.');
    }
});

module.exports = router;
