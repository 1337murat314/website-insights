import { useBranch } from "@/contexts/BranchContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, AlertTriangle } from "lucide-react";
import AdminOrders from "@/pages/admin/AdminOrders";

const BranchOrders = () => {
  const { branch } = useBranch();
  const { t } = useLanguage();

  return (
    <div className="space-y-4">
      {branch && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="py-3 flex items-center gap-3">
            <MapPin className="h-5 w-5 text-primary" />
            <span className="font-medium">{branch.name}</span>
            <Badge variant="secondary">{t("Branch View", "Şube Görünümü")}</Badge>
          </CardContent>
        </Card>
      )}
      <AdminOrders />
    </div>
  );
};

export default BranchOrders;
