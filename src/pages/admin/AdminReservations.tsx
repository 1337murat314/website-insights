import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
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
  Eye,
  CalendarDays,
  CalendarCheck,
  History,
  RefreshCw,
  UserCheck,
  AlertCircle
} from "lucide-react";
import { format, isToday, isFuture, isPast, parseISO, startOfDay } from "date-fns";

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
  const { t } = useLanguage();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("today");
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editNotes, setEditNotes] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    setIsLoading(true);
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

  const todayStr = format(new Date(), "yyyy-MM-dd");

  const todayReservations = reservations.filter(r => r.reservation_date === todayStr);
  const upcomingReservations = reservations.filter(r => r.reservation_date > todayStr);
  const pastReservations = reservations.filter(r => r.reservation_date < todayStr);

  const getFilteredReservations = (list: Reservation[]) => {
    let filtered = [...list];

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

    return filtered;
  };

  const getActiveList = () => {
    switch (activeTab) {
      case "today":
        return getFilteredReservations(todayReservations);
      case "upcoming":
        return getFilteredReservations(upcomingReservations);
      case "past":
        return getFilteredReservations(pastReservations);
      default:
        return getFilteredReservations(reservations);
    }
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
    if (!confirm(t("Are you sure you want to delete this reservation?", "Bu rezervasyonu silmek istediğinizden emin misiniz?"))) return;

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
    const labels: Record<string, string> = {
      pending: t("Pending", "Beklemede"),
      confirmed: t("Confirmed", "Onaylandı"),
      cancelled: t("Cancelled", "İptal"),
      completed: t("Completed", "Tamamlandı"),
      no_show: t("No Show", "Gelmedi"),
    };
    return <Badge variant="outline" className={styles[status as keyof typeof styles]}>{labels[status]}</Badge>;
  };

  // Stats
  const todayConfirmed = todayReservations.filter(r => r.status === "confirmed").length;
  const todayPending = todayReservations.filter(r => r.status === "pending").length;
  const todayGuests = todayReservations.filter(r => r.status !== "cancelled").reduce((sum, r) => sum + r.party_size, 0);
  const upcomingCount = upcomingReservations.filter(r => r.status !== "cancelled").length;

  const activeList = getActiveList();

  const ReservationCard = ({ reservation, index }: { reservation: Reservation; index: number }) => (
    <motion.div
      key={reservation.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
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
                {format(parseISO(reservation.reservation_date), "dd MMM yyyy")}
              </span>
              <span className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-4 w-4" />
                {reservation.reservation_time}
              </span>
              <span className="flex items-center gap-1 text-muted-foreground">
                <Users className="h-4 w-4" />
                {reservation.party_size} {t("guests", "kişi")}
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
                    title={t("Confirm", "Onayla")}
                  >
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive border-destructive/20 hover:bg-destructive/10"
                    onClick={() => updateStatus(reservation.id, "cancelled")}
                    title={t("Cancel", "İptal Et")}
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </>
              )}
              {reservation.status === "confirmed" && activeTab === "today" && (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-blue-500 border-blue-500/20 hover:bg-blue-500/10"
                  onClick={() => updateStatus(reservation.id, "completed")}
                  title={t("Mark Completed", "Tamamlandı Olarak İşaretle")}
                >
                  <UserCheck className="h-4 w-4" />
                </Button>
              )}
              {reservation.status === "confirmed" && activeTab === "past" && (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-gray-500 border-gray-500/20 hover:bg-gray-500/10"
                  onClick={() => updateStatus(reservation.id, "no_show")}
                  title={t("Mark No Show", "Gelmedi Olarak İşaretle")}
                >
                  <AlertCircle className="h-4 w-4" />
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setSelectedReservation(reservation);
                  setIsViewDialogOpen(true);
                }}
                title={t("View Details", "Detayları Gör")}
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
                title={t("Edit Notes", "Notları Düzenle")}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-destructive hover:bg-destructive/10"
                onClick={() => deleteReservation(reservation.id)}
                title={t("Delete", "Sil")}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground">
            {t("Reservations", "Rezervasyonlar")}
          </h1>
          <p className="text-muted-foreground">
            {t("Manage all restaurant bookings", "Tüm restoran rezervasyonlarını yönetin")}
          </p>
        </div>
        <Button variant="outline" onClick={fetchReservations} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          {t("Refresh", "Yenile")}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <CalendarDays className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("Today", "Bugün")}</p>
                <p className="text-2xl font-bold">{todayReservations.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("Confirmed Today", "Bugün Onaylı")}</p>
                <p className="text-2xl font-bold">{todayConfirmed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("Expected Guests", "Beklenen Misafir")}</p>
                <p className="text-2xl font-bold">{todayGuests}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-500/10 rounded-lg">
                <CalendarCheck className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("Upcoming", "Gelecek")}</p>
                <p className="text-2xl font-bold">{upcomingCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="today" className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            <span className="hidden sm:inline">{t("Today", "Bugün")}</span>
            <Badge variant="secondary" className="ml-1">{todayReservations.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="flex items-center gap-2">
            <CalendarCheck className="h-4 w-4" />
            <span className="hidden sm:inline">{t("Upcoming", "Gelecek")}</span>
            <Badge variant="secondary" className="ml-1">{upcomingReservations.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="past" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">{t("Past", "Geçmiş")}</span>
            <Badge variant="secondary" className="ml-1">{pastReservations.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">{t("All", "Tümü")}</span>
            <Badge variant="secondary" className="ml-1">{reservations.length}</Badge>
          </TabsTrigger>
        </TabsList>

        {/* Filters */}
        <Card className="border-border/50 mt-4">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("Search by name, email, or phone...", "İsim, e-posta veya telefon ile ara...")}
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder={t("Filter by status", "Duruma göre filtrele")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("All Status", "Tüm Durumlar")}</SelectItem>
                  <SelectItem value="pending">{t("Pending", "Beklemede")}</SelectItem>
                  <SelectItem value="confirmed">{t("Confirmed", "Onaylandı")}</SelectItem>
                  <SelectItem value="cancelled">{t("Cancelled", "İptal")}</SelectItem>
                  <SelectItem value="completed">{t("Completed", "Tamamlandı")}</SelectItem>
                  <SelectItem value="no_show">{t("No Show", "Gelmedi")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Content for all tabs */}
        <div className="space-y-4 mt-4">
          {isLoading ? (
            <Card className="border-border/50">
              <CardContent className="p-8 text-center">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                <p className="text-muted-foreground mt-2">{t("Loading reservations...", "Rezervasyonlar yükleniyor...")}</p>
              </CardContent>
            </Card>
          ) : activeList.length === 0 ? (
            <Card className="border-border/50">
              <CardContent className="p-8 text-center">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {activeTab === "today" && t("No reservations for today", "Bugün için rezervasyon yok")}
                  {activeTab === "upcoming" && t("No upcoming reservations", "Gelecek rezervasyon yok")}
                  {activeTab === "past" && t("No past reservations", "Geçmiş rezervasyon yok")}
                  {activeTab === "all" && t("No reservations found", "Rezervasyon bulunamadı")}
                </p>
              </CardContent>
            </Card>
          ) : (
            activeList.map((reservation, index) => (
              <ReservationCard key={reservation.id} reservation={reservation} index={index} />
            ))
          )}
        </div>
      </Tabs>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("Reservation Details", "Rezervasyon Detayları")}</DialogTitle>
          </DialogHeader>
          {selectedReservation && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">{t("Guest Name", "Misafir Adı")}</Label>
                  <p className="font-medium">{selectedReservation.guest_name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{t("Status", "Durum")}</Label>
                  <p>{getStatusBadge(selectedReservation.status)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{t("Email", "E-posta")}</Label>
                  <p>{selectedReservation.guest_email}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{t("Phone", "Telefon")}</Label>
                  <p>{selectedReservation.guest_phone || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{t("Date", "Tarih")}</Label>
                  <p>{format(parseISO(selectedReservation.reservation_date), "dd MMMM yyyy")}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{t("Time", "Saat")}</Label>
                  <p>{selectedReservation.reservation_time}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{t("Party Size", "Kişi Sayısı")}</Label>
                  <p>{selectedReservation.party_size} {t("guests", "kişi")}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{t("Created", "Oluşturulma")}</Label>
                  <p>{format(new Date(selectedReservation.created_at), "dd MMM yyyy HH:mm")}</p>
                </div>
              </div>
              {selectedReservation.special_requests && (
                <div>
                  <Label className="text-muted-foreground">{t("Special Requests", "Özel İstekler")}</Label>
                  <p className="mt-1 p-3 bg-secondary/50 rounded-lg">{selectedReservation.special_requests}</p>
                </div>
              )}
              {selectedReservation.notes && (
                <div>
                  <Label className="text-muted-foreground">{t("Notes", "Notlar")}</Label>
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
            <DialogTitle>{t("Edit Reservation Notes", "Rezervasyon Notlarını Düzenle")}</DialogTitle>
            <DialogDescription>{t("Add internal notes for this reservation", "Bu rezervasyon için dahili notlar ekleyin")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="notes">{t("Notes", "Notlar")}</Label>
              <Textarea
                id="notes"
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder={t("Add notes...", "Not ekleyin...")}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>{t("Cancel", "İptal")}</Button>
            <Button onClick={updateNotes}>{t("Save Notes", "Notları Kaydet")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminReservations;
