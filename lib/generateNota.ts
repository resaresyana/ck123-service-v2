import jsPDF from "jspdf";
import { ServiceData } from "@/components/ServiceCard";
import { getShopInfo, ShopInfo } from "@/lib/shopStore";
import { getNotaSettings } from "@/lib/notaSettings";

export type NotaFormat = "a4" | "thermal58" | "thermal80";

// Sanitize text for jsPDF built-in fonts (only support Latin-1 / CP1252)
const sanitize = (text: string): string => {
  if (!text) return "-";
  return text
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // remove combining diacritics
    .replace(/[^\x20-\x7E\xA0-\xFF]/g, "") // keep only printable Latin-1
    .trim() || "-";
};

const primary: [number, number, number] = [14, 116, 232];
const dark: [number, number, number] = [30, 30, 40];
const gray: [number, number, number] = [120, 120, 130];
const success: [number, number, number] = [34, 160, 90];
const warning: [number, number, number] = [220, 140, 20];

// ==================== A4 FORMAT (DETAILED) ====================
const generateA4 = (doc: jsPDF, service: ServiceData, shop: ShopInfo, opts: { showLogo: boolean }) => {
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentW = pageW - margin * 2;
  let y = margin;

  const remaining = service.totalCost - service.dpAmount;
  const isPaid = remaining <= 0;
  const dateStr = new Date(service.createdAt).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  doc.setFillColor(...primary);
  doc.roundedRect(margin, y, contentW, 32, 3, 3, "F");

  if (opts.showLogo && shop.logo) {
    try { doc.addImage(shop.logo, "PNG", margin + 5, y + 4, 24, 24); } catch {}
  } else if (opts.showLogo) {
    doc.setFillColor(255, 255, 255);
    doc.circle(margin + 17, y + 16, 11, "F");
    doc.setTextColor(...primary);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(sanitize(shop.name.substring(0, 5)), margin + 17, y + 17.5, { align: "center" });
  }

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(sanitize(shop.name), opts.showLogo ? margin + 34 : margin + 8, y + 13);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(sanitize(shop.address), opts.showLogo ? margin + 34 : margin + 8, y + 19);
  doc.text(`WhatsApp: ${sanitize(shop.phone)}`, opts.showLogo ? margin + 34 : margin + 8, y + 24);
  doc.setFontSize(7);
  doc.text("Smart Service System", opts.showLogo ? margin + 34 : margin + 8, y + 29);
  y += 38;

  doc.setFillColor(245, 247, 250);
  doc.rect(margin, y, contentW, 10, "F");
  doc.setTextColor(...dark);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("NOTA SERVICE", margin + 4, y + 7);

  const statusText = isPaid ? "LUNAS" : "BELUM LUNAS";
  const statusColor = isPaid ? success : warning;
  doc.setFillColor(...statusColor);
  const stW = doc.getTextWidth(statusText) + 12;
  doc.roundedRect(pageW - margin - stW - 2, y + 1.5, stW, 7, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text(statusText, pageW - margin - stW / 2 - 2, y + 6.5, { align: "center" });
  y += 14;

  doc.setTextColor(...gray);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("No. Invoice", margin + 4, y + 4);
  doc.text("Tanggal", margin + 4, y + 10);
  doc.text("Status", margin + 4, y + 16);

  doc.setTextColor(...dark);
  doc.setFont("helvetica", "bold");
  doc.text(`: ${sanitize(service.invoice)}`, margin + 30, y + 4);
  doc.text(`: ${sanitize(dateStr)}`, margin + 30, y + 10);
  doc.text(`: ${sanitize(service.status.toUpperCase())}`, margin + 30, y + 16);
  y += 28;

  doc.setDrawColor(220, 220, 225);
  doc.setLineWidth(0.4);
  doc.line(margin, y, pageW - margin, y);
  y += 6;

  const sectionHeader = (title: string) => {
    doc.setFillColor(...primary);
    doc.rect(margin, y, contentW, 8, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text(title, margin + 4, y + 5.5);
    y += 11;
  };

  const infoRow = (label: string, value: string, bold = false) => {
    doc.setTextColor(...gray);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(label, margin + 4, y);
    doc.setTextColor(...dark);
    doc.setFont("helvetica", bold ? "bold" : "normal");
    const lines = doc.splitTextToSize(sanitize(value), contentW - 50);
    doc.text(lines, margin + 45, y);
    y += lines.length * 5 + 1;
  };

  const a4Fields = parseComplaintFields(service.complaint);

  sectionHeader("DATA PELANGGAN");
  infoRow("Nama Lengkap", service.customerName, true);
  infoRow("No. HP / WA", service.phone);
  y += 3;

  sectionHeader("DATA PERANGKAT");
  infoRow("Merk", service.deviceBrand);
  infoRow("Tipe / Model", service.deviceModel);
  infoRow("Keluhan", a4Fields.keluhan);
  if (a4Fields.teknisi) infoRow("Teknisi", a4Fields.teknisi);
  if (a4Fields.tindakan) infoRow("Tindakan", a4Fields.tindakan);
  if (a4Fields.sparepart) infoRow("Sparepart", a4Fields.sparepart);
  y += 3;

  sectionHeader("RINCIAN BIAYA");

  doc.setFillColor(245, 247, 250);
  doc.rect(margin, y, contentW, 7, "F");
  doc.setTextColor(...dark);
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.text("NO", margin + 4, y + 5);
  doc.text("DESKRIPSI", margin + 15, y + 5);
  doc.text("QTY", margin + 100, y + 5);
  doc.text("HARGA", margin + 115, y + 5);
  doc.text("SUBTOTAL", pageW - margin - 4, y + 5, { align: "right" });
  y += 9;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...dark);
  doc.text("1", margin + 6, y);
  doc.text("Biaya Service & Perbaikan", margin + 15, y);
  doc.text("1", margin + 103, y);
  doc.text(`IDR ${service.totalCost.toLocaleString("id-ID")}`, margin + 115, y);
  doc.text(`IDR ${service.totalCost.toLocaleString("id-ID")}`, pageW - margin - 4, y, { align: "right" });
  y += 7;

  doc.setDrawColor(220, 220, 225);
  doc.line(margin, y, pageW - margin, y);
  y += 5;

  const totalRow = (label: string, amount: string, isBold = false, color: [number, number, number] = dark) => {
    doc.setTextColor(...gray);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(label, margin + 80, y);
    doc.setTextColor(...color);
    doc.setFont("helvetica", isBold ? "bold" : "normal");
    doc.setFontSize(isBold ? 10 : 8);
    doc.text(amount, pageW - margin - 4, y, { align: "right" });
    y += isBold ? 7 : 5.5;
  };

  totalRow("Subtotal", `IDR ${service.totalCost.toLocaleString("id-ID")}`);
  if (service.dpAmount > 0) {
    totalRow("Down Payment (DP)", `IDR ${service.dpAmount.toLocaleString("id-ID")}`, false, success);
  }

  doc.setDrawColor(...primary);
  doc.setLineWidth(0.5);
  doc.line(margin + 80, y, pageW - margin, y);
  y += 5;

  if (isPaid) {
    totalRow("TOTAL BAYAR", `IDR ${service.totalCost.toLocaleString("id-ID")}`, true, primary);
  } else {
    totalRow("TOTAL", `IDR ${service.totalCost.toLocaleString("id-ID")}`, true, primary);
    if (service.dpAmount > 0) {
      totalRow("Sisa Pembayaran", `IDR ${remaining.toLocaleString("id-ID")}`, true, warning);
    }
  }
  y += 6;

  doc.setDrawColor(220, 220, 225);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageW - margin, y);
  y += 5;

  doc.setTextColor(...gray);
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "bold");
  doc.text("SYARAT & KETENTUAN:", margin + 4, y);
  y += 4;
  doc.setFont("helvetica", "normal");
  const terms = [
    "1. Barang yang tidak diambil dalam 30 hari bukan tanggung jawab kami.",
    "2. Kerusakan akibat jatuh/terkena air setelah pengambilan bukan garansi service.",
    "3. Garansi service berlaku 7 hari setelah pengambilan (kerusakan yang sama).",
    "4. Segala kerusakan diluar perbaikan bukan tanggung jawab kami.",
    "5. Setuju dengan syarat diatas saat menyerahkan perangkat untuk diperbaiki.",
  ];
  terms.forEach((t) => {
    doc.text(t, margin + 4, y, { maxWidth: contentW - 8 });
    y += 4;
  });
  y += 4;

  const sigY = y;
  doc.setTextColor(...dark);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text("Pelanggan,", margin + 15, sigY, { align: "center" });
  doc.text("Teknisi,", pageW - margin - 15, sigY, { align: "center" });

  doc.setDrawColor(180, 180, 185);
  doc.setLineWidth(0.2);
  doc.line(margin + 2, sigY + 18, margin + 45, sigY + 18);
  doc.line(pageW - margin - 45, sigY + 18, pageW - margin - 2, sigY + 18);

  const teknisiName = a4Fields.teknisi || "";
  doc.setFont("helvetica", "bold");
  doc.text(sanitize(service.customerName), margin + 23.5, sigY + 22, { align: "center" });
  doc.text(teknisiName ? sanitize(teknisiName) : "________________", pageW - margin - 23.5, sigY + 22, { align: "center" });
  y = sigY + 28;

  doc.setDrawColor(220, 220, 225);
  doc.line(margin, y, pageW - margin, y);
  y += 5;
  doc.setTextColor(...gray);
  doc.setFontSize(7);
  doc.setFont("helvetica", "italic");
  doc.text(sanitize(shop.footer), pageW / 2, y, { align: "center", maxWidth: contentW });
  y += 5;
  doc.setTextColor(...primary);
  doc.setFontSize(6);
  doc.setFont("helvetica", "normal");
  doc.text(`${sanitize(shop.name)} | WhatsApp: ${sanitize(shop.phone)} | Powered by Smart Service System`, pageW / 2, y, { align: "center" });
};

// ==================== PARSE COMPLAINT FIELDS ====================
const parseComplaintFields = (complaint: string) => {
  const fields: Record<string, string> = {};
  const parts = complaint.split(" | ");
  const mainComplaint = parts[0] || complaint;
  fields.keluhan = mainComplaint;

  parts.slice(1).forEach((part) => {
    const colonIdx = part.indexOf(": ");
    if (colonIdx > 0) {
      const key = part.substring(0, colonIdx).trim().toLowerCase();
      const val = part.substring(colonIdx + 2).trim();
      if (val) fields[key] = val;
    }
  });

  return fields;
};

// ==================== THERMAL FORMAT (RETAIL RECEIPT STYLE) ====================
const generateThermal = (doc: jsPDF, service: ServiceData, shop: ShopInfo, widthMM: number, opts: { showLogo: boolean }) => {
  const m = 2;
  const cw = widthMM - m * 2;
  const cx = widthMM / 2;
  let y = 4;

  const remaining = service.totalCost - service.dpAmount;
  const isPaid = remaining <= 0;
  const fields = parseComplaintFields(service.complaint);

  const is80 = widthMM >= 70;
  const maxChars = is80 ? 42 : 30;

  const fs = is80 ? 7 : 6;
  const fsLg = is80 ? 10 : 8;
  const fsSm = is80 ? 5.5 : 5;
  const fsTiny = is80 ? 5 : 4.5;
  const lh = is80 ? 3.2 : 2.8;

  const font = "courier";

  const center = (text: string, size = fs, bold = false) => {
    doc.setFontSize(size);
    doc.setFont(font, bold ? "bold" : "normal");
    doc.text(sanitize(text), cx, y, { align: "center" });
    y += lh;
  };

  const sep = (char = "-") => {
    doc.setFontSize(fs);
    doc.setFont(font, "normal");
    doc.text(char.repeat(maxChars), cx, y, { align: "center" });
    y += lh;
  };

  const lr = (left: string, right: string, bold = false) => {
    doc.setFontSize(fs);
    doc.setFont(font, bold ? "bold" : "normal");
    doc.text(sanitize(left), m, y);
    doc.text(sanitize(right), widthMM - m, y, { align: "right" });
    y += lh;
  };

  const kv = (label: string, value: string, bold = false) => {
    doc.setFontSize(fs);
    doc.setFont(font, "normal");
    const colW = is80 ? 22 : 16;
    doc.text(sanitize(label), m, y);
    doc.text(":", m + colW, y);
    doc.setFont(font, bold ? "bold" : "normal");
    const valMaxW = cw - colW - 3;
    const lines = doc.splitTextToSize(sanitize(value), valMaxW > 5 ? valMaxW : cw);
    lines.forEach((line: string, i: number) => {
      if (i === 0) {
        doc.text(line, m + colW + 2, y);
      } else {
        y += lh;
        doc.text(line, m + colW + 2, y);
      }
    });
    y += lh;
  };

  const wrap = (text: string, bold = false) => {
    doc.setFontSize(fs);
    doc.setFont(font, bold ? "bold" : "normal");
    const lines = doc.splitTextToSize(sanitize(text), cw);
    lines.forEach((line: string) => {
      doc.text(line, m, y);
      y += lh;
    });
  };

  // ════════════════════════════════════
  // HEADER - Store info
  // ════════════════════════════════════
  if (opts.showLogo && shop.logo) {
    try { doc.addImage(shop.logo, "PNG", cx - 6, y, 12, 12); y += 13; } catch {}
  }

  center(shop.name, fsLg, true);
  center("SERVICE CENTER", is80 ? 8 : 7, true);
  doc.setFontSize(fsSm);
  doc.setFont(font, "normal");
  const addrLines = doc.splitTextToSize(sanitize(shop.address), cw - 2);
  addrLines.forEach((line: string) => { doc.text(line, cx, y, { align: "center" }); y += lh - 0.5; });
  center(`Telp: ${shop.phone}`, fsSm);

  sep("=");

  // ════════════════════════════════════
  // DOCUMENT TITLE
  // ════════════════════════════════════
  center("NOTA SERVICE", fsLg, true);

  sep("=");

  // ════════════════════════════════════
  // INVOICE & DATE/TIME
  // ════════════════════════════════════
  const statusMap: Record<string, string> = {
    masuk: "MASUK", proses: "PROSES", selesai: "SELESAI",
    diambil: "DIAMBIL", cancel: "CANCEL",
  };
  const d = new Date(service.createdAt);
  const months = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
  const dateStr = `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;
  const timeStr = `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;

  kv("No. Invoice", service.invoice);
  kv("Tanggal", dateStr);
  kv("Jam", timeStr);
  kv("Status", statusMap[service.status] || service.status.toUpperCase(), true);

  sep("-");

  // ════════════════════════════════════
  // SECTION: DATA PELANGGAN
  // ════════════════════════════════════
  center("[ DATA PELANGGAN ]", fsSm, true);
  kv("Nama", service.customerName, true);
  kv("No. HP", service.phone || "-");

  sep("-");

  // ════════════════════════════════════
  // SECTION: DATA PERANGKAT
  // ════════════════════════════════════
  center("[ DATA PERANGKAT ]", fsSm, true);
  kv("Merk", service.deviceBrand);
  kv("Model", service.deviceModel || "-");
  kv("Keluhan", fields.keluhan);

  if (fields.teknisi) kv("Teknisi", fields.teknisi);

  sep("-");

  // ════════════════════════════════════
  // SECTION: TINDAKAN & SPAREPART
  // ════════════════════════════════════
  if (fields.tindakan || fields.sparepart) {
    center("[ DETAIL PEKERJAAN ]", fsSm, true);

    if (fields.tindakan) {
      doc.setFontSize(fs);
      doc.setFont(font, "normal");
      doc.text("Tindakan:", m, y);
      y += lh;
      wrap(`  ${fields.tindakan}`);
    }

    if (fields.sparepart) {
      doc.setFontSize(fs);
      doc.setFont(font, "normal");
      doc.text("Sparepart:", m, y);
      y += lh;
      wrap(`  ${fields.sparepart}`);
    }

    sep("-");
  }

  // ════════════════════════════════════
  // SECTION: RINCIAN BIAYA (like receipt items)
  // ════════════════════════════════════
  center("[ RINCIAN BIAYA ]", fsSm, true);

  // Item line - like retail receipt
  doc.setFontSize(fs);
  doc.setFont(font, "normal");
  doc.text("Jasa Service & Perbaikan", m, y);
  y += lh;
  lr("  1 x " + `Rp ${service.totalCost.toLocaleString("id-ID")}`, `Rp ${service.totalCost.toLocaleString("id-ID")}`);

  sep("-");

  // Subtotal
  lr("SUBTOTAL", `Rp ${service.totalCost.toLocaleString("id-ID")}`, true);

  // DP line
  if (service.dpAmount > 0) {
    lr("DOWN PAYMENT (DP)", `-Rp ${service.dpAmount.toLocaleString("id-ID")}`);
  }

  sep("=");

  // TOTAL - big and bold, like BBM receipt
  doc.setFontSize(is80 ? 10 : 8);
  doc.setFont(font, "bold");
  if (isPaid) {
    doc.text("TOTAL BAYAR", m, y);
    doc.text(`Rp ${service.totalCost.toLocaleString("id-ID")}`, widthMM - m, y, { align: "right" });
    y += lh + 1;
  } else {
    doc.text("TOTAL", m, y);
    doc.text(`Rp ${service.totalCost.toLocaleString("id-ID")}`, widthMM - m, y, { align: "right" });
    y += lh + 0.5;
    if (service.dpAmount > 0) {
      doc.text("SISA BAYAR", m, y);
      doc.text(`Rp ${remaining.toLocaleString("id-ID")}`, widthMM - m, y, { align: "right" });
      y += lh + 1;
    }
  }

  sep("=");

  // Payment status badge
  y += 1;
  if (isPaid) {
    center("** LUNAS **", fsLg, true);
  } else {
    center("** BELUM LUNAS **", fsLg, true);
  }
  y += 1;

  sep("-");

  // ════════════════════════════════════
  // SYARAT & KETENTUAN
  // ════════════════════════════════════
  center("SYARAT & KETENTUAN", fsSm, true);
  y += 0.5;

  doc.setFontSize(fsTiny);
  doc.setFont(font, "normal");
  const terms = [
    "1.Brg tdk diambil 30hr bukan",
    "  tanggung jawab kami.",
    "2.Kerusakan jatuh/air setelah",
    "  ambil bukan garansi service.",
    "3.Garansi 7hr (kerusakan sama).",
    "4.Kerusakan diluar perbaikan",
    "  bukan tanggung jawab kami.",
    "5.Setuju dg syarat diatas saat",
    "  serah perangkat.",
  ];
  terms.forEach((t) => {
    doc.text(t, m, y);
    y += lh - 0.5;
  });

  sep("-");

  // ════════════════════════════════════
  // TANDA TANGAN
  // ════════════════════════════════════
  y += 1;
  doc.setFontSize(fsSm);
  doc.setFont(font, "normal");

  const sigLeft = m + (is80 ? 10 : 6);
  const sigRight = widthMM - m - (is80 ? 10 : 6);

  doc.text("Pelanggan", sigLeft, y, { align: "center" });
  doc.text("Teknisi", sigRight, y, { align: "center" });
  y += is80 ? 14 : 10;

  const teknisiName = fields.teknisi || "";
  doc.setFont(font, "bold");
  doc.text(sanitize(service.customerName), sigLeft, y, { align: "center" });
  doc.text(teknisiName ? sanitize(teknisiName) : "(..........)", sigRight, y, { align: "center" });
  y += lh + 2;

  sep("-");

  // ════════════════════════════════════
  // FOOTER
  // ════════════════════════════════════
  y += 1;
  center("Terima kasih atas kepercayaan", fsSm);
  center("Anda kepada kami", fsSm);
  y += 0.5;

  doc.setFontSize(fsTiny);
  doc.setFont(font, "normal");
  const footerLines = doc.splitTextToSize(sanitize(shop.footer), cw - 2);
  footerLines.forEach((line: string) => { doc.text(line, cx, y, { align: "center" }); y += lh - 0.5; });

  y += 1.5;
  center(`Dicetak: ${new Date().toLocaleDateString("id-ID")} ${new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}`, fsTiny);
};

// ==================== MAIN EXPORT ====================
export const generateNotaPDF = async (service: ServiceData, format: NotaFormat = "a4") => {
  const shop = await getShopInfo();
  const notaSettings = getNotaSettings();
  let doc: jsPDF;

  const opts = { showLogo: notaSettings.showLogo };

  switch (format) {
    case "thermal58": {
      doc = new jsPDF({ unit: "mm", format: [58, 200] });
      generateThermal(doc, service, shop, 58, opts);
      break;
    }
    case "thermal80": {
      doc = new jsPDF({ unit: "mm", format: [80, 200] });
      generateThermal(doc, service, shop, 80, opts);
      break;
    }
    default: {
      doc = new jsPDF({ unit: "mm", format: "a4" });
      generateA4(doc, service, shop, opts);
      break;
    }
  }

  const suffix = format === "a4" ? "A4" : format === "thermal58" ? "58mm" : "80mm";
  doc.save(`Nota-${service.invoice}-${suffix}.pdf`);
};
