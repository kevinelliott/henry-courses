import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function POST(req: Request) {
  const formData = await req.formData()
  const course_id = formData.get('course_id') as string
  const title = formData.get('title') as string
  const supabase = createClient()
  await supabase.from('sections').insert({ course_id, title, position: 0 })
  return NextResponse.redirect(new URL('/dashboard/courses/' + course_id, req.url))
}
