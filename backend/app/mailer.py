import smtplib
from email.message import EmailMessage
from .settings import settings

class EmailDeliveryError(RuntimeError):
    pass

def send_temporary_password(code: str, temporary_password: str) -> None:
    if not settings.mail_enabled:
        raise EmailDeliveryError("O envio de e-mail ainda não foi configurado.")
    if not settings.smtp_username or not settings.smtp_password:
        raise EmailDeliveryError("As credenciais do serviço de e-mail não foram configuradas.")

    message = EmailMessage()
    message["Subject"] = f"Nobe Estágios - recuperação do acesso {code}"
    message["From"] = settings.smtp_username
    message["To"] = settings.admin_email
    message.set_content(
        "Foi solicitada a recuperação de acesso ao portal Nobe Estágios.\n\n"
        f"Usuário: {code}\n"
        f"Senha temporária: {temporary_password}\n\n"
        "Entregue a senha ao funcionário por um canal interno seguro. "
        "A senha deverá ser alterada depois do acesso."
    )
    try:
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=15) as server:
            server.starttls()
            server.login(settings.smtp_username, settings.smtp_password)
            server.send_message(message)
    except (OSError, smtplib.SMTPException) as exc:
        raise EmailDeliveryError("Não foi possível enviar o e-mail de recuperação.") from exc
