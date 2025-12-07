import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Utensils, KeyRound, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

const WaiterLogin = () => {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleLogin = async () => {
    if (!name.trim() || code.length !== 6) {
      toast.error(t("Please enter name and 6-digit code", "Lütfen isim ve 6 haneli kodu girin"));
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("staff_logins")
        .select("*")
        .eq("name", name.trim())
        .eq("code", code)
        .eq("role", "waiter")
        .eq("is_active", true)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        toast.error(t("Invalid credentials", "Geçersiz kimlik bilgileri"));
        return;
      }

      // Store staff session
      sessionStorage.setItem("staffSession", JSON.stringify({
        id: data.id,
        name: data.name,
        role: data.role,
        loginTime: new Date().toISOString()
      }));

      toast.success(t("Welcome!", "Hoş Geldiniz!"));
      navigate("/waiter");
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(t("Login failed", "Giriş başarısız"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="bg-card rounded-3xl p-8 shadow-2xl border border-border">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Utensils className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">{t("Waiter Login", "Garson Girişi")}</h1>
            <p className="text-muted-foreground mt-1">
              {t("Enter your credentials", "Bilgilerinizi girin")}
            </p>
          </div>

          {/* Form */}
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                {t("Name", "İsim")}
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("Enter your name", "İsminizi girin")}
                className="h-12 text-lg"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <KeyRound className="w-4 h-4" />
                {t("6-Digit Code", "6 Haneli Kod")}
              </Label>
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={code}
                  onChange={(value) => setCode(value)}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} className="w-12 h-14 text-2xl" />
                    <InputOTPSlot index={1} className="w-12 h-14 text-2xl" />
                    <InputOTPSlot index={2} className="w-12 h-14 text-2xl" />
                    <InputOTPSlot index={3} className="w-12 h-14 text-2xl" />
                    <InputOTPSlot index={4} className="w-12 h-14 text-2xl" />
                    <InputOTPSlot index={5} className="w-12 h-14 text-2xl" />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>

            <Button
              onClick={handleLogin}
              disabled={isLoading || !name.trim() || code.length !== 6}
              className="w-full h-14 text-lg font-bold"
            >
              {isLoading ? t("Logging in...", "Giriş yapılıyor...") : t("Start Shift", "Vardiyaya Başla")}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default WaiterLogin;
