import { useState, useEffect, useMemo } from "react";
import { format, parseISO, isToday, isTomorrow, startOfDay, addDays } from "date-fns";
import { useBranch } from "@/contexts/BranchContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MapPin, CalendarDays, Search, Users, Clock, CheckCircle2, XCircle, Loader2, Plus, Calendar as CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Reservation {
  id: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string | null;
  party_size: number;
  reservation_date: string;
  reservation_time: string;
  status: string;
  special_requests: string | null;
  notes: string | null;
  table_id: string | null;
}

const statusConfig: Record<string, { label: string; labelTr: string; color: string }> = {
  pending: { label: "Pending", labelTr: "Bekliyor", color: "bg-yellow-500" },
  confirmed: { label: "Confirmed", labelTr: "Onaylandı", color: "bg-green-500" },
  cancelled: { label: "Cancelled", labelTr: "İptal", color: "bg-red-500" },
  completed: { label: "Completed", labelTr: "Tamamlandı", color: "bg-gray-500" },
  no_show: { label: "No Show", labelTr: "Gelmedi", color: "bg-orange-500" },
};

const BranchReservations = () => {
  const { branch } = useBranch();
  const { language, t } = useLanguage();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newReservation, setNewReservation] = useState({
    guest_name: "",
    guest_email: "",
    guest_phone: "",
    party_size: 2,
    reservation_date: format(new Date(), "yyyy-MM-dd"),
    reservation_time: "19:00",
    special_requests: "",
  });

  useEffect(() => {
    if (branch) {
      fetchReservations();

      const channel = supabase
        .channel(`branch-reservations-${branch.id}`)
        .on("postgres_changes", { event: "*", schema: "public", table: "reservations", filter: `branch_id=eq.${branch.id}` }, () => {
          fetchReservations();
        })
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    }
  }, [branch]);

  const fetchReservations = async () => {
    if (!branch) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("reservations")
      .select("*")
      .eq("branch_id", branch.id)
      .order("reservation_date", { ascending: true })
      .order("reservation_time", { ascending: true });

    if (error) {
      toast.error(t("Failed to load reservations", "Rezervasyonlar yüklenemedi"));
    } else {
      setReservations(data || []);
    }
    setLoading(false);
  };

  const updateStatus = async (id: string, newStatus: "pending" | "confirmed" | "cancelled" | "completed" | "no_show") => {
    const { error } = await supabase.from("reservations").update({ status: newStatus }).eq("id", id);
    if (error) {
      toast.error(t("Failed to update", "Güncellenemedi"));
    } else {
      toast.success(t("Status updated", "Durum güncellendi"));
      setReservations((prev) => prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r)));
    }
  };

  const createReservation = async () => {
    if (!branch) return;
    const { error } = await supabase.from("reservations").insert({
      ...newReservation,
      branch_id: branch.id,
      status: "confirmed" as const,
    });

    if (error) {
      toast.error(t("Failed to create reservation", "Rezervasyon oluşturulamadı"));
    } else {
      toast.success(t("Reservation created", "Rezervasyon oluşturuldu"));
      setIsCreateOpen(false);
      setNewReservation({
        guest_name: "",
        guest_email: "",
        guest_phone: "",
        party_size: 2,
        reservation_date: format(new Date(), "yyyy-MM-dd"),
        reservation_time: "19:00",
        special_requests: "",
      });
      fetchReservations();
    }
  };

  const filteredReservations = useMemo(() => {
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    return reservations.filter((r) => {
      const dateMatch = r.reservation_date === dateStr;
      const statusMatch = statusFilter === "all" || r.status === statusFilter;
      const searchMatch = !searchQuery || 
        r.guest_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.guest_email.toLowerCase().includes(searchQuery.toLowerCase());
      return dateMatch && statusMatch && searchMatch;
    });
  }, [reservations, selectedDate, statusFilter, searchQuery]);

  const stats = useMemo(() => {
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    const dayReservations = reservations.filter((r) => r.reservation_date === dateStr);
    return {
      total: dayReservations.length,
      confirmed: dayReservations.filter((r) => r.status === "confirmed").length,
      pending: dayReservations.filter((r) => r.status === "pending").length,
      totalGuests: dayReservations.filter((r) => r.status !== "cancelled").reduce((sum, r) => sum + r.party_size, 0),
    };
  }, [reservations, selectedDate]);

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
          <CalendarDays className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">{t("Reservations", "Rezervasyonlar")}</h1>
            {branch && (
              <p className="text-muted-foreground flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {branch.name}
              </p>
            )}
          </div>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          {t("New Reservation", "Yeni Rezervasyon")}
        </Button>
      </div>

      {/* Date Selector & Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card className="md:col-span-1">
          <CardContent className="p-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {format(selectedDate, "MMM d, yyyy")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={selectedDate} onSelect={(d) => d && setSelectedDate(d)} />
              </PopoverContent>
            </Popover>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-sm text-muted-foreground">{t("Total", "Toplam")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
            <p className="text-sm text-muted-foreground">{t("Confirmed", "Onaylı")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            <p className="text-sm text-muted-foreground">{t("Pending", "Bekliyor")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{stats.totalGuests}</p>
            <p className="text-sm text-muted-foreground">{t("Guests", "Misafir")}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder={t("Search...", "Ara...")} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("All Statuses", "Tüm Durumlar")}</SelectItem>
            {Object.entries(statusConfig).map(([key, config]) => (
              <SelectItem key={key} value={key}>{language === "tr" ? config.labelTr : config.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Reservations List */}
      <div className="space-y-3">
        {filteredReservations.map((reservation) => {
          const config = statusConfig[reservation.status] || statusConfig.pending;
          return (
            <Card key={reservation.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <p className="font-semibold">{reservation.guest_name}</p>
                      <Badge className={`${config.color} text-white`}>
                        {language === "tr" ? config.labelTr : config.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{reservation.reservation_time}</span>
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" />{reservation.party_size} {t("guests", "kişi")}</span>
                      <span>{reservation.guest_email}</span>
                    </div>
                    {reservation.special_requests && (
                      <p className="text-sm text-muted-foreground italic">"{reservation.special_requests}"</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {reservation.status === "pending" && (
                      <>
                        <Button size="sm" variant="outline" onClick={() => updateStatus(reservation.id, "confirmed")}>
                          <CheckCircle2 className="h-4 w-4 mr-1" />{t("Confirm", "Onayla")}
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => updateStatus(reservation.id, "cancelled")}>
                          <XCircle className="h-4 w-4 mr-1" />{t("Cancel", "İptal")}
                        </Button>
                      </>
                    )}
                    {reservation.status === "confirmed" && (
                      <Button size="sm" onClick={() => updateStatus(reservation.id, "completed")}>
                        {t("Complete", "Tamamla")}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {filteredReservations.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <CalendarDays className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{t("No reservations for this date", "Bu tarih için rezervasyon yok")}</p>
          </div>
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("New Reservation", "Yeni Rezervasyon")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t("Guest Name", "Misafir Adı")}</Label>
                <Input value={newReservation.guest_name} onChange={(e) => setNewReservation({ ...newReservation, guest_name: e.target.value })} />
              </div>
              <div>
                <Label>{t("Email", "E-posta")}</Label>
                <Input type="email" value={newReservation.guest_email} onChange={(e) => setNewReservation({ ...newReservation, guest_email: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t("Phone", "Telefon")}</Label>
                <Input value={newReservation.guest_phone} onChange={(e) => setNewReservation({ ...newReservation, guest_phone: e.target.value })} />
              </div>
              <div>
                <Label>{t("Party Size", "Kişi Sayısı")}</Label>
                <Input type="number" min={1} value={newReservation.party_size} onChange={(e) => setNewReservation({ ...newReservation, party_size: parseInt(e.target.value) || 1 })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t("Date", "Tarih")}</Label>
                <Input type="date" value={newReservation.reservation_date} onChange={(e) => setNewReservation({ ...newReservation, reservation_date: e.target.value })} />
              </div>
              <div>
                <Label>{t("Time", "Saat")}</Label>
                <Input type="time" value={newReservation.reservation_time} onChange={(e) => setNewReservation({ ...newReservation, reservation_time: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>{t("Special Requests", "Özel İstekler")}</Label>
              <Textarea value={newReservation.special_requests} onChange={(e) => setNewReservation({ ...newReservation, special_requests: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>{t("Cancel", "İptal")}</Button>
            <Button onClick={createReservation}>{t("Create", "Oluştur")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BranchReservations;
