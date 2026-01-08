import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
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
  MapPin
} from "lucide-react";

interface Branch {
  id: string;
  name: string;
  name_tr: string | null;
  slug: string | null;
}

interface StaffLogin {
  id: string;
  name: string;
  code: string;
  role: string;
  is_active: boolean;
  created_at: string;
  branch_id: string | null;
  branch?: Branch;
}

const AdminStaffLogins = () => {
  const [staffLogins, setStaffLogins] = useState<StaffLogin[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
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
    branch_id: "" as string
  });

  const { toast } = useToast();
  const { t, language } = useLanguage();

  const fetchData = async () => {
    setIsLoading(true);
    const [staffRes, branchRes] = await Promise.all([
      supabase
        .from("staff_logins")
        .select("*, branches(id, name, name_tr, slug)")
        .order("created_at", { ascending: false }),
      supabase.from("branches").select("*").eq("is_active", true).order("sort_order")
    ]);

    if (staffRes.error) {
      console.error("Error fetching staff logins:", staffRes.error);
      toast({ title: t("Error", "Hata"), description: staffRes.error.message, variant: "destructive" });
    } else {
      const staffWithBranch = (staffRes.data || []).map((s: any) => ({
        ...s,
        branch: s.branches
      }));
      setStaffLogins(staffWithBranch);
    }
    
    if (branchRes.data) {
      setBranches(branchRes.data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const generateCode = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setFormData({ ...formData, code });
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({ title: t("Error", "Hata"), description: t("Name is required", "İsim gerekli"), variant: "destructive" });
      return;
    }

    if (formData.code.length !== 6 || !/^\d+$/.test(formData.code)) {
      toast({ title: t("Error", "Hata"), description: t("Code must be 6 digits", "Kod 6 haneli olmalı"), variant: "destructive" });
      return;
    }

    if (!formData.branch_id) {
      toast({ title: t("Error", "Hata"), description: t("Branch is required", "Şube gerekli"), variant: "destructive" });
      return;
    }

    const staffData = {
      name: formData.name.trim(),
      code: formData.code,
      role: formData.role,
      is_active: formData.is_active,
      branch_id: formData.branch_id
    };

    if (editingStaff) {
      const { error } = await supabase
        .from("staff_logins")
        .update(staffData)
        .eq("id", editingStaff.id);

      if (error) {
        if (error.code === "23505") {
          toast({ title: t("Error", "Hata"), description: t("Code already exists", "Bu kod zaten kullanılıyor"), variant: "destructive" });
        } else {
          toast({ title: t("Error", "Hata"), description: error.message, variant: "destructive" });
        }
        return;
      }
    } else {
      const { error } = await supabase
        .from("staff_logins")
        .insert(staffData);

      if (error) {
        if (error.code === "23505") {
          toast({ title: t("Error", "Hata"), description: t("Code already exists", "Bu kod zaten kullanılıyor"), variant: "destructive" });
        } else {
          toast({ title: t("Error", "Hata"), description: error.message, variant: "destructive" });
        }
        return;
      }
    }

    toast({ title: t("Success", "Başarılı"), description: t("Staff login saved", "Personel girişi kaydedildi") });
    setShowDialog(false);
    setEditingStaff(null);
    setFormData({ name: "", code: "", role: "waiter", is_active: true, branch_id: "" });
    fetchData();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("staff_logins")
      .delete()
      .eq("id", id);

    if (error) {
      toast({ title: t("Error", "Hata"), description: error.message, variant: "destructive" });
    } else {
      toast({ title: t("Success", "Başarılı"), description: t("Staff login deleted", "Personel girişi silindi") });
      fetchData();
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
      branch_id: staff.branch_id || ""
    });
    setShowDialog(true);
  };

  const handleAddNew = () => {
    setEditingStaff(null);
    setFormData({ name: "", code: "", role: "waiter", is_active: true, branch_id: branches[0]?.id || "" });
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

  // Group by branch
  const staffByBranch = branches.map(branch => ({
    branch,
    staff: staffLogins.filter(s => s.branch_id === branch.id)
  }));

  const unassignedStaff = staffLogins.filter(s => !s.branch_id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold">{t("Staff Logins", "Personel Girişleri")}</h1>
          <p className="text-muted-foreground mt-1">
            {t("Manage branch staff login credentials", "Şube personel giriş bilgilerini yönetin")}
          </p>
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="w-4 h-4 mr-2" />
          {t("Add Staff", "Personel Ekle")}
        </Button>
      </div>

      {/* Login URLs Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("Branch Login URLs", "Şube Giriş Adresleri")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {branches.map(branch => (
            <div key={branch.id} className="p-3 bg-muted/50 rounded-lg space-y-2">
              <div className="flex items-center gap-2 font-medium">
                <MapPin className="w-4 h-4" />
                {language === "tr" && branch.name_tr ? branch.name_tr : branch.name}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-purple-500" />
                  <code className="bg-background px-2 py-1 rounded">/{branch.slug}/admin</code>
                </div>
                <div className="flex items-center gap-2">
                  <ChefHat className="w-4 h-4 text-amber-500" />
                  <code className="bg-background px-2 py-1 rounded">/{branch.slug}/kitchen-login</code>
                </div>
                <div className="flex items-center gap-2">
                  <Utensils className="w-4 h-4 text-primary" />
                  <code className="bg-background px-2 py-1 rounded">/{branch.slug}/waiter-login</code>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Staff by Branch */}
      {staffByBranch.map(({ branch, staff }) => (
        <div key={branch.id}>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            {language === "tr" && branch.name_tr ? branch.name_tr : branch.name}
            <Badge variant="secondary">{staff.length}</Badge>
          </h2>
          {staff.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-8 text-center text-muted-foreground">
                {t("No staff added for this branch", "Bu şube için personel eklenmedi")}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {staff.map((staffMember, index) => (
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
        </div>
      ))}

      {/* Unassigned Staff */}
      {unassignedStaff.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-muted-foreground">
            {t("Unassigned Staff", "Atanmamış Personel")}
            <Badge variant="secondary">{unassignedStaff.length}</Badge>
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {unassignedStaff.map((staffMember, index) => (
              <motion.div
                key={staffMember.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="border-dashed opacity-60">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-10 h-10 rounded-full ${getRoleColor(staffMember.role)} flex items-center justify-center`}>
                          {getRoleIcon(staffMember.role)}
                        </div>
                        <div>
                          <p className="font-medium">{staffMember.name}</p>
                          <Badge variant="destructive" className="text-xs">
                            {t("No Branch", "Şube Yok")}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEdit(staffMember)}>
                        <Edit className="w-4 h-4 mr-1" />
                        {t("Assign Branch", "Şube Ata")}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
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
              <Label>{t("Branch", "Şube")}</Label>
              <Select
                value={formData.branch_id}
                onValueChange={(value) => setFormData({ ...formData, branch_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("Select branch", "Şube seçin")} />
                </SelectTrigger>
                <SelectContent>
                  {branches.map(branch => (
                    <SelectItem key={branch.id} value={branch.id}>
                      <span className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {language === "tr" && branch.name_tr ? branch.name_tr : branch.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
                      <Shield className="w-4 h-4 text-purple-500" />
                      {t("Branch Admin", "Şube Yöneticisi")}
                    </span>
                  </SelectItem>
                  <SelectItem value="kitchen">
                    <span className="flex items-center gap-2">
                      <ChefHat className="w-4 h-4 text-amber-500" />
                      {t("Kitchen", "Mutfak")}
                    </span>
                  </SelectItem>
                  <SelectItem value="waiter">
                    <span className="flex items-center gap-2">
                      <Utensils className="w-4 h-4" />
                      {t("Waiter", "Garson")}
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("6-Digit Code", "6 Haneli Kod")}</Label>
              <div className="flex gap-2">
                <Input
                  value={formData.code}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                    setFormData({ ...formData, code: val });
                  }}
                  placeholder="000000"
                  maxLength={6}
                  className="font-mono text-lg tracking-widest"
                />
                <Button variant="outline" onClick={generateCode}>
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
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
            <AlertDialogTitle>{t("Delete Staff Login?", "Personel Girişi Silinsin mi?")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("This action cannot be undone.", "Bu işlem geri alınamaz.")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("Cancel", "İptal")}</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>
              {t("Delete", "Sil")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminStaffLogins;