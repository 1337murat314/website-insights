import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useBranchFromSlug } from "@/contexts/BranchContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, User, MapPin, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import logoLight from "@/assets/logo-light.png";

const BranchWaiterLogin = () => {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { branch: branchSlug } = useParams();
  const { branch, isLoading: branchLoading } = useBranchFromSlug(branchSlug);
  const { t } = useLanguage();

  useEffect(() => {
    // Check if already logged in for this branch
    const session = localStorage.getItem(`waiter_session_${branchSlug}`);
    if (session) {
      try {
        const parsed = JSON.parse(session);
        if (parsed.branch_slug === branchSlug) {
          navigate(`/${branchSlug}/waiter`);
        }
      } catch {
        localStorage.removeItem(`waiter_session_${branchSlug}`);
      }
    }
  }, [branchSlug, navigate]);

  const handleLogin = async () => {
    if (!name.trim() || code.length !== 6) {
      toast.error(t("Please enter your name and 6-digit code", "Lütfen adınızı ve 6 haneli kodu girin"));
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc("verify_staff_login_by_slug", {
        staff_name: name.trim(),
        staff_code: code,
        staff_role: "waiter",
        staff_branch_slug: branchSlug,
      });

      if (error || !data) {
        toast.error(t("Invalid credentials or not authorized for this branch", "Geçersiz bilgiler veya bu şube için yetkiniz yok"));
        setIsLoading(false);
        return;
      }

      // Store session with branch info
      const sessionData = typeof data === 'object' ? data : { id: data };
      localStorage.setItem(
        `waiter_session_${branchSlug}`,
        JSON.stringify({
          ...sessionData,
          loginTime: new Date().toISOString(),
        })
      );

      toast.success(t("Welcome!", "Hoş geldiniz!"));
      navigate(`/${branchSlug}/waiter`);
    } catch (err) {
      toast.error(t("Login failed", "Giriş başarısız"));
    } finally {
      setIsLoading(false);
    }
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
          <AlertDescription>
            Branch "{branchSlug}" not found.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-background to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <img src={logoLight} alt="Logo" className="h-12 mx-auto mb-4" />
            <div className="flex items-center justify-center gap-2 text-blue-600 mb-2">
              <MapPin className="h-4 w-4" />
              <span className="font-medium">{branch.name}</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <User className="h-8 w-8 text-blue-500" />
              <CardTitle className="text-2xl">{t("Waiter Login", "Garson Girişi")}</CardTitle>
            </div>
            <CardDescription>
              {t("Enter your credentials to start your shift", "Mesainize başlamak için bilgilerinizi girin")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("Your Name", "Adınız")}</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("Enter your name", "Adınızı girin")}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("6-Digit Code", "6 Haneli Kod")}</label>
              <InputOTP maxLength={6} value={code} onChange={setCode}>
                <InputOTPGroup className="gap-2 justify-center w-full">
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <InputOTPSlot key={i} index={i} className="w-12 h-12" />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>
            <Button
              onClick={handleLogin}
              disabled={isLoading || code.length !== 6}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("Logging in...", "Giriş yapılıyor...")}
                </>
              ) : (
                t("Start Shift", "Mesaiye Başla")
              )}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default BranchWaiterLogin;
