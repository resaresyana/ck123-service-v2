import { useState } from "react";
import { FileText, X, Printer } from "lucide-react";
import { NotaFormat, generateNotaPDF } from "@/lib/generateNota";
import { ServiceData } from "@/components/ServiceCard";

interface NotaFormatPickerProps {
  service: ServiceData;
  open: boolean;
  onClose: () => void;
}

const formats: { id: NotaFormat; label: string; desc: string; icon: string }[] = [
  { id: "a4", label: "PDF A4", desc: "Ukuran kertas standar A4, cocok untuk arsip", icon: "📄" },
  { id: "thermal58", label: "Thermal 58mm", desc: "Printer kasir kecil (58mm)", icon: "🖨️" },
  { id: "thermal80", label: "Thermal 80mm", desc: "Printer kasir standar (80mm)", icon: "🖨️" },
];

const NotaFormatPicker = ({ service, open, onClose }: NotaFormatPickerProps) => {
  if (!open) return null;

  const handleSelect = async (format: NotaFormat) => {
    await generateNotaPDF(service, format);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg bg-card rounded-t-2xl p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-primary" />
            <h3 className="text-base font-bold text-foreground">Pilih Format Nota</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg bg-secondary">
            <X className="w-4 h-4 text-secondary-foreground" />
          </button>
        </div>

        <div className="space-y-2.5">
          {formats.map((f) => (
            <button
              key={f.id}
              onClick={() => handleSelect(f.id)}
              className="w-full flex items-center gap-3 p-4 rounded-xl bg-secondary/50 border border-border/50 text-left active:scale-[0.98] transition-all hover:bg-secondary"
            >
              <span className="text-2xl">{f.icon}</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{f.label}</p>
                <p className="text-[11px] text-muted-foreground">{f.desc}</p>
              </div>
              <FileText className="w-4 h-4 text-muted-foreground" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotaFormatPicker;
