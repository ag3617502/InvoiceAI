import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Link } from 'react-router-dom';
import { Search, Plus, User, Mail, Phone, Briefcase, Tag, Edit, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editClientId, setEditClientId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [newClient, setNewClient] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    gstNumber: '',
    tags: '',
    status: 'active',
  });

  const fetchClients = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/clients?search=${search}&page=${page}&limit=6&status=${statusFilter}`);
      setClients(res.data.data);
      setTotalPages(res.data.pagination?.totalPages || 1);
    } catch (error) {
      toast.error('Failed to fetch clients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchClients();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search, page, statusFilter]);

  const handleCreateClient = async (e) => {
    e.preventDefault();
    try {
      const tagsArray = newClient.tags.split(',').map((t) => t.trim()).filter(Boolean);
      if (editClientId) {
        await api.put(`/clients/${editClientId}`, { ...newClient, tags: tagsArray });
        toast.success('Client updated successfully!');
      } else {
        await api.post('/clients', { ...newClient, tags: tagsArray });
        toast.success('Client added successfully!');
      }
      setIsModalOpen(false);
      setEditClientId(null);
      setNewClient({ name: '', email: '', phone: '', company: '', gstNumber: '', tags: '', status: 'active' });
      fetchClients();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save client');
    }
  };

  const handleEditClient = (client) => {
    setEditClientId(client._id);
    setNewClient({
      name: client.name,
      email: client.email || '',
      phone: client.phone || '',
      company: client.company || '',
      gstNumber: client.gstNumber || '',
      tags: client.tags ? client.tags.join(', ') : '',
      status: client.status || (client.isActive === false ? 'inactive' : 'active'),
    });
    setIsModalOpen(true);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="flex items-center gap-1 text-xs font-semibold text-success bg-success/10 px-2.5 py-1 rounded-full border border-success/20"><CheckCircle size={12} /> Active</span>;
      case 'inactive':
        return <span className="flex items-center gap-1 text-xs font-semibold text-accent bg-accent/10 px-2.5 py-1 rounded-full border border-accent/20"><AlertCircle size={12} /> Inactive</span>;
      case 'prospect':
        return <span className="flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20"><Clock size={12} /> Prospect</span>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">Clients</h1>
          <p className="text-text-secondary">Manage your client relationships and view their financial stats.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-xl hover:scale-105 transition-all shadow-lg font-semibold self-start"
        >
          <Plus size={18} /> Add Client
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-4">
        {['', 'active', 'inactive', 'prospect'].map((s) => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              statusFilter === s
                ? 'bg-primary text-white shadow-md'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface2'
            }`}
          >
            {s === '' ? 'All Clients' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-text-muted">
          <Search size={18} />
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-xl text-text-primary focus:outline-none focus:border-primary transition-colors"
          placeholder="Search by name, email, or company..."
        />
      </div>

      {/* Client Cards Grid */}
      {clients.length === 0 ? (
        <div className="text-center py-12 bg-surface rounded-2xl border border-border">
          <User className="mx-auto text-text-muted mb-4" size={48} />
          <p className="text-text-secondary text-lg mb-2">No clients found</p>
          <p className="text-text-muted text-sm mb-4">Add your first client to get started.</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-surface2 text-text-primary border border-border rounded-xl hover:bg-border transition-all"
          >
            Add Client
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.map((client) => (
            <Link to={`/app/clients/${client._id}`} key={client._id} className="bg-surface p-6 rounded-2xl border border-border hover:shadow-purple-glow transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-surface2 flex items-center justify-center text-primary text-xl font-bold border border-border">
                      {client.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-text-primary truncate">{client.name}</h3>
                      <p className="text-sm text-text-secondary truncate">{client.company || 'Individual'}</p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleEditClient(client); }}
                    className="p-2 bg-surface2 border border-border rounded-xl text-text-secondary hover:text-text-primary hover:bg-border transition-all"
                  >
                    <Edit size={16} />
                  </button>
                </div>

                <div className="space-y-2 text-sm text-text-secondary mb-4">
                  {client.email && (
                    <p className="flex items-center gap-2">
                      <Mail size={14} className="text-text-muted" /> {client.email}
                    </p>
                  )}
                  {client.phone && (
                    <p className="flex items-center gap-2">
                      <Phone size={14} className="text-text-muted" /> {client.phone}
                    </p>
                  )}
                </div>

                {client.tags && client.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {client.tags.map((tag) => (
                      <span key={tag} className="flex items-center gap-1 text-xs font-medium bg-surface2 text-text-secondary px-2 py-1 rounded-full border border-border">
                        <Tag size={10} /> {tag}
                      </span>
                    ))}
                  </div>
                )}
                {statusFilter === '' && (
                  <div className="flex justify-end mb-4">
                    {getStatusBadge(client.status || (client.isActive === false ? 'inactive' : 'active'))}
                  </div>
                )}
              </div>


              <div className="border-t border-border pt-4 mt-4 flex justify-between items-center text-xs">
                <div>
                  <p className="text-text-muted">Total Invoiced</p>
                  <p className="text-white font-bold font-mono">₹{client.totalInvoiced?.toLocaleString('en-IN') || 0}</p>
                </div>
                <div>
                  <p className="text-text-muted">Pending</p>
                  <p className="text-warning font-bold font-mono">₹{client.totalPending?.toLocaleString('en-IN') || 0}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-6 px-2">
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

      {/* Add Client Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface p-8 rounded-2xl border border-border shadow-purple-glow max-w-lg w-full">
            <h2 className="text-2xl font-bold text-text-primary mb-6">{editClientId ? 'Edit Client' : 'Add New Client'}</h2>
            <form onSubmit={handleCreateClient} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-text-secondary mb-2">Name*</label>
                  <input
                    type="text"
                    required
                    value={newClient.name}
                    onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                    className="w-full p-3 bg-surface2 border border-border rounded-xl text-text-primary focus:outline-none focus:border-primary"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm text-text-secondary mb-2">Company</label>
                  <input
                    type="text"
                    value={newClient.company}
                    onChange={(e) => setNewClient({ ...newClient, company: e.target.value })}
                    className="w-full p-3 bg-surface2 border border-border rounded-xl text-text-primary focus:outline-none focus:border-primary"
                    placeholder="Acme Inc."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-text-secondary mb-2">Email</label>
                  <input
                    type="email"
                    value={newClient.email}
                    onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                    className="w-full p-3 bg-surface2 border border-border rounded-xl text-text-primary focus:outline-none focus:border-primary"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm text-text-secondary mb-2">Phone</label>
                  <input
                    type="text"
                    value={newClient.phone}
                    onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                    className="w-full p-3 bg-surface2 border border-border rounded-xl text-text-primary focus:outline-none focus:border-primary"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-2">GST Number</label>
                <input
                  type="text"
                  value={newClient.gstNumber}
                  onChange={(e) => setNewClient({ ...newClient, gstNumber: e.target.value })}
                  className="w-full p-3 bg-surface2 border border-border rounded-xl text-text-primary focus:outline-none focus:border-primary"
                  placeholder="15-char GSTIN"
                />
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-2">Tags (Comma separated)</label>
                <input
                  type="text"
                  value={newClient.tags}
                  onChange={(e) => setNewClient({ ...newClient, tags: e.target.value })}
                  className="w-full p-3 bg-surface2 border border-border rounded-xl text-text-primary focus:outline-none focus:border-primary"
                  placeholder="Design, Retainer, Tech"
                />
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-2">Client Status</label>
                <select
                  value={newClient.status}
                  onChange={(e) => setNewClient({ ...newClient, status: e.target.value })}
                  className="w-full p-3 bg-surface2 border border-border rounded-xl text-text-primary focus:outline-none focus:border-primary"
                >
                  <option value="active" className="bg-surface">Active</option>
                  <option value="inactive" className="bg-surface">Inactive</option>
                  <option value="prospect" className="bg-surface">Prospect</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditClientId(null);
                    setNewClient({ name: '', email: '', phone: '', company: '', gstNumber: '', tags: '', status: 'active' });
                  }}
                  className="px-4 py-2 bg-surface2 text-text-primary border border-border rounded-xl hover:bg-border transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-xl hover:scale-105 transition-all shadow-lg"
                >
                  {editClientId ? 'Update Client' : 'Save Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clients;
