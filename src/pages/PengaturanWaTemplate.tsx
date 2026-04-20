import { useState, useEffect } from "react";
import { ArrowLeft, Save, MessageCircle, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getWaTemplates, updateWaTemplate, WaTemplate } from "@/lib/waTemplateStore";

const variableHelp = [
  { var: "{nama}", desc: "Nama pelanggan" },
  { var: "{perangkat}", desc: "Merk & model HP" },
  { var: "{invoice}", desc: "Nomor invoice" },
  { var: "{toko}", desc: "Nama toko" },
  { var: "{alamat}", desc: "Alamat toko" },
  { var: "{telepon}", desc: "No. telepon toko" },
  { var: "{total}", desc: "Total biaya" },
  { var: "{dp}", desc: "Jumlah DP" },
  { var: "{sisa}", desc: "Sisa pembayaran" },
  { var: "{status_lunas}", desc: "Tanda lunas (LUNAS ✅)" },
];

const PengaturanWaTemplate = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<WaTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editIcon, setEditIcon] = useState("");
  const [editMessage, setEditMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getWaTemplates()
      .then(setTemplates)
      .finally(() => setLoading(false));
  }, []);

  const startEdit = (t: WaTemplate) => {
    setEditingId(t.id);
    setEditTitle(t.title);
    setEditIcon(t.icon);
    setEditMessage(t.message);
  };

  const handleSave = async () => {
    if (!editingId) return;
    if (!editTitle.trim()) { toast.error("Judul tidak boleh kosong"); return; }
    if (!editMessage.trim()) { toast.error("Pesan tidak boleh kosong"); return; }
    setSaving(true);
    try {
      await updateWaTemplate(editingId, {
        title: editTitle.trim(),
        icon: editIcon.trim() || "📱",
        message: editMessage,
      });
      setTemplates((prev) =>
        prev.map((t) =>
          t.id === editingId
            ? { ...t, title: editTitle.trim(), icon: editIcon.trim() || "📱", message: editMessage }
            : t
        )
      );
      setEditingId(null);
      toast.success("Template berhasil disimpan!");
    } catch (err: any) {
      toast.error(err.message || "Gagal menyimpan template");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (editingId) {
    return (
      <div className="page-container pb-6">
        <div className="page-header">
          <div className="flex items-center gap-3">
            <button onClick={() => setEditingId(null)} className="p-2 rounded-xl glass-card-elevated active:scale-95 transition-transform">
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <h1 className="text-lg font-extrabold text-foreground tracking-tight">Edit Template</h1>
          </div>
        </div>
        <div className="px-4 space-y-4">
          <div className="glass-card-elevated rounded-2xl p-4 space-y-4">
            <div className="grid grid-cols-[1fr_80px] gap-3">
              <div>
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">Judul Template</label>
                <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="input-field" placeholder="Judul template" />
              </div>
              <div>
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">Emoji</label>
                <input type="text" value={editIcon} onChange={(e) => setEditIcon(e.target.value)} className="input-field text-center text-xl" placeholder="📱" maxLength={4} />
              </div>
            </div>
            <div>
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">Isi Pesan</label>
              <textarea
                value={editMessage}
                onChange={(e) => setEditMessage(e.target.value)}
                className="input-field resize-none font-mono text-xs"
                rows={14}
                placeholder="Tulis template pesan WhatsApp..."
              />
            </div>
          </div>

          {/* Variable reference */}
          <div className="glass-card-elevated rounded-2xl p-4">
            <p className="text-xs font-bold text-foreground mb-2">Variabel yang tersedia:</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              {variableHelp.map((v) => (
                <div key={v.var} className="flex items-center gap-2 py-1">
                  <code className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold">{v.var}</code>
                  <span className="text-[11px] text-muted-foreground">{v.desc}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3.5 rounded-xl gradient-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 shadow-[0_8px_24px_-4px_hsl(var(--primary)/0.4)] active:scale-[0.97] transition-transform disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> {saving ? "Menyimpan..." : "Simpan Template"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container pb-6">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl glass-card-elevated active:scale-95 transition-transform">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div>
            <h1 className="text-lg font-extrabold text-foreground tracking-tight">Template WhatsApp</h1>
            <p className="text-[11px] text-muted-foreground font-medium">Kelola pesan follow up pelanggan</p>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-3">
        {templates.map((t) => (
          <button
            key={t.id}
            onClick={() => startEdit(t)}
            className="w-full glass-card-elevated rounded-2xl p-4 text-left active:scale-[0.98] transition-transform"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{t.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground">{t.title}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{t.message.substring(0, 80)}...</p>
              </div>
              <MessageCircle className="w-4 h-4 text-muted-foreground/40 flex-shrink-0" />
            </div>
          </button>
        ))}

        {templates.length === 0 && (
          <div className="text-center py-10">
            <MessageCircle className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Belum ada template</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PengaturanWaTemplate;
