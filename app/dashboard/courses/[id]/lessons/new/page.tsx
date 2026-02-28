'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function NewLessonForm({ courseId }: { courseId: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sectionId = searchParams.get('section') || ''
  const [form, setForm] = useState({ title: '', video_url: '', content: '', position: 0, duration_minutes: 0 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.from('lessons').insert({
      ...form, course_id: courseId, section_id: sectionId || null
    })
    if (error) { setError(error.message); setLoading(false) }
    else router.push('/dashboard/courses/' + courseId)
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">New Lesson</h1>
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lesson Title</label>
            <input type="text" required value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Video URL (YouTube or Vimeo)</label>
            <input type="url" value={form.video_url}
              onChange={e => setForm(f => ({ ...f, video_url: e.target.value }))}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content Notes</label>
            <textarea rows={5} value={form.content}
              onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
              <input type="number" min="0" value={form.position}
                onChange={e => setForm(f => ({ ...f, position: Number(e.target.value) }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
              <input type="number" min="0" value={form.duration_minutes}
                onChange={e => setForm(f => ({ ...f, duration_minutes: Number(e.target.value) }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50">
            {loading ? 'Saving...' : 'Save Lesson'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function NewLessonPage({ params }: { params: { id: string } }) {
  return (
    <Suspense>
      <NewLessonForm courseId={params.id} />
    </Suspense>
  )
}
