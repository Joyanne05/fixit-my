import React from 'react';
import { Report, ReportStatus } from '../../../types/report';
import { UserCheck, ImageOff, Zap, Droplets, Trees, ShieldAlert, HardHat, HelpCircle } from 'lucide-react';
import { useRouter } from "next/navigation";
import { api } from '@/lib/apiClient';


interface ReportCardProps {
  report: Report;
}

const statusColors: Record<ReportStatus, string> = {
  [ReportStatus.OPEN]: 'bg-blue-100 text-blue-700',
  [ReportStatus.IN_PROGRESS]: 'bg-yellow-100 text-yellow-800',
  [ReportStatus.RESOLVED]: 'bg-brand-bg-light text-brand-primary'
};

const getCategoryIcon = (category: string) => {
  const c = category?.toLowerCase() || '';
  if (c.includes('infrastructure') || c.includes('road')) return <HardHat size={48} />;
  if (c.includes('lighting') || c.includes('electricity')) return <Zap size={48} />;
  if (c.includes('sanitation') || c.includes('trash') || c.includes('water')) return <Droplets size={48} />;
  if (c.includes('park') || c.includes('trees')) return <Trees size={48} />;
  if (c.includes('safety') || c.includes('security')) return <ShieldAlert size={48} />;
  return <ImageOff size={48} />;
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

const ReportCard: React.FC<ReportCardProps> = ({ report }) => {
  const [isFollowing, setIsFollowing] = React.useState(report.is_following);

  async function handleFollow(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    e.preventDefault();
    // console.log("Report id ", report.id);
    // console.log("Is following ", isFollowing);
    if (!isFollowing) {
      //Follow logic 
      const res = api.post(`/report/follow`, { report_id: report.id });
      setIsFollowing(true);
      console.log("Follow response ", res);
    } else {
      // Unfollow logic 
      const res = api.post(`/report/unfollow`, { report_id: report.id });
      console.log("Unfollow response ", res);
      setIsFollowing(false);
    }
  }

  const router = useRouter();
  return (
    <div
      onClick={() => router.push(`/reports/${report.id}`)}
      className="cursor-pointer w-full bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden flex flex-col h-96"
    >
      <div className="h-48 overflow-hidden relative shrink-0">
        {report.imageUrl ? (
          <img
            src={report.imageUrl}
            alt={report.title}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
        ) : (
          <div className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-br ${getCategoryGradient(report.category)}`}>
            {getCategoryIcon(report.category)}
            <span className="text-[10px] font-bold uppercase tracking-widest mt-2 opacity-50">No Image Provided</span>
          </div>
        )}
        <span className={`absolute top-4 left-4 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusColors[report.status]}`}>
          {report.status}
        </span>
        <span className="absolute bottom-4 right-4 text-xs font-medium bg-white rounded-md px-2 py-1">
          {report.timestamp}
        </span>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight">{report.title}</h3>
        <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
          {report.description}
        </p>
      </div>

      <hr className="border-gray-100 mx-4" />

      <div className="flex justify-between items-center px-4 py-3">
        <div className="flex items-center gap-2 text-gray-500">
          <UserCheck size={16} />
          <span className="text-sm font-medium">
            {report.followers_count} {report.followers_count === 1 ? 'follower' : 'followers'}
          </span>
        </div>

        <button onClick={handleFollow} className="cursor-pointer text-sm px-2 font-bold text-brand-primary hover:text-brand-secondary uppercase tracking-wide transition-colors">
          {isFollowing ? 'Following' : 'Follow'}
        </button>
      </div>
    </div>
  );
};

export default ReportCard;