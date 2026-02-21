export interface FileAttachment {
  id: string;
  entityType: string;
  entityId: string;
  fileName: string;
  fileUrl: string;
  fileSizeBytes?: number;
  mimeType?: string;
  category?: string;
  uploadedById?: string;
  createdAt: string;
}
