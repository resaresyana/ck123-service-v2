import { useState } from "react";
import { ArrowLeft, Save, Plus, Trash2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface TaxDiscount {
  id: string;
  name: string;
  type: "pajak" | "diskon";
  value: number;
  isPercent: boolean;
  active: boolean;
}

const STORAGE_KEY = "ck123_tax_discount";

const getItems = (): TaxDiscount[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return [
    { id: "1", name: "PPN", type: "pajak", value: 11, isPercent: true, active: false },
  ];
};

const saveItems = (items: TaxDiscount[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

const PajakDiskon = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<TaxDiscount[]>(getItems);
  const [showForm, setShowForm] = useState(false);

  // Form
  const [name, setName] = useState("");
  const [type, setType] = useState<"pajak" | "diskon">("pajak");
  const [value, setValue] = useState(0);
  const [isPercent, setIsPercent] = useState(true);

  const handleAdd = () => {
    if (!name.trim()) {
      toast.error("Nama harus diisi");
      return;
    }
    if (value <= 0) {
      toast.error("Nilai harus lebih dari 0");
      return;
    }
    const updated = [
      ...items,
      { id: crypto.randomUUID(), name: name.trim(), type, value, isPercent, active: true },
    ];
    saveItems(updated);
    setItems(updated);
    setName("");
    setValue(0);
    setShowForm(false);
    toast.success(`${type === "pajak" ? "Pajak" : "Diskon"} berhasil ditambahkan`);
  };

  const handleToggle = (id: string) => {
    const updated = items.map((i) => (i.id === id ? { ...i, active: !i.active } : i));
    saveItems(updated);
    setItems(updated);
  };

  const handleDelete = (id: string) => {
    const updated = items.filter((i) => i.id !== id);
    saveItems(updated);
    setItems(updated);
    toast.success("Berhasil dihapus");
  };

  const pajakItems = items.filter((i) => i.type === "pajak");
  const diskonItems = items.filter((i) => i.type === "diskon");

  const renderList = (list: TaxDiscount[], title: string) => (
    <div>
      <p className="section-title">{title}</p>
      {list.length === 0 ? (
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-sm text-muted-foreground">Belum ada {title.toLowerCase()}</p>
        </div>
      ) : (
        <div className="glass-card rounded-xl overflow-hidden">
          {list.map((item, i) => (
            <div
              key={item.id}
              className={`flex items-center gap-3 p-4 ${i < list.length - 1 ? "border-b border-border/50" : ""}`}
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{item.name}</p>
                <p className="text-[11px] text-muted-foreground">
                  {item.isPercent ? `${item.value}%` : `IDR ${item.value.toLocaleString("id-ID")}`}
                </p>
              </div>
              <button
                onClick={() => handleToggle(item.id)}
                className={`w-12 h-7 rounded-full transition-all relative ${item.active ? "gradient-primary" : "bg-secondary"}`}
              >
                <div className={`w-5 h-5 rounded-full bg-card shadow-md absolute top-1 transition-all ${item.active ? "right-1" : "left-1"}`} />
              </button>
              <button onClick={() => handleDelete(item.id)} className="p-1.5 text-destructive">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate("/pengaturan")} className="p-2 rounded-xl bg-card border border-border/50">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-xl font-bold text-foreground">Pajak & Diskon</h1>
        </div>
      </div>

      <div className="px-4 space-y-5">
        {renderList(pajakItems, "Pajak")}
        {renderList(diskonItems, "Diskon")}

        {/* Add Form */}
        {showForm ? (
          <div className="glass-card rounded-xl p-4 space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">Tambah Baru</p>
              <button onClick={() => setShowForm(false)} className="p-1">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* Type */}
            <div className="grid grid-cols-2 gap-2">
              {(["pajak", "diskon"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`py-2.5 rounded-xl text-xs font-medium transition-all ${
                    type === t
                      ? "gradient-primary text-primary-foreground shadow-md shadow-primary/20"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  {t === "pajak" ? "Pajak" : "Diskon"}
                </button>
              ))}
            </div>

            <input type="text" placeholder="Nama (contoh: PPN, Diskon Member)" value={name} onChange={(e) => setName(e.target.value)} className="input-field" />

            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Nilai"
                value={value || ""}
                onChange={(e) => setValue(Number(e.target.value))}
                className="input-field flex-1"
              />
              <div className="grid grid-cols-2 gap-1">
                <button
                  onClick={() => setIsPercent(true)}
                  className={`px-3 rounded-xl text-xs font-medium transition-all ${
                    isPercent ? "gradient-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  %
                </button>
                <button
                  onClick={() => setIsPercent(false)}
                  className={`px-3 rounded-xl text-xs font-medium transition-all ${
                    !isPercent ? "gradient-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  IDR
                </button>
              </div>
            </div>

            <button
              onClick={handleAdd}
              className="w-full py-3 rounded-xl gradient-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/25 active:scale-[0.98] transition-transform"
            >
              <Plus className="w-4 h-4" /> Tambah
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowForm(true)}
            className="w-full py-3 rounded-xl border-2 border-dashed border-border text-muted-foreground text-sm font-medium flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
          >
            <Plus className="w-4 h-4" /> Tambah Pajak / Diskon
          </button>
        )}
      </div>
    </div>
  );
};

export default PajakDiskon;
