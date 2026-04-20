import { supabase } from "@/integrations/supabase/client";

export interface ShopInfo {
  name: string;
  address: string;
  phone: string;
  footer: string;
  logo: string | null;
}

const defaultShop: ShopInfo = {
  name: "CK123 Celluler",
  address: "Jl. Raya No. 123, Kota",
  phone: "081234567890",
  footer: "Terima kasih telah mempercayakan service HP Anda kepada kami 🙏",
  logo: null,
};

export const getShopInfo = async (): Promise<ShopInfo> => {
  const { data, error } = await supabase
    .from("shop_settings")
    .select("*")
    .limit(1)
    .single();
  if (error || !data) return defaultShop;
  const info: ShopInfo = {
    name: data.name,
    address: data.address,
    phone: data.phone,
    footer: data.footer,
    logo: data.logo,
  };
  cachedShop = info; // always sync cache
  return info;
};

// Synchronous version for PDF generation (uses cached value)
let cachedShop: ShopInfo = defaultShop;
export const getCachedShopInfo = (): ShopInfo => cachedShop;
export const setCachedShopInfo = (info: ShopInfo) => { cachedShop = info; };

export const saveShopInfo = async (info: ShopInfo): Promise<void> => {
  const { data: existing } = await supabase
    .from("shop_settings")
    .select("id")
    .limit(1)
    .single();

  if (existing) {
    const { error } = await supabase
      .from("shop_settings")
      .update({
        name: info.name,
        address: info.address,
        phone: info.phone,
        footer: info.footer,
        logo: info.logo,
      })
      .eq("id", existing.id);
    if (error) throw error;
  }
  cachedShop = info;
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
