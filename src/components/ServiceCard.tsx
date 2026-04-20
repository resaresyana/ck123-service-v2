import { Smartphone, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export interface ServiceData {
  id: string;
  customerName: string;
  phone: string;
  deviceBrand: string;
  deviceModel: string;
  complaint: string;
  status: "antrian" | "masuk" | "proses" | "selesai" | "diambil" | "cancel";
  totalCost: number;
  dpAmount: number;
  createdAt: string;
  invoice: string;
  notes?: string;
  technicianId?: string | null;
}

export const statusConfig = {
  antrian: { label: "Antrian", className: "bg-amber-500/10 text-amber-500 border border-amber-500/20" },
  masuk: { label: "Masuk", className: "bg-info/10 text-info border border-info/20" },
  proses: { label: "Proses", className: "bg-warning/10 text-warning border border-warning/20" },
  selesai: { label: "Selesai", className: "bg-success/10 text-success border border-success/20" },
  diambil: { label: "Diambil", className: "bg-muted text-muted-foreground border border-border" },
  cancel: { label: "Cancel", className: "bg-destructive/10 text-destructive border border-destructive/20" },
};

const ServiceCard = ({ service }: { service: ServiceData }) => {
  const navigate = useNavigate();
  const status = statusConfig[service.status];
  

  return (
    <button
      onClick={() => navigate(`/service/${service.id}`)}
      className="w-full glass-card-elevated rounded-2xl p-4 text-left transition-all duration-200 active:scale-[0.98] animate-fade-in group"
    >
      <div className="flex items-start gap-3">
        <div className="p-2.5 rounded-xl bg-primary/8 border border-primary/10 transition-colors group-hover:bg-primary/12">
          <Smartphone className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1.5">
            <p className="font-semibold text-sm text-foreground truncate">{service.customerName}</p>
            <div className="flex items-center gap-1 flex-shrink-0 ml-2">
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${status.className}`}>
                {status.label}
              </span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">{service.deviceBrand} {service.deviceModel}</p>
          <p className="text-[11px] text-muted-foreground/70 truncate mt-0.5 leading-relaxed">{service.complaint}</p>
          <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-border/30">
            <p className="text-[11px] font-mono font-medium text-primary/80">{service.invoice}</p>
            <p className="text-xs font-semibold text-foreground">IDR {service.totalCost.toLocaleString("id-ID")}</p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground/40 mt-1 flex-shrink-0 transition-transform group-active:translate-x-0.5" />
      </div>
    </button>
  );
};

export default ServiceCard;
