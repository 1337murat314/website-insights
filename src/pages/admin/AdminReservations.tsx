import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Clock,
  Calendar,
  Users,
  Phone,
  Mail,
  Edit,
  Trash2,
  Eye
} from "lucide-react";
import { format } from "date-fns";

interface Reservation {
  id: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string | null;
  party_size: number;
  reservation_date: string;
  reservation_time: string;
  status: "pending" | "confirmed" | "cancelled" | "completed" | "no_show";
  special_requests: string | null;
  notes: string | null;
  created_at: string;
}

const AdminReservations = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [filteredReservations, setFilteredReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editNotes, setEditNotes] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchReservations();
  }, []);

  useEffect(() => {
    filterReservations();
  }, [reservations, searchQuery, statusFilter]);

  const fetchReservations = async () => {
    const { data, error } = await supabase
      .from("reservations")
      .select("*")
      .order("reservation_date", { ascending: true })
      .order("reservation_time", { ascending: true });

    if (error) {
      toast({ title: "Error", description: "Failed to fetch reservations", variant: "destructive" });
    } else {
      setReservations(data || []);
    }
    setIsLoading(false);
  };

  const filterReservations = () => {
    let filtered = [...reservations];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(r => 
        r.guest_name.toLowerCase().includes(query) ||
        r.guest_email.toLowerCase().includes(query) ||
        r.guest_phone?.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(r => r.status === statusFilter);
    }

    setFilteredReservations(filtered);
  };

  const updateStatus = async (id: string, status: Reservation["status"]) => {
    const { error } = await supabase
      .from("reservations")
      .update({ status })
      .eq("id", id);

    if (error) {
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
    } else {
      toast({ title: "Success", description: `Reservation ${status}` });
      fetchReservations();
    }
  };

  const updateNotes = async () => {
    if (!selectedReservation) return;

    const { error } = await supabase
      .from("reservations")
      .update({ notes: editNotes })
      .eq("id", selectedReservation.id);

    if (error) {
      toast({ title: "Error", description: "Failed to update notes", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Notes updated" });
      setIsEditDialogOpen(false);
      fetchReservations();
    }
  };

  const deleteReservation = async (id: string) => {
    if (!confirm("Are you sure you want to delete this reservation?")) return;

    const { error } = await supabase
      .from("reservations")
      .delete()
      .eq("id", id);

    if (error) {
      toast({ title: "Error", description: "Failed to delete reservation", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Reservation deleted" });
      fetchReservations();
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      confirmed: "bg-green-500/10 text-green-500 border-green-500/20",
      cancelled: "bg-destructive/10 text-destructive border-destructive/20",
      completed: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      no_show: "bg-gray-500/10 text-gray-500 border-gray-500/20",
    };
    return <Badge variant="outline" className={styles[status as keyof typeof styles]}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold">Reservations</h1>
          <p className="text-muted-foreground mt-1">Manage all restaurant bookings</p>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or phone..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="no_show">No Show</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reservations List */}
      <div className="space-y-4">
        {isLoading ? (
          <Card className="border-border/50">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">Loading reservations...</p>
            </CardContent>
          </Card>
        ) : filteredReservations.length === 0 ? (
          <Card className="border-border/50">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No reservations found</p>
            </CardContent>
          </Card>
        ) : (
          filteredReservations.map((reservation, index) => (
            <motion.div
              key={reservation.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="border-border/50 hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Guest Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{reservation.guest_name}</h3>
                        {getStatusBadge(reservation.status)}
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {reservation.guest_email}
                        </span>
                        {reservation.guest_phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {reservation.guest_phone}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Reservation Details */}
                    <div className="flex flex-wrap gap-4 text-sm">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {reservation.reservation_date}
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {reservation.reservation_time}
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        {reservation.party_size} guests
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {reservation.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-500 border-green-500/20 hover:bg-green-500/10"
                            onClick={() => updateStatus(reservation.id, "confirmed")}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive border-destructive/20 hover:bg-destructive/10"
                            onClick={() => updateStatus(reservation.id, "cancelled")}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSelectedReservation(reservation);
                          setIsViewDialogOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSelectedReservation(reservation);
                          setEditNotes(reservation.notes || "");
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => deleteReservation(reservation.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reservation Details</DialogTitle>
          </DialogHeader>
          {selectedReservation && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Guest Name</Label>
                  <p className="font-medium">{selectedReservation.guest_name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <p>{getStatusBadge(selectedReservation.status)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <p>{selectedReservation.guest_email}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Phone</Label>
                  <p>{selectedReservation.guest_phone || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Date</Label>
                  <p>{selectedReservation.reservation_date}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Time</Label>
                  <p>{selectedReservation.reservation_time}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Party Size</Label>
                  <p>{selectedReservation.party_size} guests</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Created</Label>
                  <p>{format(new Date(selectedReservation.created_at), "PPp")}</p>
                </div>
              </div>
              {selectedReservation.special_requests && (
                <div>
                  <Label className="text-muted-foreground">Special Requests</Label>
                  <p className="mt-1 p-3 bg-secondary/50 rounded-lg">{selectedReservation.special_requests}</p>
                </div>
              )}
              {selectedReservation.notes && (
                <div>
                  <Label className="text-muted-foreground">Notes</Label>
                  <p className="mt-1 p-3 bg-secondary/50 rounded-lg">{selectedReservation.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Reservation Notes</DialogTitle>
            <DialogDescription>Add internal notes for this reservation</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Add notes..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={updateNotes}>Save Notes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminReservations;
