import { createFileRoute, Link } from "@tanstack/react-router";
import { Flame, ArrowRight, Star, Shield, Zap, Check, Users, BarChart3, Bell, TrendingUp, Clock, Gift } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function Waves({ lineColor = "#d97706", waveSpeedX = 0.0125, waveSpeedY = 0.01, waveAmpX = 40, waveAmpY = 20, friction = 0.9, tension = 0.01, maxCursorMove = 120, xGap = 12, yGap = 36 }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouse = useRef({ x: -999, y: -999, vx: 0, vy: 0 });
  const frame = useRef(0);
  const animRef = useRef<number | null>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let W: number, H: number, cols: number, rows: number, points: any[];
    const resize = () => {
      W = canvas.offsetWidth; H = canvas.offsetHeight;
      canvas.width = W; canvas.height = H;
      cols = Math.ceil(W / xGap) + 2; rows = Math.ceil(H / yGap) + 2;
      points = [];
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++)
        points.push({ ox: c * xGap, oy: r * yGap, x: c * xGap, y: r * yGap, vx: 0, vy: 0 });
    };
    const onMove = (e: any) => {
      const rect = canvas.getBoundingClientRect();
      const cx = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
      const cy = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
      mouse.current.vx = cx - mouse.current.x; mouse.current.vy = cy - mouse.current.y;
      mouse.current.x = cx; mouse.current.y = cy;
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("resize", resize);
    resize();
    const draw = () => {
      frame.current++;
      ctx.clearRect(0, 0, W, H);
      for (let i = 0; i < points.length; i++) {
        const p = points[i]; const r2 = Math.floor(i / cols); const c2 = i % cols;
        const tx = p.ox + Math.sin(frame.current * waveSpeedX + c2 * 0.3 + r2 * 0.1) * waveAmpX;
        const ty = p.oy + Math.cos(frame.current * waveSpeedY + r2 * 0.3 + c2 * 0.1) * waveAmpY;
        const dx = mouse.current.x - p.ox; const dy = mouse.current.y - p.oy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const inf = Math.max(0, 1 - dist / maxCursorMove);
        p.vx += (tx - p.x) * tension + mouse.current.vx * inf * 0.4;
        p.vy += (ty - p.y) * tension + mouse.current.vy * inf * 0.4;
        p.vx *= friction; p.vy *= friction; p.x += p.vx; p.y += p.vy;
      }
      ctx.strokeStyle = lineColor; ctx.lineWidth = 0.6; ctx.globalAlpha = 0.4;
      for (let r2 = 0; r2 < rows; r2++) {
        ctx.beginPath();
        for (let c2 = 0; c2 < cols; c2++) {
          const p = points[r2 * cols + c2];
          if (c2 === 0) ctx.moveTo(p.x, p.y);
          else { const prev = points[r2 * cols + c2 - 1]; ctx.quadraticCurveTo(prev.x, prev.y, (prev.x + p.x) / 2, (prev.y + p.y) / 2); }
        }
        ctx.stroke();
      }
      for (let c2 = 0; c2 < cols; c2++) {
        ctx.beginPath();
        for (let r2 = 0; r2 < rows; r2++) {
          const p = points[r2 * cols + c2];
          if (r2 === 0) ctx.moveTo(p.x, p.y);
          else { const prev = points[(r2 - 1) * cols + c2]; ctx.quadraticCurveTo(prev.x, prev.y, (prev.x + p.x) / 2, (prev.y + p.y) / 2); }
        }
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => { if (animRef.current !== null) cancelAnimationFrame(animRef.current); window.removeEventListener("mousemove", onMove); window.removeEventListener("touchmove", onMove); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }} />;
}

function Ticker() {
  const items = ["☕ +340 stamps today at Brûlée Bistro","🎉 Roots Kitchen hit 1,000 loyal customers","📈 The Daily Grind saw 38% more repeat visits","💌 Oak & Grain sent a promo — 94% open rate","⭐ Café Noir launched their 3rd loyalty plan"];
  const doubled = [...items, ...items];
  return (
    <>
    {/* <div style={{ background: "#d97706", overflow: "hidden", padding: "10px 0", borderBottom: "1px solid #b45309" }}>
      <div style={{ display: "flex", gap: 60, animation: "ticker 28s linear infinite", whiteSpace: "nowrap", width: "max-content" }}>
        {doubled.map((t, i) => <span key={i} style={{ fontSize: 13, fontWeight: 600, color: "white", letterSpacing: ".02em" }}>{t}</span>)}
      </div> 
    </div> */}
    </>
  );
}

function AnimatedCounter({ to, suffix = "", duration = 1800 }: { to: number; suffix?: string; duration?: number }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement | null>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.5 });
    obs.observe(el); return () => obs.disconnect();
  }, []);
  useEffect(() => {
    if (!visible) return;
    let start: number | null = null;
    const step = (ts: number) => { if (!start) start = ts; const p = Math.min((ts - start) / duration, 1); setVal(Math.round((1 - Math.pow(1 - p, 3)) * to)); if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }, [visible, to, duration]);
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

function useReveal(threshold = 0.12) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold });
    obs.observe(el); return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible] as const;
}

