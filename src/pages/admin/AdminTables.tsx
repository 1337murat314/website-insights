import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Users, LayoutGrid, Map } from "lucide-react";
import FloorPlan from "@/components/admin/FloorPlan";

interface RestaurantTable {
  id: string;
  table_number: string;
  capacity: number;
  location: string | null;
  is_available: boolean;
  pos_x: number;
  pos_y: number;
}

const AdminTables = () => {
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<Partial<RestaurantTable>>({
    table_number: "",
    capacity: 2,
    location: "Indoor",
    is_available: true,
  });
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    const { data, error } = await supabase
      .from("restaurant_tables")
      .select("*")
      .order("table_number");

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setTables(data || []);
    }
    setIsLoading(false);
  };

  const saveTable = async () => {
    let error;
    if (isEditing && editingTable.id) {
      ({ error } = await supabase.from("restaurant_tables").update(editingTable).eq("id", editingTable.id));
    } else {
      ({ error } = await supabase.from("restaurant_tables").insert([editingTable as any]));
    }

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: `Table ${isEditing ? "updated" : "created"}` });
      setIsDialogOpen(false);
      resetForm();
      fetchTables();
    }
  };

  const deleteTable = async (id: string) => {
    if (!confirm("Delete this table?")) return;
    const { error } = await supabase.from("restaurant_tables").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Table deleted" });
      fetchTables();
    }
  };

  const toggleAvailability = async (table: RestaurantTable) => {
    const { error } = await supabase
      .from("restaurant_tables")
      .update({ is_available: !table.is_available })
      .eq("id", table.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      fetchTables();
    }
  };

  const resetForm = () => {
    setEditingTable({ table_number: "", capacity: 2, location: "Indoor", is_available: true });
    setIsEditing(false);
  };

  const openEdit = (table: RestaurantTable) => {
    setEditingTable(table);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const openCreate = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const getLocationColor = (location: string | null) => {
    switch (location) {
      case "Indoor": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "Terrace": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "Private": return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      default: return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold">Table Management</h1>
          <p className="text-muted-foreground mt-1">Manage restaurant tables and floor layout</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" /> Add Table
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Tables</p>
                <p className="text-2xl font-bold">{tables.length}</p>
              </div>
              <div className="p-3 rounded-full bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Available</p>
                <p className="text-2xl font-bold text-green-500">{tables.filter(t => t.is_available).length}</p>
              </div>
              <div className="p-3 rounded-full bg-green-500/10">
                <Users className="h-5 w-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Capacity</p>
                <p className="text-2xl font-bold">{tables.reduce((sum, t) => sum + t.capacity, 0)}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-500/10">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Grid vs Floor Plan */}
      <Tabs defaultValue="floorplan">
        <TabsList>
          <TabsTrigger value="floorplan" className="gap-2">
            <Map className="h-4 w-4" /> Floor Plan
          </TabsTrigger>
          <TabsTrigger value="grid" className="gap-2">
            <LayoutGrid className="h-4 w-4" /> Grid View
          </TabsTrigger>
        </TabsList>

        <TabsContent value="floorplan" className="mt-4">
          <FloorPlan tables={tables} onTableUpdate={fetchTables} />
        </TabsContent>

        <TabsContent value="grid" className="mt-4">
          {isLoading ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">Loading...</CardContent></Card>
          ) : tables.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">No tables yet</CardContent></Card>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {tables.map((table, index) => (
                <motion.div
                  key={table.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className={`border-border/50 cursor-pointer transition-all hover:shadow-lg ${!table.is_available ? "opacity-50" : ""}`}>
                    <CardContent className="p-4 text-center">
                      <div 
                        className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-3 ${
                          table.is_available ? "bg-green-500/10" : "bg-gray-500/10"
                        }`}
                        onClick={() => toggleAvailability(table)}
                      >
                        <span className={`text-2xl font-bold ${table.is_available ? "text-green-500" : "text-gray-500"}`}>
                          {table.table_number}
                        </span>
                      </div>
                      <p className="text-sm font-medium">{table.capacity} seats</p>
                      <span className={`inline-block mt-2 px-2 py-1 text-xs rounded-full border ${getLocationColor(table.location)}`}>
                        {table.location || "Unknown"}
                      </span>
                      <div className="flex justify-center gap-2 mt-3">
                        <Button size="sm" variant="ghost" onClick={() => openEdit(table)}>
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteTable(table.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit" : "Add"} Table</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Table Number</Label>
              <Input
                value={editingTable.table_number || ""}
                onChange={(e) => setEditingTable({ ...editingTable, table_number: e.target.value })}
                placeholder="e.g., T1, T2, VIP1"
              />
            </div>
            <div className="space-y-2">
              <Label>Capacity</Label>
              <Input
                type="number"
                min={1}
                value={editingTable.capacity || 2}
                onChange={(e) => setEditingTable({ ...editingTable, capacity: parseInt(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Select
                value={editingTable.location || "Indoor"}
                onValueChange={(v) => setEditingTable({ ...editingTable, location: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Indoor">Indoor</SelectItem>
                  <SelectItem value="Terrace">Terrace</SelectItem>
                  <SelectItem value="Private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={editingTable.is_available}
                onCheckedChange={(v) => setEditingTable({ ...editingTable, is_available: v })}
              />
              <Label>Available</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveTable}>{isEditing ? "Update" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminTables;
