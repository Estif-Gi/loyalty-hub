import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Download, Share2, Chrome, Copy, Printer, Check } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/layout";
import { useAuth, requireOwner } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/qr-codes")({
  beforeLoad: requireOwner,
  head: () => ({ meta: [{ title: "QR Codes · Loyal Hub" }] }),
  component: QRPage,
});

function QRBlock({
  title,
  description,
  value,
  accent,
}: {
  title: string;
  description: string;
  value: string;
  accent: string;
}) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadSVG = () => {
    const svg = document.getElementById(`qr-${accent}`);
    if (!svg) return;
    const data = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([data], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${accent}-qr.svg`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("QR code downloaded!");
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url: value,
        });
      } catch {
        // Ignored if cancelled
      }
    } else {
      copyToClipboard();
    }
  };

  const printQR = () => {
    const svgElement = document.getElementById(`qr-${accent}`);
    if (!svgElement) return;

    const svgString = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const blobUrl = URL.createObjectURL(svgBlob);

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Print - ${title}</title>
          <style>
            body {
              font-family: sans-serif;
              text-align: center;
              padding: 40px;
              color: #2c1f0e;
              background-color: #ffffff;
            }
            .container {
              border: 3px double #a97c4a;
              border-radius: 24px;
              padding: 30px;
              display: inline-block;
              background: #faf7f2;
              width: 300px;
            }
            .title {
              font-size: 24px;
              font-weight: 800;
              margin: 10px 0 6px 0;
            }
            .desc {
              font-size: 13px;
              color: #6b4826;
              margin-bottom: 20px;
            }
            .qr-box {
              background: white;
              padding: 20px;
              border-radius: 16px;
              display: inline-block;
              box-shadow: 0 4px 12px rgba(44,31,14,0.06);
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="title">${title}</div>
            <div class="desc">${description}</div>
            <div class="qr-box">
              <img src="${blobUrl}" width="200" height="200" />
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    URL.revokeObjectURL(blobUrl);
  };

  return (
    <div className="rounded-2xl bg-card border border-border p-4 sm:p-6 shadow-soft flex flex-col justify-between">
      <div className="flex flex-col items-center text-center">
        {/* QR Code Container */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-cream border border-border max-w-[240px] w-full aspect-square flex items-center justify-center shadow-xs">
          <QRCodeSVG
            id={`qr-${accent}`}
            value={value}
            size={190}
            bgColor="transparent"
            fgColor="#3a2615"
            level="H"
            className="w-full h-full max-w-[190px] max-h-[190px]"
          />
        </div>

        <h3 className="font-display font-bold text-lg sm:text-xl text-foreground mt-4">{title}</h3>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-xs leading-relaxed">
          {description}
        </p>

        {/* Link Snippet */}
        <div className="mt-3 w-full max-w-sm flex items-center gap-1.5 p-1.5 pl-3 rounded-xl bg-secondary/40 border border-border/50 text-xs">
          <span className="truncate font-mono text-muted-foreground flex-1 text-left select-all">
            {value}
          </span>
          <button
            onClick={copyToClipboard}
            className="p-1.5 hover:bg-secondary rounded-lg text-muted-foreground hover:text-foreground transition-colors shrink-0 cursor-pointer"
            title="Copy URL"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-success" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-3 gap-2 mt-5 w-full pt-4 border-t border-border/40">
        <button
          onClick={downloadSVG}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary text-primary-foreground px-2.5 py-2.5 text-xs font-semibold hover:bg-primary/95 shadow-warm active:scale-[0.98] transition-all cursor-pointer"
        >
          <Download className="h-3.5 w-3.5" />
          <span className="truncate">Download</span>
        </button>

        <button
          onClick={handleShare}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-background px-2.5 py-2.5 text-xs font-semibold hover:bg-secondary active:scale-[0.98] transition-all cursor-pointer"
        >
          <Share2 className="h-3.5 w-3.5" />
          <span className="truncate">Share</span>
        </button>

        <button
          onClick={printQR}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-background px-2.5 py-2.5 text-xs font-semibold hover:bg-secondary active:scale-[0.98] transition-all cursor-pointer"
        >
          <Printer className="h-3.5 w-3.5" />
          <span className="truncate">Print</span>
        </button>
      </div>
    </div>
  );
}

function QRPage() {
  const { restaurantId } = useAuth();
  const [activeTab, setActiveTab] = useState<"loyalty" | "menu">("loyalty");

  return (
    <DashboardLayout
      title="QR Codes"
      subtitle="Manage loyalty program scans and digital menu access credentials."
    >
      {/* Chrome recommendation banner */}
      <div className="mb-6 p-3 sm:p-4 rounded-xl bg-blue-50/80 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 flex items-center gap-3">
        <Chrome className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0" />
        <div className="min-w-0">
          <p className="font-semibold text-xs sm:text-sm text-blue-900 dark:text-blue-200">
            Best experience with Google Chrome
          </p>
          <p className="text-[11px] sm:text-xs text-blue-700 dark:text-blue-300 mt-0.5 leading-relaxed">
            For optimal QR code scanning and direct high-resolution printing, Chrome is recommended.
          </p>
        </div>
      </div>

      {/* Responsive Segmented Tabs */}
      <div className="grid grid-cols-2 max-w-xs w-full bg-secondary/30 p-1 rounded-xl border border-border/40 mb-6">
        <button
          onClick={() => setActiveTab("loyalty")}
          className={`py-2 px-3 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
            activeTab === "loyalty"
              ? "bg-background text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Loyalty QR
        </button>
        <button
          onClick={() => setActiveTab("menu")}
          className={`py-2 px-3 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
            activeTab === "menu"
              ? "bg-background text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Menu QR
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === "loyalty" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
          <QRBlock
            accent="loyalty"
            title="Loyalty Stamp QR"
            description="Customers scan this QR code to join your loyalty program and earn reward stamps."
            value="https://loyal.bahirandelivery.com/onboarding"
          />
        </div>
      )}

      {activeTab === "menu" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
          <QRBlock
            accent="menu"
            title="Digital Menu QR"
            description="Opens your live digital menu directly on the customer's phone browser."
            value={`https://loyal.bahirandelivery.com/menu/${restaurantId}`}
          />
        </div>
      )}
    </DashboardLayout>
  );
}
