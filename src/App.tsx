import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes as RRoutes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import BottomNav from "@/components/BottomNav";
import { Suspense, useEffect } from "react";
import { Routes as AppRoutes, idlePrefetchAll } from "@/lib/routes";

const {
  Dashboard, ServiceList, ServiceForm, ServiceDetail, Kasir, Laporan,
  Pengaturan, BackupData, Keamanan, TentangAplikasi, KelolaCabang,
  KelolaKaryawan, PengaturanNota, PengaturanPrinter, PajakDiskon,
  PengaturanWaTemplate, Login, Beranda, RiwayatTransaksi, Booking, NotFound,
} = AppRoutes;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Lightweight non-blocking fallback — keeps layout shell stable so route swaps feel instant.
const PageFallback = () => (
  <div className="page-container animate-fade-in" aria-hidden="true">
    <div className="h-32 mb-4 rounded-2xl bg-card/40" />
    <div className="space-y-2 px-4">
      <div className="h-4 w-1/3 rounded bg-muted/40" />
      <div className="h-4 w-2/3 rounded bg-muted/40" />
      <div className="h-4 w-1/2 rounded bg-muted/40" />
    </div>
  </div>
);

const AppLayout = () => {
  const location = useLocation();
  const isFullBleed =
    location.pathname === "/" ||
    location.pathname === "/beranda" ||
    location.pathname === "/login";

  // Kick off idle prefetch of all routes once the app shell is mounted.
  useEffect(() => {
    idlePrefetchAll();
  }, []);

  return (
    <div className="min-h-screen">
      <BottomNav />
      <div className={isFullBleed ? "" : "lg:ml-[220px]"}>
        <div className={isFullBleed ? "" : "max-w-6xl mx-auto"}>
          <Suspense fallback={<PageFallback />}>
            <RRoutes>
              <Route path="/login" element={<Login.Component />} />
              <Route path="/" element={<Beranda.Component />} />
              <Route path="/beranda" element={<Beranda.Component />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard.Component /></ProtectedRoute>} />
              <Route path="/booking" element={<ProtectedRoute allowedRoles={["admin", "teknisi"]}><Booking.Component /></ProtectedRoute>} />
              <Route path="/service" element={<ProtectedRoute allowedRoles={["admin", "teknisi"]}><ServiceList.Component /></ProtectedRoute>} />
              <Route path="/service/new" element={<ProtectedRoute allowedRoles={["admin", "teknisi"]}><ServiceForm.Component /></ProtectedRoute>} />
              <Route path="/service/:id" element={<ProtectedRoute allowedRoles={["admin", "teknisi"]}><ServiceDetail.Component /></ProtectedRoute>} />
              <Route path="/kasir" element={<ProtectedRoute allowedRoles={["admin", "kasir"]}><Kasir.Component /></ProtectedRoute>} />
              <Route path="/kasir/riwayat" element={<ProtectedRoute allowedRoles={["admin", "kasir"]}><RiwayatTransaksi.Component /></ProtectedRoute>} />
              <Route path="/laporan" element={<ProtectedRoute allowedRoles={["admin"]}><Laporan.Component /></ProtectedRoute>} />
              <Route path="/pengaturan" element={<ProtectedRoute allowedRoles={["admin"]}><Pengaturan.Component /></ProtectedRoute>} />
              <Route path="/pengaturan/cabang" element={<ProtectedRoute allowedRoles={["admin"]}><KelolaCabang.Component /></ProtectedRoute>} />
              <Route path="/pengaturan/karyawan" element={<ProtectedRoute allowedRoles={["admin"]}><KelolaKaryawan.Component /></ProtectedRoute>} />
              <Route path="/pengaturan/nota" element={<ProtectedRoute allowedRoles={["admin"]}><PengaturanNota.Component /></ProtectedRoute>} />
              <Route path="/pengaturan/printer" element={<ProtectedRoute allowedRoles={["admin"]}><PengaturanPrinter.Component /></ProtectedRoute>} />
              <Route path="/pengaturan/pajak-diskon" element={<ProtectedRoute allowedRoles={["admin"]}><PajakDiskon.Component /></ProtectedRoute>} />
              <Route path="/pengaturan/wa-template" element={<ProtectedRoute allowedRoles={["admin"]}><PengaturanWaTemplate.Component /></ProtectedRoute>} />
              <Route path="/pengaturan/backup" element={<ProtectedRoute allowedRoles={["admin"]}><BackupData.Component /></ProtectedRoute>} />
              <Route path="/pengaturan/keamanan" element={<ProtectedRoute allowedRoles={["admin"]}><Keamanan.Component /></ProtectedRoute>} />
              <Route path="/pengaturan/tentang" element={<ProtectedRoute allowedRoles={["admin"]}><TentangAplikasi.Component /></ProtectedRoute>} />
              <Route path="*" element={<NotFound.Component />} />
            </RRoutes>
          </Suspense>
        </div>
      </div>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppLayout />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
