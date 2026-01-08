import { useBranch } from "@/contexts/BranchContext";
import { useLanguage } from "@/contexts/LanguageContext";
import AdminWaiter from "@/pages/admin/AdminWaiter";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { MapPin, Loader2, AlertCircle, Utensils } from "lucide-react";

/**
 * Super Admin view of branch waiter display.
 * Unlike BranchWaiter, this doesn't require staff login - super admin has full access.
 */
const SuperAdminBranchWaiter = () => {
  const { branch, isLoading, error } = useBranch();
  const { t } = useLanguage();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !branch) {
    return (
      <div className="flex items-center justify-center min-h-[400px] p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || t("Branch not found", "Şube bulunamadı")}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Branch Header */}
      <div className="flex items-center gap-3 p-4 bg-primary/10 rounded-lg">
        <Utensils className="h-6 w-6 text-primary" />
        <div className="flex-1">
          <h2 className="font-semibold">{t("Waiter Display", "Garson Ekranı")}</h2>
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {branch.name}
          </div>
        </div>
        <Badge>{t("Super Admin View", "Süper Yönetici Görünümü")}</Badge>
      </div>
      
      {/* Waiter view with branch filter */}
      <AdminWaiter branchId={branch.id} />
    </div>
  );
};

export default SuperAdminBranchWaiter;
