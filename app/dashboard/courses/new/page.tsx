"use client"
import { useState } from "react"
import { createClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function NewCoursePage() {
  const [form, setForm] = useState({
    title: "", slug: "", description: "", price: "", thumbnail_url: "", category: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  function generateSlug(title: string) {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
  }

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const title = e.target.value
    setForm(f => ({ ...f, title, slug: f.slug || generateSlug(title) }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError("Not authenticated"); setLoading(false); return }

    const { data, error: err } = await supabase.from("courses").insert({
      user_id: user.id,
      title: form.title,
      slug: form.slug,
      description: form.description,
      price: parseFloat(form.price) || 0,
      thumbnail_url: form.thumbnail_url || null,
      category: form.category || null,
    }).select().single()

    if (err) { setError(err.message); setLoading(false); return }
    router.push("/dashboard/courses/" + data.id)
  }

  const categories = ["Business", "Design", "Development", "Marketing", "Photography", "Music", "Health", "Lifestyle", "Other"]

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <Link href="/dashboard/courses" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to courses
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Create a new course</h1>
        <p className="text-gray-500 text-sm mt-1">Fill in the basics. You can add content after.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg border border-red-100">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Course title *</label>
            <input type="text" required value={form.title} onChange={handleTitleChange}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. Complete Python Bootcamp" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Course slug *</label>
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500">
              <span className="bg-gray-50 px-3 py-2.5 text-sm text-gray-400 border-r border-gray-200 flex-shrink-0">/c/</span>
              <input type="text" required value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                className="flex-1 px-3 py-2.5 text-sm focus:outline-none"
                placeholder="complete-python-bootcamp" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={4} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              placeholder="What will students learn in this course?" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Price ($)</label>
              <input type="number" min="0" step="0.01" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="0 for free" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                <option value="">Select category</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Thumbnail URL</label>
            <input type="url" value={form.thumbnail_url} onChange={e => setForm(f => ({ ...f, thumbnail_url: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="https://example.com/image.jpg" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading}
              className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50">
              {loading ? "Creating..." : "Create course"}
            </button>
            <Link href="/dashboard/courses"
              className="px-6 py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors font-medium text-sm flex items-center">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
