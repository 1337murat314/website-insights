import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Gift, Plus, Edit, Trash2, Percent, DollarSign, Copy } from "lucide-react";
import { format } from "date-fns";

interface PromoCode {
  id: string;
  code: string;
  description: string | null;
  discount_type: string;
  discount_value: number;
  min_spend: number;
  max_uses: number | null;
  current_uses: number;
  valid_from: string;
  valid_until: string | null;
  is_active: boolean;
  created_at: string;
}

const AdminPromoCodes = () => {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<PromoCode | null>(null);

  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discount_type: "percentage",
    discount_value: "",
    min_spend: "0",
    max_uses: "",
    valid_from: format(new Date(), "yyyy-MM-dd"),
    valid_until: "",
    is_active: true,
  });

  useEffect(() => {
    fetchPromoCodes();
  }, []);

  const fetchPromoCodes = async () => {
    const { data, error } = await supabase
      .from("promo_codes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to fetch promo codes");
      return;
    }
    setPromoCodes(data || []);
    setIsLoading(false);
  };

  const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, code });
  };

  const handleSubmit = async () => {
    if (!formData.code || !formData.discount_value) {
      toast.error("Code and discount value are required");
      return;
    }

    const promoData = {
      code: formData.code.toUpperCase(),
      description: formData.description || null,
      discount_type: formData.discount_type,
      discount_value: parseFloat(formData.discount_value),
      min_spend: parseFloat(formData.min_spend) || 0,
      max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
      valid_from: formData.valid_from,
      valid_until: formData.valid_until || null,
      is_active: formData.is_active,
    };

    if (editingCode) {
      const { error } = await supabase
        .from("promo_codes")
        .update(promoData)
        .eq("id", editingCode.id);

      if (error) {
        toast.error("Failed to update promo code");
        return;
      }
      toast.success("Promo code updated");
    } else {
      const { error } = await supabase.from("promo_codes").insert(promoData);

      if (error) {
        if (error.code === "23505") {
          toast.error("Code already exists");
        } else {
          toast.error("Failed to create promo code");
        }
        return;
      }
      toast.success("Promo code created");
    }

    setIsDialogOpen(false);
    resetForm();
    fetchPromoCodes();
  };

  const handleEdit = (code: PromoCode) => {
    setEditingCode(code);
    setFormData({
      code: code.code,
      description: code.description || "",
      discount_type: code.discount_type,
      discount_value: code.discount_value.toString(),
      min_spend: code.min_spend.toString(),
      max_uses: code.max_uses?.toString() || "",
      valid_from: code.valid_from.split("T")[0],
      valid_until: code.valid_until?.split("T")[0] || "",
      is_active: code.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this promo code?")) return;

    const { error } = await supabase.from("promo_codes").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete");
      return;
    }
    toast.success("Promo code deleted");
    fetchPromoCodes();
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("promo_codes")
      .update({ is_active: !currentStatus })
      .eq("id", id);

    if (error) {
      toast.error("Failed to update status");
      return;
    }
    fetchPromoCodes();
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Code copied to clipboard");
  };

  const resetForm = () => {
    setEditingCode(null);
    setFormData({
      code: "",
      description: "",
      discount_type: "percentage",
      discount_value: "",
      min_spend: "0",
      max_uses: "",
      valid_from: format(new Date(), "yyyy-MM-dd"),
      valid_until: "",
      is_active: true,
    });
  };

  const activeCount = promoCodes.filter((p) => p.is_active).length;
  const totalRedemptions = promoCodes.reduce((acc, p) => acc + p.current_uses, 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold flex items-center gap-2">
            <Gift className="h-8 w-8 text-primary" />
            Promo Codes
          </h1>
          <p className="text-muted-foreground mt-1">Create and manage promotional codes</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="gap-2">
              <Plus className="h-4 w-4" /> Create Code
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingCode ? "Edit Promo Code" : "Create Promo Code"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Promo Code *</Label>
                <div className="flex gap-2">
                  <Input
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="SUMMER20"
                    className="uppercase"
                  />
                  <Button type="button" variant="outline" onClick={generateCode}>
                    Generate
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Summer special discount"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Discount Type *</Label>
                  <Select
                    value={formData.discount_type}
                    onValueChange={(value) => setFormData({ ...formData, discount_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                      <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Discount Value *</Label>
                  <Input
                    type="number"
                    value={formData.discount_value}
                    onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                    placeholder={formData.discount_type === "percentage" ? "20" : "10"}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Min. Spend ($)</Label>
                  <Input
                    type="number"
                    value={formData.min_spend}
                    onChange={(e) => setFormData({ ...formData, min_spend: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Uses</Label>
                  <Input
                    type="number"
                    value={formData.max_uses}
                    onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
                    placeholder="Unlimited"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Valid From</Label>
                  <Input
                    type="date"
                    value={formData.valid_from}
                    onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Valid Until</Label>
                  <Input
                    type="date"
                    value={formData.valid_until}
                    onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label>Active</Label>
              </div>

              <Button onClick={handleSubmit} className="w-full">
                {editingCode ? "Update Code" : "Create Code"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Codes", value: promoCodes.length, icon: Gift },
          { label: "Active Codes", value: activeCount, icon: Percent },
          { label: "Total Redemptions", value: totalRedemptions, icon: DollarSign },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <stat.icon className="h-8 w-8 text-primary" />
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Min. Spend</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Validity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {promoCodes.map((promo) => (
                <TableRow key={promo.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <code className="bg-secondary px-2 py-1 rounded font-mono text-sm">{promo.code}</code>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyCode(promo.code)}>
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    {promo.discount_type === "percentage" ? (
                      <span>{promo.discount_value}%</span>
                    ) : (
                      <span>${promo.discount_value}</span>
                    )}
                  </TableCell>
                  <TableCell>${promo.min_spend}</TableCell>
                  <TableCell>
                    {promo.current_uses}/{promo.max_uses || "∞"}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{format(new Date(promo.valid_from), "MMM d, yyyy")}</div>
                      {promo.valid_until && (
                        <div className="text-muted-foreground">
                          to {format(new Date(promo.valid_until), "MMM d, yyyy")}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={promo.is_active}
                      onCheckedChange={() => toggleActive(promo.id, promo.is_active)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(promo)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(promo.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {promoCodes.length === 0 && !isLoading && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No promo codes yet. Create your first one!
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPromoCodes;
