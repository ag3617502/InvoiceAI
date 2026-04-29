import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { ArrowLeft, Folder, User, FileText, CheckCircle, Clock, AlertCircle, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        const res = await api.get(`/projects/${id}`);
        setProject(res.data.data.project);
        setInvoices(res.data.data.invoices);
      } catch (error) {
        toast.error('Failed to load project details');
        navigate('/app/projects');
      } finally {
        setLoading(false);
      }
    };
    fetchProjectDetails();
  }, [id]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <span className="flex items-center gap-1 text-xs font-semibold text-success bg-success/10 px-3 py-1.5 rounded-full border border-success/20"><CheckCircle size={14} /> Completed</span>;
      case 'on_hold':
        return <span className="flex items-center gap-1 text-xs font-semibold text-accent bg-accent/10 px-3 py-1.5 rounded-full border border-accent/20"><AlertCircle size={14} /> On Hold</span>;
      default:
        return <span className="flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20"><Clock size={14} /> Active</span>;
    }
  };

  const getInvoiceStatusBadge = (status) => {
    switch (status) {
      case 'paid':
        return <span className="text-xs font-semibold text-success">Paid</span>;
      case 'overdue':
        return <span className="text-xs font-semibold text-accent">Overdue</span>;
      case 'sent':
        return <span className="text-xs font-semibold text-primary">Sent</span>;
      default:
        return <span className="text-xs font-semibold text-text-secondary">Draft</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/app/projects')} className="p-2 bg-surface2 border border-border rounded-xl text-text-secondary hover:text-text-primary hover:bg-surface">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">{project.name}</h1>
            <p className="text-text-secondary text-sm">Task aggregation space</p>
          </div>
        </div>

        <Link
          to={`/app/invoices/new?projectId=${project._id}&clientId=${project.clientId?._id}`}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-xl hover:scale-105 transition-all text-sm font-semibold shadow-md self-start"
        >
          <Plus size={16} /> Bill Project
        </Link>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Stats & Client mapping */}
        <div className="space-y-6">
          <div className="bg-surface p-6 rounded-2xl border border-border space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-text-primary uppercase tracking-wider">Overview</span>
              {getStatusBadge(project.status)}
            </div>
            
            <p className="text-text-secondary text-sm leading-relaxed">{project.description || 'No description provided.'}</p>
          </div>

          <div className="bg-surface p-6 rounded-2xl border border-border space-y-4">
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
              <User size={16} className="text-primary" />
              Linked Client
            </h3>
            
            <div>
              <p className="text-lg font-bold text-text-primary">{project.clientId?.name || 'Deleted Client'}</p>
              <p className="text-text-secondary text-sm">{project.clientId?.company}</p>
              <p className="text-text-muted text-xs mt-1">{project.clientId?.email}</p>
            </div>
          </div>
        </div>

        {/* Right: Project Invoices */}
        <div className="lg:col-span-2 bg-surface p-6 rounded-2xl border border-border space-y-6">
          <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
            <FileText size={20} className="text-primary" />
            Project Invoices
          </h3>

          {invoices.length === 0 ? (
            <div className="text-center py-12 bg-surface2/30 rounded-xl border border-dashed border-border">
              <FileText className="mx-auto text-text-muted mb-4" size={40} />
              <p className="text-text-secondary text-base mb-1">No invoices found for this project</p>
              <p className="text-text-muted text-xs mb-4">Generate project summaries efficiently.</p>
              <Link
                to={`/app/invoices/new?projectId=${project._id}&clientId=${project.clientId?._id}`}
                className="px-4 py-2 bg-surface2 border border-border text-text-primary text-xs rounded-xl hover:bg-border transition-all inline-block font-semibold"
              >
                Create First Project Invoice
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface2 text-text-secondary text-xs font-semibold uppercase">
                    <th className="px-4 py-3">Invoice #</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-text-primary">
                  {invoices.map((inv) => (
                    <tr key={inv._id} className="hover:bg-surface2/30 transition-colors">
                      <td className="px-4 py-4 font-mono font-medium text-text-primary">{inv.invoiceNumber}</td>
                      <td className="px-4 py-4 font-mono font-bold text-text-primary">₹{inv.total?.toLocaleString('en-IN') || 0}</td>
                      <td className="px-4 py-4">{getInvoiceStatusBadge(inv.status)}</td>
                      <td className="px-4 py-4 text-right">
                        <Link
                          to={`/app/invoices/${inv._id}`}
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
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
