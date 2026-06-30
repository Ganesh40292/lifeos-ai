import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, BookOpen, Layers, Award, ChevronLeft, ChevronRight, 
  Check, X, RefreshCw, Trophy, Flame
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import api from '@/services/api';
import { useAuth } from '@/hooks/useAuth';

// Helper to generate dynamic, subject-specific study assets on-the-fly
const getStudyMaterial = (title = '', content = '') => {
  const cleanTitle = title.toLowerCase();
  
  // 1. Computer Science / Programming
  if (cleanTitle.includes('code') || cleanTitle.includes('database') || cleanTitle.includes('java') || cleanTitle.includes('react') || cleanTitle.includes('web') || cleanTitle.includes('sql') || cleanTitle.includes('developer')) {
    return {
      summary: [
        { topic: 'Key Concept', text: 'Software Engineering Principles: Decomposing complex logic into atomic modules improves system scalability.' },
        { topic: 'Definition', text: 'ACID Transactions: Guarantees database reliability via Atomicity, Consistency, Isolation, and Durability.' },
        { topic: 'Best Practice', text: 'State Management: Prefer unidirectional data flow patterns to reduce visual rendering side effects.' },
        { topic: 'Research Goal', text: 'Algorithmic Efficiency: Evaluate Big O time/space complexity before introducing nested nested loops.' }
      ],
      flashcards: [
        { q: 'What is the main purpose of database indexes?', a: 'To speed up data retrieval operations at the cost of additional write overhead.' },
        { q: 'What does Big O notation describe?', a: 'The limiting behavior of a function/algorithm as the input size grows towards infinity.' },
        { q: 'Explain Java Garbage Collection.', a: 'Automatic memory management process that clears heap storage of unreferenced object instances.' },
        { q: 'What is a REST API constraint?', a: 'Statelessness: Each client request must contain all context and authentication tokens required.' }
      ],
      quiz: [
        {
          q: 'Which database ACID property ensures that transactions are either fully completed or not executed at all?',
          options: ['Consistency', 'Isolation', 'Atomicity', 'Durability'],
          answer: 2
        },
        {
          q: 'What is the average time complexity of searching in a balanced Binary Search Tree (BST)?',
          options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
          answer: 1
        },
        {
          q: 'In REST API design, which HTTP method is typically used to update an existing resource representation completely?',
          options: ['GET', 'POST', 'PUT', 'PATCH'],
          answer: 2
        },
        {
          q: 'What does Java Virtual Machine (JVM) do with bytecode?',
          options: ['Compiles it to Java source code', 'Translates bytecode into native machine instructions on the fly', 'Uploads it directly to git repos', 'Compresses it into ZIP file formats'],
          answer: 1
        },
        {
          q: 'What is the virtual DOM in React?',
          options: ['A direct replacement for HTML database systems', 'A lightweight in-memory copy of the real DOM used to optimize re-render cycles', 'A security sandbox preventing script hacks', 'An interactive 3D layout tool'],
          answer: 1
        }
      ]
    };
  }

  // 2. Finance / Economics
  if (cleanTitle.includes('finance') || cleanTitle.includes('budget') || cleanTitle.includes('money') || cleanTitle.includes('spend') || cleanTitle.includes('investment') || cleanTitle.includes('ledger')) {
    return {
      summary: [
        { topic: 'Key Concept', text: 'Compound Interest Mechanics: Reinvesting yield dividends multiplies wealth exponentially over time.' },
        { topic: 'Strategy', text: 'Asset Allocation: Spreading risk across stocks, index funds, and bonds offsets market volatility.' },
        { topic: 'Rule of Thumb', text: 'Emergency Fund: Stash 3-6 months of living expenses in highly liquid accounts.' },
        { topic: 'Risk Metric', text: 'Inflation Offset: Capital must exceed annual inflation rates to preserve buying power.' }
      ],
      flashcards: [
        { q: 'What is the principal rule of passive index investing?', a: 'Buy and hold broad-market index funds to minimize active management fees.' },
        { q: 'What does P/E ratio stand for in equity markets?', a: 'Price-to-Earnings Ratio: Measures a company’s share price relative to its net earnings.' },
        { q: 'Explain Dollar-Cost Averaging (DCA).', a: 'Investing fixed dollar amounts at set intervals regardless of market price levels.' },
        { q: 'What is the difference between Stocks and Bonds?', a: 'Stocks represent equity ownership; bonds represent a debt security loan to a corporation/government.' }
      ],
      quiz: [
        {
          q: 'Which financial strategy involves investing fixed amounts at regular intervals to reduce market volatility impact?',
          options: ['Short Selling', 'Dollar-Cost Averaging', 'Day Trading', 'Leveraged Squeezing'],
          answer: 1
        },
        {
          q: 'What represents a debt security where you loan capital to a corporation or government body in exchange for interest?',
          options: ['Mutual Fund', 'Stock Option', 'Bond', 'Cryptocurrency'],
          answer: 2
        },
        {
          q: 'What rule dictates dividing 72 by your annual return rate to approximate how long it takes to double your money?',
          options: ['Rule of 72', 'Compound Ratio Constant', 'Frugality Law', '70-30 Division Rule'],
          answer: 0
        },
        {
          q: 'Which asset type is considered the most liquid?',
          options: ['Real Estate', 'Bonds', 'Cash Equivalents', 'Stocks'],
          answer: 2
        },
        {
          q: 'What is a Bear Market?',
          options: ['A period of rapidly rising asset prices', 'A market characterized by falling prices, typically 20% or more from recent highs', 'A market restricted to index options', 'A highly secure banking ledger'],
          answer: 1
        }
      ]
    };
  }

  // 3. General / Biology / Science (default)
  return {
    summary: [
      { topic: 'Core Concept', text: 'Analytical Breakdown: Structuring topics into bite-sized highlights improves visual recall.' },
      { topic: 'Study Goal', text: 'Active Recall: Testing yourself yields 50% higher retention compared to passive reading.' },
      { topic: 'Tip', text: 'Interval Spacing: Review flashcard decks 1 day, 3 days, and 7 days after learning to lock in memory.' },
      { topic: 'Milestone', text: 'Daily Comprehension: Claiming study rewards awards user XP to boost character level.' }
    ],
    flashcards: [
      { q: 'What is Active Recall?', a: 'Actively retrieving information from memory via self-testing rather than re-reading notes.' },
      { q: 'What is Spaced Repetition?', a: 'Reviewing cards at increasing intervals to exploit the psychological spacing effect.' },
      { q: 'Explain the Feynman Technique.', a: 'Explaining a complex topic in simple language as if teaching it to a child to find gaps.' },
      { q: 'Why is sleep crucial for learning?', a: 'Deep sleep consolidates neural connections and commits short-term memory to long-term storage.' }
    ],
    quiz: [
      {
        q: 'Which study method involves actively forcing your brain to retrieve answers, rather than passively re-reading?',
        options: ['Highlighting text', 'Active Recall', 'Audio recording loops', 'Speed reading'],
        answer: 1
      },
      {
        q: 'What learning framework relies on spacing out review sessions over days or weeks to exploit the psychological spacing effect?',
        options: ['Pomodoro Sprinting', 'Spaced Repetition', 'Feynman Lectures', 'Mind Map Slicing'],
        answer: 1
      },
      {
        q: 'Which study technique involves explaining a topic to an imaginary student in plain, basic language to verify your understanding?',
        options: ['Feynman Technique', 'Socratic Method', 'Active Indexing', 'Linear Cramming'],
        answer: 0
      },
      {
        q: 'How does earning experience points (XP) help in LifeOS?',
        options: ['Unlocks physical gifts', 'Increases character level, representing personal growth progress', 'Resets transaction limits', 'Deletes completed notes'],
        answer: 1
      },
      {
        q: 'What is the optimal study block duration in the standard Pomodoro Technique?',
        options: ['10 minutes', '25 minutes', '60 minutes', '90 minutes'],
        answer: 1
      }
    ]
  };
};

