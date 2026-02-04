import React from 'react';
import { Report, ReportStatus } from '../../../types/report';
import { UserCheck } from 'lucide-react';


interface ReportCardProps {
  report: Report;
}

const statusColors: Record<ReportStatus, string> = {
  [ReportStatus.OPEN]: 'bg-blue-100 text-blue-700',
  [ReportStatus.IN_PROGRESS]: 'bg-yellow-100 text-yellow-800',
  [ReportStatus.RESOLVED]: 'bg-green-100 text-green-700'
};

const ReportCard: React.FC<ReportCardProps> = ({ report }) => {
  return (
    <div className="cursor-pointer w-72 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden flex flex-col h-96">
      <div className="h-48 overflow-hidden relative shrink-0">
        <img
          src={report.imageUrl}
          alt={report.title}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />
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

        <button className="text-sm font-bold text-green-500 hover:text-green-600 uppercase tracking-wide transition-colors">
          {report.is_following ? 'Following' : 'Follow Report'}
        </button>
      </div>
    </div>
  );
};

export default ReportCard;