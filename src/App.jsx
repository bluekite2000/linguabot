import React, { useState, useEffect, useRef } from 'react';
import { Check, CheckCheck, Globe, MessageCircle, Zap, Shield, Users, Copy, ChevronRight, Menu, X, ArrowRight, Clock, Brain, Power, RefreshCw, Gift, Star, Quote, Sparkles, Lock, Cpu, Phone, Video, Smile, Mic, ArrowLeft, AlertCircle, BookOpen, FileText, Share2, Link, ExternalLink, UserPlus } from 'lucide-react';

const API = 'https://api.nhomnhom.com';
const S = {
  card: { background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)', border: '1px solid rgba(255,255,255,0.06)' },
  btnP: { background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)', border: 'none', cursor: 'pointer' },
  btnS: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' },
  input: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none' },
};

async function api(path, opts = {}) {
  const token = localStorage.getItem('token');
  const res = await fetch(API + path, {
    ...opts,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...opts.headers },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [groups, setGroups] = useState([]);
  const [inviteStats, setInviteStats] = useState(null);
  const [currentPage, setCurrentPage] = useState('home');
  const [loading, setLoading] = useState(true);
  const [invitedGroup, setInvitedGroup] = useState(null);

  const refreshData = async () => {
    try {
      const data = await api('/api/me');
      setUser(data.user);
      setGroups(data.groups);
      setInviteStats(data.inviteStats);
    } catch (e) {
      console.error('Refresh failed:', e);
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      refreshData().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
    // Check for invite code in URL
    const path = window.location.pathname;
    if (path.startsWith('/join/')) {
      const code = path.replace('/join/', '');
      localStorage.setItem('pendingInvite', code);
      if (token) {
        setCurrentPage('invite-landing');
      } else {
        setCurrentPage('signup');
      }
    }
  }, []);

  const navigate = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
    if (page === 'home') window.history.pushState({}, '', '/');
  };

  const handleSignup = async (formData) => {
    try {
      const inviteCode = localStorage.getItem('pendingInvite');
      const data = await api('/api/signup', {
        method: 'POST',
        body: JSON.stringify({ ...formData, inviteCode }),
      });
      localStorage.setItem('token', data.token);
      localStorage.removeItem('pendingInvite');
      setUser(data.user);
      await refreshData();
      
      // If invited to a group, show instructions
      if (data.invitedGroup) {
        setInvitedGroup(data.invitedGroup);
        navigate('invited');
        return;
      }
      navigate('dashboard');
    } catch (e) {
      return e.message;
    }
  };

  const handleLogin = async (email, password) => {
    try {
      const data = await api('/api/login', { method: 'POST', body: JSON.stringify({ email, password }) });
      localStorage.setItem('token', data.token);
      setUser(data.user);
      await refreshData();
      navigate('dashboard');
    } catch (e) {
      return e.message;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setGroups([]);
    navigate('home');
  };

  if (loading) return <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-white">Loading...</div>;

  const navItems = [{ label: 'Features', href: '#features' }, { label: 'How It Works', href: '#howto' }];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4" style={{ background: 'rgba(10,10,15,0.8)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="cursor-pointer flex items-center gap-2.5" onClick={() => navigate('home')}><div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center"><Globe className="w-4 h-4 text-white" /></div><span className="font-semibold text-lg tracking-tight">LinguaBot</span></div>
            {navItems.map(item => (<a key={item.label} href={item.href} className="text-gray-300 hover:text-white transition-colors text-sm font-medium">{item.label}</a>))}
          </div>
          {user ? (
            <div className="flex items-center gap-3">
              <button onClick={() => navigate('dashboard')} style={S.btnP} className="px-4 py-2 rounded-lg text-white text-sm font-medium">Dashboard</button>
              <button onClick={handleLogout} className="text-gray-400 hover:text-white text-sm">Log out</button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button onClick={() => navigate('login')} className="text-gray-300 hover:text-white text-sm font-medium">Log in</button>
              <button onClick={() => navigate('signup')} style={S.btnP} className="px-4 py-2 rounded-lg text-white text-sm font-medium">Sign up free</button>
            </div>
          )}
        </div>
      </nav>

      {currentPage === 'home' && <HomePage onNavigate={navigate} />}
      {currentPage === 'signup' && <SignupPage onNavigate={navigate} onSignup={handleSignup} />}
      {currentPage === 'login' && <LoginPage onNavigate={navigate} onLogin={handleLogin} />}
      {currentPage === 'dashboard' && <Dashboard user={user} groups={groups} inviteStats={inviteStats} onNavigate={navigate} onRefresh={refreshData} />}
      {currentPage === 'invite-landing' && <InviteLandingPage onNavigate={navigate} />}
      {currentPage === 'invited' && <InvitedPage group={invitedGroup} onNavigate={navigate} />}
    </div>
  );
}

