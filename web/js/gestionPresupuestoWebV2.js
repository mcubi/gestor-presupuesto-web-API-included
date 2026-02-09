// js/gestionPresupuestoWebV2.js
// Cliente web V2 del Gestor de gastos con API REST y selección de usuario

import * as gestion from "./gestionPresupuesto.js";

// ==============================
// CONFIGURACIÓN API
// ==============================
const API_BASE = "http://localhost:3000";
let usuarioActual = null;

// ==============================
// REFERENCIAS DOM
// ==============================
let divTotal = document.getElementById("total");
let divForm = document.getElementById("formcreacion");
let divLista = document.getElementById("listado");

// ==============================
// FORMULARIO DE USUARIO
// ==============================
function crearFormularioUsuario() {
  const form = document.createElement("form");
  form.id = "form-usuario";

  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Nombre de usuario";
  input.required = true;

  const boton = document.createElement("button");
  boton.type = "submit";
  boton.textContent = "Cargar gastos";

  form.append(input, boton);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    usuarioActual = input.value.trim();
    if (!usuarioActual) return;

    cargarGastosDesdeAPI();
  });

  divTotal.before(form);
}

// ==============================
// CARGAR GASTOS DESDE API (GET)
// ==============================
async function cargarGastosDesdeAPI() {
  if (!usuarioActual) return;

  try {
    const resp = await fetch(`${API_BASE}/${usuarioActual}`);
    const datos = await resp.json();

    const reconstruidos = datos.map((g) => {
      const gasto = new gestion.CrearGasto(
        g.descripcion,
        g.valor,
        g.fecha,
        ...(g.etiquetas || []),
      );
      gasto.id = g.id;
      return gasto;
    });

    gestion.setListadoGastos(reconstruidos);
    pintarGastosWeb();
  } catch (error) {
    console.error(error);
    alert("Error al cargar los gastos");
  }
}

// ==============================
// WEB COMPONENT <mi-gasto>
// ==============================
class MiGasto extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    this.shadowRoot.innerHTML = `
      <style>
        :host { display:block; border:1px solid #ddd; padding:0.6rem; margin:0.5rem 0; border-radius:8px; }
        .fila { display:flex; justify-content:space-between; gap:0.5rem; }
        .acciones button { margin-left:0.4rem; }
        .editar-form { display:none; margin-top:0.5rem; }
        .visible { display:block; }
      </style>

      <div class="fila">
        <div>
          <span class="descripcion"></span>
          <span class="valor"></span>
          <span class="fecha"></span>
          <div class="etiquetas"></div>
        </div>
        <div class="acciones">
          <button class="btn-editar">Editar</button>
          <button class="btn-borrar">Borrar</button>
        </div>
      </div>

      <form class="editar-form">
        <input name="valor" type="number" step="0.01" required />
        <input name="descripcion" type="text" required />
        <input name="fecha" type="date" />
        <input name="etiquetas" type="text" />
        <button type="submit">Guardar</button>
        <button type="button" class="btn-cancelar">Cancelar</button>
      </form>
    `;

    this.$descripcion = this.shadowRoot.querySelector(".descripcion");
    this.$valor = this.shadowRoot.querySelector(".valor");
    this.$fecha = this.shadowRoot.querySelector(".fecha");
    this.$etiquetas = this.shadowRoot.querySelector(".etiquetas");
    this.$form = this.shadowRoot.querySelector(".editar-form");

    this.shadowRoot
      .querySelector(".btn-borrar")
      .addEventListener("click", () => {
        if (confirm("¿Borrar gasto?")) {
          this.dispatchEvent(
            new CustomEvent("gasto-borrar", {
              detail: { id: this._gasto.id },
              bubbles: true,
              composed: true,
            }),
          );
        }
      });

    this.shadowRoot
      .querySelector(".btn-editar")
      .addEventListener("click", () => {
        this.$form.classList.toggle("visible");
      });

    this.shadowRoot
      .querySelector(".btn-cancelar")
      .addEventListener("click", () => {
        this.$form.classList.remove("visible");
      });

    this.$form.addEventListener("submit", (e) => {
      e.preventDefault();
      const f = e.target.elements;

      this.dispatchEvent(
        new CustomEvent("gasto-editar", {
          detail: {
            gasto: {
              id: this._gasto.id,
              descripcion: f.descripcion.value,
              valor: parseFloat(f.valor.value),
              fecha: f.fecha.value
                ? Date.parse(f.fecha.value)
                : this._gasto.fecha,
              etiquetas: f.etiquetas.value.trim().split(/\s+/).filter(Boolean),
            },
          },
          bubbles: true,
          composed: true,
        }),
      );

      this.$form.classList.remove("visible");
    });
  }

  set gasto(g) {
    this._gasto = g;
    this.$descripcion.textContent = g.descripcion;
    this.$valor.textContent = ` ${g.valor} €`;
    this.$fecha.textContent = new Date(g.fecha).toLocaleDateString();
    this.$etiquetas.textContent = (g.etiquetas || []).join(", ");

    const f = this.$form.elements;
    f.descripcion.value = g.descripcion;
    f.valor.value = g.valor;
    f.fecha.value = new Date(g.fecha).toISOString().slice(0, 10);
    f.etiquetas.value = (g.etiquetas || []).join(" ");
  }
}

customElements.define("mi-gasto", MiGasto);

// ==============================
// FORMULARIO CREACIÓN GASTO (POST)
// ==============================
function crearFormularioCreacion() {
  const form = document.createElement("form");

  form.innerHTML = `
    <input name="valor" type="number" step="0.01" placeholder="Valor" required />
    <input name="descripcion" type="text" placeholder="Descripción" required />
    <input name="fecha" type="date" />
    <input name="etiquetas" type="text" placeholder="etiquetas" />
    <button>Crear</button>
  `;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!usuarioActual) {
      alert("Introduce un usuario primero");
      return;
    }

    const f = e.target.elements;

    fetch(`${API_BASE}/${usuarioActual}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        descripcion: f.descripcion.value,
        valor: parseFloat(f.valor.value),
        fecha: f.fecha.value ? Date.parse(f.fecha.value) : Date.now(),
        etiquetas: f.etiquetas.value.trim().split(/\s+/).filter(Boolean),
      }),
    }).then(() => {
      form.reset();
      cargarGastosDesdeAPI();
    });
  });

  divForm.appendChild(form);
}

// ==============================
// PINTAR LISTA Y TOTAL
// ==============================
function pintarGastosWeb() {
  divLista.innerHTML = "";

  for (let g of gestion.listarGastos()) {
    const nodo = document.createElement("mi-gasto");
    nodo.gasto = g;
    divLista.appendChild(nodo);
  }

  divTotal.textContent = `Total gastos: ${gestion.calcularTotalGastos()} €`;
}

// ==============================
// EVENTOS EDITAR / BORRAR (PUT / DELETE)
// ==============================
divLista.addEventListener("gasto-borrar", (e) => {
  fetch(`${API_BASE}/${usuarioActual}/${e.detail.id}`, {
    method: "DELETE",
  }).then(cargarGastosDesdeAPI);
});

divLista.addEventListener("gasto-editar", (e) => {
  const g = e.detail.gasto;

  fetch(`${API_BASE}/${usuarioActual}/${g.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(g),
  }).then(cargarGastosDesdeAPI);
});

// ==============================
// INICIALIZACIÓN
// ==============================
crearFormularioUsuario();
crearFormularioCreacion();
