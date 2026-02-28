export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'

export default async function CoursesPage() {
  const supabase = createClient()
  const { data: courses } = await supabase
    .from('courses')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
        <Link href="/dashboard/courses/new"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700">
          + New Course
        </Link>
      </div>
      {!courses?.length && (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <div className="text-5xl mb-4">📚</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No courses yet</h3>
          <p className="text-gray-500 mb-6">Create your first course to get started</p>
          <Link href="/dashboard/courses/new" className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700">
            Create course
          </Link>
        </div>
      )}
      {courses && courses.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Course</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Students</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Price</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {courses.map((course: any) => (
                <tr key={course.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{course.title}</div>
                    <div className="text-gray-400 text-xs">/c/{course.slug}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-700">{course.student_count || 0}</td>
                  <td className="px-6 py-4 text-gray-700">{course.price === 0 ? 'Free' : `$${course.price}`}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${course.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {course.is_published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Link href={`/dashboard/courses/${course.id}`} className="text-indigo-600 hover:underline text-sm mr-4">Edit</Link>
                    <Link href={`/c/${course.slug}`} className="text-gray-500 hover:underline text-sm" target="_blank">View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
