'use client'

import { useState } from 'react'
import { Bold, Italic, List, ListOrdered, Heading2, Table as TableIcon, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
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

  const insertBold = () => insertMarkdown('**', '**', 'gras')
  const insertItalic = () => insertMarkdown('*', '*', 'italique')
  const insertHeading = () => insertMarkdown('## ', '', 'Titre')
  const insertBulletList = () => insertMarkdown('\n- ', '', 'élément')
  const insertNumberedList = () => insertMarkdown('\n1. ', '', 'élément')

  const insertTable = () => {
    const headers = Array(tableCols).fill('Col').map((c, i) => c + (i + 1))
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

  const markdownToHtml = (md: string) => {
    let html = md
      .replace(/^### (.*?)$/gm, '<h3 style="font-size: 1.1em; font-weight: bold; margin: 0.6em 0 0.3em;">$1</h3>')
      .replace(/^## (.*?)$/gm, '<h2 style="font-size: 1.3em; font-weight: bold; margin: 0.8em 0 0.4em;">$1</h2>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>')
    return html
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-sm font-medium">Description</h4>
        <Button
          size="sm"
          variant={showPreview ? 'default' : 'outline'}
          onClick={() => setShowPreview(!showPreview)}
          className="h-7 px-2 text-xs gap-1"
        >
          {showPreview ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
          {showPreview ? 'Masquer' : 'Aperçu'}
        </Button>
      </div>

      {/* Formatting toolbar - compact */}
      <div className="flex flex-wrap gap-1 rounded-lg border bg-muted p-2">
        <Button size="sm" variant="ghost" onClick={insertBold} title="Gras" className="h-7 w-7 p-0">
          <Bold className="h-3.5 w-3.5" />
        </Button>
        <Button size="sm" variant="ghost" onClick={insertItalic} title="Italique" className="h-7 w-7 p-0">
          <Italic className="h-3.5 w-3.5" />
        </Button>
        <div className="w-px bg-border" />
        <Button size="sm" variant="ghost" onClick={insertHeading} title="Titre" className="h-7 w-7 p-0">
          <Heading2 className="h-3.5 w-3.5" />
        </Button>
        <div className="w-px bg-border" />
        <Button size="sm" variant="ghost" onClick={insertBulletList} title="Liste" className="h-7 w-7 p-0">
          <List className="h-3.5 w-3.5" />
        </Button>
        <Button size="sm" variant="ghost" onClick={insertNumberedList} title="Numéroté" className="h-7 w-7 p-0">
          <ListOrdered className="h-3.5 w-3.5" />
        </Button>
        <div className="w-px bg-border" />
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" variant="ghost" title="Tableau" className="h-7 w-7 p-0">
              <TableIcon className="h-3.5 w-3.5" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xs">
            <DialogHeader>
              <DialogTitle className="text-sm">Tableau</DialogTitle>
              <DialogDescription className="text-xs">Dimensions</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label htmlFor="table-rows" className="text-xs">Lignes: {tableRows}</Label>
                <Input
                  id="table-rows"
                  type="range"
                  min="2"
                  max="10"
                  value={tableRows}
                  onChange={(e) => setTableRows(parseInt(e.target.value))}
                  className="h-1.5"
                />
              </div>
              <div>
                <Label htmlFor="table-cols" className="text-xs">Colonnes: {tableCols}</Label>
                <Input
                  id="table-cols"
                  type="range"
                  min="2"
                  max="10"
                  value={tableCols}
                  onChange={(e) => setTableCols(parseInt(e.target.value))}
                  className="h-1.5"
                />
              </div>
            </div>
            <DialogFooter>
              <Button size="sm" onClick={insertTable} className="px-3 text-xs h-8">Insérer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Character count */}
      <div className="flex items-center gap-2 text-xs">
        <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full transition-colors ${
              isNearLimit ? 'bg-amber-500' : 'bg-primary'
            }`}
            style={{ width: `${Math.min(charPercentage, 100)}%` }}
          />
        </div>
        <span className={`font-medium whitespace-nowrap ${isNearLimit ? 'text-amber-600' : 'text-muted-foreground'}`}>
          {charCount}/{maxLength}
        </span>
      </div>

      {/* Editor and preview */}
      <div className={`grid gap-2 ${showPreview ? 'grid-cols-2' : 'grid-cols-1'}`}>
        <Textarea
          id="description-textarea"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Markdown supporté..."
          className="min-h-32 resize-none font-mono text-xs"
        />
        {showPreview && (
          <div className="rounded-lg border bg-muted p-2 overflow-auto max-h-80 text-xs prose-sm">
            <div dangerouslySetInnerHTML={{ __html: markdownToHtml(value) }} />
          </div>
        )}
      </div>

      {/* Markdown help - collapsible */}
      <details className="text-xs">
        <summary className="cursor-pointer font-medium text-muted-foreground hover:text-foreground">
          Aide
        </summary>
        <div className="mt-2 grid grid-cols-2 gap-1 text-xs text-muted-foreground">
          <div><code>**gras**</code> = <strong>gras</strong></div>
          <div><code>*italique*</code> = <em>italique</em></div>
          <div><code>## Titre</code> = titre</div>
          <div><code>- item</code> = liste</div>
        </div>
      </details>
    </div>
  )
}
