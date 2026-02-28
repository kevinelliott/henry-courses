import { NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: NextRequest) {
  if (!stripe) return NextResponse.json({ error: "Stripe not configured" }, { status: 400 })

  const body = await request.text()
  const sig = request.headers.get("stripe-signature")!
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  let event: any
  try {
    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
    } else {
      event = JSON.parse(body)
    }
  } catch (err: any) {
    return NextResponse.json({ error: "Webhook error: " + err.message }, { status: 400 })
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object
    const { course_id, instructor_id } = session.metadata || {}
    const customerEmail = session.customer_details?.email || session.customer_email

    if (course_id && instructor_id && customerEmail) {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key"
      )

      await supabase.from("enrollments").insert({
        course_id,
        instructor_id,
        student_email: customerEmail,
        stripe_session_id: session.id,
        status: "active",
      })
    }
  }

  return NextResponse.json({ received: true })
}
