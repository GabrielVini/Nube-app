from pydantic import BaseModel, Field

class LoginEntrada(BaseModel):
    codigo: str = Field(pattern=r"^\d{4}$")
    senha: str = Field(min_length=8, max_length=128)

class RecuperacaoEntrada(BaseModel):
    codigo: str = Field(pattern=r"^\d{4}$")

class AlteracaoSenhaEntrada(BaseModel):
    nova_senha: str = Field(min_length=8, max_length=128)
