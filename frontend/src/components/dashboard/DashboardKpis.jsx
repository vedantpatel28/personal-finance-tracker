import React from 'react';
import { TrendingDown, Activity, Layers, CreditCard } from 'lucide-react';

export default function DashboardKpis({
  totalMonthSpend,
  transactionCount,
  dailyAverage,
  daysInMonth,
  topCategory,
  savedAccountsCount
}) {
  return (
    <>
      <div className="dashboard-card" style={{ padding: '18px 20px', border: '1px solid #334155' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94a3b8', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>
          <span>Monthly Outflow</span>
          <TrendingDown size={16} color="#ef4444" />
        </div>
        <div style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff', marginTop: '8px' }}>
          ₹{totalMonthSpend.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </div>
        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
          {transactionCount} recorded transactions
        </div>
      </div>

      <div className="dashboard-card" style={{ padding: '18px 20px', border: '1px solid #334155' }}>
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

      <div className="dashboard-card" style={{ padding: '18px 20px', border: '1px solid #334155' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94a3b8', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>
          <span>Primary Cost Center</span>
          <Layers size={16} color="#10b981" />
        </div>
        <div style={{ fontSize: '18px', fontWeight: '700', color: '#ffffff', marginTop: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {topCategory ? topCategory.name : 'N/A'}
        </div>
        <div style={{ fontSize: '12px', color: '#10b981', marginTop: '4px' }}>
          {topCategory ? `${topCategory.percentage}% of total spend` : 'No transactions'}
        </div>
      </div>

      <div className="dashboard-card" style={{ padding: '18px 20px', border: '1px solid #334155' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94a3b8', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>
          <span>Connected Accounts</span>
          <CreditCard size={16} color="#f59e0b" />
        </div>
        <div style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff', marginTop: '8px' }}>
          {savedAccountsCount} Accounts
        </div>
        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
          Custom cards & bank accounts
        </div>
      </div>
    </>
  );
}