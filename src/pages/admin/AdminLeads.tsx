import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Search, 
  Mail, 
  Phone, 
  Calendar,
  Download,
  RefreshCw,
  UserCheck,
  Clock
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { format } from "date-fns";
import { toast } from "sonner";

interface Lead {
  id: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string | null;
  party_size: number;
  reservation_date: string;
  reservation_time: string;
  status: string;
  created_at: string;
  special_requests: string | null;
}

const AdminLeads = () => {
  const { t } = useLanguage();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("reservations")
        .select("id, guest_name, guest_email, guest_phone, party_size, reservation_date, reservation_time, status, created_at, special_requests")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setLeads(data || []);
      setFilteredLeads(data || []);
    } catch (error) {
      console.error("Error fetching leads:", error);
      toast.error(t("Failed to load leads", "Müşteri adayları yüklenemedi"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredLeads(leads);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredLeads(
        leads.filter(
          (lead) =>
            lead.guest_name.toLowerCase().includes(query) ||
            lead.guest_email.toLowerCase().includes(query) ||
            (lead.guest_phone && lead.guest_phone.includes(query))
        )
      );
    }
  }, [searchQuery, leads]);

  const exportToCSV = () => {
    const headers = ["Name", "Phone", "Party Size", "Date", "Time", "Status", "Special Requests", "Created At"];
    const csvContent = [
      headers.join(","),
      ...leads.map((lead) =>
        [
          `"${lead.guest_name}"`,
          `"${lead.guest_phone || ""}"`,
          lead.party_size,
          lead.reservation_date,
          lead.reservation_time,
          lead.status,
          `"${lead.special_requests || ""}"`,
          format(new Date(lead.created_at), "yyyy-MM-dd HH:mm")
        ].join(",")
      )
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `leads_${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
    toast.success(t("Leads exported successfully", "Müşteri adayları başarıyla dışa aktarıldı"));
  };

  // Filter out placeholder emails
  const hasRealEmail = (email: string) => email && email !== "-" && !email.includes("@noemail.com");
  const uniqueEmails = new Set(leads.filter(l => hasRealEmail(l.guest_email)).map((l) => l.guest_email)).size;
  const todayLeads = leads.filter(
    (l) => format(new Date(l.created_at), "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground">
            {t("Customer Leads", "Müşteri Adayları")}
          </h1>
          <p className="text-muted-foreground">
            {t("Customers who made reservations", "Rezervasyon yapan müşteriler")}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchLeads} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            {t("Refresh", "Yenile")}
          </Button>
          <Button onClick={exportToCSV} disabled={leads.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            {t("Export CSV", "CSV İndir")}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("Total Leads", "Toplam Aday")}</p>
                <p className="text-2xl font-bold">{leads.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <UserCheck className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("Unique Emails", "Tekil E-posta")}</p>
                <p className="text-2xl font-bold">{uniqueEmails}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <Clock className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("Today's Leads", "Bugünkü Adaylar")}</p>
                <p className="text-2xl font-bold">{todayLeads}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t("Search by name, email or phone...", "İsim, e-posta veya telefon ile ara...")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Leads List */}
      <Card>
        <CardHeader>
          <CardTitle>{t("All Leads", "Tüm Müşteri Adayları")}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery
                ? t("No leads found matching your search", "Aramanızla eşleşen müşteri adayı bulunamadı")
                : t("No leads yet", "Henüz müşteri adayı yok")}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="pb-3 font-medium text-muted-foreground">{t("Name", "İsim")}</th>
                    <th className="pb-3 font-medium text-muted-foreground">{t("Contact", "İletişim")}</th>
                    <th className="pb-3 font-medium text-muted-foreground">{t("Reservation", "Rezervasyon")}</th>
                    <th className="pb-3 font-medium text-muted-foreground">{t("Status", "Durum")}</th>
                    <th className="pb-3 font-medium text-muted-foreground">{t("Added", "Eklenme")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-muted/50">
                      <td className="py-4">
                        <div className="font-medium">{lead.guest_name}</div>
                        <div className="text-sm text-muted-foreground">
                          {lead.party_size} {t("guests", "kişi")}
                        </div>
                      </td>
                      <td className="py-4">
                        {hasRealEmail(lead.guest_email) && (
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="h-3 w-3" />
                            <a href={`mailto:${lead.guest_email}`} className="text-primary hover:underline">
                              {lead.guest_email}
                            </a>
                          </div>
                        )}
                        {lead.guest_phone && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            <a href={`tel:${lead.guest_phone}`} className="hover:underline">
                              {lead.guest_phone}
                            </a>
                          </div>
                        )}
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(lead.reservation_date), "dd MMM yyyy")}
                        </div>
                        <div className="text-sm text-muted-foreground">{lead.reservation_time}</div>
                      </td>
                      <td className="py-4">
                        <Badge
                          variant={
                            lead.status === "confirmed"
                              ? "default"
                              : lead.status === "pending"
                              ? "secondary"
                              : lead.status === "cancelled"
                              ? "destructive"
                              : "outline"
                          }
                        >
                          {lead.status}
                        </Badge>
                      </td>
                      <td className="py-4 text-sm text-muted-foreground">
                        {format(new Date(lead.created_at), "dd MMM yyyy")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLeads;
