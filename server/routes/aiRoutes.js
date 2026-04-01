const express = require('express');
const router = express.Router();
const { handleAiQuery } = require('../controllers/aiController');

/**
 * POST /api/ai
 * Body: { prompt: string }
 * Response: { reply: string }
 */
router.post('/ai', handleAiQuery);

module.exports = router;
