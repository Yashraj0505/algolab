const { getAiExplanation } = require('../services/groqService');

/**
 * Controller for AI explanation endpoint.
 * Validates input, calls Groq service, returns the response.
 */
async function handleAiQuery(req, res) {
  try {
    const { prompt, selectedAlgo, history = [] } = req.body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return res.status(400).json({ error: 'Prompt is required and must be a non-empty string.' });
    }

    const reply = await getAiExplanation(prompt.trim(), selectedAlgo, history);
    return res.json({ reply });
  } catch (error) {
    console.error('AI Controller Error:', error.message);
    return res.status(500).json({
      error: 'Failed to generate AI explanation. Please check your GROQ_API_KEY.',
    });
  }
}

module.exports = { handleAiQuery };
