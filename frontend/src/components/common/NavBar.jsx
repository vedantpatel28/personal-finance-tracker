import React from 'react';
import { Wallet, Calendar, Plus, LogOut } from 'lucide-react';

export default function Navbar({
  selectedMonth,
  setSelectedMonth,
  selectedYear,
  setSelectedYear,
  onOpenModal,
  onLogout
}) {
  return (
    <header className="nav-container">

      {/* Brand Logo - Uses flex-shrink: 0 via CSS */}
      <div className="nav-brand">
        <div style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)', padding: '8px', borderRadius: '10px', display: 'flex' }}>
          <Wallet size={20} color="#ffffff" />
        </div>
        <div style={{ whiteSpace: 'nowrap' }}>
          <span style={{ fontSize: '17px', fontWeight: '700', letterSpacing: '-0.3px', color: '#ffffff' }}>FinanceOS</span>
          <span style={{ fontSize: '11px', color: '#64748b', marginLeft: '8px', fontWeight: '500' }}>Enterprise</span>
        </div>
      </div>

      <div className="nav-actions">

        {/* Period Selector */}
        <div className="period-select">
          <Calendar size={14} color="#94a3b8" style={{ marginRight: '6px', flexShrink: 0 }} />
          <select
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: '#f8fafc', fontSize: '13px', fontWeight: '500', outline: 'none', cursor: 'pointer' }}
          >
            <option value="01" style={{ background: '#1e293b' }}>Jan</option>
            <option value="02" style={{ background: '#1e293b' }}>Feb</option>
            <option value="03" style={{ background: '#1e293b' }}>Mar</option>
            <option value="04" style={{ background: '#1e293b' }}>Apr</option>
            <option value="05" style={{ background: '#1e293b' }}>May</option>
            <option value="06" style={{ background: '#1e293b' }}>Jun</option>
            <option value="07" style={{ background: '#1e293b' }}>Jul</option>
            <option value="08" style={{ background: '#1e293b' }}>Aug</option>
            <option value="09" style={{ background: '#1e293b' }}>Sep</option>
            <option value="10" style={{ background: '#1e293b' }}>Oct</option>
            <option value="11" style={{ background: '#1e293b' }}>Nov</option>
            <option value="12" style={{ background: '#1e293b' }}>Dec</option>
          </select>
          <span style={{ color: '#475569', margin: '0 4px' }}>/</span>
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

        {/* Add Expense Button - Guaranteed single-line via CSS */}
        <button
          className="nav-btn"
          onClick={onOpenModal}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#6366f1', color: '#ffffff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
        >
          <Plus size={16} style={{ flexShrink: 0 }} /> Add Expense
        </button>

        {/* Logout Button */}
        <button
          className="nav-btn"
          onClick={onLogout}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1e293b', border: '1px solid #334155', color: '#ef4444', cursor: 'pointer', padding: '8px', borderRadius: '8px' }}
          title="Sign Out"
        >
          <LogOut size={16} style={{ flexShrink: 0 }} />
        </button>

      </div>
    </header>
  );
}