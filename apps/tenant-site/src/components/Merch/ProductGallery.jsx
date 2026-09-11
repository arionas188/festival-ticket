import { Dialog, DialogContent } from "@/components/ui/dialog"

export default function ProductGallery({ product, onClose }) {
  return (
    <Dialog open={!!product} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <div className="flex flex-col gap-4 pt-2">
          {product?.image_urls?.map((url, i) => (
            <img
              key={i}
              src={url}
              alt={`${product.name} φωτογραφία ${i + 1}`}
              className="aspect-square w-full rounded-lg bg-gray-100 object-cover"
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}