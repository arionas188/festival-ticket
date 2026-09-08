-- Fan Dashboard — προφίλ fan (βλ. concerto-react-router-brief.md, "Fan
-- Dashboard").
--
-- Πρόβλημα: κάθε login (useFanSession.js / useFollowAllTenants.js, μέσω
-- του κοινού πλέον syncFanFromAuth.js) έκανε upsert στο
-- fans.full_name/avatar_url ΑΝΕΥ ΟΡΩΝ, απευθείας από το Google
-- user_metadata. Αν ο fan επεξεργαστεί μόνος του το προφίλ του (Fan
-- Dashboard → Προφίλ), το επόμενο login του θα το ξανάγραφε πάνω από τη
-- δική του αλλαγή — bug πριν καν φτιαχτεί το feature.
--
-- Λύση: boolean flag. Όσο είναι false: login συνεχίζει να συγχρονίζει
-- full_name/avatar_url από το Google (ίδια συμπεριφορά με πριν) και
-- εμφανίζεται κόκκινο badge "1" στο ConcertoBar avatar + κόκκινο "Προφίλ"
-- στο dropdown (βλ. src/components/Concerto/ConcertoBar.jsx). Μόλις ο fan
-- αποθηκεύσει πραγματική αλλαγή, γίνεται true: το login σταματά να πατάει
-- πάνω στις δικές του αλλαγές, και το badge σβήνει μόνιμα.
alter table public.fans
  add column if not exists profile_customized boolean not null default false;
