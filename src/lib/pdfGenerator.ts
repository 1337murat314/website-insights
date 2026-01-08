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

export async function generateCateringQuotePDF(
  selectedProducts: SelectedProduct[],
  customerInfo: CustomerInfo,
  language: string
): Promise<void> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = 20;

  const t = (en: string, tr: string) => (language === "tr" ? tr : en);

  // Colors
  const primaryColor: [number, number, number] = [180, 120, 80]; // Warm bronze/gold
  const textColor: [number, number, number] = [40, 40, 40];
  const mutedColor: [number, number, number] = [100, 100, 100];

  // Header background
  doc.setFillColor(245, 240, 235);
  doc.rect(0, 0, pageWidth, 50, "F");

  // Logo text (since we can't easily embed image)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.setTextColor(...primaryColor);
  doc.text("CALIFORIAN", margin, 25);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...mutedColor);
  doc.text(t("Mediterranean Kitchen & Bar", "Akdeniz Mutfağı & Bar"), margin, 33);

  // Quote title
  doc.setFontSize(12);
  doc.setTextColor(...textColor);
  const quoteDate = new Date().toLocaleDateString(language === "tr" ? "tr-TR" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  doc.text(`${t("Quote Date", "Teklif Tarihi")}: ${quoteDate}`, pageWidth - margin, 25, { align: "right" });
  
  // Generate quote number
  const quoteNumber = `CAT-${Date.now().toString(36).toUpperCase()}`;
  doc.text(`${t("Quote #", "Teklif No")}: ${quoteNumber}`, pageWidth - margin, 33, { align: "right" });

  y = 60;

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(...primaryColor);
  doc.text(t("Catering Quote", "Catering Teklifi"), margin, y);
  y += 15;

  // Customer Info section
  doc.setFillColor(250, 248, 245);
  doc.roundedRect(margin, y - 5, pageWidth - margin * 2, 45, 3, 3, "F");
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...textColor);
  doc.text(t("Customer Details", "Müşteri Bilgileri"), margin + 5, y + 5);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  y += 15;
  
  const leftCol = margin + 5;
  const rightCol = pageWidth / 2 + 10;
  
  doc.text(`${t("Name", "Ad")}: ${customerInfo.name}`, leftCol, y);
  if (customerInfo.eventDate) {
    doc.text(`${t("Event Date", "Etkinlik Tarihi")}: ${customerInfo.eventDate}`, rightCol, y);
  }
  y += 7;
  
  doc.text(`${t("Email", "E-posta")}: ${customerInfo.email}`, leftCol, y);
  if (customerInfo.eventType) {
    doc.text(`${t("Event Type", "Etkinlik Türü")}: ${customerInfo.eventType}`, rightCol, y);
  }
  y += 7;
  
  doc.text(`${t("Phone", "Telefon")}: ${customerInfo.phone}`, leftCol, y);
  if (customerInfo.guestCount) {
    doc.text(`${t("Guest Count", "Misafir Sayısı")}: ${customerInfo.guestCount}`, rightCol, y);
  }
  y += 15;

  // Products table
  y += 5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...primaryColor);
  doc.text(t("Selected Products", "Seçilen Ürünler"), margin, y);
  y += 10;

  // Table header
  doc.setFillColor(...primaryColor);
  doc.rect(margin, y - 5, pageWidth - margin * 2, 10, "F");
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text(t("Product", "Ürün"), margin + 5, y + 1);
  doc.text(t("Quantity", "Miktar"), pageWidth - 95, y + 1);
  doc.text(t("Unit Price", "Birim Fiyat"), pageWidth - 65, y + 1);
  doc.text(t("Total", "Toplam"), pageWidth - 30, y + 1, { align: "right" });
  y += 10;

  // Group products by category
  const groupedProducts = selectedProducts.reduce((acc, sp) => {
    const category = language === "tr" && sp.product.category_tr ? sp.product.category_tr : sp.product.category;
    if (!acc[category]) acc[category] = [];
    acc[category].push(sp);
    return acc;
  }, {} as Record<string, SelectedProduct[]>);

  let grandTotal = 0;
  let rowIndex = 0;

  doc.setTextColor(...textColor);

  for (const [category, products] of Object.entries(groupedProducts)) {
    // Category header
    doc.setFillColor(250, 248, 245);
    doc.rect(margin, y - 4, pageWidth - margin * 2, 8, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...mutedColor);
    doc.text(category, margin + 5, y + 1);
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
        doc.setFillColor(252, 251, 250);
        doc.rect(margin, y - 4, pageWidth - margin * 2, 8, "F");
      }

      doc.setFontSize(9);
      
      // Truncate product name if too long
      const maxNameWidth = 70;
      let displayName = productName;
      while (doc.getTextWidth(displayName) > maxNameWidth && displayName.length > 3) {
        displayName = displayName.slice(0, -4) + "...";
      }
      
      doc.text(displayName, margin + 5, y + 1);
      doc.text(`${sp.quantity} ${unit}`, pageWidth - 95, y + 1);
      doc.text(`₺${sp.product.price_per_unit.toFixed(2)}`, pageWidth - 65, y + 1);
      doc.text(`₺${lineTotal.toFixed(2)}`, pageWidth - 30, y + 1, { align: "right" });
      
      y += 8;
      rowIndex++;

      // Check for page break
      if (y > 260) {
        doc.addPage();
        y = 20;
      }
    }
    y += 3;
  }

  // Total section
  y += 5;
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.5);
  doc.line(pageWidth - 80, y, pageWidth - margin, y);
  y += 10;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...primaryColor);
  doc.text(t("Grand Total", "Genel Toplam"), pageWidth - 80, y);
  doc.text(`₺${grandTotal.toFixed(2)}`, pageWidth - 30, y, { align: "right" });

  // Notes section
  if (customerInfo.notes) {
    y += 20;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...textColor);
    doc.text(t("Additional Notes", "Ek Notlar"), margin, y);
    y += 7;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...mutedColor);
    
    const notesLines = doc.splitTextToSize(customerInfo.notes, pageWidth - margin * 2);
    doc.text(notesLines, margin, y);
    y += notesLines.length * 5;
  }

  // Footer
  const footerY = 280;
  doc.setDrawColor(230, 225, 220);
  doc.setLineWidth(0.5);
  doc.line(margin, footerY - 10, pageWidth - margin, footerY - 10);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...mutedColor);
  doc.text(t("This quote is valid for 30 days from the date of issue.", "Bu teklif, düzenleme tarihinden itibaren 30 gün geçerlidir."), margin, footerY - 3);
  doc.text("Califorian Restaurant • catering@califorian.com • +90 555 123 4567", pageWidth / 2, footerY + 3, { align: "center" });

  // Save the PDF
  const fileName = `Califorian_Catering_Quote_${quoteNumber}.pdf`;
  doc.save(fileName);
}
