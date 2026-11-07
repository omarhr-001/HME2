'use client'

export async function adminFetch<T>(input: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers)
  if (init?.body && !(init.body instanceof FormData)) {
    headers.set('content-type', 'application/json')
  }

  const response = await fetch(input, { ...init, headers })
  if (!response.ok) {
    const payload = await response.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(payload.reason || payload.error || 'Request failed')
  }
  return response.json()
}

export async function downloadAdminFile(input: string, filename: string) {
  const response = await fetch(input)
  if (!response.ok) throw new Error('Export failed')

  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export async function adminUpload<T>(input: string, body: FormData): Promise<T> {
  const response = await fetch(input, { method: 'POST', body })
  if (!response.ok) {
    const payload = await response.json().catch(() => ({ error: 'Upload failed' }))
    throw new Error(payload.reason || payload.error || 'Upload failed')
  }
  return response.json()
}
