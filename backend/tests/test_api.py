import pytest
from fastapi.testclient import TestClient

import clientes.api as api_module
from clientes.repository import ClienteRepository
from clientes.service import ClienteService


@pytest.fixture
def client(monkeypatch) -> TestClient:
    repository = ClienteRepository()
    service = ClienteService(repository)

    monkeypatch.setattr(api_module, "service", service)

    return TestClient(api_module.app)


def test_health_retorna_ok(client):
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_crear_cliente(client):
    response = client.post(
        "/clientes",
        json={
            "nombre": "Ana",
            "email": "ANA@MAIL.COM",
        },
    )

    assert response.status_code == 201

    cliente = response.json()
    assert cliente["id"] == 1
    assert cliente["nombre"] == "Ana"
    assert cliente["email"] == "ana@mail.com"
    assert cliente["activo"] is True


def test_listar_clientes(client):
    client.post(
        "/clientes",
        json={"nombre": "Ana", "email": "ana@mail.com"},
    )
    client.post(
        "/clientes",
        json={"nombre": "Luis", "email": "luis@mail.com"},
    )

    response = client.get("/clientes")

    assert response.status_code == 200
    assert len(response.json()) == 2


def test_obtener_cliente(client):
    creado = client.post(
        "/clientes",
        json={"nombre": "Ana", "email": "ana@mail.com"},
    ).json()

    response = client.get(f"/clientes/{creado['id']}")

    assert response.status_code == 200
    assert response.json()["nombre"] == "Ana"


def test_obtener_cliente_inexistente(client):
    response = client.get("/clientes/999")

    assert response.status_code == 404
    assert response.json() == {
        "detail": "No existe cliente con id 999"
    }


def test_crear_cliente_duplicado(client):
    datos = {
        "nombre": "Ana",
        "email": "ana@mail.com",
    }

    client.post("/clientes", json=datos)

    response = client.post(
        "/clientes",
        json={
            "nombre": "Otra Ana",
            "email": " ANA@MAIL.COM ",
        },
    )

    assert response.status_code == 409


def test_crear_cliente_con_email_invalido(client):
    response = client.post(
        "/clientes",
        json={
            "nombre": "Ana",
            "email": "correo-invalido",
        },
    )

    assert response.status_code == 400
    assert response.json() == {
        "detail": "El email no tiene un formato válido"
    }


def test_actualizar_cliente(client):
    creado = client.post(
        "/clientes",
        json={"nombre": "Ana", "email": "ana@mail.com"},
    ).json()

    response = client.put(
        f"/clientes/{creado['id']}",
        json={
            "nombre": "Ana María",
            "email": "ANAMARIA@MAIL.COM",
        },
    )

    assert response.status_code == 200
    assert response.json()["nombre"] == "Ana María"
    assert response.json()["email"] == "anamaria@mail.com"


def test_eliminar_cliente(client):
    creado = client.post(
        "/clientes",
        json={"nombre": "Ana", "email": "ana@mail.com"},
    ).json()

    response = client.delete(f"/clientes/{creado['id']}")

    assert response.status_code == 204

    consulta = client.get(f"/clientes/{creado['id']}")
    assert consulta.status_code == 404