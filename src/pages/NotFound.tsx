import { useLocation, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center px-6"
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <span className="text-8xl md:text-9xl font-bold text-primary">404</span>
        </motion.div>
        
        <h1 className="mb-4 text-2xl md:text-3xl font-serif text-foreground">
          {t("Page Not Found", "Sayfa Bulunamadı")}
        </h1>
        
        <p className="mb-6 text-muted-foreground max-w-md mx-auto">
          {t(
            "The page you're looking for doesn't exist or has been moved.",
            "Aradığınız sayfa mevcut değil veya taşınmış."
          )}
        </p>

        <p className="mb-8 text-sm text-muted-foreground">
          {t(
            `Redirecting to home in ${countdown} seconds...`,
            `${countdown} saniye içinde ana sayfaya yönlendiriliyorsunuz...`
          )}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("Go Back", "Geri Dön")}
          </Button>
          
          <Button asChild className="gap-2">
            <Link to="/">
              <Home className="w-4 h-4" />
              {t("Go Home", "Ana Sayfa")}
            </Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
