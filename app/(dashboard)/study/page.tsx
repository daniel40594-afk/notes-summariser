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
    const [result, setResult] = useState<{ summary: string; studyNotes: string; source?: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url) return;

        setLoading(true);
        setError('');
        setResult(null);

        try {
            const res = await fetch('/api/study', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to generate study notes');
            }

            setResult(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = () => {
        if (!result) return;

        const content = `VIDEO SUMMARY\n\n${result.summary}\n\n-------------------\n\nSTUDY NOTES\n\n${result.studyNotes}`;
        const blob = new Blob([content], { type: 'text/plain' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'study-notes.txt';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
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
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="mr-2 h-5 w-5" />
                                    Generate Notes
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

            {result && (
                <div className="space-y-6">
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={handleDownload} className="gap-2">
                            <Download className="h-4 w-4" />
                            Download Notes (.txt)
                        </Button>
                    </div>

                    {result.source === 'metadata' && (
                        <div className="p-4 bg-yellow-50 text-yellow-800 rounded-md flex items-start gap-2 border border-yellow-200">
                            <Info className="h-5 w-5 mt-0.5 shrink-0" />
                            <div>
                                <p className="font-semibold">Transcript Unavailable</p>
                                <p className="text-sm">We couldn't access the captions for this video. These notes were generated based on the video title and description, so they might be less detailed.</p>
                            </div>
                        </div>
                    )}

                    <Card className="border-indigo-200">
                        <CardHeader className="bg-indigo-50 border-b border-indigo-100">
                            <CardTitle className="text-indigo-900 flex items-center gap-2">
                                <BookOpen className="h-5 w-5" />
                                Video Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="prose prose-indigo max-w-none pt-6 text-gray-700">
                            <ReactMarkdown>{result.summary}</ReactMarkdown>
                        </CardContent>
                    </Card>

                    <Card className="border-green-200">
                        <CardHeader className="bg-green-50 border-b border-green-100">
                            <CardTitle className="text-green-900 flex items-center gap-2">
                                <Sparkles className="h-5 w-5" />
                                Key Study Notes
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="prose prose-green max-w-none pt-6 text-gray-700">
                            <ReactMarkdown>{result.studyNotes}</ReactMarkdown>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
