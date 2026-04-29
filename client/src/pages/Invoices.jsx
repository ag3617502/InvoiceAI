import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { FileText, Plus, Search, Filter, Calendar, CheckCircle, AlertCircle, Clock, ChevronDown, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
  const [showPaidModal, setShowPaidModal] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [upcomingPayments, setUpcomingPayments] = useState([]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const [res, dashboardRes] = await Promise.all([
        api.get(`/invoices?status=${status}&search=${search}&page=${page}&limit=10`),
        api.get('/dashboard/stats')
      ]);
      setInvoices(res.data.data);
      setTotalPages(res.data.pagination?.totalPages || 1);
      setUpcomingPayments(dashboardRes.data.data.upcomingPayments || []);
    } catch (error) {
      toast.error('Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [status, page]);

  const handleMarkPaid = async (id) => {
    try {
      await api.post(`/invoices/${id}/mark-paid`);
      toast.success('Invoice marked as paid');
      fetchInvoices();
    } catch (error) {
      toast.error('Failed to update invoice');
    }
  };

  const handleMarkSent = async (id) => {
    try {
      await api.post(`/invoices/${id}/mark-sent`);
      toast.success('Invoice marked as sent');
      fetchInvoices();
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

  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid':
        return <span className="flex items-center gap-1 text-xs font-semibold text-success bg-success/10 px-2.5 py-1 rounded-full border border-success/20"><CheckCircle size={12} /> Paid</span>;
      case 'overdue':
        return <span className="flex items-center gap-1 text-xs font-semibold text-accent bg-accent/10 px-2.5 py-1 rounded-full border border-accent/20"><AlertCircle size={12} /> Overdue</span>;
      case 'sent':
        return <span className="flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20"><Clock size={12} /> Sent</span>;
      default:
        return <span className="flex items-center gap-1 text-xs font-semibold text-text-secondary bg-surface2 px-2.5 py-1 rounded-full border border-border">Draft</span>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">Invoices</h1>
          <p className="text-text-secondary">Create and manage your invoices, track payments, and send reminders.</p>
        </div>
        <Link
          to="/app/invoices/new"
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-xl hover:scale-105 transition-all shadow-lg font-semibold self-start"
        >
          <Plus size={18} /> New Invoice
        </Link>
      </div>

      {/* Upcoming Payments Reminder Table */}
      <div className="bg-surface p-6 rounded-2xl border border-border">
        <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
          <AlertCircle className="text-accent" size={24} /> Upcoming Payments
        </h2>
        
        {upcomingPayments.length === 0 ? (
          <div className="text-center py-6 text-text-muted text-sm border border-dashed border-border rounded-xl bg-surface2/10">
            No upcoming payments found.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border bg-surface2/20">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-border bg-surface2 text-text-secondary text-xs font-semibold uppercase tracking-wider">
                  <th className="px-4 py-3">Invoice #</th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Due Date</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-text-primary">
                {upcomingPayments.map((inv) => (
                  <tr key={inv._id} className="hover:bg-surface2/30 transition-colors">
                    <td className="px-4 py-4 font-mono font-semibold text-text-primary">{inv.invoiceNumber}</td>
                    <td className="px-4 py-4">
                      <div className="font-bold text-text-primary">{inv.clientId?.name || 'Client'}</div>
                      <div className="text-xs text-text-secondary">{inv.clientId?.company}</div>
                    </td>
                    <td className="px-4 py-4 text-accent font-semibold flex items-center gap-1.5">
                      <AlertCircle size={14} /> {new Date(inv.dueDate).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-4 py-4 font-mono font-bold text-text-primary">
                      ₹{inv.total?.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Link
                        to={`/app/invoices/${inv._id}`}
                        className="px-3 py-1 bg-primary text-white text-xs font-semibold rounded-lg hover:scale-105 transition-all shadow-md inline-block"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-4">
        {['', 'draft', 'sent', 'paid', 'overdue'].map((s) => (
          <button
            key={s}
            onClick={() => { setStatus(s); setPage(1); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              status === s
                ? 'bg-primary text-white border border-primary'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface2'
            }`}
          >
            {s === '' ? 'All Invoices' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {invoices.length === 0 ? (
        <div className="text-center py-12 bg-surface rounded-2xl border border-border">
          <FileText className="mx-auto text-text-muted mb-4" size={48} />
          <p className="text-text-secondary text-lg mb-2">No invoices found</p>
          <p className="text-text-muted text-sm mb-4">Create your first invoice to get started.</p>
          <Link
            to="/app/invoices/new"
            className="px-4 py-2 bg-surface2 text-text-primary border border-border rounded-xl hover:bg-border transition-all inline-block"
          >
            New Invoice
          </Link>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto bg-surface rounded-2xl border border-border">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-surface2 text-text-secondary text-xs font-semibold uppercase tracking-wider">
                <th className="px-6 py-4">Invoice #</th>
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm text-text-primary">
              {invoices.map((invoice) => (
                <tr key={invoice._id} className="hover:bg-surface2/50 transition-colors">
                  <td className="px-6 py-4 font-mono font-medium text-text-primary">{invoice.invoiceNumber}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-text-primary">{invoice.clientId?.name || 'Deleted Client'}</div>
                    <div className="text-xs text-text-secondary">{invoice.clientId?.company}</div>
                  </td>
                  <td className="px-6 py-4 text-text-secondary">
                    {new Date(invoice.issueDate).toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-text-primary">
                    ₹{invoice.total?.toLocaleString('en-IN')}
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(invoice.status)}</td>
                  <td className="px-6 py-4 text-right space-x-3">
                    {invoice.status === 'draft' && (
                      <button
                        onClick={() => handleMarkSent(invoice._id)}
                        className="text-xs font-semibold text-accent hover:underline"
                      >
                        Mark Sent
                      </button>
                    )}
                    {invoice.status !== 'paid' && (
                      <button
                        onClick={() => {
                          setSelectedInvoiceId(invoice._id);
                          setShowPaidModal(true);
                        }}
                        className="text-xs font-semibold text-secondary hover:underline"
                      >
                        Mark Paid
                      </button>
                    )}
                    <Link
                      to={`/app/invoices/${invoice._id}`}
                      className="text-xs font-semibold text-primary hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-4 px-2">
            <span className="text-sm text-text-secondary">
              Page <span className="font-semibold text-text-primary">{page}</span> of <span className="font-semibold text-text-primary">{totalPages}</span>
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                disabled={page === 1}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl border border-border transition-all ${
                  page === 1
                    ? 'text-text-muted cursor-not-allowed bg-surface/50'
                    : 'text-text-primary bg-surface2 hover:bg-border'
                }`}
              >
                Previous
              </button>
              <button
                onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                disabled={page === totalPages}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl border border-border transition-all ${
                  page === totalPages
                    ? 'text-text-muted cursor-not-allowed bg-surface/50'
                    : 'text-text-primary bg-surface2 hover:bg-border'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </>
    )}

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
                onClick={() => {
                  setShowPaidModal(false);
                  setSelectedInvoiceId(null);
                }}
                className="px-4 py-2 bg-surface2 border border-border text-white rounded-xl hover:bg-border transition-all text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowPaidModal(false);
                  if (selectedInvoiceId) handleMarkPaid(selectedInvoiceId);
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

export default Invoices;
