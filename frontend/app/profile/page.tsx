"use client";
import React, { useEffect, useState } from "react";
import NavBarPrivate from "@/shared/components/NavBarPrivate";
import { useRouter } from "next/navigation";
import { api } from "@/lib/apiClient";
import {
    User, FileText, Settings, Trophy, Heart, CheckCircle,
    PlusCircle, MessageSquare, ArrowRight, LogOut
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface UserData {
    user_id: string;
    name: string;
    email: string;
    avatar: string;
    created_at: string;
}

interface UserAction {
    id: number;
    action_name: string;
    report_id: number | null;
    created_at: string;
    points: number;
}

interface MyReport {
    report_id: number;
    title: string;
    description: string;
    status: string;
    created_at: string;
    photo_url: string | null;
    category: string;
}

interface BadgeInfo {
    badge_id: number;
    badge_name: string;
    badge_description: string;
    icon_type: string | null;
}

interface UserBadge {
    id: number;
    badge: BadgeInfo;
}

function timeAgo(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minutes ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return "Yesterday";
    return `${days} days ago`;
}

function formatJoinDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

const getActionIcon = (actionName: string) => {
    switch (actionName) {
        case "CREATE_REPORT":
            return <PlusCircle size={18} className="text-green-600" />;
        case "FOLLOW_REPORT":
            return <Heart size={18} className="text-pink-500" />;
        case "COMMENT":
            return <MessageSquare size={18} className="text-blue-500" />;
        case "CONFIRM_RESOLUTION":
            return <CheckCircle size={18} className="text-brand-primary" />;
        default:
            return <FileText size={18} className="text-gray-400" />;
    }
};

const getActionLabel = (actionName: string) => {
    switch (actionName) {
        case "CREATE_REPORT":
            return "Submitted a new report";
        case "FOLLOW_REPORT":
            return "Followed a report";
        case "COMMENT_REPORT":
            return "Commented on a report";
        case "CONFIRM_RESOLUTION":
            return "Confirmed a resolution";
        default:
            return actionName;
    }
};

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<UserData | null>(null);
    const [actions, setActions] = useState<UserAction[]>([]);
    const [myReports, setMyReports] = useState<MyReport[]>([]);
    const [earnedBadges, setEarnedBadges] = useState<UserBadge[]>([]);
    const [allBadges, setAllBadges] = useState<BadgeInfo[]>([]);
    const [totalPoints, setTotalPoints] = useState(0);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("profile");

    useEffect(() => {
        const checkSessionAndFetch = async () => {
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                router.push("/");
                return;
            }

            try {
                const [userRes, actionsRes, reportsRes, badgesRes, allBadgesRes] = await Promise.all([
                    api.get<UserData>("/user/me"),
                    api.get<{ actions: UserAction[] }>("/user/actions"),
                    api.get<MyReport[]>("/user/my-reports"),
                    api.get<{ badges: UserBadge[] }>("/user/badges"),
                    api.get<{ badges: BadgeInfo[] }>("/user/all-badges"),
                ]);

                setUser(userRes.data);
                setActions(actionsRes.data.actions);
                setMyReports(reportsRes.data);
                setEarnedBadges(badgesRes.data.badges);
                setAllBadges(allBadgesRes.data.badges);

                // Calculate total points
                const points = actionsRes.data.actions.reduce(
                    (sum, action) => sum + action.points,
                    0
                );
                setTotalPoints(points);
            } catch (error) {
                console.error("Error fetching profile data:", error);
                // If fetching fails ensure we don't show broken state
            } finally {
                setLoading(false);
            }
        };

        checkSessionAndFetch();
    }, [router]);

    const handleLogout = async () => {
        try {
            // Optional backend call
            await api.post("/auth/logout");
        } catch (error) {
            console.error("Backend logout error (ignoring):", error);
        } finally {
            await supabase.auth.signOut();
            router.push("/");
        }
    };

    // Calculate stats from actions
    const reportsCreated = actions.filter(a => a.action_name === "CREATE_REPORT").length;
    const resolutionsConfirmed = actions.filter(a => a.action_name === "CONFIRM_RESOLUTION").length;

    // Determine level based on points
    const getLevelInfo = (pts: number) => {
        if (pts < 20) return { level: 1, min: 0, max: 20 };
        if (pts < 50) return { level: 2, min: 20, max: 50 };
        if (pts < 100) return { level: 3, min: 50, max: 100 };
        if (pts < 200) return { level: 4, min: 100, max: 200 };
        if (pts < 400) return { level: 5, min: 200, max: 400 };
        if (pts < 800) return { level: 6, min: 400, max: 800 };
        return { level: 7, min: 800, max: pts > 800 ? pts : 801 }; // Level 7 is 800+
    };

    const { level, min, max } = getLevelInfo(totalPoints);
    const progressToNextLevel = level === 7 ? 100 : ((totalPoints - min) / (max - min)) * 100;

    if (loading) {
        return (
            <>
                <NavBarPrivate />
                <div className="pt-24 flex justify-center items-center min-h-[50vh]">
                    <div className="animate-pulse flex flex-col items-center">
                        <div className="h-4 w-32 bg-gray-200 rounded mb-4"></div>
                        <div className="h-8 w-64 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <div className="min-h-screen bg-page-bg">
            <NavBarPrivate />

            <main className="pt-24 pb-24 md:pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                {/* Profile Header */}
                <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm mb-8">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                        {/* Avatar */}
                        <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 ring-4 ring-brand-bg-light shrink-0">
                            <img
                                src={user?.avatar || ""}
                                alt={user?.name}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                            />
                        </div>

                        {/* User Info */}
                        <div className="flex-1 text-center sm:text-left">
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                                {user?.name}
                            </h1>
                            <p className="text-gray-500 text-sm mb-3">
                                Joined {user?.created_at ? formatJoinDate(user.created_at) : ""} • Community Member
                            </p>

                            {/* Level Badge */}
                            <div className="inline-flex items-center gap-3">
                                <span className="bg-brand-primary text-white text-xs font-bold px-3 py-1 rounded-full">
                                    Level {level}
                                </span>
                                <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-brand-primary rounded-full transition-all"
                                        style={{ width: `${progressToNextLevel}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Points & Actions */}
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            <div className="text-center px-6 py-3 bg-gray-50 rounded-xl border border-gray-100">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Points</p>
                                <p className="text-3xl font-extrabold text-gray-900">{totalPoints.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Navigation */}
                        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                            <nav className="space-y-1">
                                <button
                                    onClick={() => setActiveTab("profile")}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === "profile" ? "bg-brand-bg-light text-brand-primary" : "text-gray-600 hover:bg-gray-50"}`}
                                >
                                    <User size={18} />
                                    Profile
                                </button>
                                <button
                                    onClick={() => setActiveTab("reports")}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === "reports" ? "bg-brand-bg-light text-brand-primary" : "text-gray-600 hover:bg-gray-50"}`}
                                >
                                    <FileText size={18} />
                                    My Reports
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-red-600 hover:bg-red-50 transition-colors"
                                >
                                    <LogOut size={18} />
                                    Log Out
                                </button>

                            </nav>
                        </div>

                        {/* Impact Stats */}
                        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Impact</h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-3xl font-extrabold text-gray-900">{reportsCreated}</p>
                                    <p className="text-sm text-gray-500">Reports Created</p>
                                </div>
                                <div className="w-full h-px bg-gray-100" />
                                <div>
                                    <p className="text-3xl font-extrabold text-gray-900">{resolutionsConfirmed}</p>
                                    <p className="text-sm text-gray-500">Resolutions Confirmed</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3 space-y-8">
                        {activeTab === "profile" ? (
                            <>
                                {/* Earned Badges */}
                                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-lg font-bold text-gray-900">Earned Badges</h3>
                                        {/* <button className="text-brand-primary text-sm font-bold hover:underline">
                                            View All
                                        </button> */}
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
                                        {allBadges.length > 0 ? (
                                            allBadges.map((badge) => {
                                                const isEarned = earnedBadges.some(ub => ub.badge.badge_id === badge.badge_id);
                                                return (
                                                    <div key={badge.badge_id} className="flex flex-col items-center">
                                                        <div className={`medal-container mb-4 ${!isEarned ? 'opacity-30 grayscale blur-[1px]' : ''}`}>
                                                            <div className="medal-circle">
                                                                {badge.badge_name === "FIRST_REPORT" && <img src="/badges/first_report_badge.png" alt="First Report" className="w-14 h-14 object-contain rounded-full" />}
                                                                {badge.badge_name === "HELPER" && <img src="/badges/mark_in_progress_badge.png" alt="Helper" className="w-14 h-14 object-contain rounded-full" />}
                                                                {badge.badge_name === "RESOLVER" && <img src="/badges/community_verify_badge.png" alt="Resolver" className="w-14 h-14 object-contain rounded-full" />}
                                                            </div>
                                                            <div className="medal-ribbon"></div>
                                                            {!isEarned && (
                                                                <div className="absolute inset-0 flex items-center justify-center z-20">
                                                                    <div className="bg-gray-900/10 rounded-full p-2">
                                                                        <Settings size={20} className="text-gray-500 opacity-50" />
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="text-center">
                                                            <p className={`font-bold text-sm capitalize ${isEarned ? 'text-gray-900' : 'text-gray-400'}`}>
                                                                {badge.badge_name.replace("_", " ").toLowerCase()}
                                                            </p>
                                                            <p className="text-[10px] text-gray-400 max-w-[120px] mx-auto leading-tight mt-1">
                                                                {badge.badge_description}
                                                            </p>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="col-span-full text-center py-8 text-gray-400">
                                                No badges earned yet. Start by submitting a report!
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Recent Activity */}
                                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                                    <h3 className="text-lg font-bold text-gray-900 mb-6">Recent Activity</h3>

                                    {actions.length === 0 ? (
                                        <div className="text-center py-12 text-gray-400">
                                            <p className="mb-4">No activity yet.</p>
                                            <button
                                                onClick={() => router.push("/dashboard/report")}
                                                className="text-brand-primary font-bold hover:underline"
                                            >
                                                Create your first report
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            {actions.slice(0, 10).map((action) => (
                                                <div key={action.id} className="flex items-start gap-4 pb-6 border-b border-gray-50 last:border-b-0 last:pb-0">
                                                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                                                        {getActionIcon(action.action_name)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-bold text-gray-900 text-sm">
                                                            {getActionLabel(action.action_name)}
                                                        </p>
                                                        {action.report_id && (
                                                            <p className="text-gray-500 text-xs mt-1">
                                                                Report #{action.report_id}
                                                            </p>
                                                        )}
                                                        <p className="text-xs text-gray-400 mt-1">
                                                            {timeAgo(action.created_at)}
                                                        </p>
                                                    </div>
                                                    <div className="text-right shrink-0">
                                                        <span className="text-brand-primary font-bold text-sm">
                                                            +{action.points} pts
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}

                                            {actions.length > 10 && (
                                                <button className="w-full text-center text-brand-primary font-bold text-sm py-3 hover:bg-brand-bg-light rounded-xl transition-colors">
                                                    Load more activity
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                                <h3 className="text-lg font-bold text-gray-900 mb-6">My Reports</h3>
                                {myReports.length === 0 ? (
                                    <div className="text-center py-12 text-gray-400">
                                        <p className="mb-4">You haven't submitted any reports yet.</p>
                                        <button
                                            onClick={() => router.push("/dashboard/report")}
                                            className="text-brand-primary font-bold hover:underline"
                                        >
                                            Submit your first report
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {myReports.map((report) => (
                                            <div
                                                key={report.report_id}
                                                onClick={() => router.push(`/reports/${report.report_id}`)}
                                                className="flex items-center gap-4 p-4 rounded-xl border border-gray-50 hover:border-brand-primary/20 hover:bg-brand-bg-light/30 transition-all cursor-pointer group"
                                            >
                                                <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                                                    {report.photo_url ? (
                                                        <img src={report.photo_url} className="w-full h-full object-cover" alt="" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                            <FileText size={24} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-bold text-gray-900 truncate group-hover:text-brand-primary transition-colors">
                                                        {report.title}
                                                    </h4>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${report.status === 'resolved' ? 'bg-green-100 text-green-600' : 'bg-brand-bg-light text-brand-primary'}`}>
                                                            {report.status}
                                                        </span>
                                                        <span className="text-gray-400 text-xs">•</span>
                                                        <span className="text-gray-400 text-xs">{timeAgo(report.created_at)}</span>
                                                    </div>
                                                </div>
                                                <ArrowRight size={18} className="text-gray-300 group-hover:text-brand-primary group-hover:translate-x-1 transition-all" />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main >
        </div >
    );
}
