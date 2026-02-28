import { NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { createServerClient } from "@supabase/ssr"

export async function POST(request: NextRequest) {
  try {
    const body = await request.formData().catch(() => null)
    const courseId = body?.get("courseId") as string || (await request.json().catch(() => ({})))?.courseId

    if (!courseId) {
      return NextResponse.json({ error: "courseId required" }, { status: 400 })
    }

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key",
      { cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} } }
    )

    const { data: course } = await supabase.from("courses").select("*").eq("id", courseId).single()
    if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 })

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

    if (!stripe) {
      return NextResponse.redirect(new URL("/c/" + course.slug, baseUrl))
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [{
        price_data: {
          currency: "usd",
          product_data: {
            name: course.title,
            description: course.description || undefined,
          },
          unit_amount: Math.round((course.price || 0) * 100),
        },
        quantity: 1,
      }],
      metadata: {
        course_id: courseId,
        instructor_id: course.user_id,
      },
      success_url: baseUrl + "/learn/" + course.slug + "?enrolled=true",
      cancel_url: baseUrl + "/c/" + course.slug,
      customer_creation: "always",
      billing_address_collection: "auto",
    })

    return NextResponse.redirect(session.url!, 303)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
