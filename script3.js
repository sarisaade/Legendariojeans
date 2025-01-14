document.addEventListener('DOMContentLoaded', function() {
    // Inicializar EmailJS con la Public Key
    emailjs.init("z5kLRgpEiDGYL4lhx");

    // Función para mostrar notificación de producto agregado
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 2000);
    }

    // Función para agregar producto al carrito
    function addToCart(productId, productName, productPrice, productTalle, productQuantity) {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const product = {
            id: productId,
            name: productName,
            price: productPrice,
            talle: productTalle,
            quantity: productQuantity
        };
        const existingProduct = cart.find(item => item.id === productId && item.talle === productTalle);

        if (existingProduct) {
            existingProduct.quantity += productQuantity;
        } else {
            cart.push(product);
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        displayCart();
        showNotification('Producto agregado al carrito');
    }

    // Función para eliminar una unidad del producto del carrito
    function removeFromCart(productId, productTalle) {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existingProduct = cart.find(item => item.id === productId && item.talle === productTalle);
        if (existingProduct) {
            existingProduct.quantity -= 1;
            if (existingProduct.quantity <= 0) {
                cart = cart.filter(item => !(item.id === productId && item.talle === productTalle));
            }
            localStorage.setItem('cart', JSON.stringify(cart));
            displayCart();
        }
    }

    // Función para mostrar los productos en el carrito
    function displayCart() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const cartContainer = document.querySelector('.cart-items');
        cartContainer.innerHTML = '';
        cart.forEach(product => {
            const listItem = document.createElement('div');
            listItem.classList.add('cart-item');
            listItem.innerHTML = `
                <button class="decrease-quantity" data-id="${product.id}" data-talle="${product.talle}">-</button>
                <p>${product.quantity} x ${product.name} (Talle: ${product.talle}) - Precio: $${(product.price * product.quantity).toFixed(2)}</p>
                <button class="increase-quantity" data-id="${product.id}" data-talle="${product.talle}">+</button>
            `;
            cartContainer.appendChild(listItem);
        });
        updateCartTotal();

        // Añadir funcionalidad a los botones de eliminación y aumento de cantidad
        document.querySelectorAll('.decrease-quantity').forEach(button => {
            button.addEventListener('click', function() {
                const productId = parseInt(button.getAttribute('data-id'));
                const productTalle = button.getAttribute('data-talle');
                removeFromCart(productId, productTalle);
            });
        });
        document.querySelectorAll('.increase-quantity').forEach(button => {
            button.addEventListener('click', function() {
                const productId = parseInt(button.getAttribute('data-id'));
                const productTalle = button.getAttribute('data-talle');
                addToCart(productId, null, null, productTalle, 1); // Incrementar la cantidad en 1
            });
        });
    }

    // Función para actualizar el total del carrito
    function updateCartTotal() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const cartTotal = cart.reduce((total, product) => total + (product.price * product.quantity), 0);
        document.querySelector('.cart-total').textContent = cartTotal.toFixed(2);
    }

        // Función para validar y enviar el formulario
        function validateAndSendForm(event) {
            event.preventDefault();
    
            // Validar número de teléfono
            const phoneInput = document.getElementById('buyer-phone');
            const phonePattern = /^[0-9]{10,15}$/; // Permitir solo números de 10 a 15 dígitos
            if (!phonePattern.test(phoneInput.value)) {
                alert('Por favor, ingrese un número de teléfono válido.');
                return;
            }
    
            // Validar correo electrónico
            const emailInput = document.getElementById('buyer-email');
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(emailInput.value)) {
                alert('Por favor, ingrese un correo electrónico válido.');
                return;
            }
    
            // Obtener los datos del comprador
            const buyerName = document.getElementById('buyer-name').value;
            const buyerPhone = document.getElementById('buyer-phone').value;
            const buyerEmail = document.getElementById('buyer-email').value;
    
            // Obtener los productos del carrito
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            let cartDetails = `Detalles del Carrito:\n`;
            cart.forEach(product => {
                cartDetails += `${product.quantity} x ${product.name} (Talle: ${product.talle}) - Precio: $${(product.price * product.quantity).toFixed(2)}\n`;
            });
    
            // Configuración de los parámetros de EmailJS
            const templateParams = {
                name: buyerName,
                phone: buyerPhone,
                email: buyerEmail,
                message: cartDetails
            };
    
            // Enviar el correo utilizando EmailJS
            emailjs.send('service_9olg4ok', 'template_hsl3vca', templateParams)
                .then(function(response) {
                    console.log('Correo enviado exitosamente!', response.status, response.text);
                    document.getElementById('confirmation-message').style.display = 'block';
                }, function(error) {
                    console.log('Fallo en el envío del correo...', error);
                });
    
            // Mostrar mensaje de confirmación estilizado
            const confirmationMessage = document.getElementById('confirmation-message');
            confirmationMessage.innerHTML = `
              <h2>Compra Confirmada</h2>
              <p>¡Gracias por su compra, ${buyerName}!
              Pronto nos pondremos en contacto con Ud para indicarle la forma de pago!</p>
            `;
            confirmationMessage.style.display = 'block';
            document.getElementById('dialog').style.display = 'none';
    
            // Esperar 5 segundos antes de redirigir a WhatsApp
            setTimeout(() => {
                // Mensaje a enviar por WhatsApp
                const message = `Hola, soy ${buyerName}. Quiero comprar. Mis datos son:\nTeléfono: ${buyerPhone}\nEmail: ${buyerEmail}\n${cartDetails}`;
    
                // Codificar el mensaje para la URL
                const encodedMessage = encodeURIComponent(message);
    
                // Redirigir a WhatsApp con el mensaje
                window.location.href = `https://wa.me/5491154511489?text=${encodedMessage}`;
    
                // Ocultar el mensaje de confirmación después de redirigir
                confirmationMessage.style.display = 'none';
            }, 2000);
    
            // Vaciar el carrito después de la confirmación
            localStorage.removeItem('cart');
            displayCart();
        }
    
        // Asociar eventos a los elementos del DOM
        document.getElementById('confirmation-form').addEventListener('submit', validateAndSendForm);
        document.getElementById('confirmar-carrito-btn').addEventListener('click', function() {
            document.getElementById('dialog').style.display = 'block';
        });
        document.querySelector('.clear-cart').addEventListener('click', function() {
            localStorage.removeItem('cart');
            displayCart();
        });
    
   // Función para inicializar la página
function initPage() {
    displayCart();

    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(button.getAttribute('data-id'));
            const productName = button.getAttribute('data-name');
            const productPrice = parseFloat(button.getAttribute('data-price'));
            const productTalle = document.querySelector(`#talle-${productId}`).value;
            const productQuantity = parseInt(document.querySelector(`#cantidad-${productId}`).value);
            if (productTalle && productQuantity > 0) {
                addToCart(productId, productName, productPrice, productTalle, productQuantity);
                changeButtonState(button);
            } else {
                alert("Por favor, selecciona un talle y una cantidad válida.");
            }
        });
    });
}

// Función para cambiar el estado del botón
function changeButtonState(button) {
    button.style.backgroundColor = '#4CAF50'; // Cambiar a verde
    const originalText = button.textContent;
    button.textContent = 'Producto agregado';
    button.disabled = true; // Deshabilitar el botón
    // Revertir el cambio después de 5 segundos
    setTimeout(() => {
        button.style.backgroundColor = '';
        button.textContent = originalText;
        button.disabled = false;
    }, 5000);
}

// Llamar a initPage cuando el DOM esté cargado
initPage();
       