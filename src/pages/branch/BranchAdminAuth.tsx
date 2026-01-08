import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useBranchFromSlug } from "@/contexts/BranchContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Shield, MapPin, AlertCircle, Lock, Building2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import logoLight from "@/assets/logo-light.png";

const BranchAdminAuth = () => {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { branch: branchSlug } = useParams();
  const { branch, isLoading: branchLoading } = useBranchFromSlug(branchSlug);
  const { t } = useLanguage();

  useEffect(() => {
    const session = localStorage.getItem(`branch_admin_session_${branchSlug}`);
    if (session) {
      try {
        const parsed = JSON.parse(session);
        if (parsed.branch_slug === branchSlug) {
          navigate(`/${branchSlug}/admin/dashboard`);
        }
      } catch {
        localStorage.removeItem(`branch_admin_session_${branchSlug}`);
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
        staff_role: "branch_admin",
        staff_branch_slug: branchSlug,
      });

      if (error || !data) {
        toast.error(t("Invalid credentials or not authorized for this branch", "Geçersiz bilgiler veya bu şube için yetkiniz yok"));
        setIsLoading(false);
        return;
      }

      const sessionData = typeof data === 'object' && data !== null ? data : { id: data };
      localStorage.setItem(
        `branch_admin_session_${branchSlug}`,
        JSON.stringify({
          ...sessionData,
          branch_slug: branchSlug,
          loginTime: new Date().toISOString(),
        })
      );

      toast.success(t("Welcome, Branch Admin!", "Hoş geldiniz, Şube Yöneticisi!"));
      navigate(`/${branchSlug}/admin/dashboard`);
    } catch (err) {
      toast.error(t("Login failed", "Giriş başarısız"));
    } finally {
      setIsLoading(false);
    }
  };

  if (branchLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-950 via-slate-950 to-violet-950">
        <Loader2 className="h-10 w-10 animate-spin text-purple-500" />
      </div>
    );
  }

  if (!branch) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-950 via-slate-950 to-violet-950 p-4">
        <Alert variant="destructive" className="max-w-md bg-red-950/50 border-red-800">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-200">
            Branch "{branchSlug}" not found.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-950 via-slate-950 to-violet-950 p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute top-10 left-20 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 5, repeat: Infinity }}
        />
        <motion.div 
          className="absolute bottom-20 right-20 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 6, repeat: Infinity }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/3 w-32 h-32 bg-fuchsia-500/10 rounded-full blur-2xl"
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgxMjgsOTAsMjEzLDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-50" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <motion.img 
            src={logoLight} 
            alt="Logo" 
            className="h-16 mx-auto mb-6 drop-shadow-2xl"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
          />
          <motion.div 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-400 mb-4"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <MapPin className="h-4 w-4" />
            <span className="font-medium">{branch.name}</span>
          </motion.div>
        </div>

        {/* Main Card */}
        <motion.div 
          className="backdrop-blur-xl bg-slate-900/80 border border-purple-500/20 rounded-3xl shadow-2xl shadow-purple-500/10 overflow-hidden"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {/* Header Section */}
          <div className="bg-gradient-to-r from-purple-600 to-violet-600 p-6 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPjwvc3ZnPg==')] opacity-50" />
            <div className="relative">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 backdrop-blur mb-4">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-1">
                {t("Branch Admin", "Şube Yöneticisi")}
              </h1>
              <p className="text-purple-100/80 text-sm">
                {t("Secure access to branch management", "Şube yönetimine güvenli erişim")}
              </p>
            </div>
          </div>

          {/* Form Section */}
          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-purple-500" />
                {t("Administrator Name", "Yönetici Adı")}
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("Enter your name", "Adınızı girin")}
                className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-purple-500 focus:ring-purple-500/20 h-12 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <Lock className="h-4 w-4 text-purple-500" />
                {t("Security Code", "Güvenlik Kodu")}
              </label>
              <InputOTP maxLength={6} value={code} onChange={setCode}>
                <InputOTPGroup className="gap-2 justify-center w-full">
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <InputOTPSlot 
                      key={i} 
                      index={i} 
                      className="w-12 h-14 bg-slate-800/50 border-slate-700 text-white text-xl font-mono rounded-xl focus:border-purple-500 focus:ring-purple-500/20" 
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>
              <p className="text-xs text-slate-500 text-center mt-2">
                {t("Enter your 6-digit admin code", "6 haneli yönetici kodunuzu girin")}
              </p>
            </div>

            <Button
              onClick={handleLogin}
              disabled={isLoading || code.length !== 6 || !name.trim()}
              className="w-full h-14 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {t("Authenticating...", "Doğrulanıyor...")}
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-5 w-5" />
                  {t("Access Admin Panel", "Yönetim Paneline Gir")}
                </>
              )}
            </Button>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.p 
          className="text-center text-slate-600 text-sm mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {t("Branch Management System", "Şube Yönetim Sistemi")}
        </motion.p>
      </motion.div>
    </div>
  );
};

export default BranchAdminAuth;
