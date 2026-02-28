import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase'

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null) || await req.formData().catch(() => null)
    let course_id: string, student_email: string

    if (body instanceof FormData) {
      course_id = body.get('course_id') as string
      student_email = body.get('student_email') as string || ''
    } else {
      course_id = body?.course_id
      student_email = body?.student_email || ''
    }

    const supabase = createClient()
    const { data: course } = await supabase.from('courses').select('*').eq('id', course_id).single()

    if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 })

    if (course.price === 0) {
      return NextResponse.redirect(new URL(`/learn/${course.slug}`, req.url))
    }

    if (!stripe) return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: course.title, description: course.description || '' },
          unit_amount: Math.round(course.price * 100),
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/learn/${course.slug}?success=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/c/${course.slug}`,
      customer_email: student_email || undefined,
      metadata: { course_id, student_email },
    })

    return NextResponse.redirect(session.url!)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
