import { expect, test } from "bun:test";
import { resolveQrState } from "./qrStateResolver";
import { QrCodeMetadata } from "../types/qr-code.types";

test("resolveQrState - no QR exists", () => {
  const state = resolveQrState(null, null, false);
  expect(state).toBe("no-qr");
});

test("resolveQrState - newly generated QR (printable)", () => {
  const activeQr: QrCodeMetadata = {
    _id: "qr1",
    restaurant: "res1",
    table: "table1",
    isActive: true,
    createdAt: "2026-08-27T00:00:00.000Z",
  };
  const state = resolveQrState(activeQr, "https://secure-url.com/?t=abc", false);
  expect(state).toBe("printable");
});

test("resolveQrState - existing active QR with no raw URL (metadata-only)", () => {
  const activeQr: QrCodeMetadata = {
    _id: "qr1",
    restaurant: "res1",
    table: "table1",
    isActive: true,
    createdAt: "2026-08-27T00:00:00.000Z",
  };
  const state = resolveQrState(activeQr, null, false);
  expect(state).toBe("metadata-only");
});

test("resolveQrState - existing active QR with stable URL (printable)", () => {
  const activeQr: QrCodeMetadata = {
    _id: "qr1",
    restaurant: "res1",
    table: "table1",
    isActive: true,
    url: "https://secure-url.com/?t=abc",
    createdAt: "2026-08-27T00:00:00.000Z",
  };
  const state = resolveQrState(activeQr, null, false);
  expect(state).toBe("printable");
});

test("resolveQrState - revoked state takes precedence", () => {
  const activeQr: QrCodeMetadata = {
    _id: "qr1",
    restaurant: "res1",
    table: "table1",
    isActive: true,
    createdAt: "2026-08-27T00:00:00.000Z",
  };
  const state = resolveQrState(activeQr, "https://secure-url.com/?t=abc", true);
  expect(state).toBe("revoked");
});
