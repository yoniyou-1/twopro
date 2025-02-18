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
    rect.fill = params.fill;
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

    rectangles.push({ rect: rect, text: text, children: children, isChild: isChild });
    console.log('Rectángulo creado:', rect);

    return { rect: rect, text: text, children: children };
}

// Crea los rectángulos usando los parámetros del array
rectParamsArray.forEach(params => createRectangle(params));

// Variables para el arrastre, rotación y escalado
var dragging = false;
var rotating = false;
var scaling = false;
var offsetX = 0, offsetY = 0;
var initialAngle = 0;
var initialScale = 1;
var initialDistance = 0;
var currentRect = null;

// Variables para los modos de interacción
var mode = 'drag'; // Valores posibles: 'drag', 'rotate', 'scale'

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

// Asegúrate de que los elementos de los rectángulos están disponibles
two.update();
rectangles.forEach(function(item) {
    var rect = item.rect;
    if (rect._renderer.elem) {
        // Función para iniciar el arrastre, rotación o escalado
        rect._renderer.elem.addEventListener('mousedown', function(event) {
            console.log('mousedown event');
            currentRect = item;
            if (mode === 'rotate') {
                rotating = true;
                initialAngle = Math.atan2(event.clientY - rect.translation.y, event.clientX - rect.translation.x) - rect.rotation;
            } else if (mode === 'scale') {
                scaling = true;
                initialDistance = Math.hypot(event.clientX - rect.translation.x, event.clientY - rect.translation.y);
                initialScale = rect.scale;
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
        var angle = Math.atan2(event.clientY - currentRect.rect.translation.y, event.clientX - currentRect.rect.translation.x);
        currentRect.rect.rotation = angle - initialAngle;
        currentRect.text.rotation = angle - initialAngle;
        two.update();
    } else if (scaling && currentRect) {
        console.log('mousemove event (scaling)');
        var currentDistance = Math.hypot(event.clientX - currentRect.rect.translation.x, event.clientY - currentRect.rect.translation.y);
        currentRect.rect.scale = initialScale * (currentDistance / initialDistance);
        currentRect.text.scale = initialScale * (currentDistance / initialDistance);
        two.update();
    }
});

// Función para finalizar el arrastre, rotación o escalado
elem.addEventListener('mouseup', function() {
    console.log('mouseup event');
    dragging = false;
    rotating = false;
    scaling = false;
    currentRect = null;
});

// También manejamos el evento mouseleave para detener el arrastre, rotación o escalado si el mouse sale del contenedor
elem.addEventListener('mouseleave', function() {
    console.log('mouseleave event');
    dragging = false;
    rotating = false;
    scaling = false;
    currentRect = null;
});

// Función para manejar el clic en el botón de envío
document.getElementById('submitBtn').addEventListener('click', function(event) {
    var rectDataArray = rectangles.filter(function(item) {
        // Filtra solo los rectángulos que no son hijos
        return !item.isChild;
    }).map(function(item) {
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
                    scale: child.rect.scale
                };
            })
        };
    });

    // Mostrar los datos de los rectángulos en la consola
    console.log('Datos de los rectángulos:', rectDataArray);

    // Prevenir el comportamiento predeterminado del formulario
    event.preventDefault();
});

console.log('Rectángulos renderizados');