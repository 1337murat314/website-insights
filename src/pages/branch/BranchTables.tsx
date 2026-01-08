import { useState, useEffect } from "react";
import { useBranch } from "@/contexts/BranchContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { MapPin, TableProperties, Plus, Edit, Trash2, Users, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Table {
  id: string;
  table_number: string;
  capacity: number;
  location: string | null;
  is_available: boolean;
}

const BranchTables = () => {
  const { branch } = useBranch();
  const { t } = useLanguage();
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<Partial<Table>>({
    table_number: "",
    capacity: 4,
    location: "",
    is_available: true,
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (branch) {
      fetchTables();
    }
  }, [branch]);

  const fetchTables = async () => {
    if (!branch) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("restaurant_tables")
      .select("*")
      .eq("branch_id", branch.id)
      .order("table_number");

    if (error) {
      toast.error(t("Failed to load tables", "Masalar yüklenemedi"));
    } else {
      setTables(data || []);
    }
    setLoading(false);
  };

  const saveTable = async () => {
    if (!branch || !editingTable.table_number) return;

    let error;
    if (isEditing && editingTable.id) {
      ({ error } = await supabase.from("restaurant_tables").update({
        table_number: editingTable.table_number,
        capacity: editingTable.capacity || 4,
        location: editingTable.location || null,
        is_available: editingTable.is_available ?? true,
      }).eq("id", editingTable.id));
    } else {
      ({ error } = await supabase.from("restaurant_tables").insert([{
        table_number: editingTable.table_number,
        capacity: editingTable.capacity || 4,
        location: editingTable.location || null,
        is_available: editingTable.is_available ?? true,
        branch_id: branch.id,
      }]));
    }

    if (error) {
      toast.error(t("Failed to save table", "Masa kaydedilemedi"));
    } else {
      toast.success(t(isEditing ? "Table updated" : "Table created", isEditing ? "Masa güncellendi" : "Masa oluşturuldu"));
      setIsDialogOpen(false);
      setEditingTable({ table_number: "", capacity: 4, location: "", is_available: true });
      setIsEditing(false);
      fetchTables();
    }
  };

  const deleteTable = async (id: string) => {
    if (!confirm(t("Delete this table?", "Bu masayı silmek istediğinize emin misiniz?"))) return;
    
    const { error } = await supabase.from("restaurant_tables").delete().eq("id", id);
    if (error) {
      toast.error(t("Failed to delete table", "Masa silinemedi"));
    } else {
      toast.success(t("Table deleted", "Masa silindi"));
      setTables((prev) => prev.filter((t) => t.id !== id));
    }
  };

  const toggleAvailability = async (table: Table) => {
    const { error } = await supabase
      .from("restaurant_tables")
      .update({ is_available: !table.is_available })
      .eq("id", table.id);

    if (error) {
      toast.error(t("Failed to update", "Güncellenemedi"));
    } else {
      setTables((prev) => prev.map((t) => (t.id === table.id ? { ...t, is_available: !t.is_available } : t)));
    }
  };

  const openEdit = (table: Table) => {
    setEditingTable(table);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const openCreate = () => {
    setEditingTable({ table_number: "", capacity: 4, location: "", is_available: true });
    setIsEditing(false);
    setIsDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <TableProperties className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">{t("Tables", "Masalar")}</h1>
            {branch && (
              <p className="text-muted-foreground flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {branch.name}
              </p>
            )}
          </div>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          {t("Add Table", "Masa Ekle")}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{tables.length}</p>
            <p className="text-sm text-muted-foreground">{t("Total Tables", "Toplam Masa")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{tables.filter((t) => t.is_available).length}</p>
            <p className="text-sm text-muted-foreground">{t("Available", "Müsait")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{tables.reduce((sum, t) => sum + t.capacity, 0)}</p>
            <p className="text-sm text-muted-foreground">{t("Total Capacity", "Toplam Kapasite")}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tables Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {tables.map((table) => (
          <Card key={table.id} className={!table.is_available ? "opacity-60" : ""}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TableProperties className="h-5 w-5" />
                  {t("Table", "Masa")} {table.table_number}
                </CardTitle>
                <Badge variant={table.is_available ? "default" : "secondary"}>
                  {table.is_available ? t("Available", "Müsait") : t("Occupied", "Dolu")}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                {table.capacity} {t("seats", "kişilik")}
              </div>
              {table.location && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {table.location}
                </div>
              )}
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center gap-2">
                  <Switch checked={table.is_available} onCheckedChange={() => toggleAvailability(table)} />
                  <span className="text-sm">{t("Available", "Müsait")}</span>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(table)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => deleteTable(table.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {tables.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <TableProperties className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>{t("No tables yet", "Henüz masa yok")}</p>
          <Button className="mt-4" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />
            {t("Add First Table", "İlk Masayı Ekle")}
          </Button>
        </div>
      )}

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? t("Edit Table", "Masa Düzenle") : t("Add Table", "Masa Ekle")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{t("Table Number", "Masa Numarası")}</Label>
              <Input
                value={editingTable.table_number || ""}
                onChange={(e) => setEditingTable({ ...editingTable, table_number: e.target.value })}
                placeholder="1, 2, A1..."
              />
            </div>
            <div>
              <Label>{t("Capacity", "Kapasite")}</Label>
              <Input
                type="number"
                min={1}
                value={editingTable.capacity || 4}
                onChange={(e) => setEditingTable({ ...editingTable, capacity: parseInt(e.target.value) || 1 })}
              />
            </div>
            <div>
              <Label>{t("Location", "Konum")}</Label>
              <Input
                value={editingTable.location || ""}
                onChange={(e) => setEditingTable({ ...editingTable, location: e.target.value })}
                placeholder={t("Indoor, Terrace, Window...", "İç mekan, Teras, Pencere kenarı...")}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={editingTable.is_available ?? true}
                onCheckedChange={(checked) => setEditingTable({ ...editingTable, is_available: checked })}
              />
              <Label>{t("Available", "Müsait")}</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>{t("Cancel", "İptal")}</Button>
            <Button onClick={saveTable}>{isEditing ? t("Update", "Güncelle") : t("Create", "Oluştur")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BranchTables;
