import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import api from '../api/axios';
import { FileText, Plus, Trash2, Sparkles, ArrowLeft, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const InvoiceBuilder = () => {
  const { id } = useParams();
  const location = useLocation();
  const isEditMode = Boolean(id);
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [projectDescription, setProjectDescription] = useState('');
  
  // Parse query parameters
  const queryParams = new URLSearchParams(location.search);
  const urlProjectId = queryParams.get('projectId') || '';
  const urlClientId = queryParams.get('clientId') || '';

  const [invoiceData, setInvoiceData] = useState({
    clientId: urlClientId,
    projectId: urlProjectId,
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    isInterState: false,
    discountType: 'percent',
    discountValue: 0,
    items: [{ description: '', quantity: 1, rate: 0, gstRate: 18, hsnCode: '' }],
    notes: '',
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientRes, projectRes] = await Promise.all([
          api.get('/clients?limit=100'),
          api.get('/projects?limit=100'),
        ]);
        setClients(clientRes.data.data);
        setProjects(projectRes.data.data);
        
        if (isEditMode) {
          const invRes = await api.get(`/invoices/${id}`);
          const inv = invRes.data.data;
          setInvoiceData({
            clientId: inv.clientId?._id || inv.clientId,
            projectId: inv.projectId?._id || inv.projectId || '',
            issueDate: new Date(inv.issueDate).toISOString().split('T')[0],
            dueDate: new Date(inv.dueDate).toISOString().split('T')[0],
            isInterState: inv.isInterState || false,
            discountType: inv.discountType || 'percent',
            discountValue: inv.discountValue || 0,
            items: inv.items.map(item => ({
              description: item.description,
              quantity: item.quantity,
              rate: item.rate,
              gstRate: item.gstRate,
              hsnCode: item.hsnCode || ''
            })),
            notes: inv.notes || '',
          });
        } else if (clientRes.data.data.length > 0) {
          setInvoiceData((prev) => ({ ...prev, clientId: clientRes.data.data[0]._id }));
        }
      } catch (error) {
        toast.error('Failed to load required data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, isEditMode]);

  const handleItemChange = (index, field, value) => {
    const newItems = [...invoiceData.items];
    newItems[index][field] = field === 'quantity' || field === 'rate' || field === 'gstRate' ? Number(value) : value;
    setInvoiceData({ ...invoiceData, items: newItems });
  };

  const addItem = () => {
    setInvoiceData({
      ...invoiceData,
      items: [...invoiceData.items, { description: '', quantity: 1, rate: 0, gstRate: 18, hsnCode: '' }],
    });
  };

  const removeItem = (index) => {
    if (invoiceData.items.length === 1) return;
    const newItems = invoiceData.items.filter((_, i) => i !== index);
    setInvoiceData({ ...invoiceData, items: newItems });
  };

  // AI Generation of Line Items
  const generateAiItems = async () => {
    if (!projectDescription) {
      return toast.error('Please enter a project description for the AI.');
    }
    setAiLoading(true);
    try {
      const res = await api.post('/ai/invoice-writer', { projectDescription });
      if (res.data.data.items) {
        setInvoiceData({ ...invoiceData, items: res.data.data.items });
        toast.success('AI successfully generated line items!');
      }
    } catch (error) {
      toast.error('AI generation failed.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        await api.put(`/invoices/${id}`, invoiceData);
        toast.success('Invoice updated successfully!');
        navigate(`/app/invoices/${id}`);
      } else {
        await api.post('/invoices', invoiceData);
        toast.success('Invoice created successfully!');
        navigate('/app/invoices');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save invoice');
    }
  };

  // Live Calculations for Preview
  const calculateTotals = () => {
    let subtotal = 0;
    invoiceData.items.forEach((item) => {
      subtotal += (item.quantity || 0) * (item.rate || 0);
    });

    let discountAmount = 0;
    if (invoiceData.discountType === 'percent') {
      discountAmount = (subtotal * (invoiceData.discountValue || 0)) / 100;
    } else {
      discountAmount = invoiceData.discountValue || 0;
    }

    const taxableAmount = subtotal - discountAmount;
    let totalTax = 0;
    invoiceData.items.forEach((item) => {
      const currentGstRate = typeof item.gstRate === 'number' ? item.gstRate : 18;
      const itemGst = ((item.quantity * item.rate) * currentGstRate) / 100;
      totalTax += itemGst;
    });

    return {
      subtotal,
      discountAmount,
      taxableAmount,
      totalTax,
      grandTotal: taxableAmount + totalTax,
    };
  };

  const totals = calculateTotals();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(isEditMode ? `/app/invoices/${id}` : '/app/invoices')} className="p-2 bg-surface2 border border-border rounded-xl text-text-secondary hover:text-white hover:bg-surface">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-3xl font-bold text-text-primary">{isEditMode ? 'Edit Invoice' : 'Create New Invoice'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Left Side: Form (60%) */}
        <div className="lg:col-span-3 space-y-6 bg-surface p-6 rounded-2xl border border-border">
          
          {/* Client & Dates */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm text-text-secondary mb-2">Client*</label>
              <select
                value={invoiceData.clientId}
                onChange={(e) => setInvoiceData({ ...invoiceData, clientId: e.target.value })}
                className="w-full p-3 bg-surface2 border border-border rounded-xl text-text-primary focus:outline-none focus:border-primary"
                required
              >
                <option value="">-- Select Client --</option>
                {clients.map((client) => (
                  <option key={client._id} value={client._id}>{client.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-2">Project*</label>
              <select
                value={invoiceData.projectId}
                onChange={(e) => setInvoiceData({ ...invoiceData, projectId: e.target.value })}
                className="w-full p-3 bg-surface2 border border-border rounded-xl text-text-primary focus:outline-none focus:border-primary"
                required
              >
                <option value="">-- Select Project --</option>
                {projects
                  .filter(p => !invoiceData.clientId || (p.clientId?._id || p.clientId) === invoiceData.clientId)
                  .map((project) => (
                    <option key={project._id} value={project._id}>{project.name}</option>
                  ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-2">Issue Date</label>
              <input
                type="date"
                value={invoiceData.issueDate}
                onChange={(e) => setInvoiceData({ ...invoiceData, issueDate: e.target.value })}
                className="w-full p-3 bg-surface2 border border-border rounded-xl text-text-primary focus:outline-none focus:border-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-2">Due Date</label>
              <input
                type="date"
                value={invoiceData.dueDate}
                onChange={(e) => setInvoiceData({ ...invoiceData, dueDate: e.target.value })}
                className="w-full p-3 bg-surface2 border border-border rounded-xl text-text-primary focus:outline-none focus:border-primary"
                required
              />
            </div>
          </div>

          <div className="flex items-center gap-4 py-2">
            <input
              type="checkbox"
              id="isInterState"
              checked={invoiceData.isInterState}
              onChange={(e) => setInvoiceData({ ...invoiceData, isInterState: e.target.checked })}
              className="h-4 w-4 bg-surface2 border-border rounded text-primary focus:ring-primary"
            />
            <label htmlFor="isInterState" className="text-sm text-text-secondary">
              Inter-State Transaction (Apply IGST instead of CGST/SGST)
            </label>
          </div>

          {/* AI Helper */}
          <div className="bg-surface2 p-4 rounded-xl border border-border space-y-3">
            <div className="flex items-center gap-2 text-primary font-semibold text-sm">
              <Sparkles size={16} /> <span>AI Line Item Writer</span>
            </div>
            <textarea
              placeholder="Describe your project (e.g., 'E-commerce website design with 5 pages and payment gateway integration')."
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              className="w-full p-3 bg-surface border border-border rounded-xl text-text-primary text-sm focus:outline-none focus:border-primary"
              rows={2}
            />
            <button
              type="button"
              disabled={aiLoading}
              onClick={generateAiItems}
              className="px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white text-xs font-semibold rounded-lg hover:scale-105 transition-all shadow-md disabled:opacity-50"
            >
              {aiLoading ? 'Generating...' : 'Auto-Generate Items'}
            </button>
          </div>

          {/* Line Items Table */}
          <div className="space-y-3">
            <h3 className="text-md font-bold text-text-primary">Line Items</h3>
            {invoiceData.items.map((item, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end bg-surface2 p-3 rounded-xl border border-border">
                <div className="md:col-span-5">
                  <label className="block text-xs text-text-secondary mb-1">Description</label>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                    className="w-full p-2 bg-surface border border-border rounded-lg text-text-primary text-sm focus:outline-none focus:border-primary"
                    placeholder="Item description"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs text-text-secondary mb-1">HSN/SAC</label>
                  <input
                    type="text"
                    value={item.hsnCode}
                    onChange={(e) => handleItemChange(index, 'hsnCode', e.target.value)}
                    className="w-full p-2 bg-surface border border-border rounded-lg text-text-primary text-sm focus:outline-none focus:border-primary"
                    placeholder="9983"
                  />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-xs text-text-secondary mb-1">Qty</label>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                    className="w-full p-2 bg-surface border border-border rounded-lg text-text-primary text-sm focus:outline-none focus:border-primary"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs text-text-secondary mb-1">Rate</label>
                  <input
                    type="number"
                    value={item.rate}
                    onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
                    className="w-full p-2 bg-surface border border-border rounded-lg text-text-primary text-sm focus:outline-none focus:border-primary font-mono"
                    placeholder="0"
                    required
                  />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-xs text-text-secondary mb-1">GST%</label>
                  <select
                    value={item.gstRate}
                    onChange={(e) => handleItemChange(index, 'gstRate', e.target.value)}
                    className="w-full p-2 bg-surface border border-border rounded-lg text-text-primary text-xs focus:outline-none focus:border-primary"
                  >
                    {[0, 5, 12, 18, 28].map((rate) => (
                      <option key={rate} value={rate}>{rate}%</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-1 flex justify-center">
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="p-2 text-text-muted hover:text-accent rounded-lg border border-transparent hover:border-border transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addItem}
              className="flex items-center gap-2 px-3 py-2 text-xs font-semibold bg-surface2 border border-border rounded-xl text-text-secondary hover:text-white transition-all mt-2"
            >
              <Plus size={14} /> Add Line Item
            </button>
          </div>

          {/* Discount & Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-text-secondary mb-2">Discount</label>
              <div className="flex gap-2">
                <select
                  value={invoiceData.discountType}
                  onChange={(e) => setInvoiceData({ ...invoiceData, discountType: e.target.value })}
                  className="p-3 bg-surface2 border border-border rounded-xl text-text-primary focus:outline-none focus:border-primary"
                >
                  <option value="percent">%</option>
                  <option value="flat">Flat (₹)</option>
                </select>
                <input
                  type="number"
                  value={invoiceData.discountValue}
                  onChange={(e) => setInvoiceData({ ...invoiceData, discountValue: e.target.value })}
                  className="w-full p-3 bg-surface2 border border-border rounded-xl text-text-primary focus:outline-none focus:border-primary font-mono"
                  placeholder="0"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-2">Notes</label>
              <textarea
                value={invoiceData.notes}
                onChange={(e) => setInvoiceData({ ...invoiceData, notes: e.target.value })}
                className="w-full p-3 bg-surface2 border border-border rounded-xl text-text-primary text-sm focus:outline-none focus:border-primary h-12"
                placeholder="Payment terms, bank details, etc."
              />
            </div>
          </div>

          <button
            type="submit"
            className="flex items-center gap-2 justify-center w-full py-3 px-4 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg mt-4"
          >
            <Save size={18} /> Save & Create Invoice
          </button>
        </div>

        {/* Right Side: Live Preview (40%) */}
        <div className="lg:col-span-2 bg-white text-gray-900 p-6 rounded-2xl shadow-xl space-y-6 self-start border border-gray-200">
          <div className="flex justify-between items-center border-b border-gray-200 pb-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight">INVOICE PREVIEW</h2>
              <p className="text-xs text-gray-500 mt-1 font-mono">DRAFT</p>
            </div>
            <div className="text-right">
              <span className="text-sm font-bold text-gray-900">
                {clients.find((c) => c._id === invoiceData.clientId)?.company || 'Acme Inc.'}
              </span>
            </div>
          </div>

          <div className="text-xs grid grid-cols-2 gap-4 text-gray-600">
            <div>
              <p className="font-bold text-gray-900">Bill To:</p>
              <p className="text-sm font-semibold text-gray-900 mt-1">
                {clients.find((c) => c._id === invoiceData.clientId)?.name || 'Client Name'}
              </p>
              <p>{clients.find((c) => c._id === invoiceData.clientId)?.email}</p>
            </div>
            <div className="text-right space-y-1">
              <p><span className="font-bold text-gray-900">Date:</span> {invoiceData.issueDate}</p>
              <p><span className="font-bold text-gray-900">Due:</span> {invoiceData.dueDate}</p>
            </div>
          </div>

          {/* Preview Items Table */}
          <div className="border-t border-b border-gray-200 py-3 text-xs">
            <div className="grid grid-cols-12 gap-2 font-bold text-gray-900 border-b border-gray-100 pb-2 mb-2">
              <span className="col-span-6">Description</span>
              <span className="col-span-2 text-right">Qty</span>
              <span className="col-span-2 text-right">Rate</span>
              <span className="col-span-2 text-right">Total</span>
            </div>
            {invoiceData.items.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 py-1 text-gray-700">
                <span className="col-span-6 font-medium text-gray-900 truncate">
                  {item.description || 'Untitled Item'}
                </span>
                <span className="col-span-2 text-right font-mono">{item.quantity || 0}</span>
                <span className="col-span-2 text-right font-mono">₹{item.rate?.toLocaleString('en-IN') || 0}</span>
                <span className="col-span-2 text-right font-mono font-semibold text-gray-900">
                  ₹{((item.quantity || 0) * (item.rate || 0)).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>

          {/* Preview Totals */}
          <div className="text-xs space-y-2 border-b border-gray-200 pb-3">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal:</span>
              <span className="font-mono">₹{totals.subtotal.toLocaleString('en-IN')}</span>
            </div>
            {totals.discountAmount > 0 && (
              <div className="flex justify-between text-accent">
                <span>Discount:</span>
                <span className="font-mono">-₹{totals.discountAmount.toLocaleString('en-IN')}</span>
              </div>
            )}
            {invoiceData.isInterState ? (
              <div className="flex justify-between text-gray-600">
                <span>Estimated IGST:</span>
                <span className="font-mono">₹{totals.totalTax.toLocaleString('en-IN')}</span>
              </div>
            ) : (
              <>
                <div className="flex justify-between text-gray-600">
                  <span>Estimated CGST:</span>
                  <span className="font-mono">₹{(totals.totalTax / 2).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Estimated SGST:</span>
                  <span className="font-mono">₹{(totals.totalTax / 2).toLocaleString('en-IN')}</span>
                </div>
              </>
            )}
          </div>

          <div className="flex justify-between items-center pt-2">
            <span className="text-sm font-bold text-gray-900">Total Due (INR):</span>
            <span className="text-xl font-bold text-gray-900 font-mono">
              ₹{totals.grandTotal.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

      </form>
    </div>
  );
};

export default InvoiceBuilder;
