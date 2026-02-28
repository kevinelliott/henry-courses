import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key"
)

const tools = [
  {
    name: "list_courses",
    description: "List all published courses",
    inputSchema: {
      type: "object",
      properties: {
        category: { type: "string", description: "Filter by category" },
        limit: { type: "number", description: "Max results (default 20)" },
      },
    },
  },
  {
    name: "get_course",
    description: "Get detailed info about a course including sections and lessons",
    inputSchema: {
      type: "object",
      properties: { slug: { type: "string", description: "Course slug" } },
      required: ["slug"],
    },
  },
  {
    name: "list_students",
    description: "List students enrolled in a course",
    inputSchema: {
      type: "object",
      properties: { course_id: { type: "string", description: "Course UUID" } },
      required: ["course_id"],
    },
  },
  {
    name: "get_progress",
    description: "Get a student's progress in a course",
    inputSchema: {
      type: "object",
      properties: {
        enrollment_id: { type: "string", description: "Enrollment UUID" },
      },
      required: ["enrollment_id"],
    },
  },
]

async function handleTool(name: string, input: any) {
  switch (name) {
    case "list_courses": {
      let query = supabase.from("courses").select("id, title, slug, description, price, category, student_count, thumbnail_url").eq("is_published", true).limit(input.limit || 20)
      if (input.category) query = query.eq("category", input.category)
      const { data, error } = await query
      if (error) throw new Error(error.message)
      return data
    }
    case "get_course": {
      const { data, error } = await supabase
        .from("courses")
        .select("*, sections(*, lessons(id, title, video_url, position, duration_minutes))")
        .eq("slug", input.slug)
        .eq("is_published", true)
        .single()
      if (error) throw new Error(error.message)
      return data
    }
    case "list_students": {
      const { data, error } = await supabase
        .from("enrollments")
        .select("id, student_email, status, enrolled_at")
        .eq("course_id", input.course_id)
        .eq("status", "active")
      if (error) throw new Error(error.message)
      return data
    }
    case "get_progress": {
      const { data, error } = await supabase
        .from("progress")
        .select("lesson_id, completed_at")
        .eq("enrollment_id", input.enrollment_id)
      if (error) throw new Error(error.message)
      return data
    }
    default:
      throw new Error("Unknown tool: " + name)
  }
}

export async function GET() {
  return NextResponse.json({
    name: "henry-courses",
    version: "1.0.0",
    description: "Henry Courses MCP API — online course platform",
    tools,
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tool, input } = body

    if (!tool) {
      return NextResponse.json({
        error: "Missing tool name",
        available_tools: tools.map(t => t.name),
      }, { status: 400 })
    }

    const result = await handleTool(tool, input || {})
    return NextResponse.json({ tool, result })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