const plans = [
  { id: "free", name: "Free", price: "ETB 0", badge: null, cta: "Start free — no card needed", featured: false, features: ["2 staff accounts","200 customer profiles","30 menu items","1 loyalty program","7-day analytics"] },
  { id: "loyal", name: "Loyal", price: "ETB 990", badge: "Most popular", cta: "Start growing", featured: true, features: ["4 staff accounts","1,000 customers","100 menu items","1 loyalty program","4 push notifications/mo","30-day analytics"] },
  { id: "trustworthy", name: "Trustworthy", price: "ETB 2,490", badge: null, cta: "Level up", featured: false, features: ["6 staff accounts","5,000 customers","300 menu items","1 loyalty program","8 targeted campaigns/mo","90-day analytics"] },
  { id: "faithful", name: "Faithful", price: "ETB 4,990", badge: "Best value", cta: "Go all-in", featured: false, features: ["10 staff accounts","Unlimited customers","Unlimited menu items","2 loyalty program","12 bulk/targeted blasts","1-year analytics + export"] },
];

const testimonials = [
  { quote: "We used to run paper punch cards that customers lost. Now they check their stamps before they even order. Revenue from regulars is up 44%.", name: "Sofia Reyes", role: "Owner, Brûlée Bistro", initials: "SR", color: "#d97706" },
  { quote: "I set up our loyalty program on a Tuesday afternoon. By Friday we had 80 sign-ups. I didn't write a single line of code.", name: "Marcus Oduya", role: "Founder, Roots Kitchen", initials: "MO", color: "#92400e" },
  { quote: "The notification feature is a game-changer. I sent one 'Free slice Friday' blast and had a line out the door by noon.", name: "Anya Lim", role: "Owner, The Daily Grind", initials: "AL", color: "#b45309" },
];

