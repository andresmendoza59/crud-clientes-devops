from pathlib import Path

from fastapi import FastAPI, Response, status
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field


from .exceptions import (
    ClienteNoEncontradoError,
    ClienteYaExisteError,
    ValidacionClienteError,
)
from .models import Cliente
from .repository import ClienteRepository
from .service import ClienteService


class ClienteEntrada(BaseModel):
    nombre: str = Field(min_length=1, max_length=100)
    email: str = Field(min_length=5, max_length=254)


class ClienteRespuesta(BaseModel):
    id: int
    nombre: str
    email: str
    activo: bool


app = FastAPI(
    title="CRUD Clientes",
    description="API REST para la gestión de clientes",
    version="1.0.0",
)
PROJECT_ROOT = Path(__file__).resolve().parents[3]
FRONTEND_DIR = PROJECT_ROOT / "frontend"

app.mount(
    "/static",
    StaticFiles(directory=FRONTEND_DIR),
    name="static",
)

repository = ClienteRepository()
service = ClienteService(repository)


def convertir_cliente(cliente: Cliente) -> ClienteRespuesta:
    return ClienteRespuesta(
        id=cliente.id,
        nombre=cliente.nombre,
        email=cliente.email,
        activo=cliente.activo,
    )


@app.exception_handler(ClienteNoEncontradoError)
async def manejar_cliente_no_encontrado(
    _request,
    exception: ClienteNoEncontradoError,
) -> JSONResponse:
    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND,
        content={"detail": str(exception)},
    )


@app.exception_handler(ClienteYaExisteError)
async def manejar_cliente_duplicado(
    _request,
    exception: ClienteYaExisteError,
) -> JSONResponse:
    return JSONResponse(
        status_code=status.HTTP_409_CONFLICT,
        content={"detail": str(exception)},
    )


@app.exception_handler(ValidacionClienteError)
async def manejar_error_validacion(
    _request,
    exception: ValidacionClienteError,
) -> JSONResponse:
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"detail": str(exception)},
    )

@app.get("/", include_in_schema=False)
def mostrar_pagina_principal() -> FileResponse:
    return FileResponse(FRONTEND_DIR / "index.html")

@app.get("/health")
def verificar_salud() -> dict[str, str]:
    return {"status": "ok"}


@app.post(
    "/clientes",
    response_model=ClienteRespuesta,
    status_code=status.HTTP_201_CREATED,
)
def crear_cliente(datos: ClienteEntrada) -> ClienteRespuesta:
    cliente = service.crear_cliente(datos.nombre, datos.email)
    return convertir_cliente(cliente)


@app.get("/clientes", response_model=list[ClienteRespuesta])
def listar_clientes() -> list[ClienteRespuesta]:
    return [
        convertir_cliente(cliente)
        for cliente in service.listar_clientes()
    ]


@app.get(
    "/clientes/{cliente_id}",
    response_model=ClienteRespuesta,
)
def obtener_cliente(cliente_id: int) -> ClienteRespuesta:
    cliente = service.obtener_cliente(cliente_id)
    return convertir_cliente(cliente)


@app.put(
    "/clientes/{cliente_id}",
    response_model=ClienteRespuesta,
)
def actualizar_cliente(
    cliente_id: int,
    datos: ClienteEntrada,
) -> ClienteRespuesta:
    cliente = service.actualizar_cliente(
        cliente_id,
        datos.nombre,
        datos.email,
    )
    return convertir_cliente(cliente)


@app.delete(
    "/clientes/{cliente_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def eliminar_cliente(cliente_id: int) -> Response:
    service.eliminar_cliente(cliente_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)