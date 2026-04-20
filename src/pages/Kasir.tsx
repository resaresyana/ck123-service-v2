import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Minus, ShoppingCart, Trash2, Receipt, X, Save, PackagePlus, FileText, Printer, ArrowLeft, CheckCircle, History, MoreVertical } from "lucide-react";
import { getProducts, addProduct, deleteProduct, Product } from "@/lib/productStore";
import { toast } from "sonner";
import { generateKasirNotaPDF } from "@/lib/generateKasirNota";
import { saveTransaction } from "@/lib/transactionStore";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface CartItem extends Product {
  qty: number;
}

type KasirView = "shop" | "rincian" | "done";

const Kasir = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
    staleTime: 60_000,
  });
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const [manualName, setManualName] = useState("");
  const [manualPrice, setManualPrice] = useState("");
  const [manualQty, setManualQty] = useState("1");
  const [newProdName, setNewProdName] = useState("");
  const [newProdBuyPrice, setNewProdBuyPrice] = useState("");
  const [newProdPrice, setNewProdPrice] = useState("");
  const [newProdCategory, setNewProdCategory] = useState("");
  const [newProdStock, setNewProdStock] = useState("10");
  const [view, setView] = useState<KasirView>("shop");
  const [bayar, setBayar] = useState("");
  const [lastInvoice, setLastInvoice] = useState("");

  const categories = useMemo(() => ["Semua", ...Array.from(new Set(products.map((p) => p.category)))], [products]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return products.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(q);
      const matchCat = activeCategory === "Semua" || p.category === activeCategory;
      return matchSearch && matchCat;
    });
  }, [products, search, activeCategory]);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === product.id);
      if (existing) {
        return prev.map((c) => (c.id === product.id ? { ...c, qty: c.qty + 1 } : c));
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const addManualProduct = () => {
    if (!manualName.trim()) { toast.error("Nama produk harus diisi"); return; }
    const price = Number(manualPrice);
    if (!price || price <= 0) { toast.error("Harga harus lebih dari 0"); return; }
    const qty = Number(manualQty) || 1;
    const manualProduct: CartItem = {
      id: `manual-${Date.now()}`, name: manualName.trim(), category: "Manual",
      buyPrice: 0, price, stock: 999, minStock: 0, qty,
    };
    setCart((prev) => [...prev, manualProduct]);
    setManualName(""); setManualPrice(""); setManualQty("1");
    setShowAddModal(false);
    toast.success(`${manualProduct.name} ditambahkan ke keranjang`);
  };

  const handleAddProduct = async () => {
    if (!newProdName.trim()) { toast.error("Nama produk harus diisi"); return; }
    const buyPrice = Number(newProdBuyPrice);
    const price = Number(newProdPrice);
    if (!buyPrice || buyPrice <= 0) { toast.error("Harga beli harus lebih dari 0"); return; }
    if (!price || price <= 0) { toast.error("Harga jual harus lebih dari 0"); return; }
    try {
      await addProduct({
        name: newProdName.trim(),
        category: newProdCategory.trim() || "Umum",
        buyPrice,
        price,
        stock: Number(newProdStock) || 10,
        minStock: 0,
      });
      const updated = await getProducts();
      queryClient.setQueryData(["products"], updated);
      setNewProdName(""); setNewProdBuyPrice(""); setNewProdPrice(""); setNewProdCategory(""); setNewProdStock("10");
      setShowAddProductModal(false);
      toast.success("Produk berhasil ditambahkan!");
    } catch (err: any) {
      toast.error(err.message || "Gagal menambahkan produk");
    }
  };

  const handleDeleteProduct = async () => {
    if (!deleteProductId) return;
    try {
      await deleteProduct(deleteProductId);
      queryClient.setQueryData<Product[]>(["products"], (prev = []) => prev.filter((p) => p.id !== deleteProductId));
      setCart((prev) => prev.filter((c) => c.id !== deleteProductId));
      setDeleteProductId(null);
      toast.success("Produk berhasil dihapus");
    } catch (err: any) {
      toast.error(err.message || "Gagal menghapus produk");
    }
  };

  const updateQty = (id: string, delta: number) => {
    setCart((prev) => prev.map((c) => (c.id === id ? { ...c, qty: c.qty + delta } : c)).filter((c) => c.qty > 0));
  };

  const cartTotal = cart.reduce((sum, c) => sum + c.price * c.qty, 0);
  const cartCount = cart.reduce((sum, c) => sum + c.qty, 0);
  const bayarAmount = Number(bayar) || 0;
  const kembalian = bayarAmount - cartTotal;

  const generateInvoice = () => {
    const now = new Date();
    const d = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
    const r = String(Math.floor(Math.random() * 999) + 1).padStart(3, "0");
    return `POS-${d}-${r}`;
  };

  const handleConfirmPayment = async () => {
    if (bayarAmount < cartTotal) {
      toast.error("Jumlah bayar kurang!");
      return;
    }
    const inv = generateInvoice();
    setLastInvoice(inv);

    try {
      await saveTransaction({
        invoice: inv,
        items: cart.map((c) => ({ name: c.name, price: c.price, qty: c.qty, category: c.category })),
        total: cartTotal,
        bayar: bayarAmount,
        kembalian: bayarAmount - cartTotal,
      });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      setView("done");
      toast.success("Transaksi berhasil!");
    } catch (err: any) {
      toast.error(err.message || "Gagal menyimpan transaksi");
    }
  };

  const handleCetakNota = (format: "thermal58" | "thermal80") => {
    generateKasirNotaPDF(cart, cartTotal, bayarAmount, lastInvoice, format);
    toast.success(`Nota ${format === "thermal58" ? "58mm" : "80mm"} berhasil dicetak!`);
  };

  const handleNewTransaction = () => {
    setCart([]);
    setBayar("");
    setLastInvoice("");
    setView("shop");
  };

  // ==================== RINCIAN VIEW ====================
  if (view === "rincian") {
    return (
      <div className="page-container">
        <div className="page-header">
          <div className="flex items-center gap-3">
            <button onClick={() => setView("shop")} className="p-2 rounded-xl glass-card-elevated active:scale-95 transition-transform">
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <h1 className="text-xl font-extrabold text-foreground tracking-tight">Rincian Pembayaran</h1>
          </div>
        </div>

        <div className="px-4 space-y-4 pb-8">
          {/* Item List */}
          <div className="glass-card-elevated rounded-2xl p-4">
            <p className="text-sm font-bold text-foreground mb-3">Detail Pesanan</p>
            <div className="space-y-2">
              {cart.map((item, i) => (
                <div key={item.id} className="flex items-start justify-between py-2 border-b border-border/30 last:border-0">
                  <div className="flex gap-2 flex-1 min-w-0">
                    <span className="text-xs text-muted-foreground mt-0.5 w-5">{i + 1}.</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{item.name}</p>
                      <p className="text-[10px] text-muted-foreground">{item.qty} x IDR {item.price.toLocaleString("id-ID")}</p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-foreground flex-shrink-0">
                    IDR {(item.price * item.qty).toLocaleString("id-ID")}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="glass-card-elevated rounded-2xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal ({cartCount} item)</span>
              <span className="text-foreground font-medium">IDR {cartTotal.toLocaleString("id-ID")}</span>
            </div>
            <div className="border-t border-border/50 pt-2 flex justify-between">
              <span className="text-sm font-bold text-foreground">TOTAL</span>
              <span className="text-lg font-bold text-primary">IDR {cartTotal.toLocaleString("id-ID")}</span>
            </div>
          </div>

          {/* Bayar Input */}
          <div className="glass-card-elevated rounded-2xl p-4 space-y-3">
            <label className="text-xs font-medium text-muted-foreground">Jumlah Bayar (Rp)</label>
            <input
              type="number"
              placeholder="0"
              value={bayar}
              onChange={(e) => setBayar(e.target.value)}
              className="input-field text-lg font-bold"
              autoFocus
            />

            {/* Quick amount buttons */}
            <div className="flex gap-2 flex-wrap">
              {[cartTotal, Math.ceil(cartTotal / 10000) * 10000, Math.ceil(cartTotal / 50000) * 50000, Math.ceil(cartTotal / 100000) * 100000]
                .filter((v, i, arr) => arr.indexOf(v) === i && v >= cartTotal)
                .slice(0, 4)
                .map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setBayar(String(amount))}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      bayarAmount === amount
                        ? "gradient-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    {amount >= 1000000 ? `${(amount / 1000000).toFixed(1)}JT` : `${(amount / 1000).toFixed(0)}K`}
                  </button>
                ))}
            </div>

            {bayarAmount >= cartTotal && (
              <div className="flex justify-between items-center pt-2 border-t border-border/50 animate-fade-in">
                <span className="text-sm text-muted-foreground">Kembalian</span>
                <span className="text-lg font-bold text-success">IDR {kembalian.toLocaleString("id-ID")}</span>
              </div>
            )}
          </div>

          {/* Confirm Button */}
          <button
            onClick={handleConfirmPayment}
            disabled={bayarAmount < cartTotal}
            className="w-full py-3.5 rounded-xl gradient-accent text-accent-foreground font-bold text-sm flex items-center justify-center gap-2 shadow-[0_8px_24px_-4px_hsl(var(--accent)/0.4)] active:scale-[0.97] transition-transform disabled:opacity-40 disabled:pointer-events-none"
          >
            <CheckCircle className="w-4 h-4" />
            Konfirmasi Pembayaran
          </button>
        </div>
      </div>
    );
  }

  // ==================== DONE VIEW ====================
  if (view === "done") {
    return (
      <div className="page-container">
        <div className="px-4 pt-12 flex flex-col items-center text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-success/10 border-2 border-success/20 flex items-center justify-center animate-fade-in">
            <CheckCircle className="w-10 h-10 text-success" />
          </div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Transaksi Berhasil!</h1>
          <p className="text-sm text-muted-foreground">{lastInvoice}</p>

          <div className="glass-card-elevated rounded-2xl p-4 w-full text-left space-y-2 animate-fade-in">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total</span>
              <span className="font-bold text-foreground">IDR {cartTotal.toLocaleString("id-ID")}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Bayar</span>
              <span className="font-medium text-foreground">IDR {bayarAmount.toLocaleString("id-ID")}</span>
            </div>
            <div className="flex justify-between text-sm border-t border-border/50 pt-2">
              <span className="text-muted-foreground">Kembalian</span>
              <span className="font-bold text-success">IDR {kembalian.toLocaleString("id-ID")}</span>
            </div>
          </div>

          {/* Print buttons */}
          <div className="w-full space-y-3">
            <p className="text-xs font-medium text-muted-foreground">Cetak Nota Thermal</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleCetakNota("thermal58")}
                className="py-3 rounded-xl glass-card-elevated text-sm font-semibold text-foreground flex items-center justify-center gap-2 active:scale-[0.96] transition-transform"
              >
                <Printer className="w-4 h-4 text-primary" /> 58mm
              </button>
              <button
                onClick={() => handleCetakNota("thermal80")}
                className="py-3 rounded-xl glass-card-elevated text-sm font-semibold text-foreground flex items-center justify-center gap-2 active:scale-[0.96] transition-transform"
              >
                <Printer className="w-4 h-4 text-primary" /> 80mm
              </button>
            </div>
          </div>

          <button
            onClick={handleNewTransaction}
            className="w-full py-3.5 rounded-xl gradient-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 shadow-[0_8px_24px_-4px_hsl(var(--primary)/0.4)] active:scale-[0.97] transition-transform"
          >
            <Plus className="w-4 h-4" /> Transaksi Baru
          </button>
        </div>
      </div>
    );
  }

  // ==================== DESKTOP CART SIDEBAR ====================
  const CartPanel = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-border/40">
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-4 h-4 text-primary" />
          <p className="text-sm font-bold text-foreground">Keranjang</p>
        </div>
        <span className="text-xs font-medium text-muted-foreground">{cartCount} item</span>
      </div>

      {cart.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
          <ShoppingCart className="w-10 h-10 text-muted-foreground/20 mb-2" />
          <p className="text-sm text-muted-foreground">Keranjang kosong</p>
          <p className="text-[10px] text-muted-foreground/60">Klik produk untuk menambahkan</p>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {cart.map((item) => (
              <div key={item.id} className="glass-card rounded-xl p-3 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground leading-tight truncate">{item.name}</p>
                    <p className="text-[10px] text-muted-foreground">IDR {item.price.toLocaleString("id-ID")}</p>
                  </div>
                  <p className="text-sm font-bold text-foreground ml-2">
                    {(item.price * item.qty / 1000).toFixed(0)}K
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQty(item.id, -1)} className="p-1 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
                      <Minus className="w-3 h-3 text-secondary-foreground" />
                    </button>
                    <span className="text-xs font-bold text-foreground w-5 text-center">{item.qty}</span>
                    <button onClick={() => updateQty(item.id, 1)} className="p-1 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
                      <Plus className="w-3 h-3 text-secondary-foreground" />
                    </button>
                  </div>
                  <button onClick={() => updateQty(item.id, -item.qty)} className="p-1 rounded-lg hover:bg-destructive/10 transition-colors">
                    <Trash2 className="w-3.5 h-3.5 text-destructive/60" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-border/40 p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-bold text-foreground">IDR {cartTotal.toLocaleString("id-ID")}</span>
            </div>
            <button
              onClick={() => setView("rincian")}
              className="w-full py-3 rounded-xl gradient-accent text-accent-foreground font-bold text-sm flex items-center justify-center gap-2 shadow-[0_8px_24px_-4px_hsl(var(--accent)/0.4)] active:scale-[0.97] transition-transform"
            >
              <Receipt className="w-4 h-4" />
              Bayar IDR {cartTotal.toLocaleString("id-ID")}
            </button>
            <button onClick={() => setCart([])} className="w-full py-2 rounded-xl text-xs font-medium text-destructive hover:bg-destructive/5 transition-colors">
              Kosongkan Keranjang
            </button>
          </div>
        </>
      )}
    </div>
  );

  // ==================== SHOP VIEW (DEFAULT) ====================
  return (
    <div className="page-container">
      <div className="page-header">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-extrabold text-foreground tracking-tight">Kasir</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/kasir/riwayat")}
              className="p-2 rounded-xl glass-card-elevated active:scale-95 transition-transform"
            >
              <History className="w-4 h-4 text-muted-foreground" />
            </button>
            <button
              onClick={() => setShowAddProductModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl gradient-primary text-primary-foreground text-xs font-bold shadow-[0_4px_12px_-2px_hsl(var(--primary)/0.3)] active:scale-95 transition-transform"
            >
              <Plus className="w-3.5 h-3.5" /> Tambah Produk
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl gradient-accent text-accent-foreground text-xs font-bold shadow-[0_4px_12px_-2px_hsl(var(--accent)/0.3)] active:scale-95 transition-transform"
            >
              <PackagePlus className="w-3.5 h-3.5" /> Manual
            </button>
          </div>
        </div>

        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Cari produk..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field !pl-10" />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((c) => (
            <button key={c} onClick={() => setActiveCategory(c)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${activeCategory === c ? "gradient-accent text-accent-foreground shadow-md" : "bg-secondary text-secondary-foreground"}`}
            >{c}</button>
          ))}
        </div>
      </div>

      {/* Desktop: split layout — Products left, Cart right */}
      <div className="lg:flex lg:gap-4 px-4">
        {/* Products */}
        <div className="flex-1">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 mb-4">
            {filtered.map((product) => {
              const inCart = cart.find((c) => c.id === product.id);
              return (
                <div key={product.id} className={`glass-card-elevated rounded-2xl p-3.5 text-left transition-all animate-fade-in relative group ${inCart ? "ring-2 ring-primary/40 bg-primary/3" : ""}`}>
                  <button
                    onClick={() => addToCart(product)}
                    className="w-full text-left active:scale-[0.96] transition-transform"
                  >
                    <p className="text-sm font-medium text-foreground leading-tight mb-1 pr-6">{product.name}</p>
                    <p className="text-[10px] text-muted-foreground mb-2">{product.category} · Stok: {product.stock}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-primary">IDR {(product.price / 1000).toFixed(0)}K</p>
                      {inCart && (
                        <span className="text-[10px] font-bold gradient-primary text-primary-foreground px-2 py-0.5 rounded-full">{inCart.qty}x</span>
                      )}
                    </div>
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setDeleteProductId(product.id); }}
                    className="absolute top-2 right-2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-destructive/10 transition-all"
                    title="Hapus produk"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-destructive/60" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Desktop Cart Sidebar — hidden on mobile */}
        <div className="hidden lg:block w-[340px] flex-shrink-0">
          <div className="sticky top-4 glass-card-elevated rounded-2xl overflow-hidden" style={{ maxHeight: "calc(100vh - 2rem)" }}>
            <CartPanel />
          </div>
        </div>
      </div>

      {/* Mobile Cart Summary — hidden on desktop */}
      {cart.length > 0 && (
        <div className="lg:hidden fixed bottom-20 left-4 right-4 z-40 glass-card-elevated rounded-2xl p-4 animate-slide-up">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-primary" />
              <p className="text-sm font-semibold text-foreground">{cartCount} item</p>
            </div>
            <button onClick={() => setCart([])} className="text-xs text-destructive"><Trash2 className="w-4 h-4" /></button>
          </div>

          <div className="space-y-2 max-h-32 overflow-y-auto mb-3">
            {cart.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-sm">
                <span className="text-foreground truncate flex-1">{item.name}</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateQty(item.id, -1)} className="p-1 rounded-lg bg-secondary"><Minus className="w-3 h-3 text-secondary-foreground" /></button>
                  <span className="text-xs font-bold text-foreground w-5 text-center">{item.qty}</span>
                  <button onClick={() => updateQty(item.id, 1)} className="p-1 rounded-lg bg-secondary"><Plus className="w-3 h-3 text-secondary-foreground" /></button>
                  <span className="text-xs text-muted-foreground w-16 text-right">{(item.price * item.qty / 1000).toFixed(0)}K</span>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setView("rincian")}
            className="w-full py-3 rounded-xl gradient-accent text-accent-foreground font-bold text-sm flex items-center justify-center gap-2 shadow-[0_8px_24px_-4px_hsl(var(--accent)/0.4)] active:scale-[0.97] transition-transform"
          >
            <Receipt className="w-4 h-4" />
            Bayar IDR {cartTotal.toLocaleString("id-ID")}
          </button>
        </div>
      )}

      {/* Add Manual Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center" onClick={() => setShowAddModal(false)}>
          <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" />
          <div className="relative w-full max-w-lg bg-card rounded-t-2xl lg:rounded-2xl p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <PackagePlus className="w-5 h-5 text-accent" />
                <h3 className="text-base font-bold text-foreground">Tambah Produk Manual</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-1.5 rounded-lg bg-secondary"><X className="w-4 h-4 text-secondary-foreground" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Nama Produk / Item *</label>
                <input type="text" placeholder="Contoh: Casing Custom, Jasa Pasang, dll" value={manualName} onChange={(e) => setManualName(e.target.value)} className="input-field" autoFocus />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Harga (Rp) *</label>
                  <input type="number" placeholder="0" value={manualPrice} onChange={(e) => setManualPrice(e.target.value)} className="input-field" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Jumlah</label>
                  <input type="number" placeholder="1" value={manualQty} onChange={(e) => setManualQty(e.target.value)} className="input-field" min="1" />
                </div>
              </div>
              {manualName && Number(manualPrice) > 0 && (
                <div className="glass-card rounded-xl p-3 flex items-center justify-between animate-fade-in">
                  <span className="text-sm text-muted-foreground">Total</span>
                  <span className="text-sm font-bold text-primary">IDR {(Number(manualPrice) * (Number(manualQty) || 1)).toLocaleString("id-ID")}</span>
                </div>
              )}
              <button onClick={addManualProduct} className="w-full py-3.5 rounded-xl gradient-accent text-accent-foreground font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-accent/25 active:scale-[0.98] transition-transform">
                <Save className="w-4 h-4" /> Tambahkan ke Keranjang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Product to Inventory Modal */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center" onClick={() => setShowAddProductModal(false)}>
          <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" />
          <div className="relative w-full max-w-lg bg-card rounded-t-2xl lg:rounded-2xl p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-primary" />
                <h3 className="text-base font-bold text-foreground">Tambah Produk Baru</h3>
              </div>
              <button onClick={() => setShowAddProductModal(false)} className="p-1.5 rounded-lg bg-secondary"><X className="w-4 h-4 text-secondary-foreground" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Nama Produk *</label>
                <input type="text" placeholder="Contoh: Tempered Glass, Charger, dll" value={newProdName} onChange={(e) => setNewProdName(e.target.value)} className="input-field" autoFocus />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Harga Beli (Rp) *</label>
                  <input type="number" placeholder="0" value={newProdBuyPrice} onChange={(e) => setNewProdBuyPrice(e.target.value)} className="input-field" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Harga Jual (Rp) *</label>
                  <input type="number" placeholder="0" value={newProdPrice} onChange={(e) => setNewProdPrice(e.target.value)} className="input-field" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Stok</label>
                  <input type="number" placeholder="10" value={newProdStock} onChange={(e) => setNewProdStock(e.target.value)} className="input-field" min="0" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Kategori</label>
                <input type="text" placeholder="Contoh: Aksesoris, Sparepart, dll" value={newProdCategory} onChange={(e) => setNewProdCategory(e.target.value)} className="input-field" />
              </div>
              <button onClick={handleAddProduct} className="w-full py-3.5 rounded-xl gradient-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/25 active:scale-[0.98] transition-transform">
                <Save className="w-4 h-4" /> Simpan Produk
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Product Confirmation */}
      <AlertDialog open={!!deleteProductId} onOpenChange={() => setDeleteProductId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Produk?</AlertDialogTitle>
            <AlertDialogDescription>
              Produk ini akan dihapus permanen dari daftar. Tindakan ini tidak bisa dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProduct} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Kasir;