// ============================================================================
// HOMEPAGE
// ============================================================================

function HomePage({ onNavigate }) {
  return (
    <div className="relative">
      {/* Hero */}
      <section className="relative min-h-screen overflow-hidden pt-32 pb-20">
        <div className="absolute top-20 left-[10%] w-72 h-72 rounded-full bg-purple-500/20 blur-[100px]" />
        <div className="absolute bottom-20 right-[10%] w-96 h-96 rounded-full bg-cyan-500/15 blur-[120px]" />
        
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 mb-8">
            <Gift className="w-4 h-4 text-green-400" />
            <span className="text-sm text-green-300">100% Free — Earn hours by inviting friends!</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
            <span className="block text-white">AI Translation</span>
            <span className="block bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">for Telegram</span>
          </h1>
          
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
            Real-time Vietnamese ↔ English translation in your Telegram groups. 
            <span className="text-white"> No payments</span> — invite friends to earn unlimited free hours.
          </p>
          
          <button onClick={() => onNavigate('signup')} style={S.btnP} className="text-white px-8 py-4 rounded-full font-semibold text-lg inline-flex items-center gap-3">
            Start Free <ArrowRight className="w-5 h-5" />
          </button>
          
          <div className="flex items-center justify-center gap-8 mt-12 text-sm text-gray-500">
            <div className="flex items-center gap-2"><Check className="w-4 h-4 text-green-400" /> 1 free hour on signup</div>
            <div className="flex items-center gap-2"><Check className="w-4 h-4 text-green-400" /> +1 hour per friend invited</div>
            <div className="flex items-center gap-2"><Check className="w-4 h-4 text-green-400" /> No credit card needed</div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="howto" className="relative py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-gray-400">Get translating in 3 minutes. Earn unlimited hours by inviting friends.</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: <UserPlus className="w-6 h-6" />, title: 'Sign up', desc: 'Create account, get 1 free hour' },
              { icon: <MessageCircle className="w-6 h-6" />, title: 'Add bot to group', desc: 'Add @clawdtranslatebot to any Telegram group' },
              { icon: <Link className="w-6 h-6" />, title: 'Link your group', desc: 'Send /start, enter code on dashboard' },
              { icon: <Share2 className="w-6 h-6" />, title: 'Invite & earn', desc: 'Each friend who joins = +1 hour for both' },
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
      </section>

      {/* Features */}
      <section id="features" className="relative py-24 bg-white/[0.02]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why LinguaBot?</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: <Zap className="w-6 h-6" />, title: 'Instant Translation', desc: 'Messages translated in real-time as people chat', color: 'cyan' },
              { icon: <Brain className="w-6 h-6" />, title: 'Context-Aware', desc: 'AI understands idioms, slang, and cultural nuances', color: 'purple' },
              { icon: <Gift className="w-6 h-6" />, title: 'Free Forever', desc: 'No payments ever — just invite friends to earn hours', color: 'green' },
            ].map((f, i) => (
              <div key={i} style={S.card} className="rounded-2xl p-6">
                <div className={`w-12 h-12 rounded-xl bg-${f.color}-500/20 flex items-center justify-center mb-4 text-${f.color}-400`}>{f.icon}</div>
                <h3 className="font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-gray-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to break language barriers?</h2>
          <p className="text-gray-400 mb-8">Start with 1 free hour. Invite friends for unlimited translation.</p>
          <button onClick={() => onNavigate('signup')} style={S.btnP} className="text-white px-8 py-4 rounded-full font-semibold text-lg inline-flex items-center gap-3">
            Get Started Free <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>
    </div>
  );
}

// ============================================================================
// AUTH PAGES
// ============================================================================

