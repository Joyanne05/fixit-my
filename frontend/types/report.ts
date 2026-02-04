export enum ReportStatus {
  OPEN = 'OPEN',
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
}