import { jsPDF } from 'jspdf';

export interface ReceiptData {
  orderId: string;
  receiptNumber: string;
  date: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  items: Array<{
    productName: string;
    sku: string;
    length: string | null;
    density: string | null;
    color: string | null;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  deliveryFee: number;
  total: number;
  mpesaReceiptNumber: string;
  paymentStatus: string;
  shippingAddress: {
    county: string;
    town: string;
    area: string;
    building?: string;
    apartment?: string;
    delivery_method: string;
  };
}

export const generateReceiptPdf = (data: ReceiptData) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Color Palette Definitions
  const colorChocolate = '#3A2118';
  const colorEspresso = '#211510';
  const colorBeige = '#E8D8C5';
  const colorChampagne = '#D6B98C';

  // Helper to draw horizontal lines
  const drawLine = (y: number, thickness: number = 0.2, color: string = '#E8D8C5') => {
    doc.setDrawColor(color);
    doc.setLineWidth(thickness);
    doc.line(20, y, 190, y);
  };

  // 1. BRAND HEADER
  doc.setTextColor(colorEspresso);
  doc.setFont('Helvetica', 'normal');
  
  // Brand title
  doc.setFontSize(22);
  doc.text("HAIR BANDS", 105, 25, { align: 'center' });
  
  // Tagline
  doc.setFontSize(9);
  doc.setTextColor(colorChampagne);
  doc.text("PREMIUM HAIR & HAIR-CARE", 105, 30, { align: 'center' });
  
  doc.setTextColor(colorEspresso);
  doc.setFontSize(8);
  doc.text("Westlands Beauty Room, Nairobi, Kenya | contact@lafriquebeaute.com", 105, 34, { align: 'center' });

  drawLine(40, 0.4, colorChocolate);

  // 2. RECEIPT META DETAILS
  doc.setFontSize(10);
  doc.setFont('Helvetica', 'bold');
  doc.text("INVOICE RECEIPT", 20, 50);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  
  // Left side
  doc.text(`Receipt Number: ${data.receiptNumber}`, 20, 58);
  doc.text(`Order ID: ${data.orderId}`, 20, 64);
  doc.text(`Date: ${new Date(data.date).toLocaleDateString()}`, 20, 70);

  // Right side
  doc.text(`Client Name: ${data.customerName}`, 120, 58);
  doc.text(`Phone: ${data.customerPhone}`, 120, 64);
  doc.text(`Email: ${data.customerEmail}`, 120, 70);

  drawLine(78, 0.2);

  // 3. SHIPPING & LOGISTICS INFO
  doc.setFont('Helvetica', 'bold');
  doc.text("DELIVERY LOGISTICS", 20, 86);
  doc.setFont('Helvetica', 'normal');
  
  if (data.shippingAddress.delivery_method === 'pickup') {
    doc.text("Method: In-Store Pickup at Westlands Salon", 20, 92);
  } else {
    doc.text(`Method: Express Door Delivery`, 20, 92);
    const addr = `${data.shippingAddress.county}, ${data.shippingAddress.town}, ${data.shippingAddress.area}${
      data.shippingAddress.building ? ', ' + data.shippingAddress.building : ''
    }${data.shippingAddress.apartment ? ', ' + data.shippingAddress.apartment : ''}`;
    doc.text(`Address: ${addr}`, 20, 98);
  }

  drawLine(106, 0.2);

  // 4. ITEMS TABLE HEADER
  doc.setFont('Helvetica', 'bold');
  doc.text("PRODUCT DETAILS", 20, 114);
  
  doc.text("ITEM", 20, 122);
  doc.text("QTY", 120, 122, { align: 'right' });
  doc.text("UNIT PRICE", 155, 122, { align: 'right' });
  doc.text("SUBTOTAL", 190, 122, { align: 'right' });
  
  drawLine(124, 0.4, colorChocolate);

  // 5. ITEMS MAPPING
  let currentY = 132;
  doc.setFont('Helvetica', 'normal');
  
  data.items.forEach((item) => {
    // Product Name & Variant subtitle
    doc.setFont('Helvetica', 'bold');
    doc.text(item.productName, 20, currentY);
    
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor('#777777');
    const varText = [
      item.sku,
      item.length ? `Length: ${item.length}` : '',
      item.density ? `Density: ${item.density}` : '',
      item.color ? `Color: ${item.color}` : ''
    ].filter(Boolean).join(' | ');
    doc.text(varText, 20, currentY + 4);
    
    doc.setFontSize(9);
    doc.setTextColor(colorEspresso);

    // Qty, Unit, Subtotal columns
    doc.text(item.quantity.toString(), 120, currentY, { align: 'right' });
    doc.text(`KSh ${item.price.toLocaleString()}`, 155, currentY, { align: 'right' });
    doc.text(`KSh ${(item.price * item.quantity).toLocaleString()}`, 190, currentY, { align: 'right' });

    currentY += 12;
  });

  drawLine(currentY, 0.2);

  // 6. TOTALS COLUMN
  currentY += 8;
  doc.text("Subtotal:", 140, currentY, { align: 'right' });
  doc.text(`KSh ${data.subtotal.toLocaleString()}`, 190, currentY, { align: 'right' });

  currentY += 6;
  doc.text("Delivery Fee:", 140, currentY, { align: 'right' });
  doc.text(`KSh ${data.deliveryFee.toLocaleString()}`, 190, currentY, { align: 'right' });

  currentY += 8;
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10);
  doc.text("GRAND TOTAL:", 140, currentY, { align: 'right' });
  doc.text(`KSh ${data.total.toLocaleString()}`, 190, currentY, { align: 'right' });

  // 7. PAYMENT DETAILS WATERMARK/BOX
  currentY += 16;
  doc.setFillColor('#F6EFE5');
  doc.rect(20, currentY, 170, 22, 'F');
  
  doc.setFontSize(8);
  doc.setTextColor(colorChocolate);
  doc.setFont('Helvetica', 'bold');
  doc.text("M-PESA PAYMENT VERIFICATION", 25, currentY + 6);
  
  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(colorEspresso);
  doc.text(`Method: Safaricom Lipa Na M-Pesa STK Push`, 25, currentY + 12);
  doc.text(`Transaction Reference ID: ${data.mpesaReceiptNumber}`, 25, currentY + 17);
  
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor('green');
  doc.text("STATUS: PAID & CONFIRMED", 120, currentY + 12);

  // Footer Note
  doc.setTextColor('#aaaaaa');
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  doc.text("Thank you for shopping with Hair Bands. Wear your crown with elegance.", 105, 275, { align: 'center' });

  // Trigger Save PDF in browser
  doc.save(`Receipt-${data.orderId}.pdf`);
};
