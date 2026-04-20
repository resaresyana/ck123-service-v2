import { useState, useEffect } from "react";
import { ArrowLeft, Phone, MessageCircle, FileText, Share2, User, Smartphone, Wrench, ClipboardList, CreditCard, Calendar, Hash, Lock, StickyNote, ChevronDown } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { getServices, updateServiceStatus, updateServicePayment, ServiceStatus } from "@/lib/serviceStore";
import { ServiceData } from "@/components/ServiceCard";
import NotaFormatPicker from "@/components/NotaFormatPicker";
import { toast } from "sonner";
import { getShopInfo } from "@/lib/shopStore";
import { getWaTemplates, renderTemplate, WaTemplate } from "@/lib/waTemplateStore";

const statusConfig: Record<string, { label: string; className: string }> = {
  antrian: { label: "Antrian", className: "bg-amber-500/15 text-amber-500" },
  masuk: { label: "Masuk", className: "bg-info/15 text-info" },
  proses: { label: "Proses", className: "bg-warning/15 text-warning" },
  selesai: { label: "Selesai", className: "bg-success/15 text-success" },
  diambil: { label: "Diambil", className: "bg-muted text-muted-foreground" },
  cancel: { label: "Cancel", className: "bg-destructive/15 text-destructive" },
};

const statusOptions: { value: ServiceStatus; label: string }[] = [
  { value: "masuk", label: "Masuk" },
  { value: "proses", label: "Proses" },
  { value: "selesai", label: "Selesai" },
  { value: "diambil", label: "Diambil" },
  { value: "cancel", label: "Cancel" },
];

/** Parse enriched complaint field */
const parseComplaint = (complaint: string) => {
  const fields: Record<string, string> = {};
  const parts = complaint.split(" | ");
  fields.keluhan = parts[0] || complaint;

  parts.slice(1).forEach((part) => {
    const idx = part.indexOf(": ");
    if (idx > 0) {
      const key = part.substring(0, idx).trim().toLowerCase();
      const val = part.substring(idx + 2).trim();
      if (val) fields[key] = val;
    }
  });

  return fields;
};

const ServiceDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [showNotaPicker, setShowNotaPicker] = useState(false);
  const [showFollowUpMenu, setShowFollowUpMenu] = useState(false);
  const [waTemplates, setWaTemplates] = useState<WaTemplate[]>([]);
  const [service, setService] = useState<ServiceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getServices().then((services) => {
      setService(services.find((s) => s.id === id) || null);
    }).finally(() => setLoading(false));
    getWaTemplates().then(setWaTemplates);
  }, [id]);

  const handleStatusChange = async (newStatus: ServiceStatus) => {
    if (!service) return;
    try {
      await updateServiceStatus(service.id, newStatus);
      setService({ ...service, status: newStatus });
      toast.success(`Status diubah ke ${newStatus}`);
    } catch {
      toast.error("Gagal mengubah status");
    }
  };

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">Memuat data...</p>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="page-container flex items-center justify-center">
        <p className="text-muted-foreground">Service tidak ditemukan</p>
      </div>
    );
  }

  const status = statusConfig[service.status];
  const remaining = service.totalCost - service.dpAmount;
  const isPaid = remaining <= 0 && service.totalCost > 0;
  const fields = parseComplaint(service.complaint);

  const dateStr = new Date(service.createdAt).toLocaleDateString("id-ID", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  const sendFollowUpWA = async (template: WaTemplate) => {
    const phone = service.phone?.replace(/^0/, "62") || "";
    const shop = await getShopInfo();
    const remaining = service.totalCost - service.dpAmount;
    const isPaidNow = remaining <= 0 && service.totalCost > 0;

    const vars: Record<string, string> = {
      nama: service.customerName,
      perangkat: `${service.deviceBrand} ${service.deviceModel || ""}`.trim(),
      invoice: service.invoice,
      toko: shop.name,
      alamat: shop.address,
      telepon: shop.phone,
      total: service.totalCost.toLocaleString("id-ID"),
      dp: service.dpAmount.toLocaleString("id-ID"),
      sisa: Math.max(0, remaining).toLocaleString("id-ID"),
      status_lunas: isPaidNow ? " (LUNAS ✅)" : "",
    };

    const rendered = renderTemplate(template.message, vars);
    const message = encodeURIComponent(`*${shop.name}*\n\n${rendered}`);
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
    setShowFollowUpMenu(false);
  };

  const handleWhatsApp = () => {
    setShowFollowUpMenu(true);
  };

  const InfoRow = ({ label, value, icon: Icon }: { label: string; value: string; icon?: any }) => (
    <div className="flex items-start gap-3 py-2">
      {Icon && (
        <div className="p-1.5 rounded-lg bg-primary/8 mt-0.5 flex-shrink-0">
          <Icon className="w-3.5 h-3.5 text-primary" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">{label}</p>
        <p className="text-sm text-foreground mt-0.5">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="page-container pb-6">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl glass-card-elevated active:scale-95 transition-transform">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-extrabold text-foreground tracking-tight">Detail Service</h1>
            <p className="text-[11px] text-muted-foreground font-medium">{service.invoice}</p>
          </div>
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${status.className}`}>{status.label}</span>
        </div>
      </div>

      <div className="px-4 space-y-4">
        {/* Tanggal */}
        <div className="glass-card-elevated rounded-2xl p-4 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/8">
            <Calendar className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">Tanggal Masuk</p>
            <p className="text-sm font-medium text-foreground">{dateStr}</p>
          </div>
        </div>

        {/* Data Pelanggan */}
        <div className="glass-card-elevated rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-4 h-4 text-primary" />
            <p className="text-sm font-bold text-foreground">Data Pelanggan</p>
          </div>
          <p className="text-base font-bold text-foreground">{service.customerName}</p>
          <p className="text-sm text-muted-foreground">{service.phone || "-"}</p>
          <div className="flex gap-2 mt-3">
            <a href={`tel:${service.phone}`} className="flex-1 py-2.5 rounded-xl bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center gap-1.5 active:scale-[0.97] transition-transform">
              <Phone className="w-3.5 h-3.5" /> Telepon
            </a>
            <button onClick={handleWhatsApp} className="flex-1 py-2.5 rounded-xl bg-success/10 text-success text-xs font-semibold flex items-center justify-center gap-1.5 active:scale-[0.97] transition-transform">
              <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
            </button>
          </div>
        </div>

        {/* Data Perangkat */}
        <div className="glass-card-elevated rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Smartphone className="w-4 h-4 text-primary" />
            <p className="text-sm font-bold text-foreground">Data Perangkat</p>
          </div>
          <div className="grid grid-cols-2 gap-x-4">
            <InfoRow label="Merk" value={service.deviceBrand} />
            <InfoRow label="Model" value={service.deviceModel || "-"} />
          </div>
          {fields.imei && <InfoRow label="IMEI / Serial" value={fields.imei} icon={Hash} />}
          {fields["pin/pola"] && <InfoRow label="Pin / Pola HP" value={fields["pin/pola"]} icon={Lock} />}
        </div>

        {/* Keluhan & Service */}
        <div className="glass-card-elevated rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Wrench className="w-4 h-4 text-primary" />
            <p className="text-sm font-bold text-foreground">Keluhan & Service</p>
          </div>

          <div className="space-y-1">
            <InfoRow label="Keluhan" value={fields.keluhan} icon={ClipboardList} />
            {fields.teknisi && <InfoRow label="Teknisi" value={fields.teknisi} icon={User} />}
            {fields.tindakan && <InfoRow label="Tindakan Teknisi" value={fields.tindakan} icon={Wrench} />}
            {fields.sparepart && <InfoRow label="Sparepart Diganti" value={fields.sparepart} icon={ClipboardList} />}
            {fields.catatan && <InfoRow label="Catatan Tambahan" value={fields.catatan} icon={StickyNote} />}
          </div>
        </div>

        {/* Pembayaran */}
        <div className="glass-card-elevated rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-primary" />
              <p className="text-sm font-bold text-foreground">Pembayaran</p>
            </div>
            <button
              onClick={async () => {
                if (!service) return;
                try {
                  if (isPaid) {
                    // Set back to belum lunas: reset DP to 0
                    await updateServicePayment(service.id, { dp_amount: 0 });
                    setService({ ...service, dpAmount: 0 });
                    toast.success("Status diubah ke Belum Lunas");
                  } else {
                    // Set to lunas: set DP = total cost
                    await updateServicePayment(service.id, { dp_amount: service.totalCost });
                    setService({ ...service, dpAmount: service.totalCost });
                    toast.success("Status diubah ke Lunas");
                  }
                } catch {
                  toast.error("Gagal mengubah status pembayaran");
                }
              }}
              className={`text-[10px] font-bold px-2.5 py-1 rounded-full active:scale-95 transition-all ${isPaid ? "bg-success/15 text-success" : "bg-warning/15 text-warning"}`}
            >
              {isPaid ? "LUNAS ✅" : "BELUM LUNAS"}
            </button>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Estimasi Biaya</span>
              <span className="font-semibold text-foreground">IDR {service.totalCost.toLocaleString("id-ID")}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Down Payment (DP)</span>
              <span className="text-success font-medium">IDR {service.dpAmount.toLocaleString("id-ID")}</span>
            </div>
            <div className="border-t border-border/40 pt-2 flex justify-between text-sm font-bold">
              <span className="text-foreground">Sisa Pembayaran</span>
              <span className={isPaid ? "text-success" : "text-warning"}>
                IDR {Math.max(0, remaining).toLocaleString("id-ID")}
              </span>
            </div>
          </div>
        </div>

        {/* Status Update */}
        <div className="glass-card-elevated rounded-2xl p-4">
          <p className="text-sm font-bold text-foreground mb-3">Ubah Status</p>
          <div className="flex gap-2 flex-wrap">
            {statusOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleStatusChange(opt.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  service.status === opt.value
                    ? "gradient-primary text-primary-foreground shadow-md"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => setShowNotaPicker(true)} className="py-3 rounded-xl gradient-primary text-primary-foreground text-sm font-bold flex items-center justify-center gap-2 active:scale-[0.97] transition-transform shadow-[0_8px_24px_-4px_hsl(var(--primary)/0.4)]">
            <FileText className="w-4 h-4" /> Cetak Nota
          </button>
          <button onClick={handleWhatsApp} className="py-3 rounded-xl gradient-success text-primary-foreground text-sm font-bold flex items-center justify-center gap-2 active:scale-[0.97] transition-transform shadow-[0_8px_24px_-4px_hsl(var(--success)/0.4)]">
            <Share2 className="w-4 h-4" /> Share WA
          </button>
        </div>
      </div>

      {/* Follow Up WhatsApp Menu */}
      {showFollowUpMenu && (
        <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center" onClick={() => setShowFollowUpMenu(false)}>
          <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" />
          <div className="relative w-full max-w-md bg-card rounded-t-2xl lg:rounded-2xl p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-success" />
                <h3 className="text-base font-bold text-foreground">Follow Up WhatsApp</h3>
              </div>
              <button onClick={() => setShowFollowUpMenu(false)} className="p-1.5 rounded-lg bg-secondary">
                <ArrowLeft className="w-4 h-4 text-secondary-foreground" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground mb-4">Pilih jenis pesan follow up untuk pelanggan:</p>
            <div className="space-y-3">
              {waTemplates.map((t) => {
                const colorMap: Record<string, string> = {
                  pengecekan: "bg-info/10 border-info/20",
                  perbaikan: "bg-warning/10 border-warning/20",
                  selesai: "bg-success/10 border-success/20",
                };
                const colorClass = colorMap[t.key] || "bg-secondary border-border/30";
                return (
                  <button
                    key={t.id}
                    onClick={() => sendFollowUpWA(t)}
                    className={`w-full py-3.5 px-4 rounded-xl border text-left active:scale-[0.98] transition-transform ${colorClass}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{t.icon}</span>
                      <div>
                        <p className="text-sm font-bold text-foreground">{t.title}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{t.message.substring(0, 60)}...</p>
                      </div>
                    </div>
                  </button>
                );
              })}
              {waTemplates.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-4">Belum ada template. Tambahkan di Pengaturan.</p>
              )}
            </div>
          </div>
        </div>
      )}

      <NotaFormatPicker service={service} open={showNotaPicker} onClose={() => setShowNotaPicker(false)} />
    </div>
  );
};

export default ServiceDetail;
