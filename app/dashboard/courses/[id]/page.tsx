"use client"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Plus, GripVertical, Pencil, Trash2, ExternalLink, PlayCircle } from "lucide-react"

export default function CourseBuilderPage() {
  const { id } = useParams()
  const router = useRouter()
  const [course, setCourse] = useState<any>(null)
  const [sections, setSections] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [newSectionTitle, setNewSectionTitle] = useState("")
  const [addingSection, setAddingSection] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadCourse() }, [id])

  async function loadCourse() {
    const supabase = createClient()
    const { data } = await supabase
      .from("courses")
      .select("*, sections(*, lessons(*))")
      .eq("id", id)
      .single()
    if (data) {
      setCourse(data)
      const sorted = (data.sections || []).map((s: any) => ({
        ...s,
        lessons: (s.lessons || []).sort((a: any, b: any) => a.position - b.position),
      })).sort((a: any, b: any) => a.position - b.position)
      setSections(sorted)
    }
    setLoading(false)
  }

  async function addSection() {
    if (!newSectionTitle.trim()) return
    setSaving(true)
    const supabase = createClient()
    const { data } = await supabase.from("sections").insert({
      course_id: id,
      title: newSectionTitle.trim(),
      position: sections.length,
    }).select().single()
    if (data) {
      setSections([...sections, { ...data, lessons: [] }])
      setNewSectionTitle("")
      setAddingSection(false)
    }
    setSaving(false)
  }

  async function deleteSection(sectionId: string) {
    if (!confirm("Delete this section and all its lessons?")) return
    const supabase = createClient()
    await supabase.from("sections").delete().eq("id", sectionId)
    setSections(sections.filter(s => s.id !== sectionId))
  }

  async function deleteLesson(lessonId: string, sectionId: string) {
    if (!confirm("Delete this lesson?")) return
    const supabase = createClient()
    await supabase.from("lessons").delete().eq("id", lessonId)
    setSections(sections.map(s => s.id === sectionId ? { ...s, lessons: s.lessons.filter((l: any) => l.id !== lessonId) } : s))
  }

  async function togglePublish() {
    const supabase = createClient()
    await supabase.from("courses").update({ is_published: !course.is_published }).eq("id", id)
    setCourse({ ...course, is_published: !course.is_published })
  }

  if (loading) return (
    <div className="p-8">
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-64" />
        <div className="h-48 bg-gray-200 rounded-xl" />
      </div>
    </div>
  )

  if (!course) return (
    <div className="p-8 text-center text-gray-500">Course not found</div>
  )

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <Link href="/dashboard/courses" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to courses
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
            <div className="flex items-center gap-3 mt-2">
              <span className={"text-xs px-2 py-0.5 rounded-full font-medium " +
                (course.is_published ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500")}>
                {course.is_published ? "Published" : "Draft"}
              </span>
              {course.category && <span className="text-xs text-gray-400">{course.category}</span>}
              <span className="text-xs text-gray-400">${course.price || 0}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {course.is_published && (
              <Link href={"/c/" + course.slug} target="_blank"
                className="flex items-center gap-1.5 text-sm text-indigo-600 hover:underline px-3 py-2 border border-indigo-200 rounded-lg hover:bg-indigo-50">
                <ExternalLink className="w-3.5 h-3.5" /> View
              </Link>
            )}
            <button onClick={togglePublish}
              className={"text-sm px-4 py-2 rounded-lg font-medium transition-colors " +
                (course.is_published ? "bg-gray-100 text-gray-700 hover:bg-gray-200" : "bg-green-600 text-white hover:bg-green-700")}>
              {course.is_published ? "Unpublish" : "Publish"}
            </button>
          </div>
        </div>
      </div>

      {/* Curriculum */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm mb-6">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Course Curriculum</h2>
          <span className="text-sm text-gray-400">{sections.length} sections</span>
        </div>

        <div className="p-4 space-y-4">
          {sections.map((section: any) => (
            <div key={section.id} className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 flex items-center gap-3">
                <GripVertical className="w-4 h-4 text-gray-300 cursor-move" />
                <span className="font-semibold text-gray-900 text-sm flex-1">{section.title}</span>
                <span className="text-xs text-gray-400">{section.lessons?.length || 0} lessons</span>
                <Link href={"/dashboard/courses/" + id + "/lessons/new?sectionId=" + section.id}
                  className="flex items-center gap-1 text-xs text-indigo-600 hover:underline px-2 py-1 rounded hover:bg-indigo-50">
                  <Plus className="w-3 h-3" /> Add lesson
                </Link>
                <button onClick={() => deleteSection(section.id)}
                  className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="divide-y divide-gray-100">
                {(section.lessons || []).map((lesson: any) => (
                  <div key={lesson.id} className="px-4 py-3 flex items-center gap-3 hover:bg-gray-50">
                    <GripVertical className="w-3.5 h-3.5 text-gray-200 cursor-move" />
                    <PlayCircle className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                    <span className="text-sm text-gray-700 flex-1">{lesson.title}</span>
                    {lesson.duration_minutes > 0 && (
                      <span className="text-xs text-gray-400">{lesson.duration_minutes}m</span>
                    )}
                    <button onClick={() => deleteLesson(lesson.id, section.id)}
                      className="p-1 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                {section.lessons?.length === 0 && (
                  <div className="px-4 py-3 text-sm text-gray-400 italic">No lessons yet</div>
                )}
              </div>
            </div>
          ))}

          {/* Add section */}
          {addingSection ? (
            <div className="border border-dashed border-indigo-200 rounded-xl p-4">
              <input autoFocus type="text" value={newSectionTitle} onChange={e => setNewSectionTitle(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") addSection(); if (e.key === "Escape") setAddingSection(false) }}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-3"
                placeholder="Section title..." />
              <div className="flex gap-2">
                <button onClick={addSection} disabled={saving}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
                  {saving ? "Adding..." : "Add section"}
                </button>
                <button onClick={() => { setAddingSection(false); setNewSectionTitle("") }}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setAddingSection(true)}
              className="w-full border-2 border-dashed border-gray-200 rounded-xl py-4 text-sm text-gray-400 hover:border-indigo-300 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" /> Add section
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
