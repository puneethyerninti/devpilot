// GENERATED FROM COPILOT PROMPT: DevPilot Phase3 MVP - adapt as needed
import { Link, useLocation } from "react-router-dom";
import { clsx } from "clsx";
import { useMeQuery } from "@/lib/api";
import { RoleBadge } from "./RoleBadge";

const links = [
  { to: "/jobs", label: "Jobs" },
  { to: "/workers", label: "Workers" }
];

export const Nav = () => {
  const location = useLocation();
  const { data: me } = useMeQuery();

  return (
    <nav className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-white/60 backdrop-blur">
      <div className="flex items-center gap-6">
        <span className="text-xl font-semibold tracking-tight">DevPilot</span>
        <div className="flex gap-4 text-sm text-slate-600">
          {links.map((link) => (
            <Link key={link.to} to={link.to} className={clsx(location.pathname.startsWith(link.to) && "text-brand font-semibold")}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
      {me && (
        <div className="flex items-center gap-3 text-sm">
          <span className="text-slate-700">{me.login}</span>
          <RoleBadge role={me.role} />
        </div>
      )}
    </nav>
  );
};

