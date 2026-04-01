import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

/**
 * AiPanel — right-side AI tutor chat panel.
 * Sends prompts to POST /api/ai and displays responses.
 */
export default function AiPanel() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        '👋 Hi! I\'m your Algorithm Tutor.\n\nAsk me anything about algorithms — for example:\n• "Explain merge sort"\n• "What is time complexity?"\n• "Give me a real-life analogy for binary search"',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const prompt = input.trim();
    if (!prompt || loading) return;

    // Add user message
    setMessages((prev) => [...prev, { role: 'user', content: prompt }]);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post('/api/ai', { prompt });
      setMessages((prev) => [...prev, { role: 'assistant', content: res.data.reply }]);
    } catch (err) {
      const errorMsg =
        err.response?.data?.error || 'Failed to connect to AI service. Make sure the backend is running and GROQ_API_KEY is set.';
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `⚠️ Error: ${errorMsg}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <aside className="w-80 shrink-0 bg-[#0c1022] border-l border-slate-800 flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-800 shrink-0">
        <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          AI Tutor
        </h2>
        <p className="text-[10px] text-slate-500 mt-0.5">Powered by LLaMA 3 via Groq</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`
                  max-w-[95%] rounded-xl px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap
                  ${msg.role === 'user'
                    ? 'bg-indigo-600/30 text-indigo-100 border border-indigo-500/20'
                    : 'bg-slate-800/60 text-slate-300 border border-slate-700/40'
                  }
                `}
              >
                {msg.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading indicator */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-slate-800/60 border border-slate-700/40 rounded-xl px-3 py-2 text-sm text-slate-400 cursor-blink">
              Thinking
            </div>
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-slate-800 shrink-0">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about algorithms..."
            rows={1}
            className="flex-1 bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors shrink-0"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22,2 15,22 11,13 2,9" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
