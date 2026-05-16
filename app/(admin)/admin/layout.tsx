import { AdminSidebar } from '@/components/admin-sidebar'
import { AdminGuard } from '@/components/admin-guard'

export const metadata = {
  title: 'Admin Dashboard',
  description: 'Tableau de bord administrateur',
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar />
        <main className="flex-1 md:ml-64 pt-16 md:pt-0">
          <div className="p-4 md:p-8">{children}</div>
        </main>
      </div>
    </AdminGuard>
  )
}
