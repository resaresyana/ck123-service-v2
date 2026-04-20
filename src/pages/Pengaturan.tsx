import { useState, useEffect, useRef } from "react";
import { Store, Phone, Image, FileText, Database, Shield, Info, ChevronRight, Moon, Sun, Save, X, Camera, Trash2, Settings, GitBranch, Users, Printer, Receipt, Percent, MessageCircle, Globe, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getShopInfo, saveShopInfo, fileToBase64, ShopInfo, setCachedShopInfo } from "@/lib/shopStore";

const Pengaturan = () => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(document.documentElement.classList.contains("dark"));
  const [editMode, setEditMode] = useState(false);
  const [shop, setShop] = useState<ShopInfo>({ name: "CK123 Celluler", address: "", phone: "", footer: "", logo: null });
  const [loading, setLoading] = useState(true);
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getShopInfo().then((info) => { setShop(info); setCachedShopInfo(info); }).finally(() => setLoading(false));
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2_000_000) { toast.error("Ukuran logo maksimal 2MB"); return; }
    const base64 = await fileToBase64(file);
    setShop((prev) => ({ ...prev, logo: base64 }));
  };

  const handleSave = async () => {
    if (!shop.name.trim()) { toast.error("Nama toko harus diisi"); return; }
    try {
      await saveShopInfo(shop);
      setEditMode(false);
      toast.success("Pengaturan toko berhasil disimpan!");
    } catch (err: any) {
      toast.error(err.message || "Gagal menyimpan");
    }
  };

  const tokoMenus = [
    { icon: Store, label: "Profil Toko", desc: "Nama, alamat, logo", action: () => setEditMode(true) },
    { icon: GitBranch, label: "Kelola Cabang", desc: "Tambah & atur cabang", action: () => navigate("/pengaturan/cabang") },
    { icon: Users, label: "Kelola Karyawan", desc: "Akun & hak akses", action: () => navigate("/pengaturan/karyawan") },
  ];
  const transaksiMenus = [
    { icon: Receipt, label: "Pengaturan Nota", desc: "Template & footer nota", action: () => navigate("/pengaturan/nota") },
    { icon: Printer, label: "Printer", desc: "Thermal printer bluetooth", action: () => navigate("/pengaturan/printer") },
    { icon: Percent, label: "Pajak & Diskon", desc: "Setting default pajak", action: () => navigate("/pengaturan/pajak-diskon") },
    { icon: MessageCircle, label: "Template WhatsApp", desc: "Pesan follow up pelanggan", action: () => navigate("/pengaturan/wa-template") },
  ];
  const aplikasiMenus = [
    { icon: Database, label: "Backup Data", desc: "Cadangkan & restore data", action: () => navigate("/pengaturan/backup") },
    { icon: Shield, label: "Keamanan", desc: "PIN & keamanan akun", action: () => navigate("/pengaturan/keamanan") },
    { icon: Info, label: "Tentang Aplikasi", desc: "v2.0.0", action: () => navigate("/pengaturan/tentang") },
  ];

  if (loading) {
    return <div className="page-container flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div>;
  }

  if (editMode) {
    return (
      <div className="page-container">
        <div className="page-header">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-extrabold text-foreground tracking-tight">Profil Toko</h1>
            <button onClick={() => { getShopInfo().then(setShop); setEditMode(false); }} className="p-2 rounded-xl glass-card-elevated"><X className="w-5 h-5 text-foreground" /></button>
          </div>
        </div>
        <div className="px-4">
          <div className="glass-card-elevated rounded-2xl p-5 space-y-5 animate-fade-in">
            <div className="flex flex-col items-center gap-3">
              <div onClick={() => logoInputRef.current?.click()} className="w-24 h-24 rounded-2xl border-2 border-dashed border-border flex items-center justify-center overflow-hidden cursor-pointer hover:border-primary/50 transition-all relative group">
                {shop.logo ? (
                  <><img src={shop.logo} alt="Logo" className="w-full h-full object-cover" /><div className="absolute inset-0 bg-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl"><Camera className="w-5 h-5 text-primary-foreground" /></div></>
                ) : (
                  <div className="text-center"><Camera className="w-6 h-6 text-muted-foreground mx-auto mb-1" /><p className="text-[9px] text-muted-foreground font-medium">Upload Logo</p></div>
                )}
              </div>
              <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
              {shop.logo && (<button onClick={() => setShop((prev) => ({ ...prev, logo: null }))} className="text-[10px] text-destructive flex items-center gap-1 font-medium"><Trash2 className="w-3 h-3" /> Hapus Logo</button>)}
            </div>
            <div><label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Nama Toko</label><input type="text" value={shop.name} onChange={(e) => setShop((prev) => ({ ...prev, name: e.target.value }))} className="input-field" placeholder="Nama Toko" /></div>
            <div><label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Alamat</label><input type="text" value={shop.address} onChange={(e) => setShop((prev) => ({ ...prev, address: e.target.value }))} className="input-field" placeholder="Alamat Lengkap" /></div>
            <div><label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2 block">No. WhatsApp</label><input type="tel" value={shop.phone} onChange={(e) => setShop((prev) => ({ ...prev, phone: e.target.value }))} className="input-field" placeholder="081234567890" /></div>
            <div><label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Footer Nota</label><textarea value={shop.footer} onChange={(e) => setShop((prev) => ({ ...prev, footer: e.target.value }))} className="input-field resize-none" rows={2} placeholder="Pesan di footer nota" /></div>
            <button onClick={handleSave} className="w-full py-3.5 rounded-xl gradient-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 shadow-[0_8px_24px_-4px_hsl(var(--primary)/0.4)] active:scale-[0.97] transition-transform"><Save className="w-4 h-4" /> Simpan Pengaturan</button>
          </div>
        </div>
      </div>
    );
  }

  const MenuSection = ({ title, items }: { title: string; items: typeof tokoMenus }) => (
    <div>
      <p className="section-title">{title}</p>
      <div className="glass-card-elevated rounded-2xl overflow-hidden">
        {items.map((item, i, arr) => { const Icon = item.icon; return (
          <button key={item.label} onClick={item.action} className={`w-full flex items-center gap-3.5 p-4 text-left active:bg-muted/30 transition-colors ${i < arr.length - 1 ? "border-b border-border/30" : ""}`}>
            <div className="w-10 h-10 rounded-xl bg-primary/8 border border-primary/10 flex items-center justify-center flex-shrink-0"><Icon className="w-5 h-5 text-primary" /></div>
            <div className="flex-1"><p className="text-sm font-semibold text-foreground">{item.label}</p><p className="text-[11px] text-muted-foreground">{item.desc}</p></div>
            <ChevronRight className="w-4 h-4 text-muted-foreground/40 flex-shrink-0" />
          </button>
        ); })}
      </div>
    </div>
  );

  return (
    <div className="page-container">
      <div className="page-header"><h1 className="text-xl font-extrabold text-foreground tracking-tight">Pengaturan</h1></div>
      <div className="px-4 space-y-5">
        {/* Profile Card */}
        <button onClick={() => setEditMode(true)} className="w-full glass-card-elevated rounded-2xl p-4 flex items-center gap-3.5 text-left active:scale-[0.98] transition-transform">
          <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center flex-shrink-0 shadow-[0_6px_16px_-4px_hsl(var(--primary)/0.35)]">
            {shop.logo ? <img src={shop.logo} alt="Logo" className="w-full h-full rounded-2xl object-cover" /> : <span className="text-primary-foreground font-extrabold text-lg">CK</span>}
          </div>
          <div className="flex-1 min-w-0"><p className="text-sm font-bold text-foreground">{shop.name}</p><p className="text-[11px] text-muted-foreground font-medium">Super Admin • Cabang Utama</p></div>
          <ChevronRight className="w-4 h-4 text-muted-foreground/40 flex-shrink-0" />
        </button>

        {/* Dark Mode Toggle */}
        <div className="glass-card-elevated rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-primary/8 border border-primary/10 flex items-center justify-center">{darkMode ? <Moon className="w-5 h-5 text-primary" /> : <Sun className="w-5 h-5 text-accent" />}</div>
              <div><p className="text-sm font-semibold text-foreground">Mode Gelap</p><p className="text-[11px] text-muted-foreground">Ganti tampilan tema</p></div>
            </div>
            <button onClick={toggleDarkMode} className={`w-12 h-7 rounded-full transition-all relative ${darkMode ? "gradient-primary" : "bg-muted"}`}>
              <div className={`w-5 h-5 rounded-full bg-card shadow-md absolute top-1 transition-all ${darkMode ? "right-1" : "left-1"}`} />
            </button>
          </div>
        </div>

        <MenuSection title="TOKO" items={tokoMenus} />
        <MenuSection title="TRANSAKSI" items={transaksiMenus} />

        {/* Public landing shortcut */}
        <div>
          <p className="section-title">HALAMAN PUBLIK</p>
          <div className="glass-card-elevated rounded-2xl overflow-hidden">
            <button
              onClick={() => window.open("/beranda", "_blank")}
              className="w-full flex items-center gap-3.5 p-4 text-left active:bg-muted/30 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
                <Globe className="w-5 h-5 text-accent" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">Beranda Publik / Booking Online</p>
                <p className="text-[11px] text-muted-foreground">Halaman konsumen untuk booking & cek status</p>
              </div>
              <ExternalLink className="w-4 h-4 text-muted-foreground/40 flex-shrink-0" />
            </button>
          </div>
        </div>

        <MenuSection title="APLIKASI" items={aplikasiMenus} />

        <p className="text-center text-[10px] text-muted-foreground/40 pb-6 font-medium">{shop.name} — Smart Service System v2.0.0</p>
      </div>
    </div>
  );
};

export default Pengaturan;
