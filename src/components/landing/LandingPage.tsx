"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/lib/context/ThemeContext";

const FEATURES = [
  {
    icon: "🎯",
    title: "تتبع مسارك الدراسي",
    desc: "شوف كل موادك، ساعاتك، ومعدلك في مكان واحد بشكل واضح ومرتب.",
  },
  {
    icon: "📅",
    title: "خطط فصلك بذكاء",
    desc: "رتّب فصلك الدراسي القادم وتوقع حملك الأكاديمي قبل ما يبدأ.",
  },
  {
    icon: "📝",
    title: "نظّم مهامك ومواعيدك",
    desc: "ما تفوّتك تسليم أو اختبار — تابع كل شيء في مكان واحد.",
  },
  {
    icon: "👥",
    title: "تواصل مع زملائك",
    desc: "ابحث عن زملاء في نفس التخصص وتعاون معهم داخل المنصة.",
  },
];

const TESTIMONIALS = [
  {
    name: "سارة المحمد",
    major: "هندسة حاسوب",
    text: "مساري غيّر طريقة تنظيمي للجامعة كلياً. ما عدت أنسى تسليم أو أضيع في متطلباتي.",
    stars: 5,
  },
  {
    name: "عمر الخالد",
    major: "إدارة أعمال",
    text: "أخيراً موقع عربي يفهم احتياجات الطالب الجامعي. التصميم رائع والاستخدام سهل جداً.",
    stars: 5,
  },
  {
    name: "نور العلي",
    major: "علم نفس",
    text: "خطط الفصل ساعدتني أوزّع موادي صح وأحافظ على معدلي. أنصح فيه كل طالب.",
    stars: 5,
  },
];

