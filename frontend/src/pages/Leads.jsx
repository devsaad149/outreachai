import React, { useState } from 'react';
import { previewCSV, uploadLeads } from '../services/api';
import { Upload, FileText, X, Check, AlertCircle, ArrowRight, RefreshCw } from 'lucide-react';

const Leads = () => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [previewing, setPreviewing] = useState(false);
    const [status, setStatus] = useState(null);
    const [preview, setPreview] = useState(null);
    const [columnMappings, setColumnMappings] = useState({});

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setStatus(null);
        setPreview(null);
    };

    const handlePreview = async () => {
        if (!file) return;
        setPreviewing(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await previewCSV(formData);
            setPreview(res.data);

            // Initialize column mappings with suggested mappings
            const initialMappings = {};
            Object.entries(res.data.suggested_mappings).forEach(([csvCol, mapping]) => {
                initialMappings[csvCol] = mapping.maps_to;
            });
            setColumnMappings(initialMappings);
        } catch (err) {
            setStatus({ type: 'error', message: 'Failed to preview CSV. Please check the file format.' });
        } finally {
            setPreviewing(false);
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('mappings', JSON.stringify(columnMappings));

        try {
            const res = await uploadLeads(formData);
            setStatus({ type: 'success', message: res.data.message });
            setFile(null);
            setPreview(null);
            setColumnMappings({});
        } catch (err) {
            setStatus({ type: 'error', message: 'Failed to upload leads. Check CSV format.' });
        } finally {
            setUploading(false);
        }
    };

    const updateMapping = (csvColumn, targetField) => {
        setColumnMappings(prev => ({
            ...prev,
            [csvColumn]: targetField
        }));
    };

    const getConfidenceBadge = (confidence) => {
        const colors = {
            high: 'bg-green-900/30 text-green-400 border-green-900',
            medium: 'bg-yellow-900/30 text-yellow-400 border-yellow-900',
            low: 'bg-orange-900/30 text-orange-400 border-orange-900'
        };
        return colors[confidence] || colors.low;
    };

    const targetFields = [
        { value: 'business_name', label: 'Business Name' },
        { value: 'decision_maker_name', label: 'Decision Maker Name' },
        { value: 'email', label: 'Email' },
        { value: 'website', label: 'Website' },
        { value: 'industry', label: 'Industry' },
        { value: null, label: 'Skip this column' }
    ];

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Import Leads</h1>

            {!preview ? (
                <div className="bg-slate-800 p-8 rounded-2xl border-2 border-dashed border-slate-700 hover:border-primary-500 transition-colors">
                    <div className="flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-primary-900/20 text-primary-500 rounded-full flex items-center justify-center mb-4">
                            <Upload size={32} />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Upload your Leads CSV</h3>
                        <p className="text-slate-400 mb-6 max-w-sm">
                            Our smart mapper will automatically detect your columns. No need to match exact names!
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
                                onClick={handlePreview}
                                disabled={previewing}
                                className="mt-6 w-full max-w-md py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {previewing ? (
                                    <>
                                        <RefreshCw size={20} className="animate-spin" />
                                        Analyzing...
                                    </>
                                ) : (
                                    <>
                                        Preview & Map Columns
                                        <ArrowRight size={20} />
                                    </>
                                )}
                            </button>
                        )}

                        {status && (
                            <div className={`mt-6 p-4 rounded-lg w-full max-w-md flex items-center gap-3 ${status.type === 'success' ? 'bg-green-900/20 text-green-400 border border-green-900' : 'bg-red-900/20 text-red-400 border border-red-900'}`}>
                                {status.type === 'success' ? <Check size={20} /> : <AlertCircle size={20} />}
                                <p className="text-sm font-medium">{status.message}</p>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Check className="text-green-500" size={24} />
                            Column Mapping Preview
                        </h2>
                        <p className="text-slate-400 mb-6">
                            We've automatically detected your columns. Review and adjust the mappings below before importing.
                        </p>

                        <div className="space-y-3">
                            {preview.headers.map((header) => {
                                const suggestion = preview.suggested_mappings[header];
                                const currentMapping = columnMappings[header];

                                return (
                                    <div key={header} className="bg-slate-900 p-4 rounded-lg border border-slate-700">
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex-1">
                                                <p className="font-medium text-slate-200">{header}</p>
                                                {suggestion && (
                                                    <span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded border ${getConfidenceBadge(suggestion.confidence)}`}>
                                                        {suggestion.confidence} confidence
                                                    </span>
                                                )}
                                            </div>
                                            <ArrowRight className="text-slate-600" size={20} />
                                            <div className="flex-1">
                                                <select
                                                    value={currentMapping || ''}
                                                    onChange={(e) => updateMapping(header, e.target.value || null)}
                                                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
                                                >
                                                    {targetFields.map(field => (
                                                        <option key={field.value || 'skip'} value={field.value || ''}>
                                                            {field.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {preview.sample_rows && preview.sample_rows.length > 0 && (
                            <div className="mt-6">
                                <h3 className="text-sm font-semibold text-slate-400 mb-2">Sample Data Preview</h3>
                                <div className="bg-slate-950 p-3 rounded-lg overflow-x-auto">
                                    <table className="w-full text-xs">
                                        <thead>
                                            <tr className="border-b border-slate-700">
                                                {preview.headers.map(h => (
                                                    <th key={h} className="px-2 py-2 text-left text-slate-400">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {preview.sample_rows.map((row, idx) => (
                                                <tr key={idx} className="border-b border-slate-800">
                                                    {preview.headers.map(h => (
                                                        <td key={h} className="px-2 py-2 text-slate-300">{row[h]}</td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        <div className="mt-6 flex gap-3">
                            <button
                                onClick={() => {
                                    setPreview(null);
                                    setColumnMappings({});
                                }}
                                className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleUpload}
                                disabled={uploading}
                                className="flex-1 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg font-bold transition-all disabled:opacity-50"
                            >
                                {uploading ? 'Importing...' : `Import ${preview.sample_rows?.length || 0}+ Leads`}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Leads;
