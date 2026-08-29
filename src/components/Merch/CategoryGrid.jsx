export default function CategoryGrid({ categories, onSelect }) {
  const newArrivals = categories.find((c) => c.key === "new")
  const rest = categories.filter((c) => c.key !== "new")

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <h2 className="text-2xl font-bold tracking-tight text-gray-900">Κατηγορίες</h2>

      <div className="mt-6 flex flex-col gap-6 lg:gap-8">
        {/* New Arrivals — κοντό σε mobile, πλατύ banner από sm και πάνω */}
        {newArrivals && (
          <button
            type="button"
            onClick={() => onSelect(newArrivals.key)}
            className="group relative aspect-video w-full overflow-hidden rounded-lg text-left sm:aspect-4/1"
          >
            {newArrivals.items[0]?.image_urls?.[0] && (
              <img
                alt=""
                src={newArrivals.items[0].image_urls[0]}
                className="absolute size-full object-cover group-hover:opacity-75"
              />
            )}
            <div aria-hidden="true" className="absolute inset-0 bg-linear-to-b from-transparent to-black opacity-50" />
            <div className="absolute inset-0 flex items-end p-6">
              <div>
                <h3 className="font-semibold text-white">{newArrivals.title}</h3>
                <p className="mt-1 text-sm text-white">Δες περισσότερα</p>
              </div>
            </div>
          </button>
        )}

        {/* Οι υπόλοιπες κατηγορίες — κοντές σε mobile, μεγαλύτερες/τετράγωνες από sm και πάνω */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 lg:gap-8">
          {rest.map((cat) => (
            <button
              key={cat.key}
              type="button"
              onClick={() => onSelect(cat.key)}
              className="group relative aspect-video w-full overflow-hidden rounded-lg text-left sm:aspect-square"
            >
              {cat.items[0]?.image_urls?.[0] && (
                <img
                  alt=""
                  src={cat.items[0].image_urls[0]}
                  className="absolute size-full object-cover group-hover:opacity-75"
                />
              )}
              <div aria-hidden="true" className="absolute inset-0 bg-linear-to-b from-transparent to-black opacity-50" />
              <div className="absolute inset-0 flex items-end p-6">
                <div>
                  <h3 className="font-semibold text-white">{cat.title}</h3>
                  <p className="mt-1 text-sm text-white">Δες περισσότερα</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}