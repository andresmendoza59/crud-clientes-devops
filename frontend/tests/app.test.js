import {beforeAll, describe, expect, it, vi} from "vitest";

const clientesIniciales = [
    {
        id: 1,
        nombre: "Ana Ramírez",
        email: "ana@mail.com",
        activo: true,
    },
];

function crearRespuesta(contenido, estado = 200) {
    return {
        status: estado,
        ok: estado >= 200 && estado < 300,
        json: async () => contenido,
    };
}

describe("interfaz de gestión de clientes", () => {
    beforeAll(async () => {
        document.body.innerHTML = `
            <form id="formulario-cliente">
                <input id="cliente-id">
                <input id="nombre">
                <input id="email">
                <button id="boton-guardar" type="submit"></button>
                <button id="boton-cancelar" type="button"></button>
            </form>

            <h2 id="titulo-formulario"></h2>
            <button id="boton-actualizar" type="button"></button>
            <p id="mensaje"></p>
            <p id="lista-vacia"></p>
            <table>
                <tbody id="tabla-clientes"></tbody>
            </table>
        `;

        vi.stubGlobal(
            "fetch",
            vi.fn().mockResolvedValue(
                crearRespuesta(clientesIniciales),
            ),
        );

        await import("../app.js");
    });

    it("consulta y muestra los clientes registrados", async () => {
        await vi.waitFor(() => {
            expect(fetch).toHaveBeenCalledWith(
                "/clientes",
                {},
            );
        });

        const tabla = document.querySelector("#tabla-clientes");

        expect(tabla.textContent).toContain("Ana Ramírez");
        expect(tabla.textContent).toContain("ana@mail.com");
        expect(tabla.textContent).toContain("Activo");
    });

    it("prepara el formulario para editar un cliente", () => {
        const botonEditar = document.querySelector(
            ".acciones-tabla button",
        );

        botonEditar.click();

        expect(document.querySelector("#cliente-id").value).toBe("1");
        expect(document.querySelector("#nombre").value).toBe(
            "Ana Ramírez",
        );
        expect(document.querySelector("#email").value).toBe(
            "ana@mail.com",
        );
        expect(
            document.querySelector("#titulo-formulario").textContent,
        ).toBe("Editar cliente");
    });
});