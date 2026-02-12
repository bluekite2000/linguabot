import React, { useState, useEffect, useRef, Component } from 'react';
import {
  Check, Globe, MessageCircle, Zap, Users, Menu, X, ArrowRight, RefreshCw,
  Gift, Sparkles, AlertCircle, Share2, UserPlus, ExternalLink,
  BookOpen, Brain, Trophy, ChevronDown,
  Award, Repeat, Compass, MessageSquare, Bot,
  Edit3, FileText, Type, Shield, Mic,
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
  const [purchases, setPurchases] = useState([]);
  const [currentPage, setCurrentPage] = useState('home');
  const [loading, setLoading] = useState(true);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  const refreshData = async () => {
    try {
      const data = await apiFetch('/api/me');
      setUser(data.user);
      setInviteStats(data.inviteStats);
      setUsageStats(data.usageStats);
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
    if (params.get('purchased')) setPurchaseSuccess(true);
    if (urlToken || params.get('purchased') || params.get('cancelled')) {
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
    { label: 'Translate', href: '#translate' },
    { label: 'Learn', href: '#learn' },
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
          purchases={purchases}
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
// GROUP CHAT DEMO — near real-time translation
// ============================================================================

function GroupChatDemo() {
  const conversations = [
    { title: 'Vietnam Trip Planning 🌏', subtitle: '3 members · translating live', messages: [
      { from: 'Minh', text: 'Các bạn nên đi thăm Hội An, rất đẹp!', translation: '🇺🇸 You guys should visit Hoi An, very beautiful!', side: 'left', flag: '🇻🇳' },
      { from: 'Sarah', text: "That sounds amazing! How do we get there from Hanoi?", translation: '🇻🇳 Nghe tuyệt vời quá! Làm sao để đi từ Hà Nội đến đó?', side: 'right', flag: '🇺🇸' },
      { from: 'Minh', text: 'Bay khoảng 1 tiếng từ Hà Nội đến Đà Nẵng, rồi đi taxi 30 phút', translation: '🇺🇸 Fly about 1 hour from Hanoi to Da Nang, then 30 min taxi', side: 'left', flag: '🇻🇳' },
    ]},
    { title: 'Team Standup 💼', subtitle: '5 members · translating live', messages: [
      { from: 'Yuki', text: '今日のタスクを共有します', translation: '🇺🇸 I will share today\'s tasks', side: 'left', flag: '🇯🇵' },
      { from: 'Carlos', text: 'Necesito ayuda con el diseño', translation: '🇺🇸 I need help with the design', side: 'right', flag: '🇪🇸' },
      { from: 'Yuki', text: 'デザインを手伝えますよ！', translation: '🇺🇸 I can help with the design!', side: 'left', flag: '🇯🇵' },
    ]},
    { title: 'Family Group 👨‍👩‍👧', subtitle: '4 members · translating live', messages: [
      { from: 'Mẹ', text: 'Con ăn cơm chưa?', translation: '🇺🇸 Have you eaten yet?', side: 'left', flag: '🇻🇳' },
      { from: 'David', text: 'Not yet mom! What did you cook?', translation: '🇻🇳 Chưa mẹ ơi! Mẹ nấu gì?', side: 'right', flag: '🇺🇸' },
      { from: 'Mẹ', text: 'Phở bò nhé, về sớm đi con 🍜', translation: '🇺🇸 Beef pho, come home early 🍜', side: 'left', flag: '🇻🇳' },
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
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">{convo.title}</div>
              <div className="text-xs text-gray-400">{convo.subtitle}</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[10px] text-green-400 font-medium">LIVE</span>
          </div>
        </div>
        <div className="p-4 space-y-4 min-h-[280px]">
          {convo.messages.map((msg, i) => visibleMessages.includes(i) && (
            <div key={`${activeConvo}-${i}`} className={`flex flex-col ${msg.side === 'right' ? 'items-end' : 'items-start'}`}
              style={{ animation: 'fadeIn 0.4s ease-out' }}>
              <span className="text-xs text-gray-500 mb-1 px-1">{msg.flag} {msg.from}</span>
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
            className={`text-xs px-3 py-1.5 rounded-full transition-all ${i === activeConvo ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/40' : 'bg-white/5 text-gray-500 border border-transparent hover:text-gray-300'}`}>
            {c.title}
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// TUTOR CHAT DEMO — showcases learning conversations
// ============================================================================

function TutorChatDemo() {
  const scenes = [
    { title: '🗣️ Free Conversation', subtitle: 'Practicing Spanish', messages: [
      { from: 'You', text: 'Ayer yo fui al mercado y compré muchas frutas', role: 'student' },
      { from: 'Tutor', text: '¡Casi perfecto! Small fix: "yo fui" → just "fui" — subject pronouns are usually dropped in Spanish. So: "Ayer fui al mercado." 🎯', role: 'tutor' },
      { from: 'You', text: 'Ah okay! Fui al mercado y compré manzanas', role: 'student' },
      { from: 'Tutor', text: '¡Excelente! 🌟 Perfect this time. "Compré manzanas" — great use of past tense. What else did you buy?', role: 'tutor' },
    ]},
    { title: '✍️ Writing Practice', subtitle: 'Learning Japanese', messages: [
      { from: 'Tutor', text: '📝 Write 2-3 sentences about what you did last weekend.', role: 'tutor' },
      { from: 'You', text: '週末に友達と映画を見ました。とても面白いでした。', role: 'student' },
      { from: 'Tutor', text: 'Great effort! One fix: "面白いでした" → "面白かったです" — i-adjectives conjugate directly (drop い, add かった). \n\n✨ Upgrade: Try "友達と一緒に" (together with friends) for more natural flow!', role: 'tutor' },
    ]},
    { title: '📄 Reading Comprehension', subtitle: 'Learning French', messages: [
      { from: 'Tutor', text: '📖 Read: "Le petit café au coin de la rue ouvre à 7h. Ils servent le meilleur croissant du quartier."\n\n❓ What time does the café open?\nA) 6h  B) 7h  C) 8h', role: 'tutor' },
      { from: 'You', text: 'B!', role: 'student' },
      { from: 'Tutor', text: '✅ Correct! "Ouvre à 7h" = opens at 7am.\n\n📌 Useful phrase: "au coin de la rue" means "on the street corner" — very common in giving directions!', role: 'tutor' },
    ]},
    { title: '🎭 Roleplay: At a Café', subtitle: 'Learning Korean', messages: [
      { from: 'Tutor', text: '☕ You\'re at a Seoul café. Order a drink and a pastry!\n\n점원: 어서오세요! 주문하시겠어요?\n(Clerk: Welcome! Would you like to order?)', role: 'tutor' },
      { from: 'You', text: '아메리카노 하나 주세요', role: 'student' },
      { from: 'Tutor', text: '좋아요! 🎯 Perfect polite form with 주세요. Now try adding a pastry — hint: "그리고" means "and", "크로와상" is croissant!', role: 'tutor' },
    ]},
    { title: '🎙️ Voice Practice', subtitle: 'Speaking Spanish', messages: [
      { from: 'Tutor', text: '🎙️ Repeat after me: "¿Dónde está la estación de tren?" (Where is the train station?)', role: 'tutor' },
      { from: 'You', text: '🎙️ "Donde esta la estacion de tren"', role: 'student' },
      { from: 'Tutor', text: '🎙️ Great attempt! Two tips:\n• Add the stress: "es-ta-CIÓN" — that accent mark matters!\n• The ¿ signals a question — your voice should rise at the end.\n\n🏆 Now try: "¿Cuánto cuesta un billete?" (How much is a ticket?)', role: 'tutor' },
    ]},
  ];

  const [activeScene, setActiveScene] = useState(0);
  const [visibleMessages, setVisibleMessages] = useState([]);

  useEffect(() => {
    setVisibleMessages([]);
    const msgs = scenes[activeScene].messages;
    const timers = [];
    msgs.forEach((_, i) => {
      timers.push(setTimeout(() => setVisibleMessages(prev => [...prev, i]), i * 1800 + 400));
    });
    const cycleTimer = setTimeout(() => setActiveScene(prev => (prev + 1) % scenes.length), msgs.length * 1800 + 3500);
    return () => { timers.forEach(clearTimeout); clearTimeout(cycleTimer); };
  }, [activeScene]);

  const scene = scenes[activeScene];

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="rounded-2xl overflow-hidden" style={{ ...S.card, border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Award className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">{scene.title}</div>
              <div className="text-xs text-gray-400">{scene.subtitle}</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20">
            <span className="text-[10px] text-purple-400 font-medium">AI TUTOR</span>
          </div>
        </div>
        <div className="p-4 space-y-3 min-h-[280px]">
          {scene.messages.map((msg, i) => visibleMessages.includes(i) && (
            <div key={`${activeScene}-${i}`} className={`flex flex-col ${msg.role === 'student' ? 'items-end' : 'items-start'}`}
              style={{ animation: 'fadeIn 0.4s ease-out' }}>
              <span className="text-xs text-gray-500 mb-1 px-1">{msg.from}</span>
              <div className={`max-w-[88%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-line ${
                msg.role === 'student'
                  ? 'bg-purple-500/30 text-purple-100'
                  : 'bg-white/10 text-gray-200'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-3 mt-6 px-4">
        {scenes.map((s, i) => (
          <button key={i} onClick={() => setActiveScene(i)}
            className={`text-xs px-3 py-1.5 rounded-full transition-all ${i === activeScene ? 'bg-purple-500/30 text-purple-300 border border-purple-500/40' : 'bg-white/5 text-gray-500 border border-transparent hover:text-gray-300'}`}>
            {s.title}
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
  { q: 'How does translation work in group chats?', a: 'Add @linguaxyz_bot to any group. Each member sets their language pairs with /setlang. The bot translates every message near real-time — no commands needed. A Vietnamese speaker sees English messages in Vietnamese; an English speaker sees Vietnamese messages in English. Everyone speaks their language, everyone understands each other.' },
  { q: 'What languages can I translate?', a: 'Translation supports 20 languages including Vietnamese, English, Chinese, Japanese, Korean, Thai, Spanish, French, German, Portuguese, Russian, Arabic, Hindi, and more. Any pair works.' },
  { q: 'What languages can I learn?', a: 'The tutor teaches 6 languages: English, Spanish, French, Japanese, Chinese (Mandarin), and Korean. More coming soon.' },
  { q: 'How much does it cost?', a: 'You get 50k tokens free on signup. Invite a friend and you both get 10k more — unlimited invites. Translation uses ~200 tokens per message; tutor classes use ~2k-5k per session. No subscriptions, no credit card needed.' },
  { q: 'What types of lessons are available?', a: 'Voice lessons with pronunciation feedback, structured curriculum classes, free conversation, 22 roleplay scenarios, vocabulary quizzes, spaced repetition review, writing practice with corrections, and reading comprehension. All adapt to your level — 9 practice modes total.' },
  { q: 'How does spaced repetition work?', a: 'Every word you learn gets tracked with the SM-2 algorithm. Words you struggle with come back more often. Use /review to practice due words — the bot schedules them automatically based on how well you remember.' },
  { q: 'How do voice lessons work?', a: 'Send a voice message during any lesson — the bot transcribes your speech with Voxtral AI and gives pronunciation feedback. Voice Talk mode is designed specifically for speaking practice with shadow drills, tongue twisters, and conversation challenges. Voice messages work in Free Talk, Roleplay, and all other session types too.' },
  { q: 'What\'s the difference between Free Talk and Roleplay?', a: 'Free Talk is open conversation — chat about anything with gentle corrections. Roleplay puts you in a scenario (ordering at a café, job interview, seeing a doctor) with a goal to complete.' },
  { q: 'Can I use it for just translation or just learning?', a: 'Absolutely. Many people use only the translator in group chats. Others only use the tutor in DMs. They\'re independent features that share your token balance.' },
  { q: 'Does the bot work in DMs too?', a: 'Yes! DM the bot for tutoring and translation. Translation works both in groups and DMs — send any text and it translates based on your /setlang pairs.' },
];

function HomePage() {
  return (
    <div>
      {/* Hero */}
      <div className="pt-32 pb-20 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-30" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(168,85,247,0.15) 0%, transparent 60%)' }} />
        <div className="max-w-4xl mx-auto relative">
          <Reveal>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-300 text-sm mb-8">
              <Sparkles className="w-4 h-4" /> Free to start — 50k tokens, no credit card
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Translate your group chats.<br />
              <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Learn any language.</span>
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
              A Telegram bot that translates group conversations in 20 languages near real-time,
              and teaches you a new language with classes, voice practice, conversation, writing, and reading.
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
              <span className="font-semibold text-white text-2xl">9 <span className="text-sm font-normal text-gray-400">practice modes</span></span>
              <span className="font-semibold text-white text-2xl">36 <span className="text-sm font-normal text-gray-400">curriculum topics</span></span>
              <span className="font-semibold text-white text-2xl">0→B1 <span className="text-sm font-normal text-gray-400">path</span></span>
            </div>
          </Reveal>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 1: TRANSLATE
         ═══════════════════════════════════════════════════════════════════════ */}
      <div id="translate" className="py-20 px-6" style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(6,182,212,0.03) 50%, transparent 100%)' }}>
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold uppercase tracking-wider mb-4">
                <Globe className="w-3.5 h-3.5" /> Translation
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Group chat translation, near real-time</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">Add the bot to any Telegram group. Everyone speaks their language — the bot translates every message automatically. No commands, no delays. Just talk.</p>
            </div>
          </Reveal>

          {/* Live group chat demo */}
          <Reveal delay={0.1}>
            <GroupChatDemo />
          </Reveal>

          {/* Translation features */}
          <Reveal delay={0.2}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-14">
              {[
                { icon: <Users className="w-5 h-5" />, title: 'Group chats', desc: 'Everyone speaks their language, everyone understands', color: 'cyan' },
                { icon: <Zap className="w-5 h-5" />, title: 'Near real-time', desc: 'Translations appear within seconds', color: 'amber' },
                { icon: <Type className="w-5 h-5" />, title: '20 languages', desc: 'Any pair — Vietnamese, English, Japanese, and more', color: 'purple' },
                { icon: <Shield className="w-5 h-5" />, title: 'Just /setlang', desc: 'One command to set up, then fully automatic', color: 'green' },
              ].map((f, i) => (
                <div key={i} style={S.card} className="rounded-xl p-5 text-center">
                  <div className={`w-10 h-10 rounded-lg bg-${f.color}-500/20 flex items-center justify-center mx-auto mb-3 text-${f.color}-400`}>{f.icon}</div>
                  <div className="text-sm font-semibold mb-1">{f.title}</div>
                  <div className="text-xs text-gray-500">{f.desc}</div>
                </div>
              ))}
            </div>
          </Reveal>

          {/* How group translation works */}
          <Reveal delay={0.3}>
            <div style={S.card} className="rounded-2xl p-6 md:p-8 mt-10">
              <h3 className="font-bold text-lg mb-5 text-center">How group translation works</h3>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { step: '1', title: 'Add bot to group', desc: 'Add @linguaxyz_bot to any Telegram group chat.' },
                  { step: '2', title: 'Each person runs /setlang', desc: 'Pick your language pair — Vietnamese↔English, Japanese↔English, etc.' },
                  { step: '3', title: 'Just chat normally', desc: 'The bot translates every message automatically. No /translate commands needed.' },
                ].map((s, i) => (
                  <div key={i} className="text-center">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-sm font-bold mx-auto mb-3">{s.step}</div>
                    <div className="font-semibold text-sm mb-1">{s.title}</div>
                    <div className="text-xs text-gray-400">{s.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Supported languages */}
          <Reveal delay={0.4}>
            <div className="flex flex-wrap justify-center gap-2 mt-10">
              {LANGUAGES.map(lang => (
                <span key={lang} className="text-xs px-3 py-1.5 rounded-full bg-white/5 text-gray-400 border border-white/5">{lang}</span>
              ))}
            </div>
          </Reveal>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 2: LEARN
         ═══════════════════════════════════════════════════════════════════════ */}
      <div id="learn" className="py-20 px-6" style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(168,85,247,0.03) 50%, transparent 100%)' }}>
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold uppercase tracking-wider mb-4">
                <Award className="w-3.5 h-3.5" /> Language School
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">A full language school in your pocket</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">Structured classes, voice lessons, conversation practice, writing, reading, quizzes, roleplay — 9 ways to practice, all powered by AI that remembers your strengths and weaknesses.</p>
            </div>
          </Reveal>

          {/* Live tutor demo */}
          <Reveal delay={0.1}>
            <div className="mb-14">
              <TutorChatDemo />
            </div>
          </Reveal>

          {/* 8 Practice Modes — emphasize new ones */}
          <div className="grid md:grid-cols-3 gap-4 mb-14">
            {[
              { icon: <Mic className="w-5 h-5" />, title: 'Voice Lessons', desc: 'Speak out loud! Get pronunciation feedback, shadow drills, and tongue twisters', color: 'rose', tag: 'NEW' },
              { icon: <BookOpen className="w-5 h-5" />, title: 'Structured Classes', desc: '36-topic curriculum from greetings to debate', color: 'purple', tag: null },
              { icon: <MessageSquare className="w-5 h-5" />, title: 'Free Conversation', desc: 'Chat about anything with real-time corrections', color: 'cyan', tag: null },
              { icon: <Compass className="w-5 h-5" />, title: 'Roleplay', desc: '22 real-life scenarios — café, airport, interview', color: 'amber', tag: null },
              { icon: <Brain className="w-5 h-5" />, title: 'Vocabulary Quiz', desc: 'Multiple choice, fill-in-the-blank, context clues', color: 'pink', tag: null },
              { icon: <Edit3 className="w-5 h-5" />, title: 'Writing Practice', desc: 'Write responses, get corrections & vocabulary upgrades', color: 'emerald', tag: null },
              { icon: <FileText className="w-5 h-5" />, title: 'Reading Comprehension', desc: 'Read passages, answer questions, learn phrases', color: 'blue', tag: null },
              { icon: <Repeat className="w-5 h-5" />, title: 'Spaced Repetition', desc: 'SM-2 algorithm schedules reviews at the right time', color: 'orange', tag: null },
              { icon: <Trophy className="w-5 h-5" />, title: 'Streaks & XP', desc: 'Daily streaks, levels, badges, and leaderboard', color: 'yellow', tag: null },
            ].map((m, i) => (
              <Reveal key={i} delay={i * 0.06}>
                <div style={S.card} className="rounded-2xl p-5 h-full relative">
                  {m.tag && (
                    <div className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      m.color === 'rose' ? 'bg-rose-500/20 border border-rose-500/30 text-rose-400' : 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
                    }`}>
                      {m.tag}
                    </div>
                  )}
                  <div className={`w-10 h-10 rounded-xl bg-${m.color}-500/20 flex items-center justify-center mb-3 text-${m.color}-400`}>{m.icon}</div>
                  <h3 className="font-semibold text-sm mb-1">{m.title}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">{m.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>

          {/* ⭐ VOICE LESSONS — hero feature spotlight */}
          <Reveal>
            <div className="rounded-2xl p-1 mb-14 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(244,63,94,0.3), rgba(168,85,247,0.3), rgba(59,130,246,0.3))' }}>
              <div className="rounded-xl p-6 md:p-8" style={{ background: 'linear-gradient(135deg, rgba(10,10,15,0.97) 0%, rgba(10,10,15,0.95) 100%)' }}>
                <div className="flex flex-col md:flex-row gap-8 items-center">
                  <div className="flex-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/15 border border-rose-500/25 text-rose-300 text-xs font-bold uppercase tracking-wider mb-4">
                      <Mic className="w-3.5 h-3.5" /> New Feature
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold mb-3">🎙️ Voice Lessons</h3>
                    <p className="text-gray-400 mb-5">Send voice messages to practice speaking. Get real-time pronunciation feedback, shadow drills, tongue twisters, and conversation challenges — all powered by Voxtral AI transcription.</p>
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      {[
                        { emoji: '🗣️', text: 'Shadow repeating' },
                        { emoji: '🎯', text: 'Pronunciation tips' },
                        { emoji: '🎭', text: 'Voice roleplays' },
                        { emoji: '🏆', text: 'XP & badges' },
                        { emoji: '🔥', text: 'Tongue twisters' },
                        { emoji: '📈', text: 'Difficulty scaling' },
                      ].map((f, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-gray-300">
                          <span>{f.emoji}</span><span>{f.text}</span>
                        </div>
                      ))}
                    </div>
                    <a href={BOT_URL} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold no-underline"
                      style={{ background: 'linear-gradient(135deg, #e11d48 0%, #a855f7 100%)' }}>
                      Try Voice Lessons <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>
                  <div className="w-full md:w-80 shrink-0">
                    <div className="rounded-xl overflow-hidden" style={{ ...S.card, border: '1px solid rgba(244,63,94,0.15)' }}>
                      <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-500 to-purple-500 flex items-center justify-center">
                          <Mic className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold">Voice Talk 🇪🇸</div>
                          <div className="text-[10px] text-gray-500">Speaking practice</div>
                        </div>
                      </div>
                      <div className="p-3 space-y-2.5 text-xs">
                        <div className="flex flex-col items-start">
                          <span className="text-[10px] text-gray-500 mb-0.5">Tutor</span>
                          <div className="bg-white/10 rounded-xl px-3 py-2 text-gray-200 max-w-[90%]">🎙️ Repeat: "¿Cuánto cuesta?"</div>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-[10px] text-gray-500 mb-0.5">You</span>
                          <div className="bg-rose-500/25 rounded-xl px-3 py-2 text-rose-100 max-w-[90%] flex items-center gap-1.5">
                            <Mic className="w-3 h-3 shrink-0" />
                            <span>"Cuanto cuesta"</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-start">
                          <span className="text-[10px] text-gray-500 mb-0.5">Tutor</span>
                          <div className="bg-white/10 rounded-xl px-3 py-2 text-gray-200 max-w-[90%]">⭐⭐⭐⭐ Great! Tip: stress the "CUES-ta". Now try: "¿Dónde está el baño?"</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          {/* NEW: Writing & Reading deep dive */}
          <Reveal>
            <div className="grid md:grid-cols-2 gap-5 mb-14">
              <div className="rounded-2xl p-6 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(16,185,129,0.02) 100%)', border: '1px solid rgba(16,185,129,0.15)' }}>
                <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">New</div>
                <Edit3 className="w-8 h-8 text-emerald-400 mb-4" />
                <h3 className="text-xl font-bold mb-3">✍️ Writing Practice</h3>
                <p className="text-sm text-gray-400 mb-4">Get a prompt matched to your level. Write your response. The tutor provides detailed corrections with explanations, grammar notes, and vocabulary upgrades.</p>
                <div className="space-y-2 text-sm">
                  {['Beginners: 2-3 sentences · Advanced: full paragraphs', 'Detailed corrections with explanations', 'Vocabulary upgrades suggested', '3-4 exchanges per session, earns XP'].map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-gray-300"><Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" /><span className="text-xs">{f}</span></div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl p-6 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(59,130,246,0.02) 100%)', border: '1px solid rgba(59,130,246,0.15)' }}>
                <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-wider">New</div>
                <FileText className="w-8 h-8 text-blue-400 mb-4" />
                <h3 className="text-xl font-bold mb-3">📄 Reading Comprehension</h3>
                <p className="text-sm text-gray-400 mb-4">Read short passages — menus, news snippets, or articles depending on your level. Answer comprehension questions and learn useful phrases from the text.</p>
                <div className="space-y-2 text-sm">
                  {['Level-matched passages (menu → news → articles)', 'Multiple choice comprehension questions', 'Explains mistakes, highlights useful phrases', '2-3 passages per session, earns XP'].map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-gray-300"><Check className="w-3.5 h-3.5 text-blue-400 shrink-0" /><span className="text-xs">{f}</span></div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>

          {/* Curriculum Timeline */}
          <Reveal>
            <div className="text-center mb-6">
              <h3 className="text-2xl md:text-3xl font-bold mb-3">36 topics from "hello" to <em>holding a conversation</em></h3>
              <p className="text-gray-400 max-w-xl mx-auto text-sm">Each unit has 4 phases: lesson → practice → conversation → quiz. You don't move on until you prove you've learned it.</p>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="flex flex-wrap justify-center gap-3 mb-10">
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

          <div className="space-y-6">
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

      {/* How It Works */}
      <div className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Start in 30 seconds</h2>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: <Bot className="w-6 h-6" />, title: 'Open Telegram', desc: 'Tap "Start on Telegram" — you get 50k tokens instantly. No signup, no email.' },
              { icon: <MessageCircle className="w-6 h-6" />, title: 'Pick your path', desc: 'Choose Translate to start translating, Learn to pick a language and take your first lesson, or My Account to manage tokens.' },
              { icon: <Zap className="w-6 h-6" />, title: 'Go', desc: 'Add bot to groups for translation, or DM for lessons. Invite friends for more free tokens.' },
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

      {/* FAQ & Commands */}
      <div id="faq" className="py-20 px-6" style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.01) 50%, transparent 100%)' }}>
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">FAQ & Commands</h2>
          </Reveal>
          <div className="grid md:grid-cols-2 gap-10">
            {/* Commands — updated to match new structure */}
            <Reveal>
              <div>
                <h3 className="font-bold text-lg mb-5 text-gray-300">Commands</h3>
                {[
                  { title: 'Main', cmds: [
                    ['/start', 'Main menu (Translate · Learn · Account)'],
                    ['/translate', 'Translation menu'],
                    ['/learn', 'Language school'],
                    ['/help', 'Show all commands'],
                  ]},
                  { title: 'Translation', cmds: [
                    ['/setlang', 'Set translation language pairs'],
                  ]},
                  { title: 'Learning', cmds: [
                    ['/talk', 'Free conversation practice'],
                    ['/stop', 'End current session'],
                    ['?word', 'Look up any word mid-lesson'],
                  ]},
                  { title: 'Account', cmds: [
                    ['/invite', 'Get referral link (earn 10k tokens)'],
                    ['/balance', 'Check token balance'],
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
                <div className="mt-4 p-3 rounded-lg bg-white/5 text-xs text-gray-500">
                  Power users: <code className="text-gray-400">/class</code> <code className="text-gray-400">/quiz</code> <code className="text-gray-400">/roleplay</code> <code className="text-gray-400">/review</code> <code className="text-gray-400">/progress</code> <code className="text-gray-400">/path</code> <code className="text-gray-400">/schedule</code> also work as shortcuts.
                </div>
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

      {/* Free Tokens */}
      <div className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <Reveal>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">100% free to start</h2>
            <p className="text-gray-400 mb-10 max-w-xl mx-auto">No credit card. No subscription. Get 50k tokens on signup and earn more by inviting friends.</p>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { icon: <Sparkles className="w-6 h-6" />, title: 'Sign up', tokens: '50k', desc: 'Free tokens just for starting', color: 'green' },
              { icon: <UserPlus className="w-6 h-6" />, title: 'Invite a friend', tokens: '+10k each', desc: 'You both get 10k — unlimited invites', color: 'cyan' },
              { icon: <Gift className="w-6 h-6" />, title: 'Keep inviting', tokens: '∞', desc: 'No cap on referral tokens', color: 'purple' },
            ].map((t, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div style={S.card} className="rounded-2xl p-6 text-center">
                  <div className={`w-12 h-12 rounded-xl bg-${t.color}-500/20 flex items-center justify-center mx-auto mb-4 text-${t.color}-400`}>{t.icon}</div>
                  <div className="text-2xl font-bold mb-1">{t.tokens}</div>
                  <div className="font-semibold text-sm mb-1">{t.title}</div>
                  <div className="text-xs text-gray-500">{t.desc}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="py-20 px-6 text-center">
        <Reveal>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Start translating. Start learning.</h2>
          <p className="text-gray-400 mb-8 max-w-lg mx-auto">One Telegram bot for both. No signup, no credit card, 50k tokens free.</p>
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
// DASHBOARD — updated: no buy tokens, referral-only
// ============================================================================

function Dashboard({ user, inviteStats, usageStats, purchases, purchaseSuccess, setPurchaseSuccess, onNavigate, onRefresh }) {
  const [copied, setCopied] = useState(null);

  if (!user) { onNavigate('home'); return null; }

  const totalInvites = inviteStats?.totalInvites || 0;
  const totalTokensEarned = inviteStats?.totalTokensEarned || 0;
  const totalMessages = usageStats?.totalMessages || 0;
  const botInviteUrl = `https://t.me/linguaxyz_bot?start=ref_${user.inviteCode}`;

  return (
    <div className="min-h-screen pt-24 pb-12 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">Hi, {user.name}! 👋</h1>
            <p className="text-gray-400">Your LinguaXYZ dashboard</p>
          </div>
          <button onClick={onRefresh} style={S.btnS} className="px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 text-sm text-white">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {/* Purchase success */}
        {purchaseSuccess && (
          <div className="mb-6 px-5 py-4 rounded-xl flex items-center gap-3" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}>
            <Check className="w-5 h-5 text-green-400" />
            <span className="text-sm text-green-300 font-medium">Tokens added successfully!</span>
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
              <span className="text-sm text-orange-300/70 ml-1">You have {formatTokens(user.balance)} tokens left. Invite friends to earn more!</span>
            </div>
          </div>
        )}

        {/* Invite Friends */}
        <div style={S.card} className="rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Share2 className="w-5 h-5 text-cyan-400" /> Invite Friends — Earn 10k Tokens Each
          </h2>
          <p className="text-gray-400 text-sm mb-4">Share your invite link. When a friend clicks it and starts the bot, you both get 10,000 tokens instantly. No limit!</p>
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
            <Gift className="w-5 h-5 text-green-400" /> How to Get More Tokens
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { icon: <Share2 className="w-5 h-5" />, title: 'Invite friends', desc: 'Both of you get 10k tokens — no limit!', color: 'cyan' },
              { icon: <MessageCircle className="w-5 h-5" />, title: 'Share in groups', desc: 'Add bot to groups, friends auto-discover it', color: 'purple' },
              { icon: <Gift className="w-5 h-5" />, title: 'Share your link', desc: 'Post your invite link on social media', color: 'green' },
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
