import { useState, useEffect, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Download, Printer, RefreshCw, QrCode } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import logoImage from "@/assets/logo.png";

interface Table {
  id: string;
  table_number: string;
  capacity: number;
  location: string | null;
  is_available: boolean | null;
}

const AdminQRCodes = () => {
  const { t } = useLanguage();
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const { data, error } = await supabase
        .from("restaurant_tables")
        .select("*")
        .order("table_number");

      if (error) throw error;
      setTables(data || []);
    } catch (error) {
      console.error("Error fetching tables:", error);
      toast.error(t("Failed to load tables", "Masalar yüklenemedi"));
    } finally {
      setLoading(false);
    }
  };

  const getOrderUrl = (tableNumber: string) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/order?table=${tableNumber}`;
  };

  const downloadQRCode = async (tableNumber: string) => {
    const svg = document.getElementById(`qr-${tableNumber}`);
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const qrImg = new Image();
    const logoImg = new Image();

    // Load both images
    const loadImage = (img: HTMLImageElement, src: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = src;
      });
    };

    try {
      await Promise.all([
        loadImage(qrImg, "data:image/svg+xml;base64," + btoa(svgData)),
        loadImage(logoImg, logoImage)
      ]);

      canvas.width = 400;
      canvas.height = 520;
      
      if (ctx) {
        // Gradient background
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, "#1a1a1a");
        gradient.addColorStop(1, "#2d2d2d");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Decorative top accent
        ctx.fillStyle = "#E07A5F";
        ctx.fillRect(0, 0, canvas.width, 6);

        // Logo at top
        const logoWidth = 120;
        const logoHeight = 40;
        ctx.drawImage(logoImg, (canvas.width - logoWidth) / 2, 20, logoWidth, logoHeight);

        // White container for QR
        ctx.fillStyle = "#ffffff";
        const qrContainerX = 40;
        const qrContainerY = 75;
        const qrContainerSize = 320;
        ctx.beginPath();
        ctx.roundRect(qrContainerX, qrContainerY, qrContainerSize, qrContainerSize, 16);
        ctx.fill();
        
        // Draw QR code
        ctx.drawImage(qrImg, 60, 95, 280, 280);

        // Table number with accent color
        ctx.fillStyle = "#E07A5F";
        ctx.font = "bold 14px 'Arial'";
        ctx.textAlign = "center";
        ctx.fillText("CALIFORIAN RESTAURANT", canvas.width / 2, 420);

        // Table number
        ctx.fillStyle = "#F5E6D3";
        ctx.font = "bold 32px 'Georgia'";
        ctx.fillText(`Table ${tableNumber}`, canvas.width / 2, 460);
        
        // Scan instruction
        ctx.font = "14px 'Arial'";
        ctx.fillStyle = "#888888";
        ctx.fillText("Scan to view menu & order", canvas.width / 2, 490);

        // Bottom accent
        ctx.fillStyle = "#E07A5F";
        ctx.fillRect(0, canvas.height - 6, canvas.width, 6);
      }

      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `califorian-table-${tableNumber}-qr.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    } catch (error) {
      console.error("Error generating QR:", error);
      toast.error(t("Failed to download QR code", "QR kod indirilemedi"));
    }
  };

  const printAllQRCodes = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error(t("Please allow popups to print", "Yazdırmak için popup'lara izin verin"));
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Table QR Codes - Califorian Restaurant</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&display=swap');
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; background: #f5f5f5; }
            .grid { 
              display: grid; 
              grid-template-columns: repeat(2, 1fr); 
              gap: 24px; 
              padding: 24px;
            }
            .qr-card {
              background: linear-gradient(180deg, #1a1a1a 0%, #2d2d2d 100%);
              border-radius: 16px;
              padding: 24px;
              text-align: center;
              page-break-inside: avoid;
              border-top: 4px solid #E07A5F;
              border-bottom: 4px solid #E07A5F;
            }
            .qr-wrapper {
              background: #ffffff;
              border-radius: 12px;
              padding: 16px;
              display: inline-block;
              margin-bottom: 16px;
            }
            .qr-card svg { display: block; }
            .brand-text { 
              font-size: 12px; 
              font-weight: bold; 
              color: #E07A5F; 
              letter-spacing: 2px;
              margin-bottom: 8px;
            }
            .table-number { 
              font-family: 'Playfair Display', Georgia, serif;
              font-size: 28px; 
              font-weight: bold; 
              color: #F5E6D3;
              margin-bottom: 8px; 
            }
            .scan-text { font-size: 12px; color: #888; }
            @media print {
              body { background: white; }
              .grid { grid-template-columns: repeat(2, 1fr); }
            }
          </style>
        </head>
        <body>
          <div class="grid">
            ${tables.map(table => `
              <div class="qr-card">
                <div class="qr-wrapper">
                  ${document.getElementById(`qr-${table.table_number}`)?.outerHTML || ''}
                </div>
                <div class="brand-text">CALIFORIAN RESTAURANT</div>
                <div class="table-number">Table ${table.table_number}</div>
                <div class="scan-text">Scan to view menu & order</div>
              </div>
            `).join('')}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <QrCode className="h-6 w-6 text-primary" />
            {t("Table QR Codes", "Masa QR Kodları")}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t(
              "Print and place these QR codes on tables for easy ordering",
              "Kolay sipariş için bu QR kodlarını masalara yerleştirin"
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchTables}>
            <RefreshCw className="h-4 w-4 mr-2" />
            {t("Refresh", "Yenile")}
          </Button>
          <Button onClick={printAllQRCodes}>
            <Printer className="h-4 w-4 mr-2" />
            {t("Print All", "Tümünü Yazdır")}
          </Button>
        </div>
      </div>

      {/* No tables message */}
      {tables.length === 0 && (
        <div className="text-center py-16 bg-card rounded-xl">
          <QrCode className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">
            {t("No tables found", "Masa bulunamadı")}
          </h3>
          <p className="text-muted-foreground mb-4">
            {t(
              "Add tables first in the Tables section to generate QR codes",
              "QR kod oluşturmak için önce Masalar bölümünden masa ekleyin"
            )}
          </p>
          <Button variant="outline" onClick={() => window.location.href = "/admin/tables"}>
            {t("Go to Tables", "Masalara Git")}
          </Button>
        </div>
      )}

      {/* QR Codes Grid */}
      <div ref={printRef} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {tables.map((table) => (
          <Card key={table.id} className="overflow-hidden hover:shadow-lg transition-shadow bg-gradient-to-b from-charcoal to-charcoal/90 border-t-4 border-t-primary border-b-4 border-b-primary">
            <CardContent className="p-6 text-center">
              {/* QR Code */}
              <div className="bg-white p-4 rounded-xl mb-4 inline-block shadow-md">
                <QRCodeSVG
                  id={`qr-${table.table_number}`}
                  value={getOrderUrl(table.table_number)}
                  size={160}
                  level="H"
                  includeMargin
                  fgColor="#1a1a1a"
                  bgColor="#ffffff"
                  imageSettings={{
                    src: logoImage,
                    x: undefined,
                    y: undefined,
                    height: 32,
                    width: 32,
                    excavate: true,
                  }}
                />
              </div>

              {/* Brand text */}
              <p className="text-xs font-bold text-primary tracking-widest mb-2">
                CALIFORIAN RESTAURANT
              </p>

              {/* Table Info */}
              <h3 className="text-2xl font-serif font-bold mb-1 text-cream">
                {t("Table", "Masa")} {table.table_number}
              </h3>
              <p className="text-sm text-muted-foreground mb-1">
                {table.capacity} {t("seats", "kişilik")}
              </p>
              {table.location && (
                <p className="text-xs text-muted-foreground mb-3">{table.location}</p>
              )}

              {/* Scan instruction */}
              <p className="text-xs text-muted-foreground mb-4">
                {t("Scan to view menu & order", "Menü ve sipariş için tarayın")}
              </p>

              {/* Download Button */}
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => downloadQRCode(table.table_number)}
              >
                <Download className="h-4 w-4 mr-2" />
                {t("Download PNG", "PNG İndir")}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Instructions */}
      {tables.length > 0 && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 mt-8">
          <h3 className="font-bold mb-3 text-primary">
            {t("Instructions", "Talimatlar")}
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• {t(
              "Print QR codes and place them on each table",
              "QR kodlarını yazdırın ve her masaya yerleştirin"
            )}</li>
            <li>• {t(
              "Customers scan the code to view the menu and place orders",
              "Müşteriler menüyü görmek ve sipariş vermek için kodu tararlar"
            )}</li>
            <li>• {t(
              "Orders automatically include the table number",
              "Siparişler otomatik olarak masa numarasını içerir"
            )}</li>
            <li>• {t(
              "New orders appear in real-time on the Orders page",
              "Yeni siparişler Siparişler sayfasında anlık olarak görünür"
            )}</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default AdminQRCodes;
