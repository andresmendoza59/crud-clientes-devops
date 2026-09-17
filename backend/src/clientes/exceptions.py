class ClienteError(Exception):
    """Excepción base del módulo de clientes."""


class ClienteYaExisteError(ClienteError):
    """Se lanza cuando ya existe un cliente con el mismo email."""


class ClienteNoEncontradoError(ClienteError):
    """Se lanza cuando no se encuentra el cliente solicitado."""


class ValidacionClienteError(ClienteError):
    """Se lanza cuando los datos del cliente no son válidos."""
