import { createFileRoute } from "@tanstack/react-router";
import { QRCodeSVG } from "qrcode.react";
import { Download, Share2, Chrome } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/layout";
import { useAuth } from "@/lib/auth";

// Usage

export const Route = createFileRoute("/qr-codes")({
  head: () => ({ meta: [{ title: "QR Codes · Ember & Oak" }] }),
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
  };

  return (
    <div className="rounded-2xl bg-card border border-border p-6 shadow-soft">
      <div className="flex flex-col items-center text-center">
        <div className="p-5 rounded-2xl bg-gradient-cream border border-border">
          <QRCodeSVG
            id={`qr-${accent}`}
            value={value}
            size={200}
            bgColor="transparent"
            fgColor="#3a2615"
            level="H"
          />

        </div>
        <h3 className="font-display text-xl mt-5">{title}</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-xs">{description}</p>
        <code className="mt-3 text-xs px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground truncate max-w-full">
          {value}
        </code>
        <div className="flex gap-2 mt-5 w-full">
          <button
            onClick={downloadSVG}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2.5 text-sm font-medium hover:bg-primary-glow transition-colors"
          >
            <Download className="h-4 w-4" /> Download 
          </button>
          <button className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium hover:bg-secondary transition-colors">
            <Share2 className="h-4 w-4" /> Share
          </button>
        </div>
      </div>
    </div>
  );
}

function QRPage() {
  const { restaurantId } = useAuth();

  return (
    <DashboardLayout
      title="QR Codes"
      subtitle="Print, share, and place these around your restaurant."
    >
      <div className="mb-6 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 flex items-center gap-3">
        <Chrome className="h-5 w-5 text-blue-600 flex-shrink-0" />
        <div>
          <p className="font-medium text-blue-900">Best experience with Chrome</p>
          <p className="text-sm text-blue-700">For optimal QR code scanning and features, we recommend using Google Chrome.</p>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <QRBlock
          accent="loyalty"
          title="Loyalty QR"
          description="Customers scan this to earn stamps toward rewards."
          value="https://loyal.bahirandelivery.com/onboarding"
        />
        <QRBlock
          accent="menu"
          title="Menu QR"
          description="Opens the digital menu on the customer's phone."
          value={`https://loyal.bahirandelivery.com/menu/${restaurantId}`}
        />
      </div>
    </DashboardLayout>
  );
}
