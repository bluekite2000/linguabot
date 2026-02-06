import { useState, useEffect, useCallback } from "react";

// ============================================================================
// CONFIG
// ============================================================================

const API = window.location.origin;
const BOT_USERNAME = "LinguaXYZBot"; // change to your bot username
const TELEGRAM_URL = `https://t.me/${BOT_USERNAME}`;

// ============================================================================
// API HELPERS
// ============================================================================

async function fetchMe(token) {
  const res = await fetch(`${API}/api/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Unauthorized");
  return res.json();
}

// ============================================================================
// FORMAT HELPERS
// ============================================================================

function formatTokens(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}k`;
  return String(n);
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

// ============================================================================
// MAIN APP
// ============================================================================

export default function App() {
  const [token, setToken] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  // Extract token from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token");
    if (t) {
      setToken(t);
      window.history.replaceState({}, "", window.location.pathname);
    } else {
      const saved = sessionStorage.getItem("lingua_token");
      if (saved) setToken(saved);
      else setLoading(false);
    }
  }, []);

  // Fetch user data when token is set
  useEffect(() => {
    if (!token) return;
    sessionStorage.setItem("lingua_token", token);
    setLoading(true);
    fetchMe(token)
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => {
        sessionStorage.removeItem("lingua_token");
        setToken(null);
        setError("Session expired. Use /web in the bot to get a new link.");
        setLoading(false);
      });
  }, [token]);

  const logout = () => {
    sessionStorage.removeItem("lingua_token");
    setToken(null);
    setData(null);
  };

  if (loading) return <LoadingScreen />;
  if (data) return <Dashboard data={data} onLogout={logout} copied={copied} setCopied={setCopied} />;
  return <LandingPage error={error} />;
}

// ============================================================================
// LOADING
// ============================================================================

function LoadingScreen() {
  return (
    <div style={styles.loadingWrap}>
      <div style={styles.loadingPulse}>
        <span style={styles.loadingIcon}>🌐</span>
      </div>
      <style>{`
        @keyframes pulse { 0%,100% { transform: scale(1); opacity: 0.8; } 50% { transform: scale(1.15); opacity: 1; } }
      `}</style>
    </div>
  );
}

// ============================================================================
// LANDING PAGE
// ============================================================================

function LandingPage({ error }) {
  return (
    <div style={styles.landing}>
      <style>{landingCSS}</style>

      {/* NAV */}
      <nav style={styles.nav}>
        <div style={styles.navBrand}>
          <span style={styles.navLogo}>語</span>
          <span style={styles.navName}>LinguaXYZ</span>
        </div>
      </nav>

      {/* HERO */}
      <section style={styles.hero}>
        <div style={styles.heroInner}>
          <div className="hero-badge" style={styles.heroBadge}>
            AI-Powered Translation Bot
          </div>
          <h1 style={styles.heroTitle}>
            Translate messages
            <br />
            <span style={styles.heroAccent}>in any Telegram chat</span>
          </h1>
          <p style={styles.heroSub}>
            Add the bot to your group. It auto-translates every message between
            languages — Vietnamese, English, Chinese, Japanese, Korean, and 15+
            more. No commands needed. Just talk.
          </p>

          <div style={styles.heroCTAs}>
            <a href={TELEGRAM_URL} style={styles.ctaPrimary} className="cta-hover">
              <TelegramIcon /> Start on Telegram
            </a>
            <a href="#how" style={styles.ctaSecondary} className="cta-hover-alt">
              How it works ↓
            </a>
          </div>

          <div style={styles.heroProof}>
            <span style={styles.heroProofDot} />
            Free to try — 10k tokens on signup, no credit card
          </div>

          {error && <div style={styles.errorBanner}>{error}</div>}
        </div>

        {/* DEMO */}
        <div style={styles.demoWrap}>
          <ChatDemo />
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" style={styles.howSection}>
        <h2 style={styles.howTitle}>Three steps. That's it.</h2>
        <div style={styles.howGrid}>
          <StepCard n="1" title="Add the bot" desc="Search @LinguaXYZBot on Telegram and add it to any group chat." />
          <StepCard n="2" title="Set languages" desc="Use /setlang to pick language pairs (e.g. Vietnamese ↔ English)." />
          <StepCard n="3" title="Just talk" desc="Every message gets translated automatically. No commands, no hassle." />
        </div>
      </section>

      {/* FOOTER */}
      <footer style={styles.footer}>
        <span style={{ opacity: 0.5 }}>LinguaXYZ — Instant translation for Telegram</span>
      </footer>
    </div>
  );
}

