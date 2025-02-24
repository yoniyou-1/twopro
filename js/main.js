// main.js

// Selecciona el contenedor donde se dibujará el lienzo
var elem = document.getElementById('container');
console.log('Contenedor seleccionado:', elem);

// Verifica si rectParamsArray existe y tiene los parámetros necesarios, de lo contrario usa valores predeterminados
var rectParamsArray = typeof rectParamsArray !== 'undefined' && rectParamsArray.length > 0 ? rectParamsArray : [{
    id: 'defaultRect',
    name: 'Default Rect',
    x: 400,
    y: 300,
    width: 100,
    height: 50,
    fill: '#FF8000',
    stroke: 'orangered',
    linewidth: 5,
    rotation: 0,
    scale: 1,
    availability: 'available', // Renombrado de 'status' a 'availability'
    children: []
}];

// Crea una nueva instancia de Two.js
var two = new Two({ width: 800, height: 600 }).appendTo(elem);
console.log('Instancia de Two.js creada:', two);

// Array para almacenar los rectángulos creados
var rectangles = [];

// Función para crear un rectángulo y sus hijos
function createRectangle(params, isChild = false) {
    var rect = two.makeRectangle(params.x, params.y, params.width, params.height);
    rect.fill = getColorByAvailability(params.availability); // Usar el color según la disponibilidad
    rect.stroke = params.stroke;
    rect.linewidth = params.linewidth;
    rect.rotation = params.rotation;
    rect.scale = params.scale;

    // Crear texto en el centro del rectángulo usando el parámetro name
    var text = two.makeText(params.name, params.x, params.y);
    text.fill = '#000000'; // Color del texto
    text.size = isChild ? 8 : 14; // Tamaño del texto (más grande para padres)

    // Asegúrate de que params.children es un array
    var children = (params.children || []).map(child => createRectangle(child, true));

    rectangles.push({ rect: rect, text: text, children: children, isChild: isChild, availability: params.availability });
    console.log('Rectángulo creado:', rect);

    return { rect: rect, text: text, children: children, availability: params.availability };
}

// Función para obtener el color según la disponibilidad
function getColorByAvailability(availability) {
    switch (availability) {
        case 'selected':
            return 'green';
        case 'occupied':
            return 'red';
        default:
            return 'gray';
    }
}

// Crea los rectángulos usando los parámetros del array
rectParamsArray.forEach(params => createRectangle(params));

// Variables para el arrastre, rotación y escalado
var dragging = false;
var rotating = false;
var scaling = false;
var scalingX = false;
var scalingY = false;
var offsetX = 0, offsetY = 0;
var initialAngle = 0;
var initialScale = 1;
var initialDistance = 0;
var initialWidth = 0;
var initialHeight = 0;
var currentRect = null;

// Variables para los modos de interacción
var mode = 'drag'; // Valores posibles: 'drag', 'rotate', 'scale', 'scaleX', 'scaleY', 'status'

// Manejar los botones de modo
document.getElementById('dragBtn').addEventListener('click', function() {
    mode = 'drag';
    console.log('Modo: arrastre');
});

document.getElementById('rotateBtn').addEventListener('click', function() {
    mode = 'rotate';
    console.log('Modo: rotación');
});

document.getElementById('scaleBtn').addEventListener('click', function() {
    mode = 'scale';
    console.log('Modo: escalado');
});

document.getElementById('scaleXBtn').addEventListener('click', function() {
    mode = 'scaleX';
    console.log('Modo: escalado en X');
});

document.getElementById('scaleYBtn').addEventListener('click', function() {
    mode = 'scaleY';
    console.log('Modo: escalado en Y');
});

// Nuevo botón para habilitar el modo "status" (ahora para availability)
document.getElementById('statusBtn').addEventListener('click', function() {
    mode = 'status';
    console.log('Modo: cambiar availability individual');
});

// Asegúrate de que los elementos de los rectángulos están disponibles
two.update();
rectangles.forEach(function(item) {
    var rect = item.rect;
    if (rect._renderer.elem) {
        // Función para iniciar el arrastre, rotación, escalado o cambiar availability
        rect._renderer.elem.addEventListener('mousedown', function(event) {
            console.log('mousedown event');
            currentRect = item;
            if (mode === 'status') {
                // Cambiamos la disponibilidad y color del rectángulo sobre el que se hizo clic
                currentRect.availability = getNextAvailability(currentRect.availability);
                currentRect.rect.fill = getColorByAvailability(currentRect.availability);
                two.update();
            } else if (mode === 'rotate') {
                rotating = true;
                initialAngle = Math.atan2(
                    event.clientY - rect.translation.y,
                    event.clientX - rect.translation.x
                ) - rect.rotation;
            } else if (mode === 'scale') {
                scaling = true;
                initialDistance = Math.hypot(
                    event.clientX - rect.translation.x,
                    event.clientY - rect.translation.y
                );
                initialScale = rect.scale;
            } else if (mode === 'scaleX') {
                scalingX = true;
                initialWidth = rect.width;
                initialDistance = Math.abs(event.clientX - rect.translation.x);
            } else if (mode === 'scaleY') {
                scalingY = true;
                initialHeight = rect.height;
                initialDistance = Math.abs(event.clientY - rect.translation.y);
            } else {
                dragging = true;
                offsetX = event.clientX - rect.translation.x;
                offsetY = event.clientY - rect.translation.y;
            }
            event.preventDefault(); // Previene el comportamiento predeterminado del navegador
        });
    }
});

