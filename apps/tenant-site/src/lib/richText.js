// Βοηθητικές συναρτήσεις για το bio rich-text editor (12/9, Tiptap +
// toggle-group toolbar — βλ. ui/rich-text-editor.jsx, EditBioDialog.jsx).

// Παλιά bio ήταν πάντα plain text (πριν το Tiptap). Όταν ανοίγει ο editor
// πάνω σε τέτοιο, παλιό bio, το μετατρέπουμε σε HTML παραγράφους ώστε να
// μη χαθούν τα κενά μεταξύ παραγράφων — χωρίς αυτό, όλο το κείμενο θα
// έμπαινε σε ΜΙΑ γραμμή μέσα στον editor. Αν το bio είναι ήδη HTML (ξανά-
// ανοιγμένο μετά την πρώτη αποθήκευση από τον editor), το αφήνουμε όπως
// είναι.
export function plainTextToHtml(text) {
  if (!text) return ""
  if (/<[a-z][\s\S]*>/i.test(text)) return text
  const escape = (s) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  return text
    .split(/\n{2,}/)
    .map((para) => `<p>${escape(para).replace(/\n/g, "<br>")}</p>`)
    .join("")
}

// Μήκος του ΠΡΑΓΜΑΤΙΚΟΥ κειμένου (χωρίς τα html tags) — χρησιμοποιείται
// στο zod validation, ώστε το όριο χαρακτήρων να αφορά αυτά που βλέπει/
// γράφει ο tenant, όχι τη μορφοποιημένη μέσα markup (που θα το έκανε να
// γεμίζει πολύ πιο γρήγορα απ' όσο θα περίμενε κάποιος).
export function htmlToPlainTextLength(html) {
  if (!html) return 0
  return html.replace(/<[^>]*>/g, "").trim().length
}
