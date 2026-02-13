"use client";
import React, { useEffect, useState } from "react";
import NavBarPublic from "@/shared/components/NavBarPublic";
import NavBarPrivate from "@/shared/components/NavBarPrivate";
import SignInPromptModal from "@/shared/components/SignInPromptModal";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/apiClient";

import {
    Bell, CheckCircle2, Circle, User, MessageSquare, ArrowLeft, Lock, Check, ImageOff, Zap, Droplets, Trees, ShieldAlert, HardHat, SendHorizontal, Flag
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/shared/components/shadcn/dialog";
import { Button } from "@/shared/components/shadcn/button";
import { Label } from "@/shared/components/shadcn/label";
import { Textarea } from "@/shared/components/shadcn/textarea";
import { Input } from "@/shared/components/shadcn/input";
import { Report, ReportStatus, ReportDetailResponse, ReportFollower } from "@/types/report";
import { Comment, CommentResponse } from "@/types/comment";
import { usePointsToast } from "@/shared/context/PointsToastContext";
import { useAuth } from "@/shared/context/AuthContext";


function timeAgo(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (seconds < 5) return 'Just now';
    if (seconds < 60) return `${seconds} seconds ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minutes ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    return `${days} days ago`;
}

const statusSteps = [
    { id: ReportStatus.OPEN, label: 'Open' },
    { id: ReportStatus.ACKNOWLEDGED, label: 'Acknowledged' },
    { id: ReportStatus.IN_PROGRESS, label: 'In Progress' },
    { id: ReportStatus.RESOLVED, label: 'Closed' }
];

const getCategoryIcon = (category: string) => {
    const c = category?.toLowerCase() || '';
    if (c.includes('infrastructure') || c.includes('road')) return <HardHat size={56} />;
    if (c.includes('lighting') || c.includes('electricity')) return <Zap size={56} />;
    if (c.includes('sanitation') || c.includes('trash') || c.includes('water')) return <Droplets size={56} />;
    if (c.includes('park') || c.includes('trees')) return <Trees size={56} />;
    if (c.includes('safety') || c.includes('security')) return <ShieldAlert size={56} />;
    return <ImageOff size={56} />;
};

const getCategoryGradient = (category: string) => {
    const c = category?.toLowerCase() || '';
    if (c.includes('infrastructure')) return 'from-slate-100 to-slate-200 text-slate-400';
    if (c.includes('lighting')) return 'from-amber-50 to-amber-100 text-amber-400';
    if (c.includes('sanitation')) return 'from-blue-50 to-blue-100 text-blue-400';
    if (c.includes('park')) return 'from-emerald-50 to-emerald-100 text-emerald-400';
    if (c.includes('safety')) return 'from-red-50 to-red-100 text-red-400';
    return 'from-gray-50 to-gray-100 text-gray-400';
};

export default function ReportDetailPage() {

    const { id } = useParams();
    const router = useRouter();
    const { showPointsToast } = usePointsToast();
    const { isAuthenticated, authChecked } = useAuth();
    const [report, setReport] = useState<Report | null>(null);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followers, setFollowers] = useState<ReportFollower[]>([]);
    const [followersCount, setFollowersCount] = useState(0);
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState("");
    const [postingComment, setPostingComment] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showSignInModal, setShowSignInModal] = useState(false);

    // Verification state
    const [verificationCount, setVerificationCount] = useState(0);
    const [hasVerified, setHasVerified] = useState(false);
    const [closedByUser, setClosedByUser] = useState<{ name: string; avatar: string } | null>(null);
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [showNoAckWarning, setShowNoAckWarning] = useState(false);
    const [pendingAction, setPendingAction] = useState<'in_progress' | 'closed' | null>(null);
    const [showFollowRequired, setShowFollowRequired] = useState(false);

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const response = await api.get<ReportDetailResponse>(`/report/${id}`);
                const { report: apiReport, followers, is_following } = response.data;

                const mappedReport: Report = {
                    id: apiReport.report_id.toString(),
                    title: apiReport.title,
                    description: apiReport.description,
                    category: apiReport.category,
                    status: apiReport.status === 'open' ? ReportStatus.OPEN
                        : apiReport.status === 'acknowledged' ? ReportStatus.ACKNOWLEDGED
                            : apiReport.status === 'in_progress' ? ReportStatus.IN_PROGRESS
                                : ReportStatus.RESOLVED,
                    location: apiReport.location,
                    imageUrl: apiReport.photo_url,
                    created_at: apiReport.created_at,
                    timestamp: timeAgo(apiReport.created_at),
                    user: {
                        name: apiReport.users.name,
                        avatar: apiReport.users.avatar
                    },
                    is_following: is_following,
                    followers_count: followers.length,
                    is_anonymous: apiReport.is_anonymous,
                };

                setReport(mappedReport);
                setFollowers(followers);
                setFollowersCount(followers.length);
                setIsFollowing(is_following);

                // Fetch comments
                const commentsResponse = await api.get<CommentResponse>(`/report/comments/${id}`);
                setComments(commentsResponse.data.comments);

            } catch (error) {
                console.error("Error fetching report:", error);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchReport();
    }, [id]);

    // Fetch verification status
    useEffect(() => {
        const fetchVerificationStatus = async () => {
            if (!id) return;
            try {
                const response = await api.get<{ count: number; has_verified: boolean; closed_by: { name: string; avatar: string } | null }>(`/report/community-verify-status/${id}`);
                setVerificationCount(response.data.count);
                setHasVerified(response.data.has_verified);
                setClosedByUser(response.data.closed_by);
            } catch (error) {
                console.error("Error fetching verification status:", error);
            }
        };
        fetchVerificationStatus();
    }, [id]);

    async function handleMarkInProgress(forceAction = false) {
        if (!isAuthenticated) {
            setShowSignInModal(true);
            return;
        }
        if (!isFollowing) {
            setShowFollowRequired(true);
            return;
        }

        // Check if there are no comments (not acknowledged yet)
        if (!forceAction && comments.length === 0) {
            setPendingAction('in_progress');
            setShowNoAckWarning(true);
            return;
        }

        setUpdatingStatus(true);
        try {
            await api.post(`/report/in-progress`, { report_id: id });
            setReport(prev => prev ? { ...prev, status: ReportStatus.IN_PROGRESS } : prev);
            showPointsToast(5, "Marked report in progress");
        } catch (error) {
            console.error("Error marking in progress:", error);
        } finally {
            setUpdatingStatus(false);
        }
    }

    async function handleMarkClosed(forceClose = false) {
        if (!isAuthenticated) {
            setShowSignInModal(true);
            return;
        }
        if (!isFollowing) {
            setShowFollowRequired(true);
            return;
        }

        // Check if there are no comments (not acknowledged yet)
        if (!forceClose && comments.length === 0) {
            setPendingAction('closed');
            setShowNoAckWarning(true);
            return;
        }

        setUpdatingStatus(true);
        try {
            await api.post(`/report/close`, { report_id: id });
            // Refresh verification status to show closed_by
            const response = await api.get<{ count: number; has_verified: boolean; closed_by: { name: string; avatar: string } | null }>(`/report/community-verify-status/${id}`);
            setClosedByUser(response.data.closed_by);
            showPointsToast(5, "Marked report as closed");
        } catch (error) {
            console.error("Error marking closed:", error);
        } finally {
            setUpdatingStatus(false);
        }
    }

    async function handleCommunityVerify() {
        if (!isAuthenticated) {
            setShowSignInModal(true);
            return;
        }

        if (!isFollowing) {
            setShowFollowRequired(true);
            return;
        }

        if (hasVerified) return;

        setUpdatingStatus(true);
        try {
            const response = await api.post<{ count: number; status?: string }>(`/report/community-verify`, { report_id: id });
            setVerificationCount(response.data.count);
            setHasVerified(true);
            showPointsToast(5, "Verified closed report");

            if (response.data.status === 'closed') {
                setReport(prev => prev ? { ...prev, status: ReportStatus.RESOLVED } : prev);
            }
        } catch (error) {
            console.error("Error verifying:", error);
        } finally {
            setUpdatingStatus(false);
        }
    }

    async function handleFollow() {
        if (!isAuthenticated) {
            setShowSignInModal(true);
            return;
        }
        if (!isFollowing) {
            await api.post(`/report/follow`, { report_id: report?.id });
            setIsFollowing(true);
            setFollowersCount(prev => prev + 1);
            showPointsToast(2, "Followed a report");
        } else {
            await api.post(`/report/unfollow`, { report_id: report?.id });
            setIsFollowing(false);
            setFollowersCount(prev => prev - 1);
        }
    }

    async function handlePostComment() {
        if (!isAuthenticated) {
            setShowSignInModal(true);
            return;
        }
        if (!newComment.trim()) return;

        setPostingComment(true);
        try {
            await api.post(`/report/comment/${id}`, { report_id: id, comment: newComment });

            // Re-fetch comments to get the real data
            const commentsResponse = await api.get<CommentResponse>(`/report/comments/${id}`);
            setComments(commentsResponse.data.comments);

            // Re-fetch report to get updated status
            const reportResponse = await api.get<ReportDetailResponse>(`/report/${id}`);
            const { report: apiReport } = reportResponse.data;
            setReport(prev => prev ? {
                ...prev,
                status: apiReport.status === 'open' ? ReportStatus.OPEN
                    : apiReport.status === 'in_progress' ? ReportStatus.IN_PROGRESS
                        : apiReport.status === 'acknowledged' ? ReportStatus.ACKNOWLEDGED
                            : ReportStatus.RESOLVED
            } : prev);

            setNewComment("");
            showPointsToast(2, "Posted a comment");
        } catch (error) {
            console.error("Error posting comment:", error);
        } finally {
            setPostingComment(false);
        }
    }

    if (loading || !report) {
        return (
            <>
                {authChecked && (isAuthenticated ? <NavBarPrivate /> : <NavBarPublic />)}
                <div className="pt-6 md:pt-24 flex justify-center items-center min-h-[50vh]">
                    <div className="animate-pulse flex flex-col items-center">
                        <div className="h-4 w-32 bg-gray-200 rounded mb-4"></div>
                        <div className="h-8 w-64 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </>
        );
    }

    const CommunityInterest = (
        <div className="bg-white rounded-2xl px-6 sm:px-8 py-4 border border-gray-100 shadow-sm">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 sm:mb-6 mt-2">Community Interest</h3>
            <div className="flex items-center gap-6 mb-2 sm:mb-6">
                <div>
                    <p className="text-3xl sm:text-4xl font-extrabold text-gray-900">{followersCount}</p>
                    <p className="text-sm font-medium text-gray-400 mt-1">Followers</p>
                </div>
                <div className="w-px h-12 bg-gray-100"></div>

                <div className="flex -space-x-3 overflow-hidden p-2">
                    {followers.slice(0, 5).map((follower, i) => (
                        <div key={i} className="inline-block h-10 w-10 rounded-full ring-4 ring-white bg-gray-200">
                            <img
                                className="h-full w-full rounded-full object-cover"
                                src={follower.users.avatar}
                                alt={follower.users.name}
                                title={follower.users.name}
                                referrerPolicy="no-referrer"
                            />
                        </div>
                    ))}
                    {followers.length > 5 && (
                        <div className="flex items-center justify-center h-10 w-10 rounded-full ring-4 ring-white bg-brand-bg-light text-brand-primary text-xs font-bold">
                            +{followers.length - 5}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="px-0 sm:px-4 lg:px-8 py-2 min-h-screen bg-page-bg">
            {authChecked && (isAuthenticated ? <NavBarPrivate /> : <NavBarPublic />)}

            <main className="pt-6 md:pt-24 pb-24 md:pb-12 px-4 sm:px-6 max-w-7xl mx-auto font-sans">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-6 font-medium overflow-x-auto whitespace-nowrap pb-2 scrollbar-hide">
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors mr-2"
                        title="Back to Dashboard"
                    >
                        <ArrowLeft size={20} className="text-gray-400 hover:text-gray-900" />
                    </button>
                    <span
                        onClick={() => router.push('/dashboard')}
                        className="cursor-pointer hover:text-gray-900"
                    >
                        Reports
                    </span>
                    <span>/</span>
                    <span className="text-gray-900">Issue #{report.id}</span>
                </div>

                {/* Header */}
                <div className="mb-6 sm:mb-8">
                    <span className="inline-block px-3 py-1 rounded-md bg-brand-bg-light text-brand-primary text-xs font-bold uppercase tracking-wider mb-4">
                        {report.category || 'Infrastructure'}
                    </span>

                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 sm:gap-6">
                        <div>
                            <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 mb-2 sm:mb-3 tracking-tight leading-tight">{report.title}</h1>
                            <p className="text-gray-500 flex flex-wrap items-center gap-2 text-sm">
                                Reported by {report.is_anonymous ? 'Anonymous user' : (report.user?.name || 'Anonymous user')}, at {report.location}
                            </p>
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                            <Dialog>
                                <DialogTrigger asChild>
                                    <button className="p-2.5 rounded-xl border border-gray-200 text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors" title="Flag as inappropriate">
                                        <Flag size={20} />
                                    </button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Flag Report</DialogTitle>
                                        <DialogDescription>
                                            Is this report inappropriate or spam? Let us know.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="reason">Reason</Label>
                                            <Input id="reason" placeholder="e.g. Spam, Offensive content" />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button type="submit" onClick={async () => {
                                            const reason = (document.getElementById('reason') as HTMLInputElement).value;
                                            if (!reason) return;
                                            try {
                                                await api.post(`/report/${report.id}/flag`, { report_id: report.id, reason });
                                                // Close dialog logic or show toast
                                                showPointsToast(0, "Report flagged for review");
                                            } catch (e) {
                                                console.error(e);
                                            }
                                        }}>Submit Report</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>

                            <button onClick={handleFollow} className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-primary text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all hover:bg-brand-secondary active:scale-95 cursor-pointer">
                                <Bell size={18} />
                                {isFollowing ? 'Unfollow Report' : 'Follow Report'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Community Interest */}
                <div className="mb-6 lg:hidden">
                    {CommunityInterest}
                </div>

                {/* Journey Stepper */}
                <div className="bg-white rounded-2xl p-5 sm:p-8 mb-6 sm:mb-8 border border-gray-100 shadow-sm relative overflow-hidden">
                    <div className="flex justify-between items-center mb-6 sm:mb-8">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">Issue Progress</h3>
                    </div>

                    <div className="w-full">
                        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8 sm:gap-0 z-10">
                            {/* Progress Bar background */}
                            <div className="absolute left-6 top-6 bottom-6 w-1 sm:w-auto sm:h-1 sm:left-0 sm:right-0 bg-gray-100 -z-10" />

                            {statusSteps.map((step, index) => {
                                const isActive = report.status === step.id;
                                const isPast = [ReportStatus.OPEN, ReportStatus.ACKNOWLEDGED, ReportStatus.IN_PROGRESS, ReportStatus.RESOLVED].indexOf(report.status) >= index;

                                let dateDisplay = 'Upcoming';
                                if (step.id === ReportStatus.OPEN && report.created_at) {
                                    dateDisplay = new Date(report.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                                } else if (isActive) {
                                    dateDisplay = 'Active Now';
                                } else if (isPast && !isActive) {
                                    // Past steps that aren't active should show "Completed"
                                    dateDisplay = 'Completed';
                                }

                                return (
                                    <div key={step.id} className="flex flex-row sm:flex-col items-center gap-4 px-2 w-full sm:w-auto">
                                        <div className={`
                        w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-300 shrink-0 z-10
                        ${isActive || isPast ? 'bg-brand-primary border-brand-bg-light text-white shadow-lg shadow-green-100' : 'bg-white border-gray-100 text-gray-300'}
                      `}>
                                            {isActive || isPast ? <CheckCircle2 size={24} strokeWidth={3} /> : <Circle size={24} />}
                                        </div>
                                        <div className="text-left sm:text-center">
                                            <p className={`text-sm font-bold mb-1 ${isActive ? 'text-brand-primary' : 'text-gray-900'}`}>{step.label}</p>
                                            <p className="text-xs text-gray-400 font-medium">{dateDisplay}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Status Actions */}
                <div className="bg-white rounded-2xl p-5 sm:p-6 mb-6 sm:mb-8 border border-gray-100 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-6">
                    <div className="flex items-start gap-4 w-full sm:w-auto">
                        <div className="p-3 bg-green-50 rounded-xl text-green-600 shrink-0">
                            <User size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Status Actions</h3>
                            <p className="text-sm text-gray-500 max-w-md mt-1 leading-relaxed">
                                Help drive the resolution. Update status based on observation.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                        <button
                            onClick={() => handleMarkInProgress()}
                            disabled={updatingStatus || report.status === ReportStatus.IN_PROGRESS}
                            className="w-full sm:w-auto border-2 border-green-100 text-green-600 px-6 py-3 rounded-xl cursor-pointer font-bold hover:bg-green-50 transition-colors text-center disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {updatingStatus ? 'Updating...' : 'Mark In Progress'}
                        </button>
                        <button
                            onClick={() => handleMarkClosed()}
                            disabled={updatingStatus || closedByUser !== null}
                            className="w-full sm:w-auto bg-brand-primary text-white px-6 py-3 rounded-xl font-bold shadow-lg cursor-pointer hover:bg-brand-secondary transition-all flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <CheckCircle2 size={18} />
                            {report.status === ReportStatus.RESOLVED ? 'Closed' : (closedByUser ? 'Pending Verification' : 'Mark as Closed')}
                        </button>
                    </div>
                </div>

                <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 sm:gap-8">
                    {/* Main Content */}
                    <div className="contents lg:block lg:col-span-2 lg:space-y-8">
                        {/* Description */}
                        <div className="bg-white rounded-2xl p-5 sm:p-8 border border-gray-100 shadow-sm order-1 lg:order-none">
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Description</h3>
                            <p className="text-gray-600 leading-relaxed text-sm sm:text-md">
                                {report.description}
                            </p>

                            <div className="mt-6 sm:mt-8">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Evidence Photo</h4>
                                <div className="aspect-video rounded-xl sm:rounded-2xl overflow-hidden shadow-sm border border-gray-100 bg-gray-50">
                                    {report.imageUrl ? (
                                        <img src={report.imageUrl} alt="Evidence" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-br ${getCategoryGradient(report.category)}`}>
                                            {getCategoryIcon(report.category)}
                                            <span className="text-xs font-bold uppercase tracking-widest mt-3 opacity-60">Photo Not Available</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Confirmation Section - Shows when closed_by is set */}
                        {closedByUser !== null ? (
                            // ACTIVE STATE - Someone has marked it for verification
                            <div className="bg-white rounded-2xl p-6 border-2 border-brand-primary shadow-sm order-3 lg:order-none">
                                <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-xl font-bold text-gray-900">Community Verification</h3>
                                            <span className="bg-brand-bg-light text-brand-primary text-[10px] font-extrabold px-2 py-1 rounded uppercase tracking-wider">Active</span>
                                        </div>
                                        <p className="text-gray-500 text-sm max-w-lg leading-relaxed">
                                            Are you at this location? Help the community by verifying that this issue has been resolved.
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleCommunityVerify}
                                        disabled={hasVerified || updatingStatus}
                                        className="w-full sm:w-auto bg-brand-primary hover:bg-brand-secondary text-white px-6 py-3 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <span className="bg-white/20 p-1 rounded-full"><Check size={14} strokeWidth={4} /></span>
                                        {hasVerified ? 'Already Verified' : "I Confirm It's Fixed"}
                                    </button>
                                </div>

                                <div className="flex flex-col md:flex-row items-center gap-6 mt-6 pt-6 border-t border-gray-50">
                                    {/* Closed By User */}
                                    <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-xl border border-gray-100 w-full md:w-auto pr-8">
                                        <div className="relative">
                                            <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                                                <img src={closedByUser.avatar || 'https://i.pravatar.cc/100'} className="w-full h-full object-cover" alt={closedByUser.name} referrerPolicy="no-referrer" />
                                            </div>
                                            <div className="absolute -bottom-1 -right-1 bg-brand-primary border-2 border-white rounded-full p-0.5">
                                                <Check size={10} className="text-white" strokeWidth={4} />
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">Closed by {closedByUser.name}</p>
                                            <p className="text-xs text-gray-400 font-medium">
                                                {report.status === ReportStatus.RESOLVED ? 'Verified & Closed' : 'Awaiting verification'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="hidden md:block h-10 w-px bg-gray-200"></div>

                                    {/* Progress */}
                                    <div className="flex-1 w-full">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="h-2 flex-1 bg-gray-100 rounded-full overflow-hidden max-w-[200px]">
                                                <div className="h-full bg-brand-primary rounded-full transition-all" style={{ width: `${Math.min((verificationCount / 3) * 100, 100)}%` }}></div>
                                            </div>
                                            <span className="text-brand-primary font-bold text-sm">{verificationCount}/3</span>
                                        </div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                            {3 - verificationCount > 0 ? `${3 - verificationCount} More Community Confirmation Needed` : 'Verification Complete!'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            // LOCKED STATE
                            <div className="bg-white rounded-2xl p-5 sm:p-8 border-2 border-dashed border-gray-200 shadow-sm relative overflow-hidden group order-3 lg:order-none">
                                <div className="opacity-40 blur-[2px] select-none pointer-events-none grayscale transition-all duration-500 group-hover:blur-[1px] group-hover:opacity-50">
                                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Community Verification</h3>
                                    <p className="text-sm sm:text-base text-gray-400 mb-6 max-w-md">Community members near the area can confirm the fix to archive this report.</p>

                                    <div className="w-full h-px bg-gray-100 mb-6"></div>

                                    <div className="space-y-3">
                                        <div className="h-2 bg-gray-100 rounded-full w-1/3"></div>
                                        <p className="text-[10px] font-bold text-gray-300 uppercase tracking-wider">1/2 Community Confirmations</p>
                                    </div>
                                </div>

                                <div className="absolute inset-0 flex items-center justify-center z-10 p-4 text-center">
                                    <div className="bg-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 px-4 py-3 sm:px-5 sm:py-3 rounded-xl flex items-center gap-2 sm:gap-3 transform group-hover:scale-105 transition-transform duration-300 cursor-default">
                                        <Lock size={14} className="text-gray-900 shrink-0" strokeWidth={2.5} />
                                        <span className="text-[9px] sm:text-[10px] font-extrabold text-gray-900 uppercase tracking-wider whitespace-nowrap">Unlock by marking as "Closed"</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6 order-2 lg:order-none">
                        {/* Community Interest (Desktop) */}
                        <div className="hidden lg:block">
                            {CommunityInterest}
                        </div>

                        {/* Public Updates */}
                        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm h-fit">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Public Comments</h3>
                                <MessageSquare size={16} className="text-gray-400" />
                            </div>

                            {/* Scrollable Container */}
                            <div className="space-y-6 pl-6 sm:pl-8 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                                {comments.length === 0 ? (
                                    <div className="text-center py-8 text-gray-400 text-sm">
                                        No updates yet. Be the first to comment.
                                    </div>
                                ) : (
                                    comments.map((comment, i) => (
                                        <div key={i} className="relative">
                                            <div className="absolute -left-6 sm:-left-8 top-0 bg-white py-1">
                                                <img src={comment.users?.avatar || "https://i.pravatar.cc/100?img=33"} className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-white shadow-sm" alt="" />
                                            </div>
                                            <div className="pl-2 sm:pl-4">
                                                <h4 className="font-bold text-gray-900 text-sm">{comment.users?.name}</h4>
                                                <p className="text-gray-500 text-xs font-medium mt-1 leading-relaxed">{comment.comment}</p>
                                                <p className="text-xs text-gray-400 mt-1 font-light">{timeAgo(comment.created_at)}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="mt-6 pt-4 border-t border-gray-50">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Add update..."
                                        className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-primary/20 pr-12"
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handlePostComment()}
                                        disabled={postingComment}
                                    />
                                    <button
                                        onClick={handlePostComment}
                                        disabled={!newComment.trim() || postingComment}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-brand-primary hover:bg-brand-bg-light rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <SendHorizontal size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <SignInPromptModal
                isOpen={showSignInModal}
                onClose={() => setShowSignInModal(false)}
            />

            {/* No Acknowledgment Warning Modal */}
            {showNoAckWarning && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-amber-100 rounded-full">
                                <MessageSquare size={24} className="text-amber-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">No Interactions Yet</h3>
                        </div>
                        <p className="text-gray-600 mb-6">
                            This issue has no comments or interactions that acknowledge it. Are you sure you want to {pendingAction === 'closed' ? 'mark it as closed' : 'mark it in progress'}?
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowNoAckWarning(false);
                                    setPendingAction(null);
                                }}
                                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    setShowNoAckWarning(false);
                                    if (pendingAction === 'closed') {
                                        handleMarkClosed(true);
                                    } else {
                                        handleMarkInProgress(true);
                                    }
                                    setPendingAction(null);
                                }}
                                className="flex-1 px-4 py-2.5 bg-brand-primary text-white rounded-xl font-semibold hover:bg-brand-secondary transition-colors"
                            >
                                Continue Anyway
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Follow Required Modal */}
            {showFollowRequired && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-100 rounded-full">
                                <Bell size={24} className="text-blue-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">Follow Required</h3>
                        </div>
                        <p className="text-gray-600 mb-6">
                            You must follow this report before you can change its status. Following ensures you're committed to tracking this issue.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowFollowRequired(false)}
                                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={async () => {
                                    setShowFollowRequired(false);
                                    await handleFollow();
                                }}
                                className="flex-1 px-4 py-2.5 bg-brand-primary text-white rounded-xl font-semibold hover:bg-brand-secondary transition-colors flex items-center justify-center gap-2"
                            >
                                <Bell size={16} />
                                Follow Now
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