function LandingPage() {
  const { isAuthenticated } = useAuth();
  const [featRef, featVisible] = useReveal();
  const [howRef, howVisible] = useReveal();
  const [priceRef, priceVisible] = useReveal();
  const [testRef, testVisible] = useReveal();

  return (
    <div style={{ fontFamily: "'DM Sans','Nunito',sans-serif", background: "#faf7f2", color: "#2c1f0e", minHeight: "100vh", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Playfair+Display:ital,wght@0,700;0,800;1,700;1,800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        :root{--b50:#faf7f2;--b100:#f5ede0;--b200:#e8d5be;--b300:#d4b896;--b400:#c09a6e;--b500:#a97c4a;--b600:#8a6035;--b700:#6b4826;--b800:#4e321a;--b900:#2c1f0e;--amber:#d97706;--amber2:#b45309;--amber3:#92400e;}
        .nav{position:fixed;top:16px;left:0;right:0;z-index:100;padding:0 32px;pointer-events:none;}
        .nav-inner{max-width:1160px;margin:0 auto;height:64px;padding:0 10px 0 14px;border:1px solid rgba(232,213,190,.72);border-radius:18px;background:rgba(250,247,242,.78);backdrop-filter:blur(22px) saturate(145%);box-shadow:0 18px 60px rgba(44,31,14,.12),inset 0 1px 0 rgba(255,255,255,.75);display:flex;align-items:center;justify-content:space-between;pointer-events:auto;}
        .logo{display:flex;align-items:center;gap:11px;color:var(--b900);text-decoration:none;min-width:0;}
        .logo-icon{width:40px;height:40px;background:linear-gradient(135deg,var(--amber),var(--amber3));border-radius:13px;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 22px rgba(217,119,6,.32),inset 0 1px 0 rgba(255,255,255,.26);}
        .logo-copy{display:flex;flex-direction:column;line-height:1;}
        .logo-name{font-family:'Playfair Display',serif;font-size:21px;font-weight:800;color:var(--b900);letter-spacing:-.01em;}
        .logo-sub{font-size:10px;font-weight:800;color:var(--b500);letter-spacing:.16em;text-transform:uppercase;margin-top:4px;}
        .nav-links{display:flex;align-items:center;gap:4px;margin-left:34px;margin-right:auto;}
        .nav-link{padding:9px 13px;border-radius:10px;font-size:13px;font-weight:700;color:var(--b600);text-decoration:none;transition:background .18s ease,color .18s ease;}
        .nav-link:hover{background:rgba(245,237,224,.86);color:var(--b900);}
        .nav-actions{display:flex;align-items:center;gap:8px;}
        .btn-ghost{padding:10px 16px;border-radius:12px;font-size:14px;font-weight:800;color:var(--b700);background:rgba(255,255,255,.38);border:1px solid rgba(232,213,190,.8);cursor:pointer;text-decoration:none;transition:all .18s ease;white-space:nowrap;}
        .btn-ghost:hover{background:white;color:var(--b900);border-color:var(--b300);transform:translateY(-1px);}
        .btn-nav{min-height:42px;padding:0 18px;border-radius:13px;font-size:14px;font-weight:800;color:#fff;background:linear-gradient(135deg,var(--amber),var(--amber2));border:1px solid rgba(255,255,255,.18);cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;gap:7px;box-shadow:0 10px 24px rgba(180,83,9,.28);transition:all .2s ease;white-space:nowrap;}
        .btn-nav:hover{transform:translateY(-1px);box-shadow:0 14px 30px rgba(180,83,9,.36);}
        .hero-wrap{position:relative;overflow:hidden;background:linear-gradient(155deg,#1a0f05 0%,#2c1f0e 40%,#4e321a 70%,#6b4826 100%);min-height:100vh;display:flex;flex-direction:column;}
        .hero-glow{position:absolute;inset:0;background:radial-gradient(ellipse 70% 55% at 65% 45%,rgba(217,119,6,.2) 0%,transparent 65%);pointer-events:none;}
        .hero-content{position:relative;z-index:2;max-width:1200px;margin:0 auto;padding:210px 40px 80px;display:grid;grid-template-columns:1.1fr .9fr;gap:72px;align-items:center;width:100%;}
        .hero-tag{display:inline-flex;align-items:center;gap:8px;padding:6px 14px;border-radius:100px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);font-size:12px;font-weight:700;color:#fbbf24;letter-spacing:.08em;text-transform:uppercase;margin-bottom:22px;}
        .hero h1{font-family:'Playfair Display',serif;font-size:62px;font-weight:800;line-height:1.06;color:#faf7f2;margin-bottom:10px;}
        .accent{font-style:italic;background:linear-gradient(90deg,#fbbf24 0%,#f59e0b 50%,#fbbf24 100%);background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:shimmer 3s linear infinite;}
        .hero-sub{font-size:19px;line-height:1.65;color:rgba(250,247,242,.58);margin:20px 0 36px;max-width:500px;}
        .hero-cta{display:flex;align-items:center;gap:12px;flex-wrap:wrap;}
        .btn-hero{padding:15px 30px;border-radius:12px;font-size:16px;font-weight:700;color:#fff;background:linear-gradient(135deg,var(--amber),var(--amber2));border:none;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;gap:8px;box-shadow:0 4px 22px rgba(180,83,9,.55);transition:all .2s;}
        .btn-hero:hover{transform:translateY(-2px);box-shadow:0 8px 32px rgba(180,83,9,.65);}
        .btn-hero-ghost{padding:15px 28px;border-radius:12px;font-size:16px;font-weight:600;color:rgba(250,247,242,.85);background:rgba(255,255,255,.07);border:1.5px solid rgba(255,255,255,.2);cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;gap:8px;transition:all .2s;}
        .btn-hero-ghost:hover{background:rgba(255,255,255,.13);}
        .trust-row{margin-top:28px;display:flex;align-items:center;gap:14px;}
        .trust-avatars{display:flex;}
        .trust-avatar{width:30px;height:30px;border-radius:50%;border:2px solid rgba(255,255,255,.2);font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;color:white;}
        .hero-mockup{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);border-radius:22px;backdrop-filter:blur(20px);overflow:hidden;box-shadow:0 40px 100px rgba(0,0,0,.45);animation:floatY 5s ease-in-out infinite;}
        .mock-bar{background:rgba(0,0,0,.25);border-bottom:1px solid rgba(255,255,255,.07);padding:13px 18px;display:flex;align-items:center;gap:7px;}
        .dot{width:11px;height:11px;border-radius:50%;}
        .mock-body{padding:22px;}
        .mock-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:18px;}
        .mock-stat{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.07);border-radius:11px;padding:13px 15px;}
        .mock-sl{font-size:10px;color:rgba(250,247,242,.45);font-weight:600;text-transform:uppercase;letter-spacing:.06em;margin-bottom:3px;}
        .mock-sv{font-size:20px;font-weight:700;color:#faf7f2;}
        .mock-sc{font-size:10px;color:#4ade80;font-weight:600;}
        .mock-chart{display:flex;gap:5px;align-items:flex-end;height:72px;margin-bottom:18px;padding:10px 14px;background:rgba(255,255,255,.04);border-radius:11px;border:1px solid rgba(255,255,255,.05);}
        .cbar{flex:1;border-radius:3px 3px 0 0;background:linear-gradient(to top,#d97706,#fbbf24);animation:growBar .9s ease both;}
        .cbar.m{background:rgba(255,255,255,.14);}
        .stamp-card{background:linear-gradient(135deg,#78350f,#d97706);border-radius:13px;padding:15px 18px;color:white;}
        .sdots{display:flex;gap:7px;flex-wrap:wrap;margin-top:8px;}
        .sdot{width:26px;height:26px;border-radius:50%;background:rgba(255,255,255,.18);border:1.5px solid rgba(255,255,255,.35);display:flex;align-items:center;justify-content:center;font-size:11px;}
        .sdot.f{background:white;color:#92400e;font-weight:700;}
        @keyframes ticker{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        .pain-section{background:white;border-top:1px solid var(--b100);border-bottom:1px solid var(--b100);padding:90px 40px;}
        .pain-grid{max-width:1100px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center;}
        .pain-item{display:flex;gap:16px;margin-bottom:28px;align-items:flex-start;}
        .pain-icon{width:44px;height:44px;border-radius:12px;flex-shrink:0;display:flex;align-items:center;justify-content:center;}
        .pain-title{font-size:17px;font-weight:700;color:var(--b800);margin-bottom:5px;}
        .pain-desc{font-size:15px;color:var(--b500);line-height:1.6;}
        .big-quote{font-family:'Playfair Display',serif;font-size:36px;font-weight:800;line-height:1.2;color:var(--b900);}
        .big-quote em{font-style:italic;color:var(--amber);}
        .how-section{padding:100px 40px;background:var(--b50);}
        .steps-grid{max-width:1000px;margin:0 auto;display:grid;grid-template-columns:repeat(3,1fr);gap:32px;}
        .step-card{padding:36px 28px;border-radius:20px;background:white;border:1px solid var(--b100);text-align:center;transition:all .35s cubic-bezier(.34,1.56,.64,1);}
        .step-card:hover{transform:translateY(-6px);box-shadow:0 20px 48px rgba(44,31,14,.09);border-color:var(--b300);}
        .step-num{width:52px;height:52px;border-radius:50%;background:linear-gradient(135deg,var(--amber),var(--amber3));color:white;font-family:'Playfair Display',serif;font-size:22px;font-weight:800;display:flex;align-items:center;justify-content:center;margin:0 auto 20px;}
        .step-title{font-size:19px;font-weight:700;color:var(--b800);margin-bottom:10px;}
        .step-desc{font-size:15px;color:var(--b500);line-height:1.65;}
        .feat-section{background:white;border-top:1px solid var(--b100);padding:100px 40px;}
        .feat-grid{max-width:1100px;margin:0 auto;display:grid;grid-template-columns:repeat(3,1fr);gap:24px;}
        .feat-card{padding:30px;border-radius:16px;border:1px solid var(--b100);background:var(--b50);transition:all .35s cubic-bezier(.34,1.56,.64,1);}
        .feat-card:hover{border-color:var(--b300);transform:translateY(-5px) scale(1.01);box-shadow:0 16px 40px rgba(44,31,14,.08);}
        .feat-icon{width:46px;height:46px;border-radius:12px;background:linear-gradient(135deg,#fef3c7,#fde68a);display:flex;align-items:center;justify-content:center;margin-bottom:18px;color:var(--amber);transition:transform .3s;}
        .feat-card:hover .feat-icon{transform:rotate(-7deg) scale(1.12);}
        .feat-title{font-size:17px;font-weight:700;color:var(--b800);margin-bottom:8px;}
        .feat-desc{font-size:14px;color:var(--b500);line-height:1.65;}
        .test-section{padding:100px 40px;background:var(--b900);}
        .test-grid{max-width:1100px;margin:0 auto;display:grid;grid-template-columns:repeat(3,1fr);gap:24px;}
        .test-card{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:18px;padding:32px;transition:all .3s;}
        .test-card:hover{background:rgba(255,255,255,.08);transform:translateY(-4px);}
        .test-quote{font-size:15px;color:rgba(250,247,242,.72);line-height:1.7;margin-bottom:24px;font-style:italic;}
        .test-author{display:flex;align-items:center;gap:12px;}
        .test-avatar{width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:white;flex-shrink:0;}
        .test-name{font-size:14px;font-weight:700;color:#faf7f2;}
        .test-role{font-size:12px;color:rgba(250,247,242,.4);}
        .stats-band{background:var(--amber);padding:56px 40px;}
        .stats-grid{max-width:900px;margin:0 auto;display:grid;grid-template-columns:repeat(4,1fr);gap:32px;text-align:center;}
        .stat-num{font-family:'Playfair Display',serif;font-size:46px;font-weight:800;color:white;line-height:1;margin-bottom:6px;}
        .stat-label{font-size:14px;color:rgba(255,255,255,.75);font-weight:600;}
        .pricing-section{padding:100px 40px;max-width:1200px;margin:0 auto;}
        .pricing-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;}
        .pricing-card{border-radius:18px;border:1.5px solid var(--b200);background:white;padding:28px 22px;position:relative;transition:all .3s cubic-bezier(.34,1.56,.64,1);}
        .pricing-card:hover{border-color:var(--b400);box-shadow:0 20px 50px rgba(44,31,14,.1);transform:translateY(-6px);}
        .pricing-card.featured{border-color:var(--amber);background:linear-gradient(160deg,#fffbeb,#fff);box-shadow:0 8px 32px rgba(217,119,6,.18);}
        .plan-badge{position:absolute;top:-12px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,var(--amber),var(--amber2));color:white;font-size:10px;font-weight:700;padding:4px 12px;border-radius:100px;letter-spacing:.06em;text-transform:uppercase;white-space:nowrap;}
        .plan-name{font-size:12px;font-weight:700;color:var(--b400);text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px;}
        .plan-price{font-family:'Playfair Display',serif;font-size:38px;font-weight:800;color:var(--b900);line-height:1;margin-bottom:3px;}
        .plan-per{font-size:12px;color:var(--b400);margin-bottom:20px;}
        .plan-divider{height:1px;background:var(--b100);margin-bottom:18px;}
        .plan-feature{display:flex;align-items:flex-start;gap:8px;font-size:13px;color:var(--b600);margin-bottom:9px;line-height:1.4;}
        .plan-cta{margin-top:22px;width:100%;padding:11px;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;border:none;transition:all .2s;}
        .plan-cta.outline{background:var(--b50);border:1.5px solid var(--b200);color:var(--b700);}
        .plan-cta.outline:hover{background:var(--b100);}
        .plan-cta.solid{background:linear-gradient(135deg,var(--amber),var(--amber2));color:white;box-shadow:0 4px 14px rgba(180,83,9,.3);}
        .plan-cta.solid:hover{box-shadow:0 6px 20px rgba(180,83,9,.45);transform:translateY(-1px);}
        .cta-banner{background:linear-gradient(135deg,#1a0f05,#4e321a);padding:90px 40px;text-align:center;position:relative;overflow:hidden;}
        .cta-glow{position:absolute;inset:0;background:radial-gradient(ellipse 60% 80% at 50% 50%,rgba(217,119,6,.2),transparent);pointer-events:none;}
        .footer{background:var(--b900);color:var(--b400);padding:44px 40px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:20px;}
        .footer-logo{font-family:'Playfair Display',serif;font-size:18px;font-weight:700;color:var(--b100);display:flex;align-items:center;gap:10px;}
        .footer-link{font-size:14px;color:var(--b500);text-decoration:none;transition:color .15s;}
        .footer-link:hover{color:var(--b100);}
        .reveal{opacity:0;transform:translateY(26px);transition:opacity .65s ease,transform .65s ease;}
        .reveal.show{opacity:1;transform:translateY(0);}
        .d1{transition-delay:.08s}.d2{transition-delay:.16s}.d3{transition-delay:.24s}.d4{transition-delay:.32s}.d5{transition-delay:.4s}.d6{transition-delay:.48s}
        @keyframes fadeUp{from{opacity:0;transform:translateY(32px)}to{opacity:1;transform:translateY(0)}}
        @keyframes scaleIn{from{opacity:0;transform:scale(.93) translateY(18px)}to{opacity:1;transform:scale(1) translateY(0)}}
        @keyframes floatY{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
        @keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
        @keyframes growBar{from{height:0%!important}}
        .a1{animation:fadeUp .8s cubic-bezier(.22,1,.36,1) .15s both}
        .a2{animation:fadeUp .8s cubic-bezier(.22,1,.36,1) .3s both}
        .a3{animation:fadeUp .8s cubic-bezier(.22,1,.36,1) .45s both}
        .a4{animation:fadeUp .8s cubic-bezier(.22,1,.36,1) .6s both}
        .a5{animation:fadeUp .8s cubic-bezier(.22,1,.36,1) .75s both}
        .mock-anim{animation:scaleIn 1s cubic-bezier(.22,1,.36,1) .45s both}
        .sec-label{text-align:center;font-size:11px;font-weight:700;color:var(--amber);letter-spacing:.14em;text-transform:uppercase;margin-bottom:14px;}
        .sec-title{font-family:'Playfair Display',serif;font-size:42px;font-weight:800;text-align:center;color:var(--b900);margin-bottom:56px;line-height:1.15;}
        .sec-title-light{font-family:'Playfair Display',serif;font-size:42px;font-weight:800;text-align:center;color:#faf7f2;margin-bottom:56px;line-height:1.15;}
        @media(max-width:900px){.nav-links{display:none;}.nav-inner{height:60px;border-radius:16px;}.logo-sub{display:none;}.btn-ghost{display:none;}.btn-nav{min-height:40px;padding:0 14px;font-size:13px;}.nav{top:10px;padding:0 14px;}}
        @media(max-width:768px){.hero-content{grid-template-columns:1fr;padding:100px 24px 60px;gap:36px;}.hero h1{font-size:40px;}.mock-anim{display:none;}.feat-grid,.steps-grid,.pricing-grid,.test-grid{grid-template-columns:1fr;}.stats-grid{grid-template-columns:1fr 1fr;}.pain-grid{grid-template-columns:1fr;}}
        @media(max-width:420px){.logo-name{font-size:19px;}.logo-icon{width:36px;height:36px;border-radius:12px;}.btn-nav{padding:0 12px;}.btn-nav svg{display:none;}}
      `}</style>

      {/* NAV */}
      <nav className="nav">
        <div className="nav-inner">
          <a href="/" className="logo">
            <div className="logo-icon"><Flame size={19} color="white" /></div>
            <span className="logo-copy">
              <span className="logo-name">Loyal</span>
              <span className="logo-sub">Restaurant hub</span>
            </span>
          </a>
          <div className="nav-links" aria-label="Landing page sections">
            <a href="#how" className="nav-link">How it works</a>
            <a href="#features" className="nav-link">Features</a>
            <a href="#pricing" className="nav-link">Pricing</a>
          </div>
          <div className="nav-actions">
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn-nav">Dashboard <ArrowRight size={15} /></Link>
            ) : (
              <>
                <Link to="/login" className="btn-ghost">Log in</Link>
                <Link to="/register" className="btn-nav">Get started free <ArrowRight size={15} /></Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero-wrap">
        <Waves lineColor="rgba(217,119,6,0.5)" />
        <div className="hero-glow" />
        <div className="hero-content">
          <div>
            <div className="hero-tag a1"><Star size={11} />Built for restaurant owners</div>
            <h1 className="a2">
              Your regulars are<br />
              your <span className="accent">goldmine.</span><br />
              Start mining.
            </h1>
            <p className="hero-sub a3">
              Paper punch cards get lost. Discounts eat your margin. Loyal gives your guests a reason to come back — and you the data to make sure they do.
            </p>
            <div className="hero-cta a4">
              {isAuthenticated ? (
                <Link to="/dashboard" className="btn-hero">Go to Dashboard <ArrowRight size={17} /></Link>
              ) : (
                <>
                  <Link to="/register" className="btn-hero">Start free — no credit card <ArrowRight size={17} /></Link>
                  <Link to="/login" className="btn-hero-ghost">See a demo</Link>
                </>
              )}
            </div>
            <div className="trust-row a5">
              <div className="trust-avatars">
                {[["SR","#d97706"],["MO","#92400e"],["AL","#b45309"],["JK","#78350f"]].map(([init,bg],i) => (
                  <div key={i} className="trust-avatar" style={{ background: bg, marginLeft: i > 0 ? -8 : 0, zIndex: 4 - i }}>{init}</div>
                ))}
              </div>
              <p style={{ fontSize: 14, color: "rgba(250,247,242,.5)" }}>
                <strong style={{ color: "#fbbf24" }}>500+ restaurant owners</strong> grew repeat visits with Loyal
              </p>
            </div>
          </div>
          <div className="mock-anim">
            <div className="hero-mockup">
              <div className="mock-bar">
                <div className="dot" style={{ background: "#ef4444" }} />
                <div className="dot" style={{ background: "#f59e0b" }} />
                <div className="dot" style={{ background: "#22c55e" }} />
                <span style={{ marginLeft: 10, fontSize: 11, color: "rgba(250,247,242,.35)", fontWeight: 500 }}>Ember & Oak — Loyal Dashboard</span>
              </div>
              <div className="mock-body">
                <div style={{ fontSize: 10, color: "rgba(250,247,242,.35)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 10 }}>This month</div>
                <div className="mock-stats">
                  {[["Regulars","1,284","↑ 12%"],["Stamps","4,891","↑ 8%"],["Redeem","342","↑ 5%"]].map(([l,v,c]) => (
                    <div key={l} className="mock-stat">
                      <div className="mock-sl">{l}</div>
                      <div className="mock-sv">{v}</div>
                      <div className="mock-sc">{c}</div>
                    </div>
                  ))}
                </div>
                <div className="mock-chart">
                  {[38,55,42,70,52,82,61,88,68,78,57,92].map((h,i) => (
                    <div key={i} className={`cbar${i>=9?" m":""}`} style={{ height: `${h}%`, animationDelay: `${.45+i*.05}s` }} />
                  ))}
                </div>
                <div className="stamp-card">
                  <div style={{ fontSize: 12, fontWeight: 700, opacity: .75, marginBottom: 6 }}>☕ House Blend Card — Wanjiru M.</div>
                  <div className="sdots">
                    {Array.from({ length: 10 }).map((_,i) => (
                      <div key={i} className={`sdot${i<7?" f":""}`}>{i<7?"✓":""}</div>
                    ))}
                  </div>
                  <div style={{ marginTop: 9, fontSize: 11, opacity: .6 }}>3 more coffees → free flat white 🎁</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div style={{ position: "relative", zIndex: 2 }}><Ticker /></div>
      </section>

      {/* PAIN → GAIN */}
      <section className="pain-section">
        <div className="pain-grid">
          <div>
            <div className="sec-label" style={{ textAlign: "left" }}>Sound familiar?</div>
            <div style={{ marginTop: 32 }}>
              {[
                { icon: <Clock size={20} />, bg: "#fef2f2", color: "#dc2626", title: "Paper cards that disappear", desc: "Customers lose them, staff forget to stamp, and you have zero data on who's actually coming back." },
                { icon: <TrendingUp size={20} />, bg: "#fffbeb", color: "#d97706", title: "Discounts that kill your margins", desc: "Flat deals bring in the wrong crowd and train customers to wait for coupons instead of paying full price." },
                { icon: <Bell size={20} />, bg: "#f0fdf4", color: "#16a34a", title: "No way to reach your guests", desc: "You have no idea who your best customers are, and no channel to bring them back on a slow Tuesday." },
              ].map((p) => (
                <div key={p.title} className="pain-item">
                  <div className="pain-icon" style={{ background: p.bg, color: p.color }}>{p.icon}</div>
                  <div>
                    <div className="pain-title">{p.title}</div>
                    <div className="pain-desc">{p.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="big-quote">
              "The average restaurant loses <em>68%</em> of its customers not from bad food — but from indifference."
            </div>
            <p style={{ marginTop: 24, fontSize: 16, color: "var(--b500)", lineHeight: 1.7 }}>
              Loyal turns that statistic on its head. Digital stamp cards guests actually use. Push notifications they actually read. Analytics that show you exactly who to win back — and how.
            </p>
            <div style={{ marginTop: 32, display: "flex", gap: 32, flexWrap: "wrap" }}>
              {[["44%","avg. return rate lift"],["8 min","to launch your first card"],["3.2×","ROI in the first month"]].map(([n,l]) => (
                <div key={l}>
                  <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 32, fontWeight: 800, color: "var(--amber)" }}>{n}</div>
                  <div style={{ fontSize: 13, color: "var(--b500)", fontWeight: 500, marginTop: 2 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="how-section" ref={howRef}>
        <div className="sec-label">How it works</div>
        <div className="sec-title">From sign-up to regulars in 3 steps</div>
        <div className="steps-grid">
          {[
            { n: "1", title: "Design your stamp card", desc: "Pick a template, add your branding and reward. Looks stunning on every phone. Takes about 8 minutes.", delay: "d1" },
            { n: "2", title: "Guests scan & collect", desc: "Customers scan a QR code at checkout. No app download needed. Stamps live right in their browser.", delay: "d2" },
            { n: "3", title: "Watch them come back", desc: "Send a message when someone's close to a reward. See who visits most. Keep your tables full.", delay: "d3" },
          ].map((s) => (
            <div key={s.n} className={`step-card reveal ${s.delay} ${howVisible ? "show" : ""}`}>
              <div className="step-num">{s.n}</div>
              <div className="step-title">{s.title}</div>
              <div className="step-desc">{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="feat-section" ref={featRef}>
        <div className="sec-label">Features</div>
        <div className="sec-title">Everything a busy owner needs</div>
        <div className="feat-grid">
          {[
            { icon: <Gift size={21} />, title: "Digital stamp cards", desc: "Beautiful, branded loyalty cards guests love to fill. No paper, no printing, no lost cards.", delay: "d1" },
            { icon: <Bell size={21} />, title: "Push notifications", desc: "Bring guests back with targeted nudges — \"You're 1 stamp away!\" or \"Free dessert this weekend\".", delay: "d2" },
            { icon: <BarChart3 size={21} />, title: "Visit analytics", desc: "See who visits most, when foot traffic peaks, and which rewards drive the most repeat visits.", delay: "d3" },
            { icon: <Users size={21} />, title: "Staff management", desc: "Add your team, assign stamp permissions, and track activity — without sharing your login.", delay: "d4" },
            { icon: <Shield size={21} />, title: "Fraud prevention", desc: "Smart stamp verification stops friends stamping friends. Every stamp is tied to a real visit.", delay: "d5" },
            { icon: <Zap size={21} />, title: "Instant setup", desc: "Go live today. No hardware, no developer, no long contracts. Cancel any time.", delay: "d6" },
          ].map((f) => (
            <div key={f.title} className={`feat-card reveal ${f.delay} ${featVisible ? "show" : ""}`}>
              <div className="feat-icon">{f.icon}</div>
              <div className="feat-title">{f.title}</div>
              <div className="feat-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="test-section" ref={testRef}>
        <div className="sec-label" style={{ color: "#fbbf24" }}>Real owners. Real results.</div>
        <div className="sec-title-light">Don't take our word for it</div>
        <div className="test-grid">
          {testimonials.map((t, i) => (
            <div key={t.name} className={`test-card reveal d${i+1} ${testVisible ? "show" : ""}`}>
              <div className="test-quote">"{t.quote}"</div>
              <div className="test-author">
                <div className="test-avatar" style={{ background: t.color }}>{t.initials}</div>
                <div>
                  <div className="test-name">{t.name}</div>
                  <div className="test-role">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* STATS */}
      <div className="stats-band">
        <div className="stats-grid">
          {[
            { to: 500, suffix: "+", label: "Restaurants using Loyal" },
            { to: 2400000, suffix: "+", label: "Stamps issued" },
            { to: 44, suffix: "%", label: "Avg. return rate lift" },
            { to: 98, suffix: "%", label: "Owner satisfaction" },
          ].map((s) => (
            <div key={s.label}>
              <div className="stat-num"><AnimatedCounter to={s.to} suffix={s.suffix} /></div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* PRICING */}
      <section id="pricing" className="pricing-section" ref={priceRef}>
        <div className="sec-label">Pricing</div>
        <div className="sec-title">Start free. Scale when it pays off.</div>
        <div className="pricing-grid">
          {plans.map((plan, i) => (
            <div key={plan.name} className={`pricing-card reveal d${i+1} ${priceVisible ? "show" : ""}${plan.featured ? " featured" : ""}`}>
              {plan.badge && <div className="plan-badge">{plan.badge}</div>}
              <div className="plan-name">{plan.name}</div>
              <div className="plan-price">{plan.price}</div>
              <div className="plan-per">/ month</div>
              <div className="plan-divider" />
              {plan.features.map((f) => (
                <div key={f} className="plan-feature">
                  <Check size={13} style={{ color: "#16a34a", flexShrink: 0, marginTop: 1 }} />
                  {f}
                </div>
              ))}
              {isAuthenticated ? (
                <Link
                  to="/billing"
                  className={`plan-cta ${plan.featured ? "solid" : "outline"} text-center block no-underline`}
                >
                  {plan.id === "free" ? "Go to Dashboard" : "Upgrade plan"}
                </Link>
              ) : (
                <Link
                  to="/register"
                  search={{ plan: plan.id }}
                  className={`plan-cta ${plan.featured ? "solid" : "outline"} text-center block no-underline`}
                >
                  {plan.cta}
                </Link>
              )}
            </div>
          ))}
        </div>
        <p style={{ textAlign: "center", marginTop: 28, fontSize: 14, color: "var(--b500)" }}>
          No contracts. No setup fees. Downgrade or cancel any time.
        </p>
      </section>

      {/* CTA BANNER */}
      <section className="cta-banner">
        <div className="cta-glow" />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 50, fontWeight: 800, color: "#faf7f2", lineHeight: 1.1, marginBottom: 20, maxWidth: 680, margin: "0 auto 20px" }}>
            Your next regular walks in tomorrow. Will they come back?
          </div>
          <p style={{ fontSize: 18, color: "rgba(250,247,242,.5)", marginBottom: 36, maxWidth: 480, margin: "0 auto 36px" }}>
            Set up your first stamp card today — free, forever. No developer needed.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn-hero">Go to Dashboard <ArrowRight size={17} /></Link>
            ) : (
              <>
                <Link to="/register" className="btn-hero">Start free today <ArrowRight size={17} /></Link>
                <Link to="/login" className="btn-hero-ghost">Log in</Link>
              </>
            )}
          </div>
          <p style={{ marginTop: 20, fontSize: 13, color: "rgba(250,247,242,.3)" }}>Free plan, always. No credit card required.</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-logo">
          <div className="logo-icon" style={{ width: 32, height: 32 }}><Flame size={15} color="white" /></div>
         Loyal
        </div>
        <div style={{ display: "flex", gap: 24 }}>
          <a href="#" className="footer-link">Privacy</a>
          <a href="#" className="footer-link">Terms</a>
          <a href="#" className="footer-link">Contact</a>
        </div>
        <span style={{ fontSize: 13, color: "var(--b600)" }}>© 2026 Ember & Oak. All rights reserved.</span>
      </footer>
    </div>
  );
}
