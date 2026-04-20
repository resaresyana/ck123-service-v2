import { LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  gradient: "primary" | "accent" | "success";
  subtitle?: string;
  to?: string;
}

const gradientMap = {
  primary: "gradient-primary",
  accent: "gradient-accent",
  success: "gradient-success",
};

const shadowMap = {
  primary: "shadow-[0_8px_24px_-6px_hsl(var(--primary)/0.35)]",
  accent: "shadow-[0_8px_24px_-6px_hsl(var(--accent)/0.35)]",
  success: "shadow-[0_8px_24px_-6px_hsl(var(--success)/0.35)]",
};

const StatCard = ({ title, value, icon: Icon, gradient, subtitle, to }: StatCardProps) => {
  const navigate = useNavigate();

  return (
    <div
      className={`stat-card animate-fade-in group ${to ? "cursor-pointer hover:scale-[1.03] active:scale-95 transition-transform" : ""}`}
      onClick={() => to && navigate(to)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-xl ${gradientMap[gradient]} ${shadowMap[gradient]} transition-transform duration-300 group-active:scale-95`}>
          <Icon className="w-4 h-4 text-primary-foreground" />
        </div>
      </div>
      <p className="text-2xl font-extrabold text-foreground tracking-tight">{value}</p>
      <p className="text-[11px] text-muted-foreground mt-1 font-medium">{title}</p>
      {subtitle && <p className="text-[10px] text-muted-foreground/60 mt-0.5">{subtitle}</p>}
    </div>
  );
};

export default StatCard;
