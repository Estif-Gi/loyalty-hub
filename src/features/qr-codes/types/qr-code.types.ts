export interface QrCodeMetadata {
  _id: string;
  restaurant: string;
  table: string;
  isActive: boolean;
  url?: string;
  createdAt: string;
  revokedAt?: string | null;
  rotatedAt?: string | null;
}

export interface GeneratedQrResponse {
  qrCodeId: string;
  restaurantId: string;
  tableId: string;
  token: string; // The raw secure token returned exactly once
  url: string; // The direct customer onboarding URL containing ?t=...
  isActive: boolean;
  createdAt: string;
}
