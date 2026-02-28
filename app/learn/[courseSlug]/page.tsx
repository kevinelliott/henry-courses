"use client"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase"
import { BookOpen, CheckCircle, Circle, PlayCircle, ChevronLeft, ChevronRight, Menu, X, Award } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

export default function LearnPage() {
  const params = useParams()
  const courseSlug = params.courseSlug as string
  const [course, setCourse] = useState<any>(null)
  const [sections, setSections] = useState<any[]>([])
  const [currentLesson, setCurrentLesson] = useState<any>(null)
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set())
  const [enrollment, setEnrollment] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [allComplete, setAllComplete] = useState(false)

  useEffect(() => { loadCourse() }, [courseSlug])

  async function loadCourse() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const { data: courseData } = await supabase
      .from("courses")
      .select("*, sections(*, lessons(*))")
      .eq("slug", courseSlug)
      .single()

    if (!courseData) { setLoading(false); return }
    setCourse(courseData)

    const sortedSections = (courseData.sections || []).map((s: any) => ({
      ...s,
      lessons: (s.lessons || []).sort((a: any, b: any) => a.position - b.position),
    })).sort((a: any, b: any) => a.position - b.position)
    setSections(sortedSections)
    setCurrentLesson(sortedSections[0]?.lessons?.[0] || null)

    const { data: enrollData } = await supabase
      .from("enrollments")
      .select("*")
      .eq("course_id", courseData.id)
      .eq("student_email", user.email)
      .eq("status", "active")
      .single()
    setEnrollment(enrollData)

    if (enrollData) {
      const { data: progressData } = await supabase
        .from("progress").select("lesson_id").eq("enrollment_id", enrollData.id)
      const completed = new Set(progressData?.map((p: any) => p.lesson_id) || [])
      setCompletedLessons(completed)
      const totalLessons = sortedSections.reduce((acc: number, s: any) => acc + s.lessons.length, 0)
      if (completed.size >= totalLessons && totalLessons > 0) setAllComplete(true)
    }
    setLoading(false)
  }

  async function markComplete() {
    if (!enrollment || !currentLesson || completedLessons.has(currentLesson.id)) return
    const supabase = createClient()
    await supabase.from("progress").insert({ enrollment_id: enrollment.id, lesson_id: currentLesson.id })
    const newCompleted = new Set(completedLessons)
    newCompleted.add(currentLesson.id)
    setCompletedLessons(newCompleted)
    const totalLessons = sections.reduce((acc: number, s: any) => acc + s.lessons.length, 0)
    if (newCompleted.size >= totalLessons) setAllComplete(true)
  }

  function getAllLessons() { return sections.flatMap(s => s.lessons) }

  function goNext() {
    const all = getAllLessons()
    const idx = all.findIndex((l: any) => l.id === currentLesson?.id)
    if (idx < all.length - 1) setCurrentLesson(all[idx + 1])
  }

  function goPrev() {
    const all = getAllLessons()
    const idx = all.findIndex((l: any) => l.id === currentLesson?.id)
    if (idx > 0) setCurrentLesson(all[idx - 1])
  }

  const totalLessons = getAllLessons().length
  const progress = totalLessons > 0 ? Math.round((completedLessons.size / totalLessons) * 100) : 0

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
    </div>
  )

  if (!course) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Course not found</h1>
        <Link href="/" className="text-indigo-400 hover:underline">Back to home</Link>
      </div>
    </div>
  )

  const getVideoEmbedUrl = (url: string) => {
    if (!url) return null
    if (url.includes("youtube.com/watch")) {
      const id = new URL(url).searchParams.get("v")
      return "https://www.youtube.com/embed/" + id
    }
    if (url.includes("youtu.be/")) {
      const id = url.split("youtu.be/")[1].split("?")[0]
      return "https://www.youtube.com/embed/" + id
    }
    if (url.includes("vimeo.com/")) {
      const id = url.split("vimeo.com/")[1].split("?")[0]
      return "https://player.vimeo.com/video/" + id
    }
    return url
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <div className="bg-gray-800 border-b border-gray-700 h-14 flex items-center px-4 gap-4 flex-shrink-0">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400 hover:text-white">
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        <Link href="/" className="flex items-center gap-2">
          <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center">
            <BookOpen className="w-3.5 h-3.5 text-white" />
          </div>
        </Link>
        <span className="text-white font-medium text-sm truncate flex-1">{course.title}</span>
        <div className="flex items-center gap-3 ml-auto">
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-32 h-1.5 bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: progress + "%" }} />
            </div>
            <span className="text-xs text-gray-400">{progress}%</span>
          </div>
          {allComplete && (
            <div className="flex items-center gap-1.5 bg-green-900/50 text-green-400 text-xs px-2.5 py-1 rounded-full">
              <Award className="w-3.5 h-3.5" /> Completed!
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {sidebarOpen && (
          <div className="w-80 bg-gray-800 border-r border-gray-700 overflow-y-auto flex-shrink-0">
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">Curriculum</span>
                <span className="text-xs text-gray-400">{completedLessons.size}/{totalLessons}</span>
              </div>
              <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: progress + "%" }} />
              </div>
            </div>
            {sections.map((section: any) => (
              <div key={section.id}>
                <div className="px-4 py-2.5 bg-gray-900/30 border-b border-gray-700">
                  <span className="text-xs font-semibold text-gray-300 uppercase tracking-wide">{section.title}</span>
                </div>
                {section.lessons.map((lesson: any) => {
                  const done = completedLessons.has(lesson.id)
                  const active = currentLesson?.id === lesson.id
                  return (
                    <button key={lesson.id} onClick={() => setCurrentLesson(lesson)}
                      className={"w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-gray-700/50 transition-colors border-b border-gray-700/30 " + (active ? "bg-indigo-900/40 border-l-2 border-l-indigo-500" : "")}>
                      {done ? <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" /> :
                        <Circle className={"w-4 h-4 flex-shrink-0 mt-0.5 " + (active ? "text-indigo-400" : "text-gray-600")} />}
                      <div className="flex-1 min-w-0">
                        <div className={"text-sm leading-tight " + (active ? "text-white font-medium" : done ? "text-gray-400" : "text-gray-300")}>
                          {lesson.title}
                        </div>
                        {lesson.duration_minutes > 0 && <div className="text-xs text-gray-500 mt-0.5">{lesson.duration_minutes}m</div>}
                      </div>
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {currentLesson ? (
            <div>
              {currentLesson.video_url ? (
                <div className="aspect-video bg-black w-full">
                  <iframe src={getVideoEmbedUrl(currentLesson.video_url) || ""}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen />
                </div>
              ) : (
                <div className="aspect-video bg-gray-800 flex items-center justify-center">
                  <PlayCircle className="w-16 h-16 text-gray-600" />
                </div>
              )}
              <div className="max-w-4xl mx-auto px-6 py-8">
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-2xl font-bold text-white">{currentLesson.title}</h1>
                  {enrollment && (
                    <button onClick={markComplete} disabled={completedLessons.has(currentLesson.id)}
                      className={"px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 " +
                        (completedLessons.has(currentLesson.id) ? "bg-green-900/50 text-green-400 cursor-default" : "bg-indigo-600 text-white hover:bg-indigo-700")}>
                      {completedLessons.has(currentLesson.id) ? <><CheckCircle className="w-4 h-4" /> Completed</> : "Mark complete"}
                    </button>
                  )}
                </div>
                {currentLesson.content && (
                  <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                    <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-wide">Lesson Notes</h3>
                    <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{currentLesson.content}</div>
                  </div>
                )}
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-800">
                  <button onClick={goPrev} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-gray-800">
                    <ChevronLeft className="w-4 h-4" /> Previous
                  </button>
                  <button onClick={goNext} className="flex items-center gap-2 text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500 py-32">
              <div className="text-center">
                <PlayCircle className="w-12 h-12 mx-auto mb-3 text-gray-700" />
                <p>Select a lesson to begin</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
