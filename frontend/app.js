const formulario = document.querySelector("#formulario-cliente");
const clienteId = document.querySelector("#cliente-id");
const nombre = document.querySelector("#nombre");
const email = document.querySelector("#email");
const tabla = document.querySelector("#tabla-clientes");
const mensaje = document.querySelector("#mensaje");
const listaVacia = document.querySelector("#lista-vacia");
const tituloFormulario = document.querySelector("#titulo-formulario");
const botonGuardar = document.querySelector("#boton-guardar");
const botonCancelar = document.querySelector("#boton-cancelar");
const botonActualizar = document.querySelector("#boton-actualizar");

function mostrarMensaje(texto, tipo = "") {
    mensaje.textContent = texto;
    mensaje.className = `mensaje ${tipo}`;
}

async function solicitar(url, opciones = {}) {
    const respuesta = await fetch(url, opciones);

    if (respuesta.status === 204) {
        return null;
    }

    const contenido = await respuesta.json();

    if (!respuesta.ok) {
        const detalle = Array.isArray(contenido.detail)
            ? "Revise los datos ingresados."
            : contenido.detail;

        throw new Error(detalle || "No fue posible completar la operación.");
    }

    return contenido;
}

function crearCelda(texto) {
    const celda = document.createElement("td");
    celda.textContent = texto;
    return celda;
}

function prepararEdicion(cliente) {
    clienteId.value = cliente.id;
    nombre.value = cliente.nombre;
    email.value = cliente.email;

    tituloFormulario.textContent = "Editar cliente";
    botonGuardar.textContent = "Guardar cambios";
    botonCancelar.classList.remove("oculto");
    mostrarMensaje("");

    nombre.focus();
}

async function eliminarCliente(id) {
    const confirmado = window.confirm(
        "¿Desea eliminar este cliente?"
    );

    if (!confirmado) {
        return;
    }

    try {
        await solicitar(`/clientes/${id}`, {
            method: "DELETE",
        });

        mostrarMensaje("Cliente eliminado correctamente.", "exito");
        await cargarClientes();
    } catch (error) {
        mostrarMensaje(error.message, "error");
    }
}

function crearAcciones(cliente) {
    const celda = document.createElement("td");
    const contenedor = document.createElement("div");
    const botonEditar = document.createElement("button");
    const botonEliminar = document.createElement("button");

    contenedor.className = "acciones-tabla";

    botonEditar.type = "button";
    botonEditar.className = "secundario pequeno";
    botonEditar.textContent = "Editar";
    botonEditar.addEventListener(
        "click",
        () => prepararEdicion(cliente),
    );

    botonEliminar.type = "button";
    botonEliminar.className = "peligro pequeno";
    botonEliminar.textContent = "Eliminar";
    botonEliminar.addEventListener(
        "click",
        () => eliminarCliente(cliente.id),
    );

    contenedor.append(botonEditar, botonEliminar);
    celda.append(contenedor);

    return celda;
}

function mostrarClientes(clientes) {
    tabla.replaceChildren();
    listaVacia.classList.toggle("oculto", clientes.length > 0);

    clientes.forEach((cliente) => {
        const fila = document.createElement("tr");
        const estado = document.createElement("span");
        const celdaEstado = document.createElement("td");

        estado.className = "estado-activo";
        estado.textContent = cliente.activo ? "Activo" : "Inactivo";
        celdaEstado.append(estado);

        fila.append(
            crearCelda(cliente.id),
            crearCelda(cliente.nombre),
            crearCelda(cliente.email),
            celdaEstado,
            crearAcciones(cliente),
        );

        tabla.append(fila);
    });
}

async function cargarClientes() {
    try {
        const clientes = await solicitar("/clientes");
        mostrarClientes(clientes);
    } catch (error) {
        mostrarMensaje(error.message, "error");
    }
}

function limpiarFormulario() {
    formulario.reset();
    clienteId.value = "";
    tituloFormulario.textContent = "Registrar cliente";
    botonGuardar.textContent = "Guardar cliente";
    botonCancelar.classList.add("oculto");
}

formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    mostrarMensaje("");

    const id = clienteId.value;
    const datos = {
        nombre: nombre.value.trim(),
        email: email.value.trim(),
    };

    try {
        if (id) {
            await solicitar(`/clientes/${id}`, {
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(datos),
            });

            mostrarMensaje(
                "Cliente actualizado correctamente.",
                "exito",
            );
        } else {
            await solicitar("/clientes", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(datos),
            });

            mostrarMensaje(
                "Cliente registrado correctamente.",
                "exito",
            );
        }

        limpiarFormulario();
        await cargarClientes();
    } catch (error) {
        mostrarMensaje(error.message, "error");
    }
});

botonCancelar.addEventListener("click", () => {
    limpiarFormulario();
    mostrarMensaje("");
});

botonActualizar.addEventListener("click", cargarClientes);

cargarClientes();