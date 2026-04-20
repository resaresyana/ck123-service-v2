import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Search, CalendarCheck, Smartphone, Wrench, Cpu, ShoppingBag,
  Zap, ShieldCheck, Clock, Sparkles, Phone, MapPin,
  MessageCircle, ArrowRight, CheckCircle2, X, Loader2, LayoutDashboard,
  Users, Timer, Award,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getShopInfo, type ShopInfo } from "@/lib/shopStore";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import ck123Logo from "@/assets/ck123-logo.png";
import ReviewsSection from "@/components/ReviewsSection";

const HARDCODED: ShopInfo = {
  name: "CK123 Celluler",
  address: "Jl. Cisaranten Kulon No.123, Cisaranten Kulon, Kec. Arcamanik, Kota Bandung, Jawa Barat 40293",
  phone: "081321278355",
  footer: "SERVICE HP TERPERCAYA",
  logo: null,
};

const SERVICES = [
  { icon: Smartphone, title: "Service HP", desc: "Ganti LCD, baterai, cas, speaker, kamera, dll." },
  { icon: Wrench, title: "Hardware", desc: "Perbaikan komponen fisik & casing" },
  { icon: Cpu, title: "Software", desc: "Flash, unlock, restore data, install ulang" },
  { icon: ShoppingBag, title: "Aksesoris", desc: "Casing, tempered glass, charger, headset" },
];

const FEATURES = [
  { icon: Zap, title: "Cepat & Transparan", desc: "Estimasi waktu & biaya jelas di awal. Update status realtime." },
  { icon: ShieldCheck, title: "Garansi Service", desc: "Garansi pengerjaan untuk ketenangan hati Anda." },
  { icon: Search, title: "Tracking Online", desc: "Pantau progres perbaikan HP Anda kapan saja, di mana saja." },
];

const STATS = [
  { icon: Users, value: "1000+", label: "Pelanggan" },
  { icon: Wrench, value: "5000+", label: "Service selesai" },
  { icon: Timer, value: "<60 mnt", label: "Rata-rata" },
  { icon: Award, value: "Full", label: "Garansi" },
];


