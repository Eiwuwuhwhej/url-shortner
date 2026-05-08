from pydantic import BaseModel
from datetime import datetime

class URLCreate(BaseModel):
    url: str

class URLInfo(BaseModel):
    short_code: str
    short_url: str
    original_url: str
    click_count: int
    created_at: datetime

    class Config:
        from_attributes = True
