import { supabase } from "@/integrations/supabase/client";

export interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  is_main?: boolean;
}

export interface Employee {
  id: string;
  name: string;
  phone: string;
  role: "admin" | "teknisi" | "kasir";
  branchId: string;
  active: boolean;
}

export const getBranches = async (): Promise<Branch[]> => {
  const { data, error } = await supabase
    .from("branches")
    .select("*")
    .order("is_main", { ascending: false });
  if (error) throw error;
  return (data || []).map((b) => ({
    id: b.id,
    name: b.name,
    address: b.address,
    phone: b.phone,
    is_main: b.is_main,
  }));
};

export const addBranch = async (branch: Omit<Branch, "id">): Promise<Branch[]> => {
  const { error } = await supabase
    .from("branches")
    .insert({ name: branch.name, address: branch.address, phone: branch.phone });
  if (error) throw error;
  return getBranches();
};

export const updateBranch = async (id: string, updates: Partial<Omit<Branch, "id" | "is_main">>): Promise<Branch[]> => {
  const { error } = await supabase
    .from("branches")
    .update({ name: updates.name, address: updates.address, phone: updates.phone })
    .eq("id", id);
  if (error) throw error;
  return getBranches();
};

export const deleteBranch = async (id: string): Promise<Branch[]> => {
  const { error } = await supabase.from("branches").delete().eq("id", id);
  if (error) throw error;
  return getBranches();
};

export const getEmployees = async (): Promise<Employee[]> => {
  const { data, error } = await supabase
    .from("employees")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map((e) => ({
    id: e.id,
    name: e.name,
    phone: e.phone,
    role: e.role as "admin" | "teknisi" | "kasir",
    branchId: e.branch_id || "",
    active: e.active,
  }));
};

export const addEmployee = async (employee: Omit<Employee, "id">): Promise<Employee[]> => {
  const { error } = await supabase
    .from("employees")
    .insert({
      name: employee.name,
      phone: employee.phone,
      role: employee.role,
      branch_id: employee.branchId || null,
      active: employee.active,
    });
  if (error) throw error;
  return getEmployees();
};

export const deleteEmployee = async (id: string): Promise<Employee[]> => {
  const { error } = await supabase.from("employees").delete().eq("id", id);
  if (error) throw error;
  return getEmployees();
};

export const toggleEmployeeActive = async (id: string): Promise<Employee[]> => {
  const employees = await getEmployees();
  const emp = employees.find((e) => e.id === id);
  if (!emp) return employees;
  const { error } = await supabase
    .from("employees")
    .update({ active: !emp.active })
    .eq("id", id);
  if (error) throw error;
  return getEmployees();
};