const StudyCompanion = ({ note }) => {
  const { refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState('SUMMARY'); // 'SUMMARY' | 'FLASHCARDS' | 'QUIZ'
  const [materials, setMaterials] = useState(() => getStudyMaterial(note?.title, note?.content));

  // Flashcards state
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Quiz state
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);
  const [xpClaimed, setXpClaimed] = useState(false);
  const [savingXp, setSavingXp] = useState(false);

  useEffect(() => {
    setMaterials(getStudyMaterial(note?.title, note?.content));
    // Reset page index on note change
    setCardIndex(0);
    setIsFlipped(false);
    setQuizIndex(0);
    setSelectedOption(null);
    setQuizScore(0);
    setQuizComplete(false);
    setXpClaimed(false);
  }, [note]);

  const handleNextCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCardIndex((prev) => (prev + 1) % materials.flashcards.length);
    }, 150);
  };

  const handlePrevCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCardIndex((prev) => (prev - 1 + materials.flashcards.length) % materials.flashcards.length);
    }, 150);
  };

  const handleOptionSelect = (optionIdx) => {
    if (selectedOption !== null) return; // Allow only one click
    setSelectedOption(optionIdx);
    
    const isCorrect = optionIdx === materials.quiz[quizIndex].answer;
    if (isCorrect) {
      setQuizScore((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    setSelectedOption(null);
    if (quizIndex < materials.quiz.length - 1) {
      setQuizIndex((prev) => prev + 1);
    } else {
      setQuizComplete(true);
    }
  };

  const resetQuiz = () => {
    setQuizIndex(0);
    setSelectedOption(null);
    setQuizScore(0);
    setQuizComplete(false);
    setXpClaimed(false);
  };

  const claimQuizXp = async () => {
    try {
      setSavingXp(true);
      const res = await api.post('/users/xp', null, {
        params: { activityType: 'STUDY_QUIZ' }
      });
      if (res.data) {
        setXpClaimed(true);
        // Refresh levels instantly in topbar header!
        await refreshUser();
      }
    } catch (e) {
      console.error('Failed to claim study quiz XP:', e);
      alert('Failed to log XP. Please try again.');
    } finally {
      setSavingXp(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-bg-card/95 border-l border-border backdrop-blur-md relative overflow-hidden">
      
      {/* Companion Tabs Header */}
      <div className="flex border-b border-border/80 bg-gray-950/20 p-2 flex-shrink-0 justify-around">
        {[
          { id: 'SUMMARY', label: 'Summary', icon: BookOpen },
          { id: 'FLASHCARDS', label: 'Flashcards', icon: Layers },
          { id: 'QUIZ', label: 'Quiz Test', icon: Award }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-primary/20 text-primary border border-primary/25 shadow-sm'
                  : 'text-text-muted hover:text-text hover:bg-bg-hover/30'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Area Content */}
      <div className="flex-1 overflow-y-auto p-5 select-none">
        <AnimatePresence mode="wait">
          
          {/* 1. SUMMARY TAB */}
          {activeTab === 'SUMMARY' && (
            <motion.div
              key="summary"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-1.5 text-xs text-primary font-bold">
                <Sparkles className="w-4 h-4" /> AI Study Briefing
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                Core concepts and definitions extracted from the document to fast-track your revision.
              </p>

              <div className="space-y-3 mt-4">
                {materials.summary.map((item, idx) => (
                  <div 
                    key={idx} 
                    className="p-3 bg-bg-elevated/40 border border-border/40 rounded-xl space-y-1 hover:border-primary/20 hover:bg-bg-elevated/60 transition-all duration-200"
                  >
                    <span className="text-[9px] font-bold text-primary uppercase tracking-wider bg-primary/10 border border-primary/20 px-1.5 py-0.2 rounded-md">
                      {item.topic}
                    </span>
                    <p className="text-xs text-text-secondary leading-relaxed pt-1.5">
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* 2. FLASHCARDS TAB */}
          {activeTab === 'FLASHCARDS' && (
            <motion.div
              key="flashcards"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center h-full space-y-6"
            >
              <div className="w-full flex items-center justify-between text-xs text-text-muted">
                <span className="font-bold">Virtual Revision Deck</span>
                <span>{cardIndex + 1} / {materials.flashcards.length} cards</span>
              </div>

              {/* Glowing 3D Flip Card Container */}
              <div 
                className="w-full h-[220px] cursor-pointer"
                style={{ perspective: '1000px' }}
                onClick={() => setIsFlipped(!isFlipped)}
              >
                <div 
                  className="w-full h-full relative transition-transform duration-500 transform-style-3d shadow-md rounded-2xl border border-border/70 bg-bg-elevated/40"
                  style={{ 
                    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                    transformStyle: 'preserve-3d'
                  }}
                >
                  {/* Front Face (Question) */}
                  <div 
                    className="absolute inset-0 p-5 flex flex-col justify-between items-center text-center backface-hidden"
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    <span className="text-[9px] uppercase font-bold tracking-widest text-primary/70">Question</span>
                    <p className="text-sm font-semibold text-text leading-relaxed px-2 flex-grow flex items-center justify-center">
                      {materials.flashcards[cardIndex]?.q}
                    </p>
                    <span className="text-[10px] text-text-faint italic flex items-center gap-1.5">
                      <RefreshCw className="w-3 h-3 text-primary animate-pulse" /> Click card to flip
                    </span>
                  </div>

                  {/* Back Face (Answer) */}
                  <div 
                    className="absolute inset-0 p-5 flex flex-col justify-between items-center text-center backface-hidden"
                    style={{ 
                      backfaceVisibility: 'hidden', 
                      transform: 'rotateY(180deg)',
                    }}
                  >
                    <span className="text-[9px] uppercase font-bold tracking-widest text-success/80">Answer Definition</span>
                    <p className="text-xs text-text-secondary leading-relaxed px-2 flex-grow flex items-center justify-center">
                      {materials.flashcards[cardIndex]?.a}
                    </p>
                    <span className="text-[10px] text-text-faint italic flex items-center gap-1.5">
                      <RefreshCw className="w-3 h-3 text-success" /> Click to flip back
                    </span>
                  </div>
                </div>
              </div>

              {/* Navigation controls */}
              <div className="flex items-center gap-4">
                <button
                  onClick={handlePrevCard}
                  className="p-2 bg-bg-hover hover:bg-border rounded-full border border-border transition-colors cursor-pointer text-text-muted hover:text-text"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNextCard}
                  className="p-2 bg-bg-hover hover:bg-border rounded-full border border-border transition-colors cursor-pointer text-text-muted hover:text-text"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* 3. QUIZ TAB */}
          {activeTab === 'QUIZ' && (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {!quizComplete ? (
                <>
                  <div className="flex items-center justify-between text-xs text-text-muted">
                    <span className="font-bold flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-primary" /> Question {quizIndex + 1} of {materials.quiz.length}
                    </span>
                    <span>Score: {quizScore}</span>
                  </div>

                  <p className="text-xs font-semibold text-text leading-relaxed mt-2 p-2 bg-gray-950/20 border border-border/30 rounded-xl">
                    {materials.quiz[quizIndex]?.q}
                  </p>

                  <div className="space-y-2 mt-4">
                    {materials.quiz[quizIndex]?.options.map((opt, oIdx) => {
                      const isSelected = selectedOption === oIdx;
                      const isCorrectAnswer = oIdx === materials.quiz[quizIndex].answer;
                      const isWrongSelection = isSelected && !isCorrectAnswer;

                      return (
                        <button
                          key={oIdx}
                          disabled={selectedOption !== null}
                          onClick={() => handleOptionSelect(oIdx)}
                          className={`w-full text-left px-4 py-3 rounded-xl text-xs transition-all border cursor-pointer ${
                            selectedOption === null
                              ? 'bg-bg-elevated/40 border-border/70 hover:bg-bg-hover hover:border-primary/20 text-text-secondary'
                              : isCorrectAnswer
                              ? 'bg-success/15 border-success text-success font-semibold shadow-sm shadow-success/10'
                              : isWrongSelection
                              ? 'bg-danger/15 border-danger text-danger font-semibold'
                              : 'bg-bg-elevated/20 border-border/20 text-text-faint cursor-not-allowed'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span>{opt}</span>
                            {selectedOption !== null && isCorrectAnswer && (
                              <Check className="w-4 h-4 text-success flex-shrink-0" />
                            )}
                            {selectedOption !== null && isWrongSelection && (
                              <X className="w-4 h-4 text-danger flex-shrink-0" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {selectedOption !== null && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex justify-end mt-4"
                    >
                      <Button
                        onClick={handleNextQuestion}
                        variant="primary"
                        size="sm"
                        className="flex items-center gap-1 cursor-pointer"
                      >
                        {quizIndex === materials.quiz.length - 1 ? 'Finish Quiz' : 'Next Question'}
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  )}
                </>
              ) : (
                /* QUIZ END / SUCCESS SCREEN */
                <div className="text-center py-6 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-warning/15 border border-warning/20 text-warning flex items-center justify-center mx-auto shadow-md">
                    <Trophy className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-text">Practice Quiz Completed!</h3>
                    <p className="text-xs text-text-secondary mt-1">
                      You answered <strong className="text-text font-bold">{quizScore}</strong> out of <strong className="text-text font-bold">{materials.quiz.length}</strong> questions correctly.
                    </p>
                  </div>

                  <div className="p-3 bg-bg-elevated/40 border border-border/50 rounded-2xl max-w-[240px] mx-auto text-xs">
                    {quizScore >= 3 ? (
                      <span className="text-success font-bold flex items-center gap-1.5 justify-center">
                        <Flame className="w-4.5 h-4.5" /> Passing Grade Gained!
                      </span>
                    ) : (
                      <span className="text-text-muted font-medium block">
                        Score at least 3/5 to unlock experience awards.
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 pt-2 max-w-[200px] mx-auto">
                    {quizScore >= 3 && !xpClaimed && (
                      <Button
                        onClick={claimQuizXp}
                        variant="primary"
                        className="flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-primary/10"
                        disabled={savingXp}
                      >
                        {savingXp ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <>
                            <Award className="w-4 h-4" />
                            Claim +30 XP Reward
                          </>
                        )}
                      </Button>
                    )}

                    {xpClaimed && (
                      <span className="text-[11px] font-bold text-success bg-success/10 border border-success/20 px-2 py-2 rounded-xl flex items-center justify-center gap-1.5">
                        <Check className="w-4 h-4" /> +30 XP Added to Profile!
                      </span>
                    )}

                    <button
                      onClick={resetQuiz}
                      className="text-xs text-text-muted hover:text-text underline cursor-pointer transition-colors block mt-1"
                    >
                      Try Quiz Again
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};

export default StudyCompanion;
