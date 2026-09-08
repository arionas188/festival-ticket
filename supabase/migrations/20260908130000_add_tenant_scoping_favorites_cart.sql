-- BUG FIX (8/9): favorites και cart_items ήταν scoped ΜΟΝΟ ανά fan_id, χωρίς
-- tenant_id — στην πράξη ένα ενιαίο, κοινό καλάθι/αγαπημένα σε όλη την
-- πλατφόρμα, ενώ το UI (κάθε tenant's TenantTopBar/FavoritesDialog/
-- CartDialog) τα παρουσιάζει σαν να είναι ξεχωριστά ανά tenant. Live-
-- επιβεβαιωμένο bug: προϊόντα favorited/στο καλάθι από τον Villagers
-- εμφανίζονταν και στο Athens Rock Festival.
--
-- Πρόθεση αρχιτεκτονικής (επιβεβαιωμένη από τον χρήστη): ανά tenant, τα
-- favorites/cart/favorite events είναι ΕΙΔΙΚΑ ΚΑΙ ΜΟΝΑΔΙΚΑ σε αυτόν· στο
-- Fan Dashboard (global, /account) εμφανίζονται ΟΛΑ μαζί, συγκεντρωτικά
-- (ήδη υλοποιημένο εκεί — useFanFavoriteMerch.js/useFanFavoriteEvents.js
-- ΔΕΝ φιλτράρουν ανά tenant, επίτηδες).
--
-- tenant_id backfill από τα ήδη υπάρχοντα products (κάθε προϊόν ανήκει σε
-- ΕΝΑ tenant πάντα) πριν γίνει not null.
alter table public.favorites add column tenant_id uuid references public.tenants(id);
update public.favorites f
set tenant_id = p.tenant_id
from public.products p
where p.id = f.product_id and f.tenant_id is null;
alter table public.favorites alter column tenant_id set not null;

alter table public.cart_items add column tenant_id uuid references public.tenants(id);
update public.cart_items c
set tenant_id = p.tenant_id
from public.products p
where p.id = c.product_id and c.tenant_id is null;
alter table public.cart_items alter column tenant_id set not null;
