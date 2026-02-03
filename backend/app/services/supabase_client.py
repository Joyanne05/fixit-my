import os
from dotenv import load_dotenv

load_dotenv()
from supabase import create_client, Client

supabase: Client = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY")  
)
