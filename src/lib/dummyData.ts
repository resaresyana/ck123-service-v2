import { ServiceData } from "@/components/ServiceCard";

export const dummyServices: ServiceData[] = [
  {
    id: "1",
    customerName: "Budi Santoso",
    phone: "081234567890",
    deviceBrand: "Samsung",
    deviceModel: "Galaxy A54",
    complaint: "LCD pecah, touchscreen tidak fungsi",
    status: "proses",
    totalCost: 450000,
    dpAmount: 200000,
    createdAt: "2026-04-09",
    invoice: "INV-20260409-001",
  },
  {
    id: "2",
    customerName: "Siti Rahmawati",
    phone: "082345678901",
    deviceBrand: "iPhone",
    deviceModel: "13 Pro",
    complaint: "Baterai cepat habis, health 72%",
    status: "selesai",
    totalCost: 650000,
    dpAmount: 650000,
    createdAt: "2026-04-09",
    invoice: "INV-20260409-002",
  },
  {
    id: "3",
    customerName: "Ahmad Fauzi",
    phone: "083456789012",
    deviceBrand: "Xiaomi",
    deviceModel: "Redmi Note 12",
    complaint: "Tidak bisa cas, port charging rusak",
    status: "masuk",
    totalCost: 150000,
    dpAmount: 0,
    createdAt: "2026-04-09",
    invoice: "INV-20260409-003",
  },
  {
    id: "4",
    customerName: "Dewi Lestari",
    phone: "084567890123",
    deviceBrand: "OPPO",
    deviceModel: "Reno 8",
    complaint: "Speaker tidak bunyi",
    status: "selesai",
    totalCost: 200000,
    dpAmount: 200000,
    createdAt: "2026-04-08",
    invoice: "INV-20260408-001",
  },
  {
    id: "5",
    customerName: "Riko Pratama",
    phone: "085678901234",
    deviceBrand: "Vivo",
    deviceModel: "Y36",
    complaint: "Kamera belakang buram / blur",
    status: "diambil",
    totalCost: 300000,
    dpAmount: 300000,
    createdAt: "2026-04-08",
    invoice: "INV-20260408-002",
  },
];

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  minStock: number;
}

export const dummyProducts: Product[] = [
  { id: "p1", name: "Tempered Glass Samsung", category: "Aksesoris", price: 25000, stock: 50, minStock: 10 },
  { id: "p2", name: "Case iPhone 13", category: "Aksesoris", price: 35000, stock: 30, minStock: 5 },
  { id: "p3", name: "Charger Type-C 2A", category: "Aksesoris", price: 45000, stock: 20, minStock: 5 },
  { id: "p4", name: "LCD Samsung A54", category: "Sparepart", price: 380000, stock: 3, minStock: 2 },
  { id: "p5", name: "Baterai iPhone 13 Pro", category: "Sparepart", price: 450000, stock: 5, minStock: 2 },
  { id: "p6", name: "Kabel Data Lightning", category: "Aksesoris", price: 30000, stock: 40, minStock: 10 },
  { id: "p7", name: "Earphone Bluetooth", category: "Aksesoris", price: 85000, stock: 15, minStock: 5 },
  { id: "p8", name: "Port Charging Xiaomi", category: "Sparepart", price: 50000, stock: 8, minStock: 3 },
];
