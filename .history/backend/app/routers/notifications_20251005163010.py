from fastapi import APIRouter, HTTPException
from pydantic import EmailStr
from ..Services.email_service import send_status_email

router = APIRouter()

@router.post("/test/email")
async def test_email(
    recipient: EmailStr = "test@example.com",
    status: str = "accepted",
    full_name: str = "Test User"
):
    """
    Test email functionality by sending a status email.
    Query params: recipient, status (accepted/rejected/under_review), full_name
    """
    if status not in ["accepted", "rejected", "under_review"]:
        raise HTTPException(status_code=400, detail="Invalid status")

    try:
        await send_status_email(recipient, status, full_name)
        return {"message": "Test email sent successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send email: {str(e)}")
