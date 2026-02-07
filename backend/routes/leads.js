const express = require('express');
const router = express.Router();
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const { Lead } = require('../database');

const upload = multer({ dest: 'uploads/' });

// Upload CSV and import leads
router.post('/upload', upload.single('file'), (req, res) => {
    const results = [];
    fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
            try {
                const leads = results.map(row => ({
                    business_name: row['Business Name'],
                    decision_maker_name: row['Decision Maker Name'],
                    email: row['Email'],
                    website: row['Website'],
                    industry: row['Industry'],
                    status: 'Pending'
                }));

                await Lead.bulkCreate(leads);
                fs.unlinkSync(req.file.path);
                res.json({ message: `${leads.length} leads imported successfully.` });
            } catch (error) {
                console.error('Import Error:', error);
                res.status(500).json({ error: 'Failed to import leads.' });
            }
        });
});

// Get all leads
router.get('/', async (req, res) => {
    try {
        const leads = await Lead.findAll({ order: [['createdAt', 'DESC']] });
        res.json(leads);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch leads.' });
    }
});

module.exports = router;
