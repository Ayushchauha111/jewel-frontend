import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import './GSTReceipt.css';

// Company details – override via env or props
const SHOP_NAME = process.env.REACT_APP_SHOP_NAME || 'Jewelry Shop';
const SHOP_ADDRESS = process.env.REACT_APP_SHOP_ADDRESS || 'Address line 1, City, State – PIN';
const SHOP_PHONE = process.env.REACT_APP_SHOP_PHONE || '';
const SHOP_EMAIL = process.env.REACT_APP_SHOP_EMAIL || '';
const SHOP_GSTIN = process.env.REACT_APP_GSTIN || '09AXDPK0044L1ZI';
const SHOP_LOGO = process.env.REACT_APP_SHOP_LOGO || '/logo-gj.png';

// --- Helper Functions ---
const ONES = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
const TEENS = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

function toWords2(n) {
  if (n < 10) return ONES[n];
  if (n < 20) return TEENS[n - 10];
  const t = Math.floor(n / 10);
  const o = n % 10;
  return (TENS[t] + (o ? ' ' + ONES[o] : '')).trim();
}

function toWords3(n) {
  if (n === 0) return '';
  const h = Math.floor(n / 100);
  const r = n % 100;
  const part = h ? ONES[h] + ' Hundred' : '';
  return (part + (r ? ' ' + toWords2(r) : '')).trim();
}

function amountInWords(amount) {
  const num = Math.max(0, Math.floor(parseFloat(amount) || 0));
  if (num === 0) return 'Zero Only';
  let n = num;
  const crore = Math.floor(n / 1e7);
  n %= 1e7;
  const lakh = Math.floor(n / 1e5);
  n %= 1e5;
  const thousand = Math.floor(n / 1000);
  n %= 1000;
  const parts = [];
  if (crore) parts.push(toWords3(crore) + ' Crore');
  if (lakh) parts.push(toWords3(lakh) + ' Lakh');
  if (thousand) parts.push(toWords3(thousand) + ' Thousand');
  if (n) parts.push(toWords3(n));
  return (parts.join(' ') + ' Only').trim();
}

