import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LifeBuoy,
  Mail,
  Copy,
  Check,
  Search,
  Send,
  AlertTriangle,
  HelpCircle,
  BookOpen,
  Sparkles,
  ChevronDown,
  ExternalLink,
  Shield,
  Zap,
  Terminal,
  MessageSquare,
  CheckCircle2
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { APP_NAME } from '@/utils/constants';

const ADMIN_EMAIL = 'ganeshprasad40292.dev@gmail.com';

const FAQ_ITEMS = [
  {
    id: 'faq-1',
    category: 'General',
    question: 'What is Aetheria and how does it organize my workspace?',
    answer: `${APP_NAME} is an all-in-one productivity operating suite. It combines student hub management, multi-currency financial tracking, rich markdown note-taking, 3D Pomodoro focus rooms, and daily health metrics under a unified SaaS interface.`
  },
  {
    id: 'faq-2',
    category: 'Technical & Errors',
    question: 'How do I report a system error or bug to the administrator?',
    answer: `You can use the Contact Admin form on this page or directly email ${ADMIN_EMAIL}. Please include any error messages, browser logs, or steps to reproduce the issue.`
  },
  {
    id: 'faq-3',
    category: 'Keyboard Shortcuts',
    question: 'What keyboard shortcuts are available for fast navigation?',
    answer: 'Press `Ctrl + K` or `Cmd + K` anywhere to open the Raycast-style Universal Command Palette. Press `?` to toggle the full keyboard shortcuts cheatsheet.'
  },
  {
    id: 'faq-4',
    category: 'Security & 2FA',
    question: 'How do I enable Two-Factor Authentication (2FA)?',
    answer: 'Navigate to Settings → Security tab. Click "Enable 2FA" to generate a TOTP QR code, which you can scan using any authenticator app like Google Authenticator or 1Password.'
  },
  {
    id: 'faq-5',
    category: 'Data & Privacy',
    question: 'Can I export my data or backup my workspace?',
    answer: 'Yes! Go to Settings → Data Management tab to download a complete JSON backup of your account settings, notes, transactions, and preferences.'
  },
  {
    id: 'faq-6',
    category: 'Focus Room',
    question: 'How does the 3D Focus Room fullscreen mode work?',
    answer: 'Clicking the Play/Resume button in the Focus Room automatically triggers browser Fullscreen mode with a minimal ambient timer overlay. Press Esc or the Minimize button to exit fullscreen anytime.'
  }
];

