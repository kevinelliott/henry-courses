"use client"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase"
import { BookOpen, Users, DollarSign, TrendingUp, Plus } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const [stats, setStats] = useState({ courses: 0, students: 0, revenue: 0, published: 0 })
  const [recentCourses, setRecentCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  async function loadStats() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [{ data: courses }, { data: enrollments }] = await Promise.all([
      supabase.from("courses").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("enrollments").select("*, courses(price)").eq("instructor_id", user.id).eq("status", "active"),
    ])

    const revenue = enrollments?.reduce((acc: number, e: any) => acc + (e.courses?.price || 0), 0) || 0
    setStats({
      courses: courses?.length || 0,
      students: enrollments?.length || 0,
      revenue,
      published: courses?.filter((c: any) => c.is_published).length || 0,
    })
    setRecentCourses((courses || []).slice(0, 5))
    setLoading(false)
  }

  const statCards = [
    { label: "Total Courses", value: stats.courses, icon: BookOpen, color: "indigo" },
    { label: "Total Students", value: stats.students, icon: Users, color: "violet" },
    { label: "Revenue", value: `$${stats.revenue.toFixed(2)}`, icon: DollarSign, color: "green" },
    { label: "Published", value: stats.published, icon: TrendingUp, color: "blue" },
  ]

  if (loading) return (
    <div className="p-8">
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-48" />
        <div className="grid grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-gray-200 rounded-xl" />)}
        </div>
      </div>
    </div>
  )

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Welcome back! Here&apos;s what&apos;s happening with your courses.</p>
        </div>
        <Link href="/dashboard/courses/new"
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm">
          <Plus className="w-4 h-4" /> New course
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <div className={"w-10 h-10 rounded-xl flex items-center justify-center mb-4 bg-" + color + "-50"}>
              <Icon className={"w-5 h-5 text-" + color + "-600"} />
            </div>
            <div className="text-2xl font-bold text-gray-900">{value}</div>
            <div className="text-sm text-gray-500 mt-1">{label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Recent Courses</h2>
          <Link href="/dashboard/courses" className="text-sm text-indigo-600 hover:underline">View all</Link>
        </div>
        {recentCourses.length === 0 ? (
          <div className="p-12 text-center">
            <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-4">No courses yet. Create your first one!</p>
            <Link href="/dashboard/courses/new"
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium">
              <Plus className="w-4 h-4" /> Create course
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentCourses.map((course: any) => (
              <div key={course.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 text-sm">{course.title}</div>
                    <div className="text-xs text-gray-400">{course.student_count || 0} students</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={"text-xs px-2 py-0.5 rounded-full font-medium " +
                    (course.is_published ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500")}>
                    {course.is_published ? "Published" : "Draft"}
                  </span>
                  <Link href={"/dashboard/courses/" + course.id}
                    className="text-xs text-indigo-600 hover:underline">Edit</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
