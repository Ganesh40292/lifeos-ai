import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Network, GraduationCap, Hourglass, Wallet, Sparkles, Lock, CheckCircle, 
  HelpCircle, ChevronRight, Zap, Info, ShieldAlert
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

// Audio feedback synthethizer for skill node unlocks!
const playUnlockSound = (frequency = 440, type = 'sine') => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(frequency * 1.5, ctx.currentTime + 0.15);
    
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch (e) {
    console.error('Audio synthesizer failed:', e);
  }
};

const SKILL_NODES = {
  academics: [
    {
      id: 'study_initiate',
      title: 'Study Initiate',
      desc: 'Unlock basic structured note-taking disciplines. Grants +5% visual XP focus boosts.',
      cost: 1,
      minLevel: 1,
      prereq: null,
      bonus: 'Note taking efficiency'
    },
    {
      id: 'lecture_analyst',
      title: 'Lecture Analyst',
      desc: 'Double note summary speeds and AI brief translations. Requires Study Initiate.',
      cost: 2,
      minLevel: 3,
      prereq: 'study_initiate',
      bonus: 'Summary highlights x2'
    },
    {
      id: 'research_sage',
      title: 'Research Sage',
      desc: 'Achieve ultimate academic wisdom. Unlocks note directory automation guides. Requires Lecture Analyst.',
      cost: 3,
      minLevel: 5,
      prereq: 'lecture_analyst',
      bonus: 'Folder tags sorting'
    }
  ],
  focus: [
    {
      id: 'focus_core',
      title: 'Concentration Core',
      desc: 'Enter focus mode with stable baseline focus. Pomodoros award +5 extra XP points.',
      cost: 1,
      minLevel: 1,
      prereq: null,
      bonus: '+5 XP on focus completion'
    },
    {
      id: 'ambient_acoustics',
      title: 'lo-fi Acousticist',
      desc: 'Unlock deeper lofi audio drone synthesis intervals. Requires Concentration Core.',
      cost: 2,
      minLevel: 3,
      prereq: 'focus_core',
      bonus: 'Audio waves filters'
    },
    {
      id: 'flow_state',
      title: 'Flow State Master',
      desc: 'Achieve zero-fatigue deep work periods. Pomodoros complete 10% faster. Requires lo-fi Acousticist.',
      cost: 3,
      minLevel: 5,
      prereq: 'ambient_acoustics',
      bonus: 'Pomodoro speed boost'
    }
  ],
  finance: [
    {
      id: 'ledger_architect',
      title: 'Ledger Architect',
      desc: 'Enable instant budgeting columns. Log expense/incomes dynamically.',
      cost: 1,
      minLevel: 1,
      prereq: null,
      bonus: 'Multi currency switch'
    },
    {
      id: 'frugal_scholar',
      title: 'Frugal Scholar',
      desc: 'Configure alert triggers on budgets. Warns when limit > 80%. Requires Ledger Architect.',
      cost: 2,
      minLevel: 3,
      prereq: 'ledger_architect',
      bonus: 'Smart insights indicators'
    },
    {
      id: 'wealth_builder',
      title: 'Wealth Compounder',
      desc: 'Achieve automated savings allocations. Grants passive XP yields. Requires Frugal Scholar.',
      cost: 3,
      minLevel: 5,
      prereq: 'frugal_scholar',
      bonus: 'Goal progress rates'
    }
  ]
};

