import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import './NormalReceipt.css';


// --- Helpers ---
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

// --- Component ---
function NormalReceipt({ bill, onClose, showPrintButton = true }) {
  const contentRef = useRef(null);

  const handlePrint = useReactToPrint({
    contentRef,
    documentTitle: `Rough_Estimate_${bill?.billNumber || 'Order'}`,
    pageStyle: `
      @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; margin: 0; padding: 0; background: #fff; } }
      .normal-receipt { visibility: visible !important; }
    `,
    onBeforeGetContent: () =>
      new Promise((resolve) => {
        requestAnimationFrame(() => setTimeout(resolve, 400));
      }),
  });

  const items = bill?.items || [];
  const customer = bill?.customer || {};

  return (
    <div className="normal-receipt-wrap">
      {/* Control Buttons (hidden during print) */}
      <div className="normal-receipt-actions no-print">
        {showPrintButton && (
          <button type="button" className="normal-receipt-print-btn" onClick={() => handlePrint()}>
            🖨️ Print Receipt
          </button>
        )}
        {onClose && (
          <button type="button" className="normal-receipt-close-btn" onClick={onClose}>
            Close
          </button>
        )}
      </div>

      {/* Printable Area */}
      <div className="normal-receipt" ref={contentRef}>
        <header className="normal-receipt-header">
          <h1 className="normal-receipt-rough-title">Rough Estimate</h1>
        </header>

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
                <th>Code</th>
                <th>Carat</th>
                <th>Wt (g)</th>
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
                      <td>{gswt > 0 ? gswt.toFixed(3) : '—'}</td>
                      <td>{qty}</td>
                      <td>{ratePerGramGold != null ? formatCurrency(ratePerGramGold) : '—'}</td>
                      <td>{formatCurrency(metalAmount)}</td>
                    </tr>,
                    <tr key={`${item.id || idx}-diamond`} className="normal-receipt-diamond-row">
                      <td>Diamond ({diamondCt} ct)</td>
                      <td>—</td>
                      <td>—</td>
                      <td>—</td>
                      <td>{qty}</td>
                      <td>—</td>
                      <td>{formatCurrency(diamondAmt)}</td>
                    </tr>
                  ];
                }
                const itemGswt = w * qty;
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
                    <td>{itemGswt > 0 ? itemGswt.toFixed(3) : '—'}</td>
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
          <div className="totals-content">
            {bill?.totalDiamondAmount > 0 && (
              <>
                <p><span>Gold:</span> <span>{formatCurrency((parseFloat(bill.totalAmount) || 0) - parseFloat(bill.totalDiamondAmount))}</span></p>
                <p><span>Diamond:</span> <span>{formatCurrency(bill.totalDiamondAmount)}</span></p>
              </>
            )}
            <p><span>Subtotal:</span> <span>{formatCurrency(bill?.totalAmount)}</span></p>
            <p><span>Discount:</span> <span>-{formatCurrency(bill?.discountAmount || 0)}</span></p>
            <p><span>Making Charges:</span> <span>{formatCurrency(bill?.makingCharges || 0)}</span></p>
            <div className="grand-total-divider"></div>
            <p className="normal-receipt-total-row">
              <span><strong>Grand Total:</strong></span> 
              <span><strong>{formatCurrency(bill?.finalAmount)}</strong></span>
            </p>
            {bill?.paidAmount > 0 && (
              <p><span>Paid Amount:</span> <span>{formatCurrency(bill.paidAmount)}</span></p>
            )}
          </div>
        </div>

        {bill?.notes && (
          <div className="normal-receipt-notes">
            <strong>Notes:</strong> {bill.notes}
          </div>
        )}

        <p className="normal-receipt-thanks">Thank you for your purchase!</p>
      </div>
    </div>
  );
}

export default NormalReceipt;