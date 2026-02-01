import React from 'react';
import './NormalReceipt.css';

const SHOP_NAME = process.env.REACT_APP_SHOP_NAME || 'Jewelry Shop';
const SHOP_ADDRESS = process.env.REACT_APP_SHOP_ADDRESS || '';
const SHOP_PHONE = process.env.REACT_APP_SHOP_PHONE || '';
const SHOP_EMAIL = process.env.REACT_APP_SHOP_EMAIL || '';
const SHOP_LOGO = process.env.REACT_APP_SHOP_LOGO || '/logo-gj.png';

function formatCurrency(amount) {
  if (amount == null) return '₹0.00';
  const n = parseFloat(amount);
  if (isNaN(n)) return '₹0.00';
  return '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function ratePerGram(unitPrice, weightGrams) {
  const up = parseFloat(unitPrice);
  const w = parseFloat(weightGrams);
  if (isNaN(up) || isNaN(w) || w <= 0) return null;
  return up / w;
}

function formatDate(dateString) {
  if (!dateString) return '—';
  const d = new Date(dateString);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function NormalReceipt({ bill, companyName, companyAddress, companyPhone, companyEmail, logoUrl, onClose, showPrintButton = true }) {
  const name = companyName || SHOP_NAME;
  const address = companyAddress || SHOP_ADDRESS;
  const phone = companyPhone || SHOP_PHONE;
  const email = companyEmail || SHOP_EMAIL;
  const logo = logoUrl || SHOP_LOGO;

  const items = bill?.items || [];
  const customer = bill?.customer || {};

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="normal-receipt-wrap">
      <div className="normal-receipt-actions no-print">
        {showPrintButton && (
          <button type="button" className="normal-receipt-print-btn" onClick={handlePrint}>
            🖨️ Print Receipt
          </button>
        )}
        {onClose && (
          <button type="button" className="normal-receipt-close-btn" onClick={onClose}>
            Close
          </button>
        )}
      </div>

      <div className="normal-receipt">
        <header className="normal-receipt-header">
          {logo && <img src={logo} alt={name} className="normal-receipt-logo" />}
          <h1 className="normal-receipt-shop-name">{name}</h1>
          {address && <p className="normal-receipt-address">{address}</p>}
          {phone && <p className="normal-receipt-phone">Phone: {phone}</p>}
          {email && <p className="normal-receipt-email">Email: {email}</p>}
        </header>

        <h2 className="normal-receipt-title">Receipt</h2>

        <div className="normal-receipt-meta">
          <p><strong>Bill No:</strong> {bill?.billNumber || '—'}</p>
          <p><strong>Date:</strong> {formatDate(bill?.createdAt)}</p>
          <p><strong>Customer:</strong> {customer?.name || '—'}</p>
          {customer?.phone && <p><strong>Phone:</strong> {customer.phone}</p>}
        </div>

        <div className="normal-receipt-table-wrap">
          <table className="normal-receipt-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Article Code</th>
                <th>Carat</th>
                <th>Diamond Ct</th>
                <th>Qty</th>
                <th>Rate (₹/g)</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {items.flatMap((item, idx) => {
                const imageUrl = item.stock?.imageUrl;
                const carat = item.carat != null ? item.carat : item.stock?.carat;
                const diamondCt = item.diamondCarat != null ? item.diamondCarat : item.stock?.diamondCarat;
                const w = parseFloat(item.weightGrams ?? item.stock?.weightGrams) || 0;
                const qty = item.quantity ?? 1;
                const diamondAmt = item.diamondAmount != null ? parseFloat(item.diamondAmount) : 0;
                const metalAmount = (parseFloat(item.totalPrice) || 0) - diamondAmt;
                const gswt = w * qty;
                const ratePerGramGold = gswt > 0 ? metalAmount / gswt : null;
                const rate = ratePerGram(item.unitPrice, w);

                if (diamondAmt > 0) {
                  return [
                    <tr key={`${item.id || idx}-gold`}>
                      <td>
                        <div className="normal-receipt-item-cell">
                          {imageUrl && (
                            <img src={imageUrl} alt="" className="normal-receipt-item-img" />
                          )}
                          <span>{item.itemName || item.stock?.articleName || '—'} (Gold)</span>
                        </div>
                      </td>
                      <td>{item.articleCode || item.stock?.articleCode || '—'}</td>
                      <td>{carat != null ? String(carat) : '—'}</td>
                      <td>—</td>
                      <td>{qty}</td>
                      <td>{ratePerGramGold != null ? formatCurrency(ratePerGramGold) : '—'}</td>
                      <td>{formatCurrency(metalAmount)}</td>
                    </tr>,
                    <tr key={`${item.id || idx}-diamond`} className="normal-receipt-diamond-row">
                      <td>Diamond</td>
                      <td>—</td>
                      <td>—</td>
                      <td>{diamondCt != null ? (parseFloat(diamondCt) * qty).toFixed(3) : '—'}</td>
                      <td>{qty}</td>
                      <td>—</td>
                      <td>{formatCurrency(diamondAmt)}</td>
                    </tr>
                  ];
                }
                return (
                  <tr key={item.id || idx}>
                    <td>
                      <div className="normal-receipt-item-cell">
                        {imageUrl && (
                          <img src={imageUrl} alt="" className="normal-receipt-item-img" />
                        )}
                        <span>{item.itemName || item.stock?.articleName || '—'}</span>
                      </div>
                    </td>
                    <td>{item.articleCode || item.stock?.articleCode || '—'}</td>
                    <td>{carat != null ? String(carat) : '—'}</td>
                    <td>{diamondCt != null ? String(diamondCt) : '—'}</td>
                    <td>{qty}</td>
                    <td>{rate != null ? formatCurrency(rate) : '—'}</td>
                    <td>{formatCurrency(item.totalPrice)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="normal-receipt-totals">
          {bill?.totalDiamondAmount != null && parseFloat(bill.totalDiamondAmount) > 0 && (
            <>
              <p><span>Gold</span><span>{formatCurrency((parseFloat(bill.totalAmount) || 0) - parseFloat(bill.totalDiamondAmount))}</span></p>
              <p><span>Diamond</span><span>{formatCurrency(bill.totalDiamondAmount)}</span></p>
              <p><span>Total (Gold + Diamond)</span><span>{formatCurrency(bill?.totalAmount)}</span></p>
            </>
          )}
          {(!bill?.totalDiamondAmount || parseFloat(bill.totalDiamondAmount) === 0) && (
            <p><span>Subtotal</span><span>{formatCurrency(bill?.totalAmount)}</span></p>
          )}
          <p><span>Discount</span><span>-{formatCurrency(bill?.discountAmount || 0)}</span></p>
          <p><span>Making Charges</span><span>{formatCurrency(bill?.makingCharges || 0)}</span></p>
          <p className="normal-receipt-total-row"><span>Total</span><span>{formatCurrency(bill?.finalAmount)}</span></p>
          {bill?.paidAmount != null && parseFloat(bill.paidAmount) > 0 && (
            <p><span>Paid</span><span>{formatCurrency(bill.paidAmount)}</span></p>
          )}
        </div>

        {bill?.notes && (
          <p className="normal-receipt-notes"><strong>Notes:</strong> {bill.notes}</p>
        )}

        <p className="normal-receipt-thanks">Thank you for your purchase!</p>
      </div>
    </div>
  );
}

export default NormalReceipt;
