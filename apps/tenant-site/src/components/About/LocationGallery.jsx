// Ίδιο πνεύμα με το BandMembers.jsx (τίτλος + subtitle + grid), αλλά για
// φωτογραφίες χώρου αντί για μέλη — γι' αυτό ξεχωριστό component: η κάρτα
// εδώ δεν έχει όνομα/ρόλο, μόνο εικόνα σε ορθογώνιο (όχι στρογγυλό) πλαίσιο.
// Χρησιμοποιείται από venue ΚΑΙ festival tenants (και τα δύο έχουν φυσικό
// χώρο άξιο φωτογράφισης) — γι' αυτό γενικό όνομα, όχι "VenueGallery".
// Καθαρά data-driven: αν το tenant δεν έχει καθόλου gallery_urls, δεν
// εμφανίζεται τίποτα — ίδιο μοτίβο με το BandMembers.
export default function LocationGallery({ photos }) {
  if (!photos || photos.length === 0) return null

  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="max-w-xl">
          <h2 className="text-3xl font-semibold tracking-tight text-pretty text-gray-900 sm:text-4xl">
            Φωτογραφίες
          </h2>
          <p className="mt-6 text-lg/8 text-gray-600">
            Μια ματιά στον χώρο μας.
          </p>
        </div>
        <ul role="list" className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6">
          {photos.map((url, i) => (
            <li key={i}>
              <img
                alt=""
                src={url}
                className="aspect-square w-full rounded-lg bg-gray-100 object-cover"
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
