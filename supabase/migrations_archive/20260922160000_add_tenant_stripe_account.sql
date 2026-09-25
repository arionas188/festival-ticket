-- Stripe Connect (Standard accounts) — κάθε tenant συνδέει το ΔΙΚΟ ΤΟΥ
-- Stripe account στο Concerto. Η πλατφόρμα ΔΕΝ κρατάει προμήθεια προς το
-- παρόν (0% -- ρητή απόφαση χρήστη, 22/9) και δεν αγγίζει καθόλου τα
-- χρήματα του tenant: direct charge, ο fan πληρώνει κατευθείαν στο
-- connected account, εμείς μόνο κρατάμε reference στο ποιο account
-- ανήκει σε ποιο tenant.
--
-- stripe_account_id: το Stripe account id (acct_...) που επιστρέφεται
-- μετά το "Create an account" API call (type=standard). NULL μέχρι ο
-- tenant να ξεκινήσει το Connect Onboarding flow.
--
-- stripe_charges_enabled: snapshot του "charges_enabled" flag του Stripe
-- account, ενημερώνεται μέσω account.updated webhook. Το UI βασίζεται σε
-- αυτό (όχι σε live Stripe API call) για να αποφασίσει αν να δείξει
-- "ολοκλήρωσε το onboarding" -- ίδιο μοτίβο με το stripe_account_id, ένα
-- σημείο αλήθειας στη δική μας βάση, ενημερωμένο μέσω webhook.
alter table public.tenant_settings
  add column stripe_account_id text,
  add column stripe_charges_enabled boolean not null default false;

-- Ένα Stripe account δεν πρέπει να συνδεθεί σε δύο διαφορετικά tenants
-- ταυτόχρονα (θα μπέρδευε ποιος παίρνει τα λεφτά).
create unique index idx_tenant_settings_stripe_account_id
  on public.tenant_settings (stripe_account_id)
  where stripe_account_id is not null;
