import { expect, test } from "bun:test";
import { formatCurrency } from "./formatCurrency";

test("formats ETB currency correctly", () => {
  const result = formatCurrency(250, "ETB");
  expect(result).toBe("ETB 250.00");
  expect(result).not.toContain("$");
});

test("handles default currency", () => {
  const result = formatCurrency(500);
  expect(result).toBe("ETB 500.00");
});

test("handles custom currency", () => {
  const result = formatCurrency(100, "USD");
  expect(result).toBe("USD 100.00");
});

test("handles invalid amount defensively", () => {
  const result = formatCurrency(undefined as any, "ETB");
  expect(result).toBe("ETB 0.00");
});
