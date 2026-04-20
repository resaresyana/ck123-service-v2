import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft, CalendarCheck, Phone, Smartphone, MessageCircle,
  ChevronDown, RefreshCw, Inbox, Wrench, Save,
} from "lucide-react";
import { toast } from "sonner";
import {
  getServices,
  updateServiceStatus,
  updateServiceEstimate,
  updateServiceTechnician,
  getTechnicians,
  type ServiceStatus,
} from "@/lib/serviceStore";
import { statusConfig } from "@/components/ServiceCard";
import { getCachedShopInfo } from "@/lib/shopStore";

const STATUS_FLOW: ServiceStatus[] = ["antrian", "masuk", "proses", "selesai", "diambil", "cancel"];
const FILTER_TABS: { value: "all" | ServiceStatus; label: string }[] = [
  { value: "all", label: "Semua" },
  { value: "antrian", label: "Antrian Baru" },
  { value: "masuk", label: "Masuk" },
  { value: "proses", label: "Proses" },
  { value: "selesai", label: "Selesai" },
];

const normalizePhone = (raw: string) => {
  let n = (raw || "").replace(/\D/g, "");
  if (n.startsWith("0")) n = "62" + n.slice(1);
  return n;
};

const Booking = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [filter, setFilter] = useState<"all" | ServiceStatus>("antrian");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, { cost: string; notes: string }>>({});
  const shop = getCachedShopInfo();

  const { data: services = [], isLoading, refetch, isFetching } = useQuery({
    queryKey: ["services"],
    queryFn: getServices,
    staleTime: 30_000,
  });

  const { data: technicians = [] } = useQuery({
    queryKey: ["technicians"],
    queryFn: getTechnicians,
    staleTime: 60_000,
  });

  // Sync drafts when services list changes (preserve unsaved edits)
  useEffect(() => {
    setDrafts((prev) => {
      const next: Record<string, { cost: string; notes: string }> = {};
      for (const s of services) {
        next[s.id] = prev[s.id] ?? {
          cost: s.totalCost ? String(s.totalCost) : "",
          notes: s.notes ?? "",
        };
      }
      return next;
    });
  }, [services]);

  const filtered = useMemo(() => {
    const list = filter === "all" ? services : services.filter((s) => s.status === filter);
    return list;
  }, [services, filter]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: services.length };
    for (const s of services) c[s.status] = (c[s.status] || 0) + 1;
    return c;
  }, [services]);

  const isDirty = (svc: typeof services[number]) => {
    const d = drafts[svc.id];
    if (!d) return false;
    const cost = Number(d.cost.replace(/\D/g, "")) || 0;
    return cost !== svc.totalCost || (d.notes || "") !== (svc.notes || "");
  };

  const handleStatusChange = async (id: string, status: ServiceStatus) => {
    setUpdatingId(id);
    try {
      await updateServiceStatus(id, status);
      await qc.invalidateQueries({ queryKey: ["services"] });
      toast.success("Status diperbarui");
    } catch (e: any) {
      toast.error(e?.message || "Gagal memperbarui status");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSaveEstimate = async (id: string) => {
    const d = drafts[id];
    if (!d) return;
    const cost = Number(d.cost.replace(/\D/g, "")) || 0;
    setSavingId(id);
    try {
      await updateServiceEstimate(id, { total_cost: cost, notes: d.notes.trim() });
      await qc.invalidateQueries({ queryKey: ["services"] });
      toast.success("Estimasi & catatan part disimpan");
    } catch (e: any) {
      toast.error(e?.message || "Gagal menyimpan");
    } finally {
      setSavingId(null);
    }
  };

  const handleTechnicianChange = async (id: string, technicianId: string) => {
    setUpdatingId(id);
    try {
      await updateServiceTechnician(id, technicianId || null);
      await qc.invalidateQueries({ queryKey: ["services"] });
      toast.success("Teknisi diperbarui");
    } catch (e: any) {
      toast.error(e?.message || "Gagal mengubah teknisi");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleWa = (svc: typeof services[number]) => {
    const phone = normalizePhone(svc.phone);
    if (!phone) {
      toast.error("Nomor WA pelanggan tidak tersedia");
      return;
    }
    const statusLabel = statusConfig[svc.status]?.label || svc.status;
    const d = drafts[svc.id];
    const cost = d ? Number(d.cost.replace(/\D/g, "")) || svc.totalCost : svc.totalCost;
    const notes = d?.notes?.trim() || svc.notes || "";
    const lines = [
      `Halo ${svc.customerName}, terima kasih sudah booking di *${shop.name}*.`,
      ``,
      `📋 Detail booking Anda:`,
      `• No. Booking: ${svc.invoice}`,
      `• Perangkat: ${svc.deviceBrand} ${svc.deviceModel}`,
      `• Keluhan: ${svc.complaint}`,
      `• Status: *${statusLabel}*`,
    ];
    if (notes) {
      lines.push(``, `🔧 Part / perbaikan yang dibutuhkan:`, notes);
    }
    if (cost > 0) {
      lines.push(``, `💰 Estimasi biaya: *Rp ${cost.toLocaleString("id-ID")}*`);
    }
    lines.push(``, `Mohon konfirmasi apakah Anda menyetujui estimasi di atas. Terima kasih 🙏`);
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(lines.join("\n"))}`, "_blank");
  };

  const formatCostInput = (val: string) => {
    const digits = val.replace(/\D/g, "");
    if (!digits) return "";
    return Number(digits).toLocaleString("id-ID");
  };

  return (
    <div className="page-container">
      <div className="page-header gradient-hero lg:rounded-2xl lg:mx-4 lg:mt-4 rounded-b-3xl mb-2">
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl glass-card-elevated active:scale-95 transition-transform"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground font-medium">Manajemen</p>
            <h1 className="text-xl lg:text-2xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-primary" />
              Booking Konsumen
            </h1>
          </div>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2 rounded-xl glass-card-elevated active:scale-95 transition-transform disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 text-foreground ${isFetching ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="px-4 mb-4">
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
          {FILTER_TABS.map((tab) => {
            const active = filter === tab.value;
            const count = counts[tab.value] || 0;
            return (
              <button
                key={tab.value}
                onClick={() => setFilter(tab.value)}
                className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  active
                    ? "gradient-primary text-primary-foreground shadow-md shadow-primary/30"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {tab.label}
                {count > 0 && (
                  <span className={`text-[10px] px-1.5 rounded-full ${active ? "bg-primary-foreground/20" : "bg-background/60"}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* List */}
      <div className="px-4 space-y-3 pb-24">
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-16">
            <Inbox className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Tidak ada booking pada filter ini</p>
          </div>
        )}

        {filtered.map((svc) => {
          const status = statusConfig[svc.status];
          const isUpdating = updatingId === svc.id;
          const isSaving = savingId === svc.id;
          const draft = drafts[svc.id] ?? { cost: "", notes: "" };
          const dirty = isDirty(svc);
          return (
            <div
              key={svc.id}
              className="glass-card-elevated rounded-2xl p-4 animate-fade-in"
            >
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-primary/8 border border-primary/10 flex-shrink-0">
                  <Smartphone className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-foreground truncate">{svc.customerName}</p>
                      <p className="text-xs text-muted-foreground truncate">{svc.deviceBrand} {svc.deviceModel}</p>
                    </div>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md flex-shrink-0 ${status.className}`}>
                      {status.label}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground/80 leading-relaxed mb-2">{svc.complaint}</p>

                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground mb-3 pt-2 border-t border-border/30">
                    <span className="font-mono font-medium text-primary/80">{svc.invoice}</span>
                    {svc.phone && (
                      <span className="inline-flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {svc.phone}
                      </span>
                    )}
                  </div>

                  {/* Estimasi & catatan part */}
                  <div className="grid sm:grid-cols-[180px_1fr] gap-2 mb-3">
                    <div>
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                        💰 Estimasi Biaya
                      </label>
                      <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-muted-foreground pointer-events-none">Rp</span>
                        <input
                          inputMode="numeric"
                          value={draft.cost ? formatCostInput(draft.cost) : ""}
                          onChange={(e) =>
                            setDrafts((p) => ({
                              ...p,
                              [svc.id]: { ...draft, cost: e.target.value.replace(/\D/g, "") },
                            }))
                          }
                          placeholder="0"
                          className="w-full pl-8 pr-2 py-1.5 rounded-lg bg-secondary text-foreground text-xs font-semibold border border-border/40 focus:outline-none focus:ring-2 focus:ring-primary/40"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Wrench className="w-3 h-3" /> Part / Perbaikan
                      </label>
                      <textarea
                        value={draft.notes}
                        onChange={(e) =>
                          setDrafts((p) => ({
                            ...p,
                            [svc.id]: { ...draft, notes: e.target.value },
                          }))
                        }
                        placeholder="Contoh: Ganti LCD, baterai, konektor charger"
                        rows={2}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-secondary text-foreground text-xs border border-border/40 focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                      />
                    </div>
                  </div>

                  {/* Teknisi */}
                  <div className="mb-3">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                      👨‍🔧 Teknisi yang Mengerjakan
                    </label>
                    <div className="relative">
                      <select
                        value={svc.technicianId ?? ""}
                        onChange={(e) => handleTechnicianChange(svc.id, e.target.value)}
                        disabled={isUpdating}
                        className="appearance-none w-full pl-3 pr-7 py-1.5 rounded-lg bg-secondary text-foreground text-xs font-semibold border border-border/40 focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50"
                      >
                        <option value="">— Belum ditugaskan —</option>
                        {technicians.map((t) => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                        {technicians.length === 0 && (
                          <option disabled value="__empty">Tidak ada teknisi aktif. Tambah di Pengaturan → Karyawan</option>
                        )}
                      </select>
                      <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Status select */}
                    <div className="relative">
                      <select
                        value={svc.status}
                        onChange={(e) => handleStatusChange(svc.id, e.target.value as ServiceStatus)}
                        disabled={isUpdating}
                        className="appearance-none pl-3 pr-7 py-1.5 rounded-lg bg-secondary text-foreground text-xs font-semibold border border-border/40 focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50"
                      >
                        {STATUS_FLOW.map((s) => (
                          <option key={s} value={s}>{statusConfig[s].label}</option>
                        ))}
                      </select>
                      <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" />
                    </div>

                    <button
                      onClick={() => handleSaveEstimate(svc.id)}
                      disabled={!dirty || isSaving}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20 text-xs font-bold hover:bg-primary/15 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Save className="w-3.5 h-3.5" />
                      {isSaving ? "Menyimpan..." : "Simpan Estimasi"}
                    </button>

                    <button
                      onClick={() => handleWa(svc)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-success/10 text-success border border-success/20 text-xs font-bold hover:bg-success/15 active:scale-95 transition-all"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      Follow Up WA
                    </button>

                    <button
                      onClick={() => navigate(`/service/${svc.id}`)}
                      className="text-xs font-bold text-primary hover:underline ml-auto"
                    >
                      Detail →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Booking;
