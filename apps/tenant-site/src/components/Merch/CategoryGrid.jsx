import { Link } from "react-router-dom"
import { PlusIcon } from "@heroicons/react/20/solid"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

// Πραγματικά <Link> αντί για button+onClick: right-click/"open in new tab"
// δουλεύει, και το href είναι ορατό/crawlable.
// 15/9: το breadcrumb ΔΕΝ μπαίνει πια εδώ μέσα — μετακόμισε ένα επίπεδο πιο
// πάνω, στο MerchCategoriesRoute.jsx, ΠΡΙΝ από το bg-gray-50 div (ρητό
// αίτημα χρήστη: "πάνω από το γκρι, κάτω από τη γραμμή" — βλ. εκεί).
export default function CategoryGrid({ categories, isAdmin = false }) {
  const newArrivals = categories.find((c) => c.key === "new")
  const rest = categories.filter((c) => c.key !== "new")

  return (
    // 16/9, ρητό αίτημα χρήστη — ίδιο στυλ με τη σελίδα κατηγορίας
    // (MerchCategoryRoute.jsx): τίτλος κεντραρισμένος με γραμμή από κάτω,
    // όλο το περιεχόμενο μέσα σε ένα γκρι πλαίσιο με στρογγυλεμένες γωνίες.
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="rounded-2xl bg-gray-50 p-6 ring-1 ring-gray-200 sm:p-8">
        <h2 className="border-b border-gray-200 pb-4 text-center text-2xl font-bold tracking-tight text-gray-900">
          Κατηγορίες
        </h2>

        {/* 20/9, ρητό αίτημα χρήστη — "widget ... πρόσθεσε product",
            ορατό ΜΟΝΟ σε πραγματικούς admins αυτού του tenant (context.isAdmin,
            βλ. MerchCategoriesRoute.jsx). Ίδιο ΑΚΡΙΒΩΣ μοτίβο θέσης/στυλ με
            το "Προσθήκη event" στο EventsRoute.jsx — δεξιά, πάνω από το
            περιεχόμενο. Πηγαίνει σε πραγματική σελίδα (merch/product/new,
            βλ. main.jsx + ProductFormPage.jsx), όχι modal. */}
        {isAdmin && (
          <div className="mt-4 flex justify-end">
            <Button asChild className="rounded-full">
              <Link to="/merch/product/new">
                <PlusIcon aria-hidden="true" className="mr-1.5 size-4" />
                Πρόσθεσε προϊόν
              </Link>
            </Button>
          </div>
        )}

        <div className="mt-8 flex flex-col gap-6 lg:gap-8">
          {/* New Arrivals — κοντό σε mobile, πλατύ banner από sm και πάνω.
              16/9, ρητό αίτημα χρήστη: ίδιο "κάρτα" στυλ με τα προϊόντα
              (ProductList.jsx) — λευκό περιθώριο γύρω από την εικόνα +
              έντονη σκιά, ίδιο shadcn <Card>, αντί η εικόνα να γεμίζει
              κολλητά ολόκληρο το πλαίσιο. */}
          {newArrivals && (
            <Card className="shadow-2xl">
              <CardContent>
                <Link
                  to={`/merch/category/${newArrivals.key}`}
                  className="group relative block aspect-video w-full overflow-hidden rounded-md text-left sm:aspect-4/1"
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
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Οι υπόλοιπες κατηγορίες — κοντές σε mobile, μεγαλύτερες/τετράγωνες από sm και πάνω */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 lg:gap-8">
            {rest.map((cat) => (
              <Card key={cat.key} className="shadow-2xl">
                <CardContent>
                  <Link
                    to={`/merch/category/${cat.key}`}
                    className="group relative block aspect-video w-full overflow-hidden rounded-md text-left sm:aspect-square"
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
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
