import { createClient } from '@supabase/supabase-js'
import { cookieStorage } from './cookieStorage'


const supabaseUrl = import.meta.env.VITE_SUPABASE_URL

const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY


export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      // Cookie (Domain=.concerto.gr) αντί για το προεπιλεγμένο localStorage,
      // ώστε το session να μοιράζεται σε όλα τα *.concerto.gr subdomains.
      // Βλ. src/lib/cookieStorage.js για το γιατί.
      storage: cookieStorage,
    },
  }
)