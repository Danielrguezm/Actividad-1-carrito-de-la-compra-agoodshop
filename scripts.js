console.log("JS cargado correctamente");

class Carrito {
    #total;
    #productosEnCarrito;

    constructor() {
        this.#total = 0;
        this.#productosEnCarrito = new Map();
    }

    calcularTotal() {
        this.#total = 0;
        for (const [key, value] of this.#productosEnCarrito.entries()) {
            this.#total += value.price * value.quantity;
        }
        return this.#total;
    }

    actualizarUnidades(sku, lineCompra) {
        if (lineCompra.quantity === 0 && this.#productosEnCarrito.has(sku)) {
            this.#productosEnCarrito.delete(sku);
        } else {
            this.#productosEnCarrito.set(sku, lineCompra);
        }
    }

    obtenerCarrito() {
        return {
            total: this.calcularTotal(),
            products: Array.from(this.#productosEnCarrito.values())
        };
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const miCarrito = new Carrito();
    let currency = "€";

    // Fetch a tu API
    fetch("https://api.mocki.io/v2/1udduvie")
        .then(response => response.json())
        .then(productos => {
            console.log("Productos de la API:", productos);
            currency = productos.currency;
            cargarTabla(productos.products);
        })
        .catch(error => console.error("Error al cargar la API:", error));

    function cargarTabla(misProductos) {
        const tabla = document.querySelector("#cuerpoTabla");

        misProductos.forEach(product => {
            const tr = document.createElement("tr");

            // Producto
            const tdProducto = document.createElement("td");
            tdProducto.innerHTML = `<strong class="tituloProducto">${product.title}</strong><br>REF: ${product.SKU}`;
            tr.appendChild(tdProducto);

            // Cantidad
            const tdCantidad = document.createElement("td");
            const divCantidad = document.createElement("div");
            divCantidad.className = "contenedorCantidad";

            const btnMenos = document.createElement("button");
            btnMenos.textContent = "-";
            btnMenos.className = "btn btn-danger btn-sm mx-1";

            const inputCantidad = document.createElement("input");
            inputCantidad.type = "number";
            inputCantidad.value = 0;
            inputCantidad.className = "form-control form-control-sm text-center";

            const btnMas = document.createElement("button");
            btnMas.textContent = "+";
            btnMas.className = "btn btn-success btn-sm mx-1";

            divCantidad.append(btnMenos, inputCantidad, btnMas);
            tdCantidad.appendChild(divCantidad);
            tr.appendChild(tdCantidad);

            // Precio unidad
            const tdPrecio = document.createElement("td");
            tdPrecio.textContent = product.price + currency;
            tr.appendChild(tdPrecio);

            // Total
            const tdTotal = document.createElement("td");
            tdTotal.id = "id_" + product.SKU;
            tdTotal.textContent = "0" + currency;
            tr.appendChild(tdTotal);

            tabla.appendChild(tr);

            // Función para actualizar línea y carrito
            const actualizarLinea = () => {
                let unidades = Number(inputCantidad.value);
                if (unidades < 0) unidades = 0;

                const line = {
                    SKU: product.SKU,
                    title: product.title,
                    price: product.price,
                    quantity: unidades
                };

                miCarrito.actualizarUnidades(product.SKU, line);
                tdTotal.textContent = (product.price * unidades).toFixed(2) + currency;

                // Actualizar total del carrito
                document.querySelector("#totalFinal").textContent = miCarrito.calcularTotal().toFixed(2) + currency;

                // Actualizar listado de productos en carrito
                const carritoDiv = document.querySelector("#productosCarrito");
                carritoDiv.innerHTML = "";
                miCarrito.obtenerCarrito().products.forEach(p => {
                    const divLinea = document.createElement("div");
                    divLinea.className = "lineaCompra";
                    divLinea.textContent = `${p.quantity} x ${p.title} - ${(p.price * p.quantity).toFixed(2)}${currency}`;
                    carritoDiv.appendChild(divLinea);
                });
            };

            btnMas.addEventListener("click", () => {
                inputCantidad.value = Number(inputCantidad.value) + 1;
                actualizarLinea();
            });

            btnMenos.addEventListener("click", () => {
                inputCantidad.value = Math.max(0, Number(inputCantidad.value) - 1);
                actualizarLinea();
            });

            inputCantidad.addEventListener("change", actualizarLinea);
        });
    }
});
