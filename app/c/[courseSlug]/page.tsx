import { createServerClient } from "@supabase/ssr"
import Link from "next/link"
import { BookOpen, Users, Clock, Award, ChevronRight, PlayCircle } from "lucide-react"

export const dynamic = "force-dynamic"

async function getCourse(slug: string) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key",
    { cookies: { getAll: () => [], setAll: () => {} } }
  )
  const { data: course } = await supabase
    .from("courses")
    .select("*, sections(*, lessons(*))")
    .eq("slug", slug)
    .eq("is_published", true)
    .single()
  return course
}

export default async function CourseLandingPage({ params }: { params: Promise<{ courseSlug: string }> }) {
  const { courseSlug } = await params
  const course = await getCourse(courseSlug)

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Course not found</h1>
          <p className="text-gray-500 mb-4">This course may not be published yet.</p>
          <Link href="/" className="text-indigo-600 hover:underline">Back to home</Link>
        </div>
      </div>
    )
  }

  const sections = course.sections || []
  const totalLessons = sections.reduce((acc: number, s: any) => acc + (s.lessons?.length || 0), 0)
  const totalMinutes = sections.reduce((acc: number, s: any) =>
    acc + (s.lessons?.reduce((a: number, l: any) => a + (l.duration_minutes || 0), 0) || 0), 0)

  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-gray-100 bg-white sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-indigo-600 rounded flex items-center justify-center">
              <BookOpen className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-sm">Henry Courses</span>
          </Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-12 grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          {course.category && (
            <div className="inline-block bg-violet-100 text-violet-700 text-xs px-2.5 py-1 rounded-full font-medium mb-4">
              {course.category}
            </div>
          )}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{course.title}</h1>
          <p className="text-gray-600 text-lg mb-6 leading-relaxed">{course.description}</p>

          <div className="flex flex-wrap gap-6 text-sm text-gray-500 mb-10 pb-10 border-b border-gray-100">
            <div className="flex items-center gap-1.5"><Users className="w-4 h-4" /> {course.student_count || 0} students</div>
            <div className="flex items-center gap-1.5"><BookOpen className="w-4 h-4" /> {totalLessons} lessons</div>
            {totalMinutes > 0 && <div className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {Math.round(totalMinutes / 60)}h {totalMinutes % 60}m</div>}
            <div className="flex items-center gap-1.5"><Award className="w-4 h-4" /> Certificate of completion</div>
          </div>

          <h2 className="text-xl font-bold text-gray-900 mb-6">Course curriculum</h2>
          <div className="space-y-4">
            {sections.map((section: any) => (
              <div key={section.id} className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 text-sm">{section.title}</h3>
                  <span className="text-xs text-gray-500">{section.lessons?.length || 0} lessons</span>
                </div>
                <div className="divide-y divide-gray-100">
                  {(section.lessons || []).sort((a: any, b: any) => a.position - b.position).map((lesson: any) => (
                    <div key={lesson.id} className="px-4 py-3 flex items-center gap-3">
                      <PlayCircle className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{lesson.title}</span>
                      {lesson.duration_minutes > 0 && (
                        <span className="ml-auto text-xs text-gray-400">{lesson.duration_minutes}m</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-20">
            <div className="bg-white border-2 border-gray-100 rounded-2xl overflow-hidden shadow-lg">
              {course.thumbnail_url ? (
                <img src={course.thumbnail_url} alt={course.title} className="w-full h-48 object-cover" />
              ) : (
                <div className="w-full h-48 bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                  <BookOpen className="w-16 h-16 text-white/50" />
                </div>
              )}
              <div className="p-6">
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {course.price > 0 ? "$" + course.price : "Free"}
                </div>
                {course.price > 0 && <div className="text-sm text-gray-400 mb-4">One-time payment</div>}
                <form action="/api/stripe/checkout" method="POST">
                  <input type="hidden" name="courseId" value={course.id} />
                  <button type="submit"
                    className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 mb-3">
                    Enroll now <ChevronRight className="w-4 h-4" />
                  </button>
                </form>
                <p className="text-center text-xs text-gray-400">30-day money-back guarantee</p>
                <ul className="mt-6 space-y-2.5 text-sm text-gray-600">
                  <li className="flex items-center gap-2"><BookOpen className="w-4 h-4 text-indigo-400" /> {totalLessons} lessons</li>
                  <li className="flex items-center gap-2"><Award className="w-4 h-4 text-indigo-400" /> Certificate of completion</li>
                  <li className="flex items-center gap-2"><Users className="w-4 h-4 text-indigo-400" /> {course.student_count || 0} enrolled</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
