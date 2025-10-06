/*
    Clase Carrito: constructor vacio
*/
class Carrito{

    //Atributos encapsulados
    #total;
    #productosEnCarrito;


    /*
        Costructor: se le pasa como parametros la coleccion de productos
    */
    constructor(){
        this.#total = 0;
        this.#productosEnCarrito = new Map();
    }

    /*
        Calcular el total del carrito
    */
    calcularTotal(){
        this.#total = 0;
        for (const [key, value] of this.#productosEnCarrito.entries()) 
        {
            this.#total = this.#total + (value.price * value.quantity);
        }

        return this.#total;
    }


    /*
        Actualiza el número de unidades que se quieren comprar de un producto
    */
    actualizarUnidades(sku, lineCompra) {
        //Comprobamos si las unidades son 0 y si existe el elemento en el carrito
        //En tal caso lo eliminamos del carrito, así no aparecera por pantalla
        if(lineCompra.quantity === 0 && this.#productosEnCarrito.has(sku))
        {
            this.#productosEnCarrito.delete(sku);
        }
        else
        {
            this.#productosEnCarrito.set(sku, lineCompra);
        }
    }
  
    
    /*
        Devuelve los datos de un producto además de las unidades seleccionadas
    */
    obtenerInformacionProducto(sku) {
        let producto = undefined;
        if(this.#productosEnCarrito.has(sku))
        {
            producto = this.#productosEnCarrito.get(sku);
        }
        return producto;
    }
  

    /* 
        Devuelve información de los productos añadidos al carrito.
        Además del total calculado de todos los productos 
    */
    obtenerCarrito() {
        
        const productosParaComprar = [];

        for (const [key, value] of this.#productosEnCarrito.entries()) 
        {
            productosParaComprar.push(value);
        }

        const carrito = {
            total: this.calcularTotal(),
            products: productosParaComprar
        }

        return carrito;
    }
}
// Finaliza Clase Carrtio  *******************************************************************************************************



//Variable globales para cargar los productos de la API y el tipo de moneda
var misProducts;
var currency;

document.addEventListener("DOMContentLoaded", ()=> {

    //Objeto de la clase carrito
    const miCarrito = new Carrito();


    /*
        Funcion para cargar los producto y llamar a la funcion rellena la tabla --> cargarTabla
    */
    const cargarProductos = (productos) => {
        misProducts = productos.products;
        currency = productos.currency;
        cargarTabla(misProducts);
    }

    
    /*
        Funcion para calcular y pintar el carrito
    */
    const actualizarTotal = function() {
        //Obtendo el div para insertar los productos y ademas borro todos los hijos que tenia para repintar todos
        const carritoProductos = document.querySelector("#productosCarrito");

        while (carritoProductos.firstChild) 
        {
            carritoProductos.removeChild(carritoProductos.firstChild);
        }

        //Obtendo el elemento donde se muestra el total y lo pinto
        const carrito = miCarrito.obtenerCarrito();
        const totalSum = document.querySelector("#totalFinal");
        totalSum.textContent = carrito.total.toFixed([2])+currency;


        //Por cada elemento del carrito, crearemos un div y dos span para mostrarlo en la pantalla
        carrito.products.forEach(
            pro => {
                    //Se crea el div y se le asigna la clase del estilo
                    const lineaCompra = document.createElement('div');
                    lineaCompra.className = "lineaCompra";

                    // Se crea el primer span y se añade al div
                    const descrip = document.createElement('span');
                    descrip.textContent = pro.quantity + " x  " + pro.title;
                    console.log(descrip.textContent);
                    lineaCompra.append(descrip);

                    // Se crea el segundo span y se añade al div
                    const precioCantidad = document.createElement('span');
                    precioCantidad.textContent = pro.quantity + " x  " + pro.price+currency;
                    lineaCompra.append(precioCantidad);

                    //Se añade el div al contenedor padre
                    carritoProductos.append(lineaCompra);
                }
        );
    };


    /*
        Funcion para pintar la tabla de productos
    */
    const cargarTabla = (misProductos) => {
        const tablaProductos = document.querySelector("#cuerpoTabla");
        
        misProductos.forEach(product => {
            
            //Añadimos un div que contiene dos elementos p, con la información
            const productoTd = document.createElement('td');
            const divTitulo = document.createElement('div');
            const titulo = document.createElement('p');
            titulo.textContent = product.title;
            titulo.className = "tituloProducto";
            const ref = document.createElement('p');
            ref.textContent = "REF: "+ product.SKU;
            divTitulo.append(titulo);
            divTitulo.append(ref);
            productoTd.append(divTitulo);

            //Añadimos el div, para poder contener los botones y el input
            let unidades = 0;
            const cantidadTd = document.createElement('td');
            const divCantidad = document.createElement('div');
            divCantidad.className = "contenedorCantidad";

            //Creacion del boton +
            const masButton = document.createElement('button');
            masButton.textContent = "+";

            //Evento click boton +
            masButton.addEventListener("click", () => {
                // Realizamos comprobaciones de tipo y valor para el corrento funcionamiento del input
                if(Number.isInteger(unidades) && unidades >= 0){

                    unidades++;
                }
                else{
                    unidades = 1;
                }
                
                cantidadInput.value = unidades;
                const lineCompra = {
                    SKU: product.SKU,
                    title: product.title,
                    price: product.price,
                    quantity: unidades
                }

                //Llamo a miCarrito para actualizar unidades, busco el campo del total de la tr y calculo su valor
                miCarrito.actualizarUnidades(product.SKU, lineCompra);
                const totalLinea = document.querySelector("#id_"+product.SKU);
                let total = Number(product.price * unidades).toFixed([2]);
                totalLinea.textContent = total + currency;
                actualizarTotal();

            });

            //Creacion del boton -
            const menosButton = document.createElement('button');
            menosButton.textContent = "-";

            //Evento click del boton -
            menosButton.addEventListener("click", () =>{
                if(unidades > 0){
                    unidades--;
                    cantidadInput.value = unidades;
                    const lineCompra = {
                        SKU: product.SKU,
                        title: product.title,
                        price: product.price,
                        quantity: unidades
                    }
                    miCarrito.actualizarUnidades(product.SKU, lineCompra);
                    const totalLinea = document.querySelector("#id_"+product.SKU);
                    let total = Number(product.price * unidades).toFixed([2]);
                    totalLinea.textContent = total + currency;
                    actualizarTotal();
                } else if( !Number.isInteger(unidades)){
                    //Si unidades no es del tipo number ponemos el input a vacio00000001
                    cantidadInput.value = "";

                }  
            });

            //Creacion del componente input
            const cantidadInput = document.createElement('input');
            cantidadInput.value = unidades;

            //Evento change del input
            cantidadInput.addEventListener("change", () =>{
                if(Number.isInteger(unidades)){

                    unidades = Number(cantidadInput.value);
                    console.log("REF: "+ product.SKU + "   x " + unidades);
                    if(unidades >= 0){
                        const lineCompra = {
                            SKU: product.SKU,
                            title: product.title,
                            price: product.price,
                            quantity: unidades
                        }
                        
                        miCarrito.actualizarUnidades(product.SKU, lineCompra);
        
                        const totalLinea = document.querySelector("#id_"+product.SKU);
                        let total = Number(product.price * unidades).toFixed([2]);
                        totalLinea.textContent = total + currency;
                        actualizarTotal();
                    }
                }

            });

            //Se añaden al contenedor div los 3 componentes
            divCantidad.append(menosButton);
            divCantidad.append(cantidadInput);
            divCantidad.append(masButton);

            //Se añade el div al TD cantidad
            cantidadTd.append(divCantidad);

            //Se crea el elemento TD con el total de las unidades seleccionas del producto
            const precioTd = document.createElement('td');
            precioTd.innerText = product.price + currency;
            const totalTd = document.createElement('td');
            totalTd.id = "id_"+product.SKU;
            totalTd.innerText = "0" + currency;

            //Se crea el elemento row de la tabla y se le añaden todos los elementos TD
            const tr = document.createElement('tr');
            tr.append(productoTd);
            tr.append(cantidadTd);
            tr.append(precioTd);
            tr.append(totalTd);

            //Se añade al Tbody el elemento row
            tablaProductos.append(tr);   
        });

    }


    //Obtenemos mediante el fecth los datos de la API
    fetch("https://jsonblob.com/api/1421811651841286144")
    .then(response => response.json())
    .then(productos => {
        cargarProductos(productos);
    });

});
