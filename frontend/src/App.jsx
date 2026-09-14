import React, { useState, useMemo, useCallback } from 'react';
import AuthGateway from './AuthGateway';
import NavBar from './components/common/NavBar';
import DashboardKpis from './components/dashboard/DashboardKpis';
import DailySpendAreaChart from './components/dashboard/DailySpendAreaChart';
import MonthlyTrendChart from './components/dashboard/MonthlyTrendChart';
import CategoryDonutChart from './components/dashboard/CategoryDonutChart';
import TransactionLedger from './components/dashboard/TransactionLedger';
import AddExpenseModal from './components/modals/AddExpenseModal';
import { useFinanceData } from './hooks/useFinanceData';
import './App.css';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('vault_token'));

  const currentLiveDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(String(currentLiveDate.getMonth() + 1).padStart(2, '0'));
  const [selectedYear, setSelectedYear] = useState(String(currentLiveDate.getFullYear()));
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('vault_token');
    setIsAuthenticated(false);
  }, []);

  const {
    categories,
    paymentMethods,
    userPaymentSubtypes,
    transactions,
    addCustomAccount,
    createTransaction
  } = useFinanceData(isAuthenticated, handleLogout);

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

  const dailyTrendData = useMemo(() => {
    const daysMap = {};
    for (let d = 1; d <= daysInMonth; d++) {
      const dayKey = `${activeScopeKey}-${String(d).padStart(2, '0')}`;
      daysMap[dayKey] = {
        day: String(d).padStart(2, '0'),
        dateKey: dayKey,
        totalDaily: 0,
        breakdownMap: {}
      };
    }

    monthlyTransactions.forEach(t => {
      if (daysMap[t.date]) {
        const catName = t.category?.categoryName || 'Other';
        daysMap[t.date].totalDaily += (t.amount || 0);
        daysMap[t.date].breakdownMap[catName] = (daysMap[t.date].breakdownMap[catName] || 0) + (t.amount || 0);
      }
    });

    return Object.keys(daysMap).sort().map(k => ({
      day: daysMap[k].day,
      totalDaily: daysMap[k].totalDaily,
      breakdown: Object.keys(daysMap[k].breakdownMap).map(catName => ({
        name: catName,
        amount: daysMap[k].breakdownMap[catName]
      }))
    }));
  }, [monthlyTransactions, daysInMonth, activeScopeKey]);

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

  if (!isAuthenticated) {
    return <AuthGateway onAuthSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <>
      <Navbar
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        onOpenModal={() => setIsModalOpen(true)}
        onLogout={handleLogout}
      />

      <main className="dashboard-main">
        {/* Row 1: KPI Cards */}
        <div className="kpi-grid">
          <DashboardKpis
            totalMonthSpend={totalMonthSpend}
            transactionCount={monthlyTransactions.length}
            dailyAverage={dailyAverage}
            daysInMonth={daysInMonth}
            topCategory={topCategory}
            savedAccountsCount={userPaymentSubtypes.length}
          />
        </div>

        {/* Row 2: Analytics Charts */}
        <div className="charts-grid">
          <DailySpendAreaChart
            data={dailyTrendData}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
          />
          <MonthlyTrendChart data={multiMonthHistory} />
        </div>

        {/* Row 3: Breakdown & Ledger */}
        <div className="lower-grid">
          <CategoryDonutChart breakdown={categoryBreakdown} />
          <TransactionLedger
            transactions={displayedTransactions}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
        </div>
      </main>

      <AddExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        categories={categories}
        paymentMethods={paymentMethods}
        userPaymentSubtypes={userPaymentSubtypes}
        onAddCustomAccount={addCustomAccount}
        onSubmitTransaction={createTransaction}
      />
    </>
  );
}