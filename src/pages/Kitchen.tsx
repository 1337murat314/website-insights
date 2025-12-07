import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, User, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import AdminKDS from "@/pages/admin/AdminKDS";

interface StaffSession {
  id: string;
  name: string;
  role: string;
  loginTime: string;
}

const Kitchen = () => {
  const [staffSession, setStaffSession] = useState<StaffSession | null>(null);
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();

  useEffect(() => {
    const session = localStorage.getItem("staffSession");
    if (!session) {
      navigate("/kitchen-login");
      return;
    }

    const parsed = JSON.parse(session) as StaffSession;
    if (parsed.role !== "kitchen") {
      navigate("/kitchen-login");
      return;
    }

    setStaffSession(parsed);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("staffSession");
    navigate("/kitchen-login");
  };

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "tr" : "en");
  };

  if (!staffSession) return null;

  return (
    <div className="relative">
      {/* Staff Info Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur border-b border-border px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium">{staffSession.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={toggleLanguage} className="gap-1">
            <Globe className="w-4 h-4" />
            {language === "en" ? "TR" : "EN"}
          </Button>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            {t("Logout", "Çıkış")}
          </Button>
        </div>
      </div>
      
      {/* KDS Content with padding for staff bar */}
      <div className="pt-12">
        <AdminKDS />
      </div>
    </div>
  );
};

export default Kitchen;
