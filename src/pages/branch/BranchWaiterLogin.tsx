import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useBranchFromSlug } from "@/contexts/BranchContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, User, MapPin, AlertCircle, Utensils, KeyRound } from "lucide-react";
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-950 via-slate-950 to-indigo-950">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!branch) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-950 via-slate-950 to-indigo-950 p-4">
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-950 via-slate-950 to-indigo-950 p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute top-20 right-20 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 5, repeat: Infinity }}
        />
        <motion.div 
          className="absolute bottom-32 left-20 w-56 h-56 bg-indigo-500/10 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 6, repeat: Infinity }}
        />
        <motion.div 
          className="absolute top-1/3 right-1/4 w-20 h-20 bg-cyan-500/10 rounded-full blur-2xl"
          animate={{ x: [-10, 10, -10], y: [-10, 10, -10] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
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
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 mb-4"
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
          className="backdrop-blur-xl bg-slate-900/80 border border-blue-500/20 rounded-3xl shadow-2xl shadow-blue-500/10 overflow-hidden"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 backdrop-blur mb-4">
              <Utensils className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">
              {t("Waiter Portal", "Garson Portalı")}
            </h1>
            <p className="text-blue-100/80 text-sm">
              {t("Start your shift and serve with excellence", "Mesainize başlayın, mükemmel servis sunun")}
            </p>
          </div>

          {/* Form Section */}
          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <User className="h-4 w-4 text-blue-500" />
                {t("Your Name", "Adınız")}
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("Enter your name", "Adınızı girin")}
                className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20 h-12 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-blue-500" />
                {t("Access Code", "Erişim Kodu")}
              </label>
              <InputOTP maxLength={6} value={code} onChange={setCode}>
                <InputOTPGroup className="gap-2 justify-center w-full">
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <InputOTPSlot 
                      key={i} 
                      index={i} 
                      className="w-12 h-14 bg-slate-800/50 border-slate-700 text-white text-xl font-mono rounded-xl focus:border-blue-500 focus:ring-blue-500/20" 
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>
              <p className="text-xs text-slate-500 text-center mt-2">
                {t("Enter your 6-digit staff code", "6 haneli personel kodunuzu girin")}
              </p>
            </div>

            <Button
              onClick={handleLogin}
              disabled={isLoading || code.length !== 6 || !name.trim()}
              className="w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {t("Signing In...", "Giriş yapılıyor...")}
                </>
              ) : (
                <>
                  <Utensils className="mr-2 h-5 w-5" />
                  {t("Start Shift", "Mesaiye Başla")}
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
          {t("Waiter Management System", "Garson Yönetim Sistemi")}
        </motion.p>
      </motion.div>
    </div>
  );
};

export default BranchWaiterLogin;
