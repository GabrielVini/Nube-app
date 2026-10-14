# Configuração da autenticação

O portal possui somente os usuários `1001` a `1006`. As configurações locais ficam no arquivo `.env`, que não deve ser enviado ao GitHub.

## Alterar o e-mail administrativo

Edite `ADMIN_EMAIL` no arquivo `backend/.env` e reinicie o backend. Esse campo é o destinatário das recuperações de senha.

## Ativar o Gmail

1. Ative a verificação em duas etapas na conta Google.
2. Crie uma senha de app para o portal.
3. Preencha no `.env`:

```env
MAIL_ENABLED=true
MAIL_PROVIDER=gmail
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=estagionube015@gmail.com
SMTP_PASSWORD=senha-de-app-gerada-pelo-google
```

## Trocar para Outlook

O restante do sistema e o banco não mudam. Atualize o provedor e as credenciais no `.env`. Contas Outlook/Microsoft 365 podem exigir OAuth2 e o registro do portal no Microsoft Entra; essa integração fica isolada no arquivo `app/mailer.py`.

## Senhas iniciais

As seis senhas temporárias estão em `INITIAL_PASSWORD_1001` até `INITIAL_PASSWORD_1006`. Elas são usadas apenas quando cada conta é criada pela primeira vez. Alterar esses valores depois não substitui automaticamente uma senha já modificada pelo usuário.

## Atualizar o banco

Dentro da pasta `backend`, execute:

```powershell
.\.venv\Scripts\python.exe -m alembic -c alembic.ini upgrade head
```