const SkillsPage = () => {
  const { user } = useAuth();
  
  // Load unlocked nodes from localStorage
  const [unlockedSkills, setUnlockedSkills] = useState(() => {
    const saved = localStorage.getItem('lifeos_unlocked_skills');
    return saved ? JSON.parse(saved) : ['study_initiate', 'focus_core']; // Start with starter nodes unlocked
  });

  const [selectedNode, setSelectedNode] = useState(null);

  // Skill Points = User level - count of unlocked skills (excluding free starters)
  const totalStarters = 2; // study_initiate & focus_core are starter nodes
  const totalCostUnlocked = unlockedSkills.reduce((acc, curr) => {
    // Find node in all branches
    let node = null;
    Object.values(SKILL_NODES).forEach(branch => {
      const match = branch.find(n => n.id === curr);
      if (match) node = match;
    });
    // Starter nodes cost 0 to keep points math logical
    if (curr === 'study_initiate' || curr === 'focus_core') return acc;
    return acc + (node ? node.cost : 0);
  }, 0);

  const level = user?.level || 1;
  // Calculate total skill points available based on character level
  const totalPointsEarned = level;
  const spentPoints = totalCostUnlocked;
  const availableSkillPoints = Math.max(0, totalPointsEarned - spentPoints);

  const handleUnlockSkill = (node) => {
    if (unlockedSkills.includes(node.id)) return;
    if (availableSkillPoints < node.cost) return;
    if (level < node.minLevel) return;
    if (node.prereq && !unlockedSkills.includes(node.prereq)) return;

    // Synthesize unlock sound!
    playUnlockSound(587.33, 'sine'); // D5 note for success
    
    const updated = [...unlockedSkills, node.id];
    setUnlockedSkills(updated);
    localStorage.setItem('lifeos_unlocked_skills', JSON.stringify(updated));
    setSelectedNode(node);
  };

  const isUnlockable = (node) => {
    if (unlockedSkills.includes(node.id)) return false;
    if (availableSkillPoints < node.cost) return false;
    if (level < node.minLevel) return false;
    if (node.prereq && !unlockedSkills.includes(node.prereq)) return false;
    return true;
  };

  const getStatus = (node) => {
    if (unlockedSkills.includes(node.id)) return 'UNLOCKED';
    if (level < node.minLevel) return 'LOCKED_LEVEL';
    if (node.prereq && !unlockedSkills.includes(node.prereq)) return 'LOCKED_PREREQ';
    if (availableSkillPoints < node.cost) return 'INSUFFICIENT_POINTS';
    return 'READY';
  };

  return (
    <div className="page-container flex flex-col gap-6 select-none">
      
      {/* Skill Tree Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Network className="w-8 h-8 text-primary animate-pulse" />
            RPG Skill Tree
          </h1>
          <p className="page-subtitle">
            Spend accumulated character levels to unlock powerful attributes, multipliers, and study multipliers.
          </p>
        </div>
        
        {/* Skill Point stats cards */}
        <div className="flex gap-4 items-center bg-bg-card/75 border border-border px-4 py-3 rounded-2xl shadow-sm">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-text-muted">Character Level</span>
            <span className="text-xl font-black text-primary flex items-center gap-1.5 mt-0.5">
              <Zap className="w-4 h-4 fill-primary animate-bounce" /> Level {level}
            </span>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-text-muted">Unspent Skill Points</span>
            <span className="text-xl font-black text-accent flex items-center gap-1.5 mt-0.5">
              <Sparkles className="w-4 h-4 fill-accent" /> {availableSkillPoints} SP
            </span>
          </div>
        </div>
      </div>

      {/* Main layout: Tree view on left, Node details card on right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Columns: Skill Branches */}
        <div className="lg:col-span-2 space-y-6">
          {[
            { id: 'academics', label: 'Academics Branch', icon: GraduationCap, colorClass: 'text-primary border-primary/20 bg-primary/5' },
            { id: 'focus', label: 'Focus & Productivity Branch', icon: Hourglass, colorClass: 'text-accent border-accent/20 bg-accent/5' },
            { id: 'finance', label: 'Finance & Saving Branch', icon: Wallet, colorClass: 'text-success border-success/20 bg-success/5' }
          ].map((branch) => {
            const Icon = branch.icon;
            const nodes = SKILL_NODES[branch.id];
            
            return (
              <Card 
                key={branch.id}
                title={
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg border ${branch.colorClass}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-bold text-text">{branch.label}</span>
                  </div>
                }
              >
                {/* Horizontal branch map connected by line nodes */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-4 px-2 relative">
                  {nodes.map((node, index) => {
                    const status = getStatus(node);
                    const isUnlocked = status === 'UNLOCKED';
                    
                    return (
                      <div key={node.id} className="flex-1 flex items-center w-full relative">
                        {/* Interactive Node bubble */}
                        <div 
                          onClick={() => {
                            setSelectedNode(node);
                            playUnlockSound(261.63 + (index * 60), 'triangle'); // Play subtle focus sound
                          }}
                          className={`flex flex-col items-center justify-center p-4 rounded-2xl border text-center w-full cursor-pointer transition-all duration-300 relative overflow-hidden group ${
                            isUnlocked
                              ? 'bg-primary/10 border-primary shadow-lg shadow-primary/5'
                              : status === 'READY'
                              ? 'bg-bg-card hover:bg-bg-hover border-accent/50 border-dashed animate-pulse'
                              : 'bg-bg-elevated/40 border-border/50 opacity-60 hover:opacity-100'
                          }`}
                        >
                          {/* Top Tag */}
                          <div className="flex justify-between items-center w-full text-[9px] font-bold text-text-muted mb-2 uppercase">
                            <span>Tier {index + 1}</span>
                            {isUnlocked ? (
                              <span className="text-success">Active</span>
                            ) : (
                              <span>Cost: {node.cost} SP</span>
                            )}
                          </div>

                          <h3 className={`text-xs font-black ${isUnlocked ? 'text-primary' : 'text-text'}`}>
                            {node.title}
                          </h3>
                          <span className="text-[10px] text-text-muted mt-1 truncate max-w-full">
                            Min Level: {node.minLevel}
                          </span>

                          {/* Lock Overlay */}
                          {!isUnlocked && status !== 'READY' && (
                            <div className="absolute top-1.5 right-1.5 p-1 bg-gray-950/40 rounded-lg text-text-faint">
                              <Lock className="w-3 h-3" />
                            </div>
                          )}
                        </div>

                        {/* Visual connecting arrow (draw arrow if not the last item) */}
                        {index < nodes.length - 1 && (
                          <div className="hidden md:flex items-center justify-center text-text-faint px-1">
                            <ChevronRight className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Right Column: Skill Node Details/Activation Panel */}
        <div className="flex flex-col gap-6">
          <Card title="Node Inspector" className="h-full">
            <AnimatePresence mode="wait">
              {selectedNode ? (
                <motion.div
                  key={selectedNode.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-5"
                >
                  <div className="space-y-1">
                    <h3 className="text-base font-extrabold text-text">{selectedNode.title}</h3>
                    <div className="flex gap-2">
                      <span className="text-[9px] bg-bg-hover text-text-secondary px-2 py-0.5 rounded font-mono font-bold">
                        Cost: {selectedNode.cost} SP
                      </span>
                      <span className="text-[9px] bg-bg-hover text-text-secondary px-2 py-0.5 rounded font-mono font-bold">
                        Min Lvl: {selectedNode.minLevel}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-text-secondary leading-relaxed bg-bg-elevated/40 p-3 border border-border/50 rounded-xl">
                    {selectedNode.desc}
                  </p>

                  <div className="space-y-1 bg-primary/5 border border-primary/15 rounded-xl p-3.5">
                    <span className="text-[9px] font-bold text-primary uppercase tracking-wider">Passive Attributes Gain</span>
                    <p className="text-xs text-text font-semibold flex items-center gap-1.5 pt-1">
                      <CheckCircle className="w-4 h-4 text-primary" /> {selectedNode.bonus}
                    </p>
                  </div>

                  {/* Unlock Logic & Buttons */}
                  <div className="pt-2">
                    {unlockedSkills.includes(selectedNode.id) ? (
                      <div className="w-full bg-success/15 border border-success/30 rounded-xl p-3 text-center text-xs font-bold text-success flex items-center justify-center gap-1.5">
                        <CheckCircle className="w-4 h-4" /> Attributes Active
                      </div>
                    ) : getStatus(selectedNode) === 'READY' ? (
                      <Button
                        onClick={() => handleUnlockSkill(selectedNode)}
                        variant="primary"
                        className="w-full flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-primary/20"
                      >
                        <Sparkles className="w-4 h-4 fill-white" />
                        Unlock Node ({selectedNode.cost} SP)
                      </Button>
                    ) : (
                      <div className="w-full bg-danger/10 border border-danger/25 rounded-xl p-3 space-y-1.5 text-center">
                        <div className="text-xs font-semibold text-danger flex items-center justify-center gap-1.5">
                          <ShieldAlert className="w-4 h-4" /> Unlock Requirement Locked
                        </div>
                        <p className="text-[10px] text-text-secondary">
                          {getStatus(selectedNode) === 'LOCKED_LEVEL' && `Requires character Level ${selectedNode.minLevel}.`}
                          {getStatus(selectedNode) === 'LOCKED_PREREQ' && 'Prerequisite skill node is not unlocked yet.'}
                          {getStatus(selectedNode) === 'INSUFFICIENT_POINTS' && `Requires ${selectedNode.cost} unspent SP (you have ${availableSkillPoints} SP).`}
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center text-text-faint space-y-3">
                  <HelpCircle className="w-10 h-10 text-text-faint" />
                  <div>
                    <h4 className="text-xs font-bold text-text-secondary">No Node Selected</h4>
                    <p className="text-[10px] mt-1 max-w-[200px] leading-relaxed">
                      Click any skill node on the left branches map to view stats and unlock attributes.
                    </p>
                  </div>
                </div>
              )}
            </AnimatePresence>
          </Card>
        </div>

      </div>

    </div>
  );
};

export default SkillsPage;