const Beranda = () => {
  const { user } = useAuth();
  const [shop, setShop] = useState<ShopInfo>(HARDCODED);
  const [checkOpen, setCheckOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);

  useEffect(() => {
    getShopInfo().then((info) => {
      setShop({ ...HARDCODED, logo: info.logo, name: info.name || HARDCODED.name });
    }).catch(() => {});
  }, []);

  const waNumber = useMemo(() => {
    let n = (shop.phone || HARDCODED.phone).replace(/\D/g, "");
    if (n.startsWith("0")) n = "62" + n.slice(1);
    return n;
  }, [shop.phone]);

  const waLink = (msg: string) => `https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`;
  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(shop.address)}`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/40 to-white text-slate-900 overflow-x-hidden">
      <header className="sticky top-0 z-40 bg-white/75 backdrop-blur-2xl border-b border-slate-200/60 shadow-[0_1px_0_rgba(15,23,42,0.02)]">
        <div className="max-w-6xl mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm overflow-hidden p-1">
              <img src={shop.logo || ck123Logo} alt={`${shop.name} logo`} className="w-full h-full object-contain" />
            </div>
            <div>
              <p className="text-sm font-extrabold tracking-tight leading-tight">{shop.name}</p>
              <p className="text-[10px] text-blue-600 font-bold tracking-wider">SERVICE HP · KONTER · SOLUSI TERPERCAYA</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setCheckOpen(true)} className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors">
              <Search className="w-4 h-4" /> Cek Status
            </button>
            <button onClick={() => setBookingOpen(true)} className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white text-sm font-semibold shadow-md shadow-blue-500/30 active:scale-95 transition-transform">
              <CalendarCheck className="w-4 h-4" /> Booking
            </button>
            {user ? (
              <Link to="/dashboard" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold shadow-md shadow-blue-600/30 active:scale-95 transition-transform">
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </Link>
            ) : (
              <Link to="/login" className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold shadow-md shadow-blue-600/30 active:scale-95 transition-transform">
                Login
              </Link>
            )}
          </div>
        </div>
      </header>

      <section className="relative px-4 lg:px-8 pt-12 lg:pt-16 pb-20 overflow-hidden">
        {/* Decorative background */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-32 -left-24 w-[28rem] h-[28rem] rounded-full bg-blue-300/30 blur-3xl" />
          <div className="absolute top-20 -right-24 w-[26rem] h-[26rem] rounded-full bg-cyan-300/30 blur-3xl" />
          <div className="absolute inset-0 opacity-[0.35]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgb(148 163 184 / 0.35) 1px, transparent 0)", backgroundSize: "22px 22px", maskImage: "radial-gradient(ellipse at center, black 40%, transparent 75%)" }} />
        </div>

        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 animate-fade-in">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur border border-slate-200 text-xs font-semibold text-slate-700 shadow-sm">
              <span className="relative flex w-2 h-2">
                <span className="absolute inline-flex w-full h-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                <span className="relative inline-flex w-2 h-2 rounded-full bg-emerald-500" />
              </span>
              Tracking online realtime · Buka sekarang
            </span>
            <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight leading-[1.05]">
              Service HP cepat &{" "}
              <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-400 bg-clip-text text-transparent">terpercaya</span>{" "}
              di {shop.name}.
            </h1>
            <p className="text-base lg:text-lg text-slate-600 max-w-xl leading-relaxed">
              Cek status perbaikan HP Anda kapan saja secara online — cukup masukkan kode service & nomor HP.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <button onClick={() => setBookingOpen(true)} className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white font-bold shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 hover:-translate-y-0.5 active:scale-[0.97] transition-all">
                <CalendarCheck className="w-5 h-5" /> Booking Antrian <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
              <button onClick={() => setCheckOpen(true)} className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/90 backdrop-blur border border-slate-200 text-slate-800 font-bold shadow-sm hover:border-blue-300 hover:shadow-md active:scale-[0.97] transition-all">
                <Search className="w-5 h-5" /> Cek Status
              </button>
            </div>
            <div className="flex flex-wrap gap-5 pt-3 text-sm text-slate-600">
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Garansi service</span>
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Teknisi berpengalaman</span>
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Estimasi transparan</span>
            </div>
          </div>
          <div className="relative animate-fade-in">
            <div className="absolute -inset-6 bg-gradient-to-tr from-blue-500/20 via-cyan-400/10 to-transparent rounded-[2rem] blur-2xl" aria-hidden />
            <div className="relative aspect-square rounded-3xl bg-gradient-to-br from-blue-100 via-white to-cyan-50 border border-blue-100 flex items-center justify-center overflow-hidden shadow-2xl shadow-blue-500/10 ring-1 ring-white/60">
              <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgb(59 130 246) 1px, transparent 0)", backgroundSize: "20px 20px" }} />
              <img src={shop.logo || ck123Logo} alt={`${shop.name} logo`} className="relative w-4/5 h-4/5 object-contain drop-shadow-2xl" />
              <div className="absolute top-6 left-6 bg-white/95 backdrop-blur rounded-2xl p-3 shadow-xl flex items-center gap-2.5 border border-slate-100 animate-fade-in">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md shadow-blue-500/30"><Clock className="w-4 h-4 text-white" /></div>
                <div><p className="text-[10px] text-slate-500 font-medium">Estimasi</p><p className="text-sm font-bold">≈ 30 menit</p></div>
              </div>
              <div className="absolute bottom-6 right-6 bg-white/95 backdrop-blur rounded-2xl p-3 shadow-xl flex items-center gap-2.5 border border-slate-100 animate-fade-in">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md shadow-blue-500/30"><Sparkles className="w-4 h-4 text-white" /></div>
                <div><p className="text-[10px] text-slate-500 font-medium">Bergaransi</p><p className="text-sm font-bold">100% aman</p></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stat bar */}
      <section className="px-4 lg:px-8 -mt-10 mb-4 relative z-10">
        <div className="max-w-6xl mx-auto bg-white/95 backdrop-blur-xl rounded-2xl border border-slate-200 shadow-xl shadow-blue-900/5 grid grid-cols-2 md:grid-cols-4 divide-x divide-slate-100">
          {STATS.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="group flex items-center gap-3 px-4 py-5 hover:bg-blue-50/40 transition-colors first:rounded-l-2xl last:rounded-r-2xl">
                <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md shadow-blue-500/30 flex-shrink-0 group-hover:scale-105 transition-transform">
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/25 to-transparent" />
                  <Icon className="relative w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-base lg:text-lg font-extrabold text-slate-900 leading-tight tracking-tight">{s.value}</p>
                  <p className="text-[11px] text-slate-500 font-medium truncate">{s.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="relative px-4 lg:px-8 py-20 bg-gradient-to-b from-slate-50/80 via-white to-slate-50/40">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold mb-4 ring-1 ring-blue-100"><Sparkles className="w-3 h-3" /> Layanan Kami</span>
            <h2 className="text-3xl lg:text-5xl font-extrabold tracking-tight">Solusi <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-400 bg-clip-text text-transparent">lengkap</span> untuk HP Anda</h2>
            <p className="text-slate-600 mt-3 max-w-xl mx-auto">Dari ganti LCD hingga flash software — semua kami tangani dengan standar profesional.</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {SERVICES.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.title} className="group relative bg-white rounded-2xl p-6 border border-slate-200 hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1 transition-all overflow-hidden">
                  <div aria-hidden className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br from-blue-100 to-cyan-50 opacity-0 group-hover:opacity-100 blur-2xl transition-opacity" />
                  <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30 ring-4 ring-blue-50 group-hover:scale-110 group-hover:rotate-3 transition-transform">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="relative font-bold text-slate-900 mb-1.5">{s.title}</h3>
                  <p className="relative text-sm text-slate-500 leading-relaxed">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-4 lg:px-8 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-semibold mb-4 ring-1 ring-emerald-100"><ShieldCheck className="w-3 h-3" /> Kenapa Pilih Kami</span>
            <h2 className="text-3xl lg:text-5xl font-extrabold tracking-tight">Layanan yang bisa Anda <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">andalkan</span></h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="group relative bg-gradient-to-b from-white to-slate-50/50 rounded-2xl p-7 border border-slate-200 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1 transition-all overflow-hidden">
                  <div aria-hidden className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-5 shadow-lg shadow-blue-500/30 ring-4 ring-blue-50 group-hover:scale-105 transition-transform">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2 text-lg">{f.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>


      <ReviewsSection />

      <section className="px-4 lg:px-8 py-20">
        <div className="max-w-6xl mx-auto rounded-[2rem] bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-500 p-10 lg:p-16 text-center text-white relative overflow-hidden shadow-2xl shadow-blue-600/30">
          <div aria-hidden className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
          <div aria-hidden className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-cyan-300/20 blur-3xl" />
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "24px 24px" }} />
          <div className="relative">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur text-white text-xs font-semibold mb-4 ring-1 ring-white/30"><Sparkles className="w-3 h-3" /> Tracking realtime</span>
            <h2 className="text-3xl lg:text-5xl font-extrabold tracking-tight mb-3">Sudah service di kami?</h2>
            <p className="text-white/90 max-w-xl mx-auto mb-8 text-base lg:text-lg">Cek status perbaikan HP Anda dengan kode service & nomor HP yang terdaftar.</p>
            <button onClick={() => setCheckOpen(true)} className="group inline-flex items-center gap-2 px-7 py-4 rounded-xl bg-white text-blue-700 font-bold shadow-xl hover:shadow-2xl hover:-translate-y-0.5 active:scale-[0.97] transition-all">
              <Search className="w-5 h-5" /> Cek Status Sekarang <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      <footer className="px-4 lg:px-8 py-10 border-t border-slate-200">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden p-1">
                <img src={shop.logo || ck123Logo} alt={`${shop.name} logo`} className="w-full h-full object-contain" />
              </div>
              <div>
                <p className="text-sm font-extrabold">{shop.name}</p>
                <p className="text-[10px] text-blue-600 font-bold tracking-wider">SERVICE HP · KONTER</p>
              </div>
            </div>
          </div>
          <div>
            <p className="text-sm font-bold mb-3">Kontak</p>
            <a href={`tel:${shop.phone}`} className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 mb-2"><Phone className="w-4 h-4 text-blue-500" /> {shop.phone}</a>
            <p className="flex items-start gap-2 text-sm text-slate-600 mb-3"><MapPin className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" /> {shop.address}</p>
            <a href={mapsLink} target="_blank" rel="noopener" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"><MapPin className="w-3.5 h-3.5" /> Buka di Google Maps</a>
          </div>
          <div>
            <p className="text-sm font-bold mb-3">Tautan</p>
            <button onClick={() => setCheckOpen(true)} className="block text-sm text-slate-600 hover:text-blue-600 mb-2">Cek Status Service</button>
            <Link to="/login" className="block text-sm text-slate-600 hover:text-blue-600">Login Admin</Link>
          </div>
        </div>
        <p className="text-center text-xs text-slate-400 mt-8">© {new Date().getFullYear()} {shop.name}. All rights reserved.</p>
      </footer>

      <a
        href={waLink(`Halo ${shop.name}, saya ingin bertanya.`)}
        target="_blank"
        rel="noopener"
        className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 px-4 py-3 rounded-full bg-emerald-500 text-white font-bold shadow-2xl shadow-emerald-500/40 hover:bg-emerald-600 active:scale-95 transition-all"
      >
        <MessageCircle className="w-5 h-5" /> Chat WhatsApp
      </a>

      {checkOpen && <CheckStatusModal onClose={() => setCheckOpen(false)} />}
      {bookingOpen && <BookingModal onClose={() => setBookingOpen(false)} waLink={waLink} shopName={shop.name} />}
    </div>
  );
};

const CheckStatusModal = ({ onClose }: { onClose: () => void }) => {
  const [invoice, setInvoice] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[] | null>(null);

  const handleCheck = async () => {
    const inv = invoice.trim();
    const ph = phone.trim();
    if (!inv && !ph) {
      toast.error("Isi salah satu: kode service atau nomor HP");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc("lookup_service_status", {
        _invoice: inv, _phone: ph,
      });
      if (error) throw error;
      setResults(data || []);
    } catch (err: any) {
      toast.error(err.message || "Gagal memeriksa status");
    } finally {
      setLoading(false);
    }
  };

  const statusLabel = (s: string) => ({
    antrian: "Antrian", masuk: "Antrian", proses: "Sedang Diproses",
    selesai: "Selesai", diambil: "Sudah Diambil", batal: "Dibatalkan",
  }[s] || s);

  const statusColor = (s: string) => ({
    antrian: "bg-amber-50 text-amber-700 border-amber-200",
    masuk: "bg-amber-50 text-amber-700 border-amber-200",
    proses: "bg-blue-50 text-blue-700 border-blue-200",
    selesai: "bg-emerald-50 text-emerald-700 border-emerald-200",
    diambil: "bg-slate-100 text-slate-700 border-slate-200",
    batal: "bg-rose-50 text-rose-700 border-rose-200",
  }[s] || "bg-slate-50 text-slate-700 border-slate-200");

  return (
    <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2"><Search className="w-5 h-5 text-blue-600" /><h3 className="font-bold text-slate-900">Cek Status Service</h3></div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100"><X className="w-4 h-4 text-slate-500" /></button>
        </div>
        <div className="p-5 space-y-4 overflow-y-auto">
          {!results && (<>
            <p className="text-xs text-slate-600 bg-blue-50 border border-blue-100 p-3 rounded-xl">
              💡 Cukup isi <b>salah satu</b>: kode service ATAU nomor HP Anda.
            </p>
            <div>
              <label className="text-xs font-bold text-slate-600 mb-1.5 block">Kode Service / Invoice (opsional)</label>
              <input value={invoice} onChange={(e) => setInvoice(e.target.value)} placeholder="SRV-180426-001" maxLength={50} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 mb-1.5 block">No. HP Pelanggan (opsional)</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="08123xxxxx" maxLength={20} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none" />
            </div>
            <button onClick={handleCheck} disabled={loading} className="w-full py-3 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white font-bold flex items-center justify-center gap-2 disabled:opacity-50">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />} Cek Sekarang
            </button>
          </>)}
          {results && results.length === 0 && (
            <div className="text-center py-6">
              <p className="text-sm text-rose-600 bg-rose-50 p-3 rounded-xl mb-3">Data tidak ditemukan. Pastikan kode atau nomor HP sesuai.</p>
              <button onClick={() => setResults(null)} className="px-4 py-2 rounded-xl bg-slate-100 text-sm font-semibold">Coba Lagi</button>
            </div>
          )}
          {results && results.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500">Ditemukan {results.length} servis:</p>
              {results.map((r) => (
                <div key={r.invoice} className="border border-slate-200 rounded-xl p-4 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[10px] text-slate-500 font-bold">INVOICE</p>
                      <p className="text-sm font-extrabold text-slate-900">{r.invoice}</p>
                    </div>
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${statusColor(r.status)}`}>{statusLabel(r.status)}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <Field label="Pelanggan" value={r.customer_name} />
                    <Field label="Perangkat" value={`${r.device_brand}${r.device_model ? " " + r.device_model : ""}`} />
                    <Field label="Total Biaya" value={`Rp ${Number(r.total_cost).toLocaleString("id-ID")}`} />
                    <Field label="DP" value={`Rp ${Number(r.dp_amount).toLocaleString("id-ID")}`} />
                  </div>
                </div>
              ))}
              <button onClick={() => { setResults(null); setInvoice(""); setPhone(""); }} className="w-full py-2.5 rounded-xl border border-slate-200 text-sm font-semibold">Cek Lainnya</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Field = ({ label, value }: { label: string; value: string }) => (
  <div className="bg-slate-50 rounded-lg p-2.5"><p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{label}</p><p className="text-sm font-semibold text-slate-800 mt-0.5">{value}</p></div>
);

