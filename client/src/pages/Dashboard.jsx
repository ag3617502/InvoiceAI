import React, { useEffect, useState } from 'react';
import useAuthStore from '../store/authStore';
import api from '../api/axios';
import { DollarSign, AlertCircle, CheckCircle, TrendingUp, Plus, Users, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const Dashboard = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    revenue: 0,
    pending: 0,
    overdue: 0,
    profit: 0,
  });
  const [loading, setLoading] = useState(true);

  const [recentActivity, setRecentActivity] = useState([]);
  const [upcomingPayments, setUpcomingPayments] = useState([]);
  const [trend, setTrend] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard/stats');
        setStats(res.data.data.stats);
        setRecentActivity(res.data.data.recentActivity);
        setUpcomingPayments(res.data.data.upcomingPayments || []);
        setTrend(res.data.data.trend);
      } catch (error) {
        console.error('Error fetching dashboard stats', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Greeting Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">
            Namaste, {user?.businessName || 'Business Owner'} 👋
          </h1>
          <p className="text-text-secondary">Here's what's happening with your business today.</p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/app/invoices/new"
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl hover:scale-105 transition-all shadow-lg text-sm font-semibold"
          >
            <Plus size={16} /> New Invoice
          </Link>
          {/* <Link
            to="/app/clients/new"
            className="flex items-center gap-2 px-4 py-2 bg-surface2 text-text-primary border border-border rounded-xl hover:bg-border transition-all text-sm font-semibold"
          >
            <Users size={16} /> Add Client
          </Link> */}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Revenue */}
        <div className="bg-surface p-6 rounded-2xl border border-border shadow-purple-glow">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-success/10 text-success rounded-xl">
              <CheckCircle size={24} />
            </div>
            {/* <span className="text-xs font-semibold text-success bg-success/10 px-2 py-1 rounded-full">
              +12% vs last month
            </span> */}
          </div>
          <p className="text-text-secondary text-sm font-medium mb-1">Revenue Collected</p>
          <h3 className="text-3xl font-bold text-text-primary font-mono">₹{stats.revenue.toLocaleString('en-IN')}</h3>
        </div>

        {/* Pending */}
        <div className="bg-surface p-6 rounded-2xl border border-border shadow-purple-glow">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-warning/10 text-warning rounded-xl">
              <FileText size={24} />
            </div>
          </div>
          <p className="text-text-secondary text-sm font-medium mb-1">Pending Invoices</p>
          <h3 className="text-3xl font-bold text-text-primary font-mono">₹{stats.pending.toLocaleString('en-IN')}</h3>
        </div>

        {/* Overdue */}
        <div className="bg-surface p-6 rounded-2xl border border-border shadow-purple-glow">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-accent/10 text-accent rounded-xl">
              <AlertCircle size={24} />
            </div>
            {stats.overdue > 0 && (
              <span className="text-xs font-semibold text-accent bg-accent/10 px-2 py-1 rounded-full">
                Needs Attention
              </span>
            )}
          </div>
          <p className="text-text-secondary text-sm font-medium mb-1">Overdue Amount</p>
          <h3 className="text-3xl font-bold text-text-primary font-mono">₹{stats.overdue.toLocaleString('en-IN')}</h3>
        </div>

        {/* Profit */}
        <div className="bg-surface p-6 rounded-2xl border border-border shadow-purple-glow">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-primary/10 text-primary rounded-xl">
              <TrendingUp size={24} />
            </div>
          </div>
          <p className="text-text-secondary text-sm font-medium mb-1">Net Profit</p>
          <h3 className="text-3xl font-bold text-text-primary font-mono">₹{stats.profit.toLocaleString('en-IN')}</h3>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (65%) - Placeholder for Charts */}
        <div className="lg:col-span-2 bg-surface p-6 rounded-2xl border border-border">
          <h2 className="text-xl font-bold text-text-primary mb-6">Financial Overview</h2>
          <div className="h-64 bg-surface2/30 p-4 rounded-xl border border-border">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={trend}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6C63FF" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6C63FF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A45" vertical={false} />
                <XAxis dataKey="name" stroke="#A0AEC0" fontSize={11} tickLine={false} />
                <YAxis stroke="#A0AEC0" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v >= 1000 ? (v/1000) + 'k' : v}`} />
                <Tooltip 
                  contentStyle={{ background: '#1A1A2E', borderColor: '#2A2A45', borderRadius: '8px', color: '#FFFFFF' }}
                  itemStyle={{ color: '#6C63FF' }}
                  labelStyle={{ color: '#A0AEC0' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#6C63FF" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Column (35%) - Recent Activity */}
        <div className="bg-surface p-6 rounded-2xl border border-border">
          <h2 className="text-xl font-bold text-text-primary mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.length === 0 ? (
              <p className="text-sm text-text-muted text-center py-4">No recent activity</p>
            ) : (
              recentActivity.map((act) => (
                <div key={act.id} className="flex items-start gap-3 p-3 bg-surface2 rounded-xl border border-border">
                  <div className={`p-2 rounded-lg ${act.type === 'invoice' ? 'bg-primary/10 text-primary' : 'bg-success/10 text-success'}`}>
                    {act.type === 'invoice' ? <FileText size={18} /> : <TrendingUp size={18} />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">{act.title}</p>
                    <p className="text-xs text-text-secondary">{act.description}</p>
                    <div className="flex items-center justify-between mt-1 gap-2">
                      <span className="text-[10px] text-text-muted">{new Date(act.date).toLocaleDateString('en-IN')}</span>
                      <span className="text-xs font-bold font-mono text-text-primary">₹{act.amount.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Upcoming Payments Widget */}
      <div className="bg-surface p-6 rounded-2xl border border-border">
        <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
          <AlertCircle className="text-accent" size={24} /> Upcoming Payments (Next 48 Hours)
        </h2>
        
        {upcomingPayments.length === 0 ? (
          <div className="text-center py-8 text-text-muted text-sm border border-dashed border-border rounded-xl bg-surface2/10">
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
    </div>
  );
};

export default Dashboard;
