"use client";
import NavBarPrivate from "@/shared/components/NavBarPrivate";
import NavBarPublic from "@/shared/components/NavBarPublic";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import ReportCard from "./components/ReportCard";
import ReportSkeleton from "./components/ReportSkeleton";
import { Report, ReportStatus } from "@/types/report";
import SignInPromptModal from "@/shared/components/SignInPromptModal";
import PendingReportsBanner from "@/shared/components/PendingReportsBanner";
import { Search, List, MapIcon } from "lucide-react";
import { useAuth } from "@/shared/context/AuthContext";

// Dynamic import to avoid SSR issues with Leaflet
const DashboardHeatmap = dynamic(
  () => import("./components/DashboardHeatmap"),
  { ssr: false }
);

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

export default function DashboardPage() {
  const { isAuthenticated, authChecked, session } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [dashboardView, setDashboardView] = useState<'list' | 'map'>('list');

  useEffect(() => {
    if (!authChecked) return;

    async function fetchReports() {
      try {
        let response;
        if (isAuthenticated && session?.access_token) {
          response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/report/list`, {
            headers: {
              'Authorization': `Bearer ${session.access_token}`
            }
          });
        } else {
          response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/report/list`);
        }

        if (!response.ok) throw new Error('Failed to fetch');
        const resData = await response.json();

        const mappedReports: Report[] = resData.reports.map((r: any) => ({
          id: r.report_id?.toString() || r.id?.toString(),
          title: r.title,
          description: r.description,
          imageUrl: r.photo_url || '',
          status: r.status === 'open' ? ReportStatus.OPEN
            : r.status === 'acknowledged' ? ReportStatus.ACKNOWLEDGED
              : r.status === 'in_progress' ? ReportStatus.IN_PROGRESS
                : ReportStatus.RESOLVED,
          timestamp: r.created_at ? timeAgo(r.created_at) : '',
          location: r.location || '',
          category: r.category || '',
          is_following: r.is_following || false,
          followers_count: r.followers_count || 0,
        }));
        setReports(mappedReports);
      } catch (error) {
        console.error("Error fetching reports:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchReports();
  }, [authChecked, isAuthenticated, session]);

  // console.log("Reports:", reports);

  // Get unique categories from reports
  const categories = ['all', ...new Set(reports.map((r) => r.category).filter(Boolean))];

  // Filter reports based on search and category
  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || report.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      {authChecked && (isAuthenticated ? <NavBarPrivate /> : <NavBarPublic />)}
      <div className={`${isAuthenticated ? 'pt-10 md:pt-24' : 'pt-24'
        } pb-8 w-full min-h-screen px-6 sm:px-8 lg:px-16 py-6 pb-24 md:pb-6 bg-white`}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col mb-6">
            <h1 className="text-3xl font-bold text-[#124076] pt-4">Public Report Feed</h1>
            <p className="text-sm text-gray-500">
              View and track real-time reports from the community
              {!isAuthenticated && authChecked && (
                <span className="ml-2 text-brand-primary">• Sign in to interact with reports</span>
              )}
            </p>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            {/* Search */}
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search reports by title, description, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all bg-white capitalize cursor-pointer min-w-[180px]"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat} className="capitalize">
                  {cat === 'all' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>

          {/* View Toggle + Results Count */}
          <div className="flex items-center justify-between mb-4">
            {!isLoading && dashboardView === 'list' && (
              <p className="text-sm text-gray-500">
                Showing {filteredReports.length} {filteredReports.length === 1 ? 'report' : 'reports'}
              </p>
            )}
            {dashboardView === 'map' && <div />}

            {/* List / Map Toggle */}
            <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
              <button
                onClick={() => setDashboardView('list')}
                className={`flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg transition-all cursor-pointer ${dashboardView === 'list'
                  ? 'bg-white text-brand-primary shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                <List size={16} />
                List
              </button>
              <button
                onClick={() => setDashboardView('map')}
                className={`flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg transition-all cursor-pointer ${dashboardView === 'map'
                  ? 'bg-white text-brand-primary shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                <MapIcon size={16} />
                Map
              </button>
            </div>
          </div>

          {/* Pending Offline Reports Banner */}
          {isAuthenticated && <PendingReportsBanner />}

          {/* Dashboard Content: List or Map */}
          {dashboardView === 'list' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-8">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <ReportSkeleton key={i} />
                ))
              ) : filteredReports.length === 0 ? (
                <div className="col-span-full text-center py-12 text-gray-500">
                  {searchTerm || selectedCategory !== 'all'
                    ? 'No reports match your filters.'
                    : 'No reports yet. Be the first to report an issue!'}
                </div>
              ) : (
                filteredReports.map(report => (
                  <ReportCard
                    key={report.id}
                    report={report}
                    isAuthenticated={isAuthenticated}
                    onAuthRequired={() => setShowSignInModal(true)}
                  />
                ))
              )}
            </div>
          ) : (
            <div className="mb-8">
              <DashboardHeatmap selectedCategory={selectedCategory} />
            </div>
          )}
        </div>
      </div>

      <SignInPromptModal
        isOpen={showSignInModal}
        onClose={() => setShowSignInModal(false)}
      />
    </>
  );
}
