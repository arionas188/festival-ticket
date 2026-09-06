import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getMapsUrl } from "../../lib/maps"

// Controlled dialog (open/onOpenChange) — ίδιο pattern με το TicketDialog: το
// άνοιγμα είναι δημόσιο URL route (/events/event/:eventId/info), όχι τοπικό
// Dialog state. Το κουμπί "Info" (πλέον <Link>) ζει στο EventsList.
export default function EventInfoDialog({ event, open, onOpenChange }) {
  if (!event) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Πληροφορίες</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="general">
          <TabsList className="w-full">
            <TabsTrigger value="general">Γενικά</TabsTrigger>
            <TabsTrigger value="place">Τοποθεσία</TabsTrigger>
            <TabsTrigger value="notes">Σημειώσεις</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="mt-3 space-y-1">
            <p className="font-medium text-foreground">{event?.title}</p>
            {event?.description && (
              <p className="text-muted-foreground">{event.description}</p>
            )}
            {event?.date && (
              <p className="text-muted-foreground">
                Ημερομηνία:{" "}
                {new Date(event.date).toLocaleString("el-GR", {
                  dateStyle: "full",
                  timeStyle: "short",
                })}
              </p>
            )}
          </TabsContent>

          <TabsContent value="place" className="mt-3 space-y-2">
            <p className="text-muted-foreground">
              {event?.location ?? "Η τοποθεσία θα ανακοινωθεί σύντομα."}
            </p>
            {event?.location && (
              <a
                href={getMapsUrl(event)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-primary underline"
              >
                Άνοιγμα στο Google Maps
              </a>
            )}
          </TabsContent>

          <TabsContent value="notes" className="mt-3">
            <p className="text-muted-foreground">
              Περισσότερες πληροφορίες θα προστεθούν σύντομα.
            </p>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
