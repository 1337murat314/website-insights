import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Crown,
  Search,
  Plus,
  Mail,
  Phone,
  Calendar,
  Heart,
  Star,
  Edit,
  Trash2,
  Users,
  DollarSign,
  Gift,
} from "lucide-react";
import { format } from "date-fns";

import type { Json } from "@/integrations/supabase/types";

interface Guest {
  id: string;
  email: string | null;
  phone: string | null;
  full_name: string;
  vip_status: boolean;
  total_visits: number;
  total_spent: number;
  preferences: Json;
  notes: string | null;
  tags: string[];
  birthday: string | null;
  anniversary: string | null;
  dietary_restrictions: string[] | null;
  seating_preference: string | null;
  created_at: string;
}

const AdminGuests = () => {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [filteredGuests, setFilteredGuests] = useState<Guest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showVipOnly, setShowVipOnly] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    vip_status: false,
    notes: "",
    birthday: "",
    anniversary: "",
    seating_preference: "",
    dietary_restrictions: "",
  });

  useEffect(() => {
    fetchGuests();
  }, []);

  useEffect(() => {
    filterGuests();
  }, [guests, searchQuery, showVipOnly]);

  const fetchGuests = async () => {
    const { data, error } = await supabase
      .from("guests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to fetch guests");
      return;
    }
    setGuests(data || []);
    setIsLoading(false);
  };

  const filterGuests = () => {
    let filtered = [...guests];

    if (searchQuery) {
      filtered = filtered.filter(
        (g) =>
          g.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          g.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          g.phone?.includes(searchQuery)
      );
    }

    if (showVipOnly) {
      filtered = filtered.filter((g) => g.vip_status);
    }

    setFilteredGuests(filtered);
  };

  const handleSubmit = async () => {
    if (!formData.full_name) {
      toast.error("Name is required");
      return;
    }

    const guestData = {
      full_name: formData.full_name,
      email: formData.email || null,
      phone: formData.phone || null,
      vip_status: formData.vip_status,
      notes: formData.notes || null,
      birthday: formData.birthday || null,
      anniversary: formData.anniversary || null,
      seating_preference: formData.seating_preference || null,
      dietary_restrictions: formData.dietary_restrictions
        ? formData.dietary_restrictions.split(",").map((s) => s.trim())
        : null,
    };

    if (editingGuest) {
      const { error } = await supabase
        .from("guests")
        .update(guestData)
        .eq("id", editingGuest.id);

      if (error) {
        toast.error("Failed to update guest");
        return;
      }
      toast.success("Guest updated");
    } else {
      const { error } = await supabase.from("guests").insert(guestData);

      if (error) {
        toast.error("Failed to add guest");
        return;
      }
      toast.success("Guest added");
    }

    setIsDialogOpen(false);
    resetForm();
    fetchGuests();
  };

  const handleEdit = (guest: Guest) => {
    setEditingGuest(guest);
    setFormData({
      full_name: guest.full_name,
      email: guest.email || "",
      phone: guest.phone || "",
      vip_status: guest.vip_status,
      notes: guest.notes || "",
      birthday: guest.birthday || "",
      anniversary: guest.anniversary || "",
      seating_preference: guest.seating_preference || "",
      dietary_restrictions: guest.dietary_restrictions?.join(", ") || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this guest?")) return;

    const { error } = await supabase.from("guests").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete guest");
      return;
    }
    toast.success("Guest deleted");
    fetchGuests();
  };

  const resetForm = () => {
    setEditingGuest(null);
    setFormData({
      full_name: "",
      email: "",
      phone: "",
      vip_status: false,
      notes: "",
      birthday: "",
      anniversary: "",
      seating_preference: "",
      dietary_restrictions: "",
    });
  };

  const totalVips = guests.filter((g) => g.vip_status).length;
  const totalSpent = guests.reduce((acc, g) => acc + Number(g.total_spent || 0), 0);
  const totalVisits = guests.reduce((acc, g) => acc + (g.total_visits || 0), 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold flex items-center gap-2">
            <Crown className="h-8 w-8 text-gold" />
            Guest CRM
          </h1>
          <p className="text-muted-foreground mt-1">Manage your valued customers</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="gap-2">
              <Plus className="h-4 w-4" /> Add Guest
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingGuest ? "Edit Guest" : "Add New Guest"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name *</Label>
                  <Input
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 234 567 890"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Seating Preference</Label>
                  <Input
                    value={formData.seating_preference}
                    onChange={(e) => setFormData({ ...formData, seating_preference: e.target.value })}
                    placeholder="Window, Patio, etc."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Birthday</Label>
                  <Input
                    type="date"
                    value={formData.birthday}
                    onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Anniversary</Label>
                  <Input
                    type="date"
                    value={formData.anniversary}
                    onChange={(e) => setFormData({ ...formData, anniversary: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Dietary Restrictions (comma separated)</Label>
                <Input
                  value={formData.dietary_restrictions}
                  onChange={(e) => setFormData({ ...formData, dietary_restrictions: e.target.value })}
                  placeholder="Vegetarian, Gluten-free, etc."
                />
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Special preferences, allergies, etc."
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.vip_status}
                  onCheckedChange={(checked) => setFormData({ ...formData, vip_status: checked })}
                />
                <Label className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-gold" /> VIP Status
                </Label>
              </div>

              <Button onClick={handleSubmit} className="w-full">
                {editingGuest ? "Update Guest" : "Add Guest"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Guests", value: guests.length, icon: Users, color: "text-blue-500" },
          { label: "VIP Members", value: totalVips, icon: Crown, color: "text-gold" },
          { label: "Total Visits", value: totalVisits, icon: Calendar, color: "text-green-500" },
          { label: "Total Revenue", value: `$${totalSpent.toFixed(0)}`, icon: DollarSign, color: "text-primary" },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={showVipOnly} onCheckedChange={setShowVipOnly} />
              <Label>VIP Only</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Guest List */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredGuests.map((guest, index) => (
          <motion.div
            key={guest.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-lg font-bold text-primary">
                        {guest.full_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{guest.full_name}</h3>
                        {guest.vip_status && (
                          <Badge className="bg-gold/20 text-gold border-gold/30">
                            <Crown className="h-3 w-3 mr-1" /> VIP
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{guest.email || "No email"}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(guest)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(guest.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  {guest.phone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4" /> {guest.phone}
                    </div>
                  )}
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="h-4 w-4" /> {guest.total_visits} visits
                    </span>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <DollarSign className="h-4 w-4" /> ${guest.total_spent}
                    </span>
                  </div>
                  {guest.birthday && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Gift className="h-4 w-4" /> Birthday: {format(new Date(guest.birthday), "MMM d")}
                    </div>
                  )}
                  {guest.dietary_restrictions && guest.dietary_restrictions.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {guest.dietary_restrictions.map((d) => (
                        <Badge key={d} variant="outline" className="text-xs">
                          {d}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredGuests.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <Crown className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No guests found</h3>
          <p className="text-muted-foreground">Add your first guest to get started</p>
        </div>
      )}
    </div>
  );
};

export default AdminGuests;
