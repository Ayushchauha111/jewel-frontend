import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getAuthHeaders } from '../../utils/authHelper';
import AuthService from '../../service/auth.service';
import AdminNav from './AdminNav';
import './AdminDashboard.css';
import './PriceManagement.css';

const API_URL = '/api';

function IncomeExpenseManagement() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('summary');
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [financialSummary, setFinancialSummary] = useState(null);
  const [incomeSummary, setIncomeSummary] = useState(null);
  const [expenseSummary, setExpenseSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [transactionForm, setTransactionForm] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    category: '',
    description: '',
    paymentMethod: 'CASH',
    referenceNumber: ''
  });

  useEffect(() => {
    if (viewMode === 'summary') {
      fetchFinancialSummary();
    } else if (viewMode === 'transactions') {
      fetchTransactions();
    }
  }, [viewMode, startDate, endDate]);

  const handleLogout = () => {
    AuthService.logout();
    navigate('/login');
  };

  const fetchFinancialSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const [financialRes, incomeRes, expenseRes] = await Promise.all([
        axios.get(`${API_URL}/income-expense/financial-summary`, {
          params: { startDate, endDate },
          headers: getAuthHeaders()
        }),
        axios.get(`${API_URL}/income-expense/income-summary`, {
          params: { startDate, endDate },
          headers: getAuthHeaders()
        }),
        axios.get(`${API_URL}/income-expense/expense-summary`, {
          params: { startDate, endDate },
          headers: getAuthHeaders()
        })
      ]);
      setFinancialSummary(financialRes.data);
      setIncomeSummary(incomeRes.data);
      setExpenseSummary(expenseRes.data);
    } catch (err) {
      console.error('Error fetching financial summary:', err);
      const status = err.response?.status;
      const msg = err.response?.data?.message || err.response?.data?.error;
      if (status === 401) setError('Please log in again.');
      else if (status === 403) setError('You do not have permission to view financial summary.');
      else if (msg) setError(msg);
      else setError('Failed to load financial summary. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/income-expense/transactions`, {
        params: { startDate, endDate },
        headers: getAuthHeaders()
      });
      setTransactions(response.data.sort((a, b) => new Date(b.transactionDate) - new Date(a.transactionDate)));
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitIncome = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await axios.post(`${API_URL}/income-expense/income`, null, {
        params: {
          date: transactionForm.date,
          amount: transactionForm.amount,
          category: transactionForm.category,
          description: transactionForm.description,
          paymentMethod: transactionForm.paymentMethod,
          referenceNumber: transactionForm.referenceNumber
        },
        headers: getAuthHeaders()
      });
      setSuccess('Income recorded successfully!');
      setTransactionForm({
        date: new Date().toISOString().split('T')[0],
        amount: '',
        category: '',
        description: '',
        paymentMethod: 'CASH',
        referenceNumber: ''
      });
      setTimeout(() => {
        setViewMode('summary');
        fetchFinancialSummary();
        setSuccess(null);
      }, 2000);
    } catch (err) {
      console.error('Error recording income:', err);
      setError(err.response?.data?.message || 'Failed to record income');
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitExpense = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await axios.post(`${API_URL}/income-expense/expense`, null, {
        params: {
          date: transactionForm.date,
          amount: transactionForm.amount,
          category: transactionForm.category,
          description: transactionForm.description,
          paymentMethod: transactionForm.paymentMethod,
          referenceNumber: transactionForm.referenceNumber
        },
        headers: getAuthHeaders()
      });
      setSuccess('Expense recorded successfully!');
      setTransactionForm({
        date: new Date().toISOString().split('T')[0],
        amount: '',
        category: '',
        description: '',
        paymentMethod: 'CASH',
        referenceNumber: ''
      });
      setTimeout(() => {
        setViewMode('summary');
        fetchFinancialSummary();
        setSuccess(null);
      }, 2000);
    } catch (err) {
      console.error('Error recording expense:', err);
      setError(err.response?.data?.message || 'Failed to record expense');
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTransaction = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;
    try {
      await axios.delete(`${API_URL}/income-expense/transactions/${id}`, {
        headers: getAuthHeaders()
      });
      setSuccess('Transaction deleted successfully!');
      fetchTransactions();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error deleting transaction:', err);
      setError('Failed to delete transaction');
      setTimeout(() => setError(null), 5000);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '₹0.00';
    const num = parseFloat(amount);
    if (isNaN(num)) return '₹0.00';
    return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatCategory = (category) => {
    if (!category) return '';
    return category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const incomeCategories = ['SALES', 'ONLINE_SALES', 'CREDIT_PAYMENT', 'OTHER_INCOME'];
  const expenseCategories = ['STOCK_PURCHASE', 'OPERATING_EXPENSE', 'TAX_PAYMENT', 'OTHER_EXPENSE'];
  const paymentMethods = ['CASH', 'CARD', 'UPI', 'BANK_TRANSFER', 'CREDIT', 'ONLINE'];

  return (
    <div className="admin-dashboard">
      <AdminNav title="💰 Income/Expense" onLogout={handleLogout} />

      <div className="price-management">
        <div className="price-header">
          <h1>💰 Income & Expense Management</h1>
          <p>Track and manage all financial transactions</p>
        </div>

        {error && (
          <div className="price-error-banner">{error}</div>
        )}

        {success && (
          <div className="price-success-banner">{success}</div>
        )}

        <div style={{ margin: '0 2rem 2rem 2rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            className={`price-action-btn ${viewMode === 'summary' ? '' : 'secondary'}`}
            onClick={() => setViewMode('summary')}
            style={{ fontSize: '0.875rem', padding: '0.75rem 1.5rem' }}
          >
            📊 Financial Summary
          </button>
          <button
            className={`price-action-btn ${viewMode === 'transactions' ? '' : 'secondary'}`}
            onClick={() => setViewMode('transactions')}
            style={{ fontSize: '0.875rem', padding: '0.75rem 1.5rem' }}
          >
            📋 All Transactions
          </button>
          <button
            className={`price-action-btn ${viewMode === 'add-income' ? '' : 'secondary'}`}
            onClick={() => setViewMode('add-income')}
            style={{ fontSize: '0.875rem', padding: '0.75rem 1.5rem' }}
          >
            💵 Add Income
          </button>
          <button
            className={`price-action-btn ${viewMode === 'add-expense' ? '' : 'secondary'}`}
            onClick={() => setViewMode('add-expense')}
            style={{ fontSize: '0.875rem', padding: '0.75rem 1.5rem' }}
          >
            💸 Add Expense
          </button>
        </div>

        {(viewMode === 'summary' || viewMode === 'transactions') && (
          <div className="price-search-card" style={{ marginBottom: '1.5rem' }}>
            <div className="price-search-row">
              <label style={{ marginRight: '0.5rem', fontWeight: 600 }}>Start Date:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <label style={{ marginRight: '0.5rem', fontWeight: 600 }}>End Date:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        )}

        {viewMode === 'summary' && (
          <div style={{ margin: '0 2rem' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem' }}>⏳ Loading financial summary...</div>
            ) : financialSummary ? (
              <div>
                <div className="price-cards" style={{ marginBottom: '2rem' }}>
                  <div className="price-card price-card--success">
                    <div className="price-card-header">
                      <div className="price-icon">💵</div>
                    </div>
                    <div className="price-label">Total Income</div>
                    <p className="price-value" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                      {formatCurrency(financialSummary.totalIncome)}
                    </p>
                  </div>
                  <div className="price-card price-card--danger">
                    <div className="price-card-header">
                      <div className="price-icon">💸</div>
                    </div>
                    <div className="price-label">Total Expenses</div>
                    <p className="price-value" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                      {formatCurrency(financialSummary.totalExpenses)}
                    </p>
                  </div>
                  <div className="price-card price-card--info">
                    <div className="price-card-header">
                      <div className="price-icon">📈</div>
                    </div>
                    <div className="price-label">Net Income</div>
                    <p className="price-value" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                      {formatCurrency(financialSummary.netIncome)}
                    </p>
                  </div>
                </div>

                {incomeSummary && incomeSummary.incomeByCategory && Object.keys(incomeSummary.incomeByCategory).length > 0 && (
                  <div className="price-table-container" style={{ marginBottom: '2rem' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>💵 Income by Category</h3>
                    <table className="price-table">
                      <thead>
                        <tr>
                          <th>Category</th>
                          <th>Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(incomeSummary.incomeByCategory).map(([category, amount]) => (
                          <tr key={category}>
                            <td style={{ fontWeight: '600' }}>{formatCategory(category)}</td>
                            <td style={{ fontWeight: 'bold', color: '#27ae60' }}>{formatCurrency(amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {expenseSummary && expenseSummary.expensesByCategory && Object.keys(expenseSummary.expensesByCategory).length > 0 && (
                  <div className="price-table-container">
                    <h3 style={{ marginBottom: '1.5rem' }}>💸 Expenses by Category</h3>
                    <table className="price-table">
                      <thead>
                        <tr>
                          <th>Category</th>
                          <th>Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(expenseSummary.expensesByCategory).map(([category, amount]) => (
                          <tr key={category}>
                            <td style={{ fontWeight: '600' }}>{formatCategory(category)}</td>
                            <td style={{ fontWeight: 'bold', color: '#e74c3c' }}>{formatCurrency(amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        )}

        {viewMode === 'transactions' && (
          <div style={{ margin: '0 2rem' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem' }}>⏳ Loading transactions...</div>
            ) : (
              <div className="price-table-container">
                <h3 style={{ marginBottom: '1.5rem' }}>📋 All Transactions ({transactions.length})</h3>
                {transactions.length > 0 ? (
                  <>
                    <div className="price-table-scroll">
                      <table className="price-table">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Type</th>
                            <th>Category</th>
                            <th>Amount</th>
                            <th>Payment Method</th>
                            <th>Description</th>
                            <th>Reference</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {transactions.map((transaction) => (
                            <tr key={transaction.id}>
                              <td>{formatDate(transaction.transactionDate)}</td>
                              <td>
                                <span className={`status-badge ${transaction.transactionType === 'INCOME' ? 'status-paid' : 'status-pending'}`}>
                                  {transaction.transactionType}
                                </span>
                              </td>
                              <td>{formatCategory(transaction.category)}</td>
                              <td style={{
                                fontWeight: 'bold',
                                color: transaction.transactionType === 'INCOME' ? '#27ae60' : '#e74c3c',
                                fontSize: '1.1rem'
                              }}>
                                {transaction.transactionType === 'INCOME' ? '+' : '-'}{formatCurrency(transaction.amount)}
                              </td>
                              <td>{formatCategory(transaction.paymentMethod) || '-'}</td>
                              <td>{transaction.description || '-'}</td>
                              <td>{transaction.referenceNumber || '-'}</td>
                              <td>
                                <button
                                  onClick={() => handleDeleteTransaction(transaction.id)}
                                  className="stock-btn-delete"
                                  style={{ fontSize: '0.75rem', padding: '0.5rem 1rem' }}
                                >
                                  🗑️ Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="admin-list-cards">
                      {transactions.map((transaction) => (
                        <div key={transaction.id} className="admin-list-card">
                          <div className="admin-list-card-main">
                            <div className="admin-list-card-title">{formatDate(transaction.transactionDate)} · {formatCategory(transaction.category)}</div>
                            <div className="admin-list-card-meta" style={{ color: transaction.transactionType === 'INCOME' ? '#27ae60' : '#e74c3c' }}>
                              {transaction.transactionType === 'INCOME' ? '+' : '-'}{formatCurrency(transaction.amount)} · {formatCategory(transaction.paymentMethod) || '-'}
                            </div>
                            <span className={`status-badge ${transaction.transactionType === 'INCOME' ? 'status-paid' : 'status-pending'}`}>{transaction.transactionType}</span>
                          </div>
                          <div className="admin-list-card-actions">
                            <button onClick={() => handleDeleteTransaction(transaction.id)} className="stock-btn-delete" style={{ fontSize: '0.75rem', padding: '0.5rem 1rem' }}>🗑️ Delete</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="price-empty-state">
                    <div className="price-empty-state-icon">📋</div>
                    <h3>No Transactions Found</h3>
                    <p>No transactions found for this date range</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {viewMode === 'add-income' && (
          <div style={{ margin: '0 2rem' }}>
            <div className="price-form-card">
              <div className="price-form-header">
                <span style={{ fontSize: '2rem' }}>💵</span>
                <h3>Record Income</h3>
              </div>
              <form onSubmit={handleSubmitIncome}>
                <div className="price-form-grid">
                  <div className="price-form-group">
                    <label>Date *</label>
                    <input
                      type="date"
                      value={transactionForm.date}
                      onChange={(e) => setTransactionForm({...transactionForm, date: e.target.value})}
                      required
                    />
                  </div>
                  <div className="price-form-group">
                    <label>Amount (₹) *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={transactionForm.amount}
                      onChange={(e) => setTransactionForm({...transactionForm, amount: e.target.value})}
                      required
                      placeholder="0.00"
                    />
                  </div>
                  <div className="price-form-group">
                    <label>Category *</label>
                    <select
                      value={transactionForm.category}
                      onChange={(e) => setTransactionForm({...transactionForm, category: e.target.value})}
                      required
                    >
                      <option value="">Select Category</option>
                      {incomeCategories.map(cat => (
                        <option key={cat} value={cat}>{formatCategory(cat)}</option>
                      ))}
                    </select>
                  </div>
                  <div className="price-form-group">
                    <label>Payment Method</label>
                    <select
                      value={transactionForm.paymentMethod}
                      onChange={(e) => setTransactionForm({...transactionForm, paymentMethod: e.target.value})}
                    >
                      {paymentMethods.map(method => (
                        <option key={method} value={method}>{formatCategory(method)}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="price-form-group">
                  <label>Description</label>
                  <textarea
                    value={transactionForm.description}
                    onChange={(e) => setTransactionForm({...transactionForm, description: e.target.value})}
                    rows="3"
                    placeholder="Transaction description..."
                  />
                </div>
                <div className="price-form-group">
                  <label>Reference Number</label>
                  <input
                    type="text"
                    value={transactionForm.referenceNumber}
                    onChange={(e) => setTransactionForm({...transactionForm, referenceNumber: e.target.value})}
                    placeholder="Invoice number, receipt number, etc."
                  />
                </div>
                <button type="submit" className="price-action-btn" disabled={loading}>
                  {loading ? '⏳ Recording...' : '💾 Record Income'}
                </button>
              </form>
            </div>
          </div>
        )}

        {viewMode === 'add-expense' && (
          <div style={{ margin: '0 2rem' }}>
            <div className="price-form-card">
              <div className="price-form-header">
                <span style={{ fontSize: '2rem' }}>💸</span>
                <h3>Record Expense</h3>
              </div>
              <form onSubmit={handleSubmitExpense}>
                <div className="price-form-grid">
                  <div className="price-form-group">
                    <label>Date *</label>
                    <input
                      type="date"
                      value={transactionForm.date}
                      onChange={(e) => setTransactionForm({...transactionForm, date: e.target.value})}
                      required
                    />
                  </div>
                  <div className="price-form-group">
                    <label>Amount (₹) *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={transactionForm.amount}
                      onChange={(e) => setTransactionForm({...transactionForm, amount: e.target.value})}
                      required
                      placeholder="0.00"
                    />
                  </div>
                  <div className="price-form-group">
                    <label>Category *</label>
                    <select
                      value={transactionForm.category}
                      onChange={(e) => setTransactionForm({...transactionForm, category: e.target.value})}
                      required
                    >
                      <option value="">Select Category</option>
                      {expenseCategories.map(cat => (
                        <option key={cat} value={cat}>{formatCategory(cat)}</option>
                      ))}
                    </select>
                  </div>
                  <div className="price-form-group">
                    <label>Payment Method</label>
                    <select
                      value={transactionForm.paymentMethod}
                      onChange={(e) => setTransactionForm({...transactionForm, paymentMethod: e.target.value})}
                    >
                      {paymentMethods.map(method => (
                        <option key={method} value={method}>{formatCategory(method)}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="price-form-group">
                  <label>Description</label>
                  <textarea
                    value={transactionForm.description}
                    onChange={(e) => setTransactionForm({...transactionForm, description: e.target.value})}
                    rows="3"
                    placeholder="Transaction description..."
                  />
                </div>
                <div className="price-form-group">
                  <label>Reference Number</label>
                  <input
                    type="text"
                    value={transactionForm.referenceNumber}
                    onChange={(e) => setTransactionForm({...transactionForm, referenceNumber: e.target.value})}
                    placeholder="Invoice number, receipt number, etc."
                  />
                </div>
                <button type="submit" className="price-action-btn" disabled={loading}>
                  {loading ? '⏳ Recording...' : '💾 Record Expense'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default IncomeExpenseManagement;
