import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Mail, Phone, Calendar, Users, FileText, Eye, Search, TrendingUp, Clock, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { tr, enUS } from "date-fns/locale";

interface CateringLead {
  id: string;
  quote_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  event_date: string | null;
  event_type: string | null;
  guest_count: number | null;
  notes: string | null;
  selected_products: Array<{
    id: string;
    name: string;
    name_tr: string | null;
    category: string;
    unit: string;
    unit_tr: string | null;
    price_per_unit: number;
    quantity: number;
    total: number;
  }>;
  total_amount: number;
  status: string;
  created_at: string;
}

const STATUS_OPTIONS = [
  { value: "new", label: { en: "New", tr: "Yeni" }, color: "bg-blue-500" },
  { value: "contacted", label: { en: "Contacted", tr: "İletişime Geçildi" }, color: "bg-yellow-500" },
  { value: "negotiating", label: { en: "Negotiating", tr: "Görüşülüyor" }, color: "bg-orange-500" },
  { value: "confirmed", label: { en: "Confirmed", tr: "Onaylandı" }, color: "bg-green-500" },
  { value: "completed", label: { en: "Completed", tr: "Tamamlandı" }, color: "bg-primary" },
  { value: "cancelled", label: { en: "Cancelled", tr: "İptal" }, color: "bg-destructive" },
];

function formatTL(amount: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
  }).format(amount);
}

export default function AdminCateringLeads() {
  const { t, language } = useLanguage();
  const [leads, setLeads] = useState<CateringLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<CateringLead | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("catering_leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error(t("Failed to load leads", "Talepler yüklenemedi"));
    } else {
      // Type assertion for JSONB field
      const typedData = (data || []).map((lead) => ({
        ...lead,
        selected_products: lead.selected_products as CateringLead["selected_products"],
      }));
      setLeads(typedData);
    }
    setLoading(false);
  };

  const updateLeadStatus = async (leadId: string, newStatus: string) => {
    const { error } = await supabase
      .from("catering_leads")
      .update({ status: newStatus })
      .eq("id", leadId);

    if (error) {
      toast.error(t("Failed to update status", "Durum güncellenemedi"));
    } else {
      toast.success(t("Status updated", "Durum güncellendi"));
      fetchLeads();
    }
  };

  const getStatusBadge = (status: string) => {
    const statusOption = STATUS_OPTIONS.find((s) => s.value === status);
    if (!statusOption) return <Badge variant="outline">{status}</Badge>;

    return (
      <Badge className={`${statusOption.color} text-white`}>
        {language === "tr" ? statusOption.label.tr : statusOption.label.en}
      </Badge>
    );
  };

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      searchQuery === "" ||
      lead.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.customer_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.quote_number.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: leads.length,
    new: leads.filter((l) => l.status === "new").length,
    confirmed: leads.filter((l) => l.status === "confirmed" || l.status === "completed").length,
    totalValue: leads
      .filter((l) => l.status === "confirmed" || l.status === "completed")
      .reduce((sum, l) => sum + l.total_amount, 0),
  };

  const openDetails = (lead: CateringLead) => {
    setSelectedLead(lead);
    setDetailsOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" />
          {t("Catering Leads", "Catering Talepleri")}
        </h1>
        <p className="text-muted-foreground">
          {t("Manage customer quote requests", "Müşteri teklif taleplerini yönetin")}
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t("Total Leads", "Toplam Talep")}</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              {stats.total}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t("New Leads", "Yeni Talepler")}</CardDescription>
            <CardTitle className="text-3xl text-blue-600 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              {stats.new}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t("Confirmed", "Onaylanan")}</CardDescription>
            <CardTitle className="text-3xl text-green-600 flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              {stats.confirmed}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t("Total Value", "Toplam Değer")}</CardDescription>
            <CardTitle className="text-2xl text-primary flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              {formatTL(stats.totalValue)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("Search by name, email, or quote number...", "İsim, e-posta veya teklif numarası ile ara...")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder={t("Filter by status", "Duruma göre filtrele")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("All Statuses", "Tüm Durumlar")}</SelectItem>
            {STATUS_OPTIONS.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {language === "tr" ? status.label.tr : status.label.en}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Leads Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("Quote #", "Teklif No")}</TableHead>
                  <TableHead>{t("Customer", "Müşteri")}</TableHead>
                  <TableHead>{t("Event", "Etkinlik")}</TableHead>
                  <TableHead className="text-right">{t("Total", "Toplam")}</TableHead>
                  <TableHead>{t("Status", "Durum")}</TableHead>
                  <TableHead>{t("Date", "Tarih")}</TableHead>
                  <TableHead className="text-right">{t("Actions", "İşlemler")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {t("No leads found", "Talep bulunamadı")}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLeads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell className="font-mono text-sm">{lead.quote_number}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{lead.customer_name}</div>
                          <div className="text-sm text-muted-foreground">{lead.customer_email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {lead.event_type && <div>{lead.event_type}</div>}
                          {lead.event_date && (
                            <div className="text-muted-foreground">
                              {format(new Date(lead.event_date), "d MMM yyyy", {
                                locale: language === "tr" ? tr : enUS,
                              })}
                            </div>
                          )}
                          {lead.guest_count && (
                            <div className="text-muted-foreground">
                              {lead.guest_count} {t("guests", "misafir")}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatTL(lead.total_amount)}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={lead.status}
                          onValueChange={(value) => updateLeadStatus(lead.id, value)}
                        >
                          <SelectTrigger className="w-32 h-8">
                            <SelectValue>{getStatusBadge(lead.status)}</SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {STATUS_OPTIONS.map((status) => (
                              <SelectItem key={status.value} value={status.value}>
                                {language === "tr" ? status.label.tr : status.label.en}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(lead.created_at), "d MMM yyyy HH:mm", {
                          locale: language === "tr" ? tr : enUS,
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => openDetails(lead)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Lead Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              {t("Lead Details", "Talep Detayları")} - {selectedLead?.quote_number}
            </DialogTitle>
          </DialogHeader>

          {selectedLead && (
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>{t("Customer Information", "Müşteri Bilgileri")}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedLead.customer_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a href={`mailto:${selectedLead.customer_email}`} className="text-primary hover:underline">
                        {selectedLead.customer_email}
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <a href={`tel:${selectedLead.customer_phone}`} className="text-primary hover:underline">
                        {selectedLead.customer_phone}
                      </a>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>{t("Event Details", "Etkinlik Detayları")}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {selectedLead.event_type && (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">{t("Type:", "Tür:")}</span>
                        <span>{selectedLead.event_type}</span>
                      </div>
                    )}
                    {selectedLead.event_date && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {format(new Date(selectedLead.event_date), "d MMMM yyyy", {
                            locale: language === "tr" ? tr : enUS,
                          })}
                        </span>
                      </div>
                    )}
                    {selectedLead.guest_count && (
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {selectedLead.guest_count} {t("guests", "misafir")}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Products */}
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>{t("Selected Products", "Seçilen Ürünler")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("Product", "Ürün")}</TableHead>
                        <TableHead className="text-right">{t("Qty", "Adet")}</TableHead>
                        <TableHead className="text-right">{t("Unit Price", "Birim Fiyat")}</TableHead>
                        <TableHead className="text-right">{t("Total", "Toplam")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedLead.selected_products.map((product, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {language === "tr" && product.name_tr ? product.name_tr : product.name}
                              </div>
                              <div className="text-sm text-muted-foreground">{product.category}</div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            {product.quantity}{" "}
                            {language === "tr" && product.unit_tr ? product.unit_tr : product.unit}
                          </TableCell>
                          <TableCell className="text-right">{formatTL(product.price_per_unit)}</TableCell>
                          <TableCell className="text-right font-medium">{formatTL(product.total)}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={3} className="text-right font-bold">
                          {t("Grand Total", "Genel Toplam")}
                        </TableCell>
                        <TableCell className="text-right font-bold text-primary text-lg">
                          {formatTL(selectedLead.total_amount)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Notes */}
              {selectedLead.notes && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>{t("Additional Notes", "Ek Notlar")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm whitespace-pre-wrap">{selectedLead.notes}</p>
                  </CardContent>
                </Card>
              )}

              {/* Status Update */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{t("Status:", "Durum:")}</span>
                  {getStatusBadge(selectedLead.status)}
                </div>
                <Select
                  value={selectedLead.status}
                  onValueChange={(value) => {
                    updateLeadStatus(selectedLead.id, value);
                    setSelectedLead({ ...selectedLead, status: value });
                  }}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {language === "tr" ? status.label.tr : status.label.en}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
