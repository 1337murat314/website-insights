import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { useBranchFromSlug } from "@/contexts/BranchContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Download, 
  Printer, 
  QrCode, 
  TableProperties,
  MapPin,
  ChefHat,
  User,
  Loader2
} from "lucide-react";

interface Table {
  id: string;
  table_number: string;
  capacity: number;
}

const BranchQRCodes = () => {
  const { branch: branchSlug } = useParams();
  const { branch, isLoading: branchLoading } = useBranchFromSlug(branchSlug);
  const { t } = useLanguage();
  const [tables, setTables] = useState<Table[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const baseUrl = window.location.origin;

  useEffect(() => {
    if (!branch) return;

    const fetchTables = async () => {
      const { data } = await supabase
        .from("restaurant_tables")
        .select("id, table_number, capacity, branch_id")
        .eq("branch_id", branch.id)
        .order("table_number");

      setTables(data || []);
      setIsLoading(false);
    };

    fetchTables();
  }, [branch]);

  const downloadQR = (elementId: string, filename: string) => {
    const svg = document.getElementById(elementId);
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = filename;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  if (branchLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!branch) {
    return <div>Branch not found</div>;
  }

  return (
    <div className="space-y-6">
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {tables.map((table) => {
              const qrUrl = `${baseUrl}/order?table=${table.table_number}&branch=${branchSlug}`;
              const qrId = `qr-table-${table.table_number}`;

              return (
                <Card key={table.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-center flex items-center justify-center gap-2">
                      <TableProperties className="h-5 w-5" />
                      {t("Table", "Masa")} {table.table_number}
                    </CardTitle>
                    <Badge variant="secondary" className="w-fit mx-auto">
                      {table.capacity} {t("seats", "kişilik")}
                    </Badge>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center gap-3">
                    <div className="bg-white p-3 rounded-lg">
                      <QRCodeSVG
                        id={qrId}
                        value={qrUrl}
                        size={150}
                        level="H"
                        includeMargin
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadQR(qrId, `${branch.slug}-table-${table.table_number}.png`)}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      {t("Download", "İndir")}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="staff" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Kitchen Login QR */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ChefHat className="h-5 w-5 text-orange-500" />
                  {t("Kitchen Login", "Mutfak Girişi")}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-4">
                <div className="bg-white p-4 rounded-lg">
                  <QRCodeSVG
                    id="qr-kitchen-login"
                    value={`${baseUrl}/${branchSlug}/kitchen-login`}
                    size={200}
                    level="H"
                    includeMargin
                  />
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  {t("Scan to access kitchen display login", "Mutfak ekranı girişine erişmek için tarayın")}
                </p>
                <Button
                  variant="outline"
                  onClick={() => downloadQR("qr-kitchen-login", `${branch.slug}-kitchen-login.png`)}
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
                    value={`${baseUrl}/${branchSlug}/waiter-login`}
                    size={200}
                    level="H"
                    includeMargin
                  />
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  {t("Scan to access waiter dashboard login", "Garson paneli girişine erişmek için tarayın")}
                </p>
                <Button
                  variant="outline"
                  onClick={() => downloadQR("qr-waiter-login", `${branch.slug}-waiter-login.png`)}
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

export default BranchQRCodes;
