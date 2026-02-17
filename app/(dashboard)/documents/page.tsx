'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FileText, Trash2, Upload, Loader2, File, FileImage } from 'lucide-react';

export default function DocumentsPage() {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [documents, setDocuments] = useState<any[]>([]);
    const [loadingDocs, setLoadingDocs] = useState(true);

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
        if (!file) return;

        if (file.size > 4.5 * 1024 * 1024) {
            alert('File too large. Maximum size is 4.5MB.');
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/documents/upload', {
                method: 'POST',
                body: formData
            });

            if (res.ok) {
                setFile(null);
                fetchDocuments(); // Refresh list
                alert('Upload successful!');
            } else {
                const data = await res.json();
                alert(`Upload failed: ${data.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error(error);
            alert('Upload error: Network or Server issue');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure? This will delete the document and its index.')) return;

        try {
            const res = await fetch(`/api/documents?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchDocuments();
            }
        } catch (e) {
            alert('Delete failed');
        }
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
                <p className="text-gray-400 mt-1">Upload documents (PDF, DOCX, TXT, Images) for RAG Chat.</p>
            </div>

            {/* Upload Section */}
            <Card className="border-white/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-celestial-orange/5 rounded-full blur-3xl -z-0 pointer-events-none"></div>
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <Upload className="w-5 h-5 text-orange-500" />
                        Upload New Document
                    </CardTitle>
                </CardHeader>
                <CardContent className="z-10 relative">
                    <form onSubmit={handleUpload} className="flex gap-4 items-end">
                        <div className="flex-1 space-y-2">
                            <Input
                                type="file"
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                                className="bg-black/20 text-white border-white/10 file:bg-orange-600 file:border-0 file:rounded-md file:text-white file:px-2 file:mr-4 hover:file:bg-orange-500 cursor-pointer"
                                accept=".pdf,.docx,.txt,.png,.jpg,.jpeg"
                            />
                            <p className="text-xs text-gray-500">Supported: PDF, DOCX, TXT, Images (OCR)</p>
                        </div>
                        <Button type="submit" disabled={!file || uploading} className="bg-gradient-orange text-white">
                            {uploading ? <Loader2 className="animate-spin" /> : 'Upload & Process'}
                        </Button>
                    </form>
                </CardContent>
            </Card>

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
