import { supabase } from "@/integrations/supabase/client";

export interface Product {
  id: string;
  name: string;
  category: string;
  buyPrice: number;
  price: number;
  stock: number;
  minStock: number;
}

const mapRow = (row: any): Product => ({
  id: row.id,
  name: row.name,
  category: row.category,
  buyPrice: Number(row.buy_price),
  price: Number(row.price),
  stock: row.stock,
  minStock: row.min_stock,
});

export const getProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("name");
  if (error) throw error;
  return (data || []).map(mapRow);
};

export const addProduct = async (product: Omit<Product, "id">): Promise<Product> => {
  const { data, error } = await supabase
    .from("products")
    .insert({
      name: product.name,
      category: product.category,
      buy_price: product.buyPrice,
      price: product.price,
      stock: product.stock,
      min_stock: product.minStock,
    })
    .select()
    .single();
  if (error) throw error;
  return mapRow(data);
};

export const deleteProduct = async (id: string): Promise<void> => {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
};