function formatCurrency(amount) {
  if (amount == null) return '₹0.00';
  const n = parseFloat(amount);
  return '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(dateString) {
  if (!dateString) return '—';
  const d = new Date(dateString);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

// --- Main Component ---
function GSTReceipt({ bill, companyName, companyAddress, companyPhone, companyEmail, gstin, logoUrl, onClose, showPrintButton = true }) {
  const contentRef = useRef(null);
  
  // High-fidelity print hook (delay so mobile gets content before clone, avoid empty PDF)
  const handlePrint = useReactToPrint({
    contentRef,
    documentTitle: `Invoice_${bill?.billNumber || 'Receipt'}`,
    pageStyle: `
      @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; margin: 0; padding: 0; background: #fff; } }
      .gst-receipt { visibility: visible !important; }
    `,
    onBeforeGetContent: () =>
      new Promise((resolve) => {
        requestAnimationFrame(() => setTimeout(resolve, 400));
      }),
  });

  const name = companyName || SHOP_NAME;
  const address = companyAddress || SHOP_ADDRESS;
  const phone = companyPhone || SHOP_PHONE;
  const email = companyEmail || SHOP_EMAIL;
  const gstinVal = (gstin !== undefined ? gstin : SHOP_GSTIN) || '';
  const logo = logoUrl || SHOP_LOGO;

  const items = bill?.items || [];
  const customer = bill?.customer || {};
  const totalAmount = parseFloat(bill?.totalAmount) || 0;
  const discountAmount = parseFloat(bill?.discountAmount) || 0;
  const finalAmount = parseFloat(bill?.finalAmount) || 0;
  const paidAmount = parseFloat(bill?.paidAmount) || 0;
  const makingCharges = parseFloat(bill?.makingCharges) || 0;

  const hallmarkChargesPerItem = 100;
  const hallmarkCharges = (items || []).reduce((sum, item) => sum + (item.hallmark ? hallmarkChargesPerItem : 0), 0);
  const taxableAmount = finalAmount + hallmarkCharges;
  const gstRate = 0.015; // 1.5% each for CGST/SGST
  const cgstAmount = taxableAmount * gstRate;
  const sgstAmount = taxableAmount * gstRate;
  const totalGst = cgstAmount + sgstAmount;
  const grandTotal = taxableAmount + totalGst;
  const roundOff = Math.round(grandTotal) - grandTotal;

  const totalGrossWeight = items.reduce((sum, i) => sum + (parseFloat(i.weightGrams) || 0) * (i.quantity || 1), 0);

  return (
    <div className="gst-receipt-wrap">
      {/* Action Bar (Hidden during Print) */}
      <div className="gst-receipt-actions no-print">
        {showPrintButton && (
          <button type="button" className="gst-receipt-print-btn" onClick={() => handlePrint()}>
            🖨️ Print GST Receipt
          </button>
        )}
        {onClose && (
          <button type="button" className="gst-receipt-close-btn" onClick={onClose}>
            Close
          </button>
        )}
      </div>

      {/* Printable Area */}
      <div className="gst-receipt" ref={contentRef}>
        <header className="gst-receipt-header">
          <div className="gst-receipt-company">
            {logo && <img src={logo} alt={name} className="gst-receipt-logo" />}
            <h1 className="gst-receipt-company-name">{name}</h1>
            <p className="gst-receipt-company-address">{address}</p>
            {phone && <p>Phone: {phone}</p>}
            {email && <p>Email: {email}</p>}
            {gstinVal && <p className="gst-receipt-gstin">GSTIN: {gstinVal}</p>}
          </div>
          <div className="gst-receipt-invoice-meta">
            <h2 className="gst-receipt-title">TAX INVOICE</h2>
            <p><strong>Invoice No:</strong> {bill?.billNumber || '—'}</p>
            <p><strong>Date:</strong> {formatDate(bill?.createdAt)}</p>
          </div>
        </header>

        <section className="gst-receipt-billto">
          <h3>Bill To</h3>
          <p><strong>{customer?.name || '—'}</strong></p>
          <p>{customer?.address || '—'}</p>
          <p>Phone: {customer?.phone || '—'}</p>
          {customer?.gstin && <p>GSTIN: {customer.gstin}</p>}
        </section>

        <div className="gst-receipt-table-wrap">
          <table className="gst-receipt-table">
            <thead>
              <tr>
                <th className="gst-receipt-cell-design">Photo</th>
                <th>Desc</th>
                <th>Carat</th>
                <th>Qty</th>
                <th>Gross Wt</th>
                <th>Rate</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.flatMap((item, idx) => {
                const imageUrl = item.stock?.imageUrl || item.imageUrl;
                const diamondAmt = item.diamondAmount != null ? parseFloat(item.diamondAmount) : 0;
                const diamondCt = item.diamondCarat != null ? item.diamondCarat : item.stock?.diamondCarat;
                const w = parseFloat(item.weightGrams ?? item.stock?.weightGrams) || 0;
                const qty = item.quantity ?? 1;
                const metalAmount = (parseFloat(item.totalPrice) || 0) - diamondAmt;

                if (diamondAmt > 0) {
                  return [
                    <tr key={`${item.id ?? idx}-gold`}>
                      <td className="gst-receipt-cell-design">
                        {imageUrl ? (
                          <img src={imageUrl} alt="" className="gst-receipt-article-img" />
                        ) : (
                          <span className="gst-receipt-no-img">—</span>
                        )}
                      </td>
                      <td>{item.itemName || item.stock?.articleName || '—'} (Gold)</td>
                      <td>{item.carat ?? item.stock?.carat ?? '—'}</td>
                      <td>{qty}</td>
                      <td>{(w * qty).toFixed(3)}g</td>
                      <td>{formatCurrency(item.unitPrice)}</td>
                      <td>{formatCurrency(metalAmount)}</td>
                    </tr>,
                    <tr key={`${item.id ?? idx}-diamond`} className="gst-receipt-diamond-row">
                      <td className="gst-receipt-cell-design">—</td>
                      <td>Diamond ({diamondCt != null ? diamondCt : '—'} ct)</td>
                      <td>—</td>
                      <td>{qty}</td>
                      <td>—</td>
                      <td>—</td>
                      <td>{formatCurrency(diamondAmt)}</td>
                    </tr>
                  ];
                }
                return (
                  <tr key={item.id ?? idx}>
                    <td className="gst-receipt-cell-design">
                      {imageUrl ? (
                        <img src={imageUrl} alt="" className="gst-receipt-article-img" />
                      ) : (
                        <span className="gst-receipt-no-img">—</span>
                      )}
                    </td>
                    <td>{item.itemName || item.stock?.articleName || 'Jewelry Item'}</td>
                    <td>{item.carat ?? item.stock?.carat ?? '—'}</td>
                    <td>{item.quantity ?? 1}</td>
                    <td>{(w * (item.quantity ?? 1)).toFixed(3)}g</td>
                    <td>{formatCurrency(item.unitPrice)}</td>
                    <td>{formatCurrency(item.totalPrice)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="gst-receipt-footer-flex">
          <div className="gst-receipt-words-section">
            <p className="gst-receipt-words-label">Amount in Words:</p>
            <p className="gst-receipt-words-text">{amountInWords(grandTotal + roundOff)}</p>
          </div>

          <div className="gst-receipt-summary-card">
            <table className="gst-receipt-summary-table">
              <tbody>
                <tr><td>Subtotal</td><td>{formatCurrency(totalAmount)}</td></tr>
                <tr><td>Discount</td><td>-{formatCurrency(discountAmount)}</td></tr>
                <tr><td>Making Charges</td><td>{formatCurrency(makingCharges)}</td></tr>
                {hallmarkCharges > 0 && (
                  <tr><td>Hallmark Charges (₹100/item)</td><td>{formatCurrency(hallmarkCharges)}</td></tr>
                )}
                <tr className="gst-receipt-summary-taxable"><td>Taxable Value</td><td>{formatCurrency(taxableAmount)}</td></tr>
                <tr><td>CGST (1.5%)</td><td>{formatCurrency(cgstAmount)}</td></tr>
                <tr><td>SGST (1.5%)</td><td>{formatCurrency(sgstAmount)}</td></tr>
                <tr><td>Round Off</td><td>{formatCurrency(roundOff)}</td></tr>
                <tr className="gst-receipt-summary-grand">
                  <td>Grand Total</td>
                  <td>{formatCurrency(grandTotal + roundOff)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <section className="gst-receipt-hsn-section">
          <h3 className="gst-receipt-hsn-heading">HSN Summary</h3>
          <table className="gst-receipt-hsn-table">
            <thead>
              <tr>
                <th>HSN Code</th>
                <th>Description</th>
                <th>Taxable Value</th>
                <th>Rate</th>
                <th>CGST (1.5%)</th>
                <th>SGST (1.5%)</th>
                <th>Total Tax</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>7113</td>
                <td>Articles of jewellery of precious metal</td>
                <td>{formatCurrency(taxableAmount)}</td>
                <td>3%</td>
                <td>{formatCurrency(cgstAmount)}</td>
                <td>{formatCurrency(sgstAmount)}</td>
                <td>{formatCurrency(totalGst)}</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section className="gst-receipt-terms">
          <p><strong>Terms:</strong> Goods once sold are not returnable. Certified jewelry prices subject to market gold rates.</p>
        </section>

        <div className="gst-receipt-signatures">
          <div className="sig-box">
            <div className="sig-line"></div>
            <p>Customer Signature</p>
          </div>
          <div className="sig-box">
            <div className="sig-line"></div>
            <p>Authorized Signatory</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GSTReceipt;