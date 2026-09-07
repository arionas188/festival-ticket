import { useOutletContext } from "react-router-dom"
import TenantAbout from "./TenantAbout"
import BandMembers from "./BandMembers"
import LocationGallery from "./LocationGallery"
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
  const { tenantId, tenantType, tenantBio, galleryUrls } = useOutletContext()
  const { data: members } = useBandMembers(tenantType === "artist" ? tenantId : null)

  return (
    <>
      <h2 className="mb-2 text-sm font-medium text-gray-500">Πληροφορίες</h2>
      {tenantBio && (
        <p className="whitespace-pre-line text-sm leading-relaxed text-gray-700">
          {tenantBio}
        </p>
      )}
      {tenantType === "artist" && (
        <>
          <TenantAbout />
          <BandMembers members={members} />
        </>
      )}
      {(tenantType === "venue" || tenantType === "festival") && (
        <LocationGallery photos={galleryUrls} />
      )}
    </>
  )
}
