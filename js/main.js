// main.js

// Selecciona el contenedor donde se dibujará el lienzo
var elem = document.getElementById('container');
console.log('Contenedor seleccionado:', elem);

// Crea una nueva instancia de Two.js
var two = new Two({ width: 800, height: 600 }).appendTo(elem);
console.log('Instancia de Two.js creada:', two);

// Crea una forma de círculo
var circle = two.makeCircle(400, 300, 50);
console.log('Círculo creado:', circle);

// Establece propiedades del círculo
circle.fill = '#FF8000';
circle.stroke = 'orangered';
circle.linewidth = 5;
console.log('Propiedades del círculo establecidas:', circle);

// Variables para el arrastre
var dragging = false;
var offsetX, offsetY;

// Asegúrate de que el elemento del círculo está disponible
two.update();
if (circle._renderer.elem) {
    // Función para iniciar el arrastre
    circle._renderer.elem.addEventListener('mousedown', function(event) {
        console.log('mousedown event');
        dragging = true;
        offsetX = event.clientX - circle.translation.x;
        offsetY = event.clientY - circle.translation.y;
        event.preventDefault(); // Previene el comportamiento predeterminado del navegador
    });

    // Función para mover el círculo
    elem.addEventListener('mousemove', function(event) {
        if (dragging) {
            console.log('mousemove event');
            circle.translation.set(event.clientX - offsetX, event.clientY - offsetY);
            two.update();
        }
    });

    // Función para finalizar el arrastre
    elem.addEventListener('mouseup', function() {
        console.log('mouseup event');
        dragging = false;
    });

    // También manejamos el evento mouseleave para detener el arrastre si el mouse sale del contenedor
    elem.addEventListener('mouseleave', function() {
        console.log('mouseleave event');
        dragging = false;
    });
}

console.log('Circle rendered');