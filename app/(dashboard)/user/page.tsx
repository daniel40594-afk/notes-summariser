'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Activity, Users, CreditCard, DollarSign, TrendingUp, Filter, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function UserDashboard() {
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeUsers: 0,
        recentSignups: [] as any[]
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/dashboard/stats');
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                }
            } catch (error) {
                console.error('Failed to fetch stats', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    return (
        <div className="space-y-8 animate-fade-in-up pb-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard</h1>
                    <p className="text-gray-400 mt-1">Overview of system activity.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="border-white/10 text-gray-300 hover:text-white hover:bg-white/5">
                        <Filter className="w-4 h-4 mr-2" /> Filter
                    </Button>
                    <Button className="bg-gradient-orange hover:opacity-90">
                        Download Report
                    </Button>
                </div>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { title: 'Total Revenue', value: '$0.00', change: 'No payment data', icon: DollarSign },
                    { title: 'Total Users', value: loading ? '...' : stats.totalUsers, change: 'Registered Accounts', icon: Users },
                    { title: 'Active Users', value: loading ? '...' : stats.activeUsers, change: 'Approved Accounts', icon: Activity },
                    { title: 'New Signups', value: loading ? '...' : (stats.recentSignups.length > 0 ? `+${stats.recentSignups.length}` : '0'), change: 'Recent Activity', icon: UserPlus },
                ].map((metric, i) => (
                    <Card key={i} className="hover:border-orange-500/30 transition-colors group border-white/10 shadow-lg glow-orange">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-400 group-hover:text-white transition-colors">
                                {metric.title}
                            </CardTitle>
                            <metric.icon className="h-4 w-4 text-orange-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{metric.value}</div>
                            <p className="text-xs text-gray-500 mt-1">{metric.change}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Middle Section: Graphs & Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">

                {/* Main Graph */}
                <Card className="col-span-4 lg:col-span-5 relative overflow-hidden border-white/10 shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-white">User Growth Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[300px] w-full flex items-center justify-center bg-white/5 rounded-lg border border-white/5">
                            <p className="text-gray-500 text-sm">No historical data available yet</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card className="col-span-3 lg:col-span-2 border-white/10 shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-white">Recent Signups</CardTitle>
                        <p className="text-sm text-gray-400">Latest users joined.</p>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {loading ? (
                                <p className="text-gray-500 text-sm">Loading...</p>
                            ) : stats.recentSignups.length === 0 ? (
                                <p className="text-gray-500 text-sm">No recent signups.</p>
                            ) : (
                                stats.recentSignups.map((user, i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-full bg-orange-500/10 flex items-center justify-center text-sm font-medium text-orange-500 border border-orange-500/20">
                                                {user.email.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-white leading-none truncate max-w-[150px]" title={user.email}>{user.email}</p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {new Date(user.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-xs font-medium text-orange-400 bg-orange-400/10 px-2 py-1 rounded-full border border-orange-400/20">
                                            {user.status}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Bottom Section: Analytics Line Graph */}
            <Card className="border-white/10 shadow-lg">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-orange-500" />
                        Growth Analytics
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[200px] w-full bg-white/5 rounded-lg flex items-center justify-center text-gray-500 relative overflow-hidden border border-white/5">
                        <p className="text-sm">Data collection in progress...</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
