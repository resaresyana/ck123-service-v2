// Centralized lazy route registry with hover/idle prefetching for fast navigation.
import { lazy } from "react";

// Each entry: lazy-loaded component + the raw import factory (used for prefetch on hover/idle).
const make = (factory: () => Promise<any>) => ({
  Component: lazy(factory),
  prefetch: factory,
});

export const Routes = {
  Dashboard: make(() => import("@/pages/Dashboard")),
  ServiceList: make(() => import("@/pages/ServiceList")),
  ServiceForm: make(() => import("@/pages/ServiceForm")),
  ServiceDetail: make(() => import("@/pages/ServiceDetail")),
  Kasir: make(() => import("@/pages/Kasir")),
  Laporan: make(() => import("@/pages/Laporan")),
  Pengaturan: make(() => import("@/pages/Pengaturan")),
  BackupData: make(() => import("@/pages/BackupData")),
  Keamanan: make(() => import("@/pages/Keamanan")),
  TentangAplikasi: make(() => import("@/pages/TentangAplikasi")),
  KelolaCabang: make(() => import("@/pages/KelolaCabang")),
  KelolaKaryawan: make(() => import("@/pages/KelolaKaryawan")),
  PengaturanNota: make(() => import("@/pages/PengaturanNota")),
  PengaturanPrinter: make(() => import("@/pages/PengaturanPrinter")),
  PajakDiskon: make(() => import("@/pages/PajakDiskon")),
  PengaturanWaTemplate: make(() => import("@/pages/PengaturanWaTemplate")),
  Login: make(() => import("@/pages/Login")),
  Beranda: make(() => import("@/pages/Beranda")),
  RiwayatTransaksi: make(() => import("@/pages/RiwayatTransaksi")),
  Booking: make(() => import("@/pages/Booking")),
  NotFound: make(() => import("@/pages/NotFound")),
};

// Map URL path -> prefetch fn for sidebar/bottom-nav hover.
export const PREFETCH_BY_PATH: Record<string, () => Promise<any>> = {
  "/dashboard": Routes.Dashboard.prefetch,
  "/booking": Routes.Booking.prefetch,
  "/service": Routes.ServiceList.prefetch,
  "/service/new": Routes.ServiceForm.prefetch,
  "/kasir": Routes.Kasir.prefetch,
  "/kasir/riwayat": Routes.RiwayatTransaksi.prefetch,
  "/laporan": Routes.Laporan.prefetch,
  "/pengaturan": Routes.Pengaturan.prefetch,
  "/pengaturan/cabang": Routes.KelolaCabang.prefetch,
  "/pengaturan/karyawan": Routes.KelolaKaryawan.prefetch,
  "/pengaturan/nota": Routes.PengaturanNota.prefetch,
  "/pengaturan/printer": Routes.PengaturanPrinter.prefetch,
  "/pengaturan/pajak-diskon": Routes.PajakDiskon.prefetch,
  "/pengaturan/wa-template": Routes.PengaturanWaTemplate.prefetch,
  "/pengaturan/backup": Routes.BackupData.prefetch,
  "/pengaturan/keamanan": Routes.Keamanan.prefetch,
  "/pengaturan/tentang": Routes.TentangAplikasi.prefetch,
  "/login": Routes.Login.prefetch,
  "/": Routes.Beranda.prefetch,
  "/beranda": Routes.Beranda.prefetch,
};

const triggered = new Set<string>();
export const prefetchRoute = (path: string) => {
  if (triggered.has(path)) return;
  const fn = PREFETCH_BY_PATH[path];
  if (!fn) return;
  triggered.add(path);
  // Fire & forget — browsers cache it.
  fn().catch(() => triggered.delete(path));
};

// Idle-prefetch the most likely next routes after first paint.
export const idlePrefetchAll = () => {
  const queue = Object.values(PREFETCH_BY_PATH);
  const ric: any =
    (typeof window !== "undefined" && (window as any).requestIdleCallback) ||
    ((cb: any) => setTimeout(cb, 200));
  queue.forEach((fn, i) => {
    ric(() => {
      try {
        fn();
      } catch {}
    }, { timeout: 2000 + i * 50 });
  });
};
