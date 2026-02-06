import React, { useState, useEffect, Component } from 'react';
import { Check, Globe, MessageCircle, Zap, Users, Menu, X, ArrowRight, RefreshCw, Gift, Sparkles, AlertCircle, Share2, UserPlus, CreditCard, ExternalLink } from 'lucide-react';

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

    // Magic login from bot's /web or /buy command
    const urlToken = params.get('token');
    if (urlToken) {
      localStorage.setItem('token', urlToken);
    }

    // Show buy modal if ?buy=true
    if (params.get('buy') === 'true') {
      setShowBuy(true);
    }

    // Purchase success
    if (params.get('purchased')) {
      setPurchaseSuccess(true);
    }

    // Clean URL
    if (urlToken || params.get('buy') || params.get('purchased') || params.get('cancelled')) {
      window.history.replaceState({}, '', '/');
    }

    const token = localStorage.getItem('token');
    if (token) {
      refreshData().then(() => {
        setCurrentPage('dashboard');
      }).finally(() => setLoading(false));
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

  const navItems = [{ label: 'Features', href: '#features' }, { label: 'How It Works', href: '#howto' }];

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
                <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm mt-1 border bg-cyan-500/10 border-cyan-500/20 text-cyan-200`}
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
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}

// ============================================================================
// HOME PAGE — Telegram-first CTA
// ============================================================================

function HomePage() {
  return (
    <div>
      {/* Hero */}
      <div className="pt-32 pb-16 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm mb-8">
            <Sparkles className="w-4 h-4" /> Powered by Claude AI
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Translate chats<br /><span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">in real time</span>
          </h1>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Add LinguaXYZ to any Telegram chat. Everyone speaks their language — the bot translates instantly.
            <span className="text-white"> 10k free tokens</span> — no signup needed.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href={BOT_URL} target="_blank" rel="noopener noreferrer"
              style={S.btnP} className="px-8 py-4 rounded-xl text-white font-semibold text-lg inline-flex items-center gap-2 no-underline">
              Start on Telegram <ArrowRight className="w-5 h-5" />
            </a>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 mt-12 text-sm text-gray-500">
            <div className="flex items-center gap-1.5"><Check className="w-4 h-4 text-green-400" /> No signup needed</div>
            <div className="flex items-center gap-1.5"><Check className="w-4 h-4 text-green-400" /> 10k free tokens</div>
            <div className="flex items-center gap-1.5"><Check className="w-4 h-4 text-green-400" /> 20+ languages</div>
          </div>
        </div>
      </div>

      {/* Chat Demo */}
      <div className="py-16 px-6"><ChatDemo /></div>

      {/* How It Works */}
      <div id="howto" className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: <MessageCircle className="w-6 h-6" />, title: 'Open the bot', desc: 'Click "Start on Telegram" — you get 10k tokens instantly' },
              { icon: <UserPlus className="w-6 h-6" />, title: 'Add to any chat', desc: 'Add @linguaxyz_bot to a group or DM it directly' },
              { icon: <Share2 className="w-6 h-6" />, title: 'Invite & earn', desc: 'Share your invite link — both of you get 10k tokens' },
            ].map((s, i) => (
              <div key={i} style={S.card} className="rounded-2xl p-6 text-center relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-xs font-bold">{i + 1}</div>
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mx-auto mb-4 text-purple-400">{s.icon}</div>
                <h3 className="font-semibold mb-2">{s.title}</h3>
                <p className="text-sm text-gray-400">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features */}
      <div id="features" className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Why LinguaXYZ?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: <Zap className="w-6 h-6" />, title: 'Instant Translation', desc: 'AI translates every message in real time — no delays', color: 'purple' },
              { icon: <Globe className="w-6 h-6" />, title: '20+ Languages', desc: 'Vietnamese, English, Chinese, Japanese, Korean, and many more', color: 'cyan' },
              { icon: <Gift className="w-6 h-6" />, title: 'Pay Per Use', desc: 'Only pay for what you use. Invite friends or buy tokens to keep going', color: 'green' },
            ].map((f, i) => (
              <div key={i} style={S.card} className="rounded-2xl p-6">
                <div className={`w-12 h-12 rounded-xl bg-${f.color}-500/20 flex items-center justify-center mb-4 text-${f.color}-400`}>{f.icon}</div>
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="py-16 px-6 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to break language barriers?</h2>
        <p className="text-gray-400 mb-8">Start translating in seconds. No signup, no setup.</p>
        <a href={BOT_URL} target="_blank" rel="noopener noreferrer"
          style={S.btnP} className="px-8 py-4 rounded-xl text-white font-semibold text-lg inline-flex items-center gap-2 no-underline">
          Start on Telegram <ArrowRight className="w-5 h-5" />
        </a>
      </div>

      {/* Footer */}
      <div className="py-8 px-6 border-t border-white/5 text-center text-gray-500 text-sm">
        © 2026 LinguaXYZ. Powered by Claude AI.
      </div>
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