function SignupPage({ onNavigate, onSignup }) {
  const [fd, setFd] = useState({ email: '', password: '', name: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [invitedGroup, setInvitedGroup] = useState(null);
  const pendingInvite = localStorage.getItem('pendingInvite');

  const go = async () => {
    if (!fd.email || !fd.password || fd.password.length < 6) return;
    setLoading(true);
    setError('');
    const result = await onSignup({ name: fd.name || fd.email.split('@')[0], email: fd.email, password: fd.password });
    if (typeof result === 'string') setError(result);
    else if (result?.invitedGroup) setInvitedGroup(result.invitedGroup);
    setLoading(false);
  };

  if (invitedGroup) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 py-32">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-green-400" />
          </div>
          <h1 className="text-3xl font-bold mb-4">You're in! 🎉</h1>
          <p className="text-gray-400 mb-6">Now join the Telegram group to start chatting:</p>
          <div style={S.card} className="rounded-xl p-4 mb-6">
            <p className="font-semibold">{invitedGroup.name}</p>
          </div>
          {invitedGroup.telegramLink ? (
            <a href={invitedGroup.telegramLink} target="_blank" rel="noopener noreferrer" style={S.btnP} className="w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 text-white">
              Join Telegram Group <ExternalLink className="w-5 h-5" />
            </a>
          ) : (
            <p className="text-gray-400 text-sm">Ask the group owner for the Telegram invite link!</p>
          )}
          <button onClick={() => onNavigate('dashboard')} className="mt-4 text-purple-400 text-sm">Go to Dashboard →</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-32">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center mx-auto mb-6"><Globe className="w-8 h-8" /></div>
          <h1 className="text-3xl font-bold mb-2">Create your account</h1>
          <p className="text-gray-400">Get your free translation hour</p>
          {pendingInvite && <p className="text-green-400 text-sm mt-2">🎁 You've been invited! Sign up to join the group.</p>}
        </div>
        <div className="rounded-2xl p-8" style={S.card}>
          {error && <div className="mb-6 px-4 py-3 rounded-xl flex items-center gap-3" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}><AlertCircle className="w-5 h-5 text-red-400" /><span className="text-sm text-red-300">{error}</span></div>}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
            <input type="text" value={fd.name} onChange={e => setFd({ ...fd, name: e.target.value })} style={S.input} className="w-full px-4 py-3 rounded-xl" placeholder="Your name" />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
            <input type="email" value={fd.email} onChange={e => setFd({ ...fd, email: e.target.value })} style={S.input} className="w-full px-4 py-3 rounded-xl" placeholder="you@example.com" />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
            <input type="password" value={fd.password} onChange={e => setFd({ ...fd, password: e.target.value })} onKeyDown={e => e.key === 'Enter' && go()} style={S.input} className="w-full px-4 py-3 rounded-xl" placeholder="Min 6 characters" />
          </div>
          <button onClick={go} disabled={loading} style={S.btnP} className="w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 text-white">
            {loading ? <><RefreshCw className="w-5 h-5 animate-spin" /> Creating...</> : <>Create Account <ArrowRight className="w-5 h-5" /></>}
          </button>
          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <p className="text-gray-400 text-sm">Already have an account? <button onClick={() => onNavigate('login')} className="text-purple-400 hover:text-purple-300">Sign in</button></p>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoginPage({ onNavigate, onLogin }) {
  const [fd, setFd] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const go = async () => {
    if (!fd.email || !fd.password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    setError('');
    const err = await onLogin(fd.email, fd.password);
    if (err) setError(err);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-32">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center mx-auto mb-6"><Globe className="w-8 h-8" /></div>
          <h1 className="text-3xl font-bold mb-2">Welcome back</h1>
          <p className="text-gray-400">Sign in to your account</p>
        </div>
        <div className="rounded-2xl p-8" style={S.card}>
          {error && <div className="mb-6 px-4 py-3 rounded-xl flex items-center gap-3" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}><AlertCircle className="w-5 h-5 text-red-400" /><span className="text-sm text-red-300">{error}</span></div>}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
            <input type="email" value={fd.email} onChange={e => setFd({ ...fd, email: e.target.value })} style={S.input} className="w-full px-4 py-3 rounded-xl" placeholder="you@example.com" />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
            <input type="password" value={fd.password} onChange={e => setFd({ ...fd, password: e.target.value })} onKeyDown={e => e.key === 'Enter' && go()} style={S.input} className="w-full px-4 py-3 rounded-xl" placeholder="Your password" />
          </div>
          <button onClick={go} disabled={loading} style={S.btnP} className="w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 text-white">
            {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <>Sign In <ArrowRight className="w-5 h-5" /></>}
          </button>
          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <p className="text-gray-400 text-sm">Don't have an account? <button onClick={() => onNavigate('signup')} className="text-purple-400 hover:text-purple-300">Sign up free</button></p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// INVITE LANDING PAGE
// ============================================================================

function InviteLandingPage({ onNavigate }) {
  const [groupInfo, setGroupInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const inviteCode = localStorage.getItem('pendingInvite');

  useEffect(() => {
    if (!inviteCode) {
      setError('No invite code found');
      setLoading(false);
      return;
    }
    fetch(`${API}/api/groups/invite/${inviteCode}`)
      .then(r => r.ok ? r.json() : Promise.reject('Group not found'))
      .then(data => { setGroupInfo(data); setLoading(false); })
      .catch(() => { setError('Invalid or expired invite link'); setLoading(false); });
  }, [inviteCode]);

  if (loading) return <div className="min-h-screen flex items-center justify-center pt-24 text-gray-400">Loading...</div>;

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-32">
      <div className="w-full max-w-md text-center">
        {error ? (
          <>
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <h1 className="text-2xl font-bold mb-4">{error}</h1>
            <button onClick={() => onNavigate('home')} style={S.btnP} className="px-6 py-3 rounded-xl text-white font-medium">Go Home</button>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
              <Users className="w-8 h-8 text-green-400" />
            </div>
            <h1 className="text-3xl font-bold mb-2">You're invited! 🎉</h1>
            <p className="text-gray-400 mb-6">Join <span className="text-white font-medium">{groupInfo.name}</span> for real-time translation</p>
            
            <div style={S.card} className="rounded-xl p-5 mb-6 text-left">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Group</span>
                <span className="font-medium">{groupInfo.name}</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Created by</span>
                <span className="text-sm">{groupInfo.ownerName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Members</span>
                <span className="text-sm">{groupInfo.members}</span>
              </div>
            </div>

            {groupInfo.telegramLink ? (
              <a href={groupInfo.telegramLink} target="_blank" rel="noopener noreferrer" style={S.btnP} className="w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 text-white">
                Join Telegram Group <ExternalLink className="w-5 h-5" />
              </a>
            ) : (
              <p className="text-gray-400 text-sm">Ask the group owner for the Telegram invite link!</p>
            )}
            <button onClick={() => onNavigate('dashboard')} className="mt-4 text-purple-400 text-sm hover:text-purple-300">Go to Dashboard →</button>
          </>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// INVITED PAGE (shown after signup via invite)
// ============================================================================

function InvitedPage({ group, onNavigate }) {
  if (!group) {
    onNavigate('dashboard');
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-32">
      <div className="w-full max-w-md text-center">
        <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
          <Check className="w-8 h-8 text-green-400" />
        </div>
        <h1 className="text-3xl font-bold mb-4">You're in! 🎉</h1>
        <p className="text-gray-400 mb-6">Now join the Telegram group to start chatting:</p>
        <div style={S.card} className="rounded-xl p-4 mb-6">
          <p className="font-semibold">{group.name}</p>
        </div>
        {group.telegramLink ? (
          <a href={group.telegramLink} target="_blank" rel="noopener noreferrer" style={S.btnP} className="w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 text-white">
            Join Telegram Group <ExternalLink className="w-5 h-5" />
          </a>
        ) : (
          <p className="text-gray-400 text-sm">Ask the group owner for the Telegram invite link!</p>
        )}
        <button onClick={() => onNavigate('dashboard')} className="mt-4 text-purple-400 text-sm hover:text-purple-300">Go to Dashboard →</button>
      </div>
    </div>
  );
}

// ============================================================================
// DASHBOARD
// ============================================================================

function Dashboard({ user, groups, inviteStats, onNavigate, onRefresh }) {
  const [showLink, setShowLink] = useState(false);
  const [linkCode, setLinkCode] = useState('');
  const [linkError, setLinkError] = useState('');
  const [linkLoading, setLinkLoading] = useState(false);
  const [linkSuccess, setLinkSuccess] = useState('');
  const [copied, setCopied] = useState(null);
  const [showLangModal, setShowLangModal] = useState(null); // chatId of group being edited
  const [langPairs, setLangPairs] = useState([]);
  const [langSaving, setLangSaving] = useState(false);

  const LANGUAGES = [
    { code: 'vi', name: 'Vietnamese', flag: '🇻🇳' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
    { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
    { code: 'ko', name: 'Korean', flag: '🇰🇷' },
    { code: 'th', name: 'Thai', flag: '🇹🇭' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸' },
    { code: 'fr', name: 'French', flag: '🇫🇷' },
    { code: 'de', name: 'German', flag: '🇩🇪' },
    { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
    { code: 'ru', name: 'Russian', flag: '🇷🇺' },
    { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
    { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
    { code: 'id', name: 'Indonesian', flag: '🇮🇩' },
    { code: 'ms', name: 'Malay', flag: '🇲🇾' },
    { code: 'tl', name: 'Tagalog', flag: '🇵🇭' },
    { code: 'it', name: 'Italian', flag: '🇮🇹' },
    { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
    { code: 'pl', name: 'Polish', flag: '🇵🇱' },
    { code: 'uk', name: 'Ukrainian', flag: '🇺🇦' },
  ];

  const getLang = (code) => LANGUAGES.find(l => l.code === code) || { code, name: code, flag: '🌐' };

  if (!user) { onNavigate('login'); return null; }

  const copyInviteLink = (code) => {
    navigator.clipboard?.writeText?.(`https://nhomnhom.com/join/${code}`);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  const toggleGroup = async (chatId, active) => {
    try {
      await api('/api/groups/toggle', { method: 'POST', body: JSON.stringify({ chatId, active }) });
      await onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  const openLangModal = (group) => {
    setShowLangModal(group.chatId);
    setLangPairs(group.languagePairs || [['vi', 'en'], ['en', 'vi']]);
  };

  const addLangPair = () => {
    if (langPairs.length >= 10) return;
    setLangPairs([...langPairs, ['vi', 'en']]);
  };

  const removeLangPair = (index) => {
    if (langPairs.length <= 1) return;
    setLangPairs(langPairs.filter((_, i) => i !== index));
  };

  const updateLangPair = (index, field, value) => {
    const newPairs = [...langPairs];
    newPairs[index] = field === 'from' ? [value, newPairs[index][1]] : [newPairs[index][0], value];
    setLangPairs(newPairs);
  };

  const saveLangPairs = async () => {
    setLangSaving(true);
    try {
      await api('/api/groups/set-languages', { method: 'POST', body: JSON.stringify({ chatId: showLangModal, languagePairs: langPairs }) });
      await onRefresh();
      setShowLangModal(null);
    } catch (e) {
      console.error(e);
    } finally {
      setLangSaving(false);
    }
  };

  const linkGroup = async () => {
    if (!linkCode.trim()) return;
    setLinkLoading(true);
    setLinkError('');
    setLinkSuccess('');
    try {
      const data = await api('/api/groups/link', { method: 'POST', body: JSON.stringify({ code: linkCode.trim().toUpperCase() }) });
      setLinkSuccess(`Linked "${data.group.name}"!`);
      setLinkCode('');
      await onRefresh();
      setTimeout(() => { setShowLink(false); setLinkSuccess(''); }, 2000);
    } catch (e) {
      setLinkError(e.message);
    } finally {
      setLinkLoading(false);
    }
  };

  const activeGroups = groups?.filter(g => g.active) || [];
  const totalMembers = groups?.reduce((sum, g) => sum + (g.members || 0), 0) || 0;
  const totalHoursEarned = user.hoursEarned || 0;

  return (
    <div className="min-h-screen pt-24 pb-12 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">Hi, {user.name}! 👋</h1>
            <p className="text-gray-400">Invite friends to earn more translation hours</p>
          </div>
          <button onClick={() => setShowLink(true)} style={S.btnP} className="px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 text-sm text-white">
            <Link className="w-4 h-4" /> Link New Group
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div style={S.card} className="rounded-2xl p-5">
            <div className="text-sm text-gray-400 mb-1">Balance</div>
            <div className={`text-3xl font-bold ${user.balance <= 1 ? 'text-orange-400' : 'text-green-400'}`}>{user.balance}h</div>
          </div>
          <div style={S.card} className="rounded-2xl p-5">
            <div className="text-sm text-gray-400 mb-1">Active Groups</div>
            <div className="text-3xl font-bold">{activeGroups.length}</div>
          </div>
          <div style={S.card} className="rounded-2xl p-5">
            <div className="text-sm text-gray-400 mb-1">Members Invited</div>
            <div className="text-3xl font-bold text-purple-400">{totalMembers}</div>
          </div>
          <div style={S.card} className="rounded-2xl p-5">
            <div className="text-sm text-gray-400 mb-1">Hours Earned</div>
            <div className="text-3xl font-bold text-cyan-400">{totalHoursEarned}h</div>
          </div>
        </div>

        {/* Low balance warning */}
        {user.balance <= 1 && (
          <div className="mb-6 px-5 py-4 rounded-xl flex items-center gap-3" style={{ background: 'rgba(251,146,60,0.1)', border: '1px solid rgba(251,146,60,0.3)' }}>
            <AlertCircle className="w-5 h-5 text-orange-400" />
            <div className="flex-1">
              <span className="text-sm text-orange-300 font-medium">Low balance!</span>
              <span className="text-sm text-orange-300/70 ml-1">Share your invite links below to earn more hours.</span>
            </div>
          </div>
        )}

        {/* Groups */}
        <div style={S.card} className="rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-purple-400" /> Your Groups
          </h2>

          {(!groups || groups.length === 0) ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="font-semibold mb-2">No groups linked yet</h3>
              <p className="text-gray-400 text-sm mb-4">Add @clawdtranslatebot to a Telegram group, send /start, then link it here.</p>
              <button onClick={() => setShowLink(true)} style={S.btnP} className="px-6 py-2.5 rounded-xl text-white text-sm font-medium">Link a Group</button>
            </div>
          ) : (
            <div className="space-y-4">
              {groups.map(g => (
                <div key={g.chatId} style={S.card} className="rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${g.active ? 'bg-green-400' : 'bg-gray-500'}`} />
                      <span className="font-medium">{g.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${g.active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                        {g.active ? 'Active' : 'Paused'}
                      </span>
                    </div>
                    <button onClick={() => toggleGroup(g.chatId, !g.active)} className="p-2 rounded-lg hover:bg-white/10">
                      <Power className={`w-4 h-4 ${g.active ? 'text-red-400' : 'text-green-400'}`} />
                    </button>
                  </div>

                  {/* Language Pairs */}
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <Globe className="w-4 h-4 text-cyan-400" />
                    {(g.languagePairs || [['vi', 'en'], ['en', 'vi']]).map(([from, to], i) => (
                      <span key={i} className="text-xs px-2 py-1 rounded bg-cyan-500/20 text-cyan-300">
                        {getLang(from).flag} → {getLang(to).flag}
                      </span>
                    ))}
                    <button onClick={() => openLangModal(g)} className="text-xs px-2 py-1 rounded bg-white/10 text-gray-300 hover:bg-white/20">
                      Edit
                    </button>
                  </div>

                  <div className="flex items-center gap-6 text-sm text-gray-400 mb-4">
                    <span>{g.messages} messages</span>
                    <span>{g.members || 0} members</span>
                    <span className="text-cyan-400">+{g.hoursEarned || 0}h earned</span>
                  </div>

                  {/* Invite Link */}
                  <div className="flex items-center gap-2 p-3 bg-white/5 rounded-lg">
                    <Share2 className="w-4 h-4 text-purple-400" />
                    <span className="text-sm text-gray-300 flex-1 truncate">nhomnhom.com/join/{g.inviteCode}</span>
                    <button onClick={() => copyInviteLink(g.inviteCode)} className="px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-300 text-sm font-medium hover:bg-purple-500/30">
                      {copied === g.inviteCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Share this link — when friends join and chat, you both earn +1 hour!</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* How to earn */}
        <div style={S.card} className="rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Gift className="w-5 h-5 text-green-400" /> How to Earn Hours
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { icon: <Share2 className="w-5 h-5" />, title: 'Share invite link', desc: 'Copy your group\'s invite link and share it' },
              { icon: <Users className="w-5 h-5" />, title: 'Friend joins & chats', desc: 'They sign up and send a message in the group' },
              { icon: <Gift className="w-5 h-5" />, title: 'Both earn +1 hour', desc: 'You and your friend each get 1 free hour!' },
            ].map((s, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center text-green-400 shrink-0">{s.icon}</div>
                <div>
                  <div className="font-medium text-sm">{s.title}</div>
                  <div className="text-xs text-gray-400">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Link Modal */}
        {showLink && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ background: 'rgba(0,0,0,0.8)' }}>
            <div className="rounded-2xl p-6 max-w-md w-full" style={{ ...S.card, border: '1px solid rgba(255,255,255,0.1)' }}>
              <h2 className="text-xl font-bold mb-4">Link a Group</h2>
              <p className="text-gray-400 text-sm mb-4">
                1. Add @clawdtranslatebot to your Telegram group<br />
                2. Send /start in the group<br />
                3. Enter the 6-character code below
              </p>
              {linkError && <div className="mb-4 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm">{linkError}</div>}
              {linkSuccess && <div className="mb-4 px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/30 text-green-300 text-sm">{linkSuccess}</div>}
              <input
                type="text"
                value={linkCode}
                onChange={e => setLinkCode(e.target.value.toUpperCase())}
                maxLength={6}
                style={S.input}
                className="w-full px-4 py-3 rounded-xl text-center text-2xl tracking-widest mb-4"
                placeholder="ABC123"
              />
              <div className="flex gap-3">
                <button onClick={() => setShowLink(false)} style={S.btnS} className="flex-1 py-3 rounded-xl font-medium text-white">Cancel</button>
                <button onClick={linkGroup} disabled={linkLoading} style={S.btnP} className="flex-1 py-3 rounded-xl font-medium text-white">
                  {linkLoading ? 'Linking...' : 'Link Group'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Language Settings Modal */}
        {showLangModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ background: 'rgba(0,0,0,0.8)' }}>
            <div className="rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto" style={{ ...S.card, border: '1px solid rgba(255,255,255,0.1)' }}>
              <h2 className="text-xl font-bold mb-2">Translation Languages</h2>
              <p className="text-gray-400 text-sm mb-4">Set which languages to translate from and to. You can add multiple pairs.</p>
              
              <div className="space-y-3 mb-4">
                {langPairs.map((pair, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <select 
                      value={pair[0]} 
                      onChange={e => updateLangPair(i, 'from', e.target.value)}
                      style={S.input}
                      className="flex-1 px-3 py-2 rounded-lg"
                    >
                      {LANGUAGES.map(l => (
                        <option key={l.code} value={l.code}>{l.flag} {l.name}</option>
                      ))}
                    </select>
                    <span className="text-gray-400">→</span>
                    <select 
                      value={pair[1]} 
                      onChange={e => updateLangPair(i, 'to', e.target.value)}
                      style={S.input}
                      className="flex-1 px-3 py-2 rounded-lg"
                    >
                      {LANGUAGES.map(l => (
                        <option key={l.code} value={l.code}>{l.flag} {l.name}</option>
                      ))}
                    </select>
                    <button 
                      onClick={() => removeLangPair(i)}
                      className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-red-400"
                      disabled={langPairs.length <= 1}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {langPairs.length < 10 && (
                <button onClick={addLangPair} className="w-full py-2 rounded-lg border border-dashed border-white/20 text-gray-400 text-sm hover:border-white/40 hover:text-white mb-4">
                  + Add another language pair
                </button>
              )}

              <p className="text-xs text-gray-500 mb-4">
                Example: If you add Vietnamese → English and English → Vietnamese, 
                messages in Vietnamese will be translated to English and vice versa.
              </p>

              <div className="flex gap-3">
                <button onClick={() => setShowLangModal(null)} style={S.btnS} className="flex-1 py-3 rounded-xl font-medium text-white">Cancel</button>
                <button onClick={saveLangPairs} disabled={langSaving} style={S.btnP} className="flex-1 py-3 rounded-xl font-medium text-white">
                  {langSaving ? 'Saving...' : 'Save Languages'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
