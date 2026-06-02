/**
 * Dynamic theme color utility.
 * Takes an oklch color string (e.g. "oklch(0.7 0.12 160)") from the restaurant's
 * themeColor and generates derived CSS custom properties for the entire UI.
 */

interface OklchColor {
  l: number; // lightness 0-1
  c: number; // chroma 0-0.4
  h: number; // hue 0-360
}

function parseOklch(color: string): OklchColor | null {
  // Match oklch(L C H) with optional whitespace
  const match = color.match(/oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\)/);
  if (!match) return null;
  return {
    l: parseFloat(match[1]),
    c: parseFloat(match[2]),
    h: parseFloat(match[3]),
  };
}

function toOklch({ l, c, h }: OklchColor, alpha?: number): string {
  if (alpha !== undefined) {
    return `oklch(${l} ${c} ${h} / ${alpha})`;
  }
  return `oklch(${l} ${c} ${h})`;
}

/**
 * Apply a theme color to the document, generating all derived CSS custom properties.
 * Call this after login or whenever themeColor changes.
 */
export function applyThemeColor(oklchColor: string | null | undefined): void {
  const el = document.documentElement;

  if (!oklchColor) {
    // Remove all custom overrides and fall back to CSS defaults
    clearThemeOverrides(el);
    return;
  }

  const base = parseOklch(oklchColor);
  if (!base) {
    console.warn("[theme] Could not parse oklch color:", oklchColor);
    return;
  }

  // Generate derived colors from the base
  const primary = { l: Math.min(base.l, 0.5), c: base.c, h: base.h };
  const primaryGlow = { l: Math.min(base.l + 0.17, 0.85), c: Math.min(base.c + 0.04, 0.3), h: base.h };
  const accent = { l: base.l, c: base.c, h: base.h };
  const ring = { l: primaryGlow.l, c: primaryGlow.c, h: base.h };

  // Sidebar colors
  const sidebar = { l: 0.25, c: Math.min(base.c * 0.5, 0.06), h: base.h };
  const sidebarPrimary = { l: base.l, c: base.c, h: base.h };
  const sidebarAccent = { l: 0.32, c: Math.min(base.c * 0.55, 0.065), h: base.h };
  const sidebarBorder = { l: 0.35, c: Math.min(base.c * 0.5, 0.055), h: base.h };

  // Apply to CSS custom properties
  el.style.setProperty("--primary", toOklch(primary));
  el.style.setProperty("--primary-foreground", "oklch(0.98 0.015 75)");
  el.style.setProperty("--primary-glow", toOklch(primaryGlow));
  el.style.setProperty("--accent", toOklch(accent));
  el.style.setProperty("--accent-foreground", "oklch(0.99 0.005 75)");
  el.style.setProperty("--ring", toOklch(ring));

  // Sidebar
  el.style.setProperty("--sidebar", toOklch(sidebar));
  el.style.setProperty("--sidebar-foreground", "oklch(0.94 0.02 75)");
  el.style.setProperty("--sidebar-primary", toOklch(sidebarPrimary));
  el.style.setProperty("--sidebar-primary-foreground", "oklch(0.99 0.005 75)");
  el.style.setProperty("--sidebar-accent", toOklch(sidebarAccent));
  el.style.setProperty("--sidebar-accent-foreground", "oklch(0.98 0.015 75)");
  el.style.setProperty("--sidebar-border", toOklch(sidebarBorder));
  el.style.setProperty("--sidebar-ring", toOklch(sidebarPrimary));

  // Gradients & shadows
  el.style.setProperty("--gradient-warm", `linear-gradient(135deg, ${toOklch(primaryGlow)}, ${toOklch(accent)})`);
  el.style.setProperty("--shadow-warm", `0 10px 30px -12px ${toOklch(primary, 0.25)}`);
  el.style.setProperty("--shadow-soft", `0 2px 12px -4px ${toOklch(primary, 0.12)}`);
}

function clearThemeOverrides(el: HTMLElement): void {
  const props = [
    "--primary",
    "--primary-foreground",
    "--primary-glow",
    "--accent",
    "--accent-foreground",
    "--ring",
    "--sidebar",
    "--sidebar-foreground",
    "--sidebar-primary",
    "--sidebar-primary-foreground",
    "--sidebar-accent",
    "--sidebar-accent-foreground",
    "--sidebar-border",
    "--sidebar-ring",
    "--gradient-warm",
    "--shadow-warm",
    "--shadow-soft",
  ];
  props.forEach((p) => el.style.removeProperty(p));
}
