# Concerto — Πρότυπα (patterns) για Φόρμες & Κρυπτογράφηση ευαίσθητων δεδομένων

> **Τι είναι αυτό:** ΞΕΧΩΡΙΣΤΟ doc από τα άλλα briefs. Εκείνα καταγράφουν
> "τι χτίστηκε πότε και γιατί" (χρονολογικό log). Αυτό εδώ είναι
> ΕΠΑΝΑΧΡΗΣΙΜΟΠΟΙΗΣΙΜΟ σημείο αναφοράς — ΤΟ ΠΡΟΤΥΠΟ που ακολουθούμε κάθε
> φορά που φτιάχνουμε (α) μια φόρμα με validation, ή (β) αποθήκευση
> ευαίσθητων προσωπικών δεδομένων. Χρειάστηκε πρώτη φορά στο Fan Dashboard
> (9/9), αλλά θα ξαναχρησιμοποιηθεί σίγουρα στο Tenant Admin Dashboard και
> στο Concerto/platform Admin Dashboard — γι' αυτό ζωντανό, ξεχωριστό doc.

---

## Μέρος Α: Φόρμες με validation

### Τι χρησιμοποιούμε
**react-hook-form** (διαχείριση φόρμας/state) + **zod** (schema validation) +
**@hookform/resolvers/zod** (το "κόλλημα" ανάμεσά τους). Αυτός είναι ο πιο
mainstream/"επίσημος" συνδυασμός στο σημερινό React ecosystem για φόρμες —
όχι κάτι Concerto-specific, είναι ο συνδυασμός που προτείνεται ευρέως και
που ταιριάζει ήδη με τα primitives που είχαμε εγκατεστημένα (`shadcn`'s
`Field`/`FieldLabel`/`FieldError` στο `src/components/ui/field.jsx` — το
`FieldError` δέχεται ήδη array of `errors` στο ίδιο σχήμα που παράγει το
react-hook-form, ήταν βασικά "έτοιμο" γι' αυτό).

Γιατί ΟΧΙ κάτι άλλο: Formik είναι σε συντήρηση/λιγότερο ενεργό πλέον· απλό
`useState` ανά πεδίο (ό,τι κάναμε ΠΡΙΝ, με uncontrolled `defaultValue`+
`FormData`) δουλεύει για ΠΟΛΥ απλές φόρμες (1-2 πεδία, χωρίς πολύπλοκο
validation) αλλά γίνεται δυσκίνητο μόλις μπουν πολλά πεδία + μηνύματα
σφάλματος + διαφορετικοί τύποι input (Select, multi-select κλπ) — αυτό
ακριβώς ήταν η περίπτωση της πλήρους φόρμας προφίλ fan.

### Πρώτη εγκατάσταση (έγινε ήδη, 9/9)
```
npm install react-hook-form zod @hookform/resolvers
```

### Το πρότυπο (βήματα για ΚΑΘΕ νέα φόρμα)
1. **Schema file** (`src/lib/<όνομα>Schema.js`) — ένα `z.object({...})` με
   ΟΛΑ τα πεδία + validation rules + μηνύματα σφάλματος ΣΤΑ ΕΛΛΗΝΙΚΑ (το
   μήνυμα του `z.string().min(1, "...")` είναι αυτό που βλέπει ο χρήστης).
   Παράδειγμα ζωντανό: `src/lib/fanProfileSchema.js`.
2. **Component**:
   ```jsx
   const { register, control, handleSubmit, reset, formState: { errors } } = useForm({
     resolver: zodResolver(mySchema),
     defaultValues: { ... },
   })
   ```
   - Πεδία απλού κειμένου/αριθμού/date (`Input`, `Textarea`): `{...register("fieldName")}`
     — ΔΕΝ χρειάζεται `useState`, το react-hook-form δουλεύει uncontrolled
     πάνω στο native `ref` (γι' αυτό δουλεύει κατευθείαν με τα δικά μας
     `Input`/`Textarea` — React 19 περνάει το `ref` σαν κανονικό prop, δεν
     χρειάστηκε καν `forwardRef`).
   - Πεδία με δικό τους "controlled" API (`Select`, multi-select chips,
     οτιδήποτε δεν είναι native `<input>`): `<Controller name="..." control={control} render={({field}) => ...} />`.
   - Loading async δεδομένα (π.χ. από RPC) μέσα στη φόρμα: `reset(data)` σε
     ένα `useEffect` όταν έρθουν τα δεδομένα — ΟΧΙ `setState` πάνω σε κάθε
     πεδίο ξεχωριστά (αυτό θα ξανάπεφτε στο ίδιο `react-hooks/set-state-in-effect`
     lint πρόβλημα που είχαμε παλιά, βλ. `concerto-react-router-brief.md`,
     "Fan Dashboard v1").
3. **Submit**: `<form onSubmit={handleSubmit(onSubmit)}>` — το `onSubmit`
   παίρνει ΗΔΗ validated values, καμία χειροκίνητη επαλήθευση χρειάζεται.
4. **Errors στο UI**: `<FieldError errors={errors.fieldName ? [errors.fieldName] : undefined} />`
   κάτω από κάθε `Field`/`Input` — ήδη styled, uses `data-invalid` στο `Field`.

### Ζωντανό παράδειγμα
`src/components/Concerto/FanDashboard/FanProfileRoute.jsx` (9/9) — 8 πεδία,
μείγμα text/date/tel/multi-select chips/Select dropdown, ένα ενιαίο submit.

### Νέο UI primitive που προστέθηκε: `Select`
Δεν υπήρχε `select.jsx` στο project (μόνο `dropdown-menu.jsx`). Το
`shadcn` CLI (`npx shadcn add select`) ΔΕΝ δουλεύει σε αυτό το sandboxed
περιβάλλον (μπλοκάρεται το `ui.shadcn.com` από το egress allowlist) — το
`src/components/ui/select.jsx` γράφτηκε χειροκίνητα, ίδιο pattern/στυλ με
τα υπόλοιπα `ui/*.jsx` (`radix-ui` package, `cn()`, `data-slot` attributes).
Αν χρειαστεί κι άλλο shadcn component στο μέλλον σε sandboxed session,
ίδια λύση: χειροκίνητο, ακολουθώντας το ίδιο στυλ με τα υπάρχοντα.

---

## Μέρος Β: Κρυπτογράφηση ευαίσθητων προσωπικών δεδομένων

### Πότε το χρησιμοποιούμε
ΚΑΘΕ φορά που αποθηκεύουμε στοιχείο που αναγνωρίζει ή αφορά προσωπικά ένα
πραγματικό άνθρωπο — όνομα, επίθετο, email, τηλέφωνο, ημ. γέννησης, πόλη
κατοικίας, display name/alias. ΟΧΙ για προτιμήσεις/στατιστικά δεδομένα
χωρίς αναγνωριστική αξία από μόνα τους (π.χ. "αγαπημένο είδος μουσικής",
"αγαπημένο tenant") — αυτά μένουν ΑΠΛΑ, plain columns, γιατί είναι πιο
χρήσιμα αναζητήσιμα (στατιστικά ανά tenant, recommendations) και δεν
αποκαλύπτουν ταυτότητα από μόνα τους. Απόφαση χρήστη, ρητά επιβεβαιωμένη
με AskUserQuestion στις 9/9.

### Ο μηχανισμός (Vault + pgcrypto + SECURITY DEFINER RPC)
1. **Ένα key, μία φορά, ΓΙΑ ΟΛΟ το project** — `fan_pii_encryption_key`,
   ζει στο Supabase Vault (`vault.secrets`/`vault.decrypted_secrets`).
   ΔΕΝ φτιάχνουμε νέο key ανά feature/table — το ΙΔΙΟ key χρησιμοποιείται
   παντού. Δημιουργήθηκε στο migration `20260909100000` — βλ. αυτό ΠΡΩΤΑ
   αν ξεκινάς από το μηδέν.
2. **Ξεχωριστό table από το "κύριο" table της οντότητας** — π.χ.
   `fan_private_details` (fan_id PK/FK), ΟΧΙ νέες encrypted στήλες πάνω
   στο ίδιο το `fans`. RLS (`auth.uid() = fan_id`) ΕΠΙΠΛΕΟΝ της
   encryption — defense-in-depth, δύο ανεξάρτητα επίπεδα.
3. **ΔΥΟ SECURITY DEFINER functions ανά "φόρμα"** (όχι ανά πεδίο) —
   `get_own_<κάτι>()` (διάβασμα, αποκρυπτογραφημένο) και
   `set_own_<κάτι>(...)` (γράψιμο, κρυπτογραφημένο). Και οι δύο:
   - `security definer` + `set search_path = public, vault, extensions`
     (το `pgcrypto` ζει στο schema `extensions` στα Supabase-managed
     projects, το `vault` στο δικό του schema).
   - `auth.uid()` ΜΟΝΟ — ΠΟΤΕ παράμετρος `fan_id`/`user_id` από τον
     client. Δομικά αδύνατο να διαβάσεις/γράψεις πάνω σε άλλον χρήστη,
     ΑΝΕΞΑΡΤΗΤΑ από RLS (άμυνα ακόμα κι αν το RLS είχε bug).
   - `grant execute ... to authenticated` + `revoke execute ... from anon`.
4. **Client**: ΠΟΤΕ `.from("table").select/insert/update` απευθείας πάνω
   στο encrypted table — ΠΑΝΤΑ `supabase.rpc("get_own_...")` /
   `supabase.rpc("set_own_...")`. Το plaintext ΔΕΝ περνάει ποτέ μέσα από
   client-side encrypt/decrypt κώδικα — όλο το encrypt/decrypt γίνεται
   ΜΕΣΑ στη function, server-side.

### Ζωντανά παραδείγματα (ίδιο pattern, 3 φορές μέχρι στιγμής)
- `get/set_own_fan_private_details` (ημ. γέννησης/πόλη) — migration `20260909100000`.
- `get/set_own_fan_identity` + `sync_own_fan_from_auth` (email/full_name/avatar_url) — migration `20260909110000`.
- `get/set_own_fan_full_profile` (πλήρης φόρμα: όνομα/επίθετο/display name/τηλέφωνο/ημ. γέννησης/πόλη) — migration `20260909120000`. Aυτή είναι πλέον η ΚΥΡΙΑ, ενοποιημένη — οι δύο παραπάνω για dob/city παραμένουν στη βάση αλλά ο client δεν τις καλεί πια.

### ⚠️ Δύο δομικοί περιορισμοί — ΝΑ ΤΟΥΣ ΘΥΜΟΜΑΣΤΕ ΠΑΝΤΑ, σε κάθε νέο dashboard
1. **Δεν κρύβει δεδομένα από τον admin του project.** Ο owner/admin
   ελέγχει το Vault key και το SQL editor — μπορεί πάντα να αποκρυπτογραφήσει.
   Προστατεύει από EXTERNAL leak/hack (leaked anon key, RLS bug), ΟΧΙ από
   εσωτερική πρόσβαση admin. Πραγματικό "ούτε ο admin δεν βλέπει" θα
   χρειαζόταν end-to-end/zero-knowledge encryption (key ΜΟΝΟ στη συσκευή
   του χρήστη) — συζητήθηκε, ΔΕΝ επιλέχθηκε (μόνιμη απώλεια δεδομένων σε
   αλλαγή συσκευής, καμία server-side χρήση, μεγάλη πολυπλοκότητα).
2. **Το `auth.users` (Supabase Auth) παραμένει ΠΑΝΤΑ plaintext.**
   Ό,τι κι αν κρυπτογραφήσουμε στα δικά μας tables, το ίδιο το Supabase
   Auth κρατάει email/όνομα/avatar plaintext (το χρειάζεται για να
   δουλέψει το OAuth login) — ορατό από Authentication → Users στο
   dashboard. Αυτό ισχύει για ΚΑΘΕ dashboard/entity type (fans, μελλοντικά
   tenant admins κλπ), όχι μόνο για fans.

### Ειδική περίπτωση: μοναδικότητα πάνω σε encrypted πεδίο
⚠️ **Ενημέρωση (9/9):** το display name, το αρχικό παράδειγμα αυτής της ενότητας, ΤΕΛΙΚΑ έγινε ΑΠΛΟ πεδίο (όχι encrypted) — ο χρήστης προτίμησε ρητά ένα πραγματικό DB unique index (instant, καμία περίπτωση race condition) αντί για το decrypt-and-compare pattern παρακάτω, ειδικά επειδή ήθελε στιγμιαίο έλεγχο ακόμα και σε αιχμή κίνησης (πολλοί fans ταυτόχρονα). Η ενότητα παρακάτω παραμένει ως πρότυπο ΓΙΑ ΤΗΝ ΠΕΡΙΠΤΩΣΗ που κάποιο ΑΛΛΟ πεδίο ΠΡΕΠΕΙ να μείνει κρυπτογραφημένο ΚΑΙ χρειάζεται μοναδικότητα ταυτόχρονα — τότε αυτό το tradeoff (αργύτερο αλλά χωρίς κανένα plaintext-adjacent lookup) ξαναμπαίνει στο τραπέζι.
Η pgcrypto προσθέτει τυχαιότητα σε κάθε `pgp_sym_encrypt` — ΔΕΝ γίνεται SQL
`unique` constraint ή απλή ισότητα πάνω στη encrypted στήλη (ποτέ δύο
encryptions του ίδιου plaintext δεν είναι bit-for-bit ίδιες). ΜΗΝ προσθέσεις
plain/hashed "lookup" στήλη με το plaintext (ή κάτι κοντά σε αυτό) δίπλα —
θα ακύρωνε μερικώς την encryption. Λύση: μια ξεχωριστή SECURITY DEFINER
function (`check_own_<πεδίο>_available(value)`) που αποκρυπτογραφεί ΟΛΕΣ
τις σχετικές γραμμές server-side και συγκρίνει σε plaintext ΜΕΣΑ στη
function — καλείται (α) live από το UI για UX feedback, (β) ΞΑΝΑ μέσα στο
ίδιο το `set_own_...` function πριν το save (defense in depth, κλείνει το
race condition ανάμεσα σε δύο ταυτόχρονα saves όσο γίνεται χωρίς πραγματικό
DB constraint). Ζωντανό παράδειγμα: `check_own_display_name_available()`,
migration `20260909130000`. **Scaling TODO:** αυτό κάνει decrypt ΟΛΩΝ των
γραμμών σε κάθε έλεγχο — μια χαρά για δεκάδες/εκατοντάδες fans, αλλά αν το
project μεγαλώσει πολύ (χιλιάδες) θα χρειαστεί επανεξέταση για ταχύτητα
(π.χ. hashed lookup column) — ΟΧΙ επείγον τώρα.

### Πότε ΔΕΝ χρειάζεται αυτό το pattern
Δημόσια δεδομένα (tenant name/slug, event/product info), λειτουργικά
flags (`profile_customized`, `favorite_tenant_id`, `favorite_genres`) —
απλό RLS (`auth.uid() = owner_column`) αρκεί, ίδιο επίπεδο με το βασικό
project pattern (βλ. RLS audit στο `concerto-brief.md`).

---

## Οδηγία προς AI assistant (Claude ή άλλο)

> Πριν φτιάξεις ΝΕΑ φόρμα ή αποθηκεύσεις ΝΕΟ ευαίσθητο προσωπικό πεδίο
> (σε ΟΠΟΙΟΔΗΠΟΤΕ dashboard — Tenant Admin, Concerto Admin, ό,τι έρθει),
> διάβασε ΠΡΩΤΑ αυτό το doc. Αν προσθέσεις κάτι νέο στο ίδιο pattern
> (νέο encrypted table, νέα σημαντική λεπτομέρεια για forms), ενημέρωσέ
> το εδώ — ΟΧΙ μόνο στο χρονολογικό brief της ημέρας, ώστε το πρότυπο να
> μένει ένα, ενημερωμένο σημείο αναφοράς.
