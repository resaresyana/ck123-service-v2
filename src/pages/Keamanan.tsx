import { useState } from "react";
import { ArrowLeft, Shield, Lock, Eye, EyeOff, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Keamanan = () => {
  const navigate = useNavigate();
  const [changingPassword, setChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      toast.error("Password minimal 6 karakter");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Password tidak cocok");
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success("Password berhasil diubah!");
      setChangingPassword(false);
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err.message || "Gagal mengubah password");
    } finally {
      setSaving(false);
    }
  };

  const handleLogoutAll = async () => {
    try {
      await supabase.auth.signOut({ scope: "global" });
      toast.success("Semua sesi berhasil di-logout");
      navigate("/login");
    } catch {
      toast.error("Gagal logout semua sesi");
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/pengaturan")} className="p-2 rounded-xl glass-card-elevated">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-xl font-extrabold text-foreground tracking-tight">Keamanan</h1>
        </div>
      </div>

      <div className="px-4 space-y-4">
        {/* Change Password */}
        <div className="glass-card-elevated rounded-2xl overflow-hidden">
          <button onClick={() => setChangingPassword(!changingPassword)}
            className="w-full flex items-center gap-3.5 p-4 text-left active:bg-muted/30 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-primary/8 border border-primary/10 flex items-center justify-center flex-shrink-0">
              <Lock className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">Ubah Password</p>
              <p className="text-[11px] text-muted-foreground">Ganti password akun Anda</p>
            </div>
          </button>

          {changingPassword && (
            <div className="px-4 pb-4 space-y-3 animate-fade-in">
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input-field pr-10"
                  placeholder="Password baru"
                />
                <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
                  {showPassword ? <EyeOff className="w-4 h-4 text-muted-foreground" /> : <Eye className="w-4 h-4 text-muted-foreground" />}
                </button>
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-field"
                placeholder="Konfirmasi password baru"
              />
              <button onClick={handleChangePassword} disabled={saving}
                className="w-full py-3 rounded-xl gradient-primary text-primary-foreground font-bold text-sm active:scale-[0.97] transition-transform disabled:opacity-50">
                {saving ? "Menyimpan..." : "Simpan Password"}
              </button>
            </div>
          )}
        </div>

        {/* Logout All Sessions */}
        <button onClick={handleLogoutAll}
          className="w-full glass-card-elevated rounded-2xl p-4 flex items-center gap-3.5 text-left active:scale-[0.98] transition-transform">
          <div className="w-10 h-10 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center justify-center flex-shrink-0">
            <LogOut className="w-5 h-5 text-destructive" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-destructive">Logout Semua Perangkat</p>
            <p className="text-[11px] text-muted-foreground">Keluar dari semua sesi aktif</p>
          </div>
        </button>
      </div>
    </div>
  );
};

export default Keamanan;
