import React, { useState } from 'react';
import { Save, Bot, Mail, Shield } from 'lucide-react';

const Settings = () => {
    const [aiTone, setAiTone] = useState('Helpful & Professional');
    const [signature, setSignature] = useState('Best regards,\nMy Outreach Team');
    const [followUpDays, setFollowUpDays] = useState(2);

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold">Settings</h1>

            <section className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                <div className="p-6 border-b border-slate-700 flex items-center gap-3">
                    <Bot className="text-primary-500" />
                    <h2 className="text-xl font-semibold">AI Configuration</h2>
                </div>
                <div className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">AI Tone & Personality</label>
                        <select
                            value={aiTone}
                            onChange={(e) => setAiTone(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-primary-500 outline-none"
                        >
                            <option>Helpful & Professional</option>
                            <option>Casual & Friendly</option>
                            <option>Direct & Results-Oriented</option>
                            <option>Inquisitive & Interested</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Custom AI Instructions</label>
                        <textarea
                            placeholder="e.g. Always mention our 100% money-back guarantee..."
                            className="w-full h-32 bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                        ></textarea>
                    </div>
                </div>
            </section>

            <section className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                <div className="p-6 border-b border-slate-700 flex items-center gap-3">
                    <Mail className="text-primary-500" />
                    <h2 className="text-xl font-semibold">Email Delivery</h2>
                </div>
                <div className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Email Signature</label>
                        <textarea
                            value={signature}
                            onChange={(e) => setSignature(e.target.value)}
                            className="w-full h-24 bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                        ></textarea>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Follow-up Delay (Hours)</label>
                        <input
                            type="number"
                            value={followUpDays * 24}
                            onChange={(e) => setFollowUpDays(e.target.value / 24)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-primary-500 outline-none"
                        />
                        <p className="mt-2 text-xs text-slate-500">Wait time before automatically sending the first follow-up email.</p>
                    </div>
                </div>
            </section>

            <section className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden opacity-60">
                <div className="p-6 border-b border-slate-700 flex items-center gap-3">
                    <Shield className="text-primary-500" />
                    <h2 className="text-xl font-semibold">Security & API Keys</h2>
                </div>
                <div className="p-6">
                    <p className="text-sm text-slate-400">Settings here are managed via environment variables for security.</p>
                </div>
            </section>

            <div className="flex justify-end">
                <button className="flex items-center gap-2 px-8 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-bold shadow-lg shadow-primary-500/20 transition-all">
                    <Save size={20} /> Save All Settings
                </button>
            </div>
        </div>
    );
};

export default Settings;
