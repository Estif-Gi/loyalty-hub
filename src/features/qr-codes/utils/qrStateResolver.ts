import { QrCodeMetadata } from "../types/qr-code.types";

export type QrUiState = "no-qr" | "printable" | "metadata-only" | "revoked";

/**
 * Resolves the appropriate UI rendering state for a table's QR code.
 */
export function resolveQrState(
  activeQr: QrCodeMetadata | null | undefined,
  oneTimeQrUrl: string | null | undefined,
  justRevoked: boolean = false,
): QrUiState {
  if (justRevoked) {
    return "revoked";
  }
  if (oneTimeQrUrl || (activeQr && activeQr.url)) {
    return "printable";
  }
  if (activeQr && activeQr.isActive) {
    return "metadata-only";
  }
  return "no-qr";
}
