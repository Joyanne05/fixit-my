from fastapi import Depends, HTTPException, Header
from typing import Optional
from app.services.supabase_client import supabase
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    token = credentials.credentials

    try:
        res = supabase.auth.get_user(token)
    except Exception as e:
        print(f"Supabase error {str(e)}" )
        raise HTTPException(status_code=401, detail="Token verification failed")

    if not res or not res.user:
        raise HTTPException(status_code=401, detail="Invalid user")

    return res.user

async def get_optional_user(authorization: Optional[str] = Header(None)):
    if not authorization:
        return None  # user not logged in

    if not authorization.startswith("Bearer "):
        return None  # invalid token, treat as anonymous

    token = authorization.replace("Bearer ", "")

    try:
        res = supabase.auth.get_user(token)
        user = res.user
    except Exception as e:
        print(f"Supabase token error: {e}")
        return None  # treat as anonymous

    return user

