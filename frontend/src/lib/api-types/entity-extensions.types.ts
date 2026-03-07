export interface CustomFieldValueResponse {
  customFieldId: string;
  fieldKey: string;
  fieldLabel: string;
  fieldType: string;
  value: unknown;
}

export interface CustomFieldFilter {
  fieldId: string;
  op: string;
  value: unknown;
  enabled?: boolean;
}
