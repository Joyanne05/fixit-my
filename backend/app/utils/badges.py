from app.services.supabase_client import supabase

def get_badge_id(badge_name: str):
    try:
        # Assuming the column is badge_id based on error report
        result = supabase.table("badges").select("badge_id").eq("badge_name", badge_name).single().execute()
        return result.data["badge_id"]
    except Exception as e:
        print(f"Error fetching badge id for {badge_name}: {str(e)}")
        return None

def award_badges(user_id: str):
    # 1️⃣ FIRST_REPORT
    user_reports = supabase.table("user_actions").select("*").eq("user_id", user_id).eq("action_name", "CREATE_REPORT").execute()
    if user_reports.data and len(user_reports.data) >= 1:
        badge_id = get_badge_id("FIRST_REPORT")
        if badge_id:
            supabase.table("user_badges").upsert({
                "user_id": user_id,
                "badge_id": badge_id
            }, on_conflict="user_id,badge_id").execute()

    # 2️⃣ HELPER - verify 10 community issues
    verify_count = supabase.table("user_actions").select("*").eq("user_id", user_id).eq("action_name", "VERIFY_CLOSED").execute()
    if verify_count.data and len(verify_count.data) >= 10:
        badge_id = get_badge_id("HELPER")
        if badge_id:
            supabase.table("user_badges").upsert({
                "user_id": user_id,
                "badge_id": badge_id
            }, on_conflict="user_id,badge_id").execute()

    # 3️⃣ RESOLVER - closed 5 reports
    closed_count = supabase.table("user_actions").select("*").eq("user_id", user_id).eq("action_name", "MARK_CLOSED").execute()
    if closed_count.data and len(closed_count.data) >= 5:
        badge_id = get_badge_id("RESOLVER")
        if badge_id:
            supabase.table("user_badges").upsert({
                "user_id": user_id,
                "badge_id": badge_id
            }, on_conflict="user_id,badge_id").execute()