// Función para mover, rotar o escalar el rectángulo
elem.addEventListener('mousemove', function(event) {
    if (dragging && currentRect) {
        console.log('mousemove event');
        currentRect.rect.translation.set(event.clientX - offsetX, event.clientY - offsetY);
        currentRect.text.translation.set(event.clientX - offsetX, event.clientY - offsetY);
        two.update();
    } else if (rotating && currentRect) {
        console.log('mousemove event (rotating)');
        var angle = Math.atan2(
            event.clientY - currentRect.rect.translation.y,
            event.clientX - currentRect.rect.translation.x
        );
        currentRect.rect.rotation = angle - initialAngle;
        currentRect.text.rotation = angle - initialAngle;
        two.update();
    } else if (scaling && currentRect) {
        console.log('mousemove event (scaling)');
        var currentDistance = Math.hypot(
            event.clientX - currentRect.rect.translation.x,
            event.clientY - currentRect.rect.translation.y
        );
        currentRect.rect.scale = initialScale * (currentDistance / initialDistance);
        currentRect.text.scale = initialScale * (currentDistance / initialDistance);
        two.update();
    } else if (scalingX && currentRect) {
        console.log('mousemove event (scalingX)');
        var currentDistanceX = Math.abs(event.clientX - currentRect.rect.translation.x);
        currentRect.rect.width = initialWidth * (currentDistanceX / initialDistance);
        two.update();
    } else if (scalingY && currentRect) {
        console.log('mousemove event (scalingY)');
        var currentDistanceY = Math.abs(event.clientY - currentRect.rect.translation.y);
        currentRect.rect.height = initialHeight * (currentDistanceY / initialDistance);
        two.update();
    }
});

// --- Establecer imagen de fondo ---
// Se obtiene la ruta del input con id "canvasImageInput" en el HTML
var canvasImageInput = document.getElementById('canvasImageInput');
var bgImagePath = canvasImageInput ? canvasImageInput.value.trim() : 'img/canvas.jpg';
if (bgImagePath) {
    var img = new Image();
    img.src = bgImagePath;
    img.onload = function() {
        var background = two.makeRectangle(two.width / 2, two.height / 2, two.width, two.height);
        background.noStroke();
        background.fill = new Two.Texture(img);
        // Inserta el fondo al inicio de la escena para que se dibuje detrás
        two.scene.children.unshift(background);
        
        // Reordena los elementos interactivos: se sacan y se vuelven a agregar al final
        rectangles.forEach(function(item) {
            var idx = two.scene.children.indexOf(item.rect);
            if (idx !== -1) {
                two.scene.children.splice(idx, 1);
                two.scene.children.push(item.rect);
            }
            idx = two.scene.children.indexOf(item.text);
            if (idx !== -1) {
                two.scene.children.splice(idx, 1);
                two.scene.children.push(item.text);
            }
        });
        two.update();
        console.log('Fondo creado:', background);
    };
    img.onerror = function() {
        console.error('Error al cargar la imagen de fondo:', bgImagePath);
    };
}

// Función para finalizar el arrastre, rotación o escalado
elem.addEventListener('mouseup', function() {
    console.log('mouseup event');
    dragging = false;
    rotating = false;
    scaling = false;
    scalingX = false;
    scalingY = false;
    currentRect = null;
});

// También manejamos el evento mouseleave para detener el arrastre, rotación o escalado si el mouse sale del contenedor
elem.addEventListener('mouseleave', function() {
    console.log('mouseleave event');
    dragging = false;
    rotating = false;
    scaling = false;
    scalingX = false;
    scalingY = false;
    currentRect = null;
});

// Función para manejar el clic en el botón de envío
document.getElementById('submitBtn').addEventListener('click', function(event) {
    var rectDataArray = rectangles
        .filter(function(item) {
            // Filtra solo los rectángulos que no son hijos
            return !item.isChild;
        })
        .map(function(item) {
            var rect = item.rect;
            return {
                id: item.text.value,
                name: item.text.value,
                x: rect.translation.x,
                y: rect.translation.y,
                width: rect.width,
                height: rect.height,
                fill: rect.fill,
                stroke: rect.stroke,
                linewidth: rect.linewidth,
                rotation: rect.rotation,
                scale: rect.scale,
                availability: item.availability, // Renombrado de 'status' a 'availability'
                children: item.children.map(function(child) {
                    return {
                        id: child.text.value,
                        name: child.text.value,
                        x: child.rect.translation.x,
                        y: child.rect.translation.y,
                        width: child.rect.width,
                        height: child.rect.height,
                        fill: child.rect.fill,
                        stroke: child.rect.stroke,
                        linewidth: child.rect.linewidth,
                        rotation: child.rect.rotation,
                        scale: child.rect.scale,
                        availability: child.availability // Renombrado de 'status' a 'availability'
                    };
                })
            };
        });

    // Mostrar los datos de los rectángulos en la consola
    console.log('Datos de los rectángulos:', rectDataArray);

    // Prevenir el comportamiento predeterminado del formulario
    event.preventDefault();
});

// Función para obtener la siguiente disponibilidad (iteración)
function getNextAvailability(currentAvailability) {
    switch (currentAvailability) {
        case 'available':
            return 'selected';
        case 'selected':
            return 'occupied';
        default:
            return 'available';
    }
}

console.log('Rectángulos renderizados');