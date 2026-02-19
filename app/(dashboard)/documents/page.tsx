'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FileText, Trash2, Upload, Loader2, File, FileImage, UserPlus, Image as ImageIcon, Copy, Check } from 'lucide-react';
import Tesseract from 'tesseract.js';

export default function DocumentsPage() {
    // Documents State
    const [files, setFiles] = useState<FileList | null>(null);
    const [uploading, setUploading] = useState(false);
    const [documents, setDocuments] = useState<any[]>([]);
    const [loadingDocs, setLoadingDocs] = useState(true);

    // OCR State
    const [ocrImage, setOcrImage] = useState<File | null>(null);
    const [ocrText, setOcrText] = useState('');
    const [ocrLoading, setOcrLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const fetchDocuments = async () => {
        try {
            const res = await fetch('/api/documents');
            const data = await res.json();
            if (data.documents) {
                setDocuments(data.documents);
            }
        } catch (e) {
            console.error('Failed to load docs');
        } finally {
            setLoadingDocs(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, []);

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!files || files.length === 0) return;

        setUploading(true);
        let successCount = 0;
        let failCount = 0;

        // Loop through multiple files
        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            if (file.size > 4.5 * 1024 * 1024) {
                failCount++;
                continue;
            }

            const formData = new FormData();
            formData.append('file', file);

            try {
                const res = await fetch('/api/documents/upload', {
                    method: 'POST',
                    body: formData
                });
                if (res.ok) successCount++;
                else failCount++;
            } catch (error) {
                failCount++;
            }
        }

        setFiles(null);
        setUploading(false);
        fetchDocuments();
        alert(`Upload complete. Success: ${successCount}, Failed: ${failCount}`);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure? This will delete the document and its index.')) return;
        try {
            const res = await fetch(`/api/documents?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchDocuments();
            } else {
                const data = await res.json();
                alert(`Delete failed: ${data.error || 'Server error'}`);
            }
        } catch (e) { alert('Delete failed: Network error'); }
    };

    const handleOcr = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!ocrImage) return;

        setOcrLoading(true);
        setOcrText('');
        try {
            const { data: { text } } = await Tesseract.recognize(
                ocrImage,
                'eng',
                { logger: m => console.log(m) }
            );
            setOcrText(text);
        } catch (error) {
            alert('Failed to extract text from image');
            console.error(error);
        } finally {
            setOcrLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(ocrText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const getIcon = (type: string) => {
        if (type.includes('pdf')) return <FileText className="text-red-400" />;
        if (type.includes('word')) return <FileText className="text-blue-400" />;
        if (type.includes('image')) return <FileImage className="text-purple-400" />;
        return <File className="text-gray-400" />;
    }

    return (
        <div className="space-y-8 animate-fade-in-up pb-20">
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Document Manager</h1>
                <p className="text-gray-400 mt-1">Upload documents or extract text from images.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Upload Section (Multi) */}
                <Card className="border-white/10 relative overflow-hidden h-fit">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-celestial-orange/5 rounded-full blur-3xl -z-0 pointer-events-none"></div>
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Upload className="w-5 h-5 text-orange-500" />
                            Upload Documents (Multi)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="z-10 relative">
                        <form onSubmit={handleUpload} className="space-y-4">
                            <div className="space-y-2">
                                <Input
                                    type="file"
                                    multiple
                                    onChange={(e) => setFiles(e.target.files)}
                                    className="bg-black/20 text-white border-white/10 file:bg-orange-600 file:border-0 file:rounded-md file:text-white file:px-2 file:mr-4 hover:file:bg-orange-500 cursor-pointer"
                                    accept=".pdf,.docx,.txt,.png,.jpg,.jpeg"
                                />
                                <p className="text-xs text-gray-500">Supported: PDF, DOCX, TXT, Images. Max 4.5MB per file.</p>
                            </div>
                            <Button type="submit" disabled={!files || uploading} className="w-full bg-gradient-orange text-white">
                                {uploading ? <Loader2 className="animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                                {uploading ? 'Uploading...' : 'Upload Files'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* OCR Section (Image to Text) */}
                <Card className="border-white/10 relative overflow-hidden flex flex-col">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <ImageIcon className="w-5 h-5 text-blue-500" />
                            Image to Text (OCR)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col space-y-4">
                        <form onSubmit={handleOcr} className="flex gap-3 items-end">
                            <div className="flex-1">
                                <Input
                                    type="file"
                                    onChange={(e) => setOcrImage(e.target.files?.[0] || null)}
                                    className="bg-black/20 text-white border-white/10 text-xs"
                                    accept=".png,.jpg,.jpeg"
                                />
                            </div>
                            <Button type="submit" disabled={!ocrImage || ocrLoading} size="sm" className="bg-blue-600 hover:bg-blue-500 text-white">
                                {ocrLoading ? <Loader2 className="animate-spin" /> : 'Extract'}
                            </Button>
                        </form>

                        {ocrText && (
                            <div className="flex-1 relative bg-black/40 rounded-lg p-3 border border-white/5 min-h-[150px]">
                                <button
                                    onClick={copyToClipboard}
                                    className="absolute top-2 right-2 p-1.5 rounded-md bg-white/10 hover:bg-white/20 text-gray-300 transition-colors"
                                    title="Copy Text"
                                >
                                    {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                                </button>
                                <p className="text-sm text-gray-300 whitespace-pre-wrap font-mono">{ocrText}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Documents List */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-white">Your Documents</h2>
                {loadingDocs ? (
                    <div className="text-center text-gray-500 py-10">Loading documents...</div>
                ) : documents.length === 0 ? (
                    <div className="text-center text-gray-500 py-10 border border-dashed border-white/10 rounded-xl">
                        No documents found. Upload one to get started.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {documents.map((doc) => (
                            <Card key={doc.id} className="border-white/10 hover:border-orange-500/30 transition-colors group bg-white/5">
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="p-2 bg-black/30 rounded-lg">
                                            {getIcon(doc.file_type)}
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="text-white font-medium truncate" title={doc.filename}>{doc.filename}</p>
                                            <p className="text-xs text-gray-500">{new Date(doc.uploaded_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(doc.id)}
                                        className="p-2 text-gray-500 hover:text-red-400 transition-colors rounded-lg hover:bg-white/5"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
