from fastapi import APIRouter, Depends, Header, HTTPException
from app.services.supabase_client import supabase
from app.dependencies.auth import get_current_user

router = APIRouter(
    prefix="/auth",
)

@router.post("/sync-user")
async def sync_user(user = Depends(get_current_user)):
    # Extract user info
    user_id = user.id 
    metadata = user.user_metadata
    
    name = (metadata.get("full_name") or metadata.get("name") or "No Name").strip()
    avatar = metadata.get("avatar_url") or ""
    
    # Check if user exists in users table 
    isUserExists = (supabase.table("users").select("user_id").eq("user_id", user_id).execute())
    
    if len(isUserExists.data) == 0:
        # Create new user 
        new_user = {
            "user_id": user_id, 
            "name": name, 
            "avatar": avatar, 
            "points": 0,
        }
        supabase.table("users").insert(new_user).execute()

    return {"message": "User synchronized successfully"}
    
        
    
