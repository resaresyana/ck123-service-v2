import jsPDF from "jspdf";
import { getCachedShopInfo } from "@/lib/shopStore";
import { getNotaSettings } from "@/lib/notaSettings";

const sanitize = (text: string): string => {
  if (!text) return "-";
  return text.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^\x20-\x7E\xA0-\xFF]/g, "").trim() || "-";
};

interface CartItem {
  name: string;
  price: number;
  qty: number;
}

export const generateKasirNotaPDF = (
  items: CartItem[],
  total: number,
  bayar: number,
  invoice: string,
  format: "thermal58" | "thermal80" = "thermal80"
) => {
  const shop = getCachedShopInfo();
  const notaSettings = getNotaSettings();
  const widthMM = format === "thermal58" ? 58 : 80;
  const doc = new jsPDF({ unit: "mm", format: [widthMM, 200] });

  const m = 2;
  const cw = widthMM - m * 2;
  const cx = widthMM / 2;
  let y = 4;

  const is80 = widthMM >= 70;
  const maxChars = is80 ? 42 : 30;
  const fs = is80 ? 7 : 6;
  const fsLg = is80 ? 9 : 7.5;
  const fsSm = is80 ? 5.5 : 5;
  const lh = is80 ? 3.2 : 2.8;
  const kembalian = bayar - total;
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

  // ══ HEADER ══
  if (notaSettings.showLogo && shop.logo) {
    try { doc.addImage(shop.logo, "PNG", cx - 5, y, 10, 10); y += 11; } catch {}
  }

  center(shop.name, fsLg, true);
  doc.setFontSize(fsSm);
  doc.setFont(font, "normal");
  const addrLines = doc.splitTextToSize(sanitize(shop.address), cw - 2);
  addrLines.forEach((line: string) => { doc.text(line, cx, y, { align: "center" }); y += lh - 0.5; });
  center(`Telp: ${shop.phone}`, fsSm);

  sep("=");

  // ══ DATE & INVOICE ══
  const now = new Date();
  const dateStr = `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()}`;
  const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  lr(dateStr, timeStr);
  doc.setFontSize(fs);
  doc.setFont(font, "normal");
  doc.text(`No: ${invoice}`, m, y);
  y += lh;

  sep("-");

  // ══ ITEMS ══
  items.forEach((item) => {
    doc.setFontSize(fs);
    doc.setFont(font, "normal");
    const nameLines = doc.splitTextToSize(sanitize(item.name), cw);
    nameLines.forEach((line: string) => { doc.text(line, m, y); y += lh; });

    const qtyPrice = `  ${item.qty} x ${item.price.toLocaleString("id-ID")}`;
    const subtotal = (item.price * item.qty).toLocaleString("id-ID");
    doc.setFont(font, "normal");
    doc.text(qtyPrice, m, y);
    doc.setFont(font, "bold");
    doc.text(subtotal, widthMM - m, y, { align: "right" });
    y += lh;
  });

  sep("=");

  // ══ TOTALS ══
  lr("TOTAL", `Rp ${total.toLocaleString("id-ID")}`, true);
  lr("BAYAR", `Rp ${bayar.toLocaleString("id-ID")}`);

  sep("-");

  doc.setFontSize(is80 ? 9 : 7.5);
  doc.setFont(font, "bold");
  doc.text("KEMBALI:", m, y);
  doc.text(`Rp ${kembalian.toLocaleString("id-ID")}`, widthMM - m, y, { align: "right" });
  y += lh + 1;

  sep("=");

  // ══ FOOTER ══
  y += 1;
  center("Terima kasih!", fsSm);
  y += 0.5;

  doc.setFontSize(fsSm);
  doc.setFont(font, "normal");
  const footerLines = doc.splitTextToSize(sanitize(shop.footer), cw - 2);
  footerLines.forEach((line: string) => { doc.text(line, cx, y, { align: "center" }); y += lh - 0.5; });

  y += 1;
  const disc = "Brg yg sudah dibeli tidak dapat dikembalikan.";
  const discLines = doc.splitTextToSize(disc, cw - 2);
  discLines.forEach((line: string) => { doc.text(line, cx, y, { align: "center" }); y += lh - 0.5; });

  doc.save(`Nota-${invoice}-${format === "thermal58" ? "58mm" : "80mm"}.pdf`);
};
