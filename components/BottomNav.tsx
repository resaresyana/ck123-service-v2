import { useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Wrench, ShoppingCart, BarChart3, Settings, Store, Globe, CalendarCheck } from "lucide-react";
import { getCachedShopInfo } from "@/lib/shopStore";
import { prefetchRoute } from "@/lib/routes";

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/booking", label: "Booking", icon: CalendarCheck },
  { path: "/service", label: "Service", icon: Wrench },
  { path: "/kasir", label: "Kasir", icon: ShoppingCart },
  { path: "/laporan", label: "Laporan", icon: BarChart3 },
  { path: "/pengaturan", label: "Setting", icon: Settings },
];

const extraDesktopItems = [
  { path: "/", label: "Beranda Publik", icon: Globe },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const shop = getCachedShopInfo();

  const showNav = navItems.some((item) => item.path === location.pathname);
  if (!showNav && !location.pathname.startsWith("/login")) return null;
  if (location.pathname === "/login" || location.pathname === "/" || location.pathname === "/beranda") return null;

  return (
    <>
      {/* Desktop Sidebar — hidden on mobile */}
      <aside className="hidden lg:flex fixed top-0 left-0 bottom-0 w-[220px] z-50 flex-col bg-card border-r border-border/40">
        {/* Brand */}
        <div className="px-5 py-5 border-b border-border/30">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-md">
              <Store className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-sm font-extrabold text-foreground tracking-tight leading-tight truncate max-w-[140px]">{shop.name || "POS"}</h1>
              <p className="text-[10px] text-muted-foreground font-medium">Smart Service System</p>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                onMouseEnter={() => prefetchRoute(item.path)}
                onFocus={() => prefetchRoute(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? "gradient-primary text-primary-foreground shadow-md shadow-primary/25"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <Icon className="w-[18px] h-[18px]" strokeWidth={isActive ? 2.2 : 1.8} />
                {item.label}
              </button>
            );
          })}
          <div className="pt-3 mt-3 border-t border-border/30">
            {extraDesktopItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  onMouseEnter={() => prefetchRoute(item.path)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-accent hover:bg-accent/10 transition-all"
                >
                  <Icon className="w-[18px] h-[18px]" strokeWidth={1.8} />
                  {item.label}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-border/30">
          <p className="text-[10px] text-muted-foreground/60 text-center">v2.0 &middot; {shop.name}</p>
        </div>
      </aside>

      {/* Mobile Bottom Nav — hidden on desktop */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-2xl border-t border-border/30 px-1 pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around max-w-lg mx-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                onTouchStart={() => prefetchRoute(item.path)}
                className={`nav-item relative ${isActive ? "nav-item-active" : "nav-item-inactive"}`}
              >
                {isActive && (
                  <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full gradient-primary" />
                )}
                <div className={`p-2 rounded-xl transition-all duration-200 ${isActive ? "bg-primary/10" : ""}`}>
                  <Icon className={`w-5 h-5 transition-colors ${isActive ? "text-primary" : ""}`} strokeWidth={isActive ? 2.5 : 1.8} />
                </div>
                <span className={`text-[10px] transition-colors ${isActive ? "font-bold text-primary" : "font-medium"}`}>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default BottomNav;
