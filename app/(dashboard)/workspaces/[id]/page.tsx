'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FileText, Trash2, Upload, Loader2, File, FileImage, Send, Bot, User, MessageSquare, Globe } from 'lucide-react';

export default function WorkspaceDetailPage() {
    const params = useParams();
    const workspaceId = params.id as string;

    // State for Documents
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [documents, setDocuments] = useState<any[]>([]);
    const [loadingDocs, setLoadingDocs] = useState(true);

    // State for Chat
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState('');
    const [loadingChat, setLoadingChat] = useState(false);
    const [deepSearch, setDeepSearch] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Active Tab
    const [activeTab, setActiveTab] = useState<'documents' | 'chat'>('documents');

    // Fetch Documents
    const fetchDocuments = async () => {
        try {
            const res = await fetch(`/api/documents?workspaceId=${workspaceId}`);
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
        if (workspaceId) fetchDocuments();
    }, [workspaceId]);

    // Handle Upload
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
        formData.append('workspaceId', workspaceId);

        try {
            const res = await fetch('/api/documents/upload', {
                method: 'POST',
                body: formData
            });

            if (res.ok) {
                setFile(null);
                fetchDocuments();
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
            } else {
                const data = await res.json();
                alert(`Delete failed: ${data.error || 'Server error'}`);
            }
        } catch (e) { alert('Delete failed: Network error'); }
    };

    // Chat Logic
    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || loadingChat) return;

        const userMsg = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoadingChat(true);

        try {
            const res = await fetch('/api/chat/rag', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question: userMsg.content, workspaceId, deepSearch })
            });

            if (!res.ok) throw new Error('Failed');
            if (!res.body) throw new Error('No stream');

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let assistantMsg = { role: 'assistant', content: '' };
            setMessages(prev => [...prev, assistantMsg]);

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value);
                assistantMsg.content += chunk;
                setMessages(prev => {
                    const newMsgs = [...prev];
                    newMsgs[newMsgs.length - 1] = { ...assistantMsg };
                    return newMsgs;
                });
            }
        } catch (e) {
            setMessages(prev => [...prev, { role: 'assistant', content: 'Error: Failed to get response.' }]);
        } finally {
            setLoadingChat(false);
        }
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const getIcon = (type: string) => {
        if (type.includes('pdf')) return <FileText className="text-red-400" />;
        if (type.includes('word')) return <FileText className="text-blue-400" />;
        if (type.includes('image')) return <FileImage className="text-purple-400" />;
        return <File className="text-gray-400" />;
    };

    return (
        <div className="space-y-6 animate-fade-in-up pb-20 h-full flex flex-col">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Workspace</h1>
                    <p className="text-gray-400 mt-1">Manage documents and chat with context.</p>
                </div>
                <div className="flex space-x-2 bg-white/5 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab('documents')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'documents' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        Documents
                    </button>
                    <button
                        onClick={() => setActiveTab('chat')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'chat' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        Chat
                    </button>
                </div>
            </div>

            {activeTab === 'documents' ? (
                <div className="space-y-8">
                    {/* Upload Section */}
                    <Card className="border-white/10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-celestial-orange/5 rounded-full blur-3xl -z-0 pointer-events-none"></div>
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <Upload className="w-5 h-5 text-orange-500" />
                                Upload to Workspace
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
                                    <p className="text-xs text-gray-500">Supported: PDF, DOCX, TXT, Images (OCR). Max size: 4.5MB.</p>
                                </div>
                                <Button type="submit" disabled={!file || uploading} className="bg-gradient-orange text-white">
                                    {uploading ? <Loader2 className="animate-spin" /> : 'Upload & Process'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Documents List */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-white">Workspace Documents</h2>
                        {loadingDocs ? (
                            <div className="text-center text-gray-500 py-10">Loading documents...</div>
                        ) : documents.length === 0 ? (
                            <div className="text-center text-gray-500 py-10 border border-dashed border-white/10 rounded-xl">
                                No documents in this workspace. Upload one to get started.
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
            ) : (
                <div className="flex-1 flex flex-col h-[calc(100vh-200px)] min-h-[500px]">
                    <Card className="flex-1 border-white/10 bg-black/40 backdrop-blur-md flex flex-col overflow-hidden">
                        <CardContent className="flex-1 flex flex-col p-0 h-full">
                            {/* Messages Area */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-orange-500/30">
                                {messages.length === 0 && (
                                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500/20 to-purple-500/20 flex items-center justify-center">
                                            <Bot className="w-8 h-8 text-orange-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-medium text-white">Ask anything about your workspace docs</h3>
                                            <p className="text-gray-400 max-w-sm mt-2">
                                                I can analyze and reference all documents uploaded to this workspace.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {messages.map((msg, idx) => (
                                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[80%] rounded-2xl p-4 ${msg.role === 'user'
                                            ? 'bg-gradient-orange text-white rounded-br-none'
                                            : 'bg-white/10 text-gray-200 rounded-bl-none border border-white/5'
                                            }`}>
                                            <div className="flex items-center gap-2 mb-1 opacity-70 text-xs uppercase tracking-wider font-bold">
                                                {msg.role === 'user' ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                                                {msg.role === 'user' ? 'You' : 'Celestial AI'}
                                            </div>
                                            <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area */}
                            <div className="p-4 border-t border-white/10 bg-black/20 space-y-3">
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setDeepSearch(!deepSearch)}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${deepSearch
                                            ? 'bg-orange-500/20 border-orange-500/50 text-orange-400'
                                            : 'bg-white/5 border-white/10 text-gray-500 hover:text-gray-300'
                                            }`}
                                    >
                                        <Globe className="w-3 h-3" />
                                        Deep Search {deepSearch ? 'On' : 'Off'}
                                    </button>
                                </div>
                                <form onSubmit={handleSend} className="relative flex items-center gap-2">
                                    <Input
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder="Ask a question..."
                                        className="bg-zinc-900/50 border-white/10 text-white pr-12 h-12 rounded-xl focus:ring-orange-500/50"
                                        disabled={loadingChat}
                                    />
                                    <Button
                                        type="submit"
                                        disabled={!input.trim() || loadingChat}
                                        className="absolute right-1 top-1 bottom-1 bg-gradient-orange text-white rounded-lg w-10 h-10 p-0 flex items-center justify-center"
                                    >
                                        {loadingChat ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                    </Button>
                                </form>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
