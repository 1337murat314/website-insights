import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useBranchFromSlug } from "@/contexts/BranchContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, ChefHat, MapPin, AlertCircle, Flame, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import logoLight from "@/assets/logo-light.png";

const BranchKitchenLogin = () => {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { branch: branchSlug } = useParams();
  const { branch, isLoading: branchLoading } = useBranchFromSlug(branchSlug);
  const { t } = useLanguage();

  useEffect(() => {
    const session = localStorage.getItem(`kitchen_session_${branchSlug}`);
    if (session) {
      try {
        const parsed = JSON.parse(session);
        if (parsed.branch_slug === branchSlug) {
          navigate(`/${branchSlug}/kitchen`);
        }
      } catch {
        localStorage.removeItem(`kitchen_session_${branchSlug}`);
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
        staff_role: "kitchen",
        staff_branch_slug: branchSlug,
      });

      if (error || !data) {
        toast.error(t("Invalid credentials or not authorized for this branch", "Geçersiz bilgiler veya bu şube için yetkiniz yok"));
        setIsLoading(false);
        return;
      }

      const sessionData = typeof data === 'object' ? data : { id: data };
      localStorage.setItem(
        `kitchen_session_${branchSlug}`,
        JSON.stringify({
          ...sessionData,
          loginTime: new Date().toISOString(),
        })
      );

      toast.success(t("Welcome to kitchen!", "Mutfağa hoş geldiniz!"));
      navigate(`/${branchSlug}/kitchen`);
    } catch (err) {
      toast.error(t("Login failed", "Giriş başarısız"));
    } finally {
      setIsLoading(false);
    }
  };

  if (branchLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-950 via-stone-950 to-red-950">
        <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!branch) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-950 via-stone-950 to-red-950 p-4">
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-950 via-stone-950 to-red-950 p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute top-20 left-10 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div 
          className="absolute bottom-20 right-10 w-48 h-48 bg-red-500/10 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 5, repeat: Infinity }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/4 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl"
          animate={{ y: [-20, 20, -20] }}
          transition={{ duration: 6, repeat: Infinity }}
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
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/20 border border-orange-500/30 text-orange-400 mb-4"
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
          className="backdrop-blur-xl bg-stone-900/80 border border-orange-500/20 rounded-3xl shadow-2xl shadow-orange-500/10 overflow-hidden"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {/* Header Section */}
          <div className="bg-gradient-to-r from-orange-600 to-red-600 p-6 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 backdrop-blur mb-4">
              <ChefHat className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">
              {t("Kitchen Display", "Mutfak Ekranı")}
            </h1>
            <p className="text-orange-100/80 text-sm">
              {t("Access your kitchen dashboard", "Mutfak panelinize erişin")}
            </p>
          </div>

          {/* Form Section */}
          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-300 flex items-center gap-2">
                <ChefHat className="h-4 w-4 text-orange-500" />
                {t("Your Name", "Adınız")}
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("Enter your name", "Adınızı girin")}
                className="bg-stone-800/50 border-stone-700 text-white placeholder:text-stone-500 focus:border-orange-500 focus:ring-orange-500/20 h-12 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-300 flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-500" />
                {t("Access Code", "Erişim Kodu")}
              </label>
              <InputOTP maxLength={6} value={code} onChange={setCode}>
                <InputOTPGroup className="gap-2 justify-center w-full">
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <InputOTPSlot 
                      key={i} 
                      index={i} 
                      className="w-12 h-14 bg-stone-800/50 border-stone-700 text-white text-xl font-mono rounded-xl focus:border-orange-500 focus:ring-orange-500/20" 
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>
              <p className="text-xs text-stone-500 text-center mt-2">
                {t("Enter your 6-digit staff code", "6 haneli personel kodunuzu girin")}
              </p>
            </div>

            <Button
              onClick={handleLogin}
              disabled={isLoading || code.length !== 6 || !name.trim()}
              className="w-full h-14 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {t("Signing In...", "Giriş yapılıyor...")}
                </>
              ) : (
                <>
                  <Flame className="mr-2 h-5 w-5" />
                  {t("Enter Kitchen", "Mutfağa Gir")}
                </>
              )}
            </Button>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.p 
          className="text-center text-stone-600 text-sm mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {t("Kitchen Display System", "Mutfak Ekran Sistemi")}
        </motion.p>
      </motion.div>
    </div>
  );
};

export default BranchKitchenLogin;
