from typing import Dict, List, Optional

from .models import Cliente


class ClienteRepository:
    def __init__(self) -> None:
        self._clientes: Dict[int, Cliente] = {}

    def guardar(self, cliente: Cliente) -> Cliente:
        self._clientes[cliente.id] = cliente
        return cliente

    def obtener_por_id(self, cliente_id: int) -> Optional[Cliente]:
        return self._clientes.get(cliente_id)

    def obtener_por_email(self, email: str) -> Optional[Cliente]:
        for cliente in self._clientes.values():
            if cliente.email == email:
                return cliente
        return None

    def listar(self) -> List[Cliente]:
        return list(self._clientes.values())

    def eliminar(self, cliente_id: int) -> bool:
        if cliente_id in self._clientes:
            del self._clientes[cliente_id]
            return True
        return False