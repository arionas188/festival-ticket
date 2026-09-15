import { Link } from "react-router-dom"

// 15/9, ρητό αίτημα χρήστη: ενιαίο breadcrumb σε ΟΛΕΣ τις σελίδες του merch
// (πριν υπήρχε μόνο στο ProductOverviewRoute.jsx/CartRoute.jsx, καθόλου στο
// /merch ή στο /merch/category/:key — "λείπει αυτό" στο πρώτο screenshot).
// Ένα κοινό component, ίδιο μοτίβο με τα άλλα shared bits (stockTiers.js,
// checkoutErrors.js, merchCategories.js) — ώστε το στυλ/η συμπεριφορά να
// μην ξαναδιαφωνήσει μεταξύ σελίδων.
//
// ΚΑΘΕ crumb είναι πραγματικό <Link>, ΑΚΟΜΑ και το τελευταίο (τρέχουσα
// σελίδα) — ρητό αίτημα χρήστη: στο ίδιο το /merch, το "Merch Store" πρέπει
// να δείχνει "είσαι εδώ" ΚΑΙ να είναι clickable (σαν refresh). Το ίδιο
// μοτίβο κρατήθηκε παντού για συνέπεια, αντί το τελευταίο crumb να γίνει
// ειδική περίπτωση (plain text, μη-clickable) όπως σε πιο τυπικά breadcrumbs.
//
// 15/9, δεύτερο ρητό αίτημα χρήστη (screenshot ενός "board" από κύκλους
// icons ως οπτικό παράδειγμα σχήματος): το breadcrumb γίνεται ένα "board"
// (στρογγυλό pill) που:
//  - ΜΕΓΑΛΩΝΕΙ σε πλάτος καθώς αυξάνεται η διαδρομή (περισσότερα crumbs).
//    Αυτό είναι φυσικό αποτέλεσμα του να είναι w-fit/inline (όχι σταθερό
//    πλάτος block) — δεν χρειάζεται καμία ειδική λογική, μεγαλώνει μόνο
//    του όσο μεγαλώνει το περιεχόμενο.
//  - sticky (top-0): μπαίνει ακριβώς κάτω από τη γραμμή των tabs
//    (Πληροφορίες/Εκδηλώσεις/Merch Store, βλ. Header.jsx) — η φυσική του
//    θέση, μιας και είναι το πρώτο πράγμα σε κάθε merch-σελίδα — και ΜΕΝΕΙ
//    εκεί (ίδιο ύψος) καθώς ο χρήστης σκρολάρει ψάχνοντας προϊόντα, αντί
//    να φεύγει μαζί με το περιεχόμενο.
//  - backdrop-blur + ημιδιάφανο φόντο: ό,τι περνάει από πίσω του καθώς
//    σκρολάρεις (κάρτες προϊόντων, φωτογραφίες) φαίνεται θολό, όχι
//    τελείως κρυμμένο — ρητό αίτημα χρήστη ("να φαίνεται τι είναι και
//    από πίσω του").
//
// 15/9, τρίτο ρητό αίτημα χρήστη: κεντραρισμένο οριζόντια, ΚΑΙ να μεγαλώνει
// συμμετρικά γύρω από το κέντρο (όχι από αριστερά προς τα δεξιά) καθώς
// αυξάνεται η διαδρομή. Το nav γίνεται flex+justify-center σε όλο το
// διαθέσιμο πλάτος — το ίδιο το pill (<ol>) παραμένει w-fit/αυτόματου
// πλάτους μέσα του, οπότε το justify-center το κεντράρει ξανά αυτόματα σε
// κάθε αλλαγή πλάτους, χωρίς άλλη λογική.
//
// 15/9, τέταρτο ρητό αίτημα χρήστη (screenshot: 3 crumbs σε στενό κινητό
// έσπαγαν σε 2 γραμμές, "δεν θέλω να αλλάζει γραμμή"): αφαιρέθηκε το
// flex-wrap (ήταν αυτό που έσπαγε σε 2ο row) — μαζί με 2 ασφαλιστικές
// δικλείδες ώστε να ΜΗΝ σπάει η σελίδα ΟΥΤΕ σε ακραία στενή οθόνη/πολύ
// μεγάλο όνομα προϊόντος:
//  - μικρότερη γραμματοσειρά σε κινητό (text-xs, sm:text-sm) — ό,τι
//    ζήτησε ο χρήστης.
//  - overflow-x-auto + whitespace-nowrap στο ίδιο το pill: αν παρ' όλα
//    αυτά η διαδρομή είναι πολύ πλατιά για την οθόνη, το pill σκρολάρει
//    οριζόντια ΜΕΣΑ στον εαυτό του (κρυμμένη scrollbar) αντί να σπάσει σε
//    2η γραμμή ή να ξεχειλίσει έξω από την οθόνη.
//
// props: crumbs = [{ label, to }, ...], τουλάχιστον ένα ("Merch Store").
export default function MerchBreadcrumb({ crumbs }) {
  return (
    <nav aria-label="Breadcrumb" className="sticky top-0 z-20 flex justify-center py-3">
      <ol
        role="list"
        className="flex w-fit max-w-full items-center gap-1.5 overflow-x-auto rounded-full bg-white/80 px-3 py-1.5 text-xs whitespace-nowrap text-gray-500 shadow-sm ring-1 ring-gray-900/5 backdrop-blur-md [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-2 sm:px-4 sm:py-2 sm:text-sm [&::-webkit-scrollbar]:hidden"
      >
        {crumbs.map((crumb, i) => (
          <li key={crumb.to} className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            {i > 0 && <span aria-hidden="true">/</span>}
            <Link
              to={crumb.to}
              className={
                i === crumbs.length - 1
                  ? "font-medium text-gray-900 hover:text-gray-700"
                  : "hover:text-gray-700"
              }
            >
              {crumb.label}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  )
}
