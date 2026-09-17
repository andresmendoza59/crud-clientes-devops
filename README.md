# CRUD Clientes DevOps

API REST para la gestión de clientes desarrollada con Python y FastAPI. El proyecto incorpora pruebas automatizadas, cobertura, análisis estático con SonarQube, Quality Gate, integración continua con Jenkins y despliegue mediante Docker.

## Funcionalidades

- Crear clientes.
- Consultar todos los clientes.
- Consultar un cliente por identificador.
- Actualizar clientes.
- Eliminar clientes.
- Validar nombres y correos electrónicos.
- Evitar registros con correos duplicados.
- Verificar el estado de la aplicación.

## Tecnologías

- Python 3.13
- FastAPI
- Uvicorn
- Pytest
- Pytest-cov
- SonarQube
- PostgreSQL
- Jenkins
- Docker

## Estructura del proyecto

```text
crud-clientes-devops/
├── src/
│   └── clientes/
│       ├── api.py
│       ├── exceptions.py
│       ├── models.py
│       ├── repository.py
│       └── service.py
├── tests/
│   ├── test_api.py
│   ├── test_repository.py
│   └── test_service.py
├── jenkins-image/
│   └── Dockerfile
├── Dockerfile
├── Jenkinsfile
├── pytest.ini
├── requirements.txt
└── sonar-project.properties
```

## Crear el entorno virtual

```powershell
python -m venv .venv
```

## Activar el entorno en Windows PowerShell

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy RemoteSigned
.\.venv\Scripts\Activate.ps1
```

## Instalar dependencias

```powershell
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

## Ejecutar las pruebas

```powershell
python -m pytest
```

El proyecto contiene 26 pruebas automatizadas.

## Ejecutar pruebas con cobertura

La configuración de cobertura se encuentra en `pytest.ini`. Para ejecutar las pruebas y generar `coverage.xml`:

```powershell
python -m pytest
```

La cobertura actual es aproximadamente del 99 % y el mínimo exigido es del 90 %.

## Ejecutar la API localmente

```powershell
python -m uvicorn clientes.api:app `
    --host 127.0.0.1 `
    --port 8000 `
    --app-dir src
```

Servicios disponibles:

- API: http://localhost:8000
- Estado: http://localhost:8000/health
- Swagger UI: http://localhost:8000/docs
- OpenAPI: http://localhost:8000/openapi.json

## Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/health` | Verificar el estado de la API |
| POST | `/clientes` | Crear un cliente |
| GET | `/clientes` | Listar clientes |
| GET | `/clientes/{cliente_id}` | Consultar un cliente |
| PUT | `/clientes/{cliente_id}` | Actualizar un cliente |
| DELETE | `/clientes/{cliente_id}` | Eliminar un cliente |

## Ejemplo de creación de un cliente

```powershell
$clienteJson = @{
    nombre = "Ana Ramírez"
    email  = "ana@mail.com"
} | ConvertTo-Json -Compress

$clienteUtf8 = [System.Text.Encoding]::UTF8.GetBytes($clienteJson)

Invoke-RestMethod `
    -Method Post `
    -Uri "http://localhost:8000/clientes" `
    -ContentType "application/json; charset=utf-8" `
    -Body $clienteUtf8
```

## Construir la imagen Docker

```powershell
docker build -t crud-clientes-api .
```

## Ejecutar la aplicación con Docker

```powershell
docker run -d `
    --name crud-clientes-api-container `
    --restart unless-stopped `
    -p 8000:8000 `
    crud-clientes-api
```

Verificar el contenedor:

```powershell
docker ps --filter "name=crud-clientes-api-container"
docker inspect crud-clientes-api-container --format '{{.State.Health.Status}}'
```

## Integración con SonarQube

El análisis utiliza:

```text
Project key: crud-clientes-devops
SonarQube URL: http://localhost:9000
```

El token de SonarQube se almacena como credencial secreta en Jenkins y no debe incluirse en el repositorio.

El pipeline envía a SonarQube:

- Código fuente.
- Pruebas.
- Cobertura.
- Resultados del análisis estático.
- Estado del Quality Gate.

## Pipeline de Jenkins

El `Jenkinsfile` ejecuta las siguientes etapas:

1. Verificación del entorno.
2. Instalación de dependencias.
3. Pruebas y cobertura.
4. Análisis con SonarQube.
5. Validación del Quality Gate.
6. Construcción de la imagen Docker.
7. Despliegue del contenedor.
8. Verificación de salud.

La construcción y el despliegue solamente continúan cuando las pruebas y el Quality Gate son aprobados.

## Servicios del entorno DevOps

| Servicio | Dirección |
|---|---|
| API | http://localhost:8000 |
| Swagger UI | http://localhost:8000/docs |
| Jenkins | http://localhost:8080 |
| SonarQube | http://localhost:9000 |

## Autor

Gabriel Mauricio Ramírez Villegas