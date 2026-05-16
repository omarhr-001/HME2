import { AdminGuard } from '@/components/admin-guard'
import { AdminSidebar } from '@/components/admin-components'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminGuard>
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 lg:ml-64 pt-16 lg:pt-0 min-h-screen bg-gray-50">
          <div className="p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </AdminGuard>
  )
}
