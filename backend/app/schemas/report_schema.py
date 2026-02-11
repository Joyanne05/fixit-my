from pydantic import BaseModel, ConfigDict
from datetime import datetime
from uuid import UUID
from typing import Optional, List

class UserMinimal(BaseModel):
    name: str
    avatar: Optional[str] = None

class ReportBase(BaseModel):
    title: str
    description: str
    category: str
    location: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    is_anonymous: Optional[bool] = False

class ReportCreate(ReportBase):
    pass

class Report(ReportBase):
    report_id: int
    status: str
    photo_url: Optional[str] = None
    created_by: UUID
    closed_by: Optional[UUID] = None
    created_at: datetime
    updated_at: datetime
    
    # Optional nested data from Supabase joins
    users: Optional[UserMinimal] = None
    is_following: Optional[bool] = False
    followers_count: Optional[int] = 0
    
    model_config = ConfigDict(from_attributes=True)

class FollowerInfo(BaseModel):
    users: UserMinimal

class ReportDetailResponse(BaseModel):
    report: Report
    followers: List[FollowerInfo]
    is_following: bool

class ReportListResponse(BaseModel):
    reports: List[Report]

class ReportFollowRequest(BaseModel):
    report_id: int

class ReportCommentRequest(BaseModel):
    report_id: int
    comment: str

class ReportInProgressRequest(BaseModel):
    report_id: int

class ReportCloseRequest(BaseModel):
    report_id: int

class ReportConfirmRequest(BaseModel):
    report_id: int