'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Loader2, BookOpen, AlertCircle, Sparkles, Download, Info } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function StudyToolPage() {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [streamedContent, setStreamedContent] = useState('');
    const [source, setSource] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url) return;

        setLoading(true);
        setError('');
        setStreamedContent('');
        setSource(null);

        try {
            const res = await fetch('/api/study', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url }),
            });

            if (!res.ok) {
                // Try to parse error message if possible
                try {
                    const data = await res.json();
                    throw new Error(data.error || 'Failed to generate study notes');
                } catch (e) {
                    throw new Error(`Failed to generate study notes (${res.statusText})`);
                }
            }

            // Check for source header
            const sourceHeader = res.headers.get('X-Study-Source');
            if (sourceHeader) {
                setSource(sourceHeader);
            }

            if (!res.body) throw new Error('No response body');

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let done = false;

            while (!done) {
                const { value, done: doneReading } = await reader.read();
                done = doneReading;
                const chunkValue = decoder.decode(value, { stream: !done });
                setStreamedContent((prev) => prev + chunkValue);
            }

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = () => {
        if (!streamedContent) return;

        const blob = new Blob([streamedContent], { type: 'text/plain' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'study-notes.md';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
                    AI Study Tool
                </h1>
                <p className="text-xl text-gray-500 max-w-2xl mx-auto">
                    Paste a YouTube video link below for an AI-generated summary and study notes.
                </p>
            </div>

            <Card className="border-indigo-100 shadow-md">
                <CardContent className="pt-6">
                    <form onSubmit={handleSubmit} className="flex gap-4 items-end">
                        <div className="flex-1">
                            <Input
                                placeholder="https://www.youtube.com/watch?v=..."
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                disabled={loading}
                                className="h-12 text-lg"
                            />
                        </div>
                        <Button
                            type="submit"
                            size="lg"
                            className="h-12 px-8 bg-indigo-600 hover:bg-indigo-700"
                            disabled={loading || !url}
                        >
                            {loading && !streamedContent ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Starting...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="mr-2 h-5 w-5" />
                                    {loading ? 'Generating...' : 'Generate Notes'}
                                </>
                            )}
                        </Button>
                    </form>
                    {error && (
                        <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md flex items-center gap-2">
                            <AlertCircle className="h-5 w-5" />
                            <span>{error}</span>
                        </div>
                    )}
                </CardContent>
            </Card>

            {streamedContent && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        {source === 'metadata' && (
                            <div className="px-4 py-2 bg-yellow-50 text-yellow-800 rounded-md flex items-center gap-2 border border-yellow-200 text-sm">
                                <Info className="h-4 w-4 shrink-0" />
                                <span>Transcript unavailable. Notes generated from video metadata.</span>
                            </div>
                        )}
                        {!source && <div></div>} {/* Spacer */}

                        <Button variant="outline" onClick={handleDownload} className="gap-2">
                            <Download className="h-4 w-4" />
                            Download (.md)
                        </Button>
                    </div>

                    <Card className="border-indigo-200 shadow-sm">
                        <CardHeader className="bg-indigo-50 border-b border-indigo-100">
                            <CardTitle className="text-indigo-900 flex items-center gap-2">
                                <BookOpen className="h-5 w-5" />
                                Study Notes
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="prose prose-indigo max-w-none pt-6 text-gray-800">
                            <ReactMarkdown>{streamedContent}</ReactMarkdown>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
