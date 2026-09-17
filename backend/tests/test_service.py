import pytest

from clientes.exceptions import (
    ClienteNoEncontradoError,
    ClienteYaExisteError,
    ValidacionClienteError,
)
from clientes.repository import ClienteRepository
from clientes.service import ClienteService


@pytest.fixture
def service():
    repository = ClienteRepository()
    return ClienteService(repository)


def test_crear_cliente_ok(service):
    # Arrange
    nombre = "Ana"
    email = "ana@mail.com"

    # Act
    cliente = service.crear_cliente(nombre, email)

    # Assert
    assert cliente.id == 1
    assert cliente.nombre == "Ana"
    assert cliente.email == "ana@mail.com"
    assert cliente.activo is True


def test_crear_cliente_con_email_duplicado_lanza_error(service):
    # Arrange
    service.crear_cliente("Ana", "ana@mail.com")

    # Act / Assert
    with pytest.raises(ClienteYaExisteError):
        service.crear_cliente("Otra Ana", "ana@mail.com")


def test_crear_cliente_con_nombre_vacio_lanza_error(service):
    # Arrange
    nombre = "   "
    email = "ana@mail.com"

    # Act / Assert
    with pytest.raises(ValidacionClienteError):
        service.crear_cliente(nombre, email)


def test_crear_cliente_con_email_invalido_lanza_error(service):
    # Arrange
    nombre = "Ana"
    email = "ana-mail.com"

    # Act / Assert
    with pytest.raises(ValidacionClienteError):
        service.crear_cliente(nombre, email)


def test_obtener_cliente_existente(service):
    # Arrange
    creado = service.crear_cliente("Ana", "ana@mail.com")

    # Act
    resultado = service.obtener_cliente(creado.id)

    # Assert
    assert resultado.id == creado.id
    assert resultado.nombre == "Ana"


def test_obtener_cliente_inexistente_lanza_error(service):
    # Act / Assert
    with pytest.raises(ClienteNoEncontradoError):
        service.obtener_cliente(99)


def test_listar_clientes(service):
    # Arrange
    service.crear_cliente("Ana", "ana@mail.com")
    service.crear_cliente("Luis", "luis@mail.com")

    # Act
    resultado = service.listar_clientes()

    # Assert
    assert len(resultado) == 2


def test_actualizar_cliente_ok(service):
    # Arrange
    cliente = service.crear_cliente("Ana", "ana@mail.com")

    # Act
    actualizado = service.actualizar_cliente(cliente.id, "Ana Maria", "anamaria@mail.com")

    # Assert
    assert actualizado.nombre == "Ana Maria"
    assert actualizado.email == "anamaria@mail.com"


def test_actualizar_cliente_inexistente_lanza_error(service):
    # Act / Assert
    with pytest.raises(ClienteNoEncontradoError):
        service.actualizar_cliente(200, "Ana", "ana@mail.com")


def test_actualizar_cliente_con_email_duplicado_lanza_error(service):
    # Arrange
    cliente_1 = service.crear_cliente("Ana", "ana@mail.com")
    service.crear_cliente("Luis", "luis@mail.com")

    # Act / Assert
    with pytest.raises(ClienteYaExisteError):
        service.actualizar_cliente(cliente_1.id, "Ana", "luis@mail.com")


def test_eliminar_cliente_ok(service):
    # Arrange
    cliente = service.crear_cliente("Ana", "ana@mail.com")

    # Act
    resultado = service.eliminar_cliente(cliente.id)

    # Assert
    assert resultado is True


def test_eliminar_cliente_inexistente_lanza_error(service):
    # Act / Assert
    with pytest.raises(ClienteNoEncontradoError):
        service.eliminar_cliente(999)
