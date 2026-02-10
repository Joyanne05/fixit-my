from fastapi import APIRouter, Form, File, UploadFile, Depends, HTTPException
from uuid import uuid4
from app.services.supabase_client import supabase
from app.dependencies.auth import get_current_user, get_optional_user
from app.schemas.report_schema import Report, ReportListResponse, ReportDetailResponse, ReportFollowRequest, ReportCommentRequest, ReportInProgressRequest, ReportCloseRequest, ReportConfirmRequest
from app.utils.action import record_user_action

router = APIRouter(
    prefix="/report",
)


# Create new report
@router.post("/create")
async def create_report(
    title: str = Form(...),
    category: str = Form(...),
    description: str = Form(...),
    location: str = Form(...),
    is_anonymous: bool = Form(False),
    photo: UploadFile | None = File(None),
    user=Depends(get_current_user),
) -> Report:
    photo_url = None

    # Upload photo if provided
    if photo:
        file_ext = photo.filename.split(".")[-1]
        filename = f"{uuid4()}.{file_ext}"
        path = f"reports/{filename}"

        try:
            content = await photo.read()
            # Upload photo to supabase bucket
            supabase.storage.from_("report-photos").upload(
                path, content, {"content-type": photo.content_type}
            )
            # Obtain image URL
            photo_url = supabase.storage.from_("report-photos").get_public_url(path)

        except Exception as e:
            print(f"Photo upload error: {str(e)}")
            raise HTTPException(status_code=500, detail="Photo upload failed")

    # Create report
    result = (
        supabase.table("reports")
        .insert(
            {
                "title": title,
                "category": category,
                "description": description,
                "status": "open",
                "created_by": user.id,
                "closed_by": None,
                "location": location,
                "photo_url": photo_url,
                "is_anonymous": is_anonymous,
            }
        )
        .execute()
    )

    if result.data:
        print("Report creation result: ", result.data)
    else:
        raise HTTPException(status_code=500, detail="Report creation failed")

    # print("Created report: ", result.data)
    # print(result.data[0])
    report = result.data[0]

    # Auto-follow own report
    supabase.table("report_followers").insert(
        {"report_id": report["report_id"], "user_id": user.id}
    ).execute()

    # Record action
    record_user_action(user.id, "CREATE_REPORT", report["report_id"])
    record_user_action(user.id, "FOLLOW_REPORT", report["report_id"])

    return report


# Get all reports
@router.get("/list", response_model=ReportListResponse)
async def list_reports(user=Depends(get_optional_user)):
    user_id = user.id if user else None

    # Logged-in user
    if user_id:
        result = (
            supabase.table("reports")
            .select(
                """
                report_id,
                title,
                description,
                status,
                created_by,
                closed_by,
                location,
                photo_url,
                created_at,
                updated_at,
                category,
                user_follow:report_followers!left(user_id),
                followers:report_followers(count)
                """
            )
            .eq("user_follow.user_id", user_id)
            .order("created_at", desc=True)
            .execute()
        )

    # Not logged in (no is_following info)
    else:
        result = (
            supabase.table("reports")
            .select(
                """
                report_id,
                title,
                description,
                status,
                created_by,
                closed_by,
                location,
                photo_url,
                created_at,
                updated_at,
                category,
                followers:report_followers(count)
                """
            )
            .order("created_at", desc=True)
            .execute()
        )

    clean_reports = []

    for r in result.data:
        clean_reports.append(
            {
                "report_id": r["report_id"],
                "title": r["title"],
                "category": r["category"],
                "description": r["description"],
                "status": r["status"],
                "created_by": r["created_by"],
                "closed_by": r["closed_by"],
                "location": r["location"],
                "photo_url": r["photo_url"],
                "created_at": r["created_at"],
                "updated_at": r["updated_at"],
                "is_following": (
                    len(r.get("user_follow", [])) > 0 if user_id else False
                ),
                "followers_count": (
                    r["followers"][0]["count"] if r.get("followers") else 0
                ),
            }
        )

    return {"reports": clean_reports}


# Get report by ID (include creator info, comments, followers)
@router.get("/{report_id}", response_model=ReportDetailResponse)
async def get_report(report_id: int, user=Depends(get_optional_user)):
    user_id = user.id if user else None

    report_res = (
        supabase.table("reports")
        .select(
            """
            *,
            users:created_by (
                name,
                avatar
            )
            """
        )
        .eq("report_id", report_id)
        .single()
        .execute()
    )

    if not report_res.data:
        raise HTTPException(status_code=404, detail="Report not found")

    report = report_res.data

    # Mask user info if report is anonymous
    if report.get("is_anonymous"):
        report["users"] = {"name": "Anonymous", "avatar": None}

    # Fetch followers (for follower list UI)
    followers_res = (
        supabase.table("report_followers")
        .select(
            """
            users:user_id (
                name,
                avatar
            )
            """
        )
        .eq("report_id", report_id)
        .execute()
    )

    followers = followers_res.data if followers_res.data else []

    # Check is_following (only if logged in)
    is_following = False

    if user_id:
        follow_res = (
            supabase.table("report_followers")
            .select("user_id")
            .eq("report_id", report_id)
            .eq("user_id", user_id)
            .limit(1)
            .execute()
        )

        is_following = len(follow_res.data) > 0

    return {"report": report, "followers": followers, "is_following": is_following}


# Follow report
@router.post("/follow")
async def follow_report(req: ReportFollowRequest, user=Depends(get_current_user)):
    try:
        supabase.table("report_followers").insert(
            {"report_id": req.report_id, "user_id": user.id}
        ).execute()
        
        # Record action
        record_user_action(user.id, "FOLLOW_REPORT", req.report_id)
    except Exception as e:
        print(f"Follow error: {str(e)}")
    return {"message": "Report followed successfully"}


# Unfollow report
@router.post("/unfollow")
async def unfollow_report(req: ReportFollowRequest, user=Depends(get_current_user)):
    supabase.table("report_followers").delete().eq("report_id", req.report_id).eq(
        "user_id", user.id
    ).execute()
    
    supabase.table("user_actions").delete().eq("report_id", req.report_id).eq(
        "user_id", user.id
    ).eq("action_name", "FOLLOW_REPORT").execute()

    supabase.table("report_helpers").delete().eq("report_id", req.report_id).eq(
        "user_id", user.id
    ).execute()
    return {"message": "Report unfollowed successfully"}

# Fetch comments
@router.get("/comments/{report_id}")
async def get_comments(report_id: int):
    comments_res = (
        supabase.table("comments")
        .select(
            """
            comment,
            created_at,
            users:user_id (
                name,
                avatar
            )
            """
        )
        .eq("report_id", report_id)
        .order("created_at", desc=True)
        .execute()
    )

    comments = comments_res.data if comments_res.data else []
    return {"comments": comments}

# Add comments on report post 
@router.post("/comment/{report_id}")
async def add_comment(req: ReportCommentRequest, user=Depends(get_current_user)):
    try:
        supabase.table("comments").insert(
            {"report_id": req.report_id, "user_id": user.id, "comment": req.comment}
        ).execute()

        # Update status to acknowledged if currently open
        report_res = supabase.table("reports").select("status").eq("report_id", req.report_id).single().execute()
        if report_res.data and report_res.data.get("status") == "open":
            supabase.table("reports").update({"status": "acknowledged"}).eq("report_id", req.report_id).execute()

        # Record action
        record_user_action(user.id, "COMMENT_REPORT", req.report_id)

    except Exception as e:
        print(f"Comment error: {str(e)}")

    return {"message": "Comment added successfully"}

# Mark issue as in progress 
@router.post("/in-progress")
async def in_progress_issue(req: ReportInProgressRequest, user=Depends(get_current_user)):
    try:
        supabase.table("reports").update({"status": "in_progress"}).eq("report_id", req.report_id).execute()
        supabase.table("report_helpers").insert({"report_id": req.report_id, "user_id": user.id}).execute()
    except Exception as e:
        print(f"In progress error: {str(e)}")
    return {"message": "Issue marked as in progress successfully"}

# Mark issue as closed 
@router.post("/close")
async def close_issue(req: ReportCloseRequest, user=Depends(get_current_user)):
    try:
        supabase.table("reports").update({"status": "in_progress","closed_by": user.id}).eq("report_id", req.report_id).execute()
    except Exception as e:
        print(f"Close error: {str(e)}")
    return {"message": "Issue closed successfully"}

# Add community confirmation 
@router.post("/community-verify")
async def add_community_confirmation(req: ReportConfirmRequest, user=Depends(get_current_user)):
    try:
        # Check if user already verified
        existing = supabase.table("community_confirmations").select("*").eq("report_id", req.report_id).eq("user_id", user.id).execute()
        if existing.data:
            raise HTTPException(status_code=400, detail="You have already verified this report")

        # Check if user is following the report
        is_following = supabase.table("report_followers").select("*").eq("report_id", req.report_id).eq("user_id", user.id).execute()
        if not is_following.data:
            raise HTTPException(status_code=400, detail="You must follow the report to verify it")
        
        # Insert verification
        supabase.table("community_confirmations").insert(
            {"report_id": req.report_id, "user_id": user.id}
        ).execute()
        
        # Record action
        record_user_action(user.id, "VERIFY_CLOSED", req.report_id)
        
        # Check count and update status if >= 3
        confirmations = supabase.table("community_confirmations").select("*").eq("report_id", req.report_id).execute()
        count = len(confirmations.data)
        
        if count >= 3:
            supabase.table("reports").update({"status": "closed"}).eq("report_id", req.report_id).execute()
            return {"message": "Issue verified and closed!", "count": count, "status": "closed"}
        
        return {"message": "Community confirmation added successfully", "count": count}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Confirm error: {str(e)}")
        raise HTTPException(status_code=500, detail="Error adding confirmation")

# Community confirmations count for report 
@router.get("/community-verify-status/{report_id}")
async def get_community_verify_status(report_id: int, user=Depends(get_optional_user)):
    try:
        # Get confirmation count
        confirmations = supabase.table("community_confirmations").select("*").eq("report_id", report_id).execute()
        count = len(confirmations.data) if confirmations.data else 0
        
        # Check if current user has verified
        has_verified = False
        if user:
            has_verified = any(c.get("user_id") == user.id for c in confirmations.data) if confirmations.data else False
        
        # Get report to check closed_by
        report = supabase.table("reports").select("closed_by, users!reports_closed_by_fkey(name, avatar)").eq("report_id", report_id).execute()
        
        closed_by_user = None
        if report.data and report.data[0].get("closed_by"):
            user_data = report.data[0].get("users")
            if user_data:
                closed_by_user = {
                    "name": user_data.get("name"),
                    "avatar": user_data.get("avatar")
                }
        
        return {
            "count": count,
            "has_verified": has_verified,
            "closed_by": closed_by_user
        }
    except Exception as e:
        print(f"Verify status error: {str(e)}")
        return {"count": 0, "has_verified": False, "closed_by": None}
