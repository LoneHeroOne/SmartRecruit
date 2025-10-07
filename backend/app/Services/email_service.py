from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from pydantic import EmailStr
from ..config import settings

async def send_status_email(recipient: EmailStr, status: str, full_name: str):
    # Create connection config inside function to avoid module-level loading issues
    conf = ConnectionConfig(
        MAIL_USERNAME=settings.SMTP_USER,
        MAIL_PASSWORD=settings.SMTP_PASSWORD,
        MAIL_FROM=settings.EMAIL_FROM,
        MAIL_PORT=settings.SMTP_PORT,
        MAIL_SERVER=settings.SMTP_SERVER,
        MAIL_STARTTLS=True,
        MAIL_SSL_TLS=False,
        USE_CREDENTIALS=True
    )

    subject_map = {
        "accepted": "🎉 Votre candidature a été acceptée !",
        "rejected": "🔔 Mise à jour de votre candidature",
        "under_review": "📄 Votre candidature est en cours d'examen"
    }
    body_map = {
        "accepted": f"Bonjour {full_name},\n\nFélicitations ! Votre candidature a été retenue. Vous recevrez prochainement la date de l'entretien.",
        "rejected": f"Bonjour {full_name},\n\nNous vous remercions pour votre candidature. Après examen, nous ne pouvons pas donner suite favorablement.",
        "under_review": f"Bonjour {full_name},\n\nVotre candidature est actuellement en cours d'étude. Nous reviendrons vers vous prochainement."
    }

    msg = MessageSchema(
        subject=subject_map.get(status, "Mise à jour de votre candidature"),
        recipients=[recipient],
        body=body_map.get(status, ""),
        subtype="plain"
    )

    fm = FastMail(conf)
    await fm.send_message(msg)
