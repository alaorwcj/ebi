from app.core.db import SessionLocal
from app.models.user import User
db = SessionLocal()
user = db.query(User).filter(User.email == 'test@ebi.com').first()
print(repr(user.role))
print(type(user.role))
