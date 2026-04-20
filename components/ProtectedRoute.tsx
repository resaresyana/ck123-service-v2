import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const ALLOWED_EMAIL = "ck123celluler@gmail.com";

interface Props {
  children: React.ReactNode;
  allowedRoles?: ("admin" | "teknisi" | "kasir")[];
}

const ProtectedRoute = ({ children, allowedRoles }: Props) => {
  const { user, loading, rolesLoading, hasRole } = useAuth();

  if (loading || (user && rolesLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  // Whitelist: only the designated owner email can access protected pages.
  const userEmail = (user.email ?? "").toLowerCase();
  const emailAllowed = userEmail === ALLOWED_EMAIL;

  // Enforce role check whenever allowedRoles is specified — no bypass for empty roles.
  const roleAllowed = !allowedRoles || allowedRoles.some((r) => hasRole(r));

  if (!emailAllowed || !roleAllowed) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-destructive/15 flex items-center justify-center mb-4">
          <span className="text-2xl">🚫</span>
        </div>
        <h1 className="text-lg font-bold text-foreground mb-2">Akses Ditolak</h1>
        <p className="text-sm text-muted-foreground">
          Halaman ini hanya dapat diakses oleh pemilik aplikasi.
        </p>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;

