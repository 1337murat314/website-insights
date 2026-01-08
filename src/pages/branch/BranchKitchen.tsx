import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useBranchFromSlug } from "@/contexts/BranchContext";
import { useLanguage } from "@/contexts/LanguageContext";
import AdminKDS from "@/pages/admin/AdminKDS";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LogOut, Globe, MapPin, ChefHat, Loader2, AlertCircle } from "lucide-react";

interface StaffSession {
  id: string;
  name: string;
  role: string;
  branch_id: string;
  branch_slug: string;
  branch_name: string;
  loginTime: string;
}

const BranchKitchen = () => {
  const [session, setSession] = useState<StaffSession | null>(null);
  const navigate = useNavigate();
  const { branch: branchSlug } = useParams();
  const { branch, isLoading: branchLoading } = useBranchFromSlug(branchSlug);
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    const stored = localStorage.getItem(`kitchen_session_${branchSlug}`);
    if (!stored) {
      navigate(`/${branchSlug}/kitchen-login`);
      return;
    }

    try {
      const parsed = JSON.parse(stored);
      if (parsed.branch_slug !== branchSlug) {
        localStorage.removeItem(`kitchen_session_${branchSlug}`);
        navigate(`/${branchSlug}/kitchen-login`);
        return;
      }
      setSession(parsed);
    } catch {
      localStorage.removeItem(`kitchen_session_${branchSlug}`);
      navigate(`/${branchSlug}/kitchen-login`);
    }
  }, [branchSlug, navigate]);

  const handleLogout = () => {
    localStorage.removeItem(`kitchen_session_${branchSlug}`);
    navigate(`/${branchSlug}/kitchen-login`);
  };

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "tr" : "en");
  };

  if (branchLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!branch) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Branch not found.</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-orange-500 text-white px-4 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <ChefHat className="h-6 w-6" />
          <div>
            <div className="font-semibold">{session.name}</div>
            <div className="text-xs opacity-90 flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {branch.name} Kitchen
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLanguage}
            className="text-white hover:bg-orange-600"
          >
            <Globe className="h-4 w-4 mr-1" />
            {language.toUpperCase()}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-white hover:bg-orange-600"
          >
            <LogOut className="h-4 w-4 mr-1" />
            {t("Logout", "Çıkış")}
          </Button>
        </div>
      </div>

      {/* KDS with branch filter */}
      <div className="pt-16">
        <AdminKDS branchId={branch.id} />
      </div>
    </div>
  );
};

export default BranchKitchen;
