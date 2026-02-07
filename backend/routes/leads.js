const express = require('express');
const router = express.Router();
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const { Lead } = require('../database');

const upload = multer({ dest: 'uploads/' });

// Preview CSV and suggest column mappings
router.post('/preview', upload.single('file'), (req, res) => {
    const { analyzeCSVHeaders } = require('../utils/columnMapper');
    const results = [];

    fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
            try {
                const headers = results.length > 0 ? Object.keys(results[0]) : [];
                const analysis = analyzeCSVHeaders(headers);

                // Clean up the uploaded file
                fs.unlinkSync(req.file.path);

                res.json({
                    headers,
                    suggested_mappings: analysis.mappings,
                    unmapped_columns: analysis.unmapped,
                    sample_rows: results.slice(0, 3) // Return first 3 rows as preview
                });
            } catch (error) {
                console.error('Preview Error:', error);
                fs.unlinkSync(req.file.path);
                res.status(500).json({ error: 'Failed to preview CSV.' });
            }
        });
});

// Upload CSV and import leads with custom mappings
router.post('/upload', upload.single('file'), (req, res) => {
    const { applyMappings } = require('../utils/columnMapper');
    const results = [];
    const customMappings = req.body.mappings ? JSON.parse(req.body.mappings) : null;

    fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
            try {
                let leads;

                if (customMappings) {
                    // Use custom mappings provided by user
                    leads = results.map(row => applyMappings(row, customMappings));
                } else {
                    // Fallback to exact column name matching
                    leads = results.map(row => ({
                        business_name: row['Business Name'],
                        decision_maker_name: row['Decision Maker Name'],
                        email: row['Email'],
                        website: row['Website'],
                        industry: row['Industry'],
                        status: 'Pending'
                    }));
                }

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
