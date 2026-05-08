from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse, FileResponse
from sqlalchemy.orm import Session
import validators
import os

from app.database import engine, Base, get_db
from app import models, schemas, utils

Base.metadata.create_all(bind=engine)

app = FastAPI(title="URL Shortener API")

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve Frontend Files
@app.get("/")
def serve_index():
    return FileResponse("frontend/index.html")

@app.get("/style.css")
def serve_css():
    return FileResponse("frontend/style.css")

@app.get("/script.js")
def serve_js():
    return FileResponse("frontend/script.js")

@app.post("/api/shorten", response_model=schemas.URLInfo)
def create_short_url(url_data: schemas.URLCreate, db: Session = Depends(get_db)):
    if not validators.url(url_data.url):
        raise HTTPException(status_code=422, detail="Invalid URL provided")

    db_url = db.query(models.URLItem).filter(models.URLItem.original_url == url_data.url).first()
    if db_url:
        return schemas.URLInfo(
            short_code=db_url.short_code,
            short_url="", 
            original_url=db_url.original_url,
            click_count=db_url.click_count,
            created_at=db_url.created_at
        )

    short_code = utils.generate_short_code()
    while db.query(models.URLItem).filter(models.URLItem.short_code == short_code).first():
        short_code = utils.generate_short_code()

    db_item = models.URLItem(
        original_url=url_data.url,
        short_code=short_code
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)

    return schemas.URLInfo(
        short_code=db_item.short_code,
        short_url="", 
        original_url=db_item.original_url,
        click_count=db_item.click_count,
        created_at=db_item.created_at
    )

@app.get("/{short_code}")
def redirect_to_original(short_code: str, db: Session = Depends(get_db)):
    db_url = db.query(models.URLItem).filter(models.URLItem.short_code == short_code).first()
    if db_url:
        db_url.click_count += 1
        db.commit()
        return RedirectResponse(url=db_url.original_url, status_code=302)
    raise HTTPException(status_code=404, detail="Short URL not found")
