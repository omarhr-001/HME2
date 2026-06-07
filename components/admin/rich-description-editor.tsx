'use client'

import { useState } from 'react'
import { Bold, Italic, List, ListOrdered, Heading2, Table as TableIcon, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface RichDescriptionEditorProps {
  value: string
  onChange: (value: string) => void
  maxLength?: number
}

export function RichDescriptionEditor({ value, onChange, maxLength = 5000 }: RichDescriptionEditorProps) {
  const [showPreview, setShowPreview] = useState(false)
  const [tableRows, setTableRows] = useState(3)
  const [tableCols, setTableCols] = useState(3)

  const insertMarkdown = (before: string, after: string = '', defaultText = 'texte') => {
    const textarea = document.getElementById('description-textarea') as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end) || defaultText
    const newValue = value.substring(0, start) + before + selectedText + after + value.substring(end)

    onChange(newValue)

    setTimeout(() => {
      const cursorPos = start + before.length
      textarea.focus()
      textarea.setSelectionRange(cursorPos, cursorPos + selectedText.length)
    }, 0)
  }

  const insertBold = () => insertMarkdown('**', '**', 'texte en gras')
  const insertItalic = () => insertMarkdown('*', '*', 'texte en italique')
  const insertHeading = () => insertMarkdown('## ', '', 'Titre')
  const insertBulletList = () => insertMarkdown('\n- ', '', 'élément')
  const insertNumberedList = () => insertMarkdown('\n1. ', '', 'élément')

  const insertTable = () => {
    const headers = Array(tableCols).fill('Colonne').map((c, i) => c + (i + 1))
    const headerRow = '| ' + headers.join(' | ') + ' |'
    const separatorRow = '|' + Array(tableCols).fill(' --- ').join('|') + '|'
    const dataRows = Array(tableRows - 1)
      .fill(0)
      .map(() => '| ' + Array(tableCols).fill('').join(' | ') + ' |')
      .join('\n')

    const tableMarkdown = `\n\n${headerRow}\n${separatorRow}\n${dataRows}\n\n`
    onChange(value + tableMarkdown)
  }

  const charCount = value.length
  const charPercentage = (charCount / maxLength) * 100
  const isNearLimit = charPercentage > 80

  // Simple markdown to HTML for preview
  const markdownToHtml = (md: string) => {
    let html = md
      // Headings
      .replace(/^### (.*?)$/gm, '<h3 style="font-size: 1.2em; font-weight: bold; margin-top: 0.8em; margin-bottom: 0.4em;">$1</h3>')
      .replace(/^## (.*?)$/gm, '<h2 style="font-size: 1.4em; font-weight: bold; margin-top: 1em; margin-bottom: 0.5em;">$1</h2>')
      .replace(/^# (.*?)$/gm, '<h1 style="font-size: 1.8em; font-weight: bold; margin-top: 1.2em; margin-bottom: 0.6em;">$1</h1>')
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight: bold;">$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/g, '<em style="font-style: italic;">$1</em>')
      // Line breaks
      .replace(/\n/g, '<br>')

    return html
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Description du produit</span>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={showPreview ? 'default' : 'outline'}
              onClick={() => setShowPreview(!showPreview)}
              className="gap-2"
            >
              {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showPreview ? 'Masquer aperçu' : 'Aperçu'}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-muted/50 p-3">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={insertBold}
            title="Gras (Ctrl+B)"
          >
            <Bold className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={insertItalic}
            title="Italique (Ctrl+I)"
          >
            <Italic className="h-4 w-4" />
          </Button>

          <div className="h-6 w-px bg-border" />

          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={insertHeading}
            title="Titre"
          >
            <Heading2 className="h-4 w-4" />
          </Button>

          <div className="h-6 w-px bg-border" />

          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={insertBulletList}
            title="Liste à puces"
          >
            <List className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={insertNumberedList}
            title="Liste numérotée"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>

          <div className="h-6 w-px bg-border" />

          <Dialog>
            <DialogTrigger asChild>
              <Button
                type="button"
                size="sm"
                variant="outline"
                title="Insérer un tableau"
              >
                <TableIcon className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Insérer un tableau</DialogTitle>
                <DialogDescription>Spécifiez le nombre de lignes et colonnes pour votre tableau</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="table-rows">Nombre de lignes</Label>
                  <Input
                    id="table-rows"
                    type="number"
                    min={1}
                    max={10}
                    value={tableRows}
                    onChange={(e) => setTableRows(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                  />
                </div>
                <div>
                  <Label htmlFor="table-cols">Nombre de colonnes</Label>
                  <Input
                    id="table-cols"
                    type="number"
                    min={1}
                    max={8}
                    value={tableCols}
                    onChange={(e) => setTableCols(Math.max(1, Math.min(8, parseInt(e.target.value) || 1)))}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={insertTable}>Insérer le tableau</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <div className="ml-auto text-xs text-muted-foreground">
            Markdown supporté
          </div>
        </div>

        {/* Editor and preview */}
        <div className={`grid gap-4 ${showPreview ? 'md:grid-cols-2' : ''}`}>
          {/* Editor */}
          <div className="space-y-2">
            <Textarea
              id="description-textarea"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Décrivez votre produit en détail. Vous pouvez utiliser la mise en forme Markdown."
              maxLength={maxLength}
              rows={12}
              className="font-mono text-sm"
            />
            <div className="flex items-center justify-between">
              <div className={`text-xs font-medium ${isNearLimit ? 'text-destructive' : 'text-muted-foreground'}`}>
                {charCount}/{maxLength} caractères
              </div>
              <div className="h-2 w-32 overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full transition-all ${isNearLimit ? 'bg-destructive' : 'bg-primary'}`}
                  style={{ width: `${Math.min(charPercentage, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Preview */}
          {showPreview && (
            <div className="space-y-2">
              <div className="rounded-lg border bg-card p-4" style={{ minHeight: '322px' }}>
                <div
                  className="prose prose-sm max-w-none dark:prose-invert text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: markdownToHtml(value) || '<span class="text-muted-foreground italic">L&apos;aperçu s&apos;affichera ici...</span>',
                  }}
                />
              </div>
              <div className="text-xs text-muted-foreground">Aperçu en temps réel</div>
            </div>
          )}
        </div>

        {/* Formatting help */}
        <details className="rounded-lg border p-3 text-sm">
          <summary className="cursor-pointer font-medium">Aide Markdown</summary>
          <div className="mt-3 space-y-2 text-xs text-muted-foreground">
            <div>
              <code className="bg-muted px-1.5 py-0.5 rounded">**texte**</code> → <strong>texte en gras</strong>
            </div>
            <div>
              <code className="bg-muted px-1.5 py-0.5 rounded">*texte*</code> → <em>texte en italique</em>
            </div>
            <div>
              <code className="bg-muted px-1.5 py-0.5 rounded">## Titre</code> → Titre de niveau 2
            </div>
            <div>
              <code className="bg-muted px-1.5 py-0.5 rounded">- item</code> → Liste à puces
            </div>
            <div>
              <code className="bg-muted px-1.5 py-0.5 rounded">1. item</code> → Liste numérotée
            </div>
          </div>
        </details>
      </CardContent>
    </Card>
  )
}
