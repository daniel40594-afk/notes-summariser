'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Plus, Folder, Loader2, ArrowRight, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function WorkspacesPage() {
    const [workspaces, setWorkspaces] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [newName, setNewName] = useState('');
    const [creating, setCreating] = useState(false);
    const router = useRouter();

    const fetchWorkspaces = async () => {
        try {
            const res = await fetch('/api/workspaces');
            const data = await res.json();
            if (data.workspaces) {
                setWorkspaces(data.workspaces);
            }
        } catch (e) {
            console.error('Failed to load workspaces');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWorkspaces();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName.trim()) return;

        setCreating(true);
        try {
            const res = await fetch('/api/workspaces', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newName })
            });

            if (res.ok) {
                setNewName('');
                fetchWorkspaces();
            }
        } catch (e) {
            alert('Failed to create workspace');
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.preventDefault(); // Prevent link click
        if (!confirm('Delete workspace? All documents inside will be deleted.')) return;

        try {
            const res = await fetch(`/api/workspaces/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchWorkspaces();
            }
        } catch (e) {
            alert('Failed to delete');
        }
    };

    return (
        <div className="space-y-8 animate-fade-in-up pb-20">
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Workspaces</h1>
                <p className="text-gray-400 mt-1">Organize your documents into project workspaces.</p>
            </div>

            {/* Create New */}
            <Card className="border-white/10 bg-white/5">
                <CardContent className="p-6">
                    <form onSubmit={handleCreate} className="flex gap-4 items-end">
                        <div className="flex-1 space-y-2">
                            <label className="text-sm font-medium text-gray-300">New Workspace Name</label>
                            <Input
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder="e.g. Cybersecurity, Project Alpha..."
                                className="bg-black/20 text-white border-white/10"
                            />
                        </div>
                        <Button type="submit" disabled={!newName.trim() || creating} className="bg-gradient-orange text-white">
                            {creating ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                            Create Workspace
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {workspaces.map((ws) => (
                    <Link key={ws.id} href={`/workspaces/${ws.id}`}>
                        <Card className="border-white/10 hover:border-orange-500/50 transition-all duration-300 group cursor-pointer h-full bg-black/40 hover:bg-white/5">
                            <CardContent className="p-6 flex flex-col justify-between h-full space-y-4">
                                <div className="flex items-start justify-between">
                                    <div className="p-3 bg-orange-500/10 rounded-xl group-hover:bg-orange-500/20 transition-colors">
                                        <Folder className="w-6 h-6 text-orange-500" />
                                    </div>
                                    <button
                                        onClick={(e) => handleDelete(ws.id, e)}
                                        className="text-gray-500 hover:text-red-400 p-2 hover:bg-white/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                <div>
                                    <h3 className="text-lg font-bold text-white group-hover:text-orange-400 transition-colors">{ws.name}</h3>
                                    <p className="text-sm text-gray-500">Created {new Date(ws.created_at).toLocaleDateString()}</p>
                                </div>

                                <div className="flex items-center text-sm text-gray-400 group-hover:text-white transition-colors">
                                    Open Workspace <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            {!loading && workspaces.length === 0 && (
                <div className="text-center text-gray-500 py-20">
                    No workspaces yet. Create one to get started.
                </div>
            )}
        </div>
    );
}