const BookingModal = ({ onClose, waLink, shopName }: { onClose: () => void; waLink: (m: string) => string; shopName: string }) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [device, setDevice] = useState("");
  const [model, setModel] = useState("");
  const [complaint, setComplaint] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<{ invoice: string } | null>(null);

  const generateInvoice = () => {
    const d = new Date();
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yy = String(d.getFullYear()).slice(-2);
    const rnd = Math.floor(100 + Math.random() * 900);
    return `SRV-${dd}${mm}${yy}-${rnd}`;
  };

  const handleSubmit = async () => {
    // Client-side validation
    const n = name.trim(); const p = phone.trim(); const dv = device.trim(); const c = complaint.trim();
    if (n.length < 2 || n.length > 100) return toast.error("Nama 2-100 karakter");
    if (!/^[0-9+\-\s]{6,20}$/.test(p)) return toast.error("Nomor HP tidak valid");
    if (dv.length < 1 || dv.length > 100) return toast.error("Isi merk HP");
    if (c.length < 3 || c.length > 500) return toast.error("Keluhan 3-500 karakter");

    setLoading(true);
    try {
      const invoice = generateInvoice();
      const { error } = await supabase.from("services").insert({
        invoice,
        customer_name: n,
        phone: p,
        device_brand: dv,
        device_model: model.trim() || null,
        complaint: c,
        status: "antrian",
        total_cost: 0,
        dp_amount: 0,
        user_id: null,
      });
      if (error) throw error;
      setSuccess({ invoice });
      toast.success("Booking berhasil dibuat!");
    } catch (err: any) {
      toast.error(err.message || "Gagal membuat booking");
    } finally {
      setLoading(false);
    }
  };

  const sendWa = () => {
    if (!success) return;
    const msg = `Halo ${shopName}, saya baru saja booking service:\n\nKode: ${success.invoice}\nNama: ${name}\nNo HP: ${phone}\nPerangkat: ${device}${model ? " " + model : ""}\nKeluhan: ${complaint}\n\nMohon konfirmasinya. Terima kasih.`;
    window.open(waLink(msg), "_blank");
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2"><CalendarCheck className="w-5 h-5 text-blue-600" /><h3 className="font-bold text-slate-900">Booking Antrian Online</h3></div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100"><X className="w-4 h-4 text-slate-500" /></button>
        </div>
        <div className="p-5 space-y-3 overflow-y-auto">
          {!success && (<>
            <Input label="Nama Lengkap" value={name} onChange={setName} placeholder="Nama Anda" maxLength={100} />
            <Input label="No. WhatsApp" value={phone} onChange={setPhone} placeholder="08xxxxxxxxxx" type="tel" maxLength={20} />
            <Input label="Merk HP" value={device} onChange={setDevice} placeholder="iPhone, Samsung, Xiaomi..." maxLength={100} />
            <Input label="Tipe (opsional)" value={model} onChange={setModel} placeholder="12 Pro, A52, Note 11..." maxLength={100} />
            <div>
              <label className="text-xs font-bold text-slate-600 mb-1.5 block">Keluhan</label>
              <textarea value={complaint} onChange={(e) => setComplaint(e.target.value)} rows={3} maxLength={500} placeholder="Jelaskan keluhan HP Anda" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none resize-none" />
              <p className="text-[10px] text-slate-400 mt-1 text-right">{complaint.length}/500</p>
            </div>
            <button onClick={handleSubmit} disabled={loading} className="w-full py-3 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white font-bold flex items-center justify-center gap-2 mt-2 disabled:opacity-50">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <CalendarCheck className="w-4 h-4" /> Kirim Booking
            </button>
            <p className="text-[11px] text-slate-500 text-center">Anda akan mendapat kode tracking untuk cek status servis kapan saja.</p>
          </>)}
          {success && (
            <div className="space-y-4 py-2">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-9 h-9 text-emerald-500" />
                </div>
                <h3 className="text-lg font-extrabold text-slate-900">Booking Berhasil!</h3>
                <p className="text-sm text-slate-600 mt-1">Simpan kode tracking di bawah ini:</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-dashed border-blue-300 rounded-2xl p-5 text-center">
                <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-1">Kode Tracking</p>
                <p className="text-2xl font-black text-blue-700 tracking-tight">{success.invoice}</p>
              </div>
              <p className="text-xs text-slate-600 bg-amber-50 border border-amber-100 p-3 rounded-xl">
                💡 Gunakan kode ini atau nomor HP Anda untuk cek status di tombol <b>Cek Status</b>.
              </p>
              <button onClick={sendWa} className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold flex items-center justify-center gap-2">
                <MessageCircle className="w-4 h-4" /> Konfirmasi via WhatsApp
              </button>
              <button onClick={onClose} className="w-full py-2.5 rounded-xl border border-slate-200 text-sm font-semibold">Tutup</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Input = ({ label, value, onChange, placeholder, type = "text", maxLength }: any) => (
  <div>
    <label className="text-xs font-bold text-slate-600 mb-1.5 block">{label}</label>
    <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} maxLength={maxLength} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none" />
  </div>
);

export default Beranda;
