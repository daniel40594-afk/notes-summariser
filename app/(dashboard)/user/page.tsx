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
                <Card className="col-span-4 lg:col-span-5 relative overflow-hidden">
                    <CardHeader>
                        <CardTitle className="text-white">Revenue Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[300px] w-full flex items-end justify-between gap-2 px-4 pb-4">
                            {/* Fake Graph Bars */}
                            {[40, 60, 45, 70, 50, 80, 65, 85, 90, 75, 60, 95].map((h, i) => (
                                <div key={i} className="w-full bg-white/5 rounded-t-sm hover:bg-orange-500/20 transition-all relative group h-full flex flex-col justify-end">
                                    <div
                                        style={{ height: `${h}%` }}
                                        className="w-full bg-gradient-to-t from-orange-500/10 to-orange-500 rounded-t-sm group-hover:from-orange-500/30 group-hover:to-orange-400 transition-all"
                                    ></div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card className="col-span-3 lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-white">Recent Sales</CardTitle>
                        <p className="text-sm text-gray-400">You made 265 sales this month.</p>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {[
                                { name: 'Olivia Martin', email: 'olivia.martin@email.com', amount: '+$1,999.00', initial: 'OM' },
                                { name: 'Jackson Lee', email: 'jackson.lee@email.com', amount: '+$39.00', initial: 'JL' },
                                { name: 'Isabella Nguyen', email: 'isabella.nguyen@email.com', amount: '+$299.00', initial: 'IN' },
                                { name: 'William Kim', email: 'will@email.com', amount: '+$99.00', initial: 'WK' },
                                { name: 'Sofia Davis', email: 'sofia.davis@email.com', amount: '+$39.00', initial: 'SD' },
                            ].map((user, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center text-sm font-medium text-orange-500">
                                            {user.initial}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-white leading-none">{user.name}</p>
                                            <p className="text-xs text-gray-500 mt-1">{user.email}</p>
                                        </div>
                                    </div>
                                    <div className="text-sm font-medium text-white">{user.amount}</div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Bottom Section: Analytics Line Graph */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-orange-500" />
                        Growth Analytics
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[200px] w-full bg-white/5 rounded-lg flex items-center justify-center text-gray-500 relative overflow-hidden">
                        {/* Simulated Line Graph Curve */}
                        <svg viewBox="0 0 1000 200" className="w-full h-full absolute bottom-0 left-0" preserveAspectRatio="none">
                            <defs>
                                <linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1">
                                    <stop offset="0%" stopColor="#ff6a00" stopOpacity="0.4" />
                                    <stop offset="100%" stopColor="#ff6a00" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                            <path d="M0,150 C150,150 200,100 350,100 C500,100 550,50 700,50 C850,50 900,120 1000,80 V200 H0 Z" fill="url(#gradient)" />
                            <path d="M0,150 C150,150 200,100 350,100 C500,100 550,50 700,50 C850,50 900,120 1000,80" stroke="#ff6a00" strokeWidth="3" fill="none" />
                        </svg>
                        <span className="relative z-10 text-sm opacity-0">Interactive Graph Component Placeholder</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
