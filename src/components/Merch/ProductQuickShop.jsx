import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"

const PLACEHOLDER_COLORS = [{ id: "black", name: "Μαύρο", classes: "bg-gray-900" }]
const PLACEHOLDER_SIZES = ["S", "M", "L", "XL"]

export default function ProductQuickShop({ product, onClose, onAddToCart }) {
  const [quantity, setQuantity] = useState(1)
  const [selectedSize, setSelectedSize] = useState(null)

  // Επαναφορά ποσότητας/μεγέθους κάθε φορά που αλλάζει το προϊόν
  // (το component δεν κάνει unmount/mount, οπότε το state δεν επαναφέρεται μόνο του)
  useEffect(() => {
    if (product) {
      setQuantity(1)
      setSelectedSize(null)
    }
  }, [product?.id])

  if (!product) {
    return (
      <Dialog open={false} onOpenChange={() => {}}>
        <DialogContent />
      </Dialog>
    )
  }

  return (
    <Dialog open={!!product} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <div className="flex flex-col gap-4 pt-2">
          <img
            alt={product.name}
            src={product.image_urls?.[0]}
            className="mx-auto aspect-square w-40 rounded-lg bg-gray-100 object-cover sm:w-48"
          />

          <div>
            <h2 className="text-lg font-medium text-gray-900">{product.name}</h2>

            <p className="mt-1 font-medium text-gray-900">
              {Number(product.price).toFixed(2)}€
            </p>
            {product.description && (
              <p className="mt-2 text-sm text-gray-600">{product.description}</p>
            )}

            <div className="mt-6">
              {product.category === "clothing" && (
                <>
                  <fieldset aria-label="Επιλογή χρώματος" disabled>
                    <legend className="text-sm font-medium text-gray-900">Χρώμα</legend>
                    <div className="mt-2 flex items-center gap-x-3 opacity-40">
                      {PLACEHOLDER_COLORS.map((color) => (
                        <div key={color.id} className={`size-8 rounded-full ${color.classes}`} />
                      ))}
                    </div>
                  </fieldset>

                  <fieldset aria-label="Επιλογή μεγέθους" className="mt-6">
                    <div className="text-sm font-medium text-gray-900">Μέγεθος</div>
                    <div className="mt-2 grid grid-cols-4 gap-2">
                      {PLACEHOLDER_SIZES.map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setSelectedSize(size)}
                          className={`flex items-center justify-center rounded-md border p-2 text-sm font-medium ${
                            selectedSize === size
                              ? "border-gray-900 bg-gray-900 text-white"
                              : "border-gray-300 text-gray-900 hover:bg-gray-50"
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </fieldset>
                </>
              )}

              <div className="mt-6">
                <div className="text-sm font-medium text-gray-900">Ποσότητα</div>
                <div className="mt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="flex size-9 items-center justify-center rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    −
                  </button>
                  <span className="w-6 text-center text-sm font-medium">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="flex size-9 items-center justify-center rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-2">
                <Button
                  type="button"
                  onClick={() => {
                    onAddToCart(product, quantity)
                    onClose()
                  }}
                >
                  Προσθήκη στο καλάθι
                </Button>
                <Button type="button" variant="ghost" disabled title="Έρχεται σύντομα">
                  Πληρωμή
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}