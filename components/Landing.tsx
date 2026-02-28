"use client";
import { useState } from "react";

interface Props { onSetup: (name: string, email: string) => Promise<void>; }

export default function Landing({ onSetup }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showSetup, setShowSetup] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    await onSetup(name.trim(), email.trim());
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Hero */}
      <header className="max-w-5xl mx-auto px-6 pt-16 pb-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">T</div>
          <span className="text-xl font-bold text-indigo-900">TutorPulse</span>
        </div>
        <h1 className="text-5xl font-extrabold text-slate-900 leading-tight mb-6">
          Show parents <span className="text-indigo-600">exactly</span> where<br />their kid improved.
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mb-8">
          Track student skills over time. Generate progress reports automatically. 
          Stop sending vague &ldquo;doing great!&rdquo; updates — show the data.
        </p>
        <div className="flex gap-4 mb-16">
          <button onClick={() => setShowSetup(true)} className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition text-lg">
            Start Free →
          </button>
          <a href="#features" className="border border-slate-300 text-slate-700 px-8 py-3 rounded-lg font-semibold hover:border-slate-400 transition text-lg">
            See Features
          </a>
        </div>
      </header>

      {/* Setup Modal */}
      {showSetup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <form onSubmit={handleSubmit} className="bg-white rounded-xl p-8 w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold mb-4">Set up your account</h2>
            <label className="block mb-2 text-sm font-medium">Your Name</label>
            <input value={name} onChange={e => setName(e.target.value)} className="w-full border rounded-lg px-3 py-2 mb-4" placeholder="e.g. Sarah Mitchell" required />
            <label className="block mb-2 text-sm font-medium">Email (optional)</label>
            <input value={email} onChange={e => setEmail(e.target.value)} className="w-full border rounded-lg px-3 py-2 mb-6" placeholder="sarah@example.com" type="email" />
            <div className="flex gap-3">
              <button type="submit" disabled={submitting} className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50">
                {submitting ? "Setting up..." : "Get Started"}
              </button>
              <button type="button" onClick={() => setShowSetup(false)} className="px-4 py-2 border rounded-lg text-slate-600">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Intelligence Features */}
      <section id="features" className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Five Intelligence Layers</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {[
            { icon: "📈", title: "Skill Trajectory Tracking", desc: "Plot each student's skill scores over time. See which skills are improving, plateauing, or declining. Spot problems before parents ask." },
            { icon: "🎯", title: "Goal Achievement Radar", desc: "Set goals per student, track progress against deadlines. Visual dashboard shows on-track (green), at-risk (yellow), and behind (red) goals." },
            { icon: "🧠", title: "Engagement × Comprehension Matrix", desc: "Plot sessions on a 2D grid: high engagement + low comprehension = 'trying hard, needs different approach.' Low engagement + high comprehension = 'bored, needs challenge.' Actionable insights per student." },
            { icon: "📊", title: "Parent Progress Reports", desc: "Auto-generate shareable reports: skill improvements, session attendance, goals achieved, areas needing work. Stop writing vague updates — share data." },
            { icon: "💰", title: "Revenue & Retention Intelligence", desc: "Track earnings per student, cancellation rates, session frequency trends. Know which students are at risk of dropping before they ghost you." },
          ].map(f => (
            <div key={f.title} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="text-lg font-bold mb-2">{f.title}</h3>
              <p className="text-slate-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-4">Simple Pricing</h2>
        <p className="text-center text-slate-600 mb-12">No per-student fees. No surprise charges.</p>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { plan: "Free", price: "$0", period: "/forever", features: ["Up to 3 students", "Session logging", "Basic skill tracking", "Goal setting"], cta: "Start Free" },
            { plan: "Pro", price: "$12", period: "/month", features: ["Unlimited students", "Skill trajectory charts", "Engagement matrix", "Parent progress reports", "Revenue tracking", "CSV export"], cta: "Start Free Trial", highlight: true },
            { plan: "Business", price: "$29", period: "/month", features: ["Everything in Pro", "Multi-tutor teams", "Custom branding", "API access", "Priority support", "White-label reports"], cta: "Contact Sales" },
          ].map(p => (
            <div key={p.plan} className={`rounded-xl p-6 ${p.highlight ? "bg-indigo-600 text-white shadow-xl scale-105" : "bg-white shadow-sm border border-slate-200"}`}>
              <h3 className="text-lg font-bold mb-2">{p.plan}</h3>
              <div className="mb-4"><span className="text-3xl font-extrabold">{p.price}</span><span className="text-sm opacity-75">{p.period}</span></div>
              <ul className="space-y-2 mb-6">
                {p.features.map(f => <li key={f} className="flex items-center gap-2"><span>✓</span>{f}</li>)}
              </ul>
              <button onClick={() => setShowSetup(true)} className={`w-full py-2 rounded-lg font-semibold ${p.highlight ? "bg-white text-indigo-600" : "bg-indigo-600 text-white"}`}>
                {p.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Competitor Comparison */}
      <section className="max-w-3xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-8">Why Not Just Use...</h2>
        <div className="space-y-4">
          {[
            { name: "Spreadsheets", price: "Free", problem: "No skill tracking over time. No parent-facing reports. No analytics. You outgrew this." },
            { name: "TutorBird", price: "$12/mo", problem: "Scheduling only. No progress tracking, no skill assessments, no parent reports." },
            { name: "Wyzant/Varsity Tutors", price: "25-40% cut", problem: "Marketplace takes your revenue. No tools for independent tutors who have their own students." },
            { name: "TutorPulse", price: "$12/mo", problem: "Progress intelligence: skill tracking, engagement analysis, auto-generated parent reports, revenue insights. Built for independent tutors." },
          ].map((c, i) => (
            <div key={c.name} className={`flex items-start gap-4 p-4 rounded-lg ${i === 3 ? "bg-indigo-50 border-2 border-indigo-300" : "bg-white border border-slate-200"}`}>
              <div className="font-bold w-40 shrink-0">{c.name}</div>
              <div className="text-sm font-mono text-slate-500 w-24 shrink-0">{c.price}</div>
              <div className="text-slate-600">{c.problem}</div>
            </div>
          ))}
        </div>
      </section>

      <footer className="text-center py-8 text-slate-500 text-sm">
        © 2026 TutorPulse · Built by <a href="https://henry-the-great.com" className="text-indigo-600 hover:underline">Henry the Great</a> 🗿
      </footer>
    </div>
  );
}
