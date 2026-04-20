import { useState, useEffect } from "react";
import { BarChart3, TrendingUp, Wrench, Package, Download, FileText, Table, ShoppingCart } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell, Legend } from "recharts";
import { toast } from "sonner";
import { getServices } from "@/lib/serviceStore";
import { getTransactions, Transaction } from "@/lib/transactionStore";
import { exportLaporanPDF, exportLaporanExcel } from "@/lib/exportLaporan";
import { getMonthlyChartData, getServiceByBrand, getTopServices, getPaymentSummary, getKasirStats } from "@/lib/serviceStats";
import LaporanServiceDetail from "@/components/LaporanServiceDetail";
import LaporanProdukDetail from "@/components/LaporanProdukDetail";
import { ServiceData } from "@/components/ServiceCard";

const COLORS = [
  "hsl(213, 94%, 50%)", "hsl(25, 95%, 53%)", "hsl(142, 71%, 45%)",
  "hsl(38, 92%, 50%)", "hsl(280, 65%, 60%)",
];

type DetailView = null | "service" | "produk";

const Laporan = () => {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [detailView, setDetailView] = useState<DetailView>(null);
  const [services, setServices] = useState<ServiceData[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getServices(), getTransactions()])
      .then(([s, t]) => { setServices(s); setTransactions(t); })
      .finally(() => setLoading(false));
  }, []);

  const kasirStats = getKasirStats(transactions);
  const monthlyData = getMonthlyChartData(services, transactions);
  const serviceByBrand = getServiceByBrand(services);
  const topServices = getTopServices(services);
  const { totalIncome: serviceIncome, lunas, belumLunas } = getPaymentSummary(services);
  const totalService = services.length;

  const totalIncome = serviceIncome + kasirStats.totalKasirIncome;
  const totalProdukTerjual = kasirStats.topProducts.reduce((s, p) => s + p.qty, 0);

  const handleExportPDF = async () => {
    await exportLaporanPDF(services, monthlyData, serviceByBrand, topServices);
    setShowExportMenu(false);
    toast.success("Laporan berhasil di-export ke PDF!");
  };

  const handleExportExcel = async () => {
    await exportLaporanExcel(services, monthlyData, serviceByBrand, topServices);
    setShowExportMenu(false);
    toast.success("Laporan berhasil di-export ke Excel (CSV)!");
  };

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground text-sm">Memuat data...</div>
      </div>
    );
  }

  if (detailView === "service") {
    return <LaporanServiceDetail services={services} onBack={() => setDetailView(null)} />;
  }
  if (detailView === "produk") {
    return <LaporanProdukDetail services={services} kasirStats={kasirStats} onBack={() => setDetailView(null)} />;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">Laporan</h1>
          <div className="relative">
            <button onClick={() => setShowExportMenu(!showExportMenu)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-card border border-border/50 text-xs font-medium text-foreground">
              <Download className="w-3.5 h-3.5" /> Export
            </button>
            {showExportMenu && (
              <div className="absolute right-0 top-full mt-2 w-44 glass-card rounded-xl overflow-hidden shadow-lg z-50 animate-fade-in">
                <button onClick={handleExportPDF} className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-foreground hover:bg-muted/50 transition-colors">
                  <FileText className="w-4 h-4 text-destructive" /> Export PDF
                </button>
                <button onClick={handleExportExcel} className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-foreground hover:bg-muted/50 transition-colors border-t border-border/30">
                  <Table className="w-4 h-4 text-success" /> Export Excel (CSV)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="stat-card">
            <TrendingUp className="w-5 h-5 text-success mb-2" />
            <p className="text-lg font-bold text-foreground">{totalIncome >= 1000000 ? `IDR ${(totalIncome / 1000000).toFixed(1)}JT` : `IDR ${(totalIncome / 1000).toFixed(0)}K`}</p>
            <p className="text-[10px] text-muted-foreground">Pendapatan Total</p>
          </div>
          <div className="stat-card">
            <ShoppingCart className="w-5 h-5 text-accent mb-2" />
            <p className="text-lg font-bold text-foreground">{kasirStats.totalTransactions}</p>
            <p className="text-[10px] text-muted-foreground">Transaksi Kasir</p>
          </div>
          <button onClick={() => setDetailView("service")} className="stat-card text-left active:scale-[0.97] transition-transform">
            <Wrench className="w-5 h-5 text-primary mb-2" />
            <p className="text-lg font-bold text-foreground">{totalService}</p>
            <p className="text-[10px] text-muted-foreground">Total Service →</p>
          </button>
          <button onClick={() => setDetailView("produk")} className="stat-card text-left active:scale-[0.97] transition-transform">
            <Package className="w-5 h-5 text-info mb-2" />
            <p className="text-lg font-bold text-foreground">{totalProdukTerjual}</p>
            <p className="text-[10px] text-muted-foreground">Produk Terjual →</p>
          </button>
        </div>

        <div className="glass-card rounded-xl p-4">
          <p className="text-sm font-semibold text-foreground mb-3">Rincian Pendapatan</p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm"><span className="text-muted-foreground flex items-center gap-2"><Wrench className="w-3.5 h-3.5" /> Service</span><span className="font-medium text-foreground">IDR {serviceIncome.toLocaleString("id-ID")}</span></div>
            <div className="flex justify-between text-sm"><span className="text-muted-foreground flex items-center gap-2"><ShoppingCart className="w-3.5 h-3.5" /> Penjualan Kasir</span><span className="font-medium text-foreground">IDR {kasirStats.totalKasirIncome.toLocaleString("id-ID")}</span></div>
            <div className="border-t border-border/50 pt-2 flex justify-between text-sm"><span className="font-bold text-foreground">Total</span><span className="font-bold text-primary">IDR {totalIncome.toLocaleString("id-ID")}</span></div>
          </div>
        </div>

        <div className="glass-card rounded-xl p-4">
          <p className="text-sm font-semibold text-foreground mb-3">Pendapatan Bulanan</p>
          {monthlyData.some((d) => d.income > 0) ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyData}>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis hide />
                <Tooltip formatter={(value: number, name: string) => [`IDR ${value >= 1000000 ? (value / 1000000).toFixed(1) + "JT" : (value / 1000).toFixed(0) + "K"}`, name === "serviceIncome" ? "Service" : "Kasir"]}
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "0.75rem", fontSize: 12 }} />
                <Legend formatter={(value) => (value === "serviceIncome" ? "Service" : "Kasir")} wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="serviceIncome" stackId="a" fill="hsl(var(--primary))" radius={[0, 0, 0, 0]} />
                <Bar dataKey="kasirIncome" stackId="a" fill="hsl(var(--accent))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (<p className="text-xs text-muted-foreground text-center py-8">Belum ada data pendapatan</p>)}
        </div>

        {serviceByBrand.length > 0 && (
          <div className="glass-card rounded-xl p-4">
            <p className="text-sm font-semibold text-foreground mb-3">Service per Merk</p>
            <div className="flex items-center">
              <ResponsiveContainer width="50%" height={150}>
                <PieChart><Pie data={serviceByBrand} cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={3} dataKey="value">
                  {serviceByBrand.map((_, index) => (<Cell key={index} fill={COLORS[index % COLORS.length]} />))}
                </Pie></PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 flex-1">
                {serviceByBrand.map((item, index) => (
                  <div key={item.name} className="flex items-center gap-2 text-xs">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="text-muted-foreground flex-1">{item.name}</span>
                    <span className="font-medium text-foreground">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {kasirStats.topProducts.length > 0 && (
          <div className="glass-card rounded-xl p-4">
            <p className="text-sm font-semibold text-foreground mb-3">Produk Terlaris (Kasir)</p>
            <div className="space-y-3">
              {kasirStats.topProducts.slice(0, 5).map((item, i) => {
                const maxQty = kasirStats.topProducts[0]?.qty || 1;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-muted-foreground w-5">{i + 1}</span>
                    <div className="flex-1"><p className="text-sm font-medium text-foreground">{item.name}</p><p className="text-[10px] text-muted-foreground">{item.qty} terjual · IDR {item.revenue >= 1000000 ? (item.revenue / 1000000).toFixed(1) + "JT" : (item.revenue / 1000).toFixed(0) + "K"}</p></div>
                    <div className="w-20 h-1.5 rounded-full bg-secondary overflow-hidden"><div className="h-full rounded-full gradient-accent" style={{ width: `${(item.qty / maxQty) * 100}%` }} /></div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {topServices.length > 0 && (
          <div className="glass-card rounded-xl p-4 mb-6">
            <p className="text-sm font-semibold text-foreground mb-3">Service Terbanyak</p>
            <div className="space-y-3">
              {topServices.map((item, i) => {
                const maxCount = topServices[0]?.count || 1;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-muted-foreground w-5">{i + 1}</span>
                    <div className="flex-1"><p className="text-sm font-medium text-foreground">{item.name}</p><p className="text-[10px] text-muted-foreground">{item.count} kali · IDR {item.revenue >= 1000000 ? (item.revenue / 1000000).toFixed(1) + "JT" : (item.revenue / 1000).toFixed(0) + "K"}</p></div>
                    <div className="w-20 h-1.5 rounded-full bg-secondary overflow-hidden"><div className="h-full rounded-full gradient-primary" style={{ width: `${(item.count / maxCount) * 100}%` }} /></div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Laporan;
