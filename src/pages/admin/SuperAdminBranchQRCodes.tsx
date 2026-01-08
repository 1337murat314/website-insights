import { useState, useEffect, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useBranch } from "@/contexts/BranchContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Download, 
  Printer, 
  QrCode, 
  TableProperties,
  MapPin,
  ChefHat,
  User,
  Loader2,
  AlertCircle,
  Shield,
  RefreshCw
} from "lucide-react";
import logoImage from "@/assets/logo.png";
import { toast } from "sonner";

interface Table {
  id: string;
  table_number: string;
  capacity: number;
  location: string | null;
}

/**
 * Super Admin version of Branch QR Codes.
 * Uses BranchContext (provided by SuperAdminBranchWrapper) instead of URL params.
 */
const SuperAdminBranchQRCodes = () => {
  const { branch, isLoading: branchLoading, error: branchError } = useBranch();
  const { t } = useLanguage();
  const [tables, setTables] = useState<Table[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const printRef = useRef<HTMLDivElement>(null);

  const baseUrl = window.location.origin;

  useEffect(() => {
    if (!branch) return;

    const fetchTables = async () => {
      const { data, error } = await supabase
        .from("restaurant_tables")
        .select("id, table_number, capacity, location")
        .eq("branch_id", branch.id)
        .order("table_number");

      if (error) {
        console.error("Error fetching tables:", error);
        toast.error(t("Failed to load tables", "Masalar yüklenemedi"));
      } else {
        setTables(data || []);
      }
      setIsLoading(false);
    };

    fetchTables();
  }, [branch]);

  const getOrderUrl = (tableNumber: string) => {
    return `${baseUrl}/order?table=${tableNumber}&branch=${branch?.slug}`;
  };

  const downloadQRCode = async (tableNumber: string, type: "table" | "kitchen" | "waiter" | "admin" = "table") => {
    let elementId: string;
    let filename: string;
    
    switch (type) {
      case "kitchen":
        elementId = "qr-kitchen-login";
        filename = `${branch?.slug}-kitchen-login.png`;
        break;
      case "waiter":
        elementId = "qr-waiter-login";
        filename = `${branch?.slug}-waiter-login.png`;
        break;
      case "admin":
        elementId = "qr-admin-login";
        filename = `${branch?.slug}-admin-login.png`;
        break;
      default:
        elementId = `qr-table-${tableNumber}`;
        filename = `${branch?.slug}-table-${tableNumber}.png`;
    }

    const svg = document.getElementById(elementId);
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

      canvas.width = 500;
      canvas.height = 650;
      
      if (ctx) {
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, "#1C1917");
        gradient.addColorStop(1, "#292524");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "#E07A5F";
        ctx.fillRect(0, 0, canvas.width, 10);

        const logoWidth = 160;
        const logoHeight = 55;
        ctx.drawImage(logoImg, (canvas.width - logoWidth) / 2, 30, logoWidth, logoHeight);

        ctx.strokeStyle = "#E07A5F";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(80, 105);
        ctx.lineTo(canvas.width - 80, 105);
        ctx.stroke();

        ctx.fillStyle = "#FFFFFF";
        const qrSize = 320;
        const qrContainerX = (canvas.width - qrSize) / 2;
        const qrContainerY = 125;
        ctx.beginPath();
        ctx.roundRect(qrContainerX, qrContainerY, qrSize, qrSize, 20);
        ctx.fill();
        
        const qrPadding = 20;
        const qrDrawSize = qrSize - (qrPadding * 2);
        ctx.drawImage(qrImg, qrContainerX + qrPadding, qrContainerY + qrPadding, qrDrawSize, qrDrawSize);

        ctx.fillStyle = "#F5E6D3";
        ctx.font = "bold 36px Georgia, serif";
        ctx.textAlign = "center";
        
        if (type === "table") {
          ctx.fillText(`MASA ${tableNumber}`, canvas.width / 2, 510);
          ctx.fillStyle = "#A8A29E";
          ctx.font = "18px Arial, sans-serif";
          ctx.fillText(`TABLE ${tableNumber}`, canvas.width / 2, 540);
        } else {
          const labels: Record<string, { tr: string; en: string }> = {
            kitchen: { tr: "MUTFAK GİRİŞİ", en: "Kitchen Login" },
            waiter: { tr: "GARSON GİRİŞİ", en: "Waiter Login" },
            admin: { tr: "YÖNETİCİ GİRİŞİ", en: "Admin Login" }
          };
          ctx.fillText(labels[type].tr, canvas.width / 2, 510);
          ctx.fillStyle = "#A8A29E";
          ctx.font = "18px Arial, sans-serif";
          ctx.fillText(labels[type].en, canvas.width / 2, 540);
        }

        // Branch name
        ctx.font = "bold 16px Arial, sans-serif";
        ctx.fillStyle = "#E07A5F";
        ctx.fillText(branch?.name || "", canvas.width / 2, 585);
        
        ctx.font = "14px Arial, sans-serif";
        ctx.fillStyle = "#78716C";
        ctx.fillText(type === "table" ? "Scan QR for Menu" : "Scan to Login", canvas.width / 2, 608);

        ctx.fillStyle = "#E07A5F";
        ctx.fillRect(0, canvas.height - 10, canvas.width, 10);
      }

      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = filename;
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
          <title>${branch?.name} - Table QR Codes</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&display=swap');
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px; }
            .header { text-align: center; margin-bottom: 20px; }
            .header h1 { font-size: 24px; color: #1C1917; }
            .header p { color: #78716C; }
            .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
            .qr-card {
              background: linear-gradient(180deg, #1C1917 0%, #292524 100%);
              border-radius: 20px;
              padding: 28px 24px;
              text-align: center;
              page-break-inside: avoid;
              border-top: 6px solid #E07A5F;
              border-bottom: 6px solid #E07A5F;
            }
            .qr-wrapper { background: #ffffff; border-radius: 16px; padding: 16px; display: inline-block; margin-bottom: 16px; }
            .qr-card svg { display: block; }
            .table-number-tr { font-family: 'Playfair Display', Georgia, serif; font-size: 36px; font-weight: 700; color: #F5E6D3; margin-bottom: 4px; }
            .table-number-en { font-size: 14px; color: #A8A29E; margin-bottom: 16px; }
            .branch-name { font-size: 12px; color: #E07A5F; margin-bottom: 8px; }
            .scan-text { font-size: 11px; color: #78716C; }
            @media print { body { background: white; padding: 10px; } .grid { gap: 15px; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${branch?.name}</h1>
            <p>Table QR Codes</p>
          </div>
          <div class="grid">
            ${tables.map(table => `
              <div class="qr-card">
                <div class="qr-wrapper">
                  ${document.getElementById(`qr-table-${table.table_number}`)?.outerHTML || ''}
                </div>
                <div class="table-number-tr">MASA ${table.table_number}</div>
                <div class="table-number-en">TABLE ${table.table_number}</div>
                <div class="branch-name">${branch?.name}</div>
                <div class="scan-text">Scan QR for Menu</div>
              </div>
            `).join('')}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  if (branchLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (branchError || !branch) {
    return (
      <div className="flex items-center justify-center min-h-[400px] p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{branchError || t("Branch not found", "Şube bulunamadı")}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <QrCode className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">{t("QR Codes", "QR Kodları")}</h1>
            <p className="text-muted-foreground flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {branch.name}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-1" />
            {t("Refresh", "Yenile")}
          </Button>
          {tables.length > 0 && (
            <Button size="sm" onClick={printAllQRCodes}>
              <Printer className="h-4 w-4 mr-1" />
              {t("Print All", "Tümünü Yazdır")}
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="tables">
        <TabsList>
          <TabsTrigger value="tables" className="gap-2">
            <TableProperties className="h-4 w-4" />
            {t("Table QRs", "Masa QR'ları")}
          </TabsTrigger>
          <TabsTrigger value="staff" className="gap-2">
            <User className="h-4 w-4" />
            {t("Staff Login QRs", "Personel Giriş QR'ları")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tables" className="mt-6">
          {tables.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-8 text-center">
                <TableProperties className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-medium mb-2">{t("No tables found", "Masa bulunamadı")}</h3>
                <p className="text-sm text-muted-foreground">
                  {t("Add tables in the Tables section first", "Önce Masalar bölümünden masa ekleyin")}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div ref={printRef} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {tables.map((table) => (
                <Card key={table.id} className="overflow-hidden bg-gradient-to-b from-stone-900 to-stone-800 border-0">
                  <div className="h-1 bg-primary" />
                  <CardContent className="p-4 text-center">
                    <div className="bg-white p-3 rounded-lg mb-3 inline-block">
                      <QRCodeSVG
                        id={`qr-table-${table.table_number}`}
                        value={getOrderUrl(table.table_number)}
                        size={120}
                        level="H"
                        includeMargin={false}
                      />
                    </div>
                    <h3 className="text-xl font-serif font-bold text-cream">
                      {t("Table", "Masa")} {table.table_number}
                    </h3>
                    <p className="text-xs text-stone-400 mb-2">
                      {table.capacity} {t("seats", "kişilik")}
                      {table.location && ` • ${table.location}`}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full bg-stone-700 border-stone-600 text-cream hover:bg-stone-600"
                      onClick={() => downloadQRCode(table.table_number, "table")}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      {t("Download", "İndir")}
                    </Button>
                  </CardContent>
                  <div className="h-1 bg-primary" />
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="staff" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Branch Admin Login QR */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-purple-500" />
                  {t("Branch Admin Login", "Şube Yönetici Girişi")}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-4">
                <div className="bg-white p-4 rounded-lg">
                  <QRCodeSVG
                    id="qr-admin-login"
                    value={`${baseUrl}/${branch.slug}/admin`}
                    size={180}
                    level="H"
                    includeMargin
                  />
                </div>
                <code className="text-xs bg-muted px-2 py-1 rounded">
                  /{branch.slug}/admin
                </code>
                <Button
                  variant="outline"
                  onClick={() => downloadQRCode("", "admin")}
                >
                  <Download className="h-4 w-4 mr-2" />
                  {t("Download", "İndir")}
                </Button>
              </CardContent>
            </Card>

            {/* Kitchen Login QR */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ChefHat className="h-5 w-5 text-amber-500" />
                  {t("Kitchen Login", "Mutfak Girişi")}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-4">
                <div className="bg-white p-4 rounded-lg">
                  <QRCodeSVG
                    id="qr-kitchen-login"
                    value={`${baseUrl}/${branch.slug}/kitchen-login`}
                    size={180}
                    level="H"
                    includeMargin
                  />
                </div>
                <code className="text-xs bg-muted px-2 py-1 rounded">
                  /{branch.slug}/kitchen-login
                </code>
                <Button
                  variant="outline"
                  onClick={() => downloadQRCode("", "kitchen")}
                >
                  <Download className="h-4 w-4 mr-2" />
                  {t("Download", "İndir")}
                </Button>
              </CardContent>
            </Card>

            {/* Waiter Login QR */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-500" />
                  {t("Waiter Login", "Garson Girişi")}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-4">
                <div className="bg-white p-4 rounded-lg">
                  <QRCodeSVG
                    id="qr-waiter-login"
                    value={`${baseUrl}/${branch.slug}/waiter-login`}
                    size={180}
                    level="H"
                    includeMargin
                  />
                </div>
                <code className="text-xs bg-muted px-2 py-1 rounded">
                  /{branch.slug}/waiter-login
                </code>
                <Button
                  variant="outline"
                  onClick={() => downloadQRCode("", "waiter")}
                >
                  <Download className="h-4 w-4 mr-2" />
                  {t("Download", "İndir")}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SuperAdminBranchQRCodes;
