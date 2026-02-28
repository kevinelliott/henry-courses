"use client"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase"
import { Users, CheckCircle, Mail } from "lucide-react"

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadStudents() }, [])

  async function loadStudents() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: enrollments } = await supabase
      .from("enrollments")
      .select("*, courses(title, slug, id)")
      .eq("instructor_id", user.id)
      .order("enrolled_at", { ascending: false })

    if (!enrollments) { setLoading(false); return }

    // Get progress for each enrollment
    const enriched = await Promise.all(enrollments.map(async (e: any) => {
      const { data: progressData } = await supabase
        .from("progress")
        .select("lesson_id")
        .eq("enrollment_id", e.id)

      const { data: lessonsData } = await supabase
        .from("lessons")
        .select("id")
        .eq("course_id", e.course_id)

      const total = lessonsData?.length || 0
      const completed = progressData?.length || 0
      const pct = total > 0 ? Math.round((completed / total) * 100) : 0
      const isComplete = total > 0 && completed >= total

      return { ...e, progressPct: pct, isComplete, completedLessons: completed, totalLessons: total }
    }))

    setStudents(enriched)
    setLoading(false)
  }

  if (loading) return (
    <div className="p-8">
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-48" />
        {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-gray-200 rounded-xl" />)}
      </div>
    </div>
  )

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Students</h1>
        <p className="text-gray-500 text-sm mt-1">{students.length} enrollment{students.length !== 1 ? "s" : ""}</p>
      </div>

      {students.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-16 text-center shadow-sm">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">No students yet</h2>
          <p className="text-gray-500">Students will appear here after they enroll in your courses.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="grid grid-cols-5 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-100 text-xs font-medium text-gray-500 uppercase tracking-wide">
            <div className="col-span-2">Student</div>
            <div>Course</div>
            <div>Progress</div>
            <div>Enrolled</div>
          </div>
          <div className="divide-y divide-gray-50">
            {students.map((s: any) => (
              <div key={s.id} className="grid grid-cols-5 gap-4 px-6 py-4 items-center hover:bg-gray-50">
                <div className="col-span-2 flex items-center gap-3">
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-semibold text-indigo-700">{s.student_email[0]?.toUpperCase()}</span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                      <span className="text-sm text-gray-700 truncate">{s.student_email}</span>
                    </div>
                    {s.isComplete && (
                      <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium">
                        <CheckCircle className="w-3 h-3" /> Completed
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-sm text-gray-600 truncate">{s.courses?.title || "—"}</div>
                <div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={"h-full rounded-full " + (s.isComplete ? "bg-green-500" : "bg-indigo-500")}
                        style={{ width: s.progressPct + "%" }} />
                    </div>
                    <span className="text-xs text-gray-400 flex-shrink-0">{s.progressPct}%</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">{s.completedLessons}/{s.totalLessons} lessons</div>
                </div>
                <div className="text-xs text-gray-400">
                  {new Date(s.enrolled_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
