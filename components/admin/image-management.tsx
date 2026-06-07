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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Gestion des images</span>
            <Badge variant="secondary">{existingImages.length + newImages.length} images</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Upload new images section */}
          <div className="rounded-lg border-2 border-dashed border-muted-foreground/25 p-6 text-center">
            <input
              type="file"
              id="image-upload"
              multiple
              accept="image/*"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="hidden"
            />
            <label htmlFor="image-upload" className="cursor-pointer">
              <Button variant="outline" disabled={isUploading} asChild>
                <span>
                  <Plus className="mr-2 h-4 w-4" />
                  {isUploading ? 'Téléchargement...' : 'Ajouter des images'}
                </span>
              </Button>
            </label>
            <p className="mt-2 text-sm text-muted-foreground">Glissez des fichiers ou cliquez pour sélectionner</p>
          </div>

          {/* Existing images section */}
          {existingImages.length > 0 && (
            <div>
              <h4 className="mb-3 font-medium">Images existantes ({existingImages.length})</h4>
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {existingImages.map((url, index) => (
                  <div
                    key={url}
                    className={`group relative overflow-hidden rounded-lg border-2 transition-all ${
                      imagesToRemove.has(url) ? 'border-destructive bg-destructive/10' : 'border-border hover:border-primary'
                    }`}
                  >
                    <div className="relative aspect-square bg-muted">
                      <Image src={url} alt={`Product image ${index + 1}`} fill className="object-cover" sizes="150px" />
                    </div>

                    {/* Badge for primary image */}
                    {index === 0 && !imagesToRemove.has(url) && (
                      <Badge className="absolute left-2 top-2 bg-primary">Image principale</Badge>
                    )}

                    {/* Controls overlay */}
                    <div className={`absolute inset-0 flex flex-col items-center justify-center gap-2 transition-all ${imagesToRemove.has(url) ? 'bg-destructive/80' : 'bg-black/60 opacity-0 group-hover:opacity-100'}`}>
                      {/* Preview button */}
                      <Button size="sm" variant="secondary" onClick={() => setPreviewImage(url)}>
                        <Eye className="h-4 w-4" />
                      </Button>

                      {/* Remove checkbox */}
                      <div className="flex items-center gap-2 rounded-md bg-white/20 px-2 py-1 backdrop-blur">
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
                        />
                        <label htmlFor={`remove-${url}`} className="text-xs font-medium text-white cursor-pointer">
                          {imagesToRemove.has(url) ? 'À supprimer' : 'Supprimer'}
                        </label>
                      </div>
                    </div>

                    {/* Reorder buttons (visible when not marked for deletion) */}
                    {!imagesToRemove.has(url) && (
                      <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        {index > 0 && (
                          <Button
                            size="icon"
                            variant="secondary"
                            className="h-6 w-6"
                            onClick={() => moveImageUp(index)}
                            title="Déplacer vers le haut"
                          >
                            <span>↑</span>
                          </Button>
                        )}
                        {index < existingImages.length - 1 && (
                          <Button
                            size="icon"
                            variant="secondary"
                            className="h-6 w-6"
                            onClick={() => moveImageDown(index)}
                            title="Déplacer vers le bas"
                          >
                            <span>↓</span>
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
              <h4 className="mb-3 font-medium text-blue-600">Nouvelles images ({newImages.length})</h4>
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {newImages.map((img) => (
                  <div key={img.url} className="group relative overflow-hidden rounded-lg border-2 border-blue-400 bg-blue-50">
                    <div className="relative aspect-square bg-muted">
                      <Image src={img.url} alt={img.name} fill className="object-cover" sizes="150px" />
                    </div>
                    <Badge className="absolute left-2 top-2 bg-blue-600">Nouveau</Badge>

                    {/* Remove button */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => onRemoveNewImage(img.url)}
                      >
                        <Trash2 className="mr-1 h-4 w-4" />
                        Supprimer
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {existingImages.length === 0 && newImages.length === 0 && (
            <div className="text-center text-sm text-muted-foreground py-8">
              Aucune image. Téléchargez la première image pour commencer.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Image preview modal */}
      <Dialog open={!!previewImage} onOpenChange={(open) => !open && setPreviewImage(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Aperçu de l&apos;image</DialogTitle>
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
