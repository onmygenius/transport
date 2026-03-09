import { AdminSidebar } from '@/components/admin/sidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="pt-16 md:pt-0 md:pl-64">
        {children}
      </div>
    </div>
  )
}
