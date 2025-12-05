import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Search, Shield, ShieldCheck, User, Plus, Trash2 } from "lucide-react";

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  created_at: string;
}

interface UserRole {
  id: string;
  user_id: string;
  role: "admin" | "manager" | "staff";
}

interface StaffMember extends Profile {
  roles: UserRole[];
}

const AdminStaff = () => {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<StaffMember | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("staff");
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (profilesError) {
      toast({ title: "Error", description: profilesError.message, variant: "destructive" });
      setIsLoading(false);
      return;
    }

    const { data: roles, error: rolesError } = await supabase
      .from("user_roles")
      .select("*");

    if (rolesError) {
      toast({ title: "Error", description: rolesError.message, variant: "destructive" });
      setIsLoading(false);
      return;
    }

    const staffWithRoles = (profiles || []).map(profile => ({
      ...profile,
      roles: (roles || []).filter(r => r.user_id === profile.user_id),
    }));

    setStaff(staffWithRoles);
    setIsLoading(false);
  };

  const filteredStaff = staff.filter(s => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      s.full_name?.toLowerCase().includes(query) ||
      s.email?.toLowerCase().includes(query)
    );
  });

  const addRole = async () => {
    if (!selectedUser) return;

    const { error } = await supabase.from("user_roles").insert({
      user_id: selectedUser.user_id,
      role: selectedRole as "admin" | "manager" | "staff",
    });

    if (error) {
      if (error.code === "23505") {
        toast({ title: "Error", description: "User already has this role", variant: "destructive" });
      } else {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
    } else {
      toast({ title: "Success", description: "Role added" });
      setIsRoleDialogOpen(false);
      fetchStaff();
    }
  };

  const removeRole = async (roleId: string) => {
    if (!confirm("Remove this role?")) return;

    const { error } = await supabase.from("user_roles").delete().eq("id", roleId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Role removed" });
      fetchStaff();
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20"><ShieldCheck className="h-3 w-3 mr-1" />Admin</Badge>;
      case "manager":
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20"><Shield className="h-3 w-3 mr-1" />Manager</Badge>;
      case "staff":
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20"><User className="h-3 w-3 mr-1" />Staff</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold">Staff Management</h1>
          <p className="text-muted-foreground mt-1">Manage staff accounts and roles</p>
        </div>
      </div>

      {/* Search */}
      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Staff List */}
      {isLoading ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground">Loading...</CardContent></Card>
      ) : filteredStaff.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground">No staff members found</CardContent></Card>
      ) : (
        <div className="space-y-4">
          {filteredStaff.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{member.full_name || "No Name"}</h3>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                        {member.phone && <p className="text-sm text-muted-foreground">{member.phone}</p>}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {member.roles.length === 0 ? (
                        <span className="text-sm text-muted-foreground">No roles assigned</span>
                      ) : (
                        member.roles.map(role => (
                          <div key={role.id} className="flex items-center gap-1">
                            {getRoleBadge(role.role)}
                            {member.user_id !== user?.id && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0 text-destructive hover:bg-destructive/10"
                                onClick={() => removeRole(role.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        ))
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedUser(member);
                          setSelectedRole("staff");
                          setIsRoleDialogOpen(true);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Role
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Role Dialog */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Role</DialogTitle>
            <DialogDescription>
              Assign a role to {selectedUser?.full_name || selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin - Full access</SelectItem>
                  <SelectItem value="manager">Manager - Manage operations</SelectItem>
                  <SelectItem value="staff">Staff - Basic access</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRoleDialogOpen(false)}>Cancel</Button>
            <Button onClick={addRole}>Add Role</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminStaff;
