import jsPDF from "jspdf";
import { ServiceData } from "@/components/ServiceCard";
import { getShopInfo } from "@/lib/shopStore";

// Sanitize text for jsPDF built-in fonts (only support Latin-1 / CP1252)
const sanitize = (text: string): string => {
  if (!text) return "-";
  return text
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7E\xA0-\xFF]/g, "")
    .trim() || "-";
};

type MonthData = { month: string; income: number };
type BrandData = { name: string; value: number };
type TopService = { name: string; count: number; revenue: number };

const primary: [number, number, number] = [14, 116, 232];
const dark: [number, number, number] = [30, 30, 40];
const gray: [number, number, number] = [130, 130, 140];
const lightBg: [number, number, number] = [245, 247, 250];
const success: [number, number, number] = [34, 160, 90];
const warning: [number, number, number] = [220, 160, 30];
const pieColors: [number, number, number][] = [
  [14, 116, 232], [234, 88, 12], [34, 160, 90], [220, 160, 30], [147, 51, 234],
];

// ===================== PDF EXPORT (SINGLE PAGE) =====================
export const exportLaporanPDF = async (
  services: ServiceData[],
  monthlyData: MonthData[],
  serviceByBrand: BrandData[],
  topServices: TopService[]
) => {
  const shop = await getShopInfo();
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const m = 10;
  const cw = pageW - m * 2;
  let y = m;

  const totalIncome = services.reduce((s, sv) => s + sv.totalCost, 0);
  const totalDP = services.reduce((s, sv) => s + sv.dpAmount, 0);
  const totalSisa = totalIncome - totalDP;
  const lunas = services.filter((s) => s.dpAmount >= s.totalCost && s.totalCost > 0).length;
  const belumLunas = services.length - lunas;
  const dateStr = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

  // ======= HEADER (compact) =======
  doc.setFillColor(...primary);
  doc.roundedRect(m, y, cw, 18, 2, 2, "F");
  if (shop.logo) {
    try { doc.addImage(shop.logo, "PNG", m + 3, y + 2, 14, 14); } catch {}
  }
  const hx = shop.logo ? m + 20 : m + 5;
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(sanitize(shop.name), hx, y + 8);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text(`${sanitize(shop.address)} | WA: ${sanitize(shop.phone)}`, hx, y + 13);
  y += 21;

  // Title row
  doc.setFillColor(...lightBg);
  doc.rect(m, y, cw, 7, "F");
  doc.setTextColor(...dark);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("LAPORAN REKAP SERVICE & PENJUALAN", m + 3, y + 5);
  doc.setFontSize(6);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...gray);
  doc.text(`Dicetak: ${sanitize(dateStr)}`, pageW - m - 3, y + 5, { align: "right" });
  y += 10;

  // ======= SUMMARY CARDS (4 compact) =======
  const cardW = (cw - 4.5) / 4;
  const cards = [
    { label: "Total Service", value: `${services.length}`, color: primary },
    { label: "Pendapatan", value: `IDR ${(totalIncome / 1000000).toFixed(1)}JT`, color: success },
    { label: "Lunas", value: `${lunas}`, color: [34, 160, 90] as [number, number, number] },
    { label: "Belum Lunas", value: `${belumLunas}`, color: warning },
  ];
  cards.forEach((c, i) => {
    const cx = m + i * (cardW + 1.5);
    doc.setFillColor(...c.color);
    doc.roundedRect(cx, y, cardW, 12, 1.5, 1.5, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(c.value, cx + cardW / 2, y + 6, { align: "center" });
    doc.setFontSize(5);
    doc.setFont("helvetica", "normal");
    doc.text(c.label, cx + cardW / 2, y + 10, { align: "center" });
  });
  y += 16;

  // ======= LEFT: BAR CHART | RIGHT: DONUT =======
  const halfW = (cw - 4) / 2;

  // -- Section header helper --
  const sectionTitle = (title: string, x: number, w: number) => {
    doc.setFillColor(...lightBg);
    doc.rect(x, y, w, 5.5, "F");
    doc.setTextColor(...dark);
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.text(title, x + 2, y + 4);
  };

  sectionTitle("Pendapatan Bulanan", m, halfW);
  sectionTitle("Service per Merk", m + halfW + 4, halfW);
  y += 7;

  // -- BAR CHART (left) --
  const chartX = m + 4;
  const chartW = halfW - 8;
  const chartH = 30;
  const maxIncome = Math.max(...monthlyData.map((d) => d.income), 1);
  const barW = chartW / monthlyData.length * 0.55;
  const gap = chartW / monthlyData.length;

  doc.setDrawColor(230, 230, 235);
  doc.setLineWidth(0.1);
  for (let i = 0; i <= 3; i++) {
    const gy = y + chartH - (chartH / 3) * i;
    doc.line(chartX, gy, chartX + chartW, gy);
  }

  monthlyData.forEach((d, i) => {
    const barH = Math.max(1, (d.income / maxIncome) * chartH);
    const bx = chartX + i * gap + (gap - barW) / 2;
    const by = y + chartH - barH;
    doc.setFillColor(...primary);
    doc.roundedRect(bx, by, barW, barH, 1, 1, "F");
    doc.setTextColor(...dark);
    doc.setFontSize(4.5);
    doc.setFont("helvetica", "bold");
    doc.text(`${(d.income / 1000000).toFixed(1)}`, bx + barW / 2, by - 1, { align: "center" });
    doc.setTextColor(...gray);
    doc.setFontSize(5);
    doc.setFont("helvetica", "normal");
    doc.text(d.month.substring(0, 3), bx + barW / 2, y + chartH + 3.5, { align: "center" });
  });

  // -- DONUT CHART (right) --
  const pieR = 13;
  const pieCX = m + halfW + 4 + pieR + 3;
  const pieCY = y + pieR + 1;
  const totalPct = serviceByBrand.reduce((s, b) => s + b.value, 0) || 1;
  let startAngle = -Math.PI / 2;

  serviceByBrand.forEach((b, i) => {
    const sliceAngle = (b.value / totalPct) * Math.PI * 2;
    const color = pieColors[i % pieColors.length];
    doc.setFillColor(...color);
    const steps = Math.max(15, Math.floor(sliceAngle * 25));
    for (let s = 0; s < steps; s++) {
      const a1 = startAngle + (sliceAngle / steps) * s;
      const a2 = startAngle + (sliceAngle / steps) * (s + 1);
      doc.triangle(pieCX, pieCY, pieCX + Math.cos(a1) * pieR, pieCY + Math.sin(a1) * pieR, pieCX + Math.cos(a2) * pieR, pieCY + Math.sin(a2) * pieR, "F");
    }
    startAngle += sliceAngle;
  });
  doc.setFillColor(255, 255, 255);
  doc.circle(pieCX, pieCY, pieR * 0.45, "F");

  // Legend (right of donut)
  const legendX = pieCX + pieR + 5;
  let legendY = y + 2;
  serviceByBrand.slice(0, 5).forEach((b, i) => {
    const color = pieColors[i % pieColors.length];
    doc.setFillColor(...color);
    doc.roundedRect(legendX, legendY - 1.5, 3, 3, 0.5, 0.5, "F");
    doc.setTextColor(...dark);
    doc.setFontSize(5.5);
    doc.setFont("helvetica", "normal");
    doc.text(`${sanitize(b.name)} ${b.value}%`, legendX + 4.5, legendY + 0.5);
    legendY += 5;
  });

  y += chartH + 8;

  // ======= STATUS BAR =======
  sectionTitle("Status Service", m, cw);
  y += 7;

  const statusData = [
    { label: "Masuk", key: "masuk", color: [59, 130, 246] as [number, number, number] },
    { label: "Proses", key: "proses", color: [245, 158, 11] as [number, number, number] },
    { label: "Selesai", key: "selesai", color: [34, 197, 94] as [number, number, number] },
    { label: "Diambil", key: "diambil", color: [156, 163, 175] as [number, number, number] },
    { label: "Cancel", key: "cancel", color: [239, 68, 68] as [number, number, number] },
  ];
  const statusCounts = statusData.map((s) => ({ ...s, count: services.filter((sv) => sv.status === s.key).length }));
  const totalSvc = services.length || 1;

  let barX = m;
  statusCounts.forEach((s) => {
    const w = (s.count / totalSvc) * cw;
    if (w > 0) {
      doc.setFillColor(...s.color);
      doc.rect(barX, y, w, 5, "F");
      if (w > 8) {
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(4.5);
        doc.setFont("helvetica", "bold");
        doc.text(`${s.count}`, barX + w / 2, y + 3.5, { align: "center" });
      }
      barX += w;
    }
  });
  y += 6;

  let lx = m;
  statusCounts.forEach((s) => {
    doc.setFillColor(...s.color);
    doc.circle(lx + 1, y + 0.5, 1, "F");
    doc.setTextColor(...dark);
    doc.setFontSize(5);
    doc.setFont("helvetica", "normal");
    doc.text(`${s.label}(${s.count})`, lx + 3, y + 1.5);
    lx += 28;
  });
  y += 6;

  // ======= TOP SERVICES + PAYMENT SUMMARY (side by side) =======
  sectionTitle("Service Terbanyak", m, halfW);
  sectionTitle("Ringkasan Pembayaran", m + halfW + 4, halfW);
  y += 7;

  // Top services (left)
  const tsY = y;
  const maxCount = Math.max(...topServices.map((s) => s.count), 1);
  topServices.slice(0, 5).forEach((s, i) => {
    if (i % 2 === 0) {
      doc.setFillColor(250, 250, 252);
      doc.rect(m, y - 2, halfW, 5.5, "F");
    }
    doc.setTextColor(...dark);
    doc.setFontSize(5.5);
    doc.setFont("helvetica", "normal");
    doc.text(`${i + 1}. ${sanitize(s.name)}`, m + 2, y + 1);
    doc.setFont("helvetica", "bold");
    doc.text(`${s.count}x`, m + halfW - 18, y + 1, { align: "right" });
    doc.setFillColor(...lightBg);
    doc.roundedRect(m + halfW - 16, y - 1, 14, 3, 0.8, 0.8, "F");
    doc.setFillColor(...primary);
    doc.roundedRect(m + halfW - 16, y - 1, 14 * (s.count / maxCount), 3, 0.8, 0.8, "F");
    y += 5.5;
  });

  // Payment summary (right, at same Y start)
  let py = tsY;
  const rx = m + halfW + 4;
  doc.setFillColor(245, 247, 250);
  doc.roundedRect(rx, py - 1, halfW, 26, 1.5, 1.5, "F");

  const payItems = [
    { label: "Total Pendapatan", value: `IDR ${totalIncome.toLocaleString("id-ID")}`, color: primary },
    { label: "DP Diterima", value: `IDR ${totalDP.toLocaleString("id-ID")}`, color: success },
    { label: "Sisa Belum Bayar", value: `IDR ${totalSisa.toLocaleString("id-ID")}`, color: warning },
  ];
  payItems.forEach((p) => {
    doc.setTextColor(...gray);
    doc.setFontSize(5.5);
    doc.setFont("helvetica", "normal");
    doc.text(p.label, rx + 3, py + 3);
    doc.setTextColor(...p.color);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text(p.value, rx + 3, py + 8);
    py += 9;
  });

  y = Math.max(y, py) + 4;

  // ======= SERVICE TABLE (compact) =======
  sectionTitle("Daftar Service (" + services.length + ")", m, cw);
  y += 7;

  doc.setFillColor(...primary);
  doc.rect(m, y, cw, 5, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(5.5);
  doc.setFont("helvetica", "bold");
  const tc = [m + 2, m + 22, m + 52, m + 82, m + 105, m + 128, m + 155, m + 175];
  doc.text("Invoice", tc[0], y + 3.5);
  doc.text("Pelanggan", tc[1], y + 3.5);
  doc.text("Perangkat", tc[2], y + 3.5);
  doc.text("Keluhan", tc[3], y + 3.5);
  doc.text("Status", tc[4], y + 3.5);
  doc.text("Biaya", tc[5], y + 3.5);
  doc.text("DP", tc[6], y + 3.5);
  doc.text("Bayar", tc[7], y + 3.5);
  y += 6;

  const maxRows = Math.floor((pageH - y - 15) / 4.5);
  const displayServices = services.slice(0, maxRows);

  displayServices.forEach((sv, i) => {
    if (i % 2 === 0) {
      doc.setFillColor(250, 250, 252);
      doc.rect(m, y - 2, cw, 4.5, "F");
    }
    const isPaid = sv.dpAmount >= sv.totalCost && sv.totalCost > 0;

    doc.setTextColor(...dark);
    doc.setFontSize(5);
    doc.setFont("helvetica", "normal");
    doc.text(sanitize(sv.invoice).substring(0, 16), tc[0], y + 0.5);
    doc.text(sanitize(sv.customerName).substring(0, 14), tc[1], y + 0.5);
    doc.text(sanitize(`${sv.deviceBrand} ${sv.deviceModel}`).substring(0, 14), tc[2], y + 0.5);
    doc.text(sanitize(sv.complaint).substring(0, 12), tc[3], y + 0.5);

    const stColor: Record<string, [number, number, number]> = {
      masuk: [59, 130, 246], proses: [245, 158, 11], selesai: [34, 197, 94],
      diambil: [156, 163, 175], cancel: [239, 68, 68],
    };
    doc.setTextColor(...(stColor[sv.status] || dark));
    doc.setFont("helvetica", "bold");
    doc.text(sv.status.toUpperCase(), tc[4], y + 0.5);

    doc.setTextColor(...dark);
    doc.setFont("helvetica", "normal");
    doc.text(`${(sv.totalCost / 1000).toFixed(0)}K`, tc[5], y + 0.5);
    doc.text(`${(sv.dpAmount / 1000).toFixed(0)}K`, tc[6], y + 0.5);

    doc.setTextColor(...(isPaid ? success : warning));
    doc.setFont("helvetica", "bold");
    doc.text(isPaid ? "LUNAS" : "BELUM", tc[7], y + 0.5);
    y += 4.5;
  });

  if (services.length > maxRows) {
    doc.setTextColor(...gray);
    doc.setFontSize(5);
    doc.setFont("helvetica", "italic");
    doc.text(`... dan ${services.length - maxRows} service lainnya`, m + 2, y + 2);
  }

  // ======= FOOTER =======
  doc.setDrawColor(220, 220, 225);
  doc.setLineWidth(0.2);
  doc.line(m, pageH - 10, pageW - m, pageH - 10);
  doc.setTextColor(...gray);
  doc.setFontSize(5);
  doc.setFont("helvetica", "normal");
  doc.text(sanitize(shop.footer), m, pageH - 7);
  doc.text(`${sanitize(shop.name)} | Hal 1/1`, pageW - m, pageH - 7, { align: "right" });

  doc.save(`Laporan_${sanitize(shop.name).replace(/\s/g, "_")}_${new Date().toISOString().slice(0, 10)}.pdf`);
};

// ===================== EXCEL/CSV EXPORT =====================
export const exportLaporanExcel = async (
  services: ServiceData[],
  monthlyData: MonthData[],
  serviceByBrand: BrandData[],
  topServices: TopService[]
) => {
  const shop = await getShopInfo();
  const totalIncome = services.reduce((s, sv) => s + sv.totalCost, 0);
  const totalDP = services.reduce((s, sv) => s + sv.dpAmount, 0);
  const lunas = services.filter((s) => s.dpAmount >= s.totalCost && s.totalCost > 0).length;

  let csv = "\uFEFF";
  csv += `"${shop.name} - LAPORAN REKAP SERVICE & PENJUALAN"\n`;
  csv += `"Tanggal Cetak","${new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}"\n`;
  csv += `"Alamat","${shop.address}"\n`;
  csv += `"WhatsApp","${shop.phone}"\n\n`;

  csv += "RINGKASAN\n";
  csv += "Keterangan,Nilai\n";
  csv += `Total Service,${services.length}\n`;
  csv += `Total Pendapatan,${totalIncome}\n`;
  csv += `Total DP Diterima,${totalDP}\n`;
  csv += `Sisa Belum Dibayar,${totalIncome - totalDP}\n`;
  csv += `Lunas,${lunas}\n`;
  csv += `Belum Lunas,${services.length - lunas}\n\n`;

  csv += "STATUS SERVICE\n";
  csv += "Status,Jumlah\n";
  ["masuk", "proses", "selesai", "diambil", "cancel"].forEach((st) => {
    csv += `${st.toUpperCase()},${services.filter((s) => s.status === st).length}\n`;
  });
  csv += "\n";

  csv += "PENDAPATAN BULANAN\n";
  csv += "Bulan,Pendapatan (IDR)\n";
  monthlyData.forEach((d) => { csv += `${d.month},${d.income}\n`; });
  csv += "\n";

  csv += "SERVICE PER MERK\n";
  csv += "Merk,Persentase (%)\n";
  serviceByBrand.forEach((b) => { csv += `${b.name},${b.value}\n`; });
  csv += "\n";

  csv += "SERVICE TERBANYAK\n";
  csv += "Jenis Service,Jumlah,Pendapatan (IDR)\n";
  topServices.forEach((s) => { csv += `${s.name},${s.count},${s.revenue}\n`; });
  csv += "\n";

  csv += "DAFTAR SERVICE LENGKAP\n";
  csv += "Invoice,Pelanggan,HP,Merk,Model,Keluhan,Status,Biaya,DP,Sisa\n";
  services.forEach((sv) => {
    const sisa = sv.totalCost - sv.dpAmount;
    csv += `"${sv.invoice}","${sv.customerName}","${sv.phone}","${sv.deviceBrand}","${sv.deviceModel}","${sv.complaint}","${sv.status}",${sv.totalCost},${sv.dpAmount},${sisa}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Laporan_${shop.name.replace(/\s/g, "_")}_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};
