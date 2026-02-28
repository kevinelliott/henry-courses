import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function GET() {
  return NextResponse.json({
    name: 'henry-courses-mcp',
    version: '1.0.0',
    tools: [
      { name: 'list_courses', description: 'List all published courses' },
      { name: 'get_course', description: 'Get course details by slug', params: { slug: 'string' } },
      { name: 'list_students', description: 'List all students' },
      { name: 'get_progress', description: 'Get student progress', params: { enrollment_id: 'string' } },
    ]
  })
}

export async function POST(req: Request) {
  const { tool, params } = await req.json()
  const supabase = createClient()

  if (tool === 'list_courses') {
    const { data } = await supabase.from('courses').select('id, title, slug, price, student_count').eq('is_published', true)
    return NextResponse.json({ result: data })
  }
  if (tool === 'get_course') {
    const { data } = await supabase.from('courses').select('*, sections(*, lessons(*))').eq('slug', params.slug).single()
    return NextResponse.json({ result: data })
  }
  if (tool === 'list_students') {
    const { data } = await supabase.from('enrollments').select('*, courses(title)').eq('status', 'active')
    return NextResponse.json({ result: data })
  }
  if (tool === 'get_progress') {
    const { data } = await supabase.from('lesson_progress').select('*').eq('enrollment_id', params.enrollment_id)
    return NextResponse.json({ result: data })
  }

  return NextResponse.json({ error: 'Unknown tool' }, { status: 400 })
}
