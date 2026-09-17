from .exceptions import (
    ClienteNoEncontradoError,
    ClienteYaExisteError,
    ValidacionClienteError,
)
from .models import Cliente
from .repository import ClienteRepository


class ClienteService:
    def __init__(self, repository: ClienteRepository) -> None:
        self.repository = repository
        self._ultimo_id = 0

    def crear_cliente(self, nombre: str, email: str) -> Cliente:
        nombre_limpio = nombre.strip()
        email_normalizado = email.strip().lower()

        self._validar_nombre(nombre_limpio)
        self._validar_email(email_normalizado)

        if self.repository.obtener_por_email(email_normalizado) is not None:
            raise ClienteYaExisteError(
                f"Ya existe un cliente con email {email_normalizado}"
            )

        self._ultimo_id += 1
        cliente = Cliente(
            id=self._ultimo_id,
            nombre=nombre_limpio,
            email=email_normalizado,
        )
        return self.repository.guardar(cliente)

    def obtener_cliente(self, cliente_id: int) -> Cliente:
        cliente = self.repository.obtener_por_id(cliente_id)
        if cliente is None:
            raise ClienteNoEncontradoError(
                f"No existe cliente con id {cliente_id}"
            )
        return cliente

    def listar_clientes(self) -> list[Cliente]:
        return self.repository.listar()

    def actualizar_cliente(
        self,
        cliente_id: int,
        nombre: str,
        email: str,
    ) -> Cliente:
        cliente = self.obtener_cliente(cliente_id)

        nombre_limpio = nombre.strip()
        email_normalizado = email.strip().lower()

        self._validar_nombre(nombre_limpio)
        self._validar_email(email_normalizado)

        existente = self.repository.obtener_por_email(email_normalizado)
        if existente is not None and existente.id != cliente_id:
            raise ClienteYaExisteError(
                f"Ya existe un cliente con email {email_normalizado}"
            )

        cliente.nombre = nombre_limpio
        cliente.email = email_normalizado
        return self.repository.guardar(cliente)

    def eliminar_cliente(self, cliente_id: int) -> bool:
        eliminado = self.repository.eliminar(cliente_id)
        if not eliminado:
            raise ClienteNoEncontradoError(
                f"No existe cliente con id {cliente_id}"
            )
        return True

    @staticmethod
    def _validar_nombre(nombre: str) -> None:
        if not nombre or not nombre.strip():
            raise ValidacionClienteError("El nombre es obligatorio")

    @staticmethod
    def _validar_email(email: str) -> None:
        if not email or not email.strip():
            raise ValidacionClienteError("El email es obligatorio")
        if "@" not in email or "." not in email:
            raise ValidacionClienteError(
                "El email no tiene un formato válido"
            )
