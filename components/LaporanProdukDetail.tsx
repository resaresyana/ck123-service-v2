import { ArrowLeft, ShoppingCart, Wrench } from "lucide-react";
import { ServiceData } from "@/components/ServiceCard";

interface KasirProduct {
  name: string;
  qty: number;
  revenue: number;
  category: string;
}

interface KasirStats {
  totalTransactions: number;
  totalKasirIncome: number;
  topProducts: KasirProduct[];
  transactions: { id: string; invoice: string; total: number; createdAt: string; createdTime: string; items: { name: string; price: number; qty: number }[] }[];
}

interface Props {
  services: ServiceData[];
  kasirStats: KasirStats;
  onBack: () => void;
}

const LaporanProdukDetail = ({ services, kasirStats, onBack }: Props) => {
  // Service-derived products
  const serviceMap: Record<string, { qty: number; revenue: number }> = {};
  services.forEach((s) => {
    const key = `${s.deviceBrand} - ${s.complaint.split(",")[0].trim()}`;
    if (!serviceMap[key]) serviceMap[key] = { qty: 0, revenue: 0 };
    serviceMap[key].qty++;
    serviceMap[key].revenue += s.totalCost;
  });
  const serviceProducts = Object.entries(serviceMap)
    .map(([name, data]) => ({ name, qty: data.qty, revenue: data.revenue, source: "service" as const }))
    .sort((a, b) => b.qty - a.qty);

  // Kasir products
  const kasirProducts = kasirStats.topProducts.map((p) => ({
    name: p.name,
    qty: p.qty,
    revenue: p.revenue,
    source: "kasir" as const,
  }));

  const totalServiceRev = serviceProducts.reduce((s, p) => s + p.revenue, 0);
  const totalKasirRev = kasirProducts.reduce((s, p) => s + p.revenue, 0);
  const totalKasirQty = kasirProducts.reduce((s, p) => s + p.qty, 0);

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-xl bg-card border border-border/50">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-xl font-bold text-foreground">Produk / Jasa Terjual</h1>
        </div>
      </div>
      <div className="px-4 space-y-4">
        {/* Summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="glass-card rounded-xl p-4 text-center">
            <Wrench className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">{serviceProducts.length}</p>
            <p className="text-[10px] text-muted-foreground">Jasa Service</p>
            <p className="text-xs font-medium text-primary mt-1">IDR {totalServiceRev.toLocaleString("id-ID")}</p>
          </div>
          <div className="glass-card rounded-xl p-4 text-center">
            <ShoppingCart className="w-5 h-5 text-accent mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">{totalKasirQty}</p>
            <p className="text-[10px] text-muted-foreground">Produk Kasir</p>
            <p className="text-xs font-medium text-accent mt-1">IDR {totalKasirRev.toLocaleString("id-ID")}</p>
          </div>
        </div>

        {/* Kasir Products */}
        {kasirProducts.length > 0 && (
          <div className="glass-card rounded-xl p-4 space-y-2">
            <p className="text-sm font-semibold text-foreground mb-2">Penjualan Produk (Kasir)</p>
            {kasirProducts.map((p, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-xs font-bold text-muted-foreground w-5">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                    <p className="text-[10px] text-muted-foreground">{p.qty} terjual</p>
                  </div>
                </div>
                <p className="text-xs font-medium text-accent flex-shrink-0">IDR {p.revenue.toLocaleString("id-ID")}</p>
              </div>
            ))}
          </div>
        )}

        {/* Recent kasir transactions */}
        {kasirStats.transactions.length > 0 && (
          <div className="glass-card rounded-xl p-4 space-y-2">
            <p className="text-sm font-semibold text-foreground mb-2">Riwayat Transaksi Kasir</p>
            {kasirStats.transactions.slice(-10).reverse().map((tx) => (
              <div key={tx.id} className="py-2 border-b border-border/30 last:border-0">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-medium text-foreground">{tx.invoice}</p>
                    <p className="text-[10px] text-muted-foreground">{tx.createdAt} · {tx.createdTime}</p>
                    <p className="text-[10px] text-muted-foreground">{tx.items.length} item</p>
                  </div>
                  <p className="text-sm font-bold text-accent">IDR {tx.total.toLocaleString("id-ID")}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Service Products */}
        {serviceProducts.length > 0 && (
          <div className="glass-card rounded-xl p-4 space-y-2 mb-6">
            <p className="text-sm font-semibold text-foreground mb-2">Jasa Service</p>
            {serviceProducts.map((p, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-xs font-bold text-muted-foreground w-5">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                    <p className="text-[10px] text-muted-foreground">{p.qty} unit/jasa</p>
                  </div>
                </div>
                <p className="text-xs font-medium text-primary flex-shrink-0">IDR {p.revenue.toLocaleString("id-ID")}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LaporanProdukDetail;
