import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

// POST /.netlify/functions/stripe-connect-onboarding
// Body: { tenantId }. Header: Authorization: Bearer <fan access token>.
//
// Δημιουργεί (ή ξαναχρησιμοποιεί) το Stripe connected account (Standard)
// ΑΥΤΟΥ του tenant και επιστρέφει ένα Account Link URL για Stripe-hosted
// onboarding. Connect Onboarding, ΟΧΙ OAuth (το Stripe δεν το συστήνει
// πλέον για νέες πλατφόρμες -- βλ. συζήτηση 22/9). 0% προμήθεια πλατφόρμας
// προς το παρόν -- direct charge αργότερα στο checkout, χωρίς
// application_fee_amount.
//
// ΚΑΝΕΝΑ service role key εδώ -- σκόπιμα. Ο client παρακάτω είναι scoped
// στο ΔΙΚΟ ΤΟΥ token του καλούντος (ίδιο anon key με το frontend), άρα
// ΚΑΘΕ query/update περνάει από το ΙΔΙΟ RLS που ήδη προστατεύει
// tenant_admins/tenant_settings -- ίδια φιλοσοφία με όλο το υπόλοιπο
// project, ένα σημείο αλήθειας.
export default async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const authHeader = req.headers.get('Authorization') || ''
  const accessToken = authHeader.replace(/^Bearer\s+/i, '')
  if (!accessToken) {
    return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  let tenantId
  try {
    const body = await req.json()
    tenantId = body?.tenantId
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  if (!tenantId) {
    return new Response(JSON.stringify({ error: 'Missing tenantId' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY,
    { global: { headers: { Authorization: `Bearer ${accessToken}` } } }
  )

  // Ποιος πραγματικά είναι ο καλών (validated από το ίδιο το Supabase Auth,
  // ΟΧΙ decode του JWT εμείς) -- χρειάζεται το πραγματικό user id για τον
  // admin έλεγχο παρακάτω.
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData?.user) {
    return new Response(JSON.stringify({ error: 'Μη έγκυρο session.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Ίδιος έλεγχος με useIsTenantAdmin.js (client-side), εδώ server-side --
  // ΜΟΝΟ πραγματικός admin αυτού του tenant προχωράει. tenant_settings
  // είναι δημόσια αναγνώσιμο (ίδιο με bio/logo_url), οπότε ΔΕΝ αρκεί από
  // μόνο του σαν admin-check -- το tenant_admins είναι το πραγματικό
  // σημείο αλήθειας.
  const { data: adminRow, error: adminError } = await supabase
    .from('tenant_admins')
    .select('tenant_id')
    .eq('tenant_id', tenantId)
    .eq('user_id', userData.user.id)
    .maybeSingle()

  if (adminError || !adminRow) {
    return new Response(
      JSON.stringify({ error: 'Δεν επιτρέπεται η σύνδεση Stripe για αυτό το tenant.' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const { data: settings, error: settingsError } = await supabase
    .from('tenant_settings')
    .select('stripe_account_id')
    .eq('tenant_id', tenantId)
    .single()

  if (settingsError) {
    return new Response(JSON.stringify({ error: 'Tenant δεν βρέθηκε.' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
  const origin = req.headers.get('origin') || new URL(req.url).origin

  let accountId = settings.stripe_account_id

  // Νέο connected account ΜΟΝΟ αν δεν υπάρχει ήδη ένα -- ξαναπατώντας το
  // κουμπί (π.χ. μετά από refresh_url) ξαναχρησιμοποιεί το ίδιο account,
  // δεν δημιουργεί δεύτερο.
  if (!accountId) {
    const account = await stripe.accounts.create({ type: 'standard' })
    accountId = account.id

    const { error: updateError } = await supabase
      .from('tenant_settings')
      .update({ stripe_account_id: accountId })
      .eq('tenant_id', tenantId)

    if (updateError) {
      return new Response(
        JSON.stringify({ error: 'Αποτυχία αποθήκευσης του Stripe account.' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }
  }

  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${origin}/account/stripe`,
    return_url: `${origin}/account/stripe`,
    type: 'account_onboarding',
  })

  return new Response(JSON.stringify({ url: accountLink.url }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
