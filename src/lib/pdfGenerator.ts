import jsPDF from "jspdf";

// Califorian logo as base64 (embedded for PDF generation)
const CALIFORIAN_LOGO_BASE64 = "data:image/png;base64,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";

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

// Format price in Turkish Lira (₺)
function formatTL(amount: number): string {
  // Format with Turkish locale - uses comma for decimal, period for thousands
  const formatted = new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  return `₺${formatted}`;
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

  // Colors - Califorian brand colors (matching the golden/bronze logo)
  const primaryColor: [number, number, number] = [196, 160, 82]; // Rich gold from logo #C4A052
  const darkColor: [number, number, number] = [26, 26, 26]; // Dark text #1A1A1A
  const accentColor: [number, number, number] = [166, 136, 62]; // Darker gold accent
  const textColor: [number, number, number] = [33, 33, 33];
  const mutedColor: [number, number, number] = [100, 100, 100];
  const lightBg: [number, number, number] = [250, 247, 242]; // Warm off-white

  // Header background with gradient effect
  doc.setFillColor(...lightBg);
  doc.rect(0, 0, pageWidth, 60, "F");
  
  // Top accent line with gold color
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 4, "F");

  // Add logo image
  try {
    doc.addImage(CALIFORIAN_LOGO_BASE64, "PNG", margin, 10, 45, 45);
  } catch (e) {
    // Fallback to text if image fails
    doc.setFont("helvetica", "bold");
    doc.setFontSize(28);
    doc.setTextColor(...primaryColor);
    doc.text("CALIFORIAN", margin, 35);
  }
  
  // Brand name next to logo
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.setTextColor(...darkColor);
  doc.text("CALIFORIAN", margin + 50, 30);
  
  // Tagline
  doc.setFont("helvetica", "italic");
  doc.setFontSize(10);
  doc.setTextColor(...primaryColor);
  doc.text(t("Mediterranean Kitchen & Bar", "Akdeniz Mutfağı & Bar"), margin + 50, 40);

  // Decorative line under tagline
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.5);
  doc.line(margin + 50, 45, margin + 130, 45);

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
