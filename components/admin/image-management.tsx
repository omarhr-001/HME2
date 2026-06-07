'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Trash2, Plus, GripVertical, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

interface ImageManagementCardProps {
  existingImages: string[]
  newImages: Array<{ name: string; url: string }>
  imagesToRemove: Set<string>
  onMarkForRemoval: (url: string) => void
  onUnmarkForRemoval: (url: string) => void
  onAddNewImages: (files: File[]) => Promise<void>
  onRemoveNewImage: (url: string) => void
  onReorderImages: (urls: string[]) => void
}

export function ImageManagementCard({
  existingImages,
  newImages,
  imagesToRemove,
  onMarkForRemoval,
  onUnmarkForRemoval,
  onAddNewImages,
  onRemoveNewImage,
  onReorderImages,
}: ImageManagementCardProps) {
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    setIsUploading(true)
    try {
      await onAddNewImages(Array.from(e.target.files))
    } finally {
      setIsUploading(false)
      e.target.value = ''
    }
  }

  const moveImageUp = (index: number) => {
    if (index === 0) return
    const newOrder = [...existingImages]
    ;[newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]]
    onReorderImages(newOrder)
  }

  const moveImageDown = (index: number) => {
    if (index === existingImages.length - 1) return
    const newOrder = [...existingImages]
    ;[newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]]
    onReorderImages(newOrder)
  }

  return (
    <>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium">Gestion des images</h4>
          <Badge variant="secondary" className="text-xs">{existingImages.length + newImages.length} images</Badge>
        </div>
        
        {/* Upload new images section */}
        <div className="rounded-lg border-2 border-dashed border-muted-foreground/25 p-3 text-center">
          <input
            type="file"
            id="image-upload"
            multiple
            accept="image/*"
            onChange={handleFileUpload}
            disabled={isUploading}
            className="hidden"
          />
          <label htmlFor="image-upload" className="cursor-pointer block">
            <Button variant="outline" size="sm" disabled={isUploading} asChild>
              <span>
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                {isUploading ? 'Téléchargement...' : 'Ajouter images'}
              </span>
            </Button>
          </label>
          <p className="mt-1 text-xs text-muted-foreground">Cliquez ou glissez-déposez</p>
        </div>

        {/* Existing images section */}
        {existingImages.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Images existantes ({existingImages.length})</p>
            <div className="grid gap-2 sm:grid-cols-3 md:grid-cols-4">
              {existingImages.map((url, index) => (
                <div
                    key={url}
                    className={`group relative overflow-hidden rounded border transition-all ${
                      imagesToRemove.has(url) ? 'border-destructive bg-destructive/10' : 'border-border hover:border-primary'
                    }`}
                  >
                    <div className="relative aspect-square bg-muted">
                      <Image src={url} alt={`Product image ${index + 1}`} fill className="object-cover" sizes="100px" />
                    </div>

                    {/* Badge for primary image */}
                    {index === 0 && !imagesToRemove.has(url) && (
                      <Badge className="absolute left-1 top-1 bg-primary text-xs px-1.5 py-0">Principal</Badge>
                    )}

                    {/* Controls overlay */}
                    <div className={`absolute inset-0 flex flex-col items-center justify-center gap-1 transition-all ${imagesToRemove.has(url) ? 'bg-destructive/80' : 'bg-black/60 opacity-0 group-hover:opacity-100'}`}>
                      {/* Preview button */}
                      <Button size="sm" variant="secondary" onClick={() => setPreviewImage(url)} className="h-6 px-2">
                        <Eye className="h-3 w-3" />
                      </Button>

                      {/* Remove checkbox */}
                      <div className="flex items-center gap-1 rounded bg-white/20 px-1.5 py-0.5 backdrop-blur">
                        <Checkbox
                          checked={imagesToRemove.has(url)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              onMarkForRemoval(url)
                            } else {
                              onUnmarkForRemoval(url)
                            }
                          }}
                          id={`remove-${url}`}
                          className="h-3 w-3"
                        />
                        <label htmlFor={`remove-${url}`} className="text-xs font-medium text-white cursor-pointer">
                          {imagesToRemove.has(url) ? 'Sup.' : 'X'}
                        </label>
                      </div>
                    </div>

                    {/* Reorder buttons (visible when not marked for deletion) */}
                    {!imagesToRemove.has(url) && (
                      <div className="absolute bottom-1 right-1 flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                        {index > 0 && (
                          <Button
                            size="icon"
                            variant="secondary"
                            className="h-5 w-5"
                            onClick={() => moveImageUp(index)}
                            title="Vers le haut"
                          >
                            <span className="text-xs">↑</span>
                          </Button>
                        )}
                        {index < existingImages.length - 1 && (
                          <Button
                            size="icon"
                            variant="secondary"
                            className="h-5 w-5"
                            onClick={() => moveImageDown(index)}
                            title="Vers le bas"
                          >
                            <span className="text-xs">↓</span>
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* New images section */}
          {newImages.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-medium text-blue-600">Nouvelles images ({newImages.length})</p>
              <div className="grid gap-2 sm:grid-cols-3 md:grid-cols-4">
                {newImages.map((img) => (
                  <div key={img.url} className="group relative overflow-hidden rounded border border-blue-400 bg-blue-50">
                    <div className="relative aspect-square bg-muted">
                      <Image src={img.url} alt={img.name} fill className="object-cover" sizes="100px" />
                    </div>
                    <Badge className="absolute left-1 top-1 bg-blue-600 text-xs px-1.5 py-0">Nouveau</Badge>

                    {/* Remove button */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button
                        size="sm"
                        variant="destructive"
                        className="h-6 px-2 text-xs"
                        onClick={() => onRemoveNewImage(img.url)}
                      >
                        <Trash2 className="mr-0.5 h-3 w-3" />
                        X
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {existingImages.length === 0 && newImages.length === 0 && (
            <div className="text-center text-xs text-muted-foreground py-4">
              Aucune image. Téléchargez la première pour commencer.
            </div>
          )}
      </div>

      {/* Image preview modal */}
      <Dialog open={!!previewImage} onOpenChange={(open) => !open && setPreviewImage(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-sm">Aperçu</DialogTitle>
          </DialogHeader>
          {previewImage && (
            <div className="relative aspect-video bg-muted">
              <Image src={previewImage} alt="Preview" fill className="object-contain" />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
