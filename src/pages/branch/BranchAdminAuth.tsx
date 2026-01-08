import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useBranchFromSlug } from "@/contexts/BranchContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, MapPin, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import logoLight from "@/assets/logo-light.png";

const BranchAdminAuth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, signIn, isLoading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { branch: branchSlug } = useParams();
  const { branch, isLoading: branchLoading } = useBranchFromSlug(branchSlug);

  useEffect(() => {
    if (!isLoading && user) {
      navigate(`/${branchSlug}/admin`);
    }
  }, [user, isLoading, navigate, branchSlug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const { error } = await signIn(email, password);
      if (error) {
        setError(error.message);
      } else {
        navigate(`/${branchSlug}/admin`);
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || branchLoading) {
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
            Branch "{branchSlug}" not found. Please check the URL.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <img src={logoLight} alt="Logo" className="h-16 mx-auto mb-4" />
            <div className="flex items-center justify-center gap-2 text-primary mb-2">
              <MapPin className="h-5 w-5" />
              <span className="font-semibold">{branch.name}</span>
            </div>
            <CardTitle className="text-2xl">{t("Branch Admin", "Şube Yönetimi")}</CardTitle>
            <CardDescription>
              {t("Sign in to manage", "Yönetmek için giriş yapın")} {branch.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">{t("Email", "E-posta")}</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@restaurant.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t("Password", "Şifre")}</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("Signing in...", "Giriş yapılıyor...")}
                  </>
                ) : (
                  t("Sign In", "Giriş Yap")
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default BranchAdminAuth;
