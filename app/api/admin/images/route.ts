import { NextRequest, NextResponse } from 'next/server'
import { requireAdminRequest, jsonError } from '@/lib/admin/auth'

const BUCKET = 'entity-images'
const MAX_FILE_SIZE = 8 * 1024 * 1024
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])

function extensionFor(file: File) {
    const fromName = file.name.split('.').pop()?.toLowerCase()
    if (fromName) return fromName.replace(/[^a-z0-9]/g, '')
    return file.type.split('/')[1] || 'jpg'
}

async function ensureBucket(req: NextRequest, bucketName: string) {
    const auth = await requireAdminRequest(req)
    if ('response' in auth) return auth

    const { data } = await auth.context.supabase.storage.getBucket(bucketName)
    if (data) return auth

    const { error } = await auth.context.supabase.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: MAX_FILE_SIZE,
        allowedMimeTypes: [...ALLOWED_TYPES],
    })
    if (error && !error.message.toLowerCase().includes('already exists')) throw error

    return auth
}

export async function POST(req: NextRequest) {
    const auth = await ensureBucket(req, BUCKET)
    if ('response' in auth) return auth.response

    try {
        const formData = await req.formData()
        const files = formData.getAll('files').filter((value): value is File => value instanceof File)
        const folder = String(formData.get('folder') || 'other').replace(/[^a-z0-9\-_/]/gi, '') || 'other'

        if (files.length === 0) {
            return NextResponse.json({ error: 'No image files uploaded' }, { status: 400 })
        }

        const urls: string[] = []

        for (const file of files) {
            if (!ALLOWED_TYPES.has(file.type)) {
                return NextResponse.json({ error: `${file.name} is not a supported image type` }, { status: 400 })
            }

            if (file.size > MAX_FILE_SIZE) {
                return NextResponse.json({ error: `${file.name} is larger than 8MB` }, { status: 400 })
            }

            const extension = extensionFor(file)
            const path = `${folder}/${crypto.randomUUID()}.${extension}`
            const { error } = await auth.context.supabase.storage.from(BUCKET).upload(path, file, {
                cacheControl: '31536000',
                contentType: file.type,
                upsert: false,
            })
            if (error) throw error

            const { data } = auth.context.supabase.storage.from(BUCKET).getPublicUrl(path)
            urls.push(data.publicUrl)
        }

        return NextResponse.json({ urls })
    } catch (error) {
        return jsonError(error, 'Failed to upload images')
    }
}
