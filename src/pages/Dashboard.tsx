import { useMemo } from "react";
import { Wrench, DollarSign, Clock, CheckCircle, Plus, Bell, TrendingUp, CalendarCheck } from "lucide-react";
import StatCard from "@/components/StatCard";
import ServiceCard from "@/components/ServiceCard";
import { getServices } from "@/lib/serviceStore";
import { getTransactions } from "@/lib/transactionStore";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { getTodayStr, getServicesByDate, getWeeklyChartData, getPaymentSummary } from "@/lib/serviceStats";
import { getCachedShopInfo } from "@/lib/shopStore";
import { useQuery } from "@tanstack/react-query";

const Dashboard = () => {
  const navigate = useNavigate();

  const { data: allServices = [], isLoading: loadingS } = useQuery({
    queryKey: ["services"],
    queryFn: getServices,
    staleTime: 60_000,
  });
  const { data: transactions = [], isLoading: loadingT } = useQuery({
    queryKey: ["transactions"],
    queryFn: getTransactions,
    staleTime: 60_000,
  });
  const loading = (loadingS || loadingT) && allServices.length === 0 && transactions.length === 0;

  const { todayServices, chartData, totalIncome, inProcess, completed, bookingCount, recent } = useMemo(() => {
    const todayStr = getTodayStr();
    const today = getServicesByDate(allServices, todayStr);
    const chart = getWeeklyChartData(allServices, transactions);
    const { totalIncome } = getPaymentSummary(today);
    let inProc = 0, done = 0, masuk = 0, booking = 0;
    for (const s of allServices) {
      if (s.status === "proses") inProc++;
      else if (s.status === "selesai") done++;
      else if (s.status === "masuk") masuk++;
      else if (s.status === "antrian") booking++;
    }
    return {
      todayServices: today,
      chartData: chart,
      totalIncome,
      inProcess: inProc,
      completed: done,
      masukCount: masuk,
      bookingCount: booking,
      recent: allServices.slice(0, 5),
    };
  }, [allServices, transactions]);

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
      {/* Hero Header */}
      <div className="page-header gradient-hero lg:rounded-2xl lg:mx-4 lg:mt-4 rounded-b-3xl mb-2">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-muted-foreground font-medium">Selamat datang 👋</p>
            <h1 className="text-xl lg:text-2xl font-extrabold text-foreground tracking-tight">{getCachedShopInfo().name}</h1>
          </div>
          <button
            onClick={() => navigate("/booking")}
            className="p-2.5 rounded-xl glass-card-elevated relative active:scale-95 transition-transform"
            title="Booking baru dari konsumen"
          >
            <Bell className="w-5 h-5 text-foreground" />
            {bookingCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-accent border-2 border-card flex items-center justify-center text-[9px] font-bold text-accent-foreground animate-pulse">
                {bookingCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Booking Baru — highlighted card */}
      {bookingCount > 0 && (
        <div className="px-4 mb-4">
          <button
            onClick={() => navigate("/booking")}
            className="w-full glass-card-elevated rounded-2xl p-4 flex items-center gap-4 text-left active:scale-[0.99] transition-transform border border-accent/30"
          >
            <div className="p-3 rounded-xl bg-accent/15 border border-accent/30">
              <CalendarCheck className="w-5 h-5 text-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-accent uppercase tracking-wider">Booking Baru</p>
              <p className="text-sm font-semibold text-foreground">{bookingCount} antrian menunggu konfirmasi</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Klik untuk lihat & follow up via WA</p>
            </div>
            <span className="text-xs font-bold text-primary">Buka →</span>
          </button>
        </div>
      )}

      {/* Stats Grid — 2 cols mobile, 4 cols desktop */}
      <div className="px-4 grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard title="Service Hari Ini" value={todayServices.length} icon={Wrench} gradient="primary" to="/service" />
        <StatCard title="Pendapatan" value={`${(totalIncome / 1000).toFixed(0)}K`} icon={DollarSign} gradient="accent" subtitle={`IDR ${totalIncome.toLocaleString("id-ID")}`} to="/laporan" />
        <StatCard title="Dalam Proses" value={inProcess} icon={Clock} gradient="primary" to="/service?status=proses" />
        <StatCard title="Selesai" value={completed} icon={CheckCircle} gradient="success" to="/service?status=selesai" />
      </div>

      {/* Chart + Recent Services — stacked on mobile, side-by-side on desktop */}
      <div className="px-4 lg:grid lg:grid-cols-5 lg:gap-4 mb-6">
        {/* Chart — takes 3/5 on desktop */}
        <div className="lg:col-span-3 mb-6 lg:mb-0">
          <div className="glass-card-elevated rounded-2xl p-4 h-full">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-bold text-foreground">Pendapatan Mingguan</p>
                <p className="text-[11px] text-muted-foreground">7 hari terakhir</p>
              </div>
              <div className="p-1.5 rounded-lg bg-primary/8">
                <TrendingUp className="w-4 h-4 text-primary" />
              </div>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))", fontWeight: 500 }} />
                <YAxis hide />
                <Tooltip
                  formatter={(value: number) => [`IDR ${value.toLocaleString("id-ID")}`, "Pendapatan"]}
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.75rem",
                    fontSize: 11,
                    boxShadow: "0 4px 12px hsl(var(--foreground) / 0.08)",
                  }}
                  cursor={{ fill: "hsl(var(--primary) / 0.06)" }}
                />
                <Bar dataKey="income" fill="url(#barGradient)" radius={[8, 8, 2, 2]} />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" />
                    <stop offset="100%" stopColor="hsl(var(--primary-glow))" stopOpacity={0.7} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Services — takes 2/5 on desktop */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <p className="section-title mb-0">Service Terbaru</p>
            <button onClick={() => navigate("/service")} className="text-[11px] text-primary font-bold active:opacity-70 transition-opacity">
              Lihat Semua →
            </button>
          </div>
          <div className="space-y-3">
            {recent.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
            {allServices.length === 0 && (
              <div className="text-center py-12">
                <Wrench className="w-10 h-10 text-muted-foreground/20 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Belum ada service</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FAB */}
      <button
        onClick={() => navigate("/service/new")}
        className="fixed bottom-24 lg:bottom-8 right-4 lg:right-8 z-40 w-14 h-14 rounded-2xl gradient-primary shadow-[0_8px_24px_-4px_hsl(var(--primary)/0.4)] flex items-center justify-center active:scale-90 transition-transform"
      >
        <Plus className="w-6 h-6 text-primary-foreground" />
      </button>
    </div>
  );
};

export default Dashboard;
