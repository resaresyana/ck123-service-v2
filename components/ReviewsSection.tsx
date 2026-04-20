import { useMemo, useState } from "react";
import { Star, ThumbsUp, Search, BadgeCheck, ChevronDown } from "lucide-react";
import { getDummyReviews, getReviewStats, formatRelativeDays } from "@/lib/dummyReviews";

const DUMMY_REVIEWS = getDummyReviews();
const REVIEW_STATS = getReviewStats();

const PAGE_SIZE = 12;

const ReviewsSection = () => {
  const [filter, setFilter] = useState<"all" | 5 | 4 | 3>("all");
  const [search, setSearch] = useState("");
  const [visible, setVisible] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return DUMMY_REVIEWS.filter((r) => {
      if (filter !== "all" && r.stars !== filter) return false;
      if (!q) return true;
      return (
        r.name.toLowerCase().includes(q) ||
        r.device.toLowerCase().includes(q) ||
        r.service.toLowerCase().includes(q) ||
        r.text.toLowerCase().includes(q)
      );
    });
  }, [filter, search]);

  const shown = filtered.slice(0, visible);

  return (
    <section className="px-4 lg:px-8 py-16 bg-slate-50/60">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold mb-4">
            <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> Ulasan Pelanggan
          </span>
          <h2 className="text-3xl lg:text-5xl font-extrabold tracking-tight">
            Dipercaya{" "}
            <span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
              ratusan pelanggan
            </span>
          </h2>
          <p className="text-slate-600 mt-3 max-w-2xl mx-auto">
            Ulasan asli dari pelanggan yang sudah merasakan layanan service HP kami.
          </p>
        </div>

        {/* Rating summary */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 lg:p-8 mb-8 shadow-sm">
          <div className="grid md:grid-cols-[280px_1fr] gap-8 items-center">
            {/* Score */}
            <div className="text-center md:border-r md:border-slate-200 md:pr-8">
              <div className="text-6xl font-black text-slate-900 mb-2">
                {REVIEW_STATS.average}
              </div>
              <div className="flex justify-center mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.round(REVIEW_STATS.average)
                        ? "fill-amber-400 text-amber-400"
                        : "text-slate-300"
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-slate-600">
                Berdasarkan{" "}
                <span className="font-bold">
                  {REVIEW_STATS.total.toLocaleString("id-ID")}
                </span>{" "}
                ulasan
              </p>
              <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">
                <BadgeCheck className="w-3.5 h-3.5" /> Terverifikasi
              </div>
            </div>

            {/* Breakdown */}
            <div className="space-y-2">
              {REVIEW_STATS.breakdown.map((b) => (
                <button
                  key={b.stars}
                  onClick={() =>
                    setFilter((prev) => (prev === b.stars ? "all" : (b.stars as any)))
                  }
                  className="w-full flex items-center gap-3 group"
                >
                  <span className="text-xs font-semibold text-slate-600 w-12 flex items-center gap-0.5">
                    {b.stars}{" "}
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  </span>
                  <div className="flex-1 h-2.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        filter === b.stars
                          ? "bg-gradient-to-r from-blue-500 to-cyan-500"
                          : "bg-amber-400 group-hover:bg-amber-500"
                      }`}
                      style={{ width: `${b.percent}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-slate-500 w-16 text-right">
                    {b.count.toLocaleString("id-ID")}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Filter & search */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setVisible(PAGE_SIZE);
              }}
              placeholder="Cari ulasan (nama, perangkat, layanan)..."
              className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-white border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto scrollbar-none">
            {[
              { v: "all" as const, label: "Semua" },
              { v: 5 as const, label: "5 Bintang" },
              { v: 4 as const, label: "4 Bintang" },
              { v: 3 as const, label: "3 Bintang" },
            ].map((t) => (
              <button
                key={t.v}
                onClick={() => {
                  setFilter(t.v);
                  setVisible(PAGE_SIZE);
                }}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  filter === t.v
                    ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-md shadow-blue-600/30"
                    : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Reviews grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
            <p className="text-sm text-slate-500">Tidak ada ulasan yang cocok.</p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {shown.map((r) => (
                <article
                  key={r.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200 hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col"
                >
                  <header className="flex items-center gap-3 mb-3">
                    <div
                      className={`w-11 h-11 rounded-full bg-gradient-to-br ${r.avatarColor} text-white text-sm font-bold flex items-center justify-center flex-shrink-0 shadow-sm`}
                    >
                      {r.initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-slate-900 flex items-center gap-1 truncate">
                        {r.name}
                        {r.verified && (
                          <BadgeCheck className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                        )}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {formatRelativeDays(r.daysAgo)}
                      </p>
                    </div>
                  </header>

                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < r.stars
                              ? "fill-amber-400 text-amber-400"
                              : "text-slate-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                      {r.service}
                    </span>
                  </div>

                  <p className="text-sm text-slate-700 leading-relaxed flex-1 mb-3">
                    "{r.text}"
                  </p>

                  <footer className="flex items-center justify-between pt-3 border-t border-slate-100 text-[11px]">
                    <span className="inline-flex items-center gap-1 text-slate-500">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                      {r.device}
                    </span>
                    <span className="inline-flex items-center gap-1 text-slate-400">
                      <ThumbsUp className="w-3 h-3" />{" "}
                      {Math.floor((r.id.charCodeAt(2) || 7) % 18) + 2}
                    </span>
                  </footer>
                </article>
              ))}
            </div>

            {visible < filtered.length && (
              <div className="text-center mt-8">
                <button
                  onClick={() => setVisible((v) => v + PAGE_SIZE)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-slate-200 text-sm font-bold text-slate-700 hover:border-blue-300 hover:text-blue-700 hover:shadow-md transition-all"
                >
                  Tampilkan lebih banyak
                  <ChevronDown className="w-4 h-4" />
                  <span className="text-xs text-slate-400 font-medium">
                    ({filtered.length - visible} lagi)
                  </span>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default ReviewsSection;
