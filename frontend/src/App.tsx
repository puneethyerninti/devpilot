import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AppShell from "./components/ui/AppShell";
import JobsPage from "./pages/JobsPage";
import JobDetail from "./pages/JobDetail";
import WorkersPage from "./pages/WorkersPage";
import { navItems } from "./config/navigation";
import ParticleBackground from "./components/ui/ParticleBackground";
import { ToastProvider, useToast } from "./components/ui/Toast";
import CommandPalette, { useCommandPalette } from "./components/ui/CommandPalette";
import FloatingActionButton from "./components/ui/FloatingActionButton";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

const AppContent = (): JSX.Element => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { isOpen, setIsOpen } = useCommandPalette();

  // Command palette commands
  const commands = [
    {
      id: 'jobs',
      label: 'View Jobs',
      description: 'Navigate to jobs dashboard',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      onSelect: () => navigate('/jobs'),
      keywords: ['dashboard', 'queue', 'tasks'],
    },
    {
      id: 'workers',
      label: 'View Workers',
      description: 'Navigate to workers page',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      onSelect: () => navigate('/workers'),
      keywords: ['agents', 'processors'],
    },
    {
      id: 'theme',
      label: 'Toggle Theme',
      description: 'Switch between light and dark mode',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      ),
      onSelect: () => {
        document.body.classList.toggle('theme-dark');
        showToast('success', 'Theme updated successfully');
      },
      keywords: ['dark', 'light', 'appearance'],
    },
  ];

  // Floating action button actions
  const fabActions = [
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
      label: 'New Job',
      onClick: () => showToast('info', 'New job creation coming soon!'),
      variant: 'primary' as const,
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      label: 'Search',
      onClick: () => setIsOpen(true),
      variant: 'success' as const,
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      label: 'Settings',
      onClick: () => showToast('info', 'Settings panel coming soon!'),
      variant: 'warning' as const,
    },
  ];

  return (
    <>
      <ParticleBackground />
      <AppShell
        appName="DevPilot"
        navItems={navItems}
        maxWidth="full"
      >
        <Routes>
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="/workers" element={<WorkersPage />} />
          <Route path="*" element={<Navigate replace to="/jobs" />} />
        </Routes>
      </AppShell>
      <FloatingActionButton actions={fabActions} />
      <CommandPalette commands={commands} isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

const App = (): JSX.Element => {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </QueryClientProvider>
  );
};

export default App;

