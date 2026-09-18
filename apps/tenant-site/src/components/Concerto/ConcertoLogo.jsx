import { useRef } from "react"
import { gsap } from "gsap"
import { useGSAP } from "@gsap/react"
import { cn } from "@/lib/utils"
import concertoLogoImg from "@/assets/images/concerto-logo.jpg"

// 18/9, ρητό αίτημα χρήστη: reusable component (πρώτα το GSAP animation, το
// ίδιο το project το εγκατέστησε μόλις — `gsap`/`@gsap/react`) ώστε το
// λογότυπο ΚΑΙ το animation να ζουν σε ΕΝΑ σημείο και να μπορούν να
// χρησιμοποιηθούν οπουδήποτε χρειάζεται στο app (π.χ. ConcertoBar.jsx,
// FanDashboardLayout.jsx — το δεύτερο ΔΕΝ άλλαξε ακόμα, εκκρεμεί έγκριση
// χρήστη μετά το demo, βλ. concerto-brief.md).
//
// Animation: ρητή περιγραφή χρήστη — "να κινείται μέσα σε έναν χώρο απαλά
// χωρίς να αποσπά την προσοχή". Αργή (3.4s), μικρό εύρος κίνησης
// (±5-6px, μικρή περιστροφή), ease "sine.inOut" (ομαλή επιτάχυνση/
// επιβράδυνση και στα δύο άκρα, όχι απότομη γραμμική κίνηση) —
// yoyo+repeat:-1 ώστε να πηγαινοέρχεται ατέρμονα. useGSAP (αντί για απλό
// useEffect) καθαρίζει αυτόματα το animation σε unmount — δεν χρειάζεται
// να το κάνουμε εμείς χειροκίνητα.
//
// Προσβασιμότητα: σέβεται prefers-reduced-motion — αν ο χρήστης έχει
// ζητήσει λιγότερη κίνηση στο λειτουργικό του, το λογότυπο μένει ακίνητο.
export default function ConcertoLogo({ size = 44, className }) {
  const circleRef = useRef(null)

  useGSAP(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches
    if (prefersReducedMotion) return

    gsap.to(circleRef.current, {
      y: -6,
      x: 3,
      rotation: 5,
      duration: 3.4,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
    })
  }, [])

  return (
    <div
      ref={circleRef}
      aria-label="Concerto"
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-foreground",
        className
      )}
      style={{ width: size, height: size }}
    >
      <img src={concertoLogoImg} alt="" className="size-full object-cover" />
    </div>
  )
}
