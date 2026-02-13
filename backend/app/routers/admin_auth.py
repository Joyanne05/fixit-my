from fastapi import APIRouter, Depends, HTTPException, status
from app.services.supabase_client import supabase
from app.schemas.admin_schema import AdminLoginRequest, Token
from app.utils.security import verify_password, get_password_hash
from uuid import uuid4

router = APIRouter(prefix="/admin/auth", tags=["Admin Auth"])

# Simple in-memory session store
# { "token_uuid": "admin_email" }
ADMIN_SESSIONS = {}

@router.post("/login")
async def login(form_data: AdminLoginRequest):
    # 1. Fetch admin by email
    try:
        response = supabase.table("admins").select("*").eq("email", form_data.email).single().execute()
        admin = response.data
    except Exception as e:
        print(f"Error fetching admin: {e}")
        raise HTTPException(status_code=400, detail="Invalid credentials")

    if not admin:
        raise HTTPException(status_code=400, detail="Invalid credentials")

    if not verify_password(form_data.password, admin["password_hash"]):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    # 2. Generate Simple Token
    token = str(uuid4())
    ADMIN_SESSIONS[token] = admin["email"]
    
    return {"access_token": token, "token_type": "bearer"}

def get_admin_session(token: str):
    return ADMIN_SESSIONS.get(token)

@router.post("/setup-seed", include_in_schema=False)
async def seed_admin(form_data: AdminLoginRequest):
    res = supabase.table("admins").select("*").eq("email", form_data.email).execute()
    if res.data:
        return {"message": "Admin already exists"}
    
    hashed_pw = get_password_hash(form_data.password)
    supabase.table("admins").insert({
        "email": form_data.email,
        "password_hash": hashed_pw
    }).execute()
    
    return {"message": "Admin created"}
