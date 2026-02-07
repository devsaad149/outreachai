import React, { useEffect, useState } from 'react';
import { fetchLeads, startCampaign, getAuthUrl } from '../services/api';
import { Play, CheckCircle, Clock, AlertCircle, ExternalLink } from 'lucide-react';

const Dashboard = () => {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadLeads();
    }, []);

    const loadLeads = async () => {
        try {
            const res = await fetchLeads();
            setLeads(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleStartCampaign = async () => {
        if (confirm('Start sending personalized emails to all pending leads?')) {
            try {
                await startCampaign();
                alert('Campaign started!');
                loadLeads();
            } catch (err) {
                alert('Failed to start campaign.');
            }
        }
    };

    const handleConnectGoogle = async () => {
        try {
            const res = await getAuthUrl();
            window.open(res.data.url, '_blank');
        } catch (err) {
            alert('Failed to get auth URL');
        }
    };

    const stats = {
        total: leads.length,
        sent: leads.filter(l => l.status === 'Sent' || l.status === 'Follow-up Sent').length,
        replied: leads.filter(l => l.status === 'Replied' || l.status === 'Meeting Scheduled').length,
        pending: leads.filter(l => l.status === 'Pending').length,
    };

    return (
        <div className="p-8 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                    <p className="text-slate-400">Manage your AI email outreach campaigns</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={handleConnectGoogle}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors border border-slate-600"
                    >
                        <ExternalLink size={18} /> Connect Gmail
                    </button>
                    <button
                        onClick={handleStartCampaign}
                        disabled={stats.pending === 0}
                        className="flex items-center gap-2 px-6 py-2 bg-primary-600 hover:bg-primary-500 disabled:bg-slate-700 disabled:opacity-50 text-white rounded-lg transition-colors font-semibold"
                    >
                        <Play size={18} /> Start Campaign
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Leads" value={stats.total} icon={<Clock className="text-blue-400" />} />
                <StatCard title="Emails Sent" value={stats.sent} icon={<CheckCircle className="text-green-400" />} />
                <StatCard title="Replies" value={stats.replied} icon={<AlertCircle className="text-yellow-400" />} />
                <StatCard title="Pending" value={stats.pending} icon={<Clock className="text-slate-400" />} />
            </div>

            {/* Recent Leads Table */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                <div className="p-6 border-b border-slate-700">
                    <h2 className="text-xl font-semibold">Leads Status</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-900/50 text-slate-400 text-sm uppercase">
                            <tr>
                                <th className="px-6 py-4">Business</th>
                                <th className="px-6 py-4">Contact</th>
                                <th className="px-6 py-4">Email</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Created</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {leads.map((lead) => (
                                <tr key={lead.id} className="hover:bg-slate-700/30 transition-colors">
                                    <td className="px-6 py-4 font-medium">{lead.business_name}</td>
                                    <td className="px-6 py-4">{lead.decision_maker_name}</td>
                                    <td className="px-6 py-4 text-slate-400">{lead.email}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusStyle(lead.status)}`}>
                                            {lead.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500 text-sm">
                                        {new Date(lead.createdAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                            {leads.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                                        No leads found. Upload a CSV to get started.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, icon }) => (
    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
        <div className="flex justify-between items-start mb-4">
            <h3 className="text-slate-400 text-sm font-medium">{title}</h3>
            {icon}
        </div>
        <p className="text-2xl font-bold text-white">{value}</p>
    </div>
);

const getStatusStyle = (status) => {
    switch (status) {
        case 'Pending': return 'bg-slate-700 text-slate-300';
        case 'Sent': return 'bg-blue-900/40 text-blue-400';
        case 'Replied': return 'bg-green-900/40 text-green-400';
        case 'Follow-up Sent': return 'bg-purple-900/40 text-purple-400';
        case 'Meeting Scheduled': return 'bg-emerald-900/40 text-emerald-400';
        case 'Not Interested': return 'bg-red-900/40 text-red-400';
        default: return 'bg-slate-700 text-slate-300';
    }
};

export default Dashboard;
