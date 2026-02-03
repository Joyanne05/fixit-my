from fastapi import APIRouter, Form, File, UploadFile, Depends, HTTPException
from uuid import uuid4
from app.services.supabase_client import supabase
from app.dependencies.auth import get_current_user

router = APIRouter(
    prefix="/report",
)

@router.post("/create")
async def create_report(
    title: str = Form(...), 
    description: str = Form(...), 
    location: str = Form(...), 
    photo: UploadFile | None = File(None),
    user = Depends(get_current_user)
):
    photo_url = None 
    
    # Upload photo if provided 
    if photo: 
        file_ext = photo.filename.split(".")[-1]
        filename = f"{uuid4()}.{file_ext}"
        path = f"reports/{filename}"
        
        try: 
            content = await photo.read()
            # Upload photo to supabase bucket 
            supabase.storage.from_('report-photos').upload(path, content, {"content-type": photo.content_type})
            
            # Obtain image URL 
            image_url = supabase.storage.from_('report-photos').get_public_url(path)
        
        except Exception as e:
            print(f"Photo upload error: {str(e)}")
            raise HTTPException(status_code=500, detail="Photo upload failed")
    
    # Create report 
    result = supabase.table("reports").insert({
        "title": title, 
        "description": description, 
        "status": "open", 
        "created_by": user.id, 
        "closed_by": None,
        "location": location,
        "photo_url": image_url 
    }).execute()
    
    if not result.data: 
        raise HTTPException(status_code=500, detail="Report creation failed")
    
    # print("Created report: ", result.data)
    # print(result.data[0])
    # report = result.data[0]
    
    # Auto-follow own report 
    supabase.table("report_followers").insert({
        "report_id": report["report_id"], 
        "user_id": user.id
    }).execute()
            
        
    
    
    