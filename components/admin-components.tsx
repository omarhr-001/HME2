import { ReactNode } from 'react'

export function StatCard({ icon: Icon, title, value }: {
  icon: any
  title: string
  value: string | number
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className="bg-green-100 rounded-lg p-3">
          <Icon className="w-6 h-6 text-green-600" />
        </div>
      </div>
    </div>
  )
}

export function DashboardCard({ children, className = '' }: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${className}`}>
      {children}
    </div>
  )
}

export function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
    processing: { bg: 'bg-blue-100', text: 'text-blue-800' },
    shipped: { bg: 'bg-purple-100', text: 'text-purple-800' },
    delivered: { bg: 'bg-green-100', text: 'text-green-800' },
    'in-stock': { bg: 'bg-green-100', text: 'text-green-800' },
    'out-of-stock': { bg: 'bg-red-100', text: 'text-red-800' },
  }

  const color = colors[status] || { bg: 'bg-gray-100', text: 'text-gray-800' }

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${color.bg} ${color.text}`}>
      {status}
    </span>
  )
}
