import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { Briefcase, Plus, Search, Folder, User, CheckCircle, Clock, AlertCircle, Edit } from 'lucide-react';
import toast from 'react-hot-toast';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editProjectId, setEditProjectId] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    clientId: '',
    status: 'active',
    startDate: getTodayDate(),
    endDate: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [projRes, clientRes] = await Promise.all([
        api.get(`/projects?search=${search}&page=${page}&limit=9&status=${statusFilter}`),
        api.get('/clients?limit=100'),
      ]);
      setProjects(projRes.data.data);
      setTotalPages(projRes.data.pagination?.totalPages || 1);
      setClients(clientRes.data.data);
      if (clientRes.data.data.length > 0 && !newProject.clientId) {
        setNewProject(prev => ({ ...prev, clientId: clientRes.data.data[0]._id }));
      }
    } catch (error) {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, search, statusFilter]);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProject.clientId) {
      return toast.error('You must link a Client to the project!');
    }
    try {
      if (editProjectId) {
        await api.put(`/projects/${editProjectId}`, newProject);
        toast.success('Project updated successfully!');
      } else {
        await api.post('/projects', newProject);
        toast.success('Project created successfully!');
      }
      setIsModalOpen(false);
      setEditProjectId(null);
      setNewProject({ name: '', description: '', clientId: clients[0]?._id || '', status: 'active', startDate: getTodayDate(), endDate: '' });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save project');
    }
  };

  const handleEditProject = (project) => {
    setEditProjectId(project._id);
    setNewProject({
      name: project.name,
      description: project.description || '',
      clientId: project.clientId?._id || project.clientId,
      status: project.status || 'active',
      startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
      endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
    });
    setIsModalOpen(true);
  };

  const getStatusBadge = (status) => {
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

  if (loading && projects.length === 0) {
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
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">Projects</h1>
          <p className="text-text-secondary">Mandatory hubs linking specific client accounts to separate task aggregates.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-xl hover:scale-105 transition-all shadow-lg font-semibold self-start"
        >
          <Plus size={18} /> New Project
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-4">
        {['', 'active', 'proposed', 'completed', 'on_hold', 'aborted'].map((s) => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              statusFilter === s
                ? 'bg-primary text-white shadow-md'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface2'
            }`}
          >
            {s === '' ? 'All Projects' : s.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
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
          placeholder="Search by project name..."
        />
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="text-center py-12 bg-surface rounded-2xl border border-border">
          <Briefcase className="mx-auto text-text-muted mb-4" size={48} />
          <p className="text-text-secondary text-lg mb-2">No projects found</p>
          <p className="text-text-muted text-sm mb-4">Create your first mandatory project mapping node.</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-surface2 text-text-primary border border-border rounded-xl hover:bg-border transition-all"
          >
            New Project
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Link
                key={project._id}
                to={`/app/projects/${project._id}`}
                className="bg-surface p-6 rounded-2xl border border-border hover:shadow-purple-glow transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                      <Folder size={24} />
                    </div>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleEditProject(project);
                      }}
                      className="p-2 bg-surface2 border border-border rounded-xl text-text-secondary hover:text-text-primary hover:bg-border transition-all"
                    >
                      <Edit size={16} />
                    </button>
                  </div>

                  <h3 className="text-lg font-bold text-text-primary mb-1 truncate">{project.name}</h3>
                  <p className="text-sm text-text-secondary mb-4 line-clamp-2">{project.description || 'No description provided.'}</p>
                  
                  {statusFilter === '' && (
                    <div className="flex justify-end mb-4">
                      {getStatusBadge(project.status)}
                    </div>
                  )}
                </div>

                <div className="border-t border-border pt-4 mt-auto flex items-center gap-2 text-xs text-text-muted">
                  <User size={14} />
                  <span className="truncate text-text-secondary">Client: <strong className="text-text-primary">{project.clientId?.name || 'Deleted'}</strong></span>
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

      {/* Add Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface p-8 rounded-2xl border border-border shadow-purple-glow max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-text-primary mb-6">{editProjectId ? 'Edit Project' : 'Create New Project'}</h2>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-sm text-text-secondary mb-2">Project Name*</label>
                <input
                  type="text"
                  required
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  className="w-full p-3 bg-surface2 border border-border rounded-xl text-text-primary focus:outline-none focus:border-primary"
                  placeholder="Website Redesign"
                />
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-2">Description</label>
                <textarea
                  rows="3"
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  className="w-full p-3 bg-surface2 border border-border rounded-xl text-text-primary focus:outline-none focus:border-primary resize-none"
                  placeholder="Task breakdowns..."
                />
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-2">Link Client*</label>
                <select
                  required
                  value={newProject.clientId}
                  onChange={(e) => setNewProject({ ...newProject, clientId: e.target.value })}
                  className="w-full p-3 bg-surface2 border border-border rounded-xl text-text-primary focus:outline-none focus:border-primary"
                >
                  {clients.length === 0 ? (
                    <option disabled value="">No clients available. Create a client first!</option>
                  ) : (
                    clients.map((client) => (
                      <option key={client._id} value={client._id} className="bg-surface">
                        {client.name} ({client.company || 'Individual'})
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Start & End Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-text-secondary mb-2">Start Date</label>
                  <input
                    type="date"
                    value={newProject.startDate || ''}
                    onChange={(e) => setNewProject({ ...newProject, startDate: e.target.value })}
                    className="w-full p-3 bg-surface2 border border-border rounded-xl text-text-primary focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm text-text-secondary mb-2">End Date</label>
                  <input
                    type="date"
                    value={newProject.endDate || ''}
                    onChange={(e) => setNewProject({ ...newProject, endDate: e.target.value })}
                    className="w-full p-3 bg-surface2 border border-border rounded-xl text-text-primary focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-2">Status</label>
                <select
                  value={newProject.status}
                  onChange={(e) => setNewProject({ ...newProject, status: e.target.value })}
                  className="w-full p-3 bg-surface2 border border-border rounded-xl text-text-primary focus:outline-none focus:border-primary"
                >
                  <option value="active" className="bg-surface">Active</option>
                  <option value="proposed" className="bg-surface">Proposed</option>
                  <option value="completed" className="bg-surface">Completed</option>
                  <option value="on_hold" className="bg-surface">On Hold</option>
                  <option value="aborted" className="bg-surface">Aborted</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditProjectId(null);
                    setNewProject({ name: '', description: '', clientId: clients[0]?._id || '', status: 'active', startDate: getTodayDate(), endDate: '' });
                  }}
                  className="px-4 py-2 bg-surface2 text-text-primary border border-border rounded-xl hover:bg-border transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={clients.length === 0}
                  className="px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-xl hover:scale-105 transition-all shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {editProjectId ? 'Update Project' : 'Save Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
