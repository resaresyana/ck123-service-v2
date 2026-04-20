import { useState, useEffect } from "react";
import { ArrowLeft, Plus, Trash2, X, UserCheck, UserX, Wrench, ShieldCheck, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getEmployees, addEmployee, deleteEmployee, toggleEmployeeActive, Employee, getBranches, Branch } from "@/lib/branchStore";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const roleConfig = {
  admin: { label: "Admin", icon: ShieldCheck, className: "bg-primary/15 text-primary" },
  teknisi: { label: "Teknisi", icon: Wrench, className: "bg-info/15 text-info" },
  kasir: { label: "Kasir", icon: DollarSign, className: "bg-success/15 text-success" },
};

const KelolaKaryawan = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [filterRole, setFilterRole] = useState<string>("Semua");
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"admin" | "teknisi" | "kasir">("teknisi");
  const [branchId, setBranchId] = useState("");

  useEffect(() => {
    Promise.all([getEmployees(), getBranches()])
      .then(([e, b]) => { setEmployees(e); setBranches(b); if (b.length > 0) setBranchId(b[0].id); })
      .finally(() => setLoading(false));
  }, []);

  const filtered = filterRole === "Semua" ? employees : employees.filter((e) => e.role === filterRole.toLowerCase());

  const handleAdd = async () => {
    if (!name.trim()) { toast.error("Nama karyawan harus diisi"); return; }
    if (!phone.trim()) { toast.error("No. HP harus diisi"); return; }
    try {
      const updated = await addEmployee({ name: name.trim(), phone: phone.trim(), role, branchId, active: true });
      setEmployees(updated);
      setName(""); setPhone(""); setRole("teknisi"); setShowForm(false);
      toast.success("Karyawan berhasil ditambahkan");
    } catch (err: any) { toast.error(err.message); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const updated = await deleteEmployee(deleteTarget);
      setEmployees(updated);
      setDeleteTarget(null);
      toast.success("Karyawan berhasil dihapus");
    } catch (err: any) { toast.error(err.message); }
  };

  const handleToggleActive = async (id: string) => {
    try {
      const updated = await toggleEmployeeActive(id);
      setEmployees(updated);
      const emp = updated.find((e) => e.id === id);
      toast.success(emp?.active ? "Karyawan diaktifkan" : "Karyawan dinonaktifkan");
    } catch (err: any) { toast.error(err.message); }
  };

  const getBranchName = (id: string) => branches.find((b) => b.id === id)?.name || "-";

  if (loading) return <div className="page-container flex items-center justify-center"><div className="animate-pulse text-muted-foreground text-sm">Memuat data...</div></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate("/pengaturan")} className="p-2 rounded-xl bg-card border border-border/50"><ArrowLeft className="w-5 h-5 text-foreground" /></button>
          <div className="flex-1"><h1 className="text-xl font-bold text-foreground">Kelola Karyawan</h1><p className="text-xs text-muted-foreground">{employees.length} karyawan terdaftar</p></div>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
          {["Semua", "Admin", "Teknisi", "Kasir"].map((f) => (
            <button key={f} onClick={() => setFilterRole(f)} className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${filterRole === f ? "gradient-primary text-primary-foreground shadow-md shadow-primary/20" : "bg-secondary text-secondary-foreground"}`}>{f}</button>
          ))}
        </div>
      </div>

      <div className="px-4 space-y-4">
        {filtered.length === 0 ? (
          <div className="text-center py-12"><p className="text-sm text-muted-foreground">Belum ada karyawan{filterRole !== "Semua" ? ` dengan peran ${filterRole}` : ""}</p></div>
        ) : (
          <div className="space-y-3">
            {filtered.map((emp) => {
              const rc = roleConfig[emp.role];
              const RoleIcon = rc.icon;
              return (
                <div key={emp.id} className={`glass-card rounded-xl p-4 animate-fade-in ${!emp.active ? "opacity-50" : ""}`}>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0"><RoleIcon className="w-5 h-5 text-primary" /></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5"><p className="text-sm font-semibold text-foreground truncate">{emp.name}</p><span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${rc.className}`}>{rc.label}</span></div>
                      <p className="text-xs text-muted-foreground">{emp.phone}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{getBranchName(emp.branchId)}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleToggleActive(emp.id)} className={`p-1.5 rounded-lg transition-colors ${emp.active ? "text-success" : "text-muted-foreground"}`}>{emp.active ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}</button>
                      <button onClick={() => setDeleteTarget(emp.id)} className="p-1.5 text-destructive"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {showForm ? (
          <div className="glass-card rounded-xl p-4 space-y-3 animate-fade-in">
            <div className="flex items-center justify-between"><p className="text-sm font-semibold text-foreground">Tambah Karyawan</p><button onClick={() => setShowForm(false)} className="p-1"><X className="w-4 h-4 text-muted-foreground" /></button></div>
            <input type="text" placeholder="Nama Karyawan *" value={name} onChange={(e) => setName(e.target.value)} className="input-field" />
            <input type="tel" placeholder="No. HP / WhatsApp *" value={phone} onChange={(e) => setPhone(e.target.value)} className="input-field" />
            <div><label className="text-xs font-medium text-muted-foreground mb-1.5 block">Peran</label>
              <div className="grid grid-cols-3 gap-2">{(["admin", "teknisi", "kasir"] as const).map((r) => { const rc = roleConfig[r]; return (
                <button key={r} onClick={() => setRole(r)} className={`py-2.5 rounded-xl text-xs font-medium transition-all ${role === r ? "gradient-primary text-primary-foreground shadow-md shadow-primary/20" : "bg-secondary text-secondary-foreground"}`}>{rc.label}</button>
              ); })}</div>
            </div>
            <div><label className="text-xs font-medium text-muted-foreground mb-1.5 block">Cabang</label>
              <select value={branchId} onChange={(e) => setBranchId(e.target.value)} className="input-field">{branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</select>
            </div>
            <button onClick={handleAdd} className="w-full py-3 rounded-xl gradient-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/25 active:scale-[0.98] transition-transform"><Plus className="w-4 h-4" /> Tambah Karyawan</button>
          </div>
        ) : (
          <button onClick={() => setShowForm(true)} className="w-full py-3 rounded-xl border-2 border-dashed border-border text-muted-foreground text-sm font-medium flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"><Plus className="w-4 h-4" /> Tambah Karyawan Baru</button>
        )}
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Hapus Karyawan?</AlertDialogTitle><AlertDialogDescription>Data karyawan akan dihapus permanen.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Batal</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Hapus</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default KelolaKaryawan;
