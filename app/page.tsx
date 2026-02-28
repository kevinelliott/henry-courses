import Link from "next/link"
import { BookOpen, Users, DollarSign, Award, CheckCircle, ArrowRight, Zap } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100 bg-white/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg">Henry Courses</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Sign in</Link>
            <Link href="/signup" className="bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium">
              Start free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-24 px-4 text-center bg-gradient-to-b from-indigo-50 to-white">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-violet-100 text-violet-700 text-sm px-3 py-1 rounded-full mb-6 font-medium">
            <Zap className="w-3.5 h-3.5" />
            $9/mo vs Teachable&apos;s $39/mo
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
            Sell courses.
            <br />
            <span className="text-indigo-600">Keep your revenue.</span>
          </h1>
          <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
            The simplest way to build and sell online courses. No per-transaction fees, no student caps, no feature paywalls.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup" className="bg-indigo-600 text-white px-8 py-4 rounded-xl hover:bg-indigo-700 transition-colors font-semibold text-lg flex items-center gap-2 shadow-lg shadow-indigo-200">
              Start for free <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/login" className="text-gray-600 hover:text-gray-900 px-8 py-4 rounded-xl border border-gray-200 font-medium transition-colors">
              Sign in
            </Link>
          </div>
          <p className="mt-4 text-sm text-gray-400">No credit card required. Free plan includes 1 course.</p>
        </div>
      </section>

      {/* Comparison */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Why creators choose Henry Courses</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { platform: "Henry Courses", price: "$9/mo", highlight: true },
              { platform: "Teachable", price: "$39/mo", highlight: false },
              { platform: "Thinkific", price: "$49/mo", highlight: false },
            ].map((item) => (
              <div key={item.platform} className={"p-6 rounded-2xl border-2 " + (item.highlight ? "border-indigo-500 bg-indigo-50" : "border-gray-100 bg-gray-50")}>
                <div className={"text-sm font-medium mb-2 " + (item.highlight ? "text-indigo-600" : "text-gray-500")}>{item.platform}</div>
                <div className={"text-4xl font-bold mb-4 " + (item.highlight ? "text-indigo-700" : "text-gray-400")}>{item.price}</div>
                {item.highlight && (
                  <div className="space-y-2">
                    {["Unlimited courses", "No transaction fees", "Student certificates", "Built-in analytics", "Stripe payments"].map(f => (
                      <div key={f} className="flex items-center gap-2 text-sm text-indigo-700">
                        <CheckCircle className="w-4 h-4 text-indigo-500" /> {f}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Everything you need to teach online</h2>
          <p className="text-center text-gray-500 mb-16 max-w-2xl mx-auto">Build, publish, and sell courses with a full curriculum builder, student progress tracking, and Stripe-powered payments.</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: BookOpen, title: "Course Builder", desc: "Create structured curricula with sections and lessons. Add video embeds from YouTube or Vimeo plus rich text notes." },
              { icon: Users, title: "Student Management", desc: "See who is enrolled, track their progress, and know when they complete your course." },
              { icon: DollarSign, title: "Stripe Payments", desc: "Get paid directly to your Stripe account. Set your own price per course." },
              { icon: Award, title: "Certificates", desc: "Automatically issue completion certificates when students finish your course." },
              { icon: CheckCircle, title: "Progress Tracking", desc: "Students see their progress with a sidebar showing completed and remaining lessons." },
              { icon: Zap, title: "Instant Publishing", desc: "Go from draft to live in one click. Share your course link and start earning." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white p-6 rounded-2xl border border-gray-100 hover:border-indigo-200 hover:shadow-md transition-all">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-indigo-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Simple, honest pricing</h2>
          <p className="text-center text-gray-500 mb-16">No hidden fees. No transaction percentages. Just a flat monthly rate.</p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Free",
                price: "$0",
                period: "forever",
                desc: "Get started with one course",
                features: ["1 course", "Unlimited students", "Stripe payments", "Progress tracking", "Basic analytics"],
                cta: "Start free",
                highlighted: false,
              },
              {
                name: "Pro",
                price: "$9",
                period: "per month",
                desc: "For serious course creators",
                features: ["Unlimited courses", "Unlimited students", "Stripe payments", "Student certificates", "Advanced analytics", "Custom course URL"],
                cta: "Get Pro",
                highlighted: true,
              },
              {
                name: "Growth",
                price: "$29",
                period: "per month",
                desc: "For teams and academies",
                features: ["Everything in Pro", "Team members", "White label", "API access (MCP)", "Priority support", "Custom domain"],
                cta: "Get Growth",
                highlighted: false,
              },
            ].map((plan) => (
              <div key={plan.name} className={"p-8 rounded-2xl border-2 flex flex-col " + (plan.highlighted ? "border-indigo-500 bg-indigo-600 text-white shadow-xl shadow-indigo-200" : "border-gray-100 bg-white")}>
                <div className={"text-sm font-medium mb-2 " + (plan.highlighted ? "text-indigo-200" : "text-gray-500")}>{plan.name}</div>
                <div className={"text-4xl font-bold mb-1 " + (plan.highlighted ? "text-white" : "text-gray-900")}>{plan.price}</div>
                <div className={"text-sm mb-4 " + (plan.highlighted ? "text-indigo-200" : "text-gray-400")}>{plan.period}</div>
                <p className={"text-sm mb-6 " + (plan.highlighted ? "text-indigo-100" : "text-gray-500")}>{plan.desc}</p>
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className={"flex items-center gap-2 text-sm " + (plan.highlighted ? "text-indigo-100" : "text-gray-600")}>
                      <CheckCircle className={"w-4 h-4 flex-shrink-0 " + (plan.highlighted ? "text-indigo-300" : "text-indigo-500")} /> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/signup" className={"text-center py-3 px-6 rounded-xl font-semibold text-sm transition-colors " + (plan.highlighted ? "bg-white text-indigo-600 hover:bg-indigo-50" : "bg-indigo-600 text-white hover:bg-indigo-700")}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-indigo-600">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to start teaching?</h2>
          <p className="text-indigo-200 mb-8 text-lg">Join thousands of creators who sell courses without the platform tax.</p>
          <Link href="/signup" className="inline-flex items-center gap-2 bg-white text-indigo-600 px-8 py-4 rounded-xl font-semibold hover:bg-indigo-50 transition-colors shadow-lg">
            Create your first course <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-4 border-t border-gray-100 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center">
              <BookOpen className="w-3 h-3 text-white" />
            </div>
            <span className="font-semibold text-gray-900">Henry Courses</span>
          </div>
          <div className="flex gap-6 text-sm text-gray-400">
            <Link href="/login" className="hover:text-gray-700">Sign in</Link>
            <Link href="/signup" className="hover:text-gray-700">Sign up</Link>
          </div>
          <p className="text-sm text-gray-400">2025 Henry Courses. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
