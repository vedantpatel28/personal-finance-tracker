import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export const CATEGORY_PALETTE = [
  '#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ec4899',
  '#8b5cf6', '#14b8a6', '#f97316', '#06b6d4', '#84cc16'
];

export default function CategoryDonutChart({ breakdown }) {
  const chartData = (breakdown && breakdown.length > 0)
    ? breakdown.map(b => ({ name: b.name, value: b.amount }))
    : [];

  return (
    <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '14px', padding: '20px', width: '100%', boxSizing: 'border-box' }}>
      <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: '600', color: '#f8fafc' }}>
        Category Distribution
      </h3>

      {chartData.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#64748b', fontSize: '13px', padding: '40px 0' }}>
          No expenditures recorded for this period.
        </div>
      ) : (
        <>
          <div style={{ width: '100%', height: 180 }}>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={chartData}
                  innerRadius={46}
                  outerRadius={72}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_PALETTE[index % CATEGORY_PALETTE.length]} stroke="#0f172a" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Amount']}
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
            {breakdown.slice(0, 5).map((cat, idx) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '5px' }}>
                  <span style={{ color: '#e2e8f0', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: CATEGORY_PALETTE[idx % CATEGORY_PALETTE.length], flexShrink: 0 }}></span>
                    {cat.name}
                  </span>
                  <span style={{ color: '#94a3b8' }}>
                    ₹{cat.amount.toLocaleString('en-IN')} <span style={{ color: '#64748b', fontSize: '11px' }}>({cat.percentage}%)</span>
                  </span>
                </div>
                <div style={{ width: '100%', height: '5px', backgroundColor: '#0f172a', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${cat.percentage}%`, height: '100%', backgroundColor: CATEGORY_PALETTE[idx % CATEGORY_PALETTE.length], borderRadius: '3px' }}></div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}