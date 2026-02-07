const express = require('express');
const router = express.Router();
const { getAuthUrl, getTokens, setClientCredentials } = require('../services/googleAuth');

router.get('/url', (req, res) => {
    res.json({ url: getAuthUrl() });
});

// Google Callback
router.get('/google/callback', async (req, res) => {
    const { code } = req.query;
    try {
        const tokens = await getTokens(code);
        setClientCredentials(tokens);
        res.send('Authentication successful! You can close this window.');
    } catch (error) {
        console.error('Auth Error:', error);
        res.status(500).send('Authentication failed.');
    }
});

// Original Callback (keeping for backward compatibility)
router.get('/callback', async (req, res) => {
    const { code } = req.query;
    try {
        const tokens = await getTokens(code);
        setClientCredentials(tokens);
        res.send('Authentication successful! You can close this window.');
    } catch (error) {
        console.error('Auth Error:', error);
        res.status(500).send('Authentication failed.');
    }
});

module.exports = router;
