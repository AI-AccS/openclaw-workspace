import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Command Centre | Project Management",
  description: "Kanban-style project management system for autonomous work tracking",
};

export default function CommandCentre() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent mb-4">
            Command Centre
          </h1>
          <p className="text-xl text-muted mb-8">
            Visual Project Management & Work Queue System
          </p>

          {/* Demo Notice */}
          <div className="max-w-2xl mx-auto bg-card border border-card-border rounded-xl p-6 mb-8">
            <h2 className="text-lg font-semibold mb-3">🎉 Phase 1 Complete!</h2>
            <p className="text-muted mb-4">
              The Kanban board is ready with the HMRC Auto-Call System loaded. You can:
            </p>
            <ul className="text-left text-sm space-y-2 text-muted">
              <li>✅ Drag tasks between columns</li>
              <li>✅ See priority levels and progress bars</li>
              <li>✅ View checklist completion</li>
              <li>✅ Check dependencies and due dates</li>
              <li>✅ See real-time stats and overall progress</li>
            </ul>

            <div className="mt-6 p-4 bg-primary/10 border border-primary/20 rounded-lg">
              <p className="text-sm">
                <strong>Current Status:</strong> HMRC Auto-Call System at 50% complete
                (3 of 6 phases done, Phase 2 in progress)
              </p>
            </div>
          </div>

          {/* Loading State */}
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-card-border rounded w-1/3 mx-auto"></div>
            <div className="grid grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-card-border rounded"></div>
              ))}
            </div>
          </div>

          <p className="text-muted mt-8">
            Loading interactive board...
          </p>
        </div>
      </div>
    </div>
  );
}
