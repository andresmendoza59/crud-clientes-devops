from clientes.models import Cliente
from clientes.repository import ClienteRepository


def test_guardar_y_obtener_por_id():
    # Arrange
    repository = ClienteRepository()
    cliente = Cliente(id=1, nombre="Ana", email="ana@mail.com")

    # Act
    repository.guardar(cliente)
    resultado = repository.obtener_por_id(1)

    # Assert
    assert resultado == cliente


def test_obtener_por_email_retorna_cliente():
    # Arrange
    repository = ClienteRepository()
    cliente = Cliente(id=1, nombre="Luis", email="luis@mail.com")
    repository.guardar(cliente)

    # Act
    resultado = repository.obtener_por_email("luis@mail.com")

    # Assert
    assert resultado == cliente


def test_listar_retorna_todos_los_clientes():
    # Arrange
    repository = ClienteRepository()
    repository.guardar(Cliente(id=1, nombre="Ana", email="ana@mail.com"))
    repository.guardar(Cliente(id=2, nombre="Luis", email="luis@mail.com"))

    # Act
    resultado = repository.listar()

    # Assert
    assert len(resultado) == 2


def test_eliminar_cliente_existente_retorna_true():
    # Arrange
    repository = ClienteRepository()
    repository.guardar(Cliente(id=1, nombre="Ana", email="ana@mail.com"))

    # Act
    resultado = repository.eliminar(1)

    # Assert
    assert resultado is True
    assert repository.obtener_por_id(1) is None


def test_eliminar_cliente_inexistente_retorna_false():
    # Arrange
    repository = ClienteRepository()

    # Act
    resultado = repository.eliminar(999)

    # Assert
    assert resultado is False
