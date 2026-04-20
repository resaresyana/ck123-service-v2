import { useState, useEffect } from "react";
import { ArrowLeft, Save, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getShopInfo, saveShopInfo, setCachedShopInfo, ShopInfo } from "@/lib/shopStore";

const PengaturanNota = () => {
  const navigate = useNavigate();
  const [shop, setShop] = useState<ShopInfo | null>(null);
  const [footer, setFooter] = useState("");
  const [showLogo, setShowLogo] = useState(() => { try { return JSON.parse(localStorage.getItem("ck123_nota_show_logo") || "true"); } catch { return true; } });
  
  const [paperSize, setPaperSize] = useState(() => localStorage.getItem("ck123_nota_paper") || "58mm");

  useEffect(() => {
    getShopInfo().then((info) => { setShop(info); setFooter(info.footer); });
  }, []);

  const handleSave = async () => {
    if (!shop) return;
    try {
      const updated = { ...shop, footer };
      await saveShopInfo(updated);
      setCachedShopInfo(updated);
      localStorage.setItem("ck123_nota_show_logo", JSON.stringify(showLogo));
      
      localStorage.setItem("ck123_nota_paper", paperSize);
      toast.success("Pengaturan nota berhasil disimpan");
    } catch (err: any) { toast.error(err.message); }
  };

  if (!shop) return <div className="page-container flex items-center justify-center"><div className="animate-pulse text-muted-foreground text-sm">Memuat data...</div></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate("/pengaturan")} className="p-2 rounded-xl bg-card border border-border/50"><ArrowLeft className="w-5 h-5 text-foreground" /></button>
          <h1 className="text-xl font-bold text-foreground">Pengaturan Nota</h1>
        </div>
      </div>
      <div className="px-4 space-y-5">
        <div><p className="section-title">Ukuran Kertas</p>
          <div className="grid grid-cols-3 gap-2">{["58mm", "76mm", "A4"].map((size) => (
            <button key={size} onClick={() => setPaperSize(size)} className={`py-2.5 rounded-xl text-xs font-medium transition-all ${paperSize === size ? "gradient-primary text-primary-foreground shadow-md shadow-primary/20" : "bg-secondary text-secondary-foreground"}`}>{size}</button>
          ))}</div>
        </div>
        <div><p className="section-title">Tampilan Nota</p>
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border/50">
              <div><p className="text-sm font-medium text-foreground">Tampilkan Logo</p><p className="text-[11px] text-muted-foreground">Logo toko di header nota</p></div>
              <button onClick={() => setShowLogo(!showLogo)} className={`w-12 h-7 rounded-full transition-all relative ${showLogo ? "gradient-primary" : "bg-secondary"}`}><div className={`w-5 h-5 rounded-full bg-card shadow-md absolute top-1 transition-all ${showLogo ? "right-1" : "left-1"}`} /></button>
            </div>
          </div>
        </div>
        <div><p className="section-title">Footer Nota</p><textarea value={footer} onChange={(e) => setFooter(e.target.value)} className="input-field resize-none" rows={3} placeholder="Pesan di bagian bawah nota" /></div>
        <div><p className="section-title">Preview</p>
          <div className="glass-card rounded-xl p-4 text-center space-y-2">
            {showLogo && <div className="w-10 h-10 rounded-full bg-primary/10 mx-auto flex items-center justify-center"><FileText className="w-5 h-5 text-primary" /></div>}
            <p className="text-sm font-bold text-foreground">{shop.name}</p>
            <p className="text-[10px] text-muted-foreground">{shop.address}</p>
            <div className="border-t border-dashed border-border my-2" />
            <p className="text-[10px] text-muted-foreground">--- Detail Service ---</p>
            <div className="border-t border-dashed border-border my-2" />
            
            <p className="text-[10px] text-muted-foreground italic">{footer}</p>
            <p className="text-[9px] text-muted-foreground">Kertas: {paperSize}</p>
          </div>
        </div>
        <button onClick={handleSave} className="w-full py-3.5 rounded-xl gradient-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/25 active:scale-[0.98] transition-transform mb-6"><Save className="w-4 h-4" /> Simpan Pengaturan</button>
      </div>
    </div>
  );
};

export default PengaturanNota;