export default function LandingPage() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="land-root" dir="rtl">
      {/* ═══ Navbar ═══ */}
      <nav className="land-nav">
        <div className="land-nav-inner">
          <div className="land-nav-logo">
            <div className="land-logo-icon">م</div>
            <span className="land-logo-text">مساري</span>
          </div>

          <div className="land-nav-links">
            <a href="#features">المميزات</a>
            <a href="#how">كيف يعمل</a>
            <a href="#testimonials">آراء الطلاب</a>
          </div>

          <div className="land-nav-actions">

          <button
            onClick={toggleTheme}
            title={isDark ? "الوضع النهاري" : "الوضع الليلي"}
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-amber-400" />
            ) : (
              <Moon className="w-5 h-5 text-muted-foreground" />
            )}
          </button>

            <button
              onClick={() => router.push("/login")}
              className="land-btn-ghost"
            >
              تسجيل الدخول
            </button>
            <button
              onClick={() => router.push("/login?tab=signup")}
              className="land-btn-primary"
            >
              ابدأ مجاناً
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            className="land-menu-btn"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="land-mobile-menu">
            <a href="#features" onClick={() => setMenuOpen(false)}>
              المميزات
            </a>
            <a href="#how" onClick={() => setMenuOpen(false)}>
              كيف يعمل
            </a>
            <a href="#testimonials" onClick={() => setMenuOpen(false)}>
              آراء الطلاب
            </a>
            <button
              onClick={() => router.push("/login")}
              className="land-btn-ghost w-full"
            >
              تسجيل الدخول
            </button>
            <button
              onClick={() => router.push("/login")}
              className="land-btn-primary w-full"
            >
              ابدأ مجاناً
            </button>
          </div>
        )}
      </nav>

      {/* ═══ Hero ═══ */}
      <section className="land-hero">
        <div className="land-hero-blob land-blob1" />
        <div className="land-hero-blob land-blob2" />
        <div className="land-hero-inner">
          <span className="land-badge">🎓 للطلاب الجامعيين العرب</span>
          <h1 className="land-hero-title">
            رفيقك الأكاديمي
            <br />
            <span className="land-hero-highlight">طوال رحلتك الجامعية</span>
          </h1>
          <p className="land-hero-desc">
            منصة عربية متكاملة تساعدك تتتبع مسارك الدراسي، تنظّم مهامك، وتخطط
            فصلك — كل شيء في مكان واحد.
          </p>
          <div className="land-hero-actions">
            <button
              onClick={() => router.push("/login?tab=signup")}
              className="land-btn-primary land-btn-lg"
            >
              ابدأ مجاناً ←
            </button>
            <button
              onClick={() => router.push("/login")}
              className="land-btn-ghost land-btn-lg"
            >
              تسجيل الدخول
            </button>
          </div>
          <div className="land-hero-stats">
            {[
              { num: "1000+", label: "طالب مسجّل" },
              { num: "50+", label: "جامعة" },
              { num: "409", label: "تقييم المستخدمين" },
            ].map((s) => (
              <div key={s.label} className="land-stat">
                <span className="land-stat-num">{s.num}</span>
                <span className="land-stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Features ═══ */}
      <section className="land-section" id="features">
        <div className="land-section-inner">
          <div className="land-section-header">
            <span className="land-badge">✨ المميزات</span>
            <h2 className="land-section-title">كل ما تحتاجه في مكان واحد</h2>
            <p className="land-section-desc">
              صمّمنا مساري ليكون رفيقك من أول يوم في الجامعة لآخر يوم.
            </p>
          </div>
          <div className="land-features-grid">
            {FEATURES.map((f) => (
              <div key={f.title} className="land-feature-card">
                <div className="land-feature-icon">{f.icon}</div>
                <h3 className="land-feature-title">{f.title}</h3>
                <p className="land-feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ How it works ═══ */}
      <section className="land-section land-section-alt" id="how">
        <div className="land-section-inner">
          <div className="land-section-header">
            <span className="land-badge">🚀 كيف يعمل</span>
            <h2 className="land-section-title">ابدأ في 3 خطوات بسيطة</h2>
          </div>
          <div className="land-steps">
            {[
              {
                num: "1",
                title: "أنشئ حسابك",
                desc: "سجّل بإيميلك الجامعي في أقل من دقيقة.",
              },
              {
                num: "2",
                title: "أضف موادك",
                desc: "أدخل موادك وساعاتها ومتطلباتك الدراسية.",
              },
              {
                num: "3",
                title: "ابدأ التنظيم",
                desc: "تابع مسارك، نظّم مهامك، وخطط فصلك.",
              },
            ].map((step, i) => (
              <div key={step.num} className="land-step">
                <div className="land-step-num">{step.num}</div>
                {i < 2 && <div className="land-step-line" />}
                <h3 className="land-step-title">{step.title}</h3>
                <p className="land-step-desc">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Testimonials ═══ */}
      <section className="land-section" id="testimonials">
        <div className="land-section-inner">
          <div className="land-section-header">
            <span className="land-badge">💬 آراء الطلاب</span>
            <h2 className="land-section-title">ماذا يقول طلابنا؟</h2>
          </div>
          <div className="land-testimonials-grid">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="land-testimonial">
                <div className="land-stars">{"⭐".repeat(t.stars)}</div>
                <p className="land-testimonial-text">{t.text}</p>
                <div className="land-testimonial-author">
                  <div className="land-testimonial-avatar">{t.name[0]}</div>
                  <div>
                    <p className="land-testimonial-name">{t.name}</p>
                    <p className="land-testimonial-major">{t.major}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="land-cta">
        <div className="land-cta-inner">
          <h2 className="land-cta-title">جاهز تبدأ رحلتك الأكاديمية؟</h2>
          <p className="land-cta-desc">
            انضم لآلاف الطلاب الذين ينظمون حياتهم الجامعية مع مساري.
          </p>
          <button
            onClick={() => router.push("/login?tab=signup")}
            className="land-btn-white land-btn-lg"
          >
            ابدأ مجاناً الآن ←
          </button>
        </div>
      </section>

      {/* ═══ Footer ═══ */}
      <footer className="land-footer">
        <div className="land-footer-inner">
          <div className="land-footer-logo">
            <div className="land-logo-icon land-logo-icon-sm">م</div>
            <span>مساري — رفيقك الأكاديمي</span>
          </div>
          <p className="land-footer-copy">© 2025 مساري. جميع الحقوق محفوظة.</p>
        </div>
      </footer>

      <style jsx>{`
        .land-root {
          min-height: 100vh;
          background: hsl(var(--background));
          font-family: var(--font-main);
          overflow-x: hidden;
        }

        /* ── Navbar ── */
        .land-nav {
          position: sticky;
          top: 0;
          z-index: 50;
          background: hsl(var(--card) / 0.85);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid hsl(var(--border));
        }
        .land-nav-inner {
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 1.5rem;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1.5rem;
        }
        .land-nav-logo {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          flex-shrink: 0;
        }
        .land-logo-icon {
          width: 36px;
          height: 36px;
          background: hsl(var(--primary));
          color: white;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.1rem;
          font-weight: 800;
        }
        .land-logo-icon-sm {
          width: 28px;
          height: 28px;
          font-size: 0.9rem;
          border-radius: 8px;
        }
        .land-logo-text {
          font-size: 1.2rem;
          font-weight: 800;
          color: hsl(var(--foreground));
        }
        .land-nav-links {
          display: flex;
          gap: 2rem;
          align-items: center;
        }
        .land-nav-links a {
          font-size: 0.9rem;
          font-weight: 500;
          color: hsl(var(--muted-foreground));
          text-decoration: none;
          transition: color 0.2s;
        }
        .land-nav-links a:hover {
          color: hsl(var(--foreground));
        }
        .land-nav-actions {
          display: flex;
          gap: 0.75rem;
          align-items: center;
        }
        .land-menu-btn {
          display: none;
          background: none;
          border: none;
          font-size: 1.25rem;
          cursor: pointer;
          color: hsl(var(--foreground));
          padding: 0.5rem;
        }
        .land-mobile-menu {
          padding: 1rem 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          border-top: 1px solid hsl(var(--border));
        }
        .land-mobile-menu a {
          font-size: 0.95rem;
          color: hsl(var(--foreground));
          text-decoration: none;
          padding: 0.5rem 0;
        }

        /* ── Buttons ── */
        .land-btn-primary {
          background: hsl(var(--primary));
          color: white;
          border: none;
          border-radius: 10px;
          padding: 0.6rem 1.25rem;
          font-size: 0.9rem;
          font-family: var(--font-main);
          font-weight: 700;
          cursor: pointer;
          transition:
            opacity 0.2s,
            transform 0.15s;
          white-space: nowrap;
        }
        .land-btn-primary:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }
        .land-btn-ghost {
          background: transparent;
          color: hsl(var(--foreground));
          border: 1.5px solid hsl(var(--border));
          border-radius: 10px;
          padding: 0.6rem 1.25rem;
          font-size: 0.9rem;
          font-family: var(--font-main);
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .land-btn-ghost:hover {
          background: hsl(var(--muted));
        }
        .land-btn-white {
          background: white;
          color: hsl(var(--primary));
          border: none;
          border-radius: 12px;
          font-family: var(--font-main);
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }
        .land-btn-white:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        }
        .land-btn-lg {
          padding: 0.875rem 2rem;
          font-size: 1rem;
          border-radius: 12px;
        }

        /* ── Hero ── */
        .land-hero {
          position: relative;
          overflow: hidden;
          padding: 5rem 1.5rem 4rem;
          text-align: center;
        }
        .land-hero-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          opacity: 0.12;
          pointer-events: none;
        }
        .land-blob1 {
          width: 600px;
          height: 600px;
          background: hsl(var(--primary));
          top: -200px;
          right: -100px;
        }
        .land-blob2 {
          width: 400px;
          height: 400px;
          background: hsl(var(--info));
          bottom: -100px;
          left: -100px;
        }
        .land-hero-inner {
          position: relative;
          z-index: 1;
          max-width: 700px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
        }
        .land-badge {
          display: inline-flex;
          align-items: center;
          background: hsl(var(--primary) / 0.1);
          color: hsl(var(--primary));
          padding: 0.4rem 1rem;
          border-radius: 100px;
          font-size: 0.85rem;
          font-weight: 600;
        }
        .land-hero-title {
          font-size: clamp(2rem, 5vw, 3.25rem);
          font-weight: 900;
          line-height: 1.25;
          color: hsl(var(--foreground));
          margin: 0;
        }
        .land-hero-highlight {
          color: hsl(var(--primary));
        }
        .land-hero-desc {
          font-size: 1.05rem;
          color: hsl(var(--muted-foreground));
          line-height: 1.8;
          max-width: 560px;
          margin: 0;
        }
        .land-hero-actions {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          justify-content: center;
        }
        .land-hero-stats {
          display: flex;
          gap: 2.5rem;
          flex-wrap: wrap;
          justify-content: center;
          margin-top: 1rem;
          padding-top: 2rem;
          border-top: 1px solid hsl(var(--border));
          width: 100%;
        }
        .land-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.2rem;
        }
        .land-stat-num {
          font-size: 1.75rem;
          font-weight: 900;
          color: hsl(var(--primary));
        }
        .land-stat-label {
          font-size: 0.825rem;
          color: hsl(var(--muted-foreground));
        }

        /* ── Sections ── */
        .land-section {
          padding: 5rem 1.5rem;
        }
        .land-section-alt {
          background: hsl(var(--muted) / 0.5);
        }
        .land-section-inner {
          max-width: 1100px;
          margin: 0 auto;
        }
        .land-section-header {
          text-align: center;
          margin-bottom: 3rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
        }
        .land-section-title {
          font-size: clamp(1.5rem, 3vw, 2.25rem);
          font-weight: 800;
          color: hsl(var(--foreground));
          margin: 0;
        }
        .land-section-desc {
          font-size: 1rem;
          color: hsl(var(--muted-foreground));
          max-width: 500px;
          margin: 0;
          line-height: 1.7;
        }

        /* ── Features ── */
        .land-features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.5rem;
        }
        .land-feature-card {
          background: hsl(var(--card));
          border: 1.5px solid hsl(var(--border));
          border-radius: 20px;
          padding: 2rem 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          transition:
            transform 0.2s,
            box-shadow 0.2s;
        }
        .land-feature-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.08);
        }
        .land-feature-icon {
          font-size: 2rem;
        }
        .land-feature-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: hsl(var(--foreground));
          margin: 0;
        }
        .land-feature-desc {
          font-size: 0.875rem;
          color: hsl(var(--muted-foreground));
          line-height: 1.7;
          margin: 0;
        }

        /* ── Steps ── */
        .land-steps {
          display: flex;
          gap: 0;
          justify-content: center;
          flex-wrap: wrap;
          gap: 1.5rem;
        }
        .land-step {
          flex: 1;
          min-width: 200px;
          max-width: 280px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          position: relative;
        }
        .land-step-num {
          width: 56px;
          height: 56px;
          background: hsl(var(--primary));
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          font-weight: 800;
        }
        .land-step-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: hsl(var(--foreground));
          margin: 0;
        }
        .land-step-desc {
          font-size: 0.875rem;
          color: hsl(var(--muted-foreground));
          line-height: 1.7;
          margin: 0;
        }

        /* ── Testimonials ── */
        .land-testimonials-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
        }
        .land-testimonial {
          background: hsl(var(--card));
          border: 1.5px solid hsl(var(--border));
          border-radius: 20px;
          padding: 1.75rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .land-stars {
          font-size: 1rem;
        }
        .land-testimonial-text {
          font-size: 0.9rem;
          color: hsl(var(--foreground));
          line-height: 1.8;
          margin: 0;
          flex: 1;
        }
        .land-testimonial-author {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .land-testimonial-avatar {
          width: 40px;
          height: 40px;
          background: hsl(var(--primary));
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1rem;
          flex-shrink: 0;
        }
        .land-testimonial-name {
          font-size: 0.875rem;
          font-weight: 700;
          color: hsl(var(--foreground));
          margin: 0;
        }
        .land-testimonial-major {
          font-size: 0.8rem;
          color: hsl(var(--muted-foreground));
          margin: 0;
        }

        /* ── CTA ── */
        .land-cta {
          background: hsl(var(--primary));
          padding: 5rem 1.5rem;
          text-align: center;
        }
        .land-cta-inner {
          max-width: 600px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.25rem;
        }
        .land-cta-title {
          font-size: clamp(1.5rem, 3vw, 2.25rem);
          font-weight: 800;
          color: white;
          margin: 0;
        }
        .land-cta-desc {
          font-size: 1rem;
          color: rgba(255, 255, 255, 0.85);
          margin: 0;
          line-height: 1.7;
        }

        /* ── Footer ── */
        .land-footer {
          background: hsl(var(--card));
          border-top: 1px solid hsl(var(--border));
          padding: 2rem 1.5rem;
        }
        .land-footer-inner {
          max-width: 1100px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .land-footer-logo {
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }
        .land-footer-logo span {
          font-size: 0.9rem;
          font-weight: 600;
          color: hsl(var(--muted-foreground));
        }
        .land-footer-copy {
          font-size: 0.825rem;
          color: hsl(var(--muted-foreground));
          margin: 0;
        }

        /* ── Responsive ── */
        @media (max-width: 768px) {
          .land-nav-links {
            display: none;
          }
          .land-nav-actions {
            display: none;
          }
          .land-menu-btn {
            display: block;
          }
          .land-hero {
            padding: 3rem 1.5rem;
          }
          .land-footer-inner {
            flex-direction: column;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
}
