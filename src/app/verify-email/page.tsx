'use client';

import { useRouter } from 'next/navigation';

const MAIL_PROVIDERS = [
  {
    name: 'Gmail',
    icon: '📧',
    url: 'https://mail.google.com',
    color: '#EA4335',
  },
  {
    name: 'Outlook',
    icon: '📨',
    url: 'https://outlook.live.com',
    color: '#0078D4',
  },
  {
    name: 'Yahoo',
    icon: '📩',
    url: 'https://mail.yahoo.com',
    color: '#6001D2',
  },
];

export default function VerifyEmailPage() {
  const router = useRouter();

  return (
    <div className="ve-root" dir="rtl">
      <div className="ve-card">
        <div className="ve-icon">📬</div>
        <h1 className="ve-title">تحقق من بريدك الإلكتروني</h1>
        <p className="ve-desc">
          أرسلنا لك رابط تأكيد على بريدك الإلكتروني.
          <br />
          افتح الرابط لتفعيل حسابك والدخول لمساري.
        </p>

        <div className="ve-steps">
          <div className="ve-step">
            <span className="ve-step-num">1</span>
            <span>افتح بريدك الإلكتروني</span>
          </div>
          <div className="ve-step">
            <span className="ve-step-num">2</span>
            <span>ابحث عن رسالة من مساري</span>
          </div>
          <div className="ve-step">
            <span className="ve-step-num">3</span>
            <span>اضغط على رابط التأكيد</span>
          </div>
        </div>

        {/* أزرار فتح البريد */}
        <div className="ve-providers-label">افتح بريدك مباشرة 👇</div>
        <div className="ve-providers">
          {MAIL_PROVIDERS.map((p) => (
            <a
              key={p.name}
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              className="ve-provider-btn"
              style={{ '--provider-color': p.color } as React.CSSProperties}
            >
              <span className="ve-provider-icon">{p.icon}</span>
              <span>{p.name}</span>
            </a>
          ))}
        </div>

        <div className="ve-actions">
          <button
            onClick={() => router.push('/login')}
            className="ve-btn-secondary"
          >
            رجوع لتسجيل الدخول
          </button>
        </div>

        <p className="ve-note">
          ما وصلتك الرسالة؟ تحقق من مجلد الـ Spam
        </p>
      </div>

      <style jsx>{`
        .ve-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: hsl(var(--background));
          font-family: var(--font-main);
          padding: 1rem;
        }
        .ve-card {
          background: hsl(var(--card));
          border-radius: 24px;
          padding: 3rem 2.5rem;
          max-width: 440px;
          width: 100%;
          box-shadow: 0 20px 60px rgba(0,0,0,0.1);
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.25rem;
        }
        .ve-icon {
          font-size: 3.5rem;
          line-height: 1;
          background: hsl(var(--primary) / 0.1);
          width: 80px; height: 80px;
          border-radius: 20px;
          display: flex; align-items: center; justify-content: center;
        }
        .ve-title {
          font-size: 1.5rem;
          font-weight: 800;
          color: hsl(var(--foreground));
          margin: 0;
        }
        .ve-desc {
          font-size: 0.9rem;
          color: hsl(var(--muted-foreground));
          line-height: 1.7;
          margin: 0;
        }
        .ve-steps {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          background: hsl(var(--muted));
          border-radius: 14px;
          padding: 1.25rem;
        }
        .ve-step {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.875rem;
          color: hsl(var(--foreground));
        }
        .ve-step-num {
          width: 26px; height: 26px;
          background: hsl(var(--primary));
          color: white;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.8rem;
          font-weight: 700;
          flex-shrink: 0;
        }
        .ve-providers-label {
          font-size: 0.85rem;
          font-weight: 600;
          color: hsl(var(--muted-foreground));
        }
        .ve-providers {
          width: 100%;
          display: flex;
          gap: 0.75rem;
          justify-content: center;
        }
        .ve-provider-btn {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.4rem;
          padding: 0.75rem 0.5rem;
          border: 1.5px solid hsl(var(--border));
          border-radius: 14px;
          font-size: 0.8rem;
          font-family: var(--font-main);
          font-weight: 600;
          color: hsl(var(--foreground));
          text-decoration: none;
          background: hsl(var(--background));
          transition: all 0.2s;
          cursor: pointer;
        }
        .ve-provider-btn:hover {
          border-color: var(--provider-color);
          color: var(--provider-color);
          background: color-mix(in srgb, var(--provider-color) 6%, transparent);
          transform: translateY(-2px);
        }
        .ve-provider-icon {
          font-size: 1.4rem;
        }
        .ve-actions {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .ve-btn-secondary {
          width: 100%;
          padding: 0.75rem;
          background: transparent;
          color: hsl(var(--primary));
          border: 1.5px solid hsl(var(--primary));
          border-radius: 10px;
          font-size: 0.9rem;
          font-family: var(--font-main);
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .ve-btn-secondary:hover {
          background: hsl(var(--primary) / 0.08);
        }
        .ve-note {
          font-size: 0.8rem;
          color: hsl(var(--muted-foreground));
          margin: 0;
        }
      `}</style>
    </div>
  );
}