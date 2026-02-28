import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase'

export async function POST(req: Request) {
  if (!stripe) return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })

  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: any
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET || '')
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const { course_id, student_email } = session.metadata || {}
    if (course_id) {
      const supabase = createClient()
      const { data: course } = await supabase.from('courses').select('user_id').eq('id', course_id).single()
      await supabase.from('enrollments').insert({
        course_id, student_email, stripe_session_id: session.id,
        instructor_id: course?.user_id, status: 'active'
      })
      await supabase.from('courses').update({ student_count: supabase.from('courses').select('student_count') }).eq('id', course_id)
    }
  }

  return NextResponse.json({ received: true })
}
