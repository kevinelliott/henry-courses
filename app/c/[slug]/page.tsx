import { createClient } from '@/lib/supabase'
import Link from 'next/link'

export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = createClient()

  const { data: course } = await supabase
    .from('courses')
    .select('*, sections(*, lessons(*))')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Course not found</h1>
          <Link href="/" className="text-indigo-600 mt-4 block">← Back to home</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-gray-200 px-6 py-4">
        <Link href="/" className="flex items-center gap-2 w-fit">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">HC</span>
          </div>
          <span className="font-bold text-gray-900">Henry Courses</span>
        </Link>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main */}
        <div className="lg:col-span-2">
          {course.thumbnail_url && (
            <img src={course.thumbnail_url} alt={course.title}
              className="w-full aspect-video object-cover rounded-2xl mb-8" />
          )}
          {!course.thumbnail_url && (
            <div className="w-full aspect-video bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl mb-8 flex items-center justify-center">
              <span className="text-white text-6xl font-bold opacity-30">{course.title[0]}</span>
            </div>
          )}
          <div className="inline-block bg-violet-100 text-violet-700 text-xs font-medium px-2 py-1 rounded mb-3">
            {course.category || 'Course'}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{course.title}</h1>
          <p className="text-gray-600 text-lg mb-8">{course.description}</p>

          {/* Curriculum */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Course curriculum</h2>
            <div className="space-y-4">
              {(course.sections || []).sort((a: any, b: any) => a.position - b.position).map((section: any) => (
                <div key={section.id} className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3">
                    <h3 className="font-semibold text-gray-900">{section.title}</h3>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {(section.lessons || []).sort((a: any, b: any) => a.position - b.position).map((lesson: any) => (
                      <div key={lesson.id} className="flex items-center gap-3 px-4 py-3">
                        <span className="text-gray-400">▶</span>
                        <span className="text-gray-700 text-sm">{lesson.title}</span>
                        {lesson.duration_minutes && (
                          <span className="ml-auto text-gray-400 text-xs">{lesson.duration_minutes}m</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-8 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {course.price === 0 ? 'Free' : `$${course.price}`}
            </div>
            <div className="text-sm text-gray-500 mb-6">
              {course.student_count || 0} students enrolled
            </div>
            <form action="/api/stripe/checkout" method="POST">
              <input type="hidden" name="course_id" value={course.id} />
              <button type="submit"
                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 mb-4">
                {course.price === 0 ? 'Enroll for free' : `Enroll — $${course.price}`}
              </button>
            </form>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <span>📚</span>
                <span>{(course.sections || []).length} sections</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🎬</span>
                <span>{(course.sections || []).reduce((acc: number, s: any) => acc + (s.lessons || []).length, 0)} lessons</span>
              </div>
              <div className="flex items-center gap-2">
                <span>♾️</span>
                <span>Lifetime access</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
