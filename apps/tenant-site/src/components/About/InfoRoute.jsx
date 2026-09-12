import { useOutletContext } from "react-router-dom"
import BandMembers from "./BandMembers"
import LocationGallery from "./LocationGallery"
import EditBioDialog from "./EditBioDialog"
import { useBandMembers } from "../../queries/useBandMembers"

// Index route του '/about': bio πάντα, μετά ένα ΜΟΝΟ section επιπλέον,
// ανάλογα με tenantType (artist/venue/festival — βλ. tenants.type στη βάση,
// 7/9). Το tenantType είναι το ΜΟΝΟ σημείο στον κώδικα που κάνει branching
// πάνω στον τύπο tenant — το category_label (πώς λέγεται ο τύπος στο UI,
// π.χ. "Μουσικό Συγκρότημα"/"DJ"/"Live Stage"/"Φεστιβάλ") είναι καθαρά
// διακοσμητικό κείμενο, εμφανίζεται στο Header, ΔΕΝ μπαίνει ποτέ εδώ σε
// λογική απόφασης.
//
// Το section "Τα μέλη μας" (BandMembers) παραμένει καθαρά data-driven ΜΕΣΑ
// στο artist type: αν δεν υπάρχουν rows στο band_members (π.χ. μεμονωμένος
// καλλιτέχνης/DJ χωρίς ανεβασμένη φωτογραφία ακόμα), δεν εμφανίζεται τίποτα.
// Ίδιο μοτίβο LocationGallery/gallery_urls — και venue ΚΑΙ festival το
// χρησιμοποιούν, γιατί και τα δύο έχουν φυσικό χώρο (ένα festival γίνεται
// κάπου, όχι μόνο μια μπάντα σε ένα venue).
export default function InfoRoute() {
  const { tenantId, tenantType, tenantBio, galleryUrls, isAdmin } = useOutletContext()
  const { data: members } = useBandMembers(tenantType === "artist" ? tenantId : null)

  return (
    <>
      <h2 className="mb-2 flex items-center text-sm font-medium text-gray-500">
        Πληροφορίες
        {isAdmin && <EditBioDialog tenantId={tenantId} currentBio={tenantBio} />}
      </h2>
      {/* Το bio είναι πλέον HTML (Tiptap rich-text editor, 12/9, βλ.
          EditBioDialog.jsx) — dangerouslySetInnerHTML εδώ επίτηδες, όχι
          plain text. Ασφαλές γιατί το ΜΟΝΟ σημείο που γράφει bio είναι ο
          Tiptap editor (StarterKit, χωρίς extension για raw HTML/scripts),
          ΠΟΤΕ δεν περνάει εδώ κείμενο από αλλού/από επισκέπτη. */}
      {tenantBio && (
        <div
          className="text-sm leading-relaxed text-gray-700 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-1 [&_ul]:list-disc [&_ul]:pl-5"
          dangerouslySetInnerHTML={{ __html: tenantBio }}
        />
      )}
      {tenantType === "artist" && (
        <BandMembers members={members} />
      )}
      {(tenantType === "venue" || tenantType === "festival") && (
        <LocationGallery photos={galleryUrls} />
      )}
    </>
  )
}
