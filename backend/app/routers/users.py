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