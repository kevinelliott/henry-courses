"use client"
import { useState } from "react"
import { createClient } from "@/lib/supabase"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function NewLessonPage() {
  const { id } = useParams()
  const searchParams = useSearchParams()
  const sectionId = searchParams.get("sectionId")
  const router = useRouter()
  const [form, setForm] = useState({
    title: "", video_url: "", content: "", position: "0", duration_minutes: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!sectionId) { setError("No section selected"); return }
    setLoading(true)
    setError("")
    const supabase = createClient()
    const { error: err } = await supabase.from("lessons").insert({
      section_id: sectionId,
      course_id: id,
      title: form.title,
      video_url: form.video_url || null,
      content: form.content || null,
      position: parseInt(form.position) || 0,
      duration_minutes: parseInt(form.duration_minutes) || 0,
    })
    if (err) { setError(err.message); setLoading(false); return }
    router.push("/dashboard/courses/" + id)
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <Link href={"/dashboard/courses/" + id} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to course
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Add a lesson</h1>
        <p className="text-gray-500 text-sm mt-1">Add a video lesson with optional notes</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg border border-red-100">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Lesson title *</label>
            <input type="text" required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. Introduction to Python" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Video URL</label>
            <input type="url" value={form.video_url} onChange={e => setForm(f => ({ ...f, video_url: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="https://www.youtube.com/watch?v=..." />
            <p className="text-xs text-gray-400 mt-1">YouTube or Vimeo URL supported</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Lesson notes</label>
            <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
              rows={6} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              placeholder="Additional notes, links, or resources for this lesson..." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Position</label>
              <input type="number" min="0" value={form.position} onChange={e => setForm(f => ({ ...f, position: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="0" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Duration (minutes)</label>
              <input type="number" min="0" value={form.duration_minutes} onChange={e => setForm(f => ({ ...f, duration_minutes: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="0" />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading}
              className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50">
              {loading ? "Adding..." : "Add lesson"}
            </button>
            <Link href={"/dashboard/courses/" + id}
              className="px-6 py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors font-medium text-sm flex items-center">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
