'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Send, Bot, User, Loader2, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

function ChatContent() {
    const searchParams = useSearchParams();
    const initialQuery = searchParams.get('initialQuery');
    const initialDeepSearch = searchParams.get('deepSearch') === 'true';

    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: 'Hello! I am your document assistant. Upload documents in the Manager and ask me anything about them.' }
    ]);
    const [loading, setLoading] = useState(false);
    const [deepSearch, setDeepSearch] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const hasRunInitialQuery = useRef(false);

    useEffect(() => {
        if (initialDeepSearch) setDeepSearch(true);
        if (initialQuery && !hasRunInitialQuery.current) {
            hasRunInitialQuery.current = true;
            handleInitialSubmit(initialQuery);
        }
    }, [initialQuery, initialDeepSearch]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleInitialSubmit = async (query: string) => {
        setMessages(prev => [...prev, { role: 'user', content: query }]);
        await fetchResponse(query, true); // Force deep search if from sidebar
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMsg = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        await fetchResponse(userMsg, deepSearch);
    };

    const fetchResponse = async (question: string, isDeepSearch: boolean) => {
        setLoading(true);
        try {
            const res = await fetch('/api/chat/rag', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question, sessionId: 'default', deepSearch: isDeepSearch })
            });

            if (!res.ok) throw new Error('Failed to fetch');
            if (!res.body) throw new Error('No body');

            setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let done = false;
            let currentResponse = '';

            while (!done) {
                const { value, done: DONE } = await reader.read();
                done = DONE;
                const chunkValue = decoder.decode(value, { stream: true });
                currentResponse += chunkValue;

                setMessages(prev => {
                    const newMsgs = [...prev];
                    newMsgs[newMsgs.length - 1] = { ...newMsgs[newMsgs.length - 1], content: currentResponse };
                    return newMsgs;
                });
            }
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4 animate-fade-in-up">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Document Chat</h1>
                    <p className="text-gray-400 mt-1">Chat with your uploaded knowledge base.</p>
                </div>
                <button
                    type="button"
                    onClick={() => setDeepSearch(!deepSearch)}
                    className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all border",
                        deepSearch
                            ? "bg-orange-500/20 border-orange-500/50 text-orange-400 shadow-lg shadow-orange-500/20"
                            : "bg-white/5 border-white/10 text-gray-500 hover:text-gray-300"
                    )}
                >
                    <Globe className="w-4 h-4" />
                    Deep Search {deepSearch ? 'On' : 'Off'}
                </button>
            </div>

            <Card className="flex-1 border-white/10 bg-black/40 backdrop-blur-sm shadow-xl flex flex-col overflow-hidden relative">
                {/* Chat Area */}
                <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-4 space-y-6"
                >
                    {messages.map((msg, i) => (
                        <div key={i} className={cn("flex gap-4", msg.role === 'user' ? "flex-row-reverse" : "flex-row")}>
                            <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                                msg.role === 'user' ? "bg-orange-500" : "bg-zinc-700"
                            )}>
                                {msg.role === 'user' ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-orange-400" />}
                            </div>
                            <div className={cn(
                                "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                                msg.role === 'user'
                                    ? "bg-gradient-orange text-white rounded-br-none"
                                    : "bg-white/10 text-gray-200 rounded-bl-none border border-white/5"
                            )}>
                                <div className="whitespace-pre-wrap">{msg.content}</div>
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center shrink-0">
                                <Bot className="w-5 h-5 text-orange-400" />
                            </div>
                            <div className="bg-white/10 text-gray-200 rounded-2xl rounded-bl-none px-4 py-3 border border-white/5 flex items-center">
                                <Loader2 className="w-4 h-4 animate-spin mr-2" /> Thinking...
                            </div>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-white/10 bg-black/20">
                    <form onSubmit={handleSubmit} className="flex gap-2 relative">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={deepSearch ? "Ask the web..." : "Ask a question about your documents..."}
                            className={cn(
                                "bg-black/40 border-white/10 text-white placeholder:text-gray-500 focus:border-orange-500 pr-12 py-6 rounded-xl",
                                deepSearch && "border-orange-500/30 focus:border-orange-500"
                            )}
                            disabled={loading}
                        />
                        <Button
                            type="submit"
                            disabled={!input.trim() || loading}
                            className="absolute right-1 top-1 h-[calc(100%-8px)] w-12 bg-orange-600 hover:bg-orange-500 text-white rounded-lg p-0 flex items-center justify-center"
                        >
                            <Send className="w-4 h-4" />
                        </Button>
                    </form>
                </div>
            </Card>
        </div>
    );
}

export default function ChatPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-full"><Loader2 className="animate-spin w-8 h-8 text-orange-500" /></div>}>
            <ChatContent />
        </Suspense>
    );
}
