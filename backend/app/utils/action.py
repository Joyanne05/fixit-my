from app.services.supabase_client import supabase
from app.utils.badges import award_badges

ACTION_POINTS = {
    "CREATE_REPORT": 10,
    "FOLLOW_REPORT": 2,
    "COMMENT_REPORT": 2,
    "MARK_IN_PROGRESS": 5,
    "MARK_CLOSED": 5,
    "VERIFY_CLOSED": 5
}

def record_user_action(user_id: str, action_name: str, report_id: str | None = None):
    points = ACTION_POINTS.get(action_name, 0)
    
    # Insert into user_actions
    action_res = supabase.table("user_actions").insert({
        "user_id": user_id,
        "action_name": action_name,
        "report_id": report_id
    }).execute()

    action_id = action_res.data[0]["id"] 

    # Insert into user_points
    supabase.table("user_points").insert({
        "user_id": user_id,
        "action_id": action_id,
        "points": points
    }).execute()

    # Get current points
    res = supabase.table("users").select("points").eq("user_id", user_id).execute()
    current_points = res.data[0]["points"] if res.data else 0

    # Increment
    new_points = current_points + points

    # Update
    supabase.table("users").update({"points": new_points}).eq("user_id", user_id).execute()

    # Award badges
    award_badges(user_id)

