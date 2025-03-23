"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link,
  Image,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Heading1,
  Heading2,
  Heading3,
  Undo,
  Redo,
} from "lucide-react"

interface EditorProps {
  initialValue?: string
  onChange: (content: string) => void
}

export function Editor({ initialValue = "", onChange }: EditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState("")
  const [linkText, setLinkText] = useState("")
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [imageUrl, setImageUrl] = useState("")
  const [imageAlt, setImageAlt] = useState("")

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = initialValue
    }
  }, [initialValue])

  const handleContentChange = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }

  const execCommand = (command: string, value = "") => {
    document.execCommand(command, false, value)
    handleContentChange()
    if (editorRef.current) {
      editorRef.current.focus()
    }
  }

  const handleLinkInsert = () => {
    if (linkUrl) {
      const text = linkText || linkUrl
      execCommand("insertHTML", `<a href="${linkUrl}" target="_blank">${text}</a>`)
      setIsLinkModalOpen(false)
      setLinkUrl("")
      setLinkText("")
    }
  }

  const handleImageInsert = () => {
    if (imageUrl) {
      execCommand("insertHTML", `<img src="${imageUrl}" alt="${imageAlt}" style="max-width: 100%; height: auto;" />`)
      setIsImageModalOpen(false)
      setImageUrl("")
      setImageAlt("")
    }
  }

  return (
    <div className="border rounded-md">
      <div className="flex flex-wrap gap-1 p-2 border-b bg-muted/50">
        <Button type="button" variant="ghost" size="icon" onClick={() => execCommand("bold")} title="Negrita">
          <Bold className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" onClick={() => execCommand("italic")} title="Cursiva">
          <Italic className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" onClick={() => execCommand("underline")} title="Subrayado">
          <Underline className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-border mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => execCommand("insertUnorderedList")}
          title="Lista con viñetas"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => execCommand("insertOrderedList")}
          title="Lista numerada"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-border mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setIsLinkModalOpen(true)}
          title="Insertar enlace"
        >
          <Link className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setIsImageModalOpen(true)}
          title="Insertar imagen"
        >
          <Image className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-border mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => execCommand("justifyLeft")}
          title="Alinear a la izquierda"
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" onClick={() => execCommand("justifyCenter")} title="Centrar">
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => execCommand("justifyRight")}
          title="Alinear a la derecha"
        >
          <AlignRight className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-border mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => execCommand("formatBlock", "<h1>")}
          title="Encabezado 1"
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => execCommand("formatBlock", "<h2>")}
          title="Encabezado 2"
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => execCommand("formatBlock", "<h3>")}
          title="Encabezado 3"
        >
          <Heading3 className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-border mx-1" />
        <Button type="button" variant="ghost" size="icon" onClick={() => execCommand("undo")} title="Deshacer">
          <Undo className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" onClick={() => execCommand("redo")} title="Rehacer">
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      <div
        ref={editorRef}
        className="min-h-[200px] p-4 focus:outline-none"
        contentEditable
        onInput={handleContentChange}
        dangerouslySetInnerHTML={{ __html: initialValue }}
      />

      {isLinkModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Insertar enlace</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="link-url" className="text-sm font-medium">
                  URL
                </label>
                <input
                  id="link-url"
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  placeholder="https://ejemplo.com"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="link-text" className="text-sm font-medium">
                  Texto (opcional)
                </label>
                <input
                  id="link-text"
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  placeholder="Texto del enlace"
                />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setIsLinkModalOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleLinkInsert}>Insertar</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isImageModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Insertar imagen</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="image-url" className="text-sm font-medium">
                  URL de la imagen
                </label>
                <input
                  id="image-url"
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="image-alt" className="text-sm font-medium">
                  Texto alternativo
                </label>
                <input
                  id="image-alt"
                  type="text"
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  placeholder="Descripción de la imagen"
                />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setIsImageModalOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleImageInsert}>Insertar</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

