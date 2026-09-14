import React from 'react';
import { Search, Receipt } from 'lucide-react';

export default function TransactionLedger({ transactions, searchTerm, setSearchTerm }) {
  return (
    <div className="dashboard-card">
      <div className="ledger-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#f8fafc' }}>
            Transaction Ledger
          </h3>
          <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>
            {transactions.length} records found
          </p>
        </div>

        <div className="ledger-search" style={{ position: 'relative', minWidth: '220px', flex: '1', maxWidth: '320px' }}>
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '430px', overflowY: 'auto', paddingRight: '4px' }}>
        {transactions.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#64748b', fontSize: '13px', padding: '40px 0' }}>
            No matching transaction records found.
          </div>
        ) : (
          transactions.slice().reverse().map(t => (
            <div key={t.transactionId} className="transaction-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ padding: '8px', backgroundColor: '#1e293b', borderRadius: '8px', color: '#6366f1', display: 'flex', flexShrink: 0 }}>
                  <Receipt size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#f8fafc' }}>{t.description}</div>
                  <div style={{ fontSize: '11px', color: '#64748b', display: 'flex', gap: '6px', marginTop: '3px', flexWrap: 'wrap' }}>
                    <span>{t.category?.categoryName}{t.subcategory ? ` / ${t.subcategory.subcategoryName}` : ''}</span>
                    <span>•</span>
                    <span>{t.paymentMethod?.paymentMethodName}{t.paymentSubtype ? ` (${t.paymentSubtype.paymentSubtypeName})` : ''}</span>
                    <span>•</span>
                    <span>{t.date}</span>
                  </div>
                </div>
              </div>
              <div className="tx-amount" style={{ fontSize: '14px', fontWeight: '700', color: '#ef4444', whiteSpace: 'nowrap' }}>
                -₹{t.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}