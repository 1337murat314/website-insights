import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus, Download, Loader2, ShoppingCart, X } from "lucide-react";
import { toast } from "sonner";
import { generateCateringQuotePDF, generateQuoteNumber } from "@/lib/pdfGenerator";
import { z } from "zod";

interface CateringProduct {
  id: string;
  name: string;
  name_tr: string | null;
  description: string | null;
  description_tr: string | null;
  category: string;
  category_tr: string | null;
  unit: string;
  unit_tr: string | null;
  price_per_unit: number;
  min_quantity: number;
  max_quantity: number | null;
}

interface SelectedProduct {
  product: CateringProduct;
  quantity: number;
}

interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  eventDate: string;
  eventType: string;
  guestCount: string;
  notes: string;
}

interface CateringQuoteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Validation schema
const customerInfoSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name too long"),
  email: z.string().trim().email("Invalid email").max(255, "Email too long"),
  phone: z.string().trim().min(1, "Phone is required").max(20, "Phone too long"),
  eventDate: z.string().optional(),
  eventType: z.string().max(100, "Event type too long").optional(),
  guestCount: z.string().max(10, "Guest count too long").optional(),
  notes: z.string().max(1000, "Notes too long").optional(),
});

export default function CateringQuoteModal({ open, onOpenChange }: CateringQuoteModalProps) {
  const { t, language } = useLanguage();
  const [products, setProducts] = useState<CateringProduct[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [step, setStep] = useState<"products" | "info">("products");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: "",
    email: "",
    phone: "",
    eventDate: "",
    eventType: "",
    guestCount: "",
    notes: "",
  });

  useEffect(() => {
    if (open) {
      fetchProducts();
    }
  }, [open]);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("catering_products")
      .select("*")
      .eq("is_available", true)
      .order("sort_order");

    if (error) {
      toast.error(t("Failed to load products", "Ürünler yüklenemedi"));
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  const groupedProducts = products.reduce((acc, product) => {
    const category = language === "tr" && product.category_tr ? product.category_tr : product.category;
    if (!acc[category]) acc[category] = [];
    acc[category].push(product);
    return acc;
  }, {} as Record<string, CateringProduct[]>);

  const getProductQuantity = (productId: string): number => {
    const selected = selectedProducts.find((sp) => sp.product.id === productId);
    return selected?.quantity || 0;
  };

  const updateQuantity = (product: CateringProduct, delta: number) => {
    setSelectedProducts((prev) => {
      const existing = prev.find((sp) => sp.product.id === product.id);
      const currentQty = existing?.quantity || 0;
      const newQty = Math.max(0, currentQty + delta);

      if (newQty > 0 && newQty < product.min_quantity) {
        if (delta > 0) {
          const updated = prev.filter((sp) => sp.product.id !== product.id);
          return [...updated, { product, quantity: product.min_quantity }];
        }
        return prev.filter((sp) => sp.product.id !== product.id);
      }

      if (product.max_quantity && newQty > product.max_quantity) {
        return prev;
      }

      if (newQty === 0) {
        return prev.filter((sp) => sp.product.id !== product.id);
      }

      if (existing) {
        return prev.map((sp) =>
          sp.product.id === product.id ? { ...sp, quantity: newQty } : sp
        );
      }

      return [...prev, { product, quantity: newQty }];
    });
  };

  const setQuantity = (product: CateringProduct, quantity: number) => {
    setSelectedProducts((prev) => {
      if (quantity === 0 || quantity < product.min_quantity) {
        return prev.filter((sp) => sp.product.id !== product.id);
      }

      if (product.max_quantity && quantity > product.max_quantity) {
        quantity = product.max_quantity;
      }

      const existing = prev.find((sp) => sp.product.id === product.id);
      if (existing) {
        return prev.map((sp) =>
          sp.product.id === product.id ? { ...sp, quantity } : sp
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const validateForm = (): boolean => {
    const result = customerInfoSchema.safeParse(customerInfo);
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          newErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(newErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const handleGeneratePDF = async () => {
    if (!validateForm()) {
      toast.error(t("Please fix the errors in the form", "Lütfen formdaki hataları düzeltin"));
      return;
    }

    setGenerating(true);
    try {
      const quoteNumber = generateQuoteNumber();
      
      // Generate the PDF and get the total
      const { grandTotal } = await generateCateringQuotePDF(
        selectedProducts, 
        customerInfo, 
        language,
        quoteNumber
      );

      // Prepare products data for storage
      const productsData = selectedProducts.map((sp) => ({
        id: sp.product.id,
        name: sp.product.name,
        name_tr: sp.product.name_tr,
        category: sp.product.category,
        unit: sp.product.unit,
        unit_tr: sp.product.unit_tr,
        price_per_unit: sp.product.price_per_unit,
        quantity: sp.quantity,
        total: sp.product.price_per_unit * sp.quantity,
      }));

      // Save lead to database
      const { error: saveError } = await supabase.from("catering_leads").insert({
        quote_number: quoteNumber,
        customer_name: customerInfo.name.trim(),
        customer_email: customerInfo.email.trim().toLowerCase(),
        customer_phone: customerInfo.phone.trim(),
        event_date: customerInfo.eventDate || null,
        event_type: customerInfo.eventType?.trim() || null,
        guest_count: customerInfo.guestCount ? parseInt(customerInfo.guestCount) : null,
        notes: customerInfo.notes?.trim() || null,
        selected_products: productsData,
        total_amount: grandTotal,
        status: "new",
      });

      if (saveError) {
        console.error("Failed to save lead:", saveError);
        // Still show success since PDF was generated
      }

      toast.success(t("Quote generated successfully!", "Teklif başarıyla oluşturuldu!"));
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error(t("Failed to generate quote", "Teklif oluşturulamadı"));
    }
    setGenerating(false);
  };

  const resetForm = () => {
    setSelectedProducts([]);
    setCustomerInfo({
      name: "",
      email: "",
      phone: "",
      eventDate: "",
      eventType: "",
      guestCount: "",
      notes: "",
    });
    setStep("products");
    setErrors({});
  };

  const getProductName = (product: CateringProduct) => {
    return language === "tr" && product.name_tr ? product.name_tr : product.name;
  };

  const getProductUnit = (product: CateringProduct) => {
    return language === "tr" && product.unit_tr ? product.unit_tr : product.unit;
  };

  const totalItems = selectedProducts.reduce((sum, sp) => sum + sp.quantity, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl font-serif">
            {step === "products"
              ? t("Create Your Quote", "Teklifinizi Oluşturun")
              : t("Contact Information", "İletişim Bilgileri")}
          </DialogTitle>
          <DialogDescription>
            {step === "products"
              ? t(
                  "Select the products you'd like for your event. Prices will be shown in your quote.",
                  "Etkinliğiniz için istediğiniz ürünleri seçin. Fiyatlar teklifinizde gösterilecektir."
                )
              : t(
                  "Enter your details to receive your personalized quote.",
                  "Kişiselleştirilmiş teklifinizi almak için bilgilerinizi girin."
                )}
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {step === "products" ? (
            <motion.div
              key="products"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col h-[calc(90vh-200px)]"
            >
              {loading ? (
                <div className="flex-1 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <ScrollArea className="flex-1 px-6">
                  <div className="space-y-6 pb-4">
                    {Object.entries(groupedProducts).map(([category, categoryProducts]) => (
                      <div key={category}>
                        <h3 className="text-lg font-semibold mb-3 sticky top-0 bg-background py-2 border-b border-border">
                          {category}
                        </h3>
                        <div className="grid gap-3">
                          {categoryProducts.map((product) => {
                            const quantity = getProductQuantity(product.id);
                            const isSelected = quantity > 0;
                            return (
                              <div
                                key={product.id}
                                className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                                  isSelected
                                    ? "border-primary bg-primary/5"
                                    : "border-border hover:border-primary/50"
                                }`}
                              >
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium truncate">{getProductName(product)}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {t("Min", "Min")}: {product.min_quantity} {getProductUnit(product)}
                                    {product.max_quantity && ` • ${t("Max", "Max")}: ${product.max_quantity}`}
                                  </p>
                                </div>
                                <div className="flex items-center gap-3 ml-4">
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() => updateQuantity(product, -1)}
                                      disabled={quantity === 0}
                                    >
                                      <Minus className="h-4 w-4" />
                                    </Button>
                                    <Input
                                      type="number"
                                      value={quantity || ""}
                                      onChange={(e) => setQuantity(product, parseInt(e.target.value) || 0)}
                                      className="w-16 h-8 text-center"
                                      placeholder="0"
                                      min={0}
                                    />
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() => updateQuantity(product, 1)}
                                    >
                                      <Plus className="h-4 w-4" />
                                    </Button>
                                  </div>
                                  <span className="text-sm text-muted-foreground w-16 text-right">
                                    {getProductUnit(product)}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}

              {/* Footer with selected items */}
              <div className="p-6 border-t border-border bg-muted/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-primary" />
                    <span className="font-medium">
                      {totalItems} {t("items selected", "ürün seçildi")}
                    </span>
                  </div>
                  <Button
                    size="lg"
                    onClick={() => setStep("info")}
                    disabled={selectedProducts.length === 0}
                  >
                    {t("Continue", "Devam Et")}
                  </Button>
                </div>
                {selectedProducts.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {selectedProducts.map((sp) => (
                      <Badge
                        key={sp.product.id}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {sp.quantity}x {getProductName(sp.product)}
                        <button
                          onClick={() => setQuantity(sp.product, 0)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="info"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-6 pt-4"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">{t("Full Name", "Ad Soyad")} *</Label>
                  <Input
                    id="name"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                    placeholder={t("Your name", "Adınız")}
                    className={errors.name ? "border-destructive" : ""}
                    maxLength={100}
                  />
                  {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t("Email", "E-posta")} *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                    placeholder="email@example.com"
                    className={errors.email ? "border-destructive" : ""}
                    maxLength={255}
                  />
                  {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">{t("Phone", "Telefon")} *</Label>
                  <Input
                    id="phone"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                    placeholder="+90 555 123 4567"
                    className={errors.phone ? "border-destructive" : ""}
                    maxLength={20}
                  />
                  {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="eventDate">{t("Event Date", "Etkinlik Tarihi")}</Label>
                  <Input
                    id="eventDate"
                    type="date"
                    value={customerInfo.eventDate}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, eventDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="eventType">{t("Event Type", "Etkinlik Türü")}</Label>
                  <Input
                    id="eventType"
                    value={customerInfo.eventType}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, eventType: e.target.value })}
                    placeholder={t("Wedding, Corporate, Birthday...", "Düğün, Kurumsal, Doğum Günü...")}
                    maxLength={100}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="guestCount">{t("Guest Count", "Misafir Sayısı")}</Label>
                  <Input
                    id="guestCount"
                    type="number"
                    value={customerInfo.guestCount}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, guestCount: e.target.value })}
                    placeholder="50"
                    min={1}
                    max={9999}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="notes">{t("Additional Notes", "Ek Notlar")}</Label>
                  <Textarea
                    id="notes"
                    value={customerInfo.notes}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, notes: e.target.value })}
                    placeholder={t(
                      "Any special requests or dietary requirements...",
                      "Özel istekler veya diyet gereksinimleri..."
                    )}
                    rows={3}
                    maxLength={1000}
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {customerInfo.notes.length}/1000
                  </p>
                </div>
              </div>

              {/* Selected products summary */}
              <div className="mt-6 p-4 bg-muted/50 rounded-xl">
                <h4 className="font-medium mb-2">{t("Selected Products", "Seçilen Ürünler")}</h4>
                <div className="space-y-1 text-sm">
                  {selectedProducts.map((sp) => (
                    <div key={sp.product.id} className="flex justify-between">
                      <span>{getProductName(sp.product)}</span>
                      <span className="text-muted-foreground">
                        {sp.quantity} {getProductUnit(sp.product)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button variant="outline" onClick={() => setStep("products")} className="flex-1">
                  {t("Back", "Geri")}
                </Button>
                <Button onClick={handleGeneratePDF} disabled={generating} className="flex-1">
                  {generating ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  {t("Download Quote", "Teklifi İndir")}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
