import { useEffect, useState } from "react";
import { useNavigate, Outlet, useLocation, useParams } from "react-router-dom";
import { useBranch, BranchProvider } from "@/contexts/BranchContext";
import BranchAdminSidebar from "./BranchAdminSidebar";
import { Loader2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Alert, AlertDescription } from "@/components/ui/alert";

const pageVariants = {
  initial: { opacity: 0, x: 20 },
  enter: { opacity: 1, x: 0, transition: { duration: 0.3, ease: "easeOut" as const } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.2, ease: "easeIn" as const } },
};

interface StaffSession {
  id: string;
  name: string;
  role: string;
  branch_id: string;
  branch_slug: string;
  loginTime: string;
}

const BranchAdminContent = () => {
  const { branch, isLoading: branchLoading, error } = useBranch();
  const [session, setSession] = useState<StaffSession | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { branch: branchSlug } = useParams();

  useEffect(() => {
    // Check for branch admin session
    const storedSession = localStorage.getItem(`branch_admin_session_${branchSlug}`);
    if (storedSession) {
      try {
        const parsed = JSON.parse(storedSession);
        if (parsed.branch_slug === branchSlug) {
          setSession(parsed);
        } else {
          localStorage.removeItem(`branch_admin_session_${branchSlug}`);
          navigate(`/${branchSlug}/admin`);
        }
      } catch {
        localStorage.removeItem(`branch_admin_session_${branchSlug}`);
        navigate(`/${branchSlug}/admin`);
      }
    } else {
      navigate(`/${branchSlug}/admin`);
    }
    setIsChecking(false);
  }, [branchSlug, navigate]);

  if (isChecking || branchLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !branch) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error || "Branch not found"}. Please check the URL or contact support.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex w-full bg-background">
      <BranchAdminSidebar session={session} />
      <main className="flex-1 p-4 lg:p-8 overflow-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial="initial"
            animate="enter"
            exit="exit"
            variants={pageVariants}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

const BranchAdminLayout = () => {
  return (
    <BranchProvider>
      <BranchAdminContent />
    </BranchProvider>
  );
};

export default BranchAdminLayout;
