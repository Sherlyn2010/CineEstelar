// ======== Datos Base ========
const horariosPorPelicula = {
  Guardianes: ["12:00", "15:30", "19:00"],
  Risas: ["13:00", "16:45", "20:15"]
};

const productos = [
  { id: 1, nombre: "Palomitas Grandes", precio: 60 },
  { id: 2, nombre: "Palomitas con Caramelo", precio: 70 },
  { id: 3, nombre: "Refresco Grande", precio: 40 },
  { id: 4, nombre: "Combo Nachos + Refresco", precio: 90 },
  { id: 5, nombre: "Chocolates", precio: 30 },
  { id: 6, nombre: "Gomitas", precio: 25 },
  { id: 7, nombre: "Hot Dog", precio: 50 },
  { id: 8, nombre: "Helado", precio: 35 },
  { id: 9, nombre: "Combo Pareja", precio: 130 },
  { id: 10, nombre: "Agua Natural", precio: 20 }
];

const precioBoleto = 50; // Precio por asiento

// Cupones válidos con descuento (ej: 0.5 = 50%)
const cuponesValidos = {
  "MIERCOLES2X1": 0.5,
  "DESCUENTO10": 0.10,
};

let descuento = 0;

document.addEventListener("DOMContentLoaded", () => {
  // ======== Reserva ========
  const peliculaSelect = document.getElementById("pelicula");
  const horarioSelect = document.getElementById("horario");
  const asientosContenedor = document.getElementById("asientos");
  const asientosSeccion = document.getElementById("asientos-container");

  if (peliculaSelect && horarioSelect) {
    peliculaSelect.addEventListener("change", () => {
      horarioSelect.innerHTML = "<option value=''>Selecciona</option>";
      const horarios = horariosPorPelicula[peliculaSelect.value] || [];
      horarios.forEach(h => {
        const option = document.createElement("option");
        option.textContent = h;
        option.value = h;
        horarioSelect.appendChild(option);
      });
      asientosSeccion.style.display = "none";
      asientosContenedor.innerHTML = "";
    });

    horarioSelect.addEventListener("change", () => {
      asientosSeccion.style.display = "block";
      asientosContenedor.innerHTML = "";
      for (let i = 1; i <= 50; i++) {
        const div = document.createElement("div");
        div.textContent = i;
        div.addEventListener("click", () => div.classList.toggle("seleccionado"));
        asientosContenedor.appendChild(div);
      }
    });

    document.getElementById("form-reserva").addEventListener("submit", e => {
      e.preventDefault();
      const pelicula = peliculaSelect.value;
      const horario = horarioSelect.value;
      const asientos = Array.from(document.querySelectorAll(".seleccionado")).map(d => d.textContent);
      if (!pelicula || !horario || asientos.length === 0) {
        alert("Por favor selecciona película, horario y al menos un asiento.");
        return;
      }
      localStorage.setItem("reserva", JSON.stringify({ pelicula, horario, asientos }));
      window.location.href = "snacks.html";
    });
  }

  // ======== Tienda ========
  const productosContenedor = document.getElementById("productos");
  if (productosContenedor) {
    let carrito = [];

    function actualizarTotal() {
      const totalSinDesc = carrito.reduce((suma, p) => suma + p.precio, 0);
      const totalConDesc = totalSinDesc * (1 - descuento);
      document.getElementById("total").textContent = totalConDesc.toFixed(2);
    }

    productos.forEach(p => {
      const div = document.createElement("div");
      div.className = "producto";
      div.innerHTML = `
        <h4>${p.nombre}</h4>
        <p>$${p.precio} MXN</p>
        <button>Agregar</button>
      `;
      div.querySelector("button").addEventListener("click", () => {
        carrito.push(p);
        actualizarTotal();
        localStorage.setItem("carrito", JSON.stringify(carrito));
      });
      productosContenedor.appendChild(div);
    });

    // Aplicar cupón
    document.getElementById("aplicar-cupon")?.addEventListener("click", () => {
      const codigo = document.getElementById("codigo-cupon").value.trim().toUpperCase();
      const mensaje = document.getElementById("mensaje-cupon");
      if (cuponesValidos[codigo]) {
        descuento = cuponesValidos[codigo];
        mensaje.textContent = `Cupón aplicado: ${(descuento * 100)}% de descuento!`;
        actualizarTotal();
      } else {
        descuento = 0;
        mensaje.textContent = "Cupón inválido o expirado.";
        actualizarTotal();
      }
    });

    document.getElementById("continuarCheckout").addEventListener("click", () => {
      if (carrito.length === 0) {
        if (!confirm("No has agregado ningún snack, ¿quieres continuar?")) return;
      }
      localStorage.setItem("carrito", JSON.stringify(carrito));
      localStorage.setItem("descuento", descuento);
      window.location.href = "checkout.html";
    });
  }

  // ======== Checkout ========
  const resumen = document.getElementById("resumen-compra");
  if (resumen) {
    const reserva = JSON.parse(localStorage.getItem("reserva") || "{}");
    const carrito = JSON.parse(localStorage.getItem("carrito") || "[]");
    descuento = parseFloat(localStorage.getItem("descuento")) || 0;

    if (!reserva.pelicula || !reserva.horario || !reserva.asientos) {
      resumen.innerHTML = "<p>No hay datos de reserva. Por favor vuelve a reservar.</p>";
      return;
    }

    let totalSnacks = 0;
    carrito.forEach(p => totalSnacks += p.precio);
    const precioBoletos = reserva.asientos.length * precioBoleto;
    const total = (totalSnacks + precioBoletos) * (1 - descuento);

    resumen.innerHTML = `
      <h3>Película: ${reserva.pelicula}</h3>
      <p>Horario: ${reserva.horario}</p>
      <p>Asientos: ${reserva.asientos.join(", ")}</p>
      <p><strong>Boletos:</strong> ${reserva.asientos.length} x $${precioBoleto} = $${precioBoletos}</p>
      <h4>Snacks:</h4>
      <ul>
        ${carrito.map(p => `<li>${p.nombre} - $${p.precio} MXN</li>`).join("")}
      </ul>
      <p>Descuento aplicado: ${(descuento * 100) || 0}%</p>
      <p><strong>Total: $${total.toFixed(2)} MXN</strong></p>
    `;

    document.getElementById("confirmarCompra").addEventListener("click", () => {
      localStorage.setItem("boleto", JSON.stringify({ ...reserva, total: total.toFixed(2) }));
      window.location.href = "boleto.html";
    });
  }

  // ======== Boleto ========
  const boleto = document.getElementById("boleto-generado");
  if (boleto) {
    const datos = JSON.parse(localStorage.getItem("boleto") || "{}");
    boleto.innerHTML = `
      <h3>🎫 Boleto Cine Estelar</h3>
      <p><strong>Película:</strong> ${datos.pelicula}</p>
      <p><strong>Horario:</strong> ${datos.horario}</p>
      <p><strong>Asientos:</strong> ${datos.asientos?.join(", ")}</p>
      <p><strong>Total:</strong> $${datos.total} MXN</p>
      <p>¡Gracias por tu compra!</p>
      <div id="qr" style="margin-top: 1rem;"></div>
    `;

    if (window.QRCode) {
      const qrContent = `Cine Estelar\nPelícula: ${datos.pelicula}\nHorario: ${datos.horario}\nAsientos: ${datos.asientos?.join(", ")}\nTotal: $${datos.total} MXN`;
      new QRCode(document.getElementById("qr"), {
        text: qrContent,
        width: 128,
        height: 128
      });
    }
  }
});

