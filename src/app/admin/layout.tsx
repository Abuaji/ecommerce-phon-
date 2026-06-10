import { AdminSidebar } from "@components/layouts/admin/sidebar";
import { AdminTopBar } from "@components/layouts/admin/top-bar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Sidebar overlay placeholder could go here */}
      <AdminSidebar />
      
      <div className="md:pl-64 flex flex-col min-h-screen">
        <AdminTopBar />
        <main className="flex-1">
          <div className="px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
