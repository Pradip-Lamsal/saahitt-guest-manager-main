
export type CustomFieldType = 'text' | 'number' | 'date' | 'select';

export type CustomField = {
  id: string;
  user_id: string;
  name: string;
  field_type: CustomFieldType;
  options?: string[];
  created_at: string;
  updated_at: string;
};

export type NewCustomField = Omit<CustomField, 'id' | 'user_id' | 'created_at' | 'updated_at'>;
