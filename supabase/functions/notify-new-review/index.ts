import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  const payload = await req.json()
  const review = payload.record

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer re_a5if2U4f_9bCLkzMsfjkh7atZ4YzuSi5n',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'RateMyOperator <onboarding@resend.dev>',
      to: 'mtsmith21@gmail.com',
      subject: '✈ New Review Submitted — RateMyOperator',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #1a1d24; color: #fff; padding: 2rem; border-radius: 12px;">
          <h2 style="color: #f0c040; margin-bottom: 0.5rem;">New Review Submitted</h2>
          <p style="color: #9ca3af; margin-bottom: 2rem;">A new review is waiting for your approval on RateMyOperator.</p>
          
          <div style="background: #242830; border-radius: 8px; padding: 1.5rem; margin-bottom: 1.5rem;">
            <p style="margin: 0 0 0.5rem;"><strong style="color: #f0c040;">Operator ID:</strong> ${review.operator_id}</p>
            <p style="margin: 0 0 0.5rem;"><strong style="color: #f0c040;">Safety:</strong> ${review.safety_score}/5</p>
            <p style="margin: 0 0 0.5rem;"><strong style="color: #f0c040;">Service:</strong> ${review.service_score}/5</p>
            <p style="margin: 0 0 0.5rem;"><strong style="color: #f0c040;">Punctuality:</strong> ${review.punctuality_score}/5</p>
            <p style="margin: 0 0 0.5rem;"><strong style="color: #f0c040;">Value:</strong> ${review.value_score}/5</p>
            ${review.tail_number ? `<p style="margin: 0 0 0.5rem;"><strong style="color: #f0c040;">Tail Number:</strong> ${review.tail_number}</p>` : ''}
            ${review.date_flown ? `<p style="margin: 0 0 0.5rem;"><strong style="color: #f0c040;">Date Flown:</strong> ${review.date_flown}</p>` : ''}
            <p style="margin: 1rem 0 0; color: #d1d5db; line-height: 1.6;">"${review.review_text}"</p>
          </div>

          <a href="https://supabase.com/dashboard/project/_/editor" style="display: inline-block; background: #f0c040; color: #1a1d24; padding: 0.75rem 1.5rem; border-radius: 6px; text-decoration: none; font-weight: 700;">
            Approve in Supabase →
          </a>
        </div>
      `,
    }),
  })

  const data = await res.json()
  return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } })
})
