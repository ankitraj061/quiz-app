import Sidebar from './/Sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      {/* Make Sidebar fixed */}
      <div className="fixed left-0 top-0 h-screen w-64">
        <Sidebar />
      </div>

      {/* Page content with margin-left */}
      <main className="ml-64 flex-1 h-screen overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

