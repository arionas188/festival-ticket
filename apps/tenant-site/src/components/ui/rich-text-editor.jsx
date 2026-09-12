"use client"

import { useEffect } from "react"
import { useEditor, useEditorState, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import {
  BoldIcon,
  ItalicIcon,
  StrikethroughIcon,
  ListIcon,
  ListOrderedIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

// Μικρός rich-text editor πάνω σε Tiptap + toggle-group toolbar (12/9,
// ρητό αίτημα χρήστη — "σαν μικρό Word" για το κείμενο του tenant, π.χ.
// bio). Το value/onChange είναι πάντα HTML string. Δεν είναι shadcn block
// — δικό μας component, ασφαλές από CLI overwrites.
//
// useEditorState (όχι απευθείας editor.isActive(...) μέσα στο render):
// από το Tiptap v3, το useEditor() ΔΕΝ ξανα-render-άρει πια αυτόματα σε
// κάθε transaction (perf optimization) — το toolbar highlighting
// (π.χ. "Bold" ενεργό) θα έμενε stale χωρίς αυτό. Βλ. Tiptap docs,
// "Performance" guide.
export function RichTextEditor({ value, onChange, className, disabled }) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value || "",
    editable: !disabled,
    editorProps: {
      attributes: {
        class: cn(
          "min-h-32 w-full rounded-b-lg border border-t-0 border-input bg-transparent px-2.5 py-2 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-1 [&_ul]:list-disc [&_ul]:pl-5"
        ),
      },
    },
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML())
    },
  })

  const editorState = useEditorState({
    editor,
    selector: ({ editor }) =>
      editor
        ? {
            bold: editor.isActive("bold"),
            italic: editor.isActive("italic"),
            strike: editor.isActive("strike"),
            bulletList: editor.isActive("bulletList"),
            orderedList: editor.isActive("orderedList"),
          }
        : null,
  })

  // Sync εξωτερικό reset (π.χ. reset() του react-hook-form όταν ανοίγει
  // ξανά το dialog) — το Tiptap έχει ΔΙΚΟ του internal state, δεν ακούει
  // αυτόματα αλλαγές στο value prop μετά το mount.
  useEffect(() => {
    if (!editor) return
    if (value !== editor.getHTML()) {
      editor.commands.setContent(value || "", { emitUpdate: false })
    }
  }, [value, editor])

  if (!editor || !editorState) return null

  const activeValues = Object.entries(editorState)
    .filter(([, active]) => active)
    .map(([key]) => key)

  return (
    <div className={cn("rounded-lg", className)}>
      <ToggleGroup
        type="multiple"
        size="sm"
        value={activeValues}
        className="justify-start rounded-t-lg border border-b-0 border-input bg-input/30 p-1"
      >
        <ToggleGroupItem
          value="bold"
          aria-label="Έντονα"
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <BoldIcon className="size-4" />
        </ToggleGroupItem>
        <ToggleGroupItem
          value="italic"
          aria-label="Πλάγια"
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <ItalicIcon className="size-4" />
        </ToggleGroupItem>
        <ToggleGroupItem
          value="strike"
          aria-label="Διαγραμμένα"
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <StrikethroughIcon className="size-4" />
        </ToggleGroupItem>
        <ToggleGroupItem
          value="bulletList"
          aria-label="Λίστα με κουκκίδες"
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <ListIcon className="size-4" />
        </ToggleGroupItem>
        <ToggleGroupItem
          value="orderedList"
          aria-label="Αριθμημένη λίστα"
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrderedIcon className="size-4" />
        </ToggleGroupItem>
      </ToggleGroup>
      <EditorContent editor={editor} />
    </div>
  )
}
