"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/apiClient";
import { supabase } from "@/lib/supabaseClient";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/shared/components/shadcn/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/shared/components/shadcn/table";
import { Button } from "@/shared/components/shadcn/button";
import { Input } from "@/shared/components/shadcn/input";
import { Badge } from "@/shared/components/shadcn/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/shadcn/tabs";

import {
    ShieldAlert,
    CheckCircle2,
    Flag,
    Search,
    Filter,
    MoreHorizontal,
    EyeOff,
    Eye,
    Trash2
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/shared/components/shadcn/dropdown-menu";
import { useAuth } from "@/shared/context/AuthContext";

type AdminStats = {
    total_reports: number;
    flagged_reports: number;
    pending_verifications: number;
    active_reports: number;
};

type AdminReport = {
    report_id: number;
    title: string;
    category: string;
    status: string;
    moderation_status: string;
    created_at: string;
    flag_count: number;
    user?: {
        name: string;
        avatar: string;
    };
};

export default function AdminDashboard() {
    const router = useRouter();
    const { isAuthenticated, session, authChecked } = useAuth();
    const [stats, setStats] = useState<AdminStats>({
        total_reports: 0,
        flagged_reports: 0,
        pending_verifications: 0,
        active_reports: 0,
    });
    const [reports, setReports] = useState<AdminReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");

    useEffect(() => {
        const checkAdmin = () => {
            const token = localStorage.getItem('admin_token');
            if (!token) {
                router.push("/");
                return;
            }
        };

        checkAdmin();
    }, [router]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('admin_token');
            const headers = { Authorization: `Bearer ${token}` };

            const statsRes = await api.get<AdminStats>("/report/admin/stats", { headers });
            setStats(statsRes.data);

            const listRes = await api.get<{ reports: AdminReport[] }>("/report/admin/list", { headers });
            setReports(listRes.data.reports);
        } catch (error) {
            console.error("Failed to fetch admin data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleModeration = async (reportId: number, status: string) => {
        try {
            const token = localStorage.getItem('admin_token');
            const headers = { Authorization: `Bearer ${token}` };
            await api.patch(`/report/${reportId}/moderation`, { report_id: reportId, status }, { headers });
            // Update local state
            setReports((prev) =>
                prev.map((r) =>
                    r.report_id === reportId ? { ...r, moderation_status: status } : r
                )
            );
            // Refresh stats
            const statsRes = await api.get<AdminStats>("/report/admin/stats", { headers });
            setStats(statsRes.data);
        } catch (error) {
            console.error("Failed to update moderation status", error);
        }
    };

    const filteredReports = reports.filter((report) => {
        if (filter === "flagged") return report.flag_count > 0;
        if (filter === "hidden") return report.moderation_status === "hidden";
        if (filter === "spam") return report.moderation_status === "spam";
        return true;
    });

    return (
        <div className="min-h-screen bg-gray-50/50 p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Admin Dashboard</h1>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => router.push("/dashboard")}>
                            Back to App
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                className="h-4 w-4 text-muted-foreground"
                            >
                                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_reports}</div>
                            <p className="text-xs text-muted-foreground">
                                reported issues
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Flagged Content</CardTitle>
                            <Flag className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{stats.flagged_reports}</div>
                            <p className="text-xs text-muted-foreground">
                                Requires attention
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Verification</CardTitle>
                            <CheckCircle2 className="h-4 w-4 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-amber-600">{stats.pending_verifications}</div>
                            <p className="text-xs text-muted-foreground">
                                Awaiting community confirmation
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Reports</CardTitle>
                            <ShieldAlert className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{stats.active_reports}</div>
                            <p className="text-xs text-muted-foreground">
                                Currently visible to public
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content */}
                <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                        <Tabs defaultValue="all" className="space-y-4" onValueChange={setFilter}>
                            <div className="flex items-center justify-between">
                                <TabsList>
                                    <TabsTrigger value="all">All Reports</TabsTrigger>
                                    <TabsTrigger value="flagged" className="text-red-600 data-[state=active]:text-red-700">Flagged</TabsTrigger>
                                    <TabsTrigger value="hidden">Hidden</TabsTrigger>
                                </TabsList>
                                <div className="flex items-center gap-2">
                                    <div className="relative">
                                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            type="search"
                                            placeholder="Search..."
                                            className="pl-8 w-[150px] lg:w-[250px]"
                                        />
                                    </div>
                                </div>
                            </div>

                            <TabsContent value="all" className="space-y-4">
                                <ReportTable reports={filteredReports} onModeration={handleModeration} />
                            </TabsContent>
                            <TabsContent value="flagged" className="space-y-4">
                                <ReportTable reports={filteredReports} onModeration={handleModeration} />
                            </TabsContent>
                            <TabsContent value="hidden" className="space-y-4">
                                <ReportTable reports={filteredReports} onModeration={handleModeration} />
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Sidebar / Queue - Simplified for now as part of main view */}
                </div>

            </div>
        </div>
    );
}

function ReportTable({ reports, onModeration }: { reports: AdminReport[], onModeration: (id: number, status: string) => void }) {
    if (reports.length === 0) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                    <p className="text-muted-foreground">No reports found matching this filter.</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Reports</CardTitle>
                <CardDescription>
                    Manage and moderate submitted reports.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px]">ID</TableHead>
                            <TableHead>Details</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Moderation</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {reports.map((report) => (
                            <TableRow key={report.report_id}>
                                <TableCell className="font-medium">#{report.report_id}</TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-gray-900">{report.title}</span>
                                        <span className="text-xs text-muted-foreground">{report.category} • {new Date(report.created_at).toLocaleDateString()}</span>
                                        <span className="text-xs text-gray-500 truncate max-w-[200px]">{report.user?.name || "Anonymous"}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={
                                        report.status === 'open' ? 'default' :
                                            report.status === 'resolved' || report.status === 'closed' ? 'secondary' :
                                                'outline'
                                    }>
                                        {report.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {report.flag_count > 0 ? (
                                        <Badge variant="destructive" className="gap-1">
                                            <Flag size={10} /> {report.flag_count} Flags
                                        </Badge>
                                    ) : (
                                        <span className="text-xs text-muted-foreground">Clean</span>
                                    )}
                                    {report.moderation_status !== 'active' && (
                                        <Badge variant="outline" className="ml-2 border-red-200 text-red-500">
                                            {report.moderation_status}
                                        </Badge>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <span className="sr-only">Open menu</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuItem onClick={() => window.open(`/reports/${report.report_id}`, '_blank')}>
                                                View Report
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => onModeration(report.report_id, 'active')}>
                                                <CheckCircle2 className="mr-2 h-4 w-4" /> Mark Active
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => onModeration(report.report_id, 'hidden')}>
                                                <EyeOff className="mr-2 h-4 w-4" /> Hide Report
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => onModeration(report.report_id, 'spam')} className="text-red-600">
                                                <Trash2 className="mr-2 h-4 w-4" /> Mark as Spam
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
