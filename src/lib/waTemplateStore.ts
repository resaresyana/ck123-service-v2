import { supabase } from "@/integrations/supabase/client";

export interface WaTemplate {
  id: string;
  key: string;
  title: string;
  icon: string;
  message: string;
}

const mapRow = (row: any): WaTemplate => ({
  id: row.id,
  key: row.key,
  title: row.title,
  icon: row.icon,
  message: row.message,
});

export const getWaTemplates = async (): Promise<WaTemplate[]> => {
  const { data, error } = await supabase
    .from("wa_templates")
    .select("*")
    .order("created_at");
  if (error) throw error;
  return (data || []).map(mapRow);
};

export const updateWaTemplate = async (
  id: string,
  updates: { title?: string; icon?: string; message?: string }
): Promise<void> => {
  const { error } = await supabase
    .from("wa_templates")
    .update(updates)
    .eq("id", id);
  if (error) throw error;
};

/** Replace template variables with actual service data */
export const renderTemplate = (
  template: string,
  vars: Record<string, string>
): string => {
  return template.replace(/\{(\w+)\}/g, (_, key) => vars[key] || "");
};
