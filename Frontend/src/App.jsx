import { useState, useEffect, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from 'recharts';
import {
  Wallet, TrendingDown, Plus, Calendar,
  CreditCard, Search, LogOut, Receipt, Layers, Activity, X
} from 'lucide-react';
import AuthGateway from './AuthGateway';
import './App.css';

// Cloud-ready Dynamic API Base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// Harmonious category palette for stacked visual layers
const CATEGORY_PALETTE = [
  '#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ec4899',
  '#8b5cf6', '#14b8a6', '#f97316', '#06b6d4', '#84cc16'
];

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('vault_token'));

  // Date State
  const currentLiveDate = new Date();
  const currentMonthString = String(currentLiveDate.getMonth() + 1).padStart(2, '0');
  const currentYearString = String(currentLiveDate.getFullYear());

  const [selectedMonth, setSelectedMonth] = useState(currentMonthString);
  const [selectedYear, setSelectedYear] = useState(currentYearString);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Metadata & Transactions State
  const [categories, setCategories] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [transactions, setTransactions] = useState([]);

  // Form State
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(currentLiveDate.toISOString().split('T')[0]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [selectedPaymentSubtype, setSelectedPaymentSubtype] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ==========================================
  // Data Fetching
  // ==========================================
  const fetchMetadata = async () => {
    const token = localStorage.getItem('vault_token');
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/metadata`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
        setPaymentMethods(data.paymentMethods || []);
      }
    } catch (err) {
      console.error("Metadata fetch error:", err);
    }
  };

  const fetchTransactions = async () => {
    const token = localStorage.getItem('vault_token');
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/transactions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTransactions(Array.isArray(data) ? data : []);
      } else if (res.status === 401 || res.status === 403) {
        handleLogout();
      }
    } catch (err) {
      console.error("Transactions fetch error:", err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchMetadata();
      fetchTransactions();
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    localStorage.removeItem('vault_token');
    setIsAuthenticated(false);
    setTransactions([]);
  };

  // ==========================================
  // Analytics & Aggregations
  // ==========================================
  const activeScopeKey = `${selectedYear}-${selectedMonth}`;

  const monthlyTransactions = useMemo(() => {
    return transactions.filter(t => t && t.date && t.date.startsWith(activeScopeKey));
  }, [transactions, activeScopeKey]);

  const displayedTransactions = useMemo(() => {
    if (!searchTerm.trim()) return monthlyTransactions;
    const term = searchTerm.toLowerCase();
    return monthlyTransactions.filter(t =>
      t.description?.toLowerCase().includes(term) ||
      t.category?.categoryName?.toLowerCase().includes(term) ||
      t.subcategory?.subcategoryName?.toLowerCase().includes(term) ||
      t.paymentMethod?.paymentMethodName?.toLowerCase().includes(term) ||
      t.paymentSubtype?.paymentSubtypeName?.toLowerCase().includes(term)
    );
  }, [monthlyTransactions, searchTerm]);

  const totalMonthSpend = useMemo(() => {
    return monthlyTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
  }, [monthlyTransactions]);

  const daysInMonth = new Date(parseInt(selectedYear), parseInt(selectedMonth), 0).getDate();
  const dailyAverage = totalMonthSpend > 0 ? (totalMonthSpend / daysInMonth) : 0;

  const categoryBreakdown = useMemo(() => {
    const map = {};
    monthlyTransactions.forEach(t => {
      const name = t.category?.categoryName || 'Other';
      map[name] = (map[name] || 0) + (t.amount || 0);
    });
    return Object.keys(map)
      .map(name => ({
        name,
        amount: map[name],
        percentage: totalMonthSpend > 0 ? ((map[name] / totalMonthSpend) * 100).toFixed(1) : "0.0"
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [monthlyTransactions, totalMonthSpend]);

  const topCategory = categoryBreakdown.length > 0 ? categoryBreakdown[0] : null;

  // 📊 STACKED DAILY EXPENSE + CATEGORY BREAKDOWN PIPELINE
  const { dailyCategoryData, activeMonthCategoryNames } = useMemo(() => {
    const daysMap = {};
    const presentCategoriesSet = new Set();

    // Initialize every day of the active month
    for (let d = 1; d <= daysInMonth; d++) {
      const dayKey = `${activeScopeKey}-${String(d).padStart(2, '0')}`;
      daysMap[dayKey] = {
        day: String(d).padStart(2, '0'),
        dateKey: dayKey,
        totalDaily: 0
      };
    }

    // Populate category sums for each day
    monthlyTransactions.forEach(t => {
      if (daysMap[t.date]) {
        const catName = t.category?.categoryName || 'Other';
        presentCategoriesSet.add(catName);

        daysMap[t.date][catName] = (daysMap[t.date][catName] || 0) + (t.amount || 0);
        daysMap[t.date].totalDaily += (t.amount || 0);
      }
    });

    return {
      dailyCategoryData: Object.keys(daysMap).sort().map(k => daysMap[k]),
      activeMonthCategoryNames: Array.from(presentCategoriesSet)
    };
  }, [monthlyTransactions, daysInMonth, activeScopeKey]);

  // Multi-Month Historical Overview (Side Graph)
  const multiMonthHistory = useMemo(() => {
    const monthTotals = transactions.reduce((acc, t) => {
      if (!t || !t.date) return acc;
      const m = t.date.substring(0, 7);
      acc[m] = (acc[m] || 0) + (t.amount || 0);
      return acc;
    }, {});

    return Object.keys(monthTotals)
      .sort()
      .slice(-6)
      .map(m => {
        const [y, mon] = m.split('-');
        const dateObj = new Date(parseInt(y), parseInt(mon) - 1, 1);
        return {
          monthLabel: dateObj.toLocaleString('en-US', { month: 'short' }),
          amount: monthTotals[m]
        };
      });
  }, [transactions]);

  // Cascading Form Dependencies
  const activeCategoryObj = categories.find(c => String(c.categoryId) === String(selectedCategory));
  const availableSubcategories = activeCategoryObj ? (activeCategoryObj.subcategories || []) : [];

  const activePaymentObj = paymentMethods.find(p => String(p.paymentMethodId) === String(selectedPaymentMethod));
  const availablePaymentSubtypes = activePaymentObj ? (activePaymentObj.subtypes || []) : [];

  // ==========================================
  // Form Submission
  // ==========================================
  const handleSaveTransaction = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('vault_token');
    if (!token) return;

    setIsSubmitting(true);
    const payload = {
      amount: parseFloat(amount),
      description: description.trim(),
      date,
      category: { categoryId: parseInt(selectedCategory) },
      subcategory: selectedSubcategory ? { subcategoryId: parseInt(selectedSubcategory) } : null,
      paymentMethod: { paymentMethodId: parseInt(selectedPaymentMethod) },
      paymentSubtype: selectedPaymentSubtype ? { paymentSubtypeId: parseInt(selectedPaymentSubtype) } : null
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setAmount('');
        setDescription('');
        setSelectedCategory('');
        setSelectedSubcategory('');
        setSelectedPaymentMethod('');
        setSelectedPaymentSubtype('');
        setIsModalOpen(false);
        fetchTransactions();
      } else {
        alert('Failed to save transaction. Please check inputs.');
      }
    } catch (err) {
      alert('Network error while saving transaction.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Custom Tooltip for Stacked Daily Breakdown
  const CustomDailyTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      return (
        <div style={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '12px', color: '#f8fafc', fontSize: '12px', minWidth: '170px' }}>
          <div style={{ fontWeight: '700', borderBottom: '1px solid #334155', paddingBottom: '6px', marginBottom: '8px', color: '#e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
            <span>Day {label}</span>
            <span style={{ color: '#ef4444' }}>₹{dataPoint.totalDaily.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {payload.filter(p => p.value > 0).map((entry, index) => (
              <div key={index} style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                <span style={{ color: entry.color, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', backgroundColor: entry.color, borderRadius: '50%', display: 'inline-block' }}></span>
                  {entry.name}:
                </span>
                <span style={{ fontWeight: '600' }}>₹{Number(entry.value).toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  if (!isAuthenticated) {
    return <AuthGateway onAuthSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div style={{ backgroundColor: '#0b1120', minHeight: '100vh', width: '100%', display: 'flex', flexDirection: 'column', color: '#f8fafc' }}>

      {/* 🧭 FULL-WIDTH TOP NAVIGATION */}
      <header style={{ width: '100%', borderBottom: '1px solid #1e293b', backgroundColor: '#0f172a', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)', padding: '8px', borderRadius: '10px', display: 'flex' }}>
            <Wallet size={20} color="#ffffff" />
          </div>
          <div>
            <span style={{ fontSize: '17px', fontWeight: '700', letterSpacing: '-0.3px', color: '#ffffff' }}>FinanceOS</span>
            <span style={{ fontSize: '11px', color: '#64748b', marginLeft: '8px', fontWeight: '500' }}>Enterprise Edition</span>
          </div>
        </div>

        {/* Global Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#1e293b', padding: '6px 12px', borderRadius: '8px', border: '1px solid #334155' }}>
            <Calendar size={14} color="#94a3b8" style={{ marginRight: '8px' }} />
            <select
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: '#f8fafc', fontSize: '13px', fontWeight: '500', outline: 'none', cursor: 'pointer' }}
            >
              <option value="01" style={{ background: '#1e293b' }}>January</option>
              <option value="02" style={{ background: '#1e293b' }}>February</option>
              <option value="03" style={{ background: '#1e293b' }}>March</option>
              <option value="04" style={{ background: '#1e293b' }}>April</option>
              <option value="05" style={{ background: '#1e293b' }}>May</option>
              <option value="06" style={{ background: '#1e293b' }}>June</option>
              <option value="07" style={{ background: '#1e293b' }}>July</option>
              <option value="08" style={{ background: '#1e293b' }}>August</option>
              <option value="09" style={{ background: '#1e293b' }}>September</option>
              <option value="10" style={{ background: '#1e293b' }}>October</option>
              <option value="11" style={{ background: '#1e293b' }}>November</option>
              <option value="12" style={{ background: '#1e293b' }}>December</option>
            </select>
            <span style={{ color: '#475569', margin: '0 6px' }}>/</span>
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: '#f8fafc', fontSize: '13px', fontWeight: '500', outline: 'none', cursor: 'pointer' }}
            >
              <option value="2024" style={{ background: '#1e293b' }}>2024</option>
              <option value="2025" style={{ background: '#1e293b' }}>2025</option>
              <option value="2026" style={{ background: '#1e293b' }}>2026</option>
              <option value="2027" style={{ background: '#1e293b' }}>2027</option>
            </select>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#6366f1', color: '#ffffff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
          >
            <Plus size={16} /> Add Expense
          </button>

          <button
            onClick={handleLogout}
            style={{ display: 'flex', alignItems: 'center', background: '#1e293b', border: '1px solid #334155', color: '#ef4444', cursor: 'pointer', padding: '8px', borderRadius: '8px' }}
            title="Sign Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* 📊 MAIN DASHBOARD */}
      <main style={{ flex: 1, width: '100%', padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* ROW 1: KPI CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', width: '100%' }}>

          <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94a3b8', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>
              <span>Monthly Outflow</span>
              <TrendingDown size={16} color="#ef4444" />
            </div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff', marginTop: '8px' }}>
              ₹{totalMonthSpend.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
              {monthlyTransactions.length} recorded transactions
            </div>
          </div>

          <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94a3b8', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>
              <span>Daily Burn Rate</span>
              <Activity size={16} color="#6366f1" />
            </div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff', marginTop: '8px' }}>
              ₹{dailyAverage.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
              Average per day ({daysInMonth} days)
            </div>
          </div>

          <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94a3b8', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>
              <span>Primary Cost Center</span>
              <Layers size={16} color="#10b981" />
            </div>
            <div style={{ fontSize: '18px', fontWeight: '700', color: '#ffffff', marginTop: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {topCategory ? topCategory.name : 'N/A'}
            </div>
            <div style={{ fontSize: '12px', color: '#10b981', marginTop: '4px' }}>
              {topCategory ? `${topCategory.percentage}% of month total` : 'No data'}
            </div>
          </div>

          <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94a3b8', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>
              <span>Payment Routes</span>
              <CreditCard size={16} color="#f59e0b" />
            </div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff', marginTop: '8px' }}>
              {paymentMethods.length} Channels
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
              Dynamic metadata mapped
            </div>
          </div>

        </div>

        {/* ROW 2: DUAL CHARTS SECTION */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '20px', width: '100%' }}>

          {/* Main Chart: Daily Total Outflow & Category Stacks */}
          <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '14px', padding: '20px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#f8fafc' }}>
                Daily Expense & Category Distribution
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>
                Daily total outflow breakdown across categories for {selectedMonth}/{selectedYear}
              </p>
            </div>

            <div style={{ width: '100%', height: '250px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyCategoryData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                  <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `₹${v}`} />
                  <Tooltip content={<CustomDailyTooltip />} />

                  {/* Stacking category bars dynamically */}
                  {activeMonthCategoryNames.length === 0 ? (
                    <Bar dataKey="totalDaily" fill="#334155" radius={[4, 4, 0, 0]} />
                  ) : (
                    activeMonthCategoryNames.map((catName, index) => (
                      <Bar
                        key={catName}
                        dataKey={catName}
                        name={catName}
                        stackId="dailyStack"
                        fill={CATEGORY_PALETTE[index % CATEGORY_PALETTE.length]}
                        radius={index === activeMonthCategoryNames.length - 1 ? [3, 3, 0, 0] : [0, 0, 0, 0]}
                      />
                    ))
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Side Chart: Multi-Month Spend Bar Chart */}
          <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '14px', padding: '20px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#f8fafc' }}>
                Multi-Month Comparison
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>
                Historical outflow by period
              </p>
            </div>

            <div style={{ width: '100%', height: '250px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={multiMonthHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                  <XAxis dataKey="monthLabel" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `₹${v}`} />
                  <Tooltip
                    formatter={(val) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Total Outflow']}
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' }}
                  />
                  <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* ROW 3: CATEGORY MATRIX & TRANSACTION LEDGER */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) minmax(0, 2fr)', gap: '20px', width: '100%', alignItems: 'start' }}>

          {/* Category Distribution */}
          <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '14px', padding: '20px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: '600', color: '#f8fafc' }}>
              Category Distribution
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {categoryBreakdown.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#64748b', fontSize: '13px', padding: '30px 0' }}>
                  No expenditures recorded for this month.
                </div>
              ) : (
                categoryBreakdown.map((cat, idx) => (
                  <div key={idx}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                      <span style={{ color: '#e2e8f0', fontWeight: '500' }}>{cat.name}</span>
                      <span style={{ color: '#94a3b8' }}>₹{cat.amount.toLocaleString('en-IN')} <span style={{ color: '#64748b', fontSize: '11px' }}>({cat.percentage}%)</span></span>
                    </div>
                    <div style={{ width: '100%', height: '6px', backgroundColor: '#0f172a', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${cat.percentage}%`, height: '100%', backgroundColor: CATEGORY_PALETTE[idx % CATEGORY_PALETTE.length], borderRadius: '3px' }}></div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Transaction Ledger */}
          <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '14px', padding: '20px', display: 'flex', flexDirection: 'column' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#f8fafc' }}>
                  Transaction Ledger
                </h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>
                  {displayedTransactions.length} records found
                </p>
              </div>

              <div style={{ position: 'relative', minWidth: '240px', flex: '1', maxWidth: '320px' }}>
                <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input
                  type="text"
                  placeholder="Filter records..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px 9px 36px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#f8fafc', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '420px', overflowY: 'auto', paddingRight: '4px' }}>
              {displayedTransactions.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#64748b', fontSize: '13px', padding: '40px 0' }}>
                  No matching transaction logs found.
                </div>
              ) : (
                displayedTransactions.slice().reverse().map(t => (
                  <div key={t.transactionId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ padding: '8px', backgroundColor: '#1e293b', borderRadius: '8px', color: '#6366f1', display: 'flex' }}>
                        <Receipt size={16} />
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: '600', color: '#f8fafc' }}>{t.description}</div>
                        <div style={{ fontSize: '11px', color: '#64748b', display: 'flex', gap: '8px', marginTop: '3px', flexWrap: 'wrap' }}>
                          <span>{t.category?.categoryName}{t.subcategory ? ` / ${t.subcategory.subcategoryName}` : ''}</span>
                          <span>•</span>
                          <span>{t.paymentMethod?.paymentMethodName}{t.paymentSubtype ? ` (${t.paymentSubtype.paymentSubtypeName})` : ''}</span>
                          <span>•</span>
                          <span>{t.date}</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#ef4444', whiteSpace: 'nowrap' }}>
                      -₹{t.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>

        </div>

      </main>

      {/* 🚀 MODAL: RECORD EXPENSE */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100, padding: '20px' }}>
          <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', width: '100%', maxWidth: '480px', borderRadius: '16px', padding: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.6)', boxSizing: 'border-box' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '600', color: '#ffffff' }}>Record New Expense</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px', display: 'flex' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveTransaction} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#94a3b8', marginBottom: '5px' }}>Amount (INR)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#94a3b8', marginBottom: '5px' }}>Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Supermarket, Electricity Bill"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#94a3b8', marginBottom: '5px' }}>Category</label>
                  <select
                    value={selectedCategory}
                    onChange={e => { setSelectedCategory(e.target.value); setSelectedSubcategory(''); }}
                    required
                    style={{ width: '100%', padding: '10px 12px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#ffffff', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                  >
                    <option value="">Select Category</option>
                    {categories.map(c => (
                      <option key={c.categoryId} value={c.categoryId}>{c.categoryName}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#94a3b8', marginBottom: '5px' }}>Subcategory</label>
                  <select
                    value={selectedSubcategory}
                    onChange={e => setSelectedSubcategory(e.target.value)}
                    disabled={!availableSubcategories.length}
                    style={{ width: '100%', padding: '10px 12px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#ffffff', fontSize: '13px', outline: 'none', opacity: availableSubcategories.length ? 1 : 0.5, boxSizing: 'border-box' }}
                  >
                    <option value="">Select Subcategory</option>
                    {availableSubcategories.map(s => (
                      <option key={s.subcategoryId} value={s.subcategoryId}>{s.subcategoryName}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#94a3b8', marginBottom: '5px' }}>Payment Method</label>
                  <select
                    value={selectedPaymentMethod}
                    onChange={e => { setSelectedPaymentMethod(e.target.value); setSelectedPaymentSubtype(''); }}
                    required
                    style={{ width: '100%', padding: '10px 12px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#ffffff', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                  >
                    <option value="">Select Method</option>
                    {paymentMethods.map(p => (
                      <option key={p.paymentMethodId} value={p.paymentMethodId}>{p.paymentMethodName}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#94a3b8', marginBottom: '5px' }}>Payment Subtype</label>
                  <select
                    value={selectedPaymentSubtype}
                    onChange={e => setSelectedPaymentSubtype(e.target.value)}
                    disabled={!availablePaymentSubtypes.length}
                    style={{ width: '100%', padding: '10px 12px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#ffffff', fontSize: '13px', outline: 'none', opacity: availablePaymentSubtypes.length ? 1 : 0.5, boxSizing: 'border-box' }}
                  >
                    <option value="">Select Account / Card</option>
                    {availablePaymentSubtypes.map(s => (
                      <option key={s.paymentSubtypeId} value={s.paymentSubtypeId}>{s.paymentSubtypeName}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#94a3b8', marginBottom: '5px' }}>Transaction Date</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#ffffff', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ flex: 1, padding: '11px', backgroundColor: '#334155', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{ flex: 2, padding: '11px', backgroundColor: '#6366f1', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                >
                  {isSubmitting ? 'Saving...' : 'Add Transaction'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}

export default App;