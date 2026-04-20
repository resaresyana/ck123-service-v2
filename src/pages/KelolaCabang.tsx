import { useState, useEffect } from "react";
import { ArrowLeft, Plus, MapPin, Phone, Trash2, X, Pencil, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getBranches, addBranch, deleteBranch, updateBranch, Branch } from "@/lib/branchStore";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const KelolaCabang = () => {
  const navigate = useNavigate();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [editName, setEditName] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editPhone, setEditPhone] = useState("");

  useEffect(() => { getBranches().then(setBranches).finally(() => setLoading(false)); }, []);

  const handleAdd = async () => {
    if (!name.trim()) { toast.error("Nama cabang harus diisi"); return; }
    if (!address.trim()) { toast.error("Alamat harus diisi"); return; }
    try {
      const updated = await addBranch({ name: name.trim(), address: address.trim(), phone: phone.trim() });
      setBranches(updated);
      setName(""); setAddress(""); setPhone("");
      setShowForm(false);
      toast.success("Cabang berhasil ditambahkan");
    } catch (err: any) { toast.error(err.message); }
  };

  const startEdit = (branch: Branch) => {
    setEditTarget(branch.id);
    setEditName(branch.name);
    setEditAddress(branch.address);
    setEditPhone(branch.phone);
  };

  const handleEdit = async () => {
    if (!editTarget) return;
    if (!editName.trim()) { toast.error("Nama cabang harus diisi"); return; }
    if (!editAddress.trim()) { toast.error("Alamat harus diisi"); return; }
    try {
      const updated = await updateBranch(editTarget, { name: editName.trim(), address: editAddress.trim(), phone: editPhone.trim() });
      setBranches(updated);
      setEditTarget(null);
      toast.success("Cabang berhasil diperbarui");
    } catch (err: any) { toast.error(err.message); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const branch = branches.find((b) => b.id === deleteTarget);
    if (branch?.is_main) { toast.error("Cabang utama tidak bisa dihapus"); setDeleteTarget(null); return; }
    try {
      const updated = await deleteBranch(deleteTarget);
      setBranches(updated);
      setDeleteTarget(null);
      toast.success("Cabang berhasil dihapus");
    } catch (err: any) { toast.error(err.message); }
  };

  if (loading) return <div className="page-container flex items-center justify-center"><div className="animate-pulse text-muted-foreground text-sm">Memuat data...</div></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate("/pengaturan")} className="p-2 rounded-xl bg-card border border-border/50"><ArrowLeft className="w-5 h-5 text-foreground" /></button>
          <h1 className="text-xl font-bold text-foreground">Kelola Cabang</h1>
        </div>
      </div>
      <div className="px-4 space-y-4">
        <div className="space-y-3">
          {branches.map((branch) => (
            <div key={branch.id} className="glass-card rounded-xl p-4 animate-fade-in">
              {editTarget === branch.id ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-foreground">Edit Cabang</p>
                    <button onClick={() => setEditTarget(null)} className="p-1"><X className="w-4 h-4 text-muted-foreground" /></button>
                  </div>
                  <input type="text" placeholder="Nama Cabang *" value={editName} onChange={(e) => setEditName(e.target.value)} className="input-field" />
                  <input type="text" placeholder="Alamat *" value={editAddress} onChange={(e) => setEditAddress(e.target.value)} className="input-field" />
                  <input type="tel" placeholder="No. Telepon" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} className="input-field" />
                  <button onClick={handleEdit} className="w-full py-3 rounded-xl gradient-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform">
                    <Save className="w-4 h-4" /> Simpan Perubahan
                  </button>
                </div>
              ) : (
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-foreground">{branch.name}</p>
                      {branch.is_main && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/15 text-primary">Utama</span>}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1"><MapPin className="w-3 h-3" />{branch.address}</div>
                    {branch.phone && <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Phone className="w-3 h-3" />{branch.phone}</div>}
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => startEdit(branch)} className="p-1.5 text-primary"><Pencil className="w-4 h-4" /></button>
                    {!branch.is_main && <button onClick={() => setDeleteTarget(branch.id)} className="p-1.5 text-destructive"><Trash2 className="w-4 h-4" /></button>}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {showForm ? (
          <div className="glass-card rounded-xl p-4 space-y-3 animate-fade-in">
            <div className="flex items-center justify-between"><p className="text-sm font-semibold text-foreground">Tambah Cabang Baru</p><button onClick={() => setShowForm(false)} className="p-1"><X className="w-4 h-4 text-muted-foreground" /></button></div>
            <input type="text" placeholder="Nama Cabang *" value={name} onChange={(e) => setName(e.target.value)} className="input-field" />
            <input type="text" placeholder="Alamat *" value={address} onChange={(e) => setAddress(e.target.value)} className="input-field" />
            <input type="tel" placeholder="No. Telepon" value={phone} onChange={(e) => setPhone(e.target.value)} className="input-field" />
            <button onClick={handleAdd} className="w-full py-3 rounded-xl gradient-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/25 active:scale-[0.98] transition-transform"><Plus className="w-4 h-4" /> Tambah Cabang</button>
          </div>
        ) : (
          <button onClick={() => setShowForm(true)} className="w-full py-3 rounded-xl border-2 border-dashed border-border text-muted-foreground text-sm font-medium flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"><Plus className="w-4 h-4" /> Tambah Cabang Baru</button>
        )}
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Hapus Cabang?</AlertDialogTitle><AlertDialogDescription>Cabang akan dihapus permanen dan tidak bisa dikembalikan.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Batal</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Hapus</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default KelolaCabang;
