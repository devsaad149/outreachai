import React, { useState } from 'react';
import { uploadLeads } from '../services/api';
import { Upload, FileText, X, Check } from 'lucide-react';

const Leads = () => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [status, setStatus] = useState(null);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setStatus(null);
    };

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await uploadLeads(formData);
            setStatus({ type: 'success', message: res.data.message });
            setFile(null);
        } catch (err) {
            setStatus({ type: 'error', message: 'Failed to upload leads. Check CSV format.' });
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Import Leads</h1>

            <div className="bg-slate-800 p-8 rounded-2xl border-2 border-dashed border-slate-700 hover:border-primary-500 transition-colors">
                <div className="flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-primary-900/20 text-primary-500 rounded-full flex items-center justify-center mb-4">
                        <Upload size={32} />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Upload your Leads CSV</h3>
                    <p className="text-slate-400 mb-6 max-w-sm">
                        Drag and drop your file here, or click to browse. CSV must include headers:
                        <span className="text-slate-200"> Business Name, Decision Maker Name, Email, Website, Industry</span>.
                    </p>

                    <input
                        type="file"
                        id="csv-upload"
                        className="hidden"
                        accept=".csv"
                        onChange={handleFileChange}
                    />
                    <label
                        htmlFor="csv-upload"
                        className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg cursor-pointer transition-colors"
                    >
                        {file ? 'Change File' : 'Select CSV'}
                    </label>

                    {file && (
                        <div className="mt-6 flex items-center gap-3 p-3 bg-slate-900 rounded-lg border border-slate-700 w-full max-w-md">
                            <FileText className="text-primary-500" />
                            <div className="flex-1 text-left">
                                <p className="text-sm font-medium truncate">{file.name}</p>
                                <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                            </div>
                            <button onClick={() => setFile(null)}><X size={18} className="text-slate-500 hover:text-white" /></button>
                        </div>
                    )}

                    {file && (
                        <button
                            onClick={handleUpload}
                            disabled={uploading}
                            className="mt-6 w-full max-w-md py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-bold transition-all disabled:opacity-50"
                        >
                            {uploading ? 'Processing...' : 'Upload & Process'}
                        </button>
                    )}

                    {status && (
                        <div className={`mt-6 p-4 rounded-lg w-full max-w-md flex items-center gap-3 ${status.type === 'success' ? 'bg-green-900/20 text-green-400 border border-green-900' : 'bg-red-900/20 text-red-400 border border-red-900'
                            }`}>
                            {status.type === 'success' ? <Check size={20} /> : <AlertCircle size={20} />}
                            <p className="text-sm font-medium">{status.message}</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-12">
                <h2 className="text-xl font-bold mb-4 text-slate-400">CSV Structure Requirements</h2>
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left border-b border-slate-700">
                                <th className="pb-3 px-2">Column Header</th>
                                <th className="pb-3 px-2 text-slate-500">Required</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            <tr><td className="py-3 px-2">Business Name</td><td className="py-3 px-2 text-green-500">Yes</td></tr>
                            <tr><td className="py-3 px-2">Decision Maker Name</td><td className="py-3 px-2 text-green-500">Yes</td></tr>
                            <tr><td className="py-3 px-2">Email</td><td className="py-3 px-2 text-green-500">Yes</td></tr>
                            <tr><td className="py-3 px-2">Website</td><td className="py-3 px-2 text-slate-500">No</td></tr>
                            <tr><td className="py-3 px-2">Industry</td><td className="py-3 px-2 text-slate-500">No</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Leads;