function StepCard({ n, title, desc }) {
  return (
    <div style={styles.stepCard} className="step-card">
      <div style={styles.stepNumber}>{n}</div>
      <h3 style={styles.stepTitle}>{title}</h3>
      <p style={styles.stepDesc}>{desc}</p>
    </div>
  );
}

function ChatDemo() {
  const messages = [
    { name: "Linh", text: "Hôm nay ăn gì nhỉ?", translation: "What should we eat today?", flag: "🇻🇳", side: "left" },
    { name: "Mike", text: "Let's get phở!", translation: "Mình đi ăn phở đi!", flag: "🇺🇸", side: "right" },
    { name: "田中", text: "フォー大好き！", translation: "I love phở!", flag: "🇯🇵", side: "left" },
  ];

  return (
    <div style={styles.demoPhone}>
      <div style={styles.demoHeader}>
        <span style={{ fontWeight: 700, fontSize: 14 }}>🌐 Travel Group</span>
        <span style={{ opacity: 0.5, fontSize: 12 }}>3 members</span>
      </div>
      {messages.map((m, i) => (
        <div key={i} style={{ ...styles.demoBubbleRow, justifyContent: m.side === "right" ? "flex-end" : "flex-start" }} className="demo-msg">
          <div style={{ ...styles.demoBubble, ...(m.side === "right" ? styles.demoBubbleRight : {}) }}>
            <div style={styles.demoName}>{m.flag} {m.name}</div>
            <div style={styles.demoText}>{m.text}</div>
            <div style={styles.demoTranslation}>↳ {m.translation}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// DASHBOARD
// ============================================================================

function Dashboard({ data, onLogout, copied, setCopied }) {
  const { user, inviteStats, usageStats, purchases } = data;

  const inviteLink = `https://t.me/${BOT_USERNAME}?start=ref_${user.inviteCode}`;

  const copyInvite = useCallback(() => {
    navigator.clipboard.writeText(inviteLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [inviteLink, setCopied]);

  const balancePercent = Math.min(100, (user.balance / Math.max(user.balance, user.tokensUsed, 50000)) * 100);

  return (
    <div style={styles.dash}>
      <style>{dashCSS}</style>

      {/* TOP BAR */}
      <header style={styles.dashHeader}>
        <div style={styles.dashBrand}>
          <span style={styles.navLogo}>語</span>
          <span style={{ fontWeight: 700, fontSize: 18, color: "#e8e8ed" }}>LinguaXYZ</span>
        </div>
        <div style={styles.dashHeaderRight}>
          <span style={styles.dashName}>{user.name}</span>
          <button onClick={onLogout} style={styles.logoutBtn}>Log out</button>
        </div>
      </header>

      <main style={styles.dashMain}>
        <h1 style={styles.dashGreeting}>Welcome back, {user.name.split(" ")[0]}</h1>

        {/* STAT CARDS */}
        <div style={styles.statGrid}>
          <StatCard label="Balance" value={formatTokens(user.balance)} sub={`${formatTokens(user.tokensUsed)} used`} color="#10b981" icon="⚡" />
          <StatCard label="Translations" value={usageStats.totalMessages.toLocaleString()} sub={`${formatTokens(usageStats.totalTokens)} tokens`} color="#6366f1" icon="💬" />
          <StatCard label="Referrals" value={inviteStats.totalInvites} sub={`+${formatTokens(inviteStats.totalTokensEarned)} earned`} color="#f59e0b" icon="👥" />
        </div>

        {/* BALANCE BAR */}
        <div style={styles.balanceSection}>
          <div style={styles.balanceBarTrack}>
            <div style={{ ...styles.balanceBarFill, width: `${balancePercent}%` }} />
          </div>
          <div style={styles.balanceLabels}>
            <span>{formatTokens(user.balance)} remaining</span>
            <span style={{ opacity: 0.5 }}>Need more? Use /buy in the bot</span>
          </div>
        </div>

        {/* INVITE SECTION */}
        <div style={styles.inviteSection}>
          <h2 style={styles.sectionTitle}>Invite friends, earn tokens</h2>
          <p style={styles.sectionSub}>
            Both you and your friend get <strong>10,000 tokens</strong> when they join.
          </p>
          <div style={styles.inviteLinkRow}>
            <input
              readOnly
              value={inviteLink}
              style={styles.inviteInput}
              onFocus={(e) => e.target.select()}
            />
            <button onClick={copyInvite} style={styles.copyBtn} className="cta-hover">
              {copied ? "✓ Copied" : "Copy"}
            </button>
          </div>
        </div>

        {/* PURCHASE HISTORY */}
        {purchases && purchases.length > 0 && (
          <div style={styles.historySection}>
            <h2 style={styles.sectionTitle}>Purchase history</h2>
            <div style={styles.historyList}>
              {purchases.map((p, i) => (
                <div key={i} style={styles.historyRow}>
                  <span style={styles.historyAmount}>${p.amount}</span>
                  <span style={styles.historyTokens}>+{formatTokens(p.tokens)} tokens</span>
                  <span style={styles.historyDate}>{timeAgo(p.date)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MEMBER SINCE */}
        <div style={styles.memberSince}>
          Member since {new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </div>
      </main>
    </div>
  );
}

function StatCard({ label, value, sub, color, icon }) {
  return (
    <div style={styles.statCard} className="stat-card">
      <div style={{ ...styles.statIcon, background: `${color}18` }}>
        <span style={{ fontSize: 20 }}>{icon}</span>
      </div>
      <div>
        <div style={styles.statValue}>{value}</div>
        <div style={styles.statLabel}>{label}</div>
        <div style={styles.statSub}>{sub}</div>
      </div>
    </div>
  );
}

function TelegramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: 8, flexShrink: 0 }}>
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
    </svg>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const font = "'DM Sans', 'Helvetica Neue', sans-serif";
const fontDisplay = "'Instrument Serif', Georgia, serif";
const bg = "#0a0a0f";
const surface = "#13131a";
const border = "#1e1e2a";
const text1 = "#e8e8ed";
const text2 = "#8888a0";
const accent = "#6366f1";
const green = "#10b981";

const styles = {
  // Loading
  loadingWrap: { display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: bg },
  loadingPulse: { animation: "pulse 1.5s ease-in-out infinite" },
  loadingIcon: { fontSize: 48 },

  // Landing
  landing: { minHeight: "100vh", background: bg, color: text1, fontFamily: font, overflowX: "hidden" },
  nav: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 32px", maxWidth: 1100, margin: "0 auto" },
  navBrand: { display: "flex", alignItems: "center", gap: 10 },
  navLogo: { fontSize: 24, fontWeight: 700, background: `linear-gradient(135deg, ${accent}, #a78bfa)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
  navName: { fontWeight: 700, fontSize: 18 },

  hero: { maxWidth: 1100, margin: "0 auto", padding: "60px 32px 80px", display: "grid", gridTemplateColumns: "1fr 380px", gap: 60, alignItems: "center" },
  heroInner: {},
  heroBadge: { display: "inline-block", padding: "6px 14px", borderRadius: 99, border: `1px solid ${border}`, fontSize: 13, color: text2, marginBottom: 24, letterSpacing: 0.3 },
  heroTitle: { fontSize: "clamp(36px, 5vw, 56px)", fontFamily: fontDisplay, fontWeight: 400, lineHeight: 1.1, margin: "0 0 20px" },
  heroAccent: { background: `linear-gradient(90deg, ${accent}, #a78bfa, ${green})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
  heroSub: { fontSize: 17, lineHeight: 1.6, color: text2, maxWidth: 480, margin: "0 0 32px" },
  heroCTAs: { display: "flex", gap: 14, flexWrap: "wrap" },
  ctaPrimary: { display: "inline-flex", alignItems: "center", padding: "14px 28px", borderRadius: 12, background: accent, color: "#fff", fontWeight: 600, fontSize: 15, textDecoration: "none", transition: "all .2s", border: "none", cursor: "pointer" },
  ctaSecondary: { display: "inline-flex", alignItems: "center", padding: "14px 28px", borderRadius: 12, background: "transparent", color: text2, fontWeight: 500, fontSize: 15, textDecoration: "none", border: `1px solid ${border}`, transition: "all .2s", cursor: "pointer" },
  heroProof: { marginTop: 20, fontSize: 13, color: text2, display: "flex", alignItems: "center", gap: 8 },
  heroProofDot: { width: 6, height: 6, borderRadius: "50%", background: green, flexShrink: 0 },
  errorBanner: { marginTop: 20, padding: "12px 16px", borderRadius: 10, background: "#ef44441a", border: "1px solid #ef444433", color: "#f87171", fontSize: 14 },

  demoWrap: { display: "flex", justifyContent: "center" },
  demoPhone: { width: 340, background: surface, borderRadius: 20, border: `1px solid ${border}`, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.4)" },
  demoHeader: { padding: "16px 20px", borderBottom: `1px solid ${border}`, display: "flex", justifyContent: "space-between", alignItems: "center" },
  demoBubbleRow: { display: "flex", padding: "6px 16px" },
  demoBubble: { maxWidth: "80%", padding: "10px 14px", borderRadius: "14px 14px 14px 4px", background: "#1a1a28", marginBottom: 2 },
  demoBubbleRight: { borderRadius: "14px 14px 4px 14px", background: "#1c1c3a" },
  demoName: { fontSize: 12, fontWeight: 600, marginBottom: 4, opacity: 0.7 },
  demoText: { fontSize: 14, lineHeight: 1.4 },
  demoTranslation: { fontSize: 12, color: "#6366f1", marginTop: 4, fontStyle: "italic" },

  // How it works
  howSection: { maxWidth: 1100, margin: "0 auto", padding: "80px 32px 100px" },
  howTitle: { fontSize: "clamp(28px, 4vw, 40px)", fontFamily: fontDisplay, fontWeight: 400, textAlign: "center", marginBottom: 48 },
  howGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24 },
  stepCard: { background: surface, border: `1px solid ${border}`, borderRadius: 16, padding: "32px 28px", transition: "border-color .2s" },
  stepNumber: { width: 36, height: 36, borderRadius: "50%", background: `${accent}18`, color: accent, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 15, marginBottom: 16 },
  stepTitle: { fontSize: 18, fontWeight: 600, marginBottom: 8, fontFamily: font },
  stepDesc: { fontSize: 14, color: text2, lineHeight: 1.5, margin: 0 },

  footer: { textAlign: "center", padding: "32px", fontSize: 13, color: text2, borderTop: `1px solid ${border}` },

  // Dashboard
  dash: { minHeight: "100vh", background: bg, color: text1, fontFamily: font },
  dashHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 32px", borderBottom: `1px solid ${border}`, background: surface },
  dashBrand: { display: "flex", alignItems: "center", gap: 10 },
  dashHeaderRight: { display: "flex", alignItems: "center", gap: 16 },
  dashName: { fontSize: 14, color: text2 },
  logoutBtn: { padding: "6px 14px", borderRadius: 8, border: `1px solid ${border}`, background: "transparent", color: text2, fontSize: 13, cursor: "pointer", transition: "all .2s" },
  dashMain: { maxWidth: 720, margin: "0 auto", padding: "40px 24px 80px" },
  dashGreeting: { fontSize: "clamp(24px, 4vw, 32px)", fontFamily: fontDisplay, fontWeight: 400, marginBottom: 32 },

  statGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 32 },
  statCard: { background: surface, border: `1px solid ${border}`, borderRadius: 14, padding: "20px 22px", display: "flex", alignItems: "center", gap: 16, transition: "border-color .2s" },
  statIcon: { width: 44, height: 44, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  statValue: { fontSize: 22, fontWeight: 700 },
  statLabel: { fontSize: 13, color: text2, fontWeight: 500 },
  statSub: { fontSize: 12, color: text2, opacity: 0.6 },

  balanceSection: { marginBottom: 32 },
  balanceBarTrack: { height: 6, borderRadius: 3, background: border },
  balanceBarFill: { height: "100%", borderRadius: 3, background: `linear-gradient(90deg, ${green}, ${accent})`, transition: "width .5s ease" },
  balanceLabels: { display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 13, color: text2 },

  inviteSection: { background: surface, border: `1px solid ${border}`, borderRadius: 16, padding: "28px 24px", marginBottom: 32 },
  sectionTitle: { fontSize: 18, fontWeight: 600, marginBottom: 6, fontFamily: font },
  sectionSub: { fontSize: 14, color: text2, lineHeight: 1.5, marginBottom: 16 },
  inviteLinkRow: { display: "flex", gap: 10 },
  inviteInput: { flex: 1, padding: "10px 14px", borderRadius: 10, border: `1px solid ${border}`, background: bg, color: text1, fontSize: 13, fontFamily: "monospace", outline: "none" },
  copyBtn: { padding: "10px 20px", borderRadius: 10, background: accent, color: "#fff", fontWeight: 600, fontSize: 14, border: "none", cursor: "pointer", transition: "all .2s", whiteSpace: "nowrap" },

  historySection: { background: surface, border: `1px solid ${border}`, borderRadius: 16, padding: "28px 24px", marginBottom: 32 },
  historyList: {},
  historyRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${border}` },
  historyAmount: { fontWeight: 600, fontSize: 15 },
  historyTokens: { color: green, fontSize: 14 },
  historyDate: { color: text2, fontSize: 13 },

  memberSince: { textAlign: "center", fontSize: 13, color: text2, opacity: 0.5, marginTop: 16 },
};

// ============================================================================
// CSS ANIMATIONS & RESPONSIVE
// ============================================================================

const landingCSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Instrument+Serif&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${bg}; margin: 0; -webkit-font-smoothing: antialiased; }

  .cta-hover:hover { transform: translateY(-1px); filter: brightness(1.1); }
  .cta-hover-alt:hover { border-color: ${accent} !important; color: ${text1} !important; }
  .step-card:hover { border-color: ${accent}44 !important; }
  .stat-card:hover { border-color: ${accent}44 !important; }

  .demo-msg { animation: fadeUp 0.5s ease both; }
  .demo-msg:nth-child(2) { animation-delay: 0.15s; }
  .demo-msg:nth-child(3) { animation-delay: 0.3s; }
  .demo-msg:nth-child(4) { animation-delay: 0.45s; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @media (max-width: 768px) {
    section[style] { grid-template-columns: 1fr !important; }
    nav { padding: 16px 20px !important; }
    section { padding-left: 20px !important; padding-right: 20px !important; }
  }
`;

const dashCSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Instrument+Serif&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${bg}; margin: 0; -webkit-font-smoothing: antialiased; }

  .cta-hover:hover { transform: translateY(-1px); filter: brightness(1.1); }
  .stat-card:hover { border-color: ${accent}44 !important; }

  @media (max-width: 640px) {
    main { padding-left: 16px !important; padding-right: 16px !important; }
    header { padding: 14px 16px !important; }
  }
`;
