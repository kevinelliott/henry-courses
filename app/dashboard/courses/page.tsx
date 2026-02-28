"use client"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase"
import { BookOpen, Plus, Users, DollarSign, ExternalLink, Pencil } from "lucide-react"
import Link from "next/link"

export default function CoursesPage() {
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadCourses() }, [])

  async function loadCourses() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from("courses").select("*").eq("user_id", user.id).order("created_at", { ascending: false })
    setCourses(data || [])
    setLoading(false)
  }

  async function togglePublish(course: any) {
    const supabase = createClient()
    await supabase.from("courses").update({ is_published: !course.is_published }).eq("id", course.id)
    setCourses(courses.map(c => c.id === course.id ? { ...c, is_published: !c.is_published } : c))
  }

  if (loading) return (
    <div className="p-8">
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-48" />
        {[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-gray-200 rounded-xl" />)}
      </div>
    </div>
  )

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
          <p className="text-gray-500 text-sm mt-1">{courses.length} course{courses.length !== 1 ? "s" : ""}</p>
        </div>
        <Link href="/dashboard/courses/new"
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm">
          <Plus className="w-4 h-4" /> New course
        </Link>
      </div>

      {courses.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-16 text-center shadow-sm">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Create your first course</h2>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">Build a curriculum, add video lessons, and start earning from your knowledge.</p>
          <Link href="/dashboard/courses/new"
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition-colors font-medium">
            <Plus className="w-4 h-4" /> Create course
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {courses.map((course: any) => (
            <div key={course.id} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm flex items-center gap-5">
              <div className="w-16 h-12 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                {course.thumbnail_url ? (
                  <img src={course.thumbnail_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <BookOpen className="w-6 h-6 text-indigo-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900 truncate">{course.title}</h3>
                  <span className={"text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 " +
                    (course.is_published ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500")}>
                    {course.is_published ? "Published" : "Draft"}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {course.student_count || 0} students</span>
                  <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" /> ${course.price || 0}</span>
                  {course.category && <span className="text-xs bg-violet-50 text-violet-600 px-2 py-0.5 rounded-full">{course.category}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {course.is_published && (
                  <Link href={"/c/" + course.slug} target="_blank"
                    className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                )}
                <button onClick={() => togglePublish(course)}
                  className={"text-xs px-3 py-1.5 rounded-lg font-medium transition-colors " +
                    (course.is_published ? "bg-gray-100 text-gray-600 hover:bg-gray-200" : "bg-green-50 text-green-700 hover:bg-green-100")}>
                  {course.is_published ? "Unpublish" : "Publish"}
                </button>
                <Link href={"/dashboard/courses/" + course.id}
                  className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-indigo-100 transition-colors">
                  <Pencil className="w-3 h-3" /> Edit
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
