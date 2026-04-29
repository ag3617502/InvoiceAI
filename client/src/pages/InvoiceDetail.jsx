import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { ArrowLeft, Download, Trash2, Edit, CheckCircle, Clock, AlertCircle, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

const InvoiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPaidModal, setShowPaidModal] = useState(false);

  const fetchInvoice = async () => {
    try {
      const res = await api.get(`/invoices/${id}`);
      setInvoice(res.data.data);
    } catch (error) {
      toast.error('Failed to load invoice details');
      navigate('/app/invoices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const handleDownload = async () => {
    try {
      toast.loading('Generating PDF...', { id: 'download' });
      const response = await api.get(`/invoices/${id}/download`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice-${invoice.invoiceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Downloaded PDF successfully!', { id: 'download' });
    } catch (error) {
      toast.error('Failed to download PDF', { id: 'download' });
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this invoice?')) return;

    try {
      await api.delete(`/invoices/${id}`);
      toast.success('Invoice deleted successfully');
      navigate('/app/invoices');
    } catch (error) {
      toast.error('Failed to delete invoice');
    }
  };

  const handleMarkPaid = async () => {
    try {
      await api.post(`/invoices/${id}/mark-paid`);
      toast.success('Invoice marked as paid');
      fetchInvoice();
    } catch (error) {
      toast.error('Failed to update invoice');
    }
  };

  const handleMarkSent = async () => {
    try {
      await api.post(`/invoices/${id}/mark-sent`);
      toast.success('Invoice marked as sent');
      fetchInvoice();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!invoice) return null;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid':
        return <span className="flex items-center gap-1 text-xs font-semibold text-success bg-success/10 px-3 py-1.5 rounded-full border border-success/20"><CheckCircle size={14} /> Paid</span>;
      case 'overdue':
        return <span className="flex items-center gap-1 text-xs font-semibold text-accent bg-accent/10 px-3 py-1.5 rounded-full border border-accent/20"><AlertCircle size={14} /> Overdue</span>;
      case 'sent':
        return <span className="flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20"><Clock size={14} /> Sent</span>;
      default:
        return <span className="flex items-center gap-1 text-xs font-semibold text-text-secondary bg-surface2 px-3 py-1.5 rounded-full border border-border">Draft</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation & Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/app/invoices')} className="p-2 bg-surface2 border border-border rounded-xl text-text-secondary hover:text-text-primary hover:bg-surface">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-text-primary font-mono tracking-tight">{invoice.invoiceNumber}</h1>
            <p className="text-text-secondary text-sm">Created on {new Date(invoice.issueDate).toLocaleDateString('en-IN')}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {invoice.status === 'draft' && (
            <button
              onClick={handleMarkSent}
              className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-xl hover:scale-105 transition-all text-sm font-semibold shadow-md"
            >
              <CheckCircle size={16} /> Mark Sent
            </button>
          )}
          {invoice.status !== 'paid' && (
            <button
              onClick={() => setShowPaidModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-success text-white rounded-xl hover:scale-105 transition-all text-sm font-semibold shadow-md"
            >
              <CheckCircle size={16} /> Mark Paid
            </button>
          )}
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:scale-105 transition-all text-sm font-semibold shadow-md"
          >
            <Download size={16} /> Download PDF
          </button>
          {invoice.status !== 'paid' && (
            <Link
              to={`/app/invoices/${id}/edit`}
              className="flex items-center gap-2 px-4 py-2 bg-surface2 border border-border text-text-primary rounded-xl hover:bg-border transition-all text-sm font-semibold shadow-sm"
            >
              <Edit size={16} /> Edit
            </Link>
          )}
          {invoice.status !== 'paid' && (
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 bg-accent/20 border border-accent/30 text-accent rounded-xl hover:bg-accent/30 hover:scale-105 transition-all text-sm font-semibold shadow-sm"
            >
              <Trash2 size={16} /> Delete
            </button>
          )}
        </div>
      </div>

      {/* Invoice Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Invoice Content */}
        <div className="lg:col-span-2 bg-surface p-8 rounded-2xl border border-border space-y-8">
          
          <div className="flex justify-between items-start border-b border-border pb-6">
            <div>
              <h2 className="text-3xl font-bold text-text-primary tracking-tight">INVOICE</h2>
              <p className="text-primary font-mono font-semibold mt-1">{invoice.invoiceNumber}</p>
            </div>
            <div>
              {getStatusBadge(invoice.status)}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm border-b border-border pb-6">
            <div>
              <p className="text-text-secondary font-semibold uppercase tracking-wider text-xs mb-2">Billed To:</p>
              <p className="text-text-primary text-lg font-bold">{invoice.clientId?.name || 'Deleted Client'}</p>
              <p className="text-text-secondary mt-1">{invoice.clientId?.company}</p>
              <p className="text-text-secondary">{invoice.clientId?.email}</p>
              {invoice.clientId?.gstNumber && <p className="text-primary text-xs mt-2 font-semibold">GSTIN: {invoice.clientId.gstNumber}</p>}
            </div>
            <div className="text-right space-y-2">
              <p className="text-text-secondary"><span className="font-semibold text-text-primary">Date:</span> {new Date(invoice.issueDate).toLocaleDateString('en-IN')}</p>
              <p className="text-text-secondary"><span className="font-semibold text-text-primary">Due Date:</span> {new Date(invoice.dueDate).toLocaleDateString('en-IN')}</p>
              {invoice.projectId && (
                <p className="text-text-secondary">
                  <span className="font-semibold text-text-primary">Project:</span>{' '}
                  <Link to={`/app/projects/${invoice.projectId._id || invoice.projectId}`} className="text-primary hover:underline font-semibold">
                    {invoice.projectId.name || 'View Project'}
                  </Link>
                </p>
              )}
            </div>
          </div>

          {/* Line Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-text-secondary font-semibold uppercase tracking-wider text-xs bg-surface2/50">
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3 text-center">HSN/SAC</th>
                  <th className="px-4 py-3 text-center">Qty</th>
                  <th className="px-4 py-3 text-right">Rate</th>
                  <th className="px-4 py-3 text-center">GST</th>
                  <th className="px-4 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-text-primary">
                {invoice.items.map((item, index) => (
                  <tr key={index} className="hover:bg-surface2/20 transition-colors">
                    <td className="px-4 py-4 font-medium text-text-primary">{item.description}</td>
                    <td className="px-4 py-4 text-center font-mono text-xs">{item.hsnCode || '-'}</td>
                    <td className="px-4 py-4 text-center font-mono">{item.quantity}</td>
                    <td className="px-4 py-4 text-right font-mono">₹{(item.rate || 0).toLocaleString('en-IN')}</td>
                    <td className="px-4 py-4 text-center font-mono">{item.gstRate || 0}%</td>
                    <td className="px-4 py-4 text-right font-mono font-semibold text-text-primary">
                      ₹{(((item.quantity || 0) * (item.rate || 0)) * (1 + (item.gstRate || 0) / 100)).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Section */}
          <div className="flex justify-end pt-6 border-t border-border">
            <div className="w-80 space-y-3 text-sm">
              <div className="flex justify-between text-text-secondary">
                <span>Subtotal:</span>
                <span className="font-mono text-text-primary font-semibold">₹{(invoice.subtotal || 0).toLocaleString('en-IN')}</span>
              </div>
              {(invoice.discountAmount || 0) > 0 && (
                <div className="flex justify-between text-accent">
                  <span>Discount:</span>
                  <span className="font-mono font-semibold">-₹{(invoice.discountAmount || 0).toLocaleString('en-IN')}</span>
                </div>
              )}
              {invoice.isInterState ? (
                <div className="flex justify-between text-text-secondary">
                  <span>IGST:</span>
                  <span className="font-mono text-text-primary font-semibold">₹{(invoice.igst || 0).toLocaleString('en-IN')}</span>
                </div>
              ) : (
                <>
                  <div className="flex justify-between text-text-secondary">
                    <span>CGST:</span>
                    <span className="font-mono text-text-primary font-semibold">₹{(invoice.cgst || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-text-secondary">
                    <span>SGST:</span>
                    <span className="font-mono text-text-primary font-semibold">₹{(invoice.sgst || 0).toLocaleString('en-IN')}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between items-center pt-3 border-t-2 border-border text-base font-bold text-text-primary">
                <span>Total Due:</span>
                <span className="font-mono text-xl text-gradient">₹{(invoice.total || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {invoice.notes && (
            <div className="border-t border-border pt-4 mt-4">
              <p className="text-xs text-text-secondary uppercase tracking-wider font-bold mb-1">Notes / Terms</p>
              <p className="text-text-primary text-sm whitespace-pre-line leading-relaxed">{invoice.notes}</p>
            </div>
          )}

        </div>

        {/* Right: Insights / Status Tracker */}
        <div className="space-y-6">
          <div className="bg-surface p-6 rounded-2xl border border-border">
            <h3 className="text-lg font-bold text-text-primary mb-4">Payment Tracking</h3>
            <div className="space-y-4 relative before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[2px] before:bg-border">
              <div className="flex items-start gap-4 relative">
                <div className="w-4 h-4 bg-surface border-4 border-success rounded-full z-10 mt-1 flex-shrink-0"></div>
                <div>
                  <p className="text-sm font-semibold text-text-primary">Invoice Generated</p>
                  <p className="text-xs text-text-secondary">{new Date(invoice.createdAt).toLocaleDateString('en-IN')}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 relative">
                <div className={`w-4 h-4 bg-surface border-4 ${invoice.status === 'paid' ? 'border-success' : 'border-primary'} rounded-full z-10 mt-1 flex-shrink-0`}></div>
                <div>
                  <p className="text-sm font-semibold text-text-primary">Sent to Client</p>
                  <p className="text-xs text-text-secondary">Email tracker offline</p>
                </div>
              </div>

              <div className="flex items-start gap-4 relative">
                <div className={`w-4 h-4 bg-surface border-4 ${invoice.status === 'paid' ? 'border-success' : 'border-border'} rounded-full z-10 mt-1 flex-shrink-0`}></div>
                <div>
                  <p className="text-sm font-semibold text-text-primary">Payment Received</p>
                  {invoice.status === 'paid' ? (
                    <p className="text-xs text-text-secondary">{new Date(invoice.updatedAt).toLocaleDateString('en-IN')}</p>
                  ) : (
                    <p className="text-xs text-text-muted">Awaiting confirmation</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Confirmation Modal */}
      {showPaidModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface p-6 rounded-2xl border border-border max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-success">
              <CheckCircle size={24} />
              <h3 className="text-xl font-bold text-white">Mark as Paid?</h3>
            </div>
            <p className="text-text-secondary text-sm leading-relaxed">
              Are you sure you want to mark this invoice as <span className="font-bold text-success">PAID</span>?
              <br /><br />
              <strong className="text-accent">Warning:</strong> Once an invoice is paid, it can no longer be edited or deleted for accounting stability.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowPaidModal(false)}
                className="px-4 py-2 bg-surface2 border border-border text-white rounded-xl hover:bg-border transition-all text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowPaidModal(false);
                  handleMarkPaid();
                }}
                className="px-4 py-2 bg-success text-white rounded-xl hover:scale-105 transition-all text-sm font-semibold shadow-md"
              >
                Confirm Paid
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceDetail;
