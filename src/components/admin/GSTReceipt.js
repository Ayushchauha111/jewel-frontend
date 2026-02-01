import React from 'react';
import './GSTReceipt.css';

// Company details – override via env or props
const SHOP_NAME = process.env.REACT_APP_SHOP_NAME || 'Jewelry Shop';
const SHOP_ADDRESS = process.env.REACT_APP_SHOP_ADDRESS || 'Address line 1, City, State – PIN';
const SHOP_PHONE = process.env.REACT_APP_SHOP_PHONE || '';
const SHOP_EMAIL = process.env.REACT_APP_SHOP_EMAIL || '';
const SHOP_GSTIN = process.env.REACT_APP_GSTIN || '09AXDPK0044L1ZI';
const SHOP_LOGO = process.env.REACT_APP_SHOP_LOGO || '/logo-gj.png';

// Indian rupees amount in words (integer part only, no paise)
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
  if (isNaN(n)) return '₹0.00';
  return '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(dateString) {
  if (!dateString) return '—';
  const d = new Date(dateString);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function GSTReceipt({ bill, companyName, companyAddress, companyPhone, companyEmail, gstin, logoUrl, onClose, showPrintButton = true }) {
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

  // CGST 1.5% + SGST 1.5% = 3% GST on taxable value (final amount = after discount + making charges)
  const taxableAmount = finalAmount;
  const gstRate = 0.015;
  const cgstAmount = taxableAmount * gstRate;
  const sgstAmount = taxableAmount * gstRate;
  const totalGst = cgstAmount + sgstAmount;
  const grandTotal = taxableAmount + totalGst;
  const roundOff = Math.round(grandTotal * 100) / 100 - grandTotal;
  const makingCharges = parseFloat(bill?.makingCharges) || 0;

  const totalGrossWeight = items.reduce((sum, i) => sum + (parseFloat(i.weightGrams) || 0) * (i.quantity || 1), 0);
  const totalNetWeight = totalGrossWeight; // same if no deduction; can be refined

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="gst-receipt-wrap">
      <div className="gst-receipt-actions no-print">
        {showPrintButton && (
          <button type="button" className="gst-receipt-print-btn" onClick={handlePrint}>
            🖨️ Print GST Receipt
          </button>
        )}
        {onClose && (
          <button type="button" className="gst-receipt-close-btn" onClick={onClose}>
            Close
          </button>
        )}
      </div>

      <div className="gst-receipt">
        {/* Header */}
        <header className="gst-receipt-header">
          <div className="gst-receipt-company">
            {logo && (
              <img src={logo} alt={name} className="gst-receipt-logo" />
            )}
            <h1 className="gst-receipt-company-name">{name}</h1>
            <p className="gst-receipt-company-address">{address}</p>
            {phone && <p>Phone: {phone}</p>}
            {email && <p>Email: {email}</p>}
            {gstinVal && <p className="gst-receipt-gstin">{gstinVal}</p>}
          </div>
          <div className="gst-receipt-invoice-meta">
            <h2 className="gst-receipt-title">Tax Invoice</h2>
            <p><strong>Invoice No:</strong> {bill?.billNumber || '—'}</p>
            <p><strong>Date:</strong> {formatDate(bill?.createdAt)}</p>
            <p><strong>Order ID:</strong> {bill?.billNumber || '—'}</p>
          </div>
        </header>

        {/* Bill To */}
        <section className="gst-receipt-billto">
          <h3>Bill To</h3>
          <p><strong>{customer?.name || '—'}</strong></p>
          {customer?.address && <p>{customer.address}</p>}
          {customer?.phone && <p>Phone: {customer.phone}</p>}
          {customer?.email && <p>Email: {customer.email}</p>}
          {customer?.gstin && <p>GSTIN: {customer.gstin}</p>}
        </section>

        {/* Product table with Design (image) */}
        <div className="gst-receipt-table-wrap">
          <table className="gst-receipt-table">
            <thead>
              <tr>
                <th>Prod ID</th>
                <th>Design</th>
                <th>Desc</th>
                <th>Carat</th>
                <th>Diamond Ct</th>
                <th>Qty</th>
                <th>GSWT (g)</th>
                <th>NT WT (g)</th>
                <th>Rate</th>
                <th>MKG</th>
                <th>DIA Val</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.flatMap((item, idx) => {
                const wt = parseFloat(item.weightGrams) || 0;
                const qty = item.quantity || 1;
                const gswt = wt * qty;
                const imageUrl = item.stock?.imageUrl;
                const carat = item.carat != null ? item.carat : item.stock?.carat;
                const diamondCt = item.diamondCarat != null ? item.diamondCarat : item.stock?.diamondCarat;
                const diamondAmt = item.diamondAmount != null ? parseFloat(item.diamondAmount) : 0;
                const metalAmount = (parseFloat(item.totalPrice) || 0) - diamondAmt;
                const metalRatePerUnit = qty > 0 ? metalAmount / qty : 0;
                const rows = [];
                const ratePerGramGold = gswt > 0 ? metalAmount / gswt : null;
                const ratePerGramSingle = wt > 0 && (parseFloat(item.unitPrice) || 0) > 0 ? parseFloat(item.unitPrice) / wt : null;
                if (diamondAmt > 0) {
                  rows.push(
                    <tr key={`${item.id || idx}-gold`}>
                      <td>{item.articleCode || item.stock?.articleCode || '—'}</td>
                      <td className="gst-receipt-cell-design">
                        {imageUrl ? (
                          <img src={imageUrl} alt="" className="gst-receipt-article-img" />
                        ) : (
                          <span className="gst-receipt-no-img">—</span>
                        )}
                      </td>
                      <td>{item.itemName || item.stock?.articleName || '—'} (Gold)</td>
                      <td>{carat != null ? String(carat) : '—'}</td>
                      <td>—</td>
                      <td>{qty}</td>
                      <td>{gswt.toFixed(3)}</td>
                      <td>{gswt.toFixed(3)}</td>
                      <td>{ratePerGramGold != null ? formatCurrency(ratePerGramGold) : '—'}</td>
                      <td>—</td>
                      <td>—</td>
                      <td>{formatCurrency(metalAmount)}</td>
                    </tr>,
                    <tr key={`${item.id || idx}-diamond`} className="gst-receipt-diamond-row">
                      <td>—</td>
                      <td className="gst-receipt-cell-design"><span className="gst-receipt-no-img">—</span></td>
                      <td>Diamond</td>
                      <td>—</td>
                      <td>{diamondCt != null ? (parseFloat(diamondCt) * qty).toFixed(3) : '—'}</td>
                      <td>{qty}</td>
                      <td>—</td>
                      <td>—</td>
                      <td>—</td>
                      <td>—</td>
                      <td>{formatCurrency(diamondAmt)}</td>
                      <td>{formatCurrency(diamondAmt)}</td>
                    </tr>
                  );
                } else {
                  rows.push(
                    <tr key={item.id || idx}>
                      <td>{item.articleCode || item.stock?.articleCode || '—'}</td>
                      <td className="gst-receipt-cell-design">
                        {imageUrl ? (
                          <img src={imageUrl} alt="" className="gst-receipt-article-img" />
                        ) : (
                          <span className="gst-receipt-no-img">—</span>
                        )}
                      </td>
                      <td>{item.itemName || item.stock?.articleName || '—'}</td>
                      <td>{carat != null ? String(carat) : '—'}</td>
                      <td>{diamondCt != null ? String(diamondCt) : '—'}</td>
                      <td>{qty}</td>
                      <td>{gswt.toFixed(3)}</td>
                      <td>{gswt.toFixed(3)}</td>
                      <td>{ratePerGramSingle != null ? formatCurrency(ratePerGramSingle) : (item.unitPrice != null ? formatCurrency(item.unitPrice) : '—')}</td>
                      <td>—</td>
                      <td>—</td>
                      <td>{formatCurrency(item.totalPrice)}</td>
                    </tr>
                  );
                }
                return rows;
              })}
            </tbody>
          </table>
        </div>

        {/* Total gold / weight summary + gold row + diamond row + total */}
        <div className="gst-receipt-summary">
          <p><strong>Total Gross Wt:</strong> {totalGrossWeight.toFixed(3)} g &nbsp; <strong>Total Net Wt:</strong> {totalNetWeight.toFixed(3)} g</p>
          <p><strong>Gold:</strong> {formatCurrency(totalAmount - (parseFloat(bill?.totalDiamondAmount) || 0))}</p>
          {bill?.totalDiamondAmount != null && parseFloat(bill.totalDiamondAmount) > 0 && (
            <p><strong>Diamond:</strong> {formatCurrency(bill.totalDiamondAmount)}</p>
          )}
          <p><strong>Subtotal:</strong> {formatCurrency(totalAmount)}</p>
          <p><strong>Discount:</strong> -{formatCurrency(discountAmount)}</p>
          <p><strong>Making Charges:</strong> {formatCurrency(makingCharges)}</p>
          <p><strong>Total:</strong> {formatCurrency(finalAmount)}</p>
        </div>

        {/* Payment details */}
        <section className="gst-receipt-payment">
          <h3>Payment Details</h3>
          <p><strong>Payment Method:</strong> {bill?.paymentMethod || '—'}</p>
          <p><strong>Total Received Amount:</strong> {formatCurrency(paidAmount)}</p>
        </section>

        {/* Taxation summary */}
        <section className="gst-receipt-tax">
          <h3>Taxation Summary</h3>
          <table className="gst-receipt-tax-table">
            <tbody>
              <tr><td>Taxable Amount</td><td>{formatCurrency(taxableAmount)}</td></tr>
              <tr><td>CGST (1.5%)</td><td>{formatCurrency(cgstAmount)}</td></tr>
              <tr><td>SGST (1.5%)</td><td>{formatCurrency(sgstAmount)}</td></tr>
              <tr><td>GST (3%)</td><td>{formatCurrency(totalGst)}</td></tr>
              <tr><td>Round Off</td><td>{formatCurrency(roundOff)}</td></tr>
              <tr><td><strong>Total Amount</strong></td><td><strong>{formatCurrency(grandTotal + roundOff)}</strong></td></tr>
              <tr><td>Net Received Amount</td><td>{formatCurrency(paidAmount)}</td></tr>
              <tr><td>Closing Balance</td><td>{formatCurrency((grandTotal + roundOff) - paidAmount)}</td></tr>
            </tbody>
          </table>
        </section>

        {/* HSN breakdown */}
        <section className="gst-receipt-hsn">
          <h3>HSN Summary</h3>
          <table className="gst-receipt-hsn-table">
            <thead>
              <tr>
                <th>HSN Code</th>
                <th>Taxable Value</th>
                <th>CGST Rate</th>
                <th>CGST Amount</th>
                <th>SGST Rate</th>
                <th>SGST Amount</th>
                <th>GST Rate</th>
                <th>GST Amount</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>7113</td>
                <td>{formatCurrency(taxableAmount)}</td>
                <td>1.5%</td>
                <td>{formatCurrency(cgstAmount)}</td>
                <td>1.5%</td>
                <td>{formatCurrency(sgstAmount)}</td>
                <td>3%</td>
                <td>{formatCurrency(totalGst)}</td>
                <td>{formatCurrency(taxableAmount + totalGst)}</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* Amount in words */}
        <p className="gst-receipt-words">
          <strong>Amount in Words:</strong> {amountInWords(grandTotal + roundOff)}
        </p>

        {/* Terms */}
        <section className="gst-receipt-terms">
          <h3>Terms &amp; Conditions</h3>
          <p>Goods once sold will not be taken back or exchanged. Price of the product is as per the rate prevailing at the time of purchase. Payment is required in full at the time of purchase unless otherwise agreed.</p>
        </section>

        {/* Signatures */}
        <div className="gst-receipt-signatures">
          <div className="gst-receipt-sig-block">
            <p className="gst-receipt-sig-label">Customer Signatory</p>
            <div className="gst-receipt-sig-line" />
          </div>
          <div className="gst-receipt-sig-block">
            <p className="gst-receipt-sig-label">Authorized Signatory</p>
            <div className="gst-receipt-sig-line" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default GSTReceipt;
export { amountInWords, formatCurrency, formatDate };
