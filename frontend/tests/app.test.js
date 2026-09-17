import {
    afterEach,
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from "vitest";

const clienteActivo = {
    id: 1,
    nombre: "Ana Ramírez",
    email: "ana@mail.com",
    activo: true,
};

const clienteInactivo = {
    id: 2,
    nombre: "Luis Pérez",
    email: "luis@mail.com",
    activo: false,
};

function crearRespuesta(contenido, estado = 200) {
    return {
        status: estado,
        ok: estado >= 200 && estado < 300,
        json: async () => contenido,
    };
}

function crearRespuestaSinContenido() {
    return {
        status: 204,
        ok: true,
    };
}

function obtener(selector) {
    return document.querySelector(selector);
}

function construirDocumento() {
    document.body.innerHTML = `
        <form id="formulario-cliente">
            <input id="cliente-id">
            <input id="nombre">
            <input id="email">

            <button id="boton-guardar" type="submit">
                Guardar cliente
            </button>

            <button
                id="boton-cancelar"
                class="oculto"
                type="button"
            >
                Cancelar
            </button>
        </form>

        <h2 id="titulo-formulario">
            Registrar cliente
        </h2>

        <button id="boton-actualizar" type="button">
            Actualizar
        </button>

        <p id="mensaje"></p>
        <p id="lista-vacia" class="oculto"></p>

        <table>
            <tbody id="tabla-clientes"></tbody>
        </table>
    `;
}

async function iniciarAplicacion(clientes = []) {
    fetch.mockResolvedValueOnce(
        crearRespuesta(clientes),
    );

    const modulo = await import("../app.js");

    await vi.waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
            "/clientes",
            {},
        );
    });

    return modulo;
}

function enviarFormulario() {
    obtener("#formulario-cliente").dispatchEvent(
        new Event("submit", {
            bubbles: true,
            cancelable: true,
        }),
    );
}

describe("interfaz de gestión de clientes", () => {
    beforeEach(() => {
        vi.resetModules();
        construirDocumento();

        vi.stubGlobal("fetch", vi.fn());
        vi.spyOn(window, "confirm").mockReturnValue(false);
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
        document.body.innerHTML = "";
    });

    it("consulta y muestra los clientes registrados", async () => {
        // Arrange
        const clientes = [clienteActivo];

        // Act
        await iniciarAplicacion(clientes);

        // Assert
        const contenido = obtener(
            "#tabla-clientes",
        ).textContent;

        expect(contenido).toContain("Ana Ramírez");
        expect(contenido).toContain("ana@mail.com");
        expect(contenido).toContain("Activo");
    });

    it("muestra clientes activos e inactivos", async () => {
        // Arrange
        const app = await iniciarAplicacion([]);
        const clientes = [
            clienteActivo,
            clienteInactivo,
        ];

        // Act
        app.mostrarClientes(clientes);

        // Assert
        const contenido = obtener(
            "#tabla-clientes",
        ).textContent;

        expect(contenido).toContain("Activo");
        expect(contenido).toContain("Inactivo");
        expect(
            obtener("#lista-vacia").classList.contains(
                "oculto",
            ),
        ).toBe(true);
    });

    it("muestra el estado vacío sin clientes", async () => {
        // Arrange
        const app = await iniciarAplicacion([]);

        // Act
        app.mostrarClientes([]);

        // Assert
        expect(
            obtener("#tabla-clientes").children,
        ).toHaveLength(0);

        expect(
            obtener("#lista-vacia").classList.contains(
                "oculto",
            ),
        ).toBe(false);
    });

    it("procesa una respuesta JSON exitosa", async () => {
        // Arrange
        const app = await iniciarAplicacion([]);
        fetch.mockReset();
        fetch.mockResolvedValueOnce(
            crearRespuesta(clienteActivo),
        );

        // Act
        const resultado = await app.solicitar(
            "/clientes/1",
        );

        // Assert
        expect(resultado).toEqual(clienteActivo);
        expect(fetch).toHaveBeenCalledWith(
            "/clientes/1",
            {},
        );
    });

    it("procesa una respuesta 204", async () => {
        // Arrange
        const app = await iniciarAplicacion([]);
        fetch.mockReset();
        fetch.mockResolvedValueOnce(
            crearRespuestaSinContenido(),
        );

        // Act
        const resultado = await app.solicitar(
            "/clientes/1",
            {method: "DELETE"},
        );

        // Assert
        expect(resultado).toBeNull();
    });

    it("procesa errores de validación", async () => {
        // Arrange
        const app = await iniciarAplicacion([]);
        fetch.mockReset();
        fetch.mockResolvedValueOnce(
            crearRespuesta(
                {
                    detail: [
                        {
                            msg: "Dato inválido",
                        },
                    ],
                },
                422,
            ),
        );

        // Act
        const operacion = app.solicitar(
            "/clientes",
            {method: "POST"},
        );

        // Assert
        await expect(operacion).rejects.toThrow(
            "Revise los datos ingresados.",
        );
    });

    it("procesa un error con detalle", async () => {
        // Arrange
        const app = await iniciarAplicacion([]);
        fetch.mockReset();
        fetch.mockResolvedValueOnce(
            crearRespuesta(
                {
                    detail: "El cliente ya existe.",
                },
                409,
            ),
        );

        // Act
        const operacion = app.solicitar(
            "/clientes",
        );

        // Assert
        await expect(operacion).rejects.toThrow(
            "El cliente ya existe.",
        );
    });

    it("usa un mensaje predeterminado sin detalle", async () => {
        // Arrange
        const app = await iniciarAplicacion([]);
        fetch.mockReset();
        fetch.mockResolvedValueOnce(
            crearRespuesta({}, 500),
        );

        // Act
        const operacion = app.solicitar(
            "/clientes",
        );

        // Assert
        await expect(operacion).rejects.toThrow(
            "No fue posible completar la operación.",
        );
    });

    it("prepara el formulario para editar", async () => {
        // Arrange
        await iniciarAplicacion([clienteActivo]);
        const botonEditar = obtener(
            ".acciones-tabla button",
        );

        // Act
        botonEditar.click();

        // Assert
        expect(obtener("#cliente-id").value).toBe("1");
        expect(obtener("#nombre").value).toBe(
            "Ana Ramírez",
        );
        expect(obtener("#email").value).toBe(
            "ana@mail.com",
        );
        expect(
            obtener("#titulo-formulario").textContent,
        ).toBe("Editar cliente");
        expect(
            obtener("#boton-guardar").textContent,
        ).toBe("Guardar cambios");
    });

    it("cancela y limpia la edición", async () => {
        // Arrange
        await iniciarAplicacion([clienteActivo]);
        obtener(".acciones-tabla button").click();

        // Act
        obtener("#boton-cancelar").click();

        // Assert
        expect(obtener("#cliente-id").value).toBe("");
        expect(obtener("#nombre").value).toBe("");
        expect(obtener("#email").value).toBe("");
        expect(
            obtener("#titulo-formulario").textContent,
        ).toBe("Registrar cliente");
        expect(
            obtener("#boton-cancelar").classList.contains(
                "oculto",
            ),
        ).toBe(true);
    });

    it("registra un cliente", async () => {
        // Arrange
        await iniciarAplicacion([]);
        fetch.mockReset();

        obtener("#nombre").value = "Carlos";
        obtener("#email").value = "carlos@mail.com";

        fetch
            .mockResolvedValueOnce(
                crearRespuesta(
                    {
                        id: 3,
                        nombre: "Carlos",
                        email: "carlos@mail.com",
                        activo: true,
                    },
                    201,
                ),
            )
            .mockResolvedValueOnce(
                crearRespuesta([]),
            );

        // Act
        enviarFormulario();

        // Assert
        await vi.waitFor(() => {
            expect(
                obtener("#mensaje").textContent,
            ).toBe(
                "Cliente registrado correctamente.",
            );
        });

        expect(fetch.mock.calls[0][0]).toBe(
            "/clientes",
        );
        expect(fetch.mock.calls[0][1].method).toBe(
            "POST",
        );
        expect(
            JSON.parse(fetch.mock.calls[0][1].body),
        ).toEqual({
            nombre: "Carlos",
            email: "carlos@mail.com",
        });
    });

    it("actualiza un cliente", async () => {
        // Arrange
        await iniciarAplicacion([]);
        fetch.mockReset();

        obtener("#cliente-id").value = "1";
        obtener("#nombre").value = "Ana María";
        obtener("#email").value =
            "anamaria@mail.com";

        fetch
            .mockResolvedValueOnce(
                crearRespuesta({
                    ...clienteActivo,
                    nombre: "Ana María",
                    email: "anamaria@mail.com",
                }),
            )
            .mockResolvedValueOnce(
                crearRespuesta([]),
            );

        // Act
        enviarFormulario();

        // Assert
        await vi.waitFor(() => {
            expect(
                obtener("#mensaje").textContent,
            ).toBe(
                "Cliente actualizado correctamente.",
            );
        });

        expect(fetch.mock.calls[0][0]).toBe(
            "/clientes/1",
        );
        expect(fetch.mock.calls[0][1].method).toBe(
            "PUT",
        );
    });

    it("muestra un error al guardar", async () => {
        // Arrange
        await iniciarAplicacion([]);
        fetch.mockReset();

        obtener("#nombre").value = "Ana";
        obtener("#email").value =
            "correo-invalido";

        fetch.mockResolvedValueOnce(
            crearRespuesta(
                {
                    detail: "Correo inválido.",
                },
                400,
            ),
        );

        // Act
        enviarFormulario();

        // Assert
        await vi.waitFor(() => {
            expect(
                obtener("#mensaje").textContent,
            ).toBe("Correo inválido.");
        });

        expect(
            obtener("#mensaje").classList.contains(
                "error",
            ),
        ).toBe(true);
    });

    it("cancela una eliminación no confirmada", async () => {
        // Arrange
        await iniciarAplicacion([clienteActivo]);
        fetch.mockReset();
        window.confirm.mockReturnValueOnce(false);

        const botones = document.querySelectorAll(
            ".acciones-tabla button",
        );

        // Act
        botones[1].click();

        // Assert
        expect(window.confirm).toHaveBeenCalledOnce();
        expect(fetch).not.toHaveBeenCalled();
    });

    it("elimina un cliente confirmado", async () => {
        // Arrange
        await iniciarAplicacion([clienteActivo]);
        fetch.mockReset();
        window.confirm.mockReturnValueOnce(true);

        fetch
            .mockResolvedValueOnce(
                crearRespuestaSinContenido(),
            )
            .mockResolvedValueOnce(
                crearRespuesta([]),
            );

        const botones = document.querySelectorAll(
            ".acciones-tabla button",
        );

        // Act
        botones[1].click();

        // Assert
        await vi.waitFor(() => {
            expect(
                obtener("#mensaje").textContent,
            ).toBe(
                "Cliente eliminado correctamente.",
            );
        });

        expect(fetch.mock.calls[0][0]).toBe(
            "/clientes/1",
        );
        expect(fetch.mock.calls[0][1]).toEqual({
            method: "DELETE",
        });
    });

    it("muestra un error al eliminar", async () => {
        // Arrange
        await iniciarAplicacion([clienteActivo]);
        fetch.mockReset();
        window.confirm.mockReturnValueOnce(true);

        fetch.mockResolvedValueOnce(
            crearRespuesta(
                {
                    detail: "No fue posible eliminar.",
                },
                500,
            ),
        );

        const botones = document.querySelectorAll(
            ".acciones-tabla button",
        );

        // Act
        botones[1].click();

        // Assert
        await vi.waitFor(() => {
            expect(
                obtener("#mensaje").textContent,
            ).toBe(
                "No fue posible eliminar.",
            );
        });

        expect(
            obtener("#mensaje").classList.contains(
                "error",
            ),
        ).toBe(true);
    });

    it("muestra un error al cargar clientes", async () => {
        // Arrange
        const app = await iniciarAplicacion([]);
        fetch.mockReset();

        fetch.mockResolvedValueOnce(
            crearRespuesta(
                {
                    detail: "No fue posible consultar.",
                },
                500,
            ),
        );

        // Act
        await app.cargarClientes();

        // Assert
        expect(
            obtener("#mensaje").textContent,
        ).toBe("No fue posible consultar.");
        expect(
            obtener("#mensaje").classList.contains(
                "error",
            ),
        ).toBe(true);
    });

    it("actualiza manualmente la lista", async () => {
        // Arrange
        await iniciarAplicacion([]);
        fetch.mockReset();

        fetch.mockResolvedValueOnce(
            crearRespuesta([clienteInactivo]),
        );

        // Act
        obtener("#boton-actualizar").click();

        // Assert
        await vi.waitFor(() => {
            expect(
                obtener("#tabla-clientes").textContent,
            ).toContain("Luis Pérez");
        });
    });
});