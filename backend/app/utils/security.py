import bcrypt
import hashlib

def _pre_hash(password: str) -> bytes:
    # Use SHA256 to ensure password fits within bcrypt's 72-byte limit
    # and return bytes as bcrypt expects bytes
    return hashlib.sha256(password.encode('utf-8')).hexdigest().encode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        hashed_bytes = hashed_password.encode('utf-8')
        
        # 1. Try checking against pre-hashed (New standard for this app)
        if bcrypt.checkpw(_pre_hash(plain_password), hashed_bytes):
            return True
        
        # 2. Fallback: Try checking raw password (Legacy/Standard bcrypt)
        # This allows passwords hashed by other tools/old versions to work
        # STRICT LIMIT: Only if password is < 72 bytes to avoid ValueError
        if len(plain_password.encode('utf-8')) < 72:
            if bcrypt.checkpw(plain_password.encode('utf-8'), hashed_bytes):
                return True
        
        return False
    except Exception as e:
        print(f"Verification error: {e}")
        return False

def get_password_hash(password: str) -> str:
    # bcrypt.hashpw returns bytes, we decode to store as string
    return bcrypt.hashpw(_pre_hash(password), bcrypt.gensalt()).decode('utf-8')
