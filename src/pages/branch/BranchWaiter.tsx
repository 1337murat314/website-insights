import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useBranchFromSlug } from "@/contexts/BranchContext";
import { useLanguage } from "@/contexts/LanguageContext";
import AdminWaiter from "@/pages/admin/AdminWaiter";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LogOut, Globe, MapPin, User, Loader2, AlertCircle } from "lucide-react";

interface StaffSession {
  id: string;
  name: string;
  role: string;
  branch_id: string;
  branch_slug: string;
  branch_name: string;
  loginTime: string;
}

const BranchWaiter = () => {
  const [session, setSession] = useState<StaffSession | null>(null);
  const navigate = useNavigate();
  const { branch: branchSlug } = useParams();
  const { branch, isLoading: branchLoading } = useBranchFromSlug(branchSlug);
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    const stored = localStorage.getItem(`waiter_session_${branchSlug}`);
    if (!stored) {
      navigate(`/${branchSlug}/waiter-login`);
      return;
    }

    try {
      const parsed = JSON.parse(stored);
      if (parsed.branch_slug !== branchSlug) {
        localStorage.removeItem(`waiter_session_${branchSlug}`);
        navigate(`/${branchSlug}/waiter-login`);
        return;
      }
      setSession(parsed);
    } catch {
      localStorage.removeItem(`waiter_session_${branchSlug}`);
      navigate(`/${branchSlug}/waiter-login`);
    }
  }, [branchSlug, navigate]);

  const handleLogout = () => {
    localStorage.removeItem(`waiter_session_${branchSlug}`);
    navigate(`/${branchSlug}/waiter-login`);
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
      <div className="fixed top-0 left-0 right-0 z-50 bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <User className="h-6 w-6" />
          <div>
            <div className="font-semibold">{session.name}</div>
            <div className="text-xs opacity-90 flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {branch.name} Waiter
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLanguage}
            className="text-primary-foreground hover:bg-primary/80"
          >
            <Globe className="h-4 w-4 mr-1" />
            {language.toUpperCase()}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-primary-foreground hover:bg-primary/80"
          >
            <LogOut className="h-4 w-4 mr-1" />
            {t("Logout", "Çıkış")}
          </Button>
        </div>
      </div>

      {/* Waiter view with branch filter */}
      <div className="pt-16">
        <AdminWaiter branchId={branch.id} />
      </div>
    </div>
  );
};

export default BranchWaiter;
