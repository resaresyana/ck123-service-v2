import { useState } from "react";
import { ArrowLeft, Save, Bluetooth, Wifi, Usb, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface PrinterDevice {
  id: string;
  name: string;
  type: "bluetooth" | "wifi" | "usb";
  connected: boolean;
}

const PengaturanPrinter = () => {
  const navigate = useNavigate();
  const [autoPrint, setAutoPrint] = useState(() => {
    try { return JSON.parse(localStorage.getItem("ck123_auto_print") || "false"); } catch { return false; }
  });
  const [printCopy, setPrintCopy] = useState(() => {
    try { return parseInt(localStorage.getItem("ck123_print_copy") || "1"); } catch { return 1; }
  });
  const [connectedPrinter, setConnectedPrinter] = useState<PrinterDevice | null>(null);
  const [scanning, setScanning] = useState(false);

  const handleScan = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      toast.info("Tidak ditemukan printer di sekitar. Pastikan printer menyala dan bluetooth aktif.");
    }, 3000);
  };

  const handleSave = () => {
    localStorage.setItem("ck123_auto_print", JSON.stringify(autoPrint));
    localStorage.setItem("ck123_print_copy", String(printCopy));
    toast.success("Pengaturan printer berhasil disimpan");
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate("/pengaturan")} className="p-2 rounded-xl bg-card border border-border/50">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-xl font-bold text-foreground">Printer</h1>
        </div>
      </div>

      <div className="px-4 space-y-5">
        {/* Connected Printer */}
        <div>
          <p className="section-title">Printer Terhubung</p>
          {connectedPrinter ? (
            <div className="glass-card rounded-xl p-4 flex items-center gap-3">
              <Bluetooth className="w-5 h-5 text-primary" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{connectedPrinter.name}</p>
                <p className="text-[11px] text-success">Terhubung</p>
              </div>
            </div>
          ) : (
            <div className="glass-card rounded-xl p-6 text-center">
              <Bluetooth className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-3">Belum ada printer terhubung</p>
              <button
                onClick={handleScan}
                disabled={scanning}
                className="px-6 py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-medium flex items-center justify-center gap-2 mx-auto active:scale-[0.98] transition-transform shadow-lg shadow-primary/25 disabled:opacity-50"
              >
                <Search className={`w-4 h-4 ${scanning ? "animate-spin" : ""}`} />
                {scanning ? "Mencari..." : "Cari Printer"}
              </button>
            </div>
          )}
        </div>

        {/* Connection Types */}
        <div>
          <p className="section-title">Jenis Koneksi</p>
          <div className="glass-card rounded-xl overflow-hidden">
            {[
              { icon: Bluetooth, label: "Bluetooth", desc: "Printer thermal bluetooth" },
              { icon: Wifi, label: "WiFi / LAN", desc: "Printer jaringan lokal" },
              { icon: Usb, label: "USB OTG", desc: "Koneksi langsung kabel" },
            ].map((item, i, arr) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className={`flex items-center gap-3 p-4 ${i < arr.length - 1 ? "border-b border-border/50" : ""}`}
                >
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.label}</p>
                    <p className="text-[11px] text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Print Settings */}
        <div>
          <p className="section-title">Pengaturan Cetak</p>
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border/50">
              <div>
                <p className="text-sm font-medium text-foreground">Auto Print</p>
                <p className="text-[11px] text-muted-foreground">Cetak otomatis saat simpan</p>
              </div>
              <button
                onClick={() => setAutoPrint(!autoPrint)}
                className={`w-12 h-7 rounded-full transition-all relative ${autoPrint ? "gradient-primary" : "bg-secondary"}`}
              >
                <div className={`w-5 h-5 rounded-full bg-card shadow-md absolute top-1 transition-all ${autoPrint ? "right-1" : "left-1"}`} />
              </button>
            </div>
            <div className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-medium text-foreground">Jumlah Copy</p>
                <p className="text-[11px] text-muted-foreground">Jumlah salinan cetak</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPrintCopy(Math.max(1, printCopy - 1))}
                  className="w-8 h-8 rounded-lg bg-secondary text-foreground font-bold text-sm flex items-center justify-center"
                >
                  -
                </button>
                <span className="text-sm font-semibold text-foreground w-6 text-center">{printCopy}</span>
                <button
                  onClick={() => setPrintCopy(Math.min(5, printCopy + 1))}
                  className="w-8 h-8 rounded-lg bg-secondary text-foreground font-bold text-sm flex items-center justify-center"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full py-3.5 rounded-xl gradient-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/25 active:scale-[0.98] transition-transform mb-6"
        >
          <Save className="w-4 h-4" /> Simpan Pengaturan
        </button>
      </div>
    </div>
  );
};

export default PengaturanPrinter;
