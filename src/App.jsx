import React, { useState, useEffect, useRef, Component } from 'react';
import {
  Check, Globe, MessageCircle, Zap, Users, Menu, X, ArrowRight, RefreshCw,
  Gift, Sparkles, AlertCircle, Share2, UserPlus, CreditCard, ExternalLink,
  BookOpen, Brain, Mic, Trophy, ChevronDown, ChevronRight, Star, Target,
  Flame, GraduationCap, Repeat, Gamepad2, MessageSquare, Bot,
} from 'lucide-react';

// ============================================================================
// ERROR BOUNDARY
// ============================================================================

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, info) { console.error('[ErrorBoundary]', error, info); }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#08080f', color: '#e4e4e7', fontFamily: 'system-ui' }}>
          <div style={{ textAlign: 'center', maxWidth: 400, padding: 32 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>😵</div>
            <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Something went wrong</h1>
            <p style={{ color: '#71717a', fontSize: 14, marginBottom: 24 }}>{this.state.error?.message || 'An unexpected error occurred'}</p>
            <button onClick={() => { this.setState({ hasError: false, error: null }); window.location.href = '/'; }}
              style={{ background: 'linear-gradient(135deg, #a855f7, #6366f1)', color: 'white', border: 'none', padding: '12px 24px', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
              Back to Home
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const API = 'https://api.nhomnhom.com';
const BOT_URL = 'https://t.me/linguaxyz_bot';
const S = {
  card: { background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)', border: '1px solid rgba(255,255,255,0.06)' },
  btnP: { background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)', border: 'none', cursor: 'pointer' },
  btnS: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' },
};

function formatTokens(n) {
  if (!n || n === 0) return '0';
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return String(n);
}

async function apiFetch(path, opts = {}) {
  const token = localStorage.getItem('token');
  const res = await fetch(API + path, {
    ...opts,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...opts.headers },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

// ============================================================================
// APP
// ============================================================================

function AppInner() {
  const [user, setUser] = useState(null);
  const [inviteStats, setInviteStats] = useState(null);
  const [usageStats, setUsageStats] = useState(null);
  const [pricing, setPricing] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [currentPage, setCurrentPage] = useState('home');
  const [loading, setLoading] = useState(true);
  const [showBuy, setShowBuy] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  const refreshData = async () => {
    try {
      const data = await apiFetch('/api/me');
      setUser(data.user);
      setInviteStats(data.inviteStats);
      setUsageStats(data.usageStats);
      setPricing(data.pricing || []);
      setPurchases(data.purchases || []);
    } catch (e) {
      console.error('Refresh failed:', e);
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    if (urlToken) localStorage.setItem('token', urlToken);
    if (params.get('buy') === 'true') setShowBuy(true);
    if (params.get('purchased')) setPurchaseSuccess(true);
    if (urlToken || params.get('buy') || params.get('purchased') || params.get('cancelled')) {
      window.history.replaceState({}, '', '/');
    }
    const token = localStorage.getItem('token');
    if (token) {
      refreshData().then(() => setCurrentPage('dashboard')).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const navigate = (page) => {
    setCurrentPage(page);
    if (page === 'home') window.history.pushState({}, '', '/');
    window.scrollTo(0, 0);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('home');
  };

  if (loading) return <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-white">Loading...</div>;

  const navItems = [
    { label: 'Translator', href: '#translator' },
    { label: 'Tutor', href: '#tutor' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'FAQ', href: '#faq' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4" style={{ background: 'rgba(10,10,15,0.8)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="cursor-pointer flex items-center gap-2.5" onClick={() => navigate('home')}>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center"><Globe className="w-4 h-4 text-white" /></div>
              <span className="font-semibold text-lg tracking-tight">LinguaXYZ</span>
            </div>
            {!user && (
              <div className="hidden md:flex items-center gap-6">
                {navItems.map(item => (<a key={item.label} href={item.href} className="text-gray-300 hover:text-white transition-colors text-sm font-medium">{item.label}</a>))}
              </div>
            )}
          </div>
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <button onClick={() => navigate('dashboard')} style={S.btnP} className="px-4 py-2 rounded-lg text-white text-sm font-medium">Dashboard</button>
                <button onClick={handleLogout} className="text-gray-400 hover:text-white text-sm">Log out</button>
              </>
            ) : (
              <a href={BOT_URL} target="_blank" rel="noopener noreferrer" style={S.btnP} className="px-4 py-2 rounded-lg text-white text-sm font-medium inline-flex items-center gap-2">
                Start on Telegram <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
          <button className="md:hidden text-gray-300" onClick={() => setMobileMenu(!mobileMenu)}>
            {mobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        {mobileMenu && (
          <div className="md:hidden mt-4 pb-4 border-t border-white/5 pt-4 flex flex-col gap-3">
            {!user && navItems.map(item => (<a key={item.label} href={item.href} onClick={() => setMobileMenu(false)} className="text-gray-300 hover:text-white text-sm font-medium py-2">{item.label}</a>))}
            {user ? (
              <>
                <button onClick={() => { navigate('dashboard'); setMobileMenu(false); }} style={S.btnP} className="px-4 py-2.5 rounded-lg text-white text-sm font-medium">Dashboard</button>
                <button onClick={() => { handleLogout(); setMobileMenu(false); }} className="text-gray-400 text-sm text-left py-2">Log out</button>
              </>
            ) : (
              <a href={BOT_URL} target="_blank" rel="noopener noreferrer" style={S.btnP} className="px-4 py-2.5 rounded-lg text-white text-sm font-medium text-center">Start on Telegram</a>
            )}
          </div>
        )}
      </nav>

      {currentPage === 'home' && <HomePage />}
      {currentPage === 'dashboard' && (
        <Dashboard
          user={user}
          inviteStats={inviteStats}
          usageStats={usageStats}
          pricing={pricing}
          purchases={purchases}
          showBuy={showBuy}
          setShowBuy={setShowBuy}
          purchaseSuccess={purchaseSuccess}
          setPurchaseSuccess={setPurchaseSuccess}
          onNavigate={navigate}
          onRefresh={refreshData}
        />
      )}
    </div>
  );
}

// ============================================================================
// SCROLL REVEAL HOOK
// ============================================================================

function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.15 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

function Reveal({ children, className = '', delay = 0 }) {
  const [ref, visible] = useReveal();
  return (
    <div ref={ref} className={className}
      style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(24px)', transition: `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s` }}>
      {children}
    </div>
  );
}

// ============================================================================
// CHAT DEMO ANIMATION
// ============================================================================

function ChatDemo() {
  const conversations = [
    { title: 'Vietnam Trip Planning 🌏', messages: [
      { from: 'Minh', text: 'Các bạn nên đi thăm Hội An, rất đẹp!', translation: '🇺🇸 You guys should visit Hoi An, very beautiful!', side: 'left' },
      { from: 'Sarah', text: "That sounds amazing! How do we get there from Hanoi?", translation: '🇻🇳 Nghe tuyệt vời quá! Làm sao để đi từ Hà Nội đến đó?', side: 'right' },
      { from: 'Minh', text: 'Bay khoảng 1 tiếng từ Hà Nội đến Đà Nẵng, rồi đi taxi 30 phút', translation: '🇺🇸 Fly about 1 hour from Hanoi to Da Nang, then 30 min taxi', side: 'left' },
    ]},
    { title: 'Team Standup 💼', messages: [
      { from: 'Yuki', text: '今日のタスクを共有します', translation: '🇺🇸 I will share today\'s tasks', side: 'left' },
      { from: 'Carlos', text: 'Necesito ayuda con el diseño', translation: '🇺🇸 I need help with the design', side: 'right' },
      { from: 'Yuki', text: 'デザインを手伝えますよ！', translation: '🇺🇸 I can help with the design!', side: 'left' },
    ]},
    { title: 'Language Exchange 🗣️', messages: [
      { from: 'Pierre', text: "J'apprends le coréen, c'est difficile!", translation: '🇺🇸 I\'m learning Korean, it\'s difficult!', side: 'left' },
      { from: 'Soo-jin', text: '프랑스어도 어려워요! 같이 연습해요', translation: '🇺🇸 French is difficult too! Let\'s practice together', side: 'right' },
      { from: 'Pierre', text: "Bonne idée! On commence quand?", translation: '🇺🇸 Good idea! When do we start?', side: 'left' },
    ]},
  ];

  const [activeConvo, setActiveConvo] = useState(0);
  const [visibleMessages, setVisibleMessages] = useState([]);
  const [showTranslation, setShowTranslation] = useState({});

  useEffect(() => {
    setVisibleMessages([]);
    setShowTranslation({});
    const msgs = conversations[activeConvo].messages;
    const timers = [];
    msgs.forEach((_, i) => {
      timers.push(setTimeout(() => setVisibleMessages(prev => [...prev, i]), i * 1500 + 500));
      timers.push(setTimeout(() => setShowTranslation(prev => ({ ...prev, [i]: true })), i * 1500 + 1200));
    });
    const cycleTimer = setTimeout(() => setActiveConvo(prev => (prev + 1) % conversations.length), msgs.length * 1500 + 3000);
    return () => { timers.forEach(clearTimeout); clearTimeout(cycleTimer); };
  }, [activeConvo]);

  const convo = conversations[activeConvo];

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="rounded-2xl overflow-hidden" style={{ ...S.card, border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="px-5 py-4 flex items-center gap-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white">{convo.title}</div>
            <div className="text-xs text-gray-400">LinguaXYZ translating...</div>
          </div>
        </div>
        <div className="p-4 space-y-4 min-h-[280px]">
          {convo.messages.map((msg, i) => visibleMessages.includes(i) && (
            <div key={`${activeConvo}-${i}`} className={`flex flex-col ${msg.side === 'right' ? 'items-end' : 'items-start'}`}
              style={{ animation: 'fadeIn 0.4s ease-out' }}>
              <span className="text-xs text-gray-500 mb-1 px-1">{msg.from}</span>
              <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${msg.side === 'right' ? 'bg-purple-500/30 text-purple-100' : 'bg-white/10 text-gray-200'}`}>
                {msg.text}
              </div>
              {showTranslation[i] && (
                <div className="max-w-[85%] rounded-2xl px-4 py-2 text-sm mt-1 border bg-cyan-500/10 border-cyan-500/20 text-cyan-200"
                  style={{ animation: 'fadeIn 0.3s ease-out' }}>
                  {msg.translation}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-4 mt-6 px-4">
        {conversations.map((c, i) => (
          <button key={i} onClick={() => setActiveConvo(i)}
            className={`text-xs px-3 py-1.5 rounded-full transition-all ${i === activeConvo ? 'bg-purple-500/30 text-purple-300 border border-purple-500/40' : 'bg-white/5 text-gray-500 border border-transparent hover:text-gray-300'}`}>
            {c.title}
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// FAQ ACCORDION
// ============================================================================

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/5">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between py-4 text-left">
        <span className="text-sm font-medium text-gray-200 pr-4">{q}</span>
        <ChevronDown className={`w-4 h-4 text-gray-500 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <p className="text-sm text-gray-400 pb-4 leading-relaxed">{a}</p>}
    </div>
  );
}

// ============================================================================
// HOME PAGE
// ============================================================================

const LANGUAGES = [
  'Vietnamese', 'English', 'Chinese', 'Japanese', 'Korean', 'Thai', 'Spanish',
  'French', 'German', 'Portuguese', 'Russian', 'Arabic', 'Hindi', 'Indonesian',
  'Malay', 'Tagalog', 'Italian', 'Dutch', 'Polish', 'Ukrainian',
];

const TUTOR_LANGS = [
  { name: 'English', flag: '🇺🇸' }, { name: 'Spanish', flag: '🇪🇸' },
  { name: 'French', flag: '🇫🇷' }, { name: 'Japanese', flag: '🇯🇵' },
  { name: 'Chinese', flag: '🇨🇳' }, { name: 'Korean', flag: '🇰🇷' },
];

const CURRICULUM = [
  { tier: 1, name: 'Survival', cefr: 'A1', emoji: '🌱', color: 'emerald', units: [
    '👋 Hello & Goodbye', '🔢 Numbers & Counting', '👥 Me, You & People',
    '📌 To Be & To Have', '🍕 Food & Drink', '☀️ Daily Actions',
    '📍 Where Is It?', '🛍️ Shopping & Money', '📅 Time & Calendar', '🏁 Survival Check',
  ]},
  { tier: 2, name: 'Foundation', cefr: 'A2', emoji: '🌳', color: 'amber', units: [
    '🎨 Describing Things', '⏪ What Happened?', '🔀 Irregular Past',
    '🏥 My Body & Health', '🏠 Home & Living', '🚆 Getting Around',
    '🌦️ Weather & Nature', '🎮 Hobbies & Free Time', '🍽️ Eating Out', '🏁 Foundation Check',
  ]},
  { tier: 3, name: 'Conversational', cefr: 'B1', emoji: '🗣️', color: 'purple', units: [
    '📖 Telling Stories', '💭 Opinions & Feelings', '🚀 Future Plans & Dreams',
    '💼 Work & Professional Life', '🧭 Giving Advice', '🎭 Culture & Traditions',
    '🔧 Problem Solving', '🔗 Connected Speech', '⚖️ Debate & Discuss', '🎓 Conversational!',
  ]},
];

const FAQS = [
  { q: 'How does the translator work in group chats?', a: 'Add @linguaxyz_bot to any group. Each member sets their language pairs with /setlang. The bot silently translates every message — no commands needed. A Vietnamese speaker sees English messages in Vietnamese; an English speaker sees Vietnamese messages in English.' },
  { q: 'What languages are supported?', a: 'Translation supports 20 languages including Vietnamese, English, Chinese, Japanese, Korean, Thai, Spanish, French, German, and more. The tutor currently teaches English, Spanish, French, Japanese, Chinese (Mandarin), and Korean.' },
  { q: 'Will I actually become conversational?', a: 'Each of the 30 units has 4 phases (lesson, practice, conversation, quiz) — that\'s 120+ structured sessions plus free talk and roleplay. At 30 min/day, expect 3–6 months to reach CEFR B1 depending on the language.' },
  { q: 'How much does it cost?', a: 'You get 10k tokens free on signup. Translation uses ~200 tokens per message; tutor classes use ~2k-5k per session. Plans start at $5 for 50k tokens (~25 translation messages or ~10 tutor sessions).' },
  { q: 'Can I use it for just translation or just learning?', a: 'Absolutely. Many people use only the translator in group chats. Others only use the tutor in DMs. They\'re independent features that share your token balance.' },
  { q: 'How does spaced repetition work?', a: 'Every word you learn gets tracked with the SM-2 algorithm. Words you struggle with come back more often. Use /review to practice due words — the bot schedules them automatically.' },
  { q: 'What\'s the difference between Free Talk and Roleplay?', a: 'Free Talk is open conversation — chat about anything with gentle corrections. Roleplay puts you in a scenario (ordering at a café, job interview, seeing a doctor) with a goal to complete.' },
  { q: 'How do gate quizzes work?', a: 'At units 10, 20, and 30, you face a gate quiz covering everything in that tier. You need 70% to advance. If you fail, review the units and try again — no penalty.' },
  { q: 'What happens when I run out of tokens?', a: 'The bot stops translating and tutoring. Buy more with /buy, invite friends for 10k bonus each, or wait — there\'s no subscription, just pay-as-you-go.' },
  { q: 'Does the bot work in DMs too?', a: 'Yes! DM the bot for tutoring (classes, free talk, roleplay, quizzes). Translation works both in groups and DMs — send any text and it translates based on your /setlang pairs.' },
];

function HomePage() {
  return (
    <div>
      {/* Hero */}
      <div className="pt-32 pb-20 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-30" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(168,85,247,0.15) 0%, transparent 60%)' }} />
        <div className="max-w-4xl mx-auto relative">
          <Reveal>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm mb-8">
              <Sparkles className="w-4 h-4" /> One bot. Two superpowers.
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Translate instantly.<br />
              <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Learn for real.</span>
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
              LinguaXYZ is a Telegram bot that translates your group chats in 20 languages
              <em> and </em> teaches you a new language with a 30-unit AI curriculum.
              <span className="text-white"> 10k free tokens</span> to start.
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <a href={BOT_URL} target="_blank" rel="noopener noreferrer"
              style={S.btnP} className="px-8 py-4 rounded-xl text-white font-semibold text-lg inline-flex items-center gap-2 no-underline">
              Start on Telegram <ArrowRight className="w-5 h-5" />
            </a>
          </Reveal>
          <Reveal delay={0.4}>
            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 mt-14 text-sm text-gray-500">
              <span className="font-semibold text-white text-2xl">20 <span className="text-sm font-normal text-gray-400">languages</span></span>
              <span className="font-semibold text-white text-2xl">120 <span className="text-sm font-normal text-gray-400">lesson sessions</span></span>
              <span className="font-semibold text-white text-2xl">22 <span className="text-sm font-normal text-gray-400">roleplay scenarios</span></span>
              <span className="font-semibold text-white text-2xl">0→B1 <span className="text-sm font-normal text-gray-400">curriculum</span></span>
            </div>
          </Reveal>
        </div>
      </div>

      {/* Two Features */}
      <div className="py-16 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6">
          <Reveal>
            <div style={S.card} className="rounded-2xl p-8 h-full">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center mb-5 text-cyan-400">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Translator</h3>
              <p className="text-gray-400 text-sm mb-5">Auto-translates every message in group chats. Each person speaks their language — everyone understands everyone.</p>
              <div className="space-y-2 text-sm">
                {['Auto-detection — just talk', '20 languages, any pair', 'Works in groups and DMs', 'Zero setup after /setlang'].map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-gray-300"><Check className="w-4 h-4 text-cyan-400 shrink-0" />{f}</div>
                ))}
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <div style={S.card} className="rounded-2xl p-8 h-full">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-5 text-purple-400">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Tutor</h3>
              <p className="text-gray-400 text-sm mb-5">A 30-unit curriculum with 4 phases per unit — lesson, practice, conversation, quiz. Takes you from "hello" to real conversations.</p>
              <div className="space-y-2 text-sm">
                {['4 phases per unit: learn → drill → talk → prove it', 'Free Talk, Roleplay, Spaced Repetition', 'AI remembers your mistakes', 'Streaks, XP, badges, leaderboard'].map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-gray-300"><Check className="w-4 h-4 text-purple-400 shrink-0" />{f}</div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      {/* Translator Deep Dive */}
      <div id="translator" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Translation that just works</h2>
              <p className="text-gray-400 max-w-xl mx-auto">Add the bot to any group. Everyone speaks their language. AI translates every message automatically.</p>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <ChatDemo />
          </Reveal>
          <Reveal delay={0.2}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-14">
              {[
                { icon: <Zap className="w-5 h-5" />, title: 'Auto-detection', desc: 'Detects language automatically', color: 'purple' },
                { icon: <Users className="w-5 h-5" />, title: 'Multi-pair', desc: 'Each user gets their own pairs', color: 'cyan' },
                { icon: <Brain className="w-5 h-5" />, title: 'AI-powered', desc: 'Claude handles nuance & slang', color: 'amber' },
                { icon: <Sparkles className="w-5 h-5" />, title: 'Zero setup', desc: 'One /setlang command, done', color: 'green' },
              ].map((f, i) => (
                <div key={i} style={S.card} className="rounded-xl p-5 text-center">
                  <div className={`w-10 h-10 rounded-lg bg-${f.color}-500/20 flex items-center justify-center mx-auto mb-3 text-${f.color}-400`}>{f.icon}</div>
                  <div className="text-sm font-semibold mb-1">{f.title}</div>
                  <div className="text-xs text-gray-500">{f.desc}</div>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.3}>
            <div className="flex flex-wrap justify-center gap-2 mt-10">
              {LANGUAGES.map(lang => (
                <span key={lang} className="text-xs px-3 py-1.5 rounded-full bg-white/5 text-gray-400 border border-white/5">{lang}</span>
              ))}
            </div>
          </Reveal>
        </div>
      </div>

      {/* Tutor — Curriculum Timeline */}
      <div id="tutor" className="py-20 px-6" style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(168,85,247,0.03) 50%, transparent 100%)' }}>
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <div className="text-center mb-6">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">30 units from "hello" to <em>holding a conversation</em></h2>
              <p className="text-gray-400 max-w-2xl mx-auto">Each unit has 4 phases. You don't move on until you prove you've learned it.</p>
            </div>
          </Reveal>

          {/* Phase indicators */}
          <Reveal delay={0.1}>
            <div className="flex flex-wrap justify-center gap-3 mb-14">
              {[
                { emoji: '📖', name: 'Lesson', desc: 'learn concepts', color: 'cyan' },
                { emoji: '💪', name: 'Practice', desc: 'drills & exercises', color: 'amber' },
                { emoji: '🗣️', name: 'Conversation', desc: 'use it live', color: 'emerald' },
                { emoji: '✅', name: 'Quiz', desc: 'prove you know it', color: 'purple' },
              ].map((p, i) => (
                <div key={i} className={`flex items-center gap-2 px-4 py-2 rounded-full border border-${p.color}-500/30 bg-${p.color}-500/5 text-sm`}>
                  <span>{p.emoji}</span>
                  <span className="font-medium text-gray-200">{p.name}</span>
                  <span className="text-gray-500 hidden sm:inline">— {p.desc}</span>
                </div>
              ))}
            </div>
          </Reveal>

          {/* Tiers */}
          <div className="space-y-10">
            {CURRICULUM.map((tier, ti) => (
              <Reveal key={ti} delay={ti * 0.1}>
                <div style={S.card} className="rounded-2xl p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-5">
                    <span className="text-2xl">{tier.emoji}</span>
                    <div>
                      <h3 className="font-bold text-lg">Tier {tier.tier}: {tier.name}</h3>
                      <span className="text-xs text-gray-500">CEFR {tier.cefr} · Units {(tier.tier - 1) * 10 + 1}–{tier.tier * 10}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tier.units.map((u, i) => {
                      const isGate = u.includes('🏁');
                      return (
                        <span key={i} className={`text-xs px-3 py-1.5 rounded-full border ${isGate ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 font-medium' : 'bg-white/5 border-white/5 text-gray-400'}`}>
                          {u}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Tutor languages */}
          <Reveal delay={0.3}>
            <div className="mt-10 text-center">
              <p className="text-sm text-gray-500 mb-3">Available tutor languages</p>
              <div className="flex flex-wrap justify-center gap-3">
                {TUTOR_LANGS.map(l => (
                  <span key={l.name} className="text-sm px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300">
                    {l.flag} {l.name}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      {/* Practice Modes */}
      <div className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Six ways to practice</h2>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { icon: <MessageSquare className="w-6 h-6" />, title: 'Free Talk', desc: 'Open conversation with gentle corrections. Chat about anything.', color: 'cyan', cmd: '/talk' },
              { icon: <Gamepad2 className="w-6 h-6" />, title: 'Roleplay', desc: '22 real-life scenarios — café, doctor, job interview, airport...', color: 'purple', cmd: '/roleplay' },
              { icon: <BookOpen className="w-6 h-6" />, title: '?word Lookup', desc: 'Type ?word during any session to instantly look up a word.', color: 'amber', cmd: '?hola' },
              { icon: <Repeat className="w-6 h-6" />, title: 'Spaced Repetition', desc: 'SM-2 algorithm schedules reviews. Words you struggle with come back more.', color: 'green', cmd: '/review' },
              { icon: <Brain className="w-6 h-6" />, title: 'AI Memory', desc: 'The bot remembers your weak spots and personalizes every lesson.', color: 'pink', cmd: 'automatic' },
              { icon: <Trophy className="w-6 h-6" />, title: 'Streaks & XP', desc: 'Daily streaks, XP for everything, badges, and a global leaderboard.', color: 'orange', cmd: '/progress' },
            ].map((m, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <div style={S.card} className="rounded-2xl p-6 h-full">
                  <div className={`w-11 h-11 rounded-xl bg-${m.color}-500/20 flex items-center justify-center mb-4 text-${m.color}-400`}>{m.icon}</div>
                  <h3 className="font-semibold mb-2">{m.title}</h3>
                  <p className="text-sm text-gray-400 mb-3">{m.desc}</p>
                  <code className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded">{m.cmd}</code>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Start in 30 seconds</h2>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: <Bot className="w-6 h-6" />, title: 'Open Telegram', desc: 'Tap "Start on Telegram" — you get 10k tokens and an account instantly.' },
              { icon: <MessageCircle className="w-6 h-6" />, title: 'Pick your mode', desc: 'Add to a group for translation. DM the bot for language lessons.' },
              { icon: <Zap className="w-6 h-6" />, title: 'Go', desc: 'Translate or learn. No signup forms, no subscriptions, no setup.' },
            ].map((s, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div style={S.card} className="rounded-2xl p-6 text-center relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-xs font-bold">{i + 1}</div>
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mx-auto mb-4 text-purple-400">{s.icon}</div>
                  <h3 className="font-semibold mb-2">{s.title}</h3>
                  <p className="text-sm text-gray-400">{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ + Commands */}
      <div id="faq" className="py-20 px-6" style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.01) 50%, transparent 100%)' }}>
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">FAQ & Commands</h2>
          </Reveal>
          <div className="grid md:grid-cols-2 gap-10">
            {/* Commands */}
            <Reveal>
              <div>
                <h3 className="font-bold text-lg mb-5 text-gray-300">Commands</h3>
                {[
                  { title: 'Translation', cmds: [
                    ['/setlang', 'Set translation pairs'],
                    ['/languages', 'View current pairs'],
                    ['/status', 'Bot status & uptime'],
                  ]},
                  { title: 'Tutor', cmds: [
                    ['/learn', 'Open tutor dashboard'],
                    ['/path', 'View curriculum progress'],
                    ['/class', 'Start structured class'],
                    ['/talk', 'Start Free Talk'],
                    ['/roleplay', 'Pick roleplay scenario'],
                    ['/quiz', 'Quick vocabulary quiz'],
                    ['/review', 'Spaced repetition review'],
                    ['/progress', 'Detailed stats'],
                    ['/stop', 'End current session'],
                    ['/schedule', 'Set weekly class schedule'],
                    ['?word', 'Inline word lookup'],
                  ]},
                  { title: 'Account', cmds: [
                    ['/balance', 'Check token balance'],
                    ['/buy', 'Purchase tokens'],
                    ['/invite', 'Get referral link'],
                    ['/web', 'Open web dashboard'],
                  ]},
                ].map((group, gi) => (
                  <div key={gi} className="mb-5">
                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">{group.title}</div>
                    {group.cmds.map(([cmd, desc], ci) => (
                      <div key={ci} className="flex items-center gap-3 py-1.5">
                        <code className="text-xs text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded font-mono w-24 shrink-0">{cmd}</code>
                        <span className="text-xs text-gray-400">{desc}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </Reveal>

            {/* FAQ */}
            <Reveal delay={0.1}>
              <div>
                <h3 className="font-bold text-lg mb-5 text-gray-300">Frequently Asked</h3>
                {FAQS.map((faq, i) => <FaqItem key={i} q={faq.q} a={faq.a} />)}
              </div>
            </Reveal>
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div id="pricing" className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <Reveal>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple pay-as-you-go pricing</h2>
            <p className="text-gray-400 mb-12">No subscriptions. Buy tokens when you need them.</p>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { name: 'Starter', price: '$5', tokens: '50K', desc: '~250 translations or ~10 tutor sessions' },
              { name: 'Regular', price: '$15', tokens: '200K', desc: '~1,000 translations or ~40 tutor sessions', popular: true },
              { name: 'Power', price: '$35', tokens: '500K', desc: '~2,500 translations or ~100 tutor sessions' },
            ].map((tier, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div className={`rounded-2xl p-6 relative ${tier.popular ? 'ring-2 ring-purple-500/50' : ''}`} style={S.card}>
                  {tier.popular && <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-purple-500 text-white text-[10px] font-bold rounded-full uppercase tracking-wider">Popular</div>}
                  <div className="text-3xl font-bold mb-1">{tier.price}</div>
                  <div className="text-lg font-semibold text-purple-400 mb-1">{tier.tokens} tokens</div>
                  <div className="text-xs text-gray-500 mb-5">{tier.desc}</div>
                  <a href={BOT_URL} target="_blank" rel="noopener noreferrer"
                    style={tier.popular ? S.btnP : S.btnS} className="block w-full py-3 rounded-xl text-sm font-medium text-white text-center no-underline">
                    Buy via /buy
                  </a>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.3}>
            <p className="text-sm text-gray-500 mt-8">Everyone gets <span className="text-white font-medium">10k free tokens</span> on signup. Invite friends for 10k more each.</p>
          </Reveal>
        </div>
      </div>

      {/* CTA */}
      <div className="py-20 px-6 text-center">
        <Reveal>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Start translating. Start learning.</h2>
          <p className="text-gray-400 mb-8 max-w-lg mx-auto">One Telegram bot for both. No signup, no setup, 10k tokens free.</p>
          <a href={BOT_URL} target="_blank" rel="noopener noreferrer"
            style={S.btnP} className="px-8 py-4 rounded-xl text-white font-semibold text-lg inline-flex items-center gap-2 no-underline">
            Start on Telegram <ArrowRight className="w-5 h-5" />
          </a>
        </Reveal>
      </div>

      {/* Footer */}
      <div className="py-8 px-6 border-t border-white/5 text-center text-gray-500 text-sm">
        © 2026 LinguaXYZ · nhomnhom.com · Powered by Claude AI
      </div>

      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}

// ============================================================================
// DASHBOARD
// ============================================================================

function Dashboard({ user, inviteStats, usageStats, pricing, purchases, showBuy, setShowBuy, purchaseSuccess, setPurchaseSuccess, onNavigate, onRefresh }) {
  const [copied, setCopied] = useState(null);
  const [buyLoading, setBuyLoading] = useState(null);

  if (!user) { onNavigate('home'); return null; }

  const totalInvites = inviteStats?.totalInvites || 0;
  const totalTokensEarned = inviteStats?.totalTokensEarned || 0;
  const totalMessages = usageStats?.totalMessages || 0;
  const botInviteUrl = `https://t.me/linguaxyz_bot?start=ref_${user.inviteCode}`;

  const handleBuy = async (tierId) => {
    setBuyLoading(tierId);
    try {
      const data = await apiFetch('/api/create-checkout', {
        method: 'POST',
        body: JSON.stringify({ tierId }),
      });
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (e) {
      alert(e.message || 'Failed to create checkout');
    } finally {
      setBuyLoading(null);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">Hi, {user.name}! 👋</h1>
            <p className="text-gray-400">Your translation dashboard</p>
          </div>
          <button onClick={onRefresh} style={S.btnS} className="px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 text-sm text-white">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {/* Purchase success */}
        {purchaseSuccess && (
          <div className="mb-6 px-5 py-4 rounded-xl flex items-center gap-3" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}>
            <Check className="w-5 h-5 text-green-400" />
            <span className="text-sm text-green-300 font-medium">Payment successful! Your tokens have been added.</span>
            <button onClick={() => { setPurchaseSuccess(false); onRefresh(); }} className="ml-auto text-green-400 text-xs hover:underline">Dismiss</button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div style={S.card} className="rounded-2xl p-5">
            <div className="text-sm text-gray-400 mb-1">Balance</div>
            <div className={`text-2xl font-bold ${user.balance < 1000 ? 'text-orange-400' : 'text-green-400'}`}>{formatTokens(user.balance)}</div>
            <div className="text-xs text-gray-500 mt-1">tokens</div>
          </div>
          <div style={S.card} className="rounded-2xl p-5">
            <div className="text-sm text-gray-400 mb-1">Tokens Used</div>
            <div className="text-2xl font-bold">{formatTokens(user.tokensUsed || 0)}</div>
            <div className="text-xs text-gray-500 mt-1">total</div>
          </div>
          <div style={S.card} className="rounded-2xl p-5">
            <div className="text-sm text-gray-400 mb-1">Friends Invited</div>
            <div className="text-2xl font-bold text-purple-400">{totalInvites}</div>
            <div className="text-xs text-gray-500 mt-1">referrals</div>
          </div>
          <div style={S.card} className="rounded-2xl p-5">
            <div className="text-sm text-gray-400 mb-1">Messages</div>
            <div className="text-2xl font-bold text-cyan-400">{totalMessages}</div>
            <div className="text-xs text-gray-500 mt-1">translated</div>
          </div>
        </div>

        {/* Low balance warning */}
        {user.balance < 1000 && (
          <div className="mb-6 px-5 py-4 rounded-xl flex items-start gap-3" style={{ background: 'rgba(251,146,60,0.1)', border: '1px solid rgba(251,146,60,0.3)' }}>
            <AlertCircle className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="text-sm text-orange-300 font-medium">Low balance!</span>
              <span className="text-sm text-orange-300/70 ml-1">You have {formatTokens(user.balance)} tokens left.</span>
            </div>
            <button onClick={() => setShowBuy(true)} style={S.btnP} className="px-4 py-2 rounded-lg text-white text-xs font-medium shrink-0">
              Buy Tokens
            </button>
          </div>
        )}

        {/* Buy Tokens */}
        <div style={S.card} className="rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-green-400" /> Buy Tokens
            </h2>
            {!showBuy && (
              <button onClick={() => setShowBuy(true)} className="text-sm text-purple-400 hover:text-purple-300">View pricing →</button>
            )}
          </div>
          {showBuy ? (
            <div className="grid md:grid-cols-3 gap-4">
              {pricing.map((tier, i) => (
                <div key={tier.id} className={`rounded-xl p-5 text-center relative ${i === 1 ? 'ring-2 ring-purple-500/50' : ''}`}
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {i === 1 && <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-purple-500 text-white text-[10px] font-bold rounded-full uppercase tracking-wider">Popular</div>}
                  <div className="text-2xl font-bold mb-1">{tier.priceLabel}</div>
                  <div className="text-sm text-gray-400 mb-4">{tier.label}</div>
                  <button
                    onClick={() => handleBuy(tier.id)}
                    disabled={buyLoading === tier.id}
                    style={i === 1 ? S.btnP : S.btnS}
                    className="w-full py-3 rounded-xl text-sm font-medium text-white"
                  >
                    {buyLoading === tier.id ? <RefreshCw className="w-4 h-4 animate-spin mx-auto" /> : 'Buy Now'}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">Need more tokens? Purchase securely with Stripe.</p>
          )}
          {purchases.length > 0 && (
            <div className="mt-4 pt-4 border-t border-white/5">
              <div className="text-xs text-gray-500 mb-2">Recent purchases</div>
              {purchases.slice(0, 3).map((p, i) => (
                <div key={i} className="flex items-center justify-between text-xs text-gray-400 py-1">
                  <span>${p.amount} — {formatTokens(p.tokens)} tokens</span>
                  <span>{new Date(p.date).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Invite Friends */}
        <div style={S.card} className="rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Share2 className="w-5 h-5 text-cyan-400" /> Invite Friends — Earn 10k Tokens
          </h2>
          <p className="text-gray-400 text-sm mb-4">Share your invite link. When a friend clicks it and starts the bot, you both get 10,000 tokens instantly!</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 px-4 py-3 rounded-xl text-sm font-mono truncate" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
              {botInviteUrl}
            </div>
            <button
              onClick={() => { navigator.clipboard.writeText(botInviteUrl); setCopied('invite'); setTimeout(() => setCopied(null), 2000); }}
              className="px-4 py-3 rounded-xl text-sm font-medium text-white shrink-0"
              style={S.btnP}
            >
              {copied === 'invite' ? '✓ Copied!' : 'Copy Link'}
            </button>
          </div>
          {totalInvites > 0 && (
            <div className="mt-4 text-sm text-gray-400">
              ✅ {totalInvites} friend{totalInvites !== 1 ? 's' : ''} invited · {formatTokens(totalTokensEarned)} tokens earned
            </div>
          )}
        </div>

        {/* How to get tokens */}
        <div style={S.card} className="rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Gift className="w-5 h-5 text-green-400" /> How to Get Tokens
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { icon: <Share2 className="w-5 h-5" />, title: 'Invite friends', desc: 'Both of you get 10k tokens free', color: 'cyan' },
              { icon: <CreditCard className="w-5 h-5" />, title: 'Buy tokens', desc: 'Instant top-up with Stripe', color: 'green' },
              { icon: <MessageCircle className="w-5 h-5" />, title: 'Use /buy in bot', desc: 'Purchase directly from Telegram', color: 'purple' },
            ].map((s, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                <div className={`w-8 h-8 rounded-lg bg-${s.color}-500/20 flex items-center justify-center text-${s.color}-400 shrink-0`}>{s.icon}</div>
                <div>
                  <div className="font-medium text-sm">{s.title}</div>
                  <div className="text-xs text-gray-400">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppInner />
    </ErrorBoundary>
  );
}
