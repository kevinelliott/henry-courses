"use client"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase"
import { User, CreditCard, Save } from "lucide-react"

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>({ full_name: "", email: "" })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => { loadProfile() }, [])

  async function loadProfile() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setUser(user)

    const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
    if (profile) setProfile(profile)
    else setProfile({ full_name: user.user_metadata?.full_name || "", email: user.email, plan: "free" })
    setLoading(false)
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const supabase = createClient()
    await supabase.from("profiles").upsert({
      id: user.id,
      email: user.email,
      full_name: profile.full_name,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    setSaving(false)
  }

  async function openBillingPortal() {
    const res = await fetch("/api/stripe/portal", { method: "POST" })
    const { url } = await res.json()
    if (url) window.location.href = url
  }

  if (loading) return (
    <div className="p-8">
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-48" />
        <div className="h-64 bg-gray-200 rounded-xl" />
      </div>
    </div>
  )

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your account and billing</p>
      </div>

      {/* Profile */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
            <User className="w-4 h-4 text-indigo-600" />
          </div>
          <h2 className="font-semibold text-gray-900">Profile</h2>
        </div>
        <form onSubmit={saveProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Full name</label>
            <input type="text" value={profile.full_name || ""} onChange={e => setProfile((p: any) => ({ ...p, full_name: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input type="email" value={user?.email || ""} disabled
              className="w-full border border-gray-100 rounded-lg px-3 py-2.5 text-sm bg-gray-50 text-gray-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Plan</label>
            <div className="flex items-center gap-2">
              <span className="bg-indigo-100 text-indigo-700 text-xs px-2.5 py-1 rounded-full font-semibold uppercase">
                {profile.plan || "free"}
              </span>
            </div>
          </div>
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50">
            <Save className="w-4 h-4" />
            {saved ? "Saved!" : saving ? "Saving..." : "Save changes"}
          </button>
        </form>
      </div>

      {/* Billing */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center">
            <CreditCard className="w-4 h-4 text-violet-600" />
          </div>
          <h2 className="font-semibold text-gray-900">Billing</h2>
        </div>
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl mb-4">
          <div>
            <div className="font-medium text-gray-900 text-sm capitalize">{profile.plan || "Free"} plan</div>
            <div className="text-xs text-gray-400 mt-0.5">
              {profile.plan === "free" ? "1 course limit" : profile.plan === "pro" ? "$9/mo · Unlimited courses" : "$29/mo · Everything"}
            </div>
          </div>
        </div>
        <button onClick={openBillingPortal}
          className="flex items-center gap-2 border border-gray-200 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
          <CreditCard className="w-4 h-4" /> Manage billing
        </button>
      </div>
    </div>
  )
}
