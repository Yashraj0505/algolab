import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

export default function AiPanel({ selectedAlgo }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `👋 Now viewing **${selectedAlgo}**. Ask me anything about it!`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  // Reset chat when algorithm changes
  useEffect(() => {
    setMessages([
      {
        role: 'assistant',
        content: `👋 Now viewing **${selectedAlgo}**. Ask me anything about it!`,
      },
    ]);
  }, [selectedAlgo]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const prompt = input.trim();
    if (!prompt || loading) return;

    const updatedMessages = [...messages, { role: 'user', content: prompt }];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post('/api/ai', {
        prompt,
        selectedAlgo,
        history: updatedMessages.slice(1), // skip the initial greeting
      });
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
    <aside className="w-80 shrink-0 bg-zinc-950 border-l border-zinc-800/50 flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-zinc-800/50 shrink-0">
        <h2 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          AI Tutor
        </h2>
        <p className="text-[10px] text-zinc-500 mt-0.5">Powered by LLaMA 3 via Groq · {selectedAlgo}</p>
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
                    ? 'bg-zinc-800 text-zinc-100 border border-zinc-700/50'
                    : 'bg-zinc-900 text-zinc-300 border border-zinc-800/50'
                  }
                `}
              >
                {msg.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-zinc-900 border border-zinc-800/50 rounded-xl px-3 py-2 text-sm text-zinc-500">
              Thinking...
            </div>
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-zinc-800/50 bg-zinc-900 shrink-0">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Ask about ${selectedAlgo}...`}
            rows={1}
            className="flex-1 bg-zinc-950 border border-zinc-800/50 rounded-md px-3 py-1.5 text-sm text-zinc-200 placeholder-zinc-600 resize-none focus:outline-none focus:ring-1 focus:ring-zinc-600 focus:border-zinc-600"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="px-3 py-1.5 rounded-md bg-zinc-100 hover:bg-white disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed text-zinc-900 text-sm font-semibold transition-colors shrink-0 shadow-sm"
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
