export interface BusinessSettings {
  id: boolean;
  business_name: string;
  currency: string;
  instagram: string | null;
  whatsapp: string | null;
  notes: string | null;
  updated_at: string;
}

export interface BusinessSettingsFormValues {
  business_name: string;
  currency: string;
  instagram: string;
  whatsapp: string;
  notes: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  active: boolean;
  created_at: string;
}
