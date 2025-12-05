import { Outlet } from "react-router-dom";

export default function PolicyHolderLayout() {
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-secondary via-background to-primary">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border p-6">
        <h2 className="text-2xl font-bold text-foreground mb-8">Policy Holder</h2>

        <nav className="space-y-2">
          {/* Navigation links will be added here */}
        </nav>
      </aside>

      {/* Main Area */}
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}


