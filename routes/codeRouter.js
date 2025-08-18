const express = require('express');
const router = express.Router();
const { runCode } = require('../service/judge0');

router.post('/run', async (req, res) => {
    try {
        const { code, language_id, input } = req.body;

        if (!code || !language_id) {
            return res.status(400).json({ message: 'Code and language_id are required' });
        }

        const result = await runCode(code, language_id, input);

        res.status(200).json(result);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to run code' });
    }
});

module.exports = router;
