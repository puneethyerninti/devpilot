import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Navigate, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AppShell from "./components/ui/AppShell";
import JobsPage from "./pages/JobsPage";
import JobDetail from "./pages/JobDetail";
import WorkersPage from "./pages/WorkersPage";
import { navItems } from "./config/navigation";
// Create a client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            retry: 1,
        },
    },
});
const App = () => {
    return (_jsx(QueryClientProvider, { client: queryClient, children: _jsx(AppShell, { appName: "DevPilot", navItems: navItems, maxWidth: "full", children: _jsxs(Routes, { children: [_jsx(Route, { path: "/jobs", element: _jsx(JobsPage, {}) }), _jsx(Route, { path: "/jobs/:id", element: _jsx(JobDetail, {}) }), _jsx(Route, { path: "/workers", element: _jsx(WorkersPage, {}) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { replace: true, to: "/jobs" }) })] }) }) }));
};
export default App;
