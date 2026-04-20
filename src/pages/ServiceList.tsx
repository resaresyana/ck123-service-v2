import { useState, useMemo } from "react";
import { Plus, Search, Filter, MoreVertical, Trash2, RefreshCw, Wrench } from "lucide-react";
import ServiceCard from "@/components/ServiceCard";
import { statusConfig, ServiceData } from "@/components/ServiceCard";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getServices, deleteService, updateServiceStatus, ServiceStatus } from "@/lib/serviceStore";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
  DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const statusFilters = ["Semua", "Masuk", "Proses", "Selesai", "Diambil", "Cancel"];
const statusOptions: ServiceStatus[] = ["masuk", "proses", "selesai", "diambil", "cancel"];

const ServiceList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const initialFilter = searchParams.get("status");
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState(
    initialFilter ? initialFilter.charAt(0).toUpperCase() + initialFilter.slice(1) : "Semua"
  );
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const { data: services = [], isLoading } = useQuery({
    queryKey: ["services"],
    queryFn: getServices,
    staleTime: 60_000,
  });
  const loading = isLoading && services.length === 0;

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const filterLower = activeFilter.toLowerCase();
    return services.filter((s) => {
      const matchSearch =
        !q ||
        s.customerName.toLowerCase().includes(q) ||
        s.invoice.toLowerCase().includes(q) ||
        s.deviceBrand.toLowerCase().includes(q);
      const matchFilter = activeFilter === "Semua" || s.status === filterLower;
      return matchSearch && matchFilter;
    });
  }, [services, search, activeFilter]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteService(deleteTarget);
    queryClient.setQueryData<ServiceData[]>(["services"], (prev = []) => prev.filter((s) => s.id !== deleteTarget));
    setDeleteTarget(null);
    toast.success("Service berhasil dihapus");
  };

  const handleStatusChange = async (id: string, status: ServiceStatus) => {
    await updateServiceStatus(id, status);
    queryClient.setQueryData<ServiceData[]>(["services"], (prev = []) => prev.map((s) => s.id === id ? { ...s, status } : s));
    toast.success(`Status diubah ke ${statusConfig[status].label}`);
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

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-extrabold text-foreground tracking-tight">Service</h1>
          <p className="text-[11px] text-muted-foreground font-medium">{filtered.length} data</p>
        </div>
        <div className="relative mb-3">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Cari nama, invoice, merk..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field !pl-10" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
          {statusFilters.map((f) => (
            <button key={f} onClick={() => setActiveFilter(f)}
              className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all ${
                activeFilter === f ? "gradient-primary text-primary-foreground shadow-[0_4px_12px_-2px_hsl(var(--primary)/0.3)]" : "bg-secondary text-secondary-foreground"
              }`}>{f}</button>
          ))}
        </div>
      </div>

      <div className="px-4 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <Wrench className="w-8 h-8 text-muted-foreground/30" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Tidak ada service ditemukan</p>
            <p className="text-[11px] text-muted-foreground/60 mt-1">Coba ubah filter atau kata kunci</p>
          </div>
        ) : (
          filtered.map((service) => (
            <div key={service.id} className="relative">
              <ServiceCard service={service} />
              <div className="absolute top-3 right-3 z-10">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-1.5 rounded-lg bg-card/90 backdrop-blur border border-border/40 hover:bg-secondary transition-colors" onClick={(e) => e.stopPropagation()}>
                      <MoreVertical className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger><RefreshCw className="w-4 h-4 mr-2" />Ubah Status</DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                        {statusOptions.map((s) => (
                          <DropdownMenuItem key={s} disabled={service.status === s} onClick={(e) => { e.stopPropagation(); handleStatusChange(service.id, s); }}>
                            <span className={`w-2 h-2 rounded-full mr-2 ${s === "masuk" ? "bg-info" : s === "proses" ? "bg-warning" : s === "selesai" ? "bg-success" : s === "cancel" ? "bg-destructive" : "bg-muted-foreground"}`} />
                            {statusConfig[s].label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={(e) => { e.stopPropagation(); setDeleteTarget(service.id); }}>
                      <Trash2 className="w-4 h-4 mr-2" />Hapus Service
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))
        )}
      </div>

      <button onClick={() => navigate("/service/new")}
        className="fixed bottom-24 lg:bottom-8 right-4 lg:right-8 z-40 w-14 h-14 rounded-2xl gradient-primary shadow-[0_8px_24px_-4px_hsl(var(--primary)/0.4)] flex items-center justify-center active:scale-90 transition-transform">
        <Plus className="w-6 h-6 text-primary-foreground" />
      </button>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent className="glass-card-elevated rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-extrabold">Hapus Service?</AlertDialogTitle>
            <AlertDialogDescription>Data service akan dihapus permanen dan tidak bisa dikembalikan.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl">Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ServiceList;
