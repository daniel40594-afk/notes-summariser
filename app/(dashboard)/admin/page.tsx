'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Loader2, CheckCircle, XCircle, Clock, Search, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/Input';

interface User {
    id: number;
    email: string;
    role: string;
    status: string;
    created_at: string;
}

export default function AdminDashboard() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<number | null>(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/admin/users');
            const data = await res.json();
            if (res.ok) {
                setUsers(data.users);
            }
        } catch (error) {
            console.error('Failed to fetch users', error);
        } finally {
            setLoading(false);
        }
    };

    const updateUserStatus = async (userId: number, status: string) => {
        setActionLoading(userId);
        try {
            const res = await fetch(`/api/admin/users/${userId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });

            if (res.ok) {
                setUsers(users.map(u => u.id === userId ? { ...u, status } : u));
            }
        } catch (error) {
            console.error('Failed to update user', error);
        } finally {
            setActionLoading(null);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20"><CheckCircle className="w-3 h-3 mr-1" /> Approved</span>;
            case 'rejected':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20"><XCircle className="w-3 h-3 mr-1" /> Rejected</span>;
            default:
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"><Clock className="w-3 h-3 mr-1" /> Pending</span>;
        }
    };

    return (
        <div className="space-y-8 animate-fade-in-up">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">User Management</h1>
                    <p className="text-gray-400 mt-1">Manage user access and approvals.</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={fetchUsers} variant="outline" size="sm" className="border-white/10 text-gray-300 hover:text-white hover:bg-white/5">
                        Refresh List
                    </Button>
                    <Button className="bg-gradient-orange hover:opacity-90">
                        Export Users
                    </Button>
                </div>
            </div>

            <Card className="border-white/10 shadow-lg glow-orange overflow-hidden">
                <CardHeader className="border-b border-white/5 bg-white/5 flex flex-row items-center justify-between">
                    <CardTitle className="text-white">All Users</CardTitle>
                    <div className="relative w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                        <Input placeholder="Search users..." className="pl-8 h-9 bg-black/20 border-white/10 text-sm text-white focus:border-orange-500/50" />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex justify-center p-12">
                            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-400 uppercase bg-black/40">
                                    <tr>
                                        <th className="px-6 py-4 font-medium">ID</th>
                                        <th className="px-6 py-4 font-medium">User</th>
                                        <th className="px-6 py-4 font-medium">Role</th>
                                        <th className="px-6 py-4 font-medium">Status</th>
                                        <th className="px-6 py-4 font-medium">Joined</th>
                                        <th className="px-6 py-4 font-medium text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {users.map((user) => (
                                        <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                                            <td className="px-6 py-4 text-gray-500">#{user.id}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-xs text-white border border-white/10">
                                                        {user.email.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="text-white font-medium">{user.email}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={cn(
                                                    "px-2 py-1 rounded text-xs font-medium border",
                                                    user.role === 'admin'
                                                        ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                                                        : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                                )}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">{getStatusBadge(user.status)}</td>
                                            <td className="px-6 py-4 text-gray-500">{new Date(user.created_at).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                                    {user.role !== 'admin' && (
                                                        <>
                                                            {user.status !== 'approved' && (
                                                                <Button
                                                                    size="sm"
                                                                    className="h-7 px-2 bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20"
                                                                    disabled={actionLoading === user.id}
                                                                    onClick={() => updateUserStatus(user.id, 'approved')}
                                                                >
                                                                    Approve
                                                                </Button>
                                                            )}
                                                            {user.status !== 'rejected' && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    className="h-7 px-2 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                                                    disabled={actionLoading === user.id}
                                                                    onClick={() => updateUserStatus(user.id, 'rejected')}
                                                                >
                                                                    Reject
                                                                </Button>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {users.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                                <div className="flex flex-col items-center gap-2">
                                                    <Search className="w-8 h-8 opacity-20" />
                                                    <p>No users found matching your criteria.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

