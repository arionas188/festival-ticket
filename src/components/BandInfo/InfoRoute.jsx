import { useOutletContext } from "react-router-dom"
import BandInfo from "./BandInfo"

// Index route του '/': ίδιο περιεχόμενο με πριν (bio + BandInfo), τώρα route
// αντί για conditionally-rendered block στο Header, ώστε το tab "Πληροφορίες"
// να είναι πλήρως συνεπές αρχιτεκτονικά με Merch/Events.
export default function InfoRoute() {
  const { bandBio } = useOutletContext()

  return (
    <>
      <h2 className="mb-2 text-sm font-medium text-gray-500">Πληροφορίες</h2>
      {bandBio && (
        <p className="whitespace-pre-line text-sm leading-relaxed text-gray-700">
          {bandBio}
        </p>
      )}
      <BandInfo />
    </>
  )
}