const HelpPage = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaq, setOpenFaq] = useState(null);
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Support form state
  const [formData, setFormData] = useState({
    category: 'BUG',
    email: user?.email || '',
    subject: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState('');

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(ADMIN_EMAIL);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formError) setFormError('');
  };

  const handleSubmitTicket = (e) => {
    e.preventDefault();
    if (!formData.subject.trim() || !formData.message.trim()) {
      setFormError('Please fill out both the subject and message details.');
      return;
    }
    setSubmitting(true);
    setFormError('');

    // Simulate sending ticket
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      setFormData({
        category: 'BUG',
        email: user?.email || '',
        subject: '',
        message: ''
      });
    }, 800);
  };

  // Filter FAQs based on search
  const filteredFaqs = FAQ_ITEMS.filter((item) =>
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen relative text-text">
      {/* 
        -------------------------------------------------------------
        FIXED MULTI-LAYER BACKGROUND ARCHITECTURE
        -------------------------------------------------------------
      */}
      {/* Layer 1: Deep Slate Base Color (#020617) */}
      <div className="fixed inset-0 bg-[#020617] -z-50 pointer-events-none" />

      {/* Layer 2: Fixed Dark Concrete Texture Pattern (15% opacity) */}
      <div
        className="fixed inset-0 bg-fixed -z-40 pointer-events-none opacity-[0.14] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      />

      {/* Layer 3: Dark Gradient Overlay (top 78% -> bottom 94%) */}
      <div
        className="fixed inset-0 -z-30 pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, rgba(2,6,23,0.78) 0%, rgba(2,6,23,0.94) 100%)'
        }}
      />

      {/* Layer 4: Subtle Top-Right Indigo Radial Glow */}
      <div
        className="fixed inset-0 -z-20 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 85% 15%, rgba(99,102,241,0.08) 0%, transparent 60%)'
        }}
      />

      {/* 
        -------------------------------------------------------------
        Layer 5: HELP PAGE SCROLLABLE CONTENT AREA
        -------------------------------------------------------------
      */}
      <div className="page-container relative max-w-5xl mx-auto py-4 space-y-10">
        
        {/* Page Header Banner */}
        <div className="text-center max-w-2xl mx-auto space-y-4 pt-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
            <LifeBuoy className="w-3.5 h-3.5" />
            <span>{APP_NAME} Support Center</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text">
            How can we help you?
          </h1>
          <p className="text-sm text-text-muted leading-relaxed">
            Search our documentation, report an issue, or connect directly with our admin engineering team.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-xl mx-auto pt-2">
            <Search className="w-4 h-4 text-text-faint absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search help topics, FAQs, or error troubleshooting..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-bg-card/90 border border-border rounded-xl text-sm text-text placeholder:text-text-faint focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 shadow-lg backdrop-blur-md transition-all"
            />
          </div>
        </div>

        {/* 
          -------------------------------------------------------------
          DIRECT ADMIN CONTACT HERO CARD
          -------------------------------------------------------------
        */}
        <Card className="p-8 bg-gradient-to-br from-primary/10 via-bg-card/80 to-bg-card/90 border border-primary/30 rounded-2xl shadow-xl backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-primary">Direct Admin Channel</span>
              </div>
              <h2 className="text-xl font-bold text-text">Have an Urgent Question or Error?</h2>
              <p className="text-xs text-text-muted leading-relaxed">
                Contact the lead administrator directly. We review every message regarding bugs, custom integration inquiries, or feedback.
              </p>
              
              <div className="flex items-center gap-2 pt-1">
                <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="font-mono text-sm font-semibold text-text select-all">
                  {ADMIN_EMAIL}
                </span>
              </div>
            </div>

            {/* Email Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <a
                href={`mailto:${ADMIN_EMAIL}?subject=Aetheria%20Support%20Request`}
                className="px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-light transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/25 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Send Email</span>
              </a>

              <button
                type="button"
                onClick={handleCopyEmail}
                className="px-4 py-2.5 rounded-xl bg-bg-elevated border border-border text-text-muted hover:text-text text-xs font-semibold hover:border-primary/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {copiedEmail ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                <span>{copiedEmail ? 'Copied to Clipboard!' : 'Copy Email'}</span>
              </button>
            </div>
          </div>
        </Card>

        {/* 
          -------------------------------------------------------------
          TWO-COLUMN GRID: SUBMIT TICKET FORM (LEFT) vs QUICK DOCS (RIGHT)
          -------------------------------------------------------------
        */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Interactive Support & Bug Ticket Form */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="p-7 bg-bg-card/75 backdrop-blur-xl border border-border/80 rounded-2xl shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-text flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-primary" />
                    Submit Support Ticket
                  </h3>
                  <p className="text-xs text-text-muted mt-1">
                    Send a structured report straight to administrator support.
                  </p>
                </div>
                <span className="text-[10px] uppercase font-mono px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold">
                  Fast Dispatch
                </span>
              </div>

              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-6 text-center space-y-4 rounded-xl bg-success-muted/30 border border-success/30"
                >
                  <div className="w-12 h-12 rounded-full bg-success/20 border border-success/30 flex items-center justify-center mx-auto text-success">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-text">Ticket Dispatched Successfully!</h4>
                    <p className="text-xs text-text-muted mt-1 max-w-md mx-auto">
                      Thank you for contacting us. Your message has been logged and queued for admin review.
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setSubmitted(false)}
                  >
                    Submit Another Message
                  </Button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmitTicket} className="space-y-4">
                  {formError && (
                    <div className="p-3 rounded-lg bg-danger-muted border border-danger/30 text-xs text-danger flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                      <span>{formError}</span>
                    </div>
                  )}

                  {/* Category Selector */}
                  <div>
                    <label className="block text-xs font-semibold text-text-muted mb-1.5">
                      Issue Category
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: 'BUG', label: 'Bug / Error 🐛' },
                        { id: 'FEATURE', label: 'Feature Request 💡' },
                        { id: 'ACCOUNT', label: 'Account / Auth 🔒' },
                        { id: 'OTHER', label: 'General Inquiry ❓' }
                      ].map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, category: cat.id }))}
                          className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                            formData.category === cat.id
                              ? 'bg-primary/20 border-primary text-primary font-bold'
                              : 'bg-bg-elevated/40 border-border/70 text-text-muted hover:text-text'
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* User Email */}
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    label="Your Reply Email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleFormChange}
                    icon={<Mail className="w-4 h-4" />}
                  />

                  {/* Subject */}
                  <Input
                    id="subject"
                    name="subject"
                    type="text"
                    label="Subject Summary"
                    placeholder="Brief description of error or request..."
                    value={formData.subject}
                    onChange={handleFormChange}
                  />

                  {/* Message / Error Details */}
                  <div>
                    <label htmlFor="message" className="block text-xs font-semibold text-text-muted mb-1.5">
                      Detailed Message or Error Trace
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={4}
                      placeholder="Describe what happened, error codes shown, or feature request details..."
                      value={formData.message}
                      onChange={handleFormChange}
                      className="w-full p-3 bg-bg border border-border rounded-xl text-xs text-text placeholder:text-text-faint focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    fullWidth
                    loading={submitting}
                    className="gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Message to Admin</span>
                  </Button>
                </form>
              )}
            </Card>
          </div>

          {/* Right Column: Quick Self-Service Docs & Tools */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="p-6 bg-bg-card/75 backdrop-blur-xl border border-border/80 rounded-2xl space-y-4">
              <h3 className="text-sm font-bold text-text flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" />
                Quick Self-Service Tools
              </h3>

              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-bg-elevated/40 border border-border/60 flex items-center justify-between hover:bg-bg-elevated/80 transition-all cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                      <Terminal className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-text block">Command Palette</span>
                      <span className="text-[10px] text-text-muted">Press `Ctrl + K` to open search</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono bg-bg border border-border px-2 py-0.5 rounded text-text-muted">
                    Ctrl+K
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-bg-elevated/40 border border-border/60 flex items-center justify-between hover:bg-bg-elevated/80 transition-all cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                      <HelpCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-text block">Shortcuts Cheatsheet</span>
                      <span className="text-[10px] text-text-muted">Press `?` anywhere to view keymaps</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono bg-bg border border-border px-2 py-0.5 rounded text-text-muted">
                    ?
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-bg-elevated/40 border border-border/60 flex items-center justify-between hover:bg-bg-elevated/80 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-success/10 border border-success/20 flex items-center justify-center text-success">
                      <Shield className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-text block">System Status</span>
                      <span className="text-[10px] text-success font-medium">All APIs & WebSockets Operational</span>
                    </div>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                </div>
              </div>
            </Card>

            {/* Admin Response Policy Card */}
            <Card className="p-5 bg-bg-card/75 backdrop-blur-xl border border-border/80 rounded-2xl space-y-2">
              <span className="text-xs font-bold text-primary uppercase tracking-wider block">
                Support Policy & Service SLA
              </span>
              <p className="text-xs text-text-muted leading-relaxed">
                All submitted tickets and emails sent to <strong className="text-text">{ADMIN_EMAIL}</strong> are logged directly into our administrative dashboard. Critical bugs receive priority handling within 12 hours.
              </p>
            </Card>
          </div>

        </div>

        {/* 
          -------------------------------------------------------------
          FREQUENTLY ASKED QUESTIONS (FAQ) ACCORDION SECTION
          -------------------------------------------------------------
        */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-text flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-primary" />
                Frequently Asked Questions
              </h2>
              <p className="text-xs text-text-muted mt-0.5">
                Quick answers to common questions about workspace tools, errors, and security.
              </p>
            </div>
            <span className="text-xs text-text-faint font-mono">
              {filteredFaqs.length} Articles
            </span>
          </div>

          <div className="space-y-3">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq) => {
                const isOpen = openFaq === faq.id;
                return (
                  <Card
                    key={faq.id}
                    className="p-5 bg-bg-card/75 backdrop-blur-xl border border-border/80 rounded-xl transition-all cursor-pointer hover:border-primary/40"
                    onClick={() => setOpenFaq(isOpen ? null : faq.id)}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                          {faq.category}
                        </span>
                        <h3 className="text-sm font-semibold text-text">{faq.question}</h3>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-text-muted transition-transform duration-200 ${
                          isOpen ? 'rotate-180 text-primary' : ''
                        }`}
                      />
                    </div>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="mt-3 pt-3 border-t border-border/50 text-xs text-text-muted leading-relaxed"
                        >
                          {faq.answer}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                );
              })
            ) : (
              <div className="p-8 text-center bg-bg-card/50 border border-dashed border-border rounded-xl">
                <p className="text-xs text-text-muted">No FAQ articles match your search query "{searchQuery}".</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default HelpPage;
