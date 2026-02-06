"use client";
import NavBarPrivate from "@/shared/components/NavBarPrivate";
import { api } from "@/lib/apiClient";
import { useEffect, useState } from "react";
import ReportCard from "./components/ReportCard";
import ReportSkeleton from "./components/ReportSkeleton";
import { Report, ReportStatus } from "@/types/report";
import { supabase } from "@/lib/supabaseClient";

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
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {

    const fetchData = async () => {
      try {
        const response = await api.get('/report/list');
        // Map backend fields to frontend Report type
        const mappedReports: Report[] = response.data.reports.map((r: any) => ({
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
          is_following: r.is_following,
          followers_count: r.followers_count,
        }));
        setReports(mappedReports);
        console.log("Fetched reports:", mappedReports);
      } catch (error) {
        console.error("Error fetching reports:", error);
      }
    };

    fetchData().finally(() => setIsLoading(false));
  }, []);


  return (
    <>
      <NavBarPrivate />
      <div className="pt-25 w-full min-h-screen p-25 bg-white dark:bg-gray-900">
        <div className="flex flex-col mb-6">
          <h1 className="text-3xl font-bold">Public report feed</h1>
          <p className="text-sm text-gray-500">View and track real-time reports from the community</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <ReportSkeleton key={i} />
            ))
          ) : (
            reports.map(report => (
              <ReportCard key={report.id} report={report} />
            ))
          )}
        </div>
      </div>



    </>
  );
}