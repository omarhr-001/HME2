'use client'

import useSWR from 'swr'
import { useState } from 'react'
import { Pencil, Plus, Trash2, Search } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { EmptyState } from '@/components/admin/admin-shell'
import { adminFetch } from '@/lib/admin/client'

const formatDate = (date: string) => new Date(date).toLocaleDateString('fr-FR')
const statusLabel = (status: string) => status === 'active' ? 'Active' : 'Inactive'

function PromotionDialog({
    promotion,
    products,
    onSave,
}: {
    promotion?: any
    products: any[]
    onSave: (payload: any, id?: string) => Promise<void>
}) {
    const [open, setOpen] = useState(false)
    const [form, setForm] = useState<any>(
        promotion || {
            title: '',
            description: '',
            status: 'active',
            start_date: new Date().toISOString().split('T')[0],
            end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            image_url: '',
            product_ids: [],
        }
    )
    const [loading, setLoading] = useState(false)

    const handleSave = async () => {
        if (!form.title || !form.end_date) {
            toast.error('Le titre et la date de fin sont obligatoires')
            return
        }

        setLoading(true)
        try {
            await onSave(form, promotion?.id)
            setOpen(false)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant={promotion ? 'ghost' : 'default'} size={promotion ? 'icon' : 'default'}>
                    {promotion ? <Pencil className="h-4 w-4" /> : <><Plus className="mr-2 h-4 w-4" /> Ajouter une promotion</>}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{promotion ? 'Modifier la promotion' : 'Ajouter une promotion'}</DialogTitle>
                    <DialogDescription>Créez ou modifiez une offre spéciale.</DialogDescription>
                </DialogHeader>

                <div className="grid gap-4">
                    <div>
                        <Label>Titre</Label>
                        <Input
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            placeholder="Ex. Offres d'été"
                        />
                    </div>

                    <div>
                        <Label>Description</Label>
                        <Textarea
                            value={form.description || ''}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            placeholder="Ex. Offres spéciales sur une sélection de produits"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Date de début</Label>
                            <Input
                                type="date"
                                value={form.start_date?.split('T')[0] || ''}
                                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label>Date de fin</Label>
                            <Input
                                type="date"
                                value={form.end_date?.split('T')[0] || ''}
                                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <Label>URL de l'image</Label>
                        <Input
                            value={form.image_url || ''}
                            onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                            placeholder="https://..."
                        />
                    </div>

                    <div>
                        <Label>Sélectionner les produits</Label>
                        <div className="border rounded-lg max-h-48 overflow-y-auto p-3 space-y-2">
                            {products.map((product) => (
                                <label key={product.id} className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={form.product_ids?.includes(product.id) || false}
                                        onChange={(e) => {
                                            const newIds = e.target.checked
                                                ? [...(form.product_ids || []), product.id]
                                                : (form.product_ids || []).filter((id: number) => id !== product.id)
                                            setForm({ ...form, product_ids: newIds })
                                        }}
                                    />
                                    <span className="text-sm">{product.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Annuler
                    </Button>
                    <Button onClick={handleSave} disabled={loading}>
                        {loading ? 'Enregistrement...' : 'Enregistrer la promotion'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function ConfirmDelete({ onConfirm }: { onConfirm: () => Promise<void> }) {
    const [loading, setLoading] = useState(false)

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Trash2 className="h-4 w-4" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Supprimer cette promotion ?</AlertDialogTitle>
                    <AlertDialogDescription>Cette action est définitive.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={async () => {
                            setLoading(true)
                            try {
                                await onConfirm()
                            } finally {
                                setLoading(false)
                            }
                        }}
                        disabled={loading}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {loading ? 'Suppression...' : 'Supprimer'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export function PromotionsPage() {
    const [search, setSearch] = useState('')
    const [page, setPage] = useState(1)

    type Promotion = {
        id: string
        title: string
        description?: string
        status: string
        end_date: string
        promotion_products?: any[]
    }

    const { data: promotions = [], mutate: mutatePromotions } = useSWR<Promotion[]>(
        '/api/admin/promotions',
        adminFetch
    )
    type Product = {
        id: number
        name: string
    }

    const { data: products = [] } = useSWR<Product[]>(

        '/api/admin/products?limit=1000',
        adminFetch
    )

    const filtered = promotions.filter((p: any) =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.description?.toLowerCase().includes(search.toLowerCase())
    )

    const pageSize = 10
    const pageCount = Math.ceil(filtered.length / pageSize)
    const displayed = filtered.slice((page - 1) * pageSize, page * pageSize)

    async function savePromotion(payload: any, id?: string) {
        try {
            await adminFetch(
                id ? `/api/admin/promotions/${id}` : '/api/admin/promotions',
                {
                    method: id ? 'PATCH' : 'POST',
                    body: JSON.stringify(payload),
                }
            )
            toast.success(id ? 'Promotion mise à jour' : 'Promotion créée')
            mutatePromotions()
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Impossible d’enregistrer la promotion')
            throw error
        }
    }

    async function deletePromotion(id: string) {
        try {
            await adminFetch(`/api/admin/promotions/${id}`, { method: 'DELETE' })
            toast.success('Promotion supprimée')
            mutatePromotions()
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Impossible de supprimer la promotion')
            throw error
        }
    }

    return (
        <div className="space-y-5">
            <div className="flex gap-3">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Rechercher des promotions..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value)
                            setPage(1)
                        }}
                        className="pl-10"
                    />
                </div>
                <PromotionDialog products={products} onSave={savePromotion} />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Promotions ({filtered.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {displayed.length === 0 ? (
                        <EmptyState
                            title={search ? 'Aucune promotion trouvée' : 'Aucune promotion'}
                            description={search ? 'Essayez une autre recherche' : 'Créez votre première offre spéciale'}
                        />
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Titre</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Produits</TableHead>
                                        <TableHead>Expire le</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {displayed.map((promotion: any) => (
                                        <TableRow key={promotion.id}>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">{promotion.title}</p>
                                                    <p className="text-sm text-muted-foreground">{promotion.description}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={promotion.status === 'active' ? 'default' : 'secondary'}>
                                                    {statusLabel(promotion.status)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {promotion.promotion_products?.length || 0} produit(s)
                                            </TableCell>
                                            <TableCell>{formatDate(promotion.end_date)}</TableCell>
                                            <TableCell className="text-right">
                                                <PromotionDialog promotion={promotion} products={products} onSave={savePromotion} />
                                                <ConfirmDelete onConfirm={() => deletePromotion(promotion.id)} />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
