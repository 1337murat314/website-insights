import { useParams, Outlet } from "react-router-dom";
import { BranchProvider } from "@/contexts/BranchContext";

/**
 * Wrapper component that provides branch context for super admin viewing branch-specific pages.
 * Uses /admin/branch/:branchSlug/* routes instead of /:branch/* routes.
 */
const SuperAdminBranchWrapper = () => {
  const { branchSlug } = useParams();

  return (
    <BranchProvider branchSlugOverride={branchSlug}>
      <Outlet />
    </BranchProvider>
  );
};

export default SuperAdminBranchWrapper;
