import { useState, useEffect, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Download, Printer, RefreshCw, QrCode } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

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

  const downloadQRCode = (tableNumber: string) => {
    const svg = document.getElementById(`qr-${tableNumber}`);
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = 400;
      canvas.height = 480;
      
      if (ctx) {
        // White background
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw QR code
        ctx.drawImage(img, 50, 50, 300, 300);
        
        // Add table number text
        ctx.fillStyle = "#1a1a1a";
        ctx.font = "bold 36px Arial";
        ctx.textAlign = "center";
        ctx.fillText(`Table ${tableNumber}`, canvas.width / 2, 420);
        
        ctx.font = "16px Arial";
        ctx.fillStyle = "#666666";
        ctx.fillText("Scan to Order", canvas.width / 2, 455);
      }

      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `table-${tableNumber}-qr.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
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
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; }
            .grid { 
              display: grid; 
              grid-template-columns: repeat(2, 1fr); 
              gap: 20px; 
              padding: 20px;
            }
            .qr-card {
              border: 2px solid #ddd;
              border-radius: 12px;
              padding: 24px;
              text-align: center;
              page-break-inside: avoid;
            }
            .qr-card svg { margin-bottom: 16px; }
            .table-number { font-size: 28px; font-weight: bold; margin-bottom: 4px; }
            .scan-text { font-size: 14px; color: #666; margin-bottom: 8px; }
            .url-text { font-size: 10px; color: #999; word-break: break-all; }
            @media print {
              .grid { grid-template-columns: repeat(2, 1fr); }
              .qr-card { border: 1px solid #000; }
            }
          </style>
        </head>
        <body>
          <div class="grid">
            ${tables.map(table => `
              <div class="qr-card">
                ${document.getElementById(`qr-${table.table_number}`)?.outerHTML || ''}
                <div class="table-number">Table ${table.table_number}</div>
                <div class="scan-text">Scan to Order / Sipariş için tarayın</div>
                <div class="url-text">${getOrderUrl(table.table_number)}</div>
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
          <Card key={table.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              {/* QR Code */}
              <div className="bg-white p-4 rounded-lg mb-4 inline-block">
                <QRCodeSVG
                  id={`qr-${table.table_number}`}
                  value={getOrderUrl(table.table_number)}
                  size={180}
                  level="H"
                  includeMargin
                  fgColor="#1a1a1a"
                  bgColor="#ffffff"
                />
              </div>

              {/* Table Info */}
              <h3 className="text-xl font-bold mb-1">
                {t("Table", "Masa")} {table.table_number}
              </h3>
              <p className="text-sm text-muted-foreground mb-1">
                {table.capacity} {t("seats", "kişilik")}
              </p>
              {table.location && (
                <p className="text-xs text-muted-foreground mb-3">{table.location}</p>
              )}

              {/* URL Preview */}
              <p className="text-xs text-muted-foreground bg-secondary p-2 rounded mb-4 break-all">
                {getOrderUrl(table.table_number)}
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
