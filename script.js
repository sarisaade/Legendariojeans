// Función para agregar productos al carrito
document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', (event) => {
        const productId = button.getAttribute('data-id');
        const productName = button.getAttribute('data-name');
        const productPrice = parseFloat(button.getAttribute('data-price'));
        const productSize = document.querySelector(`#talle-${productId}`).value;
        const productQuantity = parseInt(document.querySelector(`#cantidad-${productId}`).value);

        if (!productSize) {
            alert("Por favor, selecciona un talle.");
            return;
        }

        // Crear objeto del producto
        const product = {
            id: productId,
            name: productName,
            price: productPrice,
            size: productSize,
            quantity: productQuantity
        };

        // Obtener el carrito del localStorage (o crear uno vacío si no existe)
        let cart = JSON.parse(localStorage.getItem('cart')) || [];

        // Verificar si el producto ya está en el carrito
        const existingProductIndex = cart.findIndex(item => item.id === productId && item.size === productSize);

        if (existingProductIndex !== -1) {
            // Si ya existe, actualizamos la cantidad
            cart[existingProductIndex].quantity += productQuantity;
        } else {
            // Si no existe, lo agregamos al carrito
            cart.push(product);
        }

        // Guardar el carrito actualizado en localStorage
        localStorage.setItem('cart', JSON.stringify(cart));

        // Actualizar el total del carrito
        updateCartTotal();
    });
});

// Función para actualizar el total del carrito
function updateCartTotal() {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let total = cart.reduce((sum, product) => sum + (product.price * product.quantity), 0);
    document.querySelector('.cart-total').textContent = total.toFixed(2);
}

// Mostrar los productos del carrito en la página del carrito
window.onload = function() {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartItemsContainer = document.querySelector('.cart-items');
    const cartTotalContainer = document.querySelector('.cart-total');

    if (cart.length > 0) {
        cartItemsContainer.innerHTML = ''; // Limpiar contenido previo
        let total = 0;

        cart.forEach(product => {
            const productElement = document.createElement('div');
            productElement.classList.add('cart-item');
            const productTotal = product.price * product.quantity;
            total += productTotal;

            productElement.innerHTML = `
                <p>${product.name} - Talle: ${product.size} x ${product.quantity}</p>
                <p>Precio: $${productTotal.toFixed(2)}</p>
            `;
            cartItemsContainer.appendChild(productElement);
        });

        // Actualizar el total del carrito
        cartTotalContainer.textContent = total.toFixed(2);
    } else {
        cartItemsContainer.innerHTML = '<p>No hay productos en el carrito.</p>';
    }
};

// Vaciar carrito
document.querySelector('.clear-cart').addEventListener('click', () => {
    localStorage.removeItem('cart');
    document.querySelector('.cart-items').innerHTML = '<p>No hay productos en el carrito.</p>';
    updateCartTotal();
});