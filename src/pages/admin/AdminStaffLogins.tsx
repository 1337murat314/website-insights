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
  Check
} from "lucide-react";

interface StaffLogin {
  id: string;
  name: string;
  code: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

const AdminStaffLogins = () => {
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
    is_active: true
  });

  const { toast } = useToast();
  const { t } = useLanguage();

  const fetchStaffLogins = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("staff_logins")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching staff logins:", error);
      toast({ title: t("Error", "Hata"), description: error.message, variant: "destructive" });
    } else {
      setStaffLogins(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchStaffLogins();
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

    if (editingStaff) {
      const { error } = await supabase
        .from("staff_logins")
        .update({
          name: formData.name.trim(),
          code: formData.code,
          role: formData.role,
          is_active: formData.is_active
        })
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
        .insert({
          name: formData.name.trim(),
          code: formData.code,
          role: formData.role,
          is_active: formData.is_active
        });

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
    setFormData({ name: "", code: "", role: "waiter", is_active: true });
    fetchStaffLogins();
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
      fetchStaffLogins();
    }
    setDeleteConfirm(null);
  };

  const handleEdit = (staff: StaffLogin) => {
    setEditingStaff(staff);
    setFormData({
      name: staff.name,
      code: staff.code,
      role: staff.role,
      is_active: staff.is_active
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

  const kitchenStaff = staffLogins.filter(s => s.role === "kitchen");
  const waiterStaff = staffLogins.filter(s => s.role === "waiter");

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
            {t("Manage kitchen and waiter login credentials", "Mutfak ve garson giriş bilgilerini yönetin")}
          </p>
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="w-4 h-4 mr-2" />
          {t("Add Staff", "Personel Ekle")}
        </Button>
      </div>

      {/* Login URLs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("Login URLs", "Giriş Adresleri")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
            <ChefHat className="w-5 h-5 text-amber-500" />
            <span className="font-medium">{t("Kitchen", "Mutfak")}:</span>
            <code className="text-sm bg-background px-2 py-1 rounded">/kitchen-login</code>
          </div>
          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
            <Utensils className="w-5 h-5 text-primary" />
            <span className="font-medium">{t("Waiter", "Garson")}:</span>
            <code className="text-sm bg-background px-2 py-1 rounded">/waiter-login</code>
          </div>
        </CardContent>
      </Card>

      {/* Kitchen Staff */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <ChefHat className="w-5 h-5 text-amber-500" />
          {t("Kitchen Staff", "Mutfak Personeli")}
          <Badge variant="secondary">{kitchenStaff.length}</Badge>
        </h2>
        {kitchenStaff.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-8 text-center text-muted-foreground">
              {t("No kitchen staff added yet", "Henüz mutfak personeli eklenmedi")}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {kitchenStaff.map((staff, index) => (
              <motion.div
                key={staff.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={!staff.is_active ? "opacity-60" : ""}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                          <ChefHat className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                          <p className="font-medium">{staff.name}</p>
                          <Badge variant={staff.is_active ? "default" : "secondary"} className="text-xs">
                            {staff.is_active ? t("Active", "Aktif") : t("Inactive", "Pasif")}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg mb-3">
                      <KeyRound className="w-4 h-4 text-muted-foreground" />
                      <code className="text-lg font-mono tracking-wider flex-1">{staff.code}</code>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => copyCode(staff.code)}
                      >
                        {copiedCode === staff.code ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEdit(staff)}>
                        <Edit className="w-4 h-4 mr-1" />
                        {t("Edit", "Düzenle")}
                      </Button>
                      <Button variant="outline" size="sm" className="text-destructive" onClick={() => setDeleteConfirm(staff.id)}>
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

      {/* Waiter Staff */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Utensils className="w-5 h-5 text-primary" />
          {t("Waiter Staff", "Garson Personeli")}
          <Badge variant="secondary">{waiterStaff.length}</Badge>
        </h2>
        {waiterStaff.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-8 text-center text-muted-foreground">
              {t("No waiter staff added yet", "Henüz garson personeli eklenmedi")}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {waiterStaff.map((staff, index) => (
              <motion.div
                key={staff.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={!staff.is_active ? "opacity-60" : ""}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <Utensils className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{staff.name}</p>
                          <Badge variant={staff.is_active ? "default" : "secondary"} className="text-xs">
                            {staff.is_active ? t("Active", "Aktif") : t("Inactive", "Pasif")}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg mb-3">
                      <KeyRound className="w-4 h-4 text-muted-foreground" />
                      <code className="text-lg font-mono tracking-wider flex-1">{staff.code}</code>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => copyCode(staff.code)}
                      >
                        {copiedCode === staff.code ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEdit(staff)}>
                        <Edit className="w-4 h-4 mr-1" />
                        {t("Edit", "Düzenle")}
                      </Button>
                      <Button variant="outline" size="sm" className="text-destructive" onClick={() => setDeleteConfirm(staff.id)}>
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
                onValueChange={(value: "kitchen" | "waiter") => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kitchen">
                    <span className="flex items-center gap-2">
                      <ChefHat className="w-4 h-4" />
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
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
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

export default AdminStaffLogins;
