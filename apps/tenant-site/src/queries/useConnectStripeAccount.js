import { useMutation } from "@tanstack/react-query"
import { supabase } from "../lib/supabase"

// Ξεκινάει το Stripe Connect Onboarding flow (Standard account) για τον
// tenant: καλεί τη δική μας Netlify Function (ΟΧΙ απευθείας το Stripe API
// από τον browser — το secret key ΔΕΝ πρέπει ποτέ να φτάσει εδώ), η οποία
// δημιουργεί (ή ξαναχρησιμοποιεί, αν υπάρχει ήδη) το connected account
// του tenant και επιστρέφει ένα Stripe-hosted onboarding link. Μόλις
// έρθει το link, κάνουμε redirect εκεί -- ο tenant συμπληρώνει τα
// στοιχεία του πάνω στο ίδιο το Stripe, όχι σε δική μας φόρμα.
//
// ⚠️ TODO: η ίδια η Netlify Function δεν έχει χτιστεί ακόμα -- εκκρεμεί
// απόφαση ΠΟΥ ακριβώς θα ζει (βλ. συζήτηση 22/9, task #29/#31) + τα
// πραγματικά Stripe test keys.
export function useConnectStripeAccount() {
  return useMutation({
    mutationFn: async ({ tenantId }) => {
      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData?.session?.access_token
      if (!accessToken) {
        throw new Error("Πρέπει να είσαι συνδεδεμένος για να συνδέσεις Stripe account.")
      }

      const response = await fetch("/.netlify/functions/stripe-connect-onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ tenantId }),
      })

      if (!response.ok) {
        const body = await response.json().catch(() => null)
        throw new Error(body?.error || "Κάτι πήγε στραβά με τη σύνδεση Stripe.")
      }

      const { url } = await response.json()
      return url
    },
    onSuccess: (url) => {
      window.location.href = url
    },
  })
}
