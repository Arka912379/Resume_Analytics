from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
from app.middleware.error_handler import (
    global_exception_handler,
    http_exception_handler
)
from app.routes.ats import router as ats_router

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Welcome to the ML Server!"}

app.add_exception_handler(
    Exception,
    global_exception_handler
)

app.add_exception_handler(
    HTTPException,
    http_exception_handler
)

app.include_router(
    ats_router,
    prefix="/api/v3/ats",
)
