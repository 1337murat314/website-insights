import jsPDF from "jspdf";

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

// Format price in Turkish Lira (TL)
// Note: Using "TL" instead of ₺ symbol because jsPDF doesn't render Unicode symbols correctly
function formatTL(amount: number): string {
  // Format with Turkish locale - uses comma for decimal, period for thousands
  const formatted = new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  return `${formatted} TL`;
}

// Generate a quote number
export function generateQuoteNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `CAT-${timestamp}-${random}`;
}

export async function generateCateringQuotePDF(
  selectedProducts: SelectedProduct[],
  customerInfo: CustomerInfo,
  language: string,
  quoteNumber: string
): Promise<{ grandTotal: number }> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = 20;

  const t = (en: string, tr: string) => (language === "tr" ? tr : en);

  // Colors - Califorian brand colors (orange like the logo)
  const primaryColor: [number, number, number] = [234, 121, 56]; // Warm orange #EA7938
  const darkColor: [number, number, number] = [26, 26, 26]; // Dark text #1A1A1A
  const accentColor: [number, number, number] = [204, 91, 26]; // Darker orange accent #CC5B1A
  const textColor: [number, number, number] = [33, 33, 33];
  const mutedColor: [number, number, number] = [100, 100, 100];
  const lightBg: [number, number, number] = [255, 248, 243]; // Warm peachy off-white

  // Header background with gradient effect
  doc.setFillColor(...lightBg);
  doc.rect(0, 0, pageWidth, 60, "F");
  
  // Top accent line with gold color
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 4, "F");

  // Brand name header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.setTextColor(...primaryColor);
  doc.text("CALIFORIAN", margin, 32);
  
  // Tagline
  doc.setFont("helvetica", "italic");
  doc.setFontSize(10);
  doc.setTextColor(...accentColor);
  doc.text(t("Mediterranean Kitchen & Bar", "Akdeniz Mutfagi & Bar"), margin, 42);

  // Decorative line under tagline
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.5);
  doc.line(margin, 47, margin + 70, 47);

  // Quote info on right side
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...mutedColor);
  
  const quoteDate = new Date().toLocaleDateString(language === "tr" ? "tr-TR" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  
  doc.text(t("Quote Date", "Teklif Tarihi"), pageWidth - margin, 18, { align: "right" });
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...textColor);
  doc.text(quoteDate, pageWidth - margin, 25, { align: "right" });
  
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...mutedColor);
  doc.text(t("Quote Number", "Teklif Numarası"), pageWidth - margin, 35, { align: "right" });
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...primaryColor);
  doc.text(quoteNumber, pageWidth - margin, 42, { align: "right" });

  y = 70;

  // Title section
  doc.setFillColor(...primaryColor);
  doc.roundedRect(margin, y - 8, pageWidth - margin * 2, 16, 2, 2, "F");
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text(t("CATERING QUOTATION", "CATERİNG TEKLİFİ"), pageWidth / 2, y + 2, { align: "center" });
  
  y += 20;

  // Customer Info section
  doc.setFillColor(...lightBg);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 50, 3, 3, "F");
  
  // Section header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...primaryColor);
  doc.text(t("Customer Details", "Müşteri Bilgileri"), margin + 8, y + 12);
  
  // Customer info grid
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const leftCol = margin + 8;
  const rightCol = pageWidth / 2 + 5;
  let infoY = y + 22;
  
  // Left column
  doc.setTextColor(...mutedColor);
  doc.text(t("Name:", "Ad Soyad:"), leftCol, infoY);
  doc.setTextColor(...textColor);
  doc.text(customerInfo.name, leftCol + 25, infoY);
  
  infoY += 8;
  doc.setTextColor(...mutedColor);
  doc.text(t("Email:", "E-posta:"), leftCol, infoY);
  doc.setTextColor(...textColor);
  doc.text(customerInfo.email, leftCol + 25, infoY);
  
  infoY += 8;
  doc.setTextColor(...mutedColor);
  doc.text(t("Phone:", "Telefon:"), leftCol, infoY);
  doc.setTextColor(...textColor);
  doc.text(customerInfo.phone, leftCol + 25, infoY);
  
  // Right column
  infoY = y + 22;
  if (customerInfo.eventDate) {
    doc.setTextColor(...mutedColor);
    doc.text(t("Event Date:", "Etkinlik Tarihi:"), rightCol, infoY);
    doc.setTextColor(...textColor);
    const formattedDate = new Date(customerInfo.eventDate).toLocaleDateString(
      language === "tr" ? "tr-TR" : "en-US",
      { year: "numeric", month: "long", day: "numeric" }
    );
    doc.text(formattedDate, rightCol + 35, infoY);
  }
  
  infoY += 8;
  if (customerInfo.eventType) {
    doc.setTextColor(...mutedColor);
    doc.text(t("Event Type:", "Etkinlik Türü:"), rightCol, infoY);
    doc.setTextColor(...textColor);
    doc.text(customerInfo.eventType, rightCol + 35, infoY);
  }
  
  infoY += 8;
  if (customerInfo.guestCount) {
    doc.setTextColor(...mutedColor);
    doc.text(t("Guest Count:", "Misafir Sayısı:"), rightCol, infoY);
    doc.setTextColor(...textColor);
    doc.text(customerInfo.guestCount, rightCol + 35, infoY);
  }
  
  y += 60;

  // Products table header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...primaryColor);
  doc.text(t("Selected Products & Services", "Seçilen Ürün ve Hizmetler"), margin, y);
  y += 8;

  // Table header
  doc.setFillColor(...primaryColor);
  doc.rect(margin, y, pageWidth - margin * 2, 10, "F");
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text(t("Product/Service", "Ürün/Hizmet"), margin + 5, y + 7);
  doc.text(t("Qty", "Adet"), pageWidth - 90, y + 7);
  doc.text(t("Unit Price", "Birim Fiyat"), pageWidth - 65, y + 7);
  doc.text(t("Total", "Toplam"), pageWidth - margin - 5, y + 7, { align: "right" });
  y += 12;

  // Group products by category
  const groupedProducts = selectedProducts.reduce((acc, sp) => {
    const category = language === "tr" && sp.product.category_tr ? sp.product.category_tr : sp.product.category;
    if (!acc[category]) acc[category] = [];
    acc[category].push(sp);
    return acc;
  }, {} as Record<string, SelectedProduct[]>);

  let grandTotal = 0;
  let rowIndex = 0;

  for (const [category, products] of Object.entries(groupedProducts)) {
    // Category header
    doc.setFillColor(245, 242, 238);
    doc.rect(margin, y - 1, pageWidth - margin * 2, 8, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...primaryColor);
    doc.text(category.toUpperCase(), margin + 5, y + 4);
    y += 10;

    doc.setFont("helvetica", "normal");
    doc.setTextColor(...textColor);

    for (const sp of products) {
      const productName = language === "tr" && sp.product.name_tr ? sp.product.name_tr : sp.product.name;
      const unit = language === "tr" && sp.product.unit_tr ? sp.product.unit_tr : sp.product.unit;
      const lineTotal = sp.product.price_per_unit * sp.quantity;
      grandTotal += lineTotal;

      // Alternate row background
      if (rowIndex % 2 === 0) {
        doc.setFillColor(252, 250, 248);
        doc.rect(margin, y - 3, pageWidth - margin * 2, 9, "F");
      }

      doc.setFontSize(9);
      
      // Truncate product name if too long
      const maxNameWidth = 75;
      let displayName = productName;
      while (doc.getTextWidth(displayName) > maxNameWidth && displayName.length > 3) {
        displayName = displayName.slice(0, -4) + "...";
      }
      
      doc.setTextColor(...textColor);
      doc.text(displayName, margin + 5, y + 3);
      doc.text(`${sp.quantity} ${unit}`, pageWidth - 90, y + 3);
      doc.text(formatTL(sp.product.price_per_unit), pageWidth - 65, y + 3);
      doc.setFont("helvetica", "bold");
      doc.text(formatTL(lineTotal), pageWidth - margin - 5, y + 3, { align: "right" });
      doc.setFont("helvetica", "normal");
      
      y += 9;
      rowIndex++;

      // Check for page break
      if (y > 240) {
        doc.addPage();
        y = 20;
        
        // Add continuation header on new page
        doc.setFillColor(...primaryColor);
        doc.rect(0, 0, pageWidth, 3, "F");
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(...primaryColor);
        doc.text(t("QUOTATION (Continued)", "TEKLİF (Devam)"), margin, y);
        doc.text(quoteNumber, pageWidth - margin, y, { align: "right" });
        y += 15;
      }
    }
    y += 2;
  }

  // Subtotal section
  y += 8;
  doc.setDrawColor(...accentColor);
  doc.setLineWidth(0.5);
  doc.line(pageWidth - 85, y, pageWidth - margin, y);
  y += 10;

  // Total box
  doc.setFillColor(...lightBg);
  doc.roundedRect(pageWidth - 90, y - 5, 70, 20, 2, 2, "F");
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(1);
  doc.roundedRect(pageWidth - 90, y - 5, 70, 20, 2, 2, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...mutedColor);
  doc.text(t("GRAND TOTAL", "GENEL TOPLAM"), pageWidth - 85, y + 4);
  
  doc.setFontSize(12);
  doc.setTextColor(...primaryColor);
  doc.text(formatTL(grandTotal), pageWidth - margin - 5, y + 4, { align: "right" });

  // Notes section
  if (customerInfo.notes) {
    y += 30;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...primaryColor);
    doc.text(t("Additional Notes", "Ek Notlar"), margin, y);
    y += 8;
    
    doc.setFillColor(...lightBg);
    const notesLines = doc.splitTextToSize(customerInfo.notes, pageWidth - margin * 2 - 16);
    const notesHeight = Math.min(notesLines.length * 5 + 10, 40);
    doc.roundedRect(margin, y - 4, pageWidth - margin * 2, notesHeight, 2, 2, "F");
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...textColor);
    doc.text(notesLines, margin + 8, y + 4);
    y += notesHeight;
  }

  // Terms section
  y = Math.max(y + 15, 235);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...primaryColor);
  doc.text(t("Terms & Conditions", "Şartlar ve Koşullar"), margin, y);
  y += 6;
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...mutedColor);
  const terms = [
    t("• This quote is valid for 30 days from the date of issue.", "• Bu teklif, düzenleme tarihinden itibaren 30 gün geçerlidir."),
    t("• A 50% deposit is required to confirm your booking.", "• Rezervasyonunuzu onaylamak için %50 depozito gereklidir."),
    t("• Final guest count must be confirmed 7 days before the event.", "• Kesin misafir sayısı etkinlikten 7 gün önce bildirilmelidir."),
    t("• Prices include VAT and service charge.", "• Fiyatlara KDV ve servis dahildir."),
  ];
  terms.forEach((term, i) => {
    doc.text(term, margin, y + i * 5);
  });

  // Footer
  const footerY = 280;
  doc.setFillColor(...primaryColor);
  doc.rect(0, footerY - 15, pageWidth, 25, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.text("CALIFORIAN", pageWidth / 2, footerY - 6, { align: "center" });
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255, 0.9);
  doc.text("catering@califorian.com  •  +90 555 123 4567  •  www.califorian.com", pageWidth / 2, footerY + 1, { align: "center" });

  // Save the PDF
  const fileName = `Califorian_Catering_${quoteNumber}.pdf`;
  doc.save(fileName);
  
  return { grandTotal };
}
