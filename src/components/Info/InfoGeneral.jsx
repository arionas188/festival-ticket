import { InformationCircleIcon } from "@heroicons/react/20/solid"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function InfoGeneral({ event }) {
  return (
    <Dialog>
      <div className="flex w-full min-w-0 flex-1">
        <DialogTrigger asChild>
          <button
            type="button"
            className="relative inline-flex w-full items-center justify-center gap-x-3 rounded-br-lg border border-transparent py-4 text-sm font-semibold text-gray-900"
          >
            <InformationCircleIcon aria-hidden="true" className="size-5 text-gray-400" />
            Info
          </button>
        </DialogTrigger>
      </div>

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
            <p className="font-medium text-foreground">{event?.name ?? "Εκδήλωση"}</p>
            <p className="text-muted-foreground">{event?.title}</p>
            {event?.date ? <p className="text-muted-foreground">Ημερομηνία: {event.date}</p> : null}
          </TabsContent>

          <TabsContent value="place" className="mt-3">
            <p className="text-muted-foreground">
              {event?.name ?? "Η τοποθεσία θα εμφανιστεί εδώ."}
            </p>
          </TabsContent>

          <TabsContent value="notes" className="mt-3">
            <p className="text-muted-foreground">
              Περισσότερες πληροφορίες για την εκδήλωση.
            </p>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
