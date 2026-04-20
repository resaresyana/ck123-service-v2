import { supabase } from "@/integrations/supabase/client";
import { ServiceData } from "@/components/ServiceCard";

export type ServiceStatus = "antrian" | "masuk" | "proses" | "selesai" | "diambil" | "cancel";

const mapRow = (row: any): ServiceData => ({
  id: row.id,
  customerName: row.customer_name,
  phone: row.phone || "",
  deviceBrand: row.device_brand,
  deviceModel: row.device_model || "",
  complaint: row.complaint,
  status: row.status,
  totalCost: Number(row.total_cost),
  dpAmount: Number(row.dp_amount),
  createdAt: row.created_at?.slice(0, 10) || "",
  invoice: row.invoice,
  notes: row.notes || "",
  technicianId: row.technician_id ?? null,
});

export const getServices = async (): Promise<ServiceData[]> => {
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(mapRow);
};

export const saveService = async (service: Omit<ServiceData, "id">): Promise<ServiceData> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("services")
    .insert({
      user_id: user.id,
      customer_name: service.customerName,
      phone: service.phone,
      device_brand: service.deviceBrand,
      device_model: service.deviceModel,
      complaint: service.complaint,
      status: service.status,
      total_cost: service.totalCost,
      dp_amount: service.dpAmount,
      invoice: service.invoice,
    })
    .select()
    .single();
  if (error) throw error;
  return mapRow(data);
};

export const deleteService = async (id: string): Promise<void> => {
  const { error } = await supabase.from("services").delete().eq("id", id);
  if (error) throw error;
};

export const updateServiceStatus = async (id: string, status: ServiceStatus): Promise<void> => {
  const { error } = await supabase
    .from("services")
    .update({ status })
    .eq("id", id);
  if (error) throw error;
};

export const updateServicePayment = async (id: string, updates: { dp_amount?: number; total_cost?: number }): Promise<void> => {
  const { error } = await supabase
    .from("services")
    .update(updates)
    .eq("id", id);
  if (error) throw error;
};

export const updateServiceEstimate = async (
  id: string,
  updates: { total_cost?: number; notes?: string }
): Promise<void> => {
  const { error } = await supabase
    .from("services")
    .update(updates)
    .eq("id", id);
  if (error) throw error;
};

export const updateServiceTechnician = async (
  id: string,
  technicianId: string | null
): Promise<void> => {
  const { error } = await supabase
    .from("services")
    .update({ technician_id: technicianId })
    .eq("id", id);
  if (error) throw error;
};

export interface TechnicianOption {
  id: string;
  name: string;
  role: string;
}

export const getTechnicians = async (): Promise<TechnicianOption[]> => {
  const { data, error } = await supabase
    .from("employees")
    .select("id, name, role, active")
    .eq("active", true)
    .order("name");
  if (error) throw error;
  return (data || [])
    .filter((e: any) => (e.role || "").toLowerCase() === "teknisi")
    .map((e: any) => ({ id: e.id, name: e.name, role: e.role }));
};
