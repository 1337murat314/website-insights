import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface Branch {
  id: string;
  name: string;
  name_tr: string | null;
  slug: string;
  address: string | null;
  phone: string | null;
  hours: string | null;
}

interface BranchContextType {
  branch: Branch | null;
  branchId: string | null;
  branchSlug: string | null;
  isLoading: boolean;
  error: string | null;
  allBranches: Branch[];
}

const BranchContext = createContext<BranchContextType | undefined>(undefined);

export const BranchProvider = ({ children }: { children: ReactNode }) => {
  const { branch: branchSlug } = useParams<{ branch: string }>();
  const [branch, setBranch] = useState<Branch | null>(null);
  const [allBranches, setAllBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBranches = async () => {
      const { data, error: fetchError } = await supabase
        .from("branches")
        .select("id, name, name_tr, slug, address, phone, hours")
        .eq("is_active", true)
        .order("sort_order");

      if (fetchError) {
        setError("Failed to load branches");
        setIsLoading(false);
        return;
      }

      setAllBranches(data || []);

      if (branchSlug) {
        const currentBranch = data?.find((b) => b.slug === branchSlug);
        if (currentBranch) {
          setBranch(currentBranch);
          setError(null);
        } else {
          setError(`Branch "${branchSlug}" not found`);
          setBranch(null);
        }
      }

      setIsLoading(false);
    };

    fetchBranches();
  }, [branchSlug]);

  return (
    <BranchContext.Provider
      value={{
        branch,
        branchId: branch?.id || null,
        branchSlug: branch?.slug || branchSlug || null,
        isLoading,
        error,
        allBranches,
      }}
    >
      {children}
    </BranchContext.Provider>
  );
};

export const useBranch = () => {
  const context = useContext(BranchContext);
  if (!context) {
    throw new Error("useBranch must be used within a BranchProvider");
  }
  return context;
};

// Hook for components that need branch but are outside BranchProvider
export const useBranchFromSlug = (slug: string | undefined) => {
  const [branch, setBranch] = useState<Branch | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!slug) {
      setIsLoading(false);
      return;
    }

    const fetchBranch = async () => {
      const { data } = await supabase
        .from("branches")
        .select("id, name, name_tr, slug, address, phone, hours")
        .eq("slug", slug)
        .eq("is_active", true)
        .single();

      setBranch(data);
      setIsLoading(false);
    };

    fetchBranch();
  }, [slug]);

  return { branch, isLoading };
};
