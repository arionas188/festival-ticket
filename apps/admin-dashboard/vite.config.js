import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { fileURLToPath, URL } from "node:url"

// Ξεχωριστό port (5174) από το tenant-site (5173), ώστε να μπορούν να
// τρέχουν ΤΑΥΤΟΧΡΟΝΑ — χρήσιμο ακριβώς για testing σαν κι αυτό, αλλαγή
// στο dashboard να φαίνεται αμέσως στο live tenant site δίπλα του.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    host: true,
    port: 5174,
  },
})
