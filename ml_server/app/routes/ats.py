from fastapi import APIRouter

from app.model.ats_request import ATSRequest
from app.service.ats_service import calculate_ats_score


router = APIRouter(tags=["ATS"])


@router.post("/score", response_model=float)
def get_ats_score(request: ATSRequest) -> float:
    """Calculate an ATS score from a resume and a job description."""
    return calculate_ats_score(
        resume_text=request.resume_text,
        job_description=request.job_description,
    )
