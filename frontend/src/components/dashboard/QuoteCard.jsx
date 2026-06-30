import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import { Quote, RefreshCw } from 'lucide-react';

const quotes = [
  { text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs' },
  { text: 'You do not rise to the level of your goals. You fall to the level of your systems.', author: 'James Clear' },
  { text: 'Focus is a matter of deciding what things you are not going to do.', author: 'John Carmack' },
  { text: 'Simplify, then add lightness.', author: 'Colin Chapman' },
  { text: 'Make it work, make it right, make it fast.', author: 'Kent Beck' },
  { text: 'One day or day one. You decide.', author: 'Unknown' },
  { text: 'Action is the foundational key to all success.', author: 'Pablo Picasso' },
  { text: 'Yesterday I was clever, so I wanted to change the world. Today I am wise, so I am changing myself.', author: 'Rumi' },
];

/**
 * Section 8: Random daily motivational Quote Card widget.
 */
const QuoteCard = () => {
  const [quote, setQuote] = useState({ text: '', author: '' });
  const [spin, setSpin] = useState(false);

  const rotateQuote = () => {
    setSpin(true);
    const randomIndex = Math.floor(Math.random() * quotes.length);
    setQuote(quotes[randomIndex]);
    setTimeout(() => setSpin(false), 600);
  };

  useEffect(() => {
    rotateQuote();
  }, []);

  return (
    <Card
      title="Daily Motivation"
      hover
      action={
        <button
          onClick={rotateQuote}
          disabled={spin}
          className="p-1 rounded-lg text-text-faint hover:text-text hover:bg-bg-hover transition-all duration-200 cursor-pointer disabled:opacity-50"
          aria-label="Refresh Quote"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${spin ? 'animate-spin' : ''}`} />
        </button>
      }
      className="relative overflow-hidden h-full flex flex-col justify-between"
    >
      <div className="flex gap-3 relative">
        <Quote className="w-8 h-8 text-primary/10 flex-shrink-0 absolute top-[-6px] left-[-4px]" />
        <div className="pl-6 pt-2">
          <p className="text-sm md:text-base font-medium text-text-secondary leading-relaxed italic">
            "{quote.text}"
          </p>
          <p className="text-xs font-semibold text-primary mt-3 text-right">
            — {quote.author}
          </p>
        </div>
      </div>
    </Card>
  );
};

export default QuoteCard;
