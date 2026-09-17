from dataclasses import dataclass


@dataclass
class Cliente:
    id: int
    nombre: str
    email: str
    activo: bool = True
