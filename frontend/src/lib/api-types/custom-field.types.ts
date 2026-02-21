export interface CustomFieldDefinition {
  id: string;
  entityType: string;
  fieldKey: string;
  fieldLabel: string;
  fieldType: string;
  options?: unknown[];
  lookupListId?: string;
  collectionSchema?: unknown[];
  minEntries?: number;
  maxEntries?: number;
  isRequired: boolean;
  defaultValue?: string;
  isFilterable: boolean;
  displayOrder: number;
  section?: string;
  showOnForm: boolean;
  showOnCard: boolean;
  dependsOnFieldId?: string;
  dependsOnValue?: string;
  createdAt?: string;
}

export interface CreateCustomFieldDefinitionRequest {
  fieldKey: string;
  fieldLabel: string;
  fieldType: string;
  options?: unknown[];
  lookupListId?: string;
  collectionSchema?: unknown[];
  minEntries?: number;
  maxEntries?: number;
  isRequired?: boolean;
  defaultValue?: string;
  isFilterable?: boolean;
  displayOrder?: number;
  section?: string;
  showOnForm?: boolean;
  showOnCard?: boolean;
  dependsOnFieldId?: string;
  dependsOnValue?: string;
}

export interface UpdateCustomFieldDefinitionRequest {
  fieldLabel?: string;
  options?: unknown[];
  isRequired?: boolean;
  defaultValue?: string;
  isFilterable?: boolean;
  displayOrder?: number;
  section?: string;
  showOnForm?: boolean;
  showOnCard?: boolean;
}
