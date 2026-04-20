import { useState, useEffect, useMemo } from "react";
import { ArrowLeft, CalendarIcon, Search, Receipt, ShoppingCart, ChevronDown, ChevronUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { id as localeID } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { getTransactions, Transaction } from "@/lib/transactionStore";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

const RiwayatTransaksi = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTransactions().then(setAllTransactions).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let result = [...allTransactions].sort((a, b) => b.timestamp - a.timestamp);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((t) => t.invoice.toLowerCase().includes(q) || t.items.some((i) => i.name.toLowerCase().includes(q)));
    }
    if (dateFrom) { const fromStr = format(dateFrom, "yyyy-MM-dd"); result = result.filter((t) => t.createdAt >= fromStr); }
    if (dateTo) { const toStr = format(dateTo, "yyyy-MM-dd"); result = result.filter((t) => t.createdAt <= toStr); }
    return result;
  }, [allTransactions, search, dateFrom, dateTo]);

  const totalFiltered = filtered.reduce((s, t) => s + t.total, 0);
  const clearFilter = () => { setDateFrom(undefined); setDateTo(undefined); setSearch(""); };
  const hasFilter = !!dateFrom || !!dateTo || !!search;

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground text-sm">Memuat data...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-card border border-border/50"><ArrowLeft className="w-5 h-5 text-foreground" /></button>
          <h1 className="text-xl font-bold text-foreground">Riwayat Transaksi</h1>
        </div>
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Cari invoice atau produk..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-10" />
        </div>
        <div className="flex gap-2 items-center">
          <Popover>
            <PopoverTrigger asChild>
              <button className={cn("flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-card border border-border/50 text-xs", dateFrom ? "text-foreground font-medium" : "text-muted-foreground")}>
                <CalendarIcon className="w-3.5 h-3.5" />{dateFrom ? format(dateFrom, "dd MMM yyyy", { locale: localeID }) : "Dari tanggal"}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} initialFocus className={cn("p-3 pointer-events-auto")} /></PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger asChild>
              <button className={cn("flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-card border border-border/50 text-xs", dateTo ? "text-foreground font-medium" : "text-muted-foreground")}>
                <CalendarIcon className="w-3.5 h-3.5" />{dateTo ? format(dateTo, "dd MMM yyyy", { locale: localeID }) : "Sampai tanggal"}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end"><Calendar mode="single" selected={dateTo} onSelect={setDateTo} initialFocus className={cn("p-3 pointer-events-auto")} /></PopoverContent>
          </Popover>
          {hasFilter && (<button onClick={clearFilter} className="px-3 py-2.5 rounded-xl bg-destructive/10 text-destructive text-xs font-medium whitespace-nowrap">Reset</button>)}
        </div>
      </div>

      <div className="px-4 space-y-3 pb-24">
        <div className="glass-card rounded-xl p-4 flex items-center justify-between">
          <div><p className="text-xs text-muted-foreground">{filtered.length} transaksi{hasFilter ? " (filtered)" : ""}</p><p className="text-lg font-bold text-foreground">IDR {totalFiltered.toLocaleString("id-ID")}</p></div>
          <ShoppingCart className="w-6 h-6 text-accent" />
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12"><Receipt className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" /><p className="text-sm text-muted-foreground">Tidak ada transaksi ditemukan</p></div>
        ) : (
          filtered.map((tx) => {
            const isExpanded = expandedId === tx.id;
            return (
              <button key={tx.id} onClick={() => setExpandedId(isExpanded ? null : tx.id)} className="w-full glass-card rounded-xl p-4 text-left active:scale-[0.98] transition-all animate-fade-in">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">{tx.invoice}</p>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{tx.createdAt} · {tx.createdTime} · {tx.items.length} item</p>
                  </div>
                  <p className="text-sm font-bold text-accent flex-shrink-0">IDR {tx.total.toLocaleString("id-ID")}</p>
                </div>
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-border/30 space-y-1.5 animate-fade-in">
                    {tx.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-xs"><span className="text-muted-foreground">{item.qty}x {item.name}</span><span className="text-foreground font-medium">IDR {(item.price * item.qty).toLocaleString("id-ID")}</span></div>
                    ))}
                    <div className="border-t border-border/30 pt-2 mt-2 space-y-1">
                      <div className="flex justify-between text-xs"><span className="text-muted-foreground">Bayar</span><span className="text-foreground">IDR {tx.bayar.toLocaleString("id-ID")}</span></div>
                      <div className="flex justify-between text-xs"><span className="text-muted-foreground">Kembalian</span><span className="text-success font-medium">IDR {tx.kembalian.toLocaleString("id-ID")}</span></div>
                    </div>
                  </div>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default RiwayatTransaksi;
