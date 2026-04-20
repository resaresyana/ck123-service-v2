import { ArrowLeft } from "lucide-react";
import { ServiceData } from "@/components/ServiceCard";

interface Props {
  services: ServiceData[];
  onBack: () => void;
}

const LaporanServiceDetail = ({ services, onBack }: Props) => {
  const totalService = services.length;
  const statusCount = {
    masuk: services.filter((s) => s.status === "masuk").length,
    proses: services.filter((s) => s.status === "proses").length,
    selesai: services.filter((s) => s.status === "selesai").length,
    diambil: services.filter((s) => s.status === "diambil").length,
    cancel: services.filter((s) => s.status === "cancel").length,
  };

  const colors: Record<string, string> = {
    masuk: "bg-info", proses: "bg-warning", selesai: "bg-success",
    diambil: "bg-muted-foreground", cancel: "bg-destructive",
  };
  const labels: Record<string, string> = {
    masuk: "Masuk", proses: "Dalam Proses", selesai: "Selesai",
    diambil: "Diambil", cancel: "Cancel",
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-xl bg-card border border-border/50">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-xl font-bold text-foreground">Total Service</h1>
        </div>
      </div>
      <div className="px-4 space-y-4">
        <div className="glass-card rounded-xl p-4">
          <p className="text-3xl font-bold text-foreground text-center mb-1">{totalService}</p>
          <p className="text-xs text-muted-foreground text-center">Total semua service</p>
        </div>
        <div className="glass-card rounded-xl p-4 space-y-3">
          <p className="text-sm font-semibold text-foreground">Berdasarkan Status</p>
          {Object.entries(statusCount).map(([key, count]) => (
            <div key={key} className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${colors[key]}`} />
              <span className="text-sm text-foreground flex-1">{labels[key]}</span>
              <span className="text-sm font-bold text-foreground">{count}</span>
              <div className="w-20 h-1.5 rounded-full bg-secondary overflow-hidden">
                <div className={`h-full rounded-full ${colors[key]}`} style={{ width: `${totalService > 0 ? (count / totalService) * 100 : 0}%` }} />
              </div>
            </div>
          ))}
        </div>
        <div className="glass-card rounded-xl p-4 space-y-2">
          <p className="text-sm font-semibold text-foreground mb-2">Daftar Service Terbaru</p>
          {services.slice(0, 10).map((sv) => (
            <div key={sv.id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{sv.customerName}</p>
                <p className="text-[10px] text-muted-foreground">{sv.deviceBrand} {sv.deviceModel} · {sv.invoice}</p>
              </div>
              <div className="text-right flex-shrink-0 ml-2">
                <p className="text-xs font-medium text-foreground">IDR {sv.totalCost.toLocaleString("id-ID")}</p>
                <p className="text-[10px] text-muted-foreground capitalize">{sv.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LaporanServiceDetail;
