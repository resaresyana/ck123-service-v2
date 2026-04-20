import { ServiceData } from "@/components/ServiceCard";
import { Transaction } from "@/lib/transactionStore";

/** Get today's date string in YYYY-MM-DD format */
export const getTodayStr = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

/** Get services for a specific date */
export const getServicesByDate = (services: ServiceData[], date: string): ServiceData[] =>
  services.filter((s) => s.createdAt === date);

/** Get services for current month */
export const getServicesThisMonth = (services: ServiceData[]): ServiceData[] => {
  const now = new Date();
  const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  return services.filter((s) => s.createdAt.startsWith(ym));
};

/** Compute daily income for the last 7 days (service + kasir) */
export const getWeeklyChartData = (services: ServiceData[], transactions: Transaction[] = []) => {
  const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
  const result: { day: string; income: number; serviceIncome: number; kasirIncome: number; date: string }[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const serviceIncome = services.filter((s) => s.createdAt === dateStr).reduce((sum, s) => sum + s.totalCost, 0);
    const kasirIncome = transactions.filter((t) => t.createdAt === dateStr).reduce((sum, t) => sum + t.total, 0);
    result.push({ day: dayNames[d.getDay()], income: serviceIncome + kasirIncome, serviceIncome, kasirIncome, date: dateStr });
  }

  return result;
};

/** Compute monthly income data (service + kasir) */
export const getMonthlyChartData = (services: ServiceData[], transactions: Transaction[] = []) => {
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  const now = new Date();
  const result: { month: string; income: number; serviceIncome: number; kasirIncome: number }[] = [];

  for (let i = 3; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const serviceIncome = services.filter((s) => s.createdAt.startsWith(ym)).reduce((sum, s) => sum + s.totalCost, 0);
    const kasirIncome = transactions.filter((t) => t.createdAt.startsWith(ym)).reduce((sum, t) => sum + t.total, 0);
    result.push({ month: monthNames[d.getMonth()], income: serviceIncome + kasirIncome, serviceIncome, kasirIncome });
  }

  return result;
};

/** Compute service count by device brand */
export const getServiceByBrand = (services: ServiceData[]) => {
  const brandMap: Record<string, number> = {};
  services.forEach((s) => {
    const brand = s.deviceBrand || "Lainnya";
    brandMap[brand] = (brandMap[brand] || 0) + 1;
  });

  const total = services.length || 1;
  return Object.entries(brandMap)
    .map(([name, count]) => ({ name, value: Math.round((count / total) * 100) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);
};

/** Compute top services by complaint type */
export const getTopServices = (services: ServiceData[]) => {
  const complaintMap: Record<string, { count: number; revenue: number }> = {};

  services.forEach((s) => {
    const complaint = s.complaint.split(",")[0].trim();
    const key = complaint.length > 25 ? complaint.substring(0, 25) : complaint;
    if (!complaintMap[key]) complaintMap[key] = { count: 0, revenue: 0 };
    complaintMap[key].count++;
    complaintMap[key].revenue += s.totalCost;
  });

  return Object.entries(complaintMap)
    .map(([name, data]) => ({ name, count: data.count, revenue: data.revenue }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
};

/** Payment summary */
export const getPaymentSummary = (services: ServiceData[]) => {
  const totalIncome = services.reduce((s, sv) => s + sv.totalCost, 0);
  const totalDP = services.reduce((s, sv) => s + sv.dpAmount, 0);
  const lunas = services.filter((s) => s.dpAmount >= s.totalCost && s.totalCost > 0).length;
  const belumLunas = services.length - lunas;
  return { totalIncome, totalDP, sisa: totalIncome - totalDP, lunas, belumLunas };
};

/** Get kasir transaction stats */
export const getKasirStats = (transactions: Transaction[]) => {
  const now = new Date();
  const todayStr = getTodayStr();
  const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const todayTx = transactions.filter((t) => t.createdAt === todayStr);
  const monthTx = transactions.filter((t) => t.createdAt.startsWith(ym));

  const totalKasirIncome = transactions.reduce((s, t) => s + t.total, 0);
  const todayKasirIncome = todayTx.reduce((s, t) => s + t.total, 0);
  const monthKasirIncome = monthTx.reduce((s, t) => s + t.total, 0);

  const productMap: Record<string, { qty: number; revenue: number; category: string }> = {};
  transactions.forEach((tx) => {
    tx.items.forEach((item) => {
      if (!productMap[item.name]) productMap[item.name] = { qty: 0, revenue: 0, category: item.category };
      productMap[item.name].qty += item.qty;
      productMap[item.name].revenue += item.price * item.qty;
    });
  });

  const topProducts = Object.entries(productMap)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.qty - a.qty);

  return {
    totalTransactions: transactions.length,
    todayTransactions: todayTx.length,
    monthTransactions: monthTx.length,
    totalKasirIncome,
    todayKasirIncome,
    monthKasirIncome,
    topProducts,
    transactions,
  };
};
