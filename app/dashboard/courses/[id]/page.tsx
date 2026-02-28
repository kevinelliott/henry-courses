export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'

export default async function CourseBuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createClient()
  const { data: course } = await supabase.from('courses').select('*').eq('id', id).single()
  const { data: sections } = await supabase
    .from('sections')
    .select('*, lessons(*)')
    .eq('course_id', id)
    .order('position')

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/dashboard/courses" className="text-indigo-600 hover:underline text-sm">← Courses</Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">{course?.title || 'Course Builder'}</h1>
        </div>
        <Link href={`/c/${course?.slug}`} target="_blank"
          className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm hover:border-gray-400">
          Preview →
        </Link>
      </div>

      <div className="space-y-4">
        {sections?.map((section: any) => (
          <div key={section.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 bg-gray-50 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">{section.title}</h3>
              <Link href={`/dashboard/courses/${id}/lessons/new?section=${section.id}`}
                className="text-indigo-600 text-sm hover:underline">+ Add Lesson</Link>
            </div>
            {section.lessons && section.lessons.length > 0 && (
              <div className="divide-y divide-gray-100">
                {section.lessons.sort((a: any, b: any) => a.position - b.position).map((lesson: any) => (
                  <div key={lesson.id} className="flex items-center gap-3 px-5 py-3">
                    <span className="text-gray-400">▶</span>
                    <span className="text-gray-700 text-sm flex-1">{lesson.title}</span>
                    {lesson.duration_minutes && (
                      <span className="text-gray-400 text-xs">{lesson.duration_minutes}m</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Add section form */}
        <AddSectionForm courseId={id} />
      </div>
    </div>
  )
}

function AddSectionForm({ courseId }: { courseId: string }) {
  return (
    <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-6 text-center">
      <p className="text-gray-500 text-sm mb-3">Add a new section</p>
      <form action="/api/sections/create" method="POST" className="flex gap-3 max-w-md mx-auto">
        <input type="hidden" name="course_id" value={courseId} />
        <input type="text" name="title" placeholder="Section title" required
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700">
          Add Section
        </button>
      </form>
    </div>
  )
}
