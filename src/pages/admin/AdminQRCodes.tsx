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

    const loadImage = (img: HTMLImageElement, src: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = src;
      });
    };

    try {
      await Promise.all([
        loadImage(qrImg, "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)))),
        loadImage(logoImg, logoImage)
      ]);

      // Square-ish aspect ratio to prevent squashing
      canvas.width = 500;
      canvas.height = 650;
      
      if (ctx) {
        // Background with gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, "#1C1917");
        gradient.addColorStop(1, "#292524");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Top decorative bar
        ctx.fillStyle = "#E07A5F";
        ctx.fillRect(0, 0, canvas.width, 10);

        // Logo centered at top
        const logoWidth = 160;
        const logoHeight = 55;
        ctx.drawImage(logoImg, (canvas.width - logoWidth) / 2, 30, logoWidth, logoHeight);

        // Decorative line under logo
        ctx.strokeStyle = "#E07A5F";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(80, 105);
        ctx.lineTo(canvas.width - 80, 105);
        ctx.stroke();

        // White rounded container for QR
        ctx.fillStyle = "#FFFFFF";
        const qrSize = 320;
        const qrContainerX = (canvas.width - qrSize) / 2;
        const qrContainerY = 125;
        ctx.beginPath();
        ctx.roundRect(qrContainerX, qrContainerY, qrSize, qrSize, 20);
        ctx.fill();
        
        // Draw QR code centered in container (square aspect ratio)
        const qrPadding = 20;
        const qrDrawSize = qrSize - (qrPadding * 2);
        ctx.drawImage(qrImg, qrContainerX + qrPadding, qrContainerY + qrPadding, qrDrawSize, qrDrawSize);

        // Table number - large and prominent
        ctx.fillStyle = "#F5E6D3";
        ctx.font = "bold 52px Georgia, serif";
        ctx.textAlign = "center";
        ctx.fillText(`MASA ${tableNumber}`, canvas.width / 2, 510);
        
        // English subtitle
        ctx.fillStyle = "#A8A29E";
        ctx.font = "18px Arial, sans-serif";
        ctx.fillText(`TABLE ${tableNumber}`, canvas.width / 2, 540);

        // Bilingual scan instruction
        ctx.font = "bold 16px Arial, sans-serif";
        ctx.fillStyle = "#E07A5F";
        ctx.fillText("Menü için QR'ı Tarayın", canvas.width / 2, 585);
        
        ctx.font = "14px Arial, sans-serif";
        ctx.fillStyle = "#78716C";
        ctx.fillText("Scan QR for Menu", canvas.width / 2, 608);

        // Bottom decorative bar
        ctx.fillStyle = "#E07A5F";
        ctx.fillRect(0, canvas.height - 10, canvas.width, 10);
      }

      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `califorian-masa-${tableNumber}-qr.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
      
      toast.success(t("QR code downloaded", "QR kod indirildi"));
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
          <title>Califorian - Table QR Codes</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&display=swap');
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: Arial, sans-serif; 
              background: #f5f5f5;
              padding: 20px;
            }
            .grid { 
              display: grid; 
              grid-template-columns: repeat(2, 1fr); 
              gap: 20px;
            }
            .qr-card {
              background: linear-gradient(180deg, #1C1917 0%, #292524 100%);
              border-radius: 20px;
              padding: 28px 24px;
              text-align: center;
              page-break-inside: avoid;
              border-top: 6px solid #E07A5F;
              border-bottom: 6px solid #E07A5F;
            }
            .logo-area {
              margin-bottom: 12px;
            }
            .logo-area img {
              height: 36px;
              width: auto;
            }
            .divider {
              height: 1px;
              background: #E07A5F;
              margin: 0 20px 16px;
              opacity: 0.6;
            }
            .qr-wrapper {
              background: #ffffff;
              border-radius: 16px;
              padding: 16px;
              display: inline-block;
              margin-bottom: 16px;
            }
            .qr-card svg { display: block; }
            .table-number-tr { 
              font-family: 'Playfair Display', Georgia, serif;
              font-size: 36px; 
              font-weight: 700; 
              color: #F5E6D3;
              margin-bottom: 4px;
              letter-spacing: 2px;
            }
            .table-number-en { 
              font-size: 14px; 
              color: #A8A29E;
              margin-bottom: 16px;
              letter-spacing: 1px;
            }
            .scan-text-tr { 
              font-size: 13px; 
              font-weight: bold;
              color: #E07A5F; 
              margin-bottom: 4px;
            }
            .scan-text-en { 
              font-size: 11px; 
              color: #78716C;
            }
            @media print {
              body { background: white; padding: 10px; }
              .grid { gap: 15px; }
              .qr-card { padding: 20px 16px; }
            }
          </style>
        </head>
        <body>
          <div class="grid">
            ${tables.map(table => `
              <div class="qr-card">
                <div class="logo-area">
                  <img src="${logoImage}" alt="Califorian" />
                </div>
                <div class="divider"></div>
                <div class="qr-wrapper">
                  ${document.getElementById(`qr-${table.table_number}`)?.outerHTML || ''}
                </div>
                <div class="table-number-tr">MASA ${table.table_number}</div>
                <div class="table-number-en">TABLE ${table.table_number}</div>
                <div class="scan-text-tr">Menü için QR'ı Tarayın</div>
                <div class="scan-text-en">Scan QR for Menu</div>
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
            <Skeleton key={i} className="h-80 w-full rounded-xl" />
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
          <Card 
            key={table.id} 
            className="overflow-hidden hover:shadow-xl transition-all duration-300 bg-gradient-to-b from-stone-900 to-stone-800 border-0 rounded-2xl"
          >
            {/* Top accent bar */}
            <div className="h-1.5 bg-primary" />
            
            <CardContent className="p-6 text-center">
              {/* Logo */}
              <div className="mb-3">
                <img 
                  src={logoImage} 
                  alt="Califorian" 
                  className="h-8 mx-auto opacity-90"
                />
              </div>
              
              {/* Decorative divider */}
              <div className="h-px bg-primary/40 mx-4 mb-4" />

              {/* QR Code */}
              <div className="bg-white p-4 rounded-2xl mb-5 inline-block shadow-lg">
                <QRCodeSVG
                  id={`qr-${table.table_number}`}
                  value={getOrderUrl(table.table_number)}
                  size={150}
                  level="H"
                  includeMargin={false}
                  fgColor="#1C1917"
                  bgColor="#ffffff"
                  imageSettings={{
                    src: logoImage,
                    x: undefined,
                    y: undefined,
                    height: 28,
                    width: 28,
                    excavate: true,
                  }}
                />
              </div>

              {/* Table Number - Bilingual */}
              <h3 className="text-3xl font-serif font-bold text-cream tracking-wide mb-1">
                MASA {table.table_number}
              </h3>
              <p className="text-sm text-stone-400 tracking-wider mb-4">
                TABLE {table.table_number}
              </p>

              {/* Capacity badge */}
              <div className="inline-flex items-center gap-1 px-3 py-1 bg-stone-700/50 rounded-full mb-4">
                <span className="text-xs text-stone-300">
                  {table.capacity} {t("guests", "kişilik")}
                </span>
                {table.location && (
                  <>
                    <span className="text-stone-500">•</span>
                    <span className="text-xs text-stone-400">{table.location}</span>
                  </>
                )}
              </div>

              {/* Scan instruction - Bilingual */}
              <div className="mb-4 space-y-1">
                <p className="text-sm font-semibold text-primary">
                  Menü için QR'ı Tarayın
                </p>
                <p className="text-xs text-stone-500">
                  Scan QR for Menu
                </p>
              </div>

              {/* Download Button */}
              <Button
                variant="outline"
                size="sm"
                className="w-full bg-stone-700 border-stone-500 text-cream hover:bg-stone-600 hover:border-stone-400"
                onClick={() => downloadQRCode(table.table_number)}
              >
                <Download className="h-4 w-4 mr-2" />
                {t("Download PNG", "PNG İndir")}
              </Button>
            </CardContent>
            
            {/* Bottom accent bar */}
            <div className="h-1.5 bg-primary" />
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
