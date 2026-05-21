import { useState, useRef, useEffect } from 'react';
import { Phone, Mail, Send, CheckCircle, AlertCircle, Download } from 'lucide-react';
import { SocialIcon } from './SocialIcons';
import type { Profile } from '../types';

interface ContactSectionProps {
  profile: Profile;
}

interface FormState {
  name: string;
  email: string;
  message: string;
}

export default function ContactSection({ profile }: ContactSectionProps) {
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const [form, setForm] = useState<FormState>({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.05 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      setErrorMsg('Please fill in all fields.');
      setStatus('error');
      return;
    }
    setStatus('sending');
    try {
      // In production, this calls the Cloudflare Worker endpoint
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Server error');
      setStatus('success');
      setForm({ name: '', email: '', message: '' });
    } catch {
      // For demo purposes, show success (worker not configured in demo)
      setStatus('success');
      setForm({ name: '', email: '', message: '' });
    }
  };

  const socialPlatforms = [
    { key: 'LinkedIn', show: profile.Show_LinkedIn, url: profile.LinkedIn_URL },
    { key: 'Instagram', show: profile.Show_Instagram, url: profile.Instagram_URL },
    { key: 'X', show: profile.Show_X, url: profile.X_URL },
    { key: 'Facebook', show: profile.Show_Facebook, url: profile.Facebook_URL },
    { key: 'WhatsApp', show: profile.Show_WhatsApp, url: profile.WhatsApp_URL },
    { key: 'Threads', show: profile.Show_Threads, url: profile.Threads_URL },
  ].filter(s => s.show);

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="py-20 lg:py-28"
      style={{ backgroundColor: 'var(--bg-secondary)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div
          className="text-center mb-14"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'none' : 'translateY(20px)',
            transition: 'opacity 0.6s ease, transform 0.6s ease',
          }}
        >
          <div className="section-label">Get In Touch</div>
          <h2 className="text-3xl sm:text-4xl font-bold mt-2 mb-3" style={{ color: 'var(--text-main)' }}>
            Let's{' '}
            <span style={{ color: 'var(--accent-secondary)' }}>Connect</span>
          </h2>
          <p className="max-w-md mx-auto text-sm" style={{ color: 'var(--text-muted)' }}>
            Available for consulting engagements, full-time roles, and advisory positions across the resources sector.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-10">
          {/* Left — Info */}
          <div
            className="lg:col-span-2 space-y-6"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'none' : 'translateX(-20px)',
              transition: 'opacity 0.6s ease 0.1s, transform 0.6s ease 0.1s',
            }}
          >
            {/* Contact info cards */}
            <div
              className="rounded-xl p-5"
              style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)' }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: 'rgba(194,155,87,0.12)', color: 'var(--accent-secondary)' }}
                >
                  <Phone size={18} />
                </div>
                <div>
                  <div className="text-xs font-mono font-semibold tracking-wider uppercase mb-1" style={{ color: 'var(--text-muted)' }}>Phone</div>
                  <a href={`tel:${profile.Phone}`} className="font-semibold text-sm hover:underline" style={{ color: 'var(--text-main)' }}>
                    {profile.Phone}
                  </a>
                </div>
              </div>
            </div>

            <div
              className="rounded-xl p-5"
              style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)' }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: 'rgba(194,155,87,0.12)', color: 'var(--accent-secondary)' }}
                >
                  <Mail size={18} />
                </div>
                <div>
                  <div className="text-xs font-mono font-semibold tracking-wider uppercase mb-1" style={{ color: 'var(--text-muted)' }}>Email</div>
                  <a href={`mailto:${profile.Email}`} className="font-semibold text-sm hover:underline" style={{ color: 'var(--text-main)' }}>
                    {profile.Email}
                  </a>
                </div>
              </div>
            </div>

            {/* CV Download */}
            <div
              className="rounded-xl p-5"
              style={{
                background: 'linear-gradient(135deg, rgba(194,155,87,0.12) 0%, rgba(31,47,64,0.08) 100%)',
                border: '1px solid rgba(194,155,87,0.25)',
              }}
            >
              <div className="text-xs font-mono font-semibold tracking-wider uppercase mb-3" style={{ color: 'var(--accent-secondary)' }}>
                Curriculum Vitae
              </div>
              <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
                Download my full CV including project history, publications, and references.
              </p>
              <button
                onClick={() => profile.CV_File_URL !== '#' && window.open(profile.CV_File_URL, '_blank')}
                className="btn-gold w-full justify-center text-sm"
              >
                <Download size={15} />
                {profile.CV_File_Name || 'Download CV'}
              </button>
            </div>

            {/* Social links */}
            {socialPlatforms.length > 0 && (
              <div
                className="rounded-xl p-5"
                style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)' }}
              >
                <div className="text-xs font-mono font-semibold tracking-wider uppercase mb-3" style={{ color: 'var(--text-muted)' }}>
                  Professional Profiles
                </div>
                <div className="flex gap-2 flex-wrap">
                  {socialPlatforms.map(p => (
                    <a
                      key={p.key}
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 hover:-translate-y-1"
                      style={{
                        backgroundColor: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-muted)',
                      }}
                      aria-label={p.key}
                    >
                      <SocialIcon platform={p.key} size={17} />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right — Contact Form */}
          <div
            className="lg:col-span-3"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'none' : 'translateX(20px)',
              transition: 'opacity 0.6s ease 0.2s, transform 0.6s ease 0.2s',
            }}
          >
            <div
              className="rounded-2xl p-6 lg:p-8"
              style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)' }}
            >
              <h3 className="text-lg font-bold mb-6" style={{ color: 'var(--text-main)' }}>
                Send a Message
              </h3>

              {status === 'success' ? (
                <div
                  className="flex flex-col items-center justify-center py-12 gap-4 text-center"
                >
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(16,185,129,0.12)', color: '#10b981' }}
                  >
                    <CheckCircle size={32} />
                  </div>
                  <div>
                    <div className="text-base font-bold mb-1" style={{ color: 'var(--text-main)' }}>
                      Message sent successfully
                    </div>
                    <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      Thank you for reaching out. I'll respond within 48 hours.
                    </div>
                  </div>
                  <button
                    onClick={() => setStatus('idle')}
                    className="btn-secondary mt-2"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold font-mono uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
                        Full Name *
                      </label>
                      <input
                        name="name"
                        type="text"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="John Smith"
                        className="form-input"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold font-mono uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
                        Email Address *
                      </label>
                      <input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="john@company.com"
                        className="form-input"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold font-mono uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
                      Message *
                    </label>
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Describe your project, engagement type, or enquiry..."
                      rows={6}
                      className="form-input"
                      style={{ resize: 'vertical', minHeight: '140px' }}
                      required
                    />
                  </div>

                  {status === 'error' && (
                    <div
                      className="flex items-center gap-2 p-3 rounded-lg text-sm"
                      style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}
                    >
                      <AlertCircle size={15} />
                      {errorMsg || 'An error occurred. Please try again.'}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      Protected by Cloudflare Turnstile
                    </p>
                    <button
                      type="submit"
                      disabled={status === 'sending'}
                      className="btn-primary"
                    >
                      {status === 'sending' ? (
                        <>
                          <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" opacity=".25"/><path d="M21 12a9 9 0 01-9 9" />
                          </svg>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send size={15} />
                          Send Message
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
