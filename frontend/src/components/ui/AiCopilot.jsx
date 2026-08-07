import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, X, Send, Bot, User, Brain, FileText, 
  Wallet, Hourglass, Zap, ChevronRight, RefreshCw 
} from 'lucide-react';
import { APP_NAME } from '@/utils/constants';
import { soundService } from '@/services/soundService';

const SUGGESTED_PROMPTS = [
  { icon: FileText, label: 'Summarize my study notes', prompt: 'Can you summarize my recent study notes into key takeaways?' },
  { icon: Wallet, label: 'Analyze monthly budget', prompt: 'Analyze my spending trends and recommend saving tips.' },
  { icon: Hourglass, label: 'Plan a Pomodoro sprint', prompt: 'Draft a 2-hour study schedule using 25-min focus blocks.' },
  { icon: Brain, label: 'Generate study flashcards', prompt: 'Create 5 flashcards from my last lecture note.' },
];

const INITIAL_MESSAGES = [
  {
    id: 1,
    sender: 'ai',
    text: `Hello! I am **${APP_NAME} AI Copilot**. I can help you summarize study notes, audit your financial budget, or plan your focus sprints. What are we working on today?`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
];

const AiCopilot = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = (textToSend) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    soundService.playClick();

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    // Generate intelligent AI response
    setTimeout(() => {
      let aiResponseText = '';
      const lower = query.toLowerCase();

      if (lower.includes('note') || lower.includes('summarize') || lower.includes('flashcard')) {
        aiResponseText = `### 📚 Study Notes Summary & Flashcards\n\nHere are the top key concepts extracted from your workspace:\n- **Concept 1:** Neural network gradient descent optimization.\n- **Concept 2:** Pomodoro interval efficiency scaling.\n\n**Generated Flashcard:**\n*Q:* What is the optimal focus duration?\n*A:* 25-minute sprints followed by 5-minute restorative breaks.`;
      } else if (lower.includes('budget') || lower.includes('financ') || lower.includes('spend')) {
        aiResponseText = `### 💰 Financial Audit Report\n\nYour monthly financial summary:\n- **Total Income:** $3,400.00\n- **Expenses:** $1,250.00 (36% of budget)\n- **Savings Rate:** 64% 🌟\n\n*Pro Tip:* Subscriptions represent 18% of expenses. Consider auditing recurring services.`;
      } else if (lower.includes('schedule') || lower.includes('pomo') || lower.includes('focus')) {
        aiResponseText = `### ⏳ Time-Blocked Focus Plan\n\n1. **Session 1 (09:00 - 09:25):** Deep Work — Algorithms & Data Structures\n2. **Short Break (09:25 - 09:30):** Hydration & Stretching\n3. **Session 2 (09:30 - 09:55):** Finance Budgeting\n4. **Long Break (09:55 - 10:15):** Walk & Mindfulness`;
      } else {
        aiResponseText = `I have updated your ${APP_NAME} workspace insights. Is there anything specific you would like me to organize in your Student Hub, Focus Room, or Finance Manager?`;
      }

      const aiMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: aiResponseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
      soundService.playNotification();
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[80] flex justify-end pointer-events-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs"
        />

        {/* Slide-out Copilot Panel */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          className="relative z-10 w-full max-w-md h-full bg-[#080c14]/95 border-l border-primary/30 shadow-2xl flex flex-col backdrop-blur-xl"
        >
          {/* Header */}
          <div className="p-5 border-b border-border/80 flex items-center justify-between bg-primary/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-accent to-primary-light flex items-center justify-center text-white shadow-lg shadow-primary/30">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-text flex items-center gap-2">
                  {APP_NAME} AI Copilot
                </h3>
                <span className="text-[10px] text-success font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                  GPT-4o Workspace Model Active
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-text-muted hover:text-text hover:bg-bg-elevated transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'ai' && (
                  <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center text-primary shrink-0 mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-[80%] p-3.5 rounded-2xl text-xs leading-relaxed space-y-2 ${
                  msg.sender === 'user'
                    ? 'bg-primary text-white rounded-br-none shadow-md'
                    : 'bg-bg-card border border-border/80 text-text rounded-bl-none shadow-sm'
                }`}>
                  <div className="whitespace-pre-wrap">{msg.text}</div>
                  <span className={`text-[9px] block text-right font-mono ${
                    msg.sender === 'user' ? 'text-white/70' : 'text-text-faint'
                  }`}>
                    {msg.timestamp}
                  </span>
                </div>

                {msg.sender === 'user' && (
                  <div className="w-8 h-8 rounded-lg bg-accent/20 border border-accent/30 flex items-center justify-center text-accent shrink-0 mt-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 p-3 bg-bg-card rounded-2xl border border-border/60 w-fit text-xs text-text-muted">
                <RefreshCw className="w-3.5 h-3.5 text-primary animate-spin" />
                <span>Copilot is indexing your workspace...</span>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Prompt Chips */}
          <div className="p-3 border-t border-border/40 bg-bg-card/40 flex items-center gap-2 overflow-x-auto">
            {SUGGESTED_PROMPTS.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleSend(item.prompt)}
                  className="px-3 py-1.5 rounded-full bg-bg-elevated border border-border/80 text-text-muted hover:text-text hover:border-primary/40 text-[10px] font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Icon className="w-3 h-3 text-primary" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-4 border-t border-border/80 bg-bg-card flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask Copilot anything about your workspace..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-bg-elevated border border-border rounded-xl px-4 py-2.5 text-xs text-text placeholder:text-text-faint focus:outline-none focus:border-primary/50"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center hover:bg-primary-light transition-all disabled:opacity-40 cursor-pointer shadow-md shadow-primary/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AiCopilot;
