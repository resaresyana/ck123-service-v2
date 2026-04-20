import { useState } from "react";
import { ArrowLeft, Database, Download, Upload, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const BackupData = () => {
  const navigate = useNavigate();
  const [showRestore, setShowRestore] = useState(false);

  const handleBackup = async () => {
    try {
      // Export data from localStorage as JSON
      const backupData: Record<string, string | null> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) backupData[key] = localStorage.getItem(key);
      }
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `backup-ck123-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Backup berhasil diunduh!");
    } catch {
      toast.error("Gagal membuat backup");
    }
  };

  const handleRestore = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        Object.entries(data).forEach(([key, value]) => {
          if (typeof value === "string") localStorage.setItem(key, value);
        });
        toast.success("Data berhasil di-restore! Silakan refresh halaman.");
        setShowRestore(false);
      } catch {
        toast.error("File backup tidak valid");
      }
    };
    input.click();
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/pengaturan")} className="p-2 rounded-xl glass-card-elevated">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-xl font-extrabold text-foreground tracking-tight">Backup Data</h1>
        </div>
      </div>

      <div className="px-4 space-y-4">
        <div className="glass-card-elevated rounded-2xl p-5 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/8 border border-primary/10 flex items-center justify-center mx-auto mb-4">
            <Database className="w-8 h-8 text-primary" />
          </div>
          <p className="text-sm font-semibold text-foreground mb-1">Cadangkan & Restore Data</p>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Backup data lokal Anda ke file JSON. Anda bisa restore kapan saja.
          </p>
        </div>

        <button onClick={handleBackup}
          className="w-full glass-card-elevated rounded-2xl p-4 flex items-center gap-3.5 text-left active:scale-[0.98] transition-transform">
          <div className="w-10 h-10 rounded-xl bg-success/10 border border-success/20 flex items-center justify-center flex-shrink-0">
            <Download className="w-5 h-5 text-success" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">Backup Sekarang</p>
            <p className="text-[11px] text-muted-foreground">Unduh file cadangan data</p>
          </div>
        </button>

        <button onClick={() => setShowRestore(true)}
          className="w-full glass-card-elevated rounded-2xl p-4 flex items-center gap-3.5 text-left active:scale-[0.98] transition-transform">
          <div className="w-10 h-10 rounded-xl bg-warning/10 border border-warning/20 flex items-center justify-center flex-shrink-0">
            <Upload className="w-5 h-5 text-warning" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">Restore Data</p>
            <p className="text-[11px] text-muted-foreground">Pulihkan dari file backup</p>
          </div>
        </button>
      </div>

      <AlertDialog open={showRestore} onOpenChange={setShowRestore}>
        <AlertDialogContent className="glass-card-elevated rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-extrabold flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" /> Restore Data?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Data lokal yang ada sekarang akan ditimpa dengan data dari file backup. Pastikan Anda memilih file yang benar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleRestore} className="gradient-primary text-primary-foreground rounded-xl">
              Pilih File & Restore
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BackupData;
