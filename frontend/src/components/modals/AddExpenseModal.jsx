import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function AddExpenseModal({
  isOpen,
  onClose,
  categories,
  paymentMethods,
  userPaymentSubtypes,
  onAddCustomAccount,
  onSubmitTransaction
}) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [selectedPaymentSubtype, setSelectedPaymentSubtype] = useState('');

  const [newAccountName, setNewAccountName] = useState('');
  const [isAddingNewAccount, setIsAddingNewAccount] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const activeCategoryObj = categories.find(c => String(c.categoryId) === String(selectedCategory));
  const availableSubcategories = activeCategoryObj ? (activeCategoryObj.subcategories || []) : [];

  const handleCreateAccount = async () => {
    if (!newAccountName.trim() || !selectedPaymentMethod) return;
    try {
      const saved = await onAddCustomAccount(selectedPaymentMethod, newAccountName.trim());
      setSelectedPaymentSubtype(saved.paymentSubtypeId);
      setNewAccountName('');
      setIsAddingNewAccount(false);
    } catch {
      alert('Failed to save account');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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

    const success = await onSubmitTransaction(payload);
    setIsSubmitting(false);

    if (success) {
      onClose();
    } else {
      alert('Failed to save transaction');
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100, padding: '16px' }}>
      <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', width: '100%', maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto', borderRadius: '16px', padding: '20px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.6)', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#ffffff' }}>Record New Expense</h3>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px', display: 'flex' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
              placeholder="e.g., Grocery Supermarket, Office Taxi"
              value={description}
              onChange={e => setDescription(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <div className="modal-grid-2col">
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

          <div className="modal-grid-2col">
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
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#94a3b8', marginBottom: '5px' }}>Account / Card</label>
              {!isAddingNewAccount ? (
                <div style={{ display: 'flex', gap: '6px' }}>
                  <select
                    value={selectedPaymentSubtype}
                    onChange={e => setSelectedPaymentSubtype(e.target.value)}
                    disabled={!selectedPaymentMethod}
                    style={{ width: '100%', padding: '10px 12px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#ffffff', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                  >
                    <option value="">Select Account (Optional)</option>
                    {userPaymentSubtypes.map(s => (
                      <option key={s.paymentSubtypeId} value={s.paymentSubtypeId}>{s.paymentSubtypeName}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    disabled={!selectedPaymentMethod}
                    onClick={() => setIsAddingNewAccount(true)}
                    style={{ padding: '0 10px', backgroundColor: '#334155', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}
                    title="Add Custom Card/Account"
                  >
                    +
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '6px' }}>
                  <input
                    type="text"
                    placeholder="e.g. My HDFC Card"
                    value={newAccountName}
                    onChange={e => setNewAccountName(e.target.value)}
                    style={{ width: '100%', padding: '9px 10px', backgroundColor: '#0f172a', border: '1px solid #6366f1', borderRadius: '8px', color: '#ffffff', fontSize: '12px', outline: 'none' }}
                  />
                  <button
                    type="button"
                    onClick={handleCreateAccount}
                    style={{ padding: '0 10px', backgroundColor: '#6366f1', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingNewAccount(false)}
                    style={{ padding: '0 8px', backgroundColor: '#334155', color: '#94a3b8', border: 'none', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}
                  >
                    ✕
                  </button>
                </div>
              )}
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

          <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{ flex: 1, padding: '10px', backgroundColor: '#334155', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{ flex: 2, padding: '10px', backgroundColor: '#6366f1', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
            >
              {isSubmitting ? 'Saving...' : 'Add Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}