// GENERATED FROM COPILOT PROMPT: DevPilot Phase3 MVP - adapt as needed
import { clsx } from "clsx";

type Props = {
  role: string;
};

export const RoleBadge = ({ role }: Props) => {
  const color = role === "admin" ? "bg-emerald-100 text-emerald-700" : role === "operator" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-700";
  return <span className={clsx("rounded-full px-3 py-1 text-xs font-semibold", color)}>{role}</span>;
};

