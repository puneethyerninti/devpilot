import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import PageHeader from '../components/ui/PageHeader';
import EmptyState from '../components/ui/EmptyState';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Skeleton from '../components/ui/Skeleton';
import { useJobsQuery } from '../lib/api';
const JobsPage = () => {
    const navigate = useNavigate();
    const [filter, setFilter] = useState('all');
    const { data: jobs, isLoading } = useJobsQuery({ status: filter === 'all' ? undefined : filter });
    const filteredJobs = useMemo(() => {
        if (!jobs)
            return [];
        if (filter === 'all')
            return jobs;
        return jobs.filter((job) => job.status === filter);
    }, [jobs, filter]);
    const stats = useMemo(() => {
        const base = { total: jobs?.length ?? 0, queued: 0, processing: 0, done: 0, failed: 0, avgRisk: 0 };
        if (!jobs?.length)
            return base;
        let riskSum = 0;
        let riskCount = 0;
        jobs.forEach((job) => {
            const key = job.status;
            if (key in base)
                base[key] += 1;
            if (typeof job.riskScore === 'number') {
                riskSum += job.riskScore;
                riskCount += 1;
            }
        });
        base.avgRisk = riskCount ? Number((riskSum / riskCount).toFixed(2)) : 0;
        return base;
    }, [jobs]);
    const getStatusBadgeVariant = (status) => {
        switch (status) {
            case 'queued': return 'warning';
            case 'processing': return 'primary';
            case 'done': return 'success';
            case 'failed': return 'danger';
            default: return 'default';
        }
    };
    const filterButtons = [
        { key: 'all', label: 'All Jobs', count: stats.total },
        { key: 'queued', label: 'Queued', count: stats.queued },
        { key: 'processing', label: 'Processing', count: stats.processing },
        { key: 'done', label: 'Completed', count: stats.done },
        { key: 'failed', label: 'Failed', count: stats.failed },
    ];
    return (_jsxs("div", { className: "space-y-6", children: [_jsx(PageHeader, { title: "Job Control Room", subtitle: "Real-time queue, risk signals, and worker handoffs", actions: _jsxs(Button, { variant: "primary", size: "sm", children: [_jsx("svg", { className: "w-4 h-4 mr-2", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 6v6m0 0v6m0-6h6m-6 0H6" }) }), "New Job"] }) }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsx(Card, { className: "card-hover", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-text-secondary", children: "Total Jobs" }), _jsx("p", { className: "text-2xl font-bold text-text-primary", children: stats.total })] }), _jsx("div", { className: "h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center", children: _jsx("svg", { className: "w-5 h-5 text-primary-600", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" }) }) })] }) }), _jsx(Card, { className: "card-hover", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-text-secondary", children: "Processing" }), _jsx("p", { className: "text-2xl font-bold text-primary-600", children: stats.processing })] }), _jsx("div", { className: "h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center", children: _jsx(LoadingSpinner, { size: "sm", className: "text-primary-600" }) })] }) }), _jsx(Card, { className: "card-hover", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-text-secondary", children: "Completed" }), _jsx("p", { className: "text-2xl font-bold text-success-600", children: stats.done })] }), _jsx("div", { className: "h-10 w-10 rounded-lg bg-success-100 flex items-center justify-center", children: _jsx("svg", { className: "w-5 h-5 text-success-600", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M5 13l4 4L19 7" }) }) })] }) }), _jsx(Card, { className: "card-hover", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-text-secondary", children: "Avg Risk Score" }), _jsx("p", { className: "text-2xl font-bold text-warning-600", children: stats.avgRisk })] }), _jsx("div", { className: "h-10 w-10 rounded-lg bg-warning-100 flex items-center justify-center", children: _jsx("svg", { className: "w-5 h-5 text-warning-600", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" }) }) })] }) })] }), _jsx(Card, { children: _jsx("div", { className: "flex flex-wrap gap-2", children: filterButtons.map(({ key, label, count }) => (_jsxs(Button, { variant: filter === key ? 'primary' : 'ghost', size: "sm", onClick: () => setFilter(key), className: "relative", children: [label, _jsx(Badge, { variant: "default", className: "ml-2 text-xs", children: count })] }, key))) }) }), _jsx(Card, { children: isLoading ? (_jsx("div", { className: "space-y-4", children: Array.from({ length: 5 }).map((_, i) => (_jsxs("div", { className: "flex items-center space-x-4 p-4", children: [_jsx(Skeleton, { className: "h-10 w-10 rounded-full" }), _jsxs("div", { className: "space-y-2 flex-1", children: [_jsx(Skeleton, { className: "h-4 w-3/4" }), _jsx(Skeleton, { className: "h-3 w-1/2" })] }), _jsx(Skeleton, { className: "h-6 w-16" })] }, i))) })) : filteredJobs.length === 0 ? (_jsx(EmptyState, { icon: _jsx("svg", { className: "w-12 h-12 text-text-tertiary", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" }) }), title: "No jobs found", description: filter === 'all' ? "No jobs have been created yet." : `No jobs with status "${filter}".`, actionLabel: "Create First Job", onAction: () => { } })) : (_jsx("div", { className: "space-y-2", children: filteredJobs.map((job) => (_jsxs("div", { className: "flex items-center justify-between p-4 rounded-lg border border-border hover:bg-elevated cursor-pointer transition-colors", onClick: () => navigate(`/jobs/${job.id}`), children: [_jsxs("div", { className: "flex items-center space-x-4 flex-1", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("div", { className: "h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center", children: _jsx("span", { className: "text-sm font-medium text-primary-700", children: job.repoFullName.split('/')[0][0].toUpperCase() }) }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "text-sm font-medium text-text-primary truncate", children: job.repoFullName }), _jsxs("p", { className: "text-xs text-text-secondary", children: [job.prNumber ? `PR #${job.prNumber} • ` : '', new Date(job.createdAt).toLocaleDateString()] })] })] }), _jsxs("div", { className: "flex items-center space-x-4", children: [job.riskScore && (_jsxs(Badge, { variant: job.riskScore > 7 ? 'danger' : job.riskScore > 4 ? 'warning' : 'success', children: ["Risk: ", job.riskScore] })), _jsx(Badge, { variant: getStatusBadgeVariant(job.status), children: job.status }), _jsx("svg", { className: "w-4 h-4 text-text-tertiary", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5l7 7-7 7" }) })] })] }, job.id))) })) })] }));
};
export default JobsPage;
