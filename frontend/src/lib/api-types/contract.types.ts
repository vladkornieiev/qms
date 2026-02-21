export interface Contract {
  id: string;
  projectId?: string;
  clientId?: string;
  clientName?: string;
  resourceId?: string;
  vendorId?: string;
  contractType: string;
  title: string;
  templateContent?: string;
  generatedFileUrl?: string;
  status: string;
  sentAt?: string;
  signedAt?: string;
  signedFileUrl?: string;
  signingProvider?: string;
  externalSigningId?: string;
  expiresAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedContractResponse {
  items: Contract[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface CreateContractRequest {
  projectId?: string;
  clientId?: string;
  resourceId?: string;
  vendorId?: string;
  contractType: string;
  title: string;
  templateContent?: string;
  expiresAt?: string;
  notes?: string;
}

export interface UpdateContractRequest {
  title?: string | null;
  templateContent?: string | null;
  contractType?: string | null;
  status?: string | null;
  expiresAt?: string | null;
  notes?: string | null;
  generatedFileUrl?: string | null;
  signingProvider?: string | null;
  externalSigningId?: string | null;
}

export interface ContractSignRequest {
  signedFileUrl?: string;
  signingProvider?: string;
  externalSigningId?: string;
}
