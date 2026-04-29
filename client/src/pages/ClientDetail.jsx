import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Briefcase, ArrowLeft, Mail, Phone, MapPin, Tag, CheckCircle, AlertCircle, Clock, Folder, Edit } from 'lucide-react';
import toast from 'react-hot-toast';

const ClientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newClient, setNewClient] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    gstNumber: '',
    tags: '',
    status: 'active',
  });

  const fetchClientData = async () => {
    try {
      setLoading(true);
      const [clientRes, projectsRes] = await Promise.all([
        api.get(`/clients/${id}`),
        api.get(`/projects?clientId=${id}&limit=100`)
      ]);
      setClient(clientRes.data.data);
      setProjects(projectsRes.data.data);
    } catch (error) {
      toast.error('Failed to load client details');
      navigate('/app/clients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientData();
  }, [id, navigate]);

  const handleEditClient = () => {
    if (!client) return;
    setNewClient({
      name: client.name || '',
      email: client.email || '',
      phone: client.phone || '',
      company: client.company || '',
      gstNumber: client.gstNumber || '',
      tags: client.tags ? client.tags.join(', ') : '',
      status: client.status || (client.isActive === false ? 'inactive' : 'active'),
    });
    setIsModalOpen(true);
  };

  const handleUpdateClient = async (e) => {
    e.preventDefault();
    try {
      const tagsArray = newClient.tags
        ? newClient.tags.split(',').map((t) => t.trim()).filter((t) => t)
        : [];
      await api.put(`/clients/${id}`, { ...newClient, tags: tagsArray });
      toast.success('Client updated successfully!');
      setIsModalOpen(false);
      fetchClientData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update client');
    }
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

  const getProjectStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <span className="flex items-center gap-1 text-xs font-semibold text-success bg-success/10 px-2.5 py-1 rounded-full border border-success/20"><CheckCircle size={12} /> Completed</span>;
      case 'on_hold':
        return <span className="flex items-center gap-1 text-xs font-semibold text-warning bg-warning/10 px-2.5 py-1 rounded-full border border-warning/20"><AlertCircle size={12} /> On Hold</span>;
      case 'aborted':
        return <span className="flex items-center gap-1 text-xs font-semibold text-accent bg-accent/10 px-2.5 py-1 rounded-full border border-accent/20"><AlertCircle size={12} /> Aborted</span>;
      case 'proposed':
        return <span className="flex items-center gap-1 text-xs font-semibold text-text-secondary bg-surface2 px-2.5 py-1 rounded-full border border-border"><Clock size={12} /> Proposed</span>;
      default:
        return <span className="flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20"><Clock size={12} /> Active</span>;
    }
  };

  if (loading || !client) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button 
        onClick={() => navigate('/app/clients')}
        className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors text-sm font-medium"
      >
        <ArrowLeft size={16} /> Back to Clients
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Client Overview (1/3 width) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-surface p-6 rounded-2xl border border-border">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-surface2 flex items-center justify-center text-primary text-2xl font-bold border border-border">
                  {client.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-text-primary tracking-tight">{client.name}</h1>
                  <p className="text-text-secondary">{client.company || 'Individual'}</p>
                  <div className="mt-2">
                    {getStatusBadge(client.status || (client.isActive === false ? 'inactive' : 'active'))}
                  </div>
                </div>
              </div>
              <button
                onClick={handleEditClient}
                className="p-2 bg-surface2 border border-border rounded-xl text-text-secondary hover:text-text-primary hover:bg-border transition-all"
              >
                <Edit size={16} />
              </button>
            </div>

            <div className="space-y-4">
              {client.email && (
                <div className="flex items-start gap-3">
                  <Mail size={18} className="text-text-muted mt-0.5" />
                  <div>
                    <p className="text-xs text-text-muted mb-0.5">Email</p>
                    <p className="text-sm text-text-primary">{client.email}</p>
                  </div>
                </div>
              )}
              {client.phone && (
                <div className="flex items-start gap-3">
                  <Phone size={18} className="text-text-muted mt-0.5" />
                  <div>
                    <p className="text-xs text-text-muted mb-0.5">Phone</p>
                    <p className="text-sm text-text-primary">{client.phone}</p>
                  </div>
                </div>
              )}
              {client.gstNumber && (
                <div className="flex items-start gap-3">
                  <Briefcase size={18} className="text-text-muted mt-0.5" />
                  <div>
                    <p className="text-xs text-text-muted mb-0.5">GST Number</p>
                    <p className="text-sm text-text-primary font-mono">{client.gstNumber}</p>
                  </div>
                </div>
              )}
              {client.address && (client.address.line1 || client.address.city) && (
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="text-text-muted mt-0.5" />
                  <div>
                    <p className="text-xs text-text-muted mb-0.5">Address</p>
                    <p className="text-sm text-text-primary">
                      {client.address.line1}{client.address.line2 && `, ${client.address.line2}`}<br />
                      {client.address.city && `${client.address.city}, `}{client.address.state && `${client.address.state} `}{client.address.pincode}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {client.tags && client.tags.length > 0 && (
              <div className="mt-6 pt-6 border-t border-border">
                <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {client.tags.map((tag) => (
                    <span key={tag} className="flex items-center gap-1 text-xs font-medium bg-surface2 text-text-secondary px-2.5 py-1 rounded-full border border-border">
                      <Tag size={12} /> {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <div className="mt-6 pt-6 border-t border-border grid grid-cols-2 gap-4">
               <div>
                 <p className="text-text-muted text-xs mb-1">Total Invoiced</p>
                 <p className="text-text-primary font-bold font-mono text-lg">₹{client.totalInvoiced?.toLocaleString('en-IN') || 0}</p>
               </div>
               <div>
                 <p className="text-text-muted text-xs mb-1">Pending</p>
                 <p className="text-warning font-bold font-mono text-lg">₹{client.totalPending?.toLocaleString('en-IN') || 0}</p>
               </div>
            </div>
          </div>
        </div>

        {/* Right Side: Client Projects (2/3 width) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-text-primary">Projects</h2>
            <Link 
              to="/app/projects"
              className="text-sm text-primary hover:underline font-medium"
            >
              View All Projects
            </Link>
          </div>

          {projects.length === 0 ? (
            <div className="bg-surface p-8 rounded-2xl border border-border text-center">
              <Folder className="mx-auto text-text-muted mb-3" size={40} />
              <h3 className="text-text-primary font-semibold mb-1">No Projects Found</h3>
              <p className="text-text-secondary text-sm">This client doesn't have any projects yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.map(project => (
                <Link
                  key={project._id}
                  to={`/app/projects/${project._id}`}
                  className="bg-surface p-6 rounded-2xl border border-border hover:shadow-purple-glow transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                        <Folder size={20} />
                      </div>
                    </div>
                    
                    <h3 className="text-base font-bold text-text-primary mb-1 truncate">{project.name}</h3>
                    <p className="text-xs text-text-secondary mb-3 line-clamp-2">{project.description || 'No description provided.'}</p>
                    
                    <div className="flex justify-end">
                      {getProjectStatusBadge(project.status)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Edit Client Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface p-8 rounded-2xl border border-border shadow-purple-glow max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-text-primary mb-6">Edit Client</h2>
            <form onSubmit={handleUpdateClient} className="space-y-4">
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
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-surface2 text-text-primary border border-border rounded-xl hover:bg-border transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-xl hover:scale-105 transition-all shadow-lg"
                >
                  Update Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientDetail;
