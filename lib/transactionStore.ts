import { supabase } from "@/integrations/supabase/client";

export interface TransactionItem {
  name: string;
  price: number;
  qty: number;
  category: string;
}

export interface Transaction {
  id: string;
  invoice: string;
  items: TransactionItem[];
  total: number;
  bayar: number;
  kembalian: number;
  createdAt: string; // YYYY-MM-DD
  createdTime: string; // HH:mm
  timestamp: number;
}

const mapRow = (row: any, items: any[]): Transaction => ({
  id: row.id,
  invoice: row.invoice,
  items: items.map((i) => ({
    name: i.name,
    price: Number(i.price),
    qty: i.qty,
    category: i.category,
  })),
  total: Number(row.total),
  bayar: Number(row.bayar),
  kembalian: Number(row.kembalian),
  createdAt: row.created_at?.slice(0, 10) || "",
  createdTime: row.created_at?.slice(11, 16) || "",
  timestamp: new Date(row.created_at).getTime(),
});

export const getTransactions = async (): Promise<Transaction[]> => {
  const { data: txRows, error } = await supabase
    .from("transactions")
    .select("*, transaction_items(*)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (txRows || []).map((row: any) => mapRow(row, row.transaction_items || []));
};

export const saveTransaction = async (tx: Omit<Transaction, "id" | "timestamp" | "createdAt" | "createdTime"> & { items: TransactionItem[] }): Promise<Transaction> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: txRow, error: txError } = await supabase
    .from("transactions")
    .insert({
      user_id: user.id,
      invoice: tx.invoice,
      total: tx.total,
      bayar: tx.bayar,
      kembalian: tx.kembalian,
    })
    .select()
    .single();
  if (txError) throw txError;

  if (tx.items.length > 0) {
    const { error: itemsError } = await supabase
      .from("transaction_items")
      .insert(
        tx.items.map((item) => ({
          transaction_id: txRow.id,
          name: item.name,
          price: item.price,
          qty: item.qty,
          category: item.category,
        }))
      );
    if (itemsError) throw itemsError;
  }

  return mapRow(txRow, tx.items);
};

export const getTransactionsByDate = async (date: string): Promise<Transaction[]> => {
  const txs = await getTransactions();
  return txs.filter((t) => t.createdAt === date);
};
