export enum ReportStatus {
  OPEN = 'OPEN',
  ACKNOWLEDGED = 'ACKNOWLEDGED',
  IN_PROGRESS = 'IN PROGRESS',
  RESOLVED = 'RESOLVED'
}

export interface Report {
  id: string;
  title: string;
  category: string; 
  description: string;
  imageUrl: string;
  status: ReportStatus;
  timestamp: string;
  location: string;
  is_following: boolean;
  followers_count: number;
  is_anonymous?: boolean;
  created_at?: string;
  user?: {
    name: string;
    avatar: string;
  };
}

export interface ReportDetail {
    report_id: number;
    title: string;
    description: string;
    category: string;
    status: string;
    location: string;
    photo_url: string;
    created_at: string;
    is_anonymous?: boolean;
    users: {
        name: string;
        avatar: string;
    };
}

export interface ReportFollower {
    users: {
        name: string;
        avatar: string;
    };
}

export interface ReportDetailResponse {
    report: ReportDetail;
    followers: ReportFollower[];
    is_following: boolean;
}