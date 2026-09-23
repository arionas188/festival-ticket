import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

// POST /.netlify/functions/stripe-connect-onboarding
// Body: { tenantId }. Header: Authorization: Bearer <fan access token>.
//
// Δημιουργεί (ή ξαναχρησιμοποιεί) το Stripe connected account ΑΥΤΟΥ του
// tenant και επιστρέφει ένα Account Link URL για Stripe-hosted onboarding.
// Connect Onboarding, ΟΧΙ OAuth (το Stripe δεν το συστήνει πλέον για νέες
// πλατφόρμες -- βλ. συζήτηση 22/9). 0% προμήθεια πλατφόρμας προς το
// παρόν -- direct charge αργότερα στο checkout, χωρίς application_fee_amount.
//
// ⚠️ 23/9, ΔΙΟΡΘΩΘΗΚΕ BUG: το Stripe απέσυρε πλέον το Accounts v1 API
// (stripe.accounts.create) για ΝΕΕΣ Connect ενσωματώσεις -- κάθε κλήση
// έσκαγε με StripeInvalidRequestError ("Stripe no longer recommends
// Accounts v1..."). Αντικαταστάθηκε με το Accounts v2 API
// (stripe.v2.core.accounts.create) + Account Links v2
// (stripe.v2.core.accountLinks.create), το επίσημα προτεινόμενο μονοπάτι
// πλέον -- βλ. https://docs.stripe.com/connect/accounts-v2 και
// concerto-brief.md, ενότητα 23/9 debugging.
//
// "dashboard: 'full'" + defaults.responsibilities
// {fees_collector: 'stripe', losses_collector: 'stripe'} = το v2
// ισοδύναμο του παλιού type: 'standard' -- ο tenant διαχειρίζεται μόνος
// του το δικό του πλήρες Stripe dashboard, το Stripe (όχι το Concerto)
// αναλαμβάνει τα fees/τυχόν αρνητικά υπόλοιπα.
//
// ΣΗΜΑΝΤΙΚΟ, ρητή απόφαση εδώ: το v2 API απαιτεί υποχρεωτικά
// identity.country κατά τη δημιουργία (το v1 το άφηνε εντελώς κενό, το
// συμπλήρωνε ο ίδιος ο tenant μέσα στο Stripe onboarding flow) --
// hardcoded "gr" αφού το Concerto απευθύνεται σε Ελληνικά
// συγκροτήματα/artists (τιμές σε €, ελληνικό UI παντού, βλ.
// concerto-brief.md). Αν ποτέ χρειαστεί tenant εκτός Ελλάδας, αυτό θα
// χρειαστεί να γίνει επιλογή στη φόρμα αντί για hardcoded τιμή -- ΔΕΝ το
// χτίζω τώρα, εκτός scope σήμερα. contact_email επίσης υποχρεωτικό πλέον
// -- χρησιμοποιεί το ήδη-επιβεβαιωμένο email του συνδεδεμένου tenant
// admin (userData.user.email παρακάτω), καμία επιπλέον φόρμα χρειάζεται.
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
  // admin έλεγχο παρακάτω, ΚΑΙ το email του για το contact_email του v2
  // Stripe account (βλ. σχόλιο πάνω-πάνω).
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
    const account = await stripe.v2.core.accounts.create({
      contact_email: userData.user.email,
      dashboard: 'full',
      identity: { country: 'gr' },
      configuration: {
        merchant: {
          capabilities: {
            card_payments: { requested: true },
          },
        },
      },
      defaults: {
        responsibilities: {
          fees_collector: 'stripe',
          losses_collector: 'stripe',
        },
      },
    })
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

  // Account Links v2 -- native onboarding flow για v2 accounts,
  // "configurations: ['merchant']" αντιστοιχεί στο configuration.merchant
  // που ζητήσαμε παραπάνω κατά τη δημιουργία.
  const accountLink = await stripe.v2.core.accountLinks.create({
    account: accountId,
    use_case: {
      type: 'account_onboarding',
      account_onboarding: {
        configurations: ['merchant'],
        return_url: `${origin}/account/stripe`,
        refresh_url: `${origin}/account/stripe`,
      },
    },
  })

  return new Response(JSON.stringify({ url: accountLink.url }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
