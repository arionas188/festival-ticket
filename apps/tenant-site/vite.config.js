import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { fileURLToPath, URL } from "node:url"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    host: true,
    // true (13/9, ρητό αίτημα χρήστη — δοκιμή dev site από κινητό στο ίδιο
    // Wi-Fi): το allowedHosts δεν δέχεται array ΚΑΙ true μαζί (μόνο το ένα ή
    // το άλλο), οπότε true καλύπτει και τα ονόματα tenant subdomains
    // (villagers/athensrock/strafi.concerto.gr) ΚΑΙ raw τοπικές IP
    // (π.χ. 192.168.1.X:5173) — απενεργοποιεί εντελώς τον έλεγχο host.
    // Ασφαλές ΜΟΝΟ επειδή αφορά dev server σε τοπικό δίκτυο σπιτιού· η
    // production build δεν περνάει ποτέ από εδώ, σερβίρεται από το Netlify.
    allowedHosts: true,
  },
})