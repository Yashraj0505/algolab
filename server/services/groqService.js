const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/**
 * System prompt — instructs the AI to respond as a beginner-friendly algorithm tutor.
 */
const SYSTEM_PROMPT = `You are an expert algorithm tutor helping beginners understand Data Structures and Algorithms.

When the user asks about an algorithm or concept, your response MUST include:

1. **Step-by-Step Explanation** — Clearly numbered steps explaining how the algorithm works.
2. **Time Complexity** — State the best, average, and worst case time complexity.
3. **Space Complexity** — State the space complexity.
4. **Simple Explanation** — A beginner-friendly summary in 2-3 sentences using plain language.
5. **Real-Life Analogy** — A relatable real-life analogy to help the concept stick.

Rules:
- Use simple, clear language a 15-year-old could understand.
- Use markdown formatting (bold, lists, code blocks) for readability.
- If the user pastes code, explain what each part does.
- Keep responses concise but thorough.
- Be encouraging and supportive.`;

/**
 * Sends user prompt to Groq (LLaMA 3 70B) and returns the AI response.
 */
async function getAiExplanation(userPrompt, selectedAlgo, history = []) {
  const contextLine = selectedAlgo
    ? `The user is currently visualizing the **${selectedAlgo}** algorithm. `
    : '';

  const formattedPrompt = `${contextLine}${userPrompt}`;

  // Build conversation history for multi-turn memory
  const historyMessages = history.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  const chatCompletion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      ...historyMessages.slice(-10), // keep last 10 messages to avoid token overflow
      { role: 'user', content: formattedPrompt },
    ],
    temperature: 0.7,
    max_tokens: 1024,
    top_p: 1,
  });

  return chatCompletion.choices[0]?.message?.content || 'No response generated.';
}

module.exports = { getAiExplanation };
