import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    return (
      <div style={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '12px', color: '#f8fafc', fontSize: '12px', minWidth: '160px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}>
        <div style={{ color: '#94a3b8', marginBottom: '4px', fontWeight: '500' }}>Day {label}</div>
        <div style={{ fontSize: '16px', fontWeight: '700', color: '#6366f1' }}>
          ₹{Number(item.totalDaily || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </div>
        {item.breakdown && item.breakdown.length > 0 && (
          <div style={{ marginTop: '8px', borderTop: '1px solid #1e293b', paddingTop: '6px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
            {item.breakdown.map((cat, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', fontSize: '11px' }}>
                <span style={{ color: '#94a3b8' }}>{cat.name}</span>
                <span style={{ color: '#e2e8f0', fontWeight: '600' }}>₹{cat.amount.toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
  return null;
}

export default function DailySpendAreaChart({ data, selectedMonth, selectedYear }) {
  return (
    <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '14px', padding: '20px', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ marginBottom: '14px' }}>
        <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#f8fafc' }}>
          Daily Outflow Trajectory
        </h3>
        <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>
          Expenditure burn velocity across {selectedMonth}/{selectedYear}
        </p>
      </div>

      <div style={{ width: '100%', height: 260 }}>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id="spendVelocityGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.45} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
            <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `₹${v}`} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="totalDaily"
              stroke="#6366f1"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#spendVelocityGrad)"
              dot={{ r: 2, fill: '#6366f1' }}
              activeDot={{ r: 5, fill: '#818cf8', stroke: '#0f172a', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}