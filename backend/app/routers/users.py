from fastapi import APIRouter, Depends, HTTPException
from app.services.supabase_client import supabase
from app.dependencies.auth import get_current_user

router = APIRouter(
    prefix="/user",
)

@router.get("/me")
async def get_me(user = Depends(get_current_user)):
    try: 
        supabase_user = supabase.table("users").select("*").eq("user_id", user.id).single().execute()
    except Exception as e:
        print(f"Error fetching user data: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch user data")
    
    return supabase_user.data

@router.get("/actions")
async def get_user_actions(user = Depends(get_current_user)):
    try:
        # Select all actions for the user
        # Include points from user_points
        result = (
            supabase.table("user_actions")
            .select("""
                *,
                points:user_points(points)
            """)
            .eq("user_id", user.id)
            .execute()
        )
    except Exception as e:
        print(f"Error fetching user actions: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch user actions")

    # Clean response: include action info + points
    actions_with_points = []
    for action in result.data:
        points_list = action.get("points", [])
        points = points_list[0]["points"] if points_list else 0
        actions_with_points.append({
            "id": action["id"],
            "action_name": action["action_name"],
            "report_id": action.get("report_id"),
            "created_at": action["created_at"],
            "points": points
        })

    return {"actions": actions_with_points}

@router.get("/my-reports")
async def get_my_reports(user = Depends(get_current_user)):
    try:
        result = (
            supabase.table("reports")
            .select("*")
            .eq("created_by", user.id)
            .execute()
        )
    except Exception as e:
        print(f"Error fetching user reports: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch user reports")
    
    return result.data

@router.get("/badges")
async def get_user_badges(user = Depends(get_current_user)):
    try:
        result = (
            supabase.table("user_badges")
            .select("""
                *,
                badge:badges(*)
            """)
            .eq("user_id", user.id)
            .execute()
        )
    except Exception as e:
        print(f"Error fetching user badges: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch user badges")
    
    return {"badges": result.data}

@router.get("/all-badges")
async def get_all_badges():
    try:
        result = (
            supabase.table("badges")
            .select("*")
            .execute()
        )
    except Exception as e:
        print(f"Error fetching all badges: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch all badges")
    
    return {"badges": result.data}