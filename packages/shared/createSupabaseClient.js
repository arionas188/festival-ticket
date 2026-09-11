// Κοινή δημιουργία Supabase client, χρησιμοποιείται από apps/tenant-site
// ΚΑΙ apps/admin-dashboard — ίδιο project, ίδιο auth session (μέσω
// cookieStorage, βλ. cookieStorage.js), ώστε ένας admin που είναι ήδη
// συνδεδεμένος σε ένα tenant site να μη χρειάζεται να ξανακάνει login
// στο dashboard. Κάθε app περνάει τις ΔΙΚΕΣ του env τιμές (ίδιες τιμές
// στην πράξη, απλά το Vite διαβάζει .env per-app-root, όχι κοινόχρηστα).
import { createClient } from '@supabase/supabase-js'
import { cookieStorage } from './cookieStorage.js'

export function createSupabaseClient(url, anonKey) {
  return createClient(url, anonKey, {
    auth: {
      storage: cookieStorage,
    },
  })
}
