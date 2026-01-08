import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useBranch } from "@/contexts/BranchContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Plus,
  ChefHat,
  Utensils,
  Edit,
  Trash2,
  RefreshCw,
  KeyRound,
  Copy,
  Check,
  Shield,
  MapPin,
  Loader2,
  AlertCircle,
  Users
} from "lucide-react";

interface StaffLogin {
  id: string;
  name: string;
  code: string;
  role: string;
  is_active: boolean;
  created_at: string;
  branch_id: string | null;
}

/**
 * Super Admin view of branch-specific staff.
 * Shows staff logins for the selected branch with full CRUD capabilities.
 */
const SuperAdminBranchStaff = () => {
  const { branch, branchId, isLoading: branchLoading, error: branchError } = useBranch();
  const { t, language } = useLanguage();
  const [staffLogins, setStaffLogins] = useState<StaffLogin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffLogin | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    role: "waiter" as string,
    is_active: true,
  });

  const fetchStaff = async () => {
    if (!branchId) return;
    
    setIsLoading(true);
    const { data, error } = await supabase
      .from("staff_logins")
      .select("*")
      .eq("branch_id", branchId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching staff:", error);
      toast.error(t("Failed to load staff", "Personel yüklenemedi"));
    } else {
      setStaffLogins(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (branchId) {
      fetchStaff();
    }
  }, [branchId]);

  const generateCode = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setFormData({ ...formData, code });
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error(t("Name is required", "İsim gerekli"));
      return;
    }

    if (formData.code.length !== 6 || !/^\d+$/.test(formData.code)) {
      toast.error(t("Code must be 6 digits", "Kod 6 haneli olmalı"));
      return;
    }

    const staffData = {
      name: formData.name.trim(),
      code: formData.code,
      role: formData.role,
      is_active: formData.is_active,
      branch_id: branchId
    };

    if (editingStaff) {
      const { error } = await supabase
        .from("staff_logins")
        .update(staffData)
        .eq("id", editingStaff.id);

      if (error) {
        if (error.code === "23505") {
          toast.error(t("Code already exists", "Bu kod zaten kullanılıyor"));
        } else {
          toast.error(error.message);
        }
        return;
      }
    } else {
      const { error } = await supabase
        .from("staff_logins")
        .insert(staffData);

      if (error) {
        if (error.code === "23505") {
          toast.error(t("Code already exists", "Bu kod zaten kullanılıyor"));
        } else {
          toast.error(error.message);
        }
        return;
      }
    }

    toast.success(t("Staff login saved", "Personel girişi kaydedildi"));
    setShowDialog(false);
    setEditingStaff(null);
    setFormData({ name: "", code: "", role: "waiter", is_active: true });
    fetchStaff();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("staff_logins")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(t("Staff login deleted", "Personel girişi silindi"));
      fetchStaff();
    }
    setDeleteConfirm(null);
  };

  const handleEdit = (staff: StaffLogin) => {
    setEditingStaff(staff);
    setFormData({
      name: staff.name,
      code: staff.code,
      role: staff.role,
      is_active: staff.is_active,
    });
    setShowDialog(true);
  };

  const handleAddNew = () => {
    setEditingStaff(null);
    setFormData({ name: "", code: "", role: "waiter", is_active: true });
    generateCode();
    setShowDialog(true);
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "kitchen": return <ChefHat className="w-5 h-5 text-amber-600" />;
      case "waiter": return <Utensils className="w-5 h-5 text-primary" />;
      case "branch_admin": return <Shield className="w-5 h-5 text-purple-600" />;
      default: return <Utensils className="w-5 h-5" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "kitchen": return "bg-amber-500/20";
      case "waiter": return "bg-primary/20";
      case "branch_admin": return "bg-purple-500/20";
      default: return "bg-muted";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "kitchen": return t("Kitchen", "Mutfak");
      case "waiter": return t("Waiter", "Garson");
      case "branch_admin": return t("Branch Admin", "Şube Yöneticisi");
      default: return role;
    }
  };

  if (branchLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (branchError || !branch) {
    return (
      <div className="flex items-center justify-center min-h-[400px] p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{branchError || t("Branch not found", "Şube bulunamadı")}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">{t("Branch Staff", "Şube Personeli")}</h1>
            <p className="text-muted-foreground flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {branch.name}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchStaff}>
            <RefreshCw className="w-4 h-4 mr-1" />
            {t("Refresh", "Yenile")}
          </Button>
          <Button size="sm" onClick={handleAddNew}>
            <Plus className="w-4 h-4 mr-1" />
            {t("Add Staff", "Personel Ekle")}
          </Button>
        </div>
      </div>

      {/* Staff List */}
      {staffLogins.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-medium mb-2">{t("No staff found", "Personel bulunamadı")}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {t("Add staff members to this branch", "Bu şubeye personel ekleyin")}
            </p>
            <Button onClick={handleAddNew}>
              <Plus className="w-4 h-4 mr-1" />
              {t("Add First Staff", "İlk Personeli Ekle")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {staffLogins.map((staffMember, index) => (
            <motion.div
              key={staffMember.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={!staffMember.is_active ? "opacity-60" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-10 h-10 rounded-full ${getRoleColor(staffMember.role)} flex items-center justify-center`}>
                        {getRoleIcon(staffMember.role)}
                      </div>
                      <div>
                        <p className="font-medium">{staffMember.name}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {getRoleLabel(staffMember.role)}
                          </Badge>
                          <Badge variant={staffMember.is_active ? "default" : "secondary"} className="text-xs">
                            {staffMember.is_active ? t("Active", "Aktif") : t("Inactive", "Pasif")}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg mb-3">
                    <KeyRound className="w-4 h-4 text-muted-foreground" />
                    <code className="text-lg font-mono tracking-wider flex-1">{staffMember.code}</code>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => copyCode(staffMember.code)}
                    >
                      {copiedCode === staffMember.code ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEdit(staffMember)}>
                      <Edit className="w-4 h-4 mr-1" />
                      {t("Edit", "Düzenle")}
                    </Button>
                    <Button variant="outline" size="sm" className="text-destructive" onClick={() => setDeleteConfirm(staffMember.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingStaff ? t("Edit Staff Login", "Personel Girişi Düzenle") : t("Add Staff Login", "Personel Girişi Ekle")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t("Name", "İsim")}</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t("Enter name", "İsim girin")}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("Role", "Rol")}</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="branch_admin">
                    <span className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-purple-600" />
                      {t("Branch Admin", "Şube Yöneticisi")}
                    </span>
                  </SelectItem>
                  <SelectItem value="kitchen">
                    <span className="flex items-center gap-2">
                      <ChefHat className="w-4 h-4 text-amber-600" />
                      {t("Kitchen", "Mutfak")}
                    </span>
                  </SelectItem>
                  <SelectItem value="waiter">
                    <span className="flex items-center gap-2">
                      <Utensils className="w-4 h-4 text-primary" />
                      {t("Waiter", "Garson")}
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("Login Code", "Giriş Kodu")}</Label>
              <div className="flex gap-2">
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.replace(/\D/g, "").slice(0, 6) })}
                  placeholder="123456"
                  maxLength={6}
                  className="font-mono text-lg tracking-wider"
                />
                <Button variant="outline" onClick={generateCode}>
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {t("6-digit code for login", "Giriş için 6 haneli kod")}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <Label>{t("Active", "Aktif")}</Label>
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              {t("Cancel", "İptal")}
            </Button>
            <Button onClick={handleSave}>
              {t("Save", "Kaydet")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("Delete Staff Login?", "Personel Girişini Sil?")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("This action cannot be undone.", "Bu işlem geri alınamaz.")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("Cancel", "İptal")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
            >
              {t("Delete", "Sil")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SuperAdminBranchStaff;
