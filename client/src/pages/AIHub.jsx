import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Sparkles, FileText, Send, Calculator, Check, Copy } from 'lucide-react';
import toast from 'react-hot-toast';

const AIHub = () => {
  const [activeTab, setActiveTab] = useState('proposal');
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [copied, setCopied] = useState(false);

  // Proposal State
  const [proposalInput, setProposalInput] = useState({ clientName: '', projectScope: '', budget: '' });
  const [proposalOutput, setProposalOutput] = useState('');

  // Reminder State
  const [reminderInput, setReminderInput] = useState({ invoiceId: '', tone: 'polite' });
  const [reminderOutput, setReminderOutput] = useState('');

  // Tax State
  const [taxInput, setTaxInput] = useState({ annualIncome: '', businessExpenses: '' });
  const [taxOutput, setTaxOutput] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const clientRes = await api.get('/clients');
        setClients(clientRes.data.data);
        
        const invoiceRes = await api.get('/invoices');
        setInvoices(invoiceRes.data.data);
      } catch (error) {
        console.error('Failed to load data', error);
      }
    };
    fetchData();
  }, []);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  // 1. Generate Proposal
  const handleGenerateProposal = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/ai/proposal-writer', proposalInput);
      // Extract content from response object
      setProposalOutput(res.data.data.content || res.data.data);
      toast.success('Proposal generated!');
    } catch (error) {
      toast.error('Generation failed');
    } finally {
      setLoading(false);
    }
  };

  // 2. Generate Reminder
  const handleGenerateReminder = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const selectedInvoice = invoices.find(inv => inv._id === reminderInput.invoiceId);
      const res = await api.post('/ai/payment-reminder', {
        invoiceId: reminderInput.invoiceId,
        tone: reminderInput.tone
      });
      // Format subject and message for plain-text viewing
      const emailText = res.data.data.subject 
        ? `Subject: ${res.data.data.subject}\n\n${res.data.data.message}`
        : res.data.data;
      setReminderOutput(emailText);
      toast.success('Reminder generated!');
    } catch (error) {
      toast.error('Generation failed');
    } finally {
      setLoading(false);
    }
  };

  // 3. Estimate Tax
  const handleEstimateTax = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Mocking/Fallback if backend route not fully implemented
      // const res = await api.post('/ai/tax-estimator', taxInput);
      // setTaxOutput(res.data.data);
      
      // Basic simulation for demo/completeness
      const income = Number(taxInput.annualIncome);
      const expenses = Number(taxInput.businessExpenses);
      const netProfit = income - expenses;
      
      const oldTax = netProfit * 0.25; // simplified
      const newTax = netProfit * 0.15; // simplified
      
      setTaxOutput({
        netProfit,
        oldRegime: oldTax,
        newRegime: newTax,
        recommended: newTax < oldTax ? 'New Tax Regime' : 'Old Tax Regime'
      });
      toast.success('Tax estimated!');
    } catch (error) {
      toast.error('Estimation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-primary flex items-center gap-2 tracking-tight">
          <Sparkles className="text-primary" /> AI Hub
        </h1>
        <p className="text-text-secondary">AI-powered tools for writing proposals, reminding clients, and saving on taxes.</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-4">
        {[
          { id: 'proposal', name: 'Proposal Writer', icon: <FileText size={16} /> },
          { id: 'reminder', name: 'Payment Reminders', icon: <Send size={16} /> },
          { id: 'tax', name: 'Tax Estimator (India)', icon: <Calculator size={16} /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-surface2 text-text-primary border border-primary shadow-purple-glow'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface'
            }`}
          >
            {tab.icon} <span>{tab.name}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Left Form (40%) */}
        <div className="lg:col-span-2 bg-surface p-6 rounded-2xl border border-border self-start">
          
          {activeTab === 'proposal' && (
            <form onSubmit={handleGenerateProposal} className="space-y-4">
              <h2 className="text-xl font-bold text-text-primary mb-2">Write a Project Proposal</h2>
              <div>
                <label className="block text-sm text-text-secondary mb-2">Client Name / Company</label>
                <input
                  type="text"
                  value={proposalInput.clientName}
                  onChange={(e) => setProposalInput({ ...proposalInput, clientName: e.target.value })}
                  className="w-full p-3 bg-surface2 border border-border rounded-xl text-text-primary focus:outline-none focus:border-primary"
                  placeholder="e.g. Swiggy India"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-2">Project Scope</label>
                <textarea
                  value={proposalInput.projectScope}
                  onChange={(e) => setProposalInput({ ...proposalInput, projectScope: e.target.value })}
                  className="w-full p-3 bg-surface2 border border-border rounded-xl text-text-primary focus:outline-none focus:border-primary h-32"
                  placeholder="Describe the deliverables, timeline, tech stack..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-2">Estimated Budget (INR)</label>
                <input
                  type="text"
                  value={proposalInput.budget}
                  onChange={(e) => setProposalInput({ ...proposalInput, budget: e.target.value })}
                  className="w-full p-3 bg-surface2 border border-border rounded-xl text-text-primary focus:outline-none focus:border-primary font-mono"
                  placeholder="e.g. ₹1,50,000"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-xl hover:scale-105 transition-all shadow-lg"
              >
                {loading ? 'Generating...' : 'Generate Proposal'}
              </button>
            </form>
          )}

          {activeTab === 'reminder' && (
            <form onSubmit={handleGenerateReminder} className="space-y-4">
              <h2 className="text-xl font-bold text-text-primary mb-2">Smart Reminders</h2>
              <div>
                <label className="block text-sm text-text-secondary mb-2">Select Invoice</label>
                <select
                  value={reminderInput.invoiceId}
                  onChange={(e) => setReminderInput({ ...reminderInput, invoiceId: e.target.value })}
                  className="w-full p-3 bg-surface2 border border-border rounded-xl text-text-primary focus:outline-none focus:border-primary"
                  required
                >
                  <option value="">-- Choose Invoice --</option>
                  {invoices.map((inv) => (
                    <option key={inv._id} value={inv._id}>
                      {inv.invoiceNumber} - ₹{inv.total} ({inv.clientId?.name})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-2">Tone</label>
                <select
                  value={reminderInput.tone}
                  onChange={(e) => setReminderInput({ ...reminderInput, tone: e.target.value })}
                  className="w-full p-3 bg-surface2 border border-border rounded-xl text-text-primary focus:outline-none focus:border-primary"
                >
                  <option value="polite">Polite & Gentle</option>
                  <option value="firm">Firm & Professional</option>
                  <option value="legal">Strict/Legal warning</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-xl hover:scale-105 transition-all shadow-lg"
              >
                {loading ? 'Generating...' : 'Generate Text'}
              </button>
            </form>
          )}

          {activeTab === 'tax' && (
            <form onSubmit={handleEstimateTax} className="space-y-4">
              <h2 className="text-xl font-bold text-text-primary mb-2">Tax Estimator</h2>
              <div>
                <label className="block text-sm text-text-secondary mb-2">Gross Annual Income (INR)</label>
                <input
                  type="number"
                  value={taxInput.annualIncome}
                  onChange={(e) => setTaxInput({ ...taxInput, annualIncome: e.target.value })}
                  className="w-full p-3 bg-surface2 border border-border rounded-xl text-text-primary focus:outline-none focus:border-primary font-mono"
                  placeholder="1200000"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-2">Business Expenses (INR)</label>
                <input
                  type="number"
                  value={taxInput.businessExpenses}
                  onChange={(e) => setTaxInput({ ...taxInput, businessExpenses: e.target.value })}
                  className="w-full p-3 bg-surface2 border border-border rounded-xl text-text-primary focus:outline-none focus:border-primary font-mono"
                  placeholder="300000"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-xl hover:scale-105 transition-all shadow-lg"
              >
                {loading ? 'Calculate' : 'Estimate Tax'}
              </button>
            </form>
          )}

        </div>

        {/* Right Output Area (60%) */}
        <div className="lg:col-span-3 bg-surface2 p-6 rounded-2xl border border-border min-h-[400px] flex flex-col">
          <div className="flex justify-between items-center border-b border-border pb-4 mb-4">
            <span className="text-xs font-semibold text-text-secondary tracking-wider uppercase">AI Generated Output</span>
            {(proposalOutput || reminderOutput) && (
              <button
                onClick={() => handleCopy(activeTab === 'proposal' ? proposalOutput : reminderOutput)}
                className="flex items-center gap-2 text-xs text-primary font-semibold hover:underline bg-surface p-2 rounded-lg border border-border"
              >
                {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                <span>Copy</span>
              </button>
            )}
          </div>

          <div className="flex-1 flex flex-col justify-center">
            {activeTab === 'proposal' && (
              proposalOutput ? (
                <div className="text-text-primary whitespace-pre-line text-sm leading-relaxed font-sans">{proposalOutput}</div>
              ) : (
                <p className="text-text-muted text-center text-sm">Your generated proposal will appear here.</p>
              )
            )}

            {activeTab === 'reminder' && (
              reminderOutput ? (
                <div className="text-text-primary whitespace-pre-line text-sm leading-relaxed font-mono bg-surface p-4 rounded-xl border border-border">
                  {reminderOutput}
                </div>
              ) : (
                <p className="text-text-muted text-center text-sm">Your reminder message will appear here.</p>
              )
            )}

            {activeTab === 'tax' && (
              taxOutput ? (
                <div className="space-y-6">
                  <div className="text-center">
                    <span className="text-xs text-text-secondary">Recommended</span>
                    <h3 className="text-2xl font-bold text-success mt-1">{taxOutput.recommended}</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-surface p-4 rounded-xl border border-border text-center">
                      <p className="text-xs text-text-secondary mb-1">Old Tax Regime</p>
                      <span className="text-xl font-bold text-text-primary font-mono">₹{taxOutput.oldRegime.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="bg-surface p-4 rounded-xl border border-border text-center">
                      <p className="text-xs text-text-secondary mb-1">New Tax Regime</p>
                      <span className="text-xl font-bold text-primary font-mono">₹{taxOutput.newRegime.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <div className="bg-surface p-4 rounded-xl border border-dashed border-border text-center text-sm">
                    <span className="text-text-secondary">Estimated Savings: </span>
                    <span className="text-success font-bold font-mono">₹{(taxOutput.oldRegime - taxOutput.newRegime).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              ) : (
                <p className="text-text-muted text-center text-sm">Enter financial info to calculate tax comparisons.</p>
              )
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AIHub;
