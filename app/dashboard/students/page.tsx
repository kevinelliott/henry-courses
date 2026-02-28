export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase'

export default async function StudentsPage() {
  const supabase = createClient()
  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('*, courses(title, slug)')
    .eq('status', 'active')
    .order('enrolled_at', { ascending: false })

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Students</h1>
      {!enrollments?.length && (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <div className="text-5xl mb-4">👩‍🎓</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No students yet</h3>
          <p className="text-gray-500">Students will appear here once they enroll in your courses</p>
        </div>
      )}
      {enrollments && enrollments.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Student</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Course</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Progress</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Enrolled</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {enrollments.map((e: any) => (
                <tr key={e.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-900 text-sm">{e.student_email}</td>
                  <td className="px-6 py-4 text-gray-700 text-sm">{e.courses?.title || '—'}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-100 rounded-full h-1.5 max-w-24">
                        <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: '0%' }} />
                      </div>
                      <span className="text-gray-500 text-xs">0%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-sm">
                    {new Date(e.enrolled_at).toLocaleDateString()}
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
