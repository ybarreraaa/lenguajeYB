let velocidad = 1.0;
let isPlaying = false;
let currentUtterance = null;

const textoCuento = `Había una vez una niña llamada Caperucita Roja. Todos la llamaban así porque siempre usaba una hermosa capa roja que le había regalado su abuelita.

Un día, su mamá le pidió llevar una canasta con comida a la casa de su abuelita, que estaba enferma.

Antes de salir, su mamá le dijo que no hablara con extraños y que siguiera siempre el camino seguro.

Mientras caminaba por el bosque, Caperucita se encontró con un lobo muy astuto.

El lobo le preguntó hacia dónde iba y la niña le contó que visitaría a su abuelita.

Entonces, el lobo corrió rápidamente hasta la casa de la abuelita y llegó antes que Caperucita.

Cuando la niña llegó, notó que su abuelita se veía muy extraña.

Finalmente, un leñador ayudó a Caperucita y a su abuelita.

Desde ese día, Caperucita aprendió que debía obedecer los consejos de su familia y tener cuidado con los desconocidos.`;

const cuentoContainer = document.getElementById("cuento");

// ==========================================================================
// PARSEO DEL TEXTO Y CONSTRUCCIÓN DE SPANS CON ÍNDICES DE CARACTERES
// ==========================================================================
const paragraphs = textoCuento.split(/\n+/);
let globalCharIndex = 0;
let htmlContent = "";
const wordMap = []; // Guarda { id, start, end, word }
let wordCounter = 0;

paragraphs.forEach((paraText) => {
    // Buscar la posición exacta del párrafo en el texto original para sincronía perfecta
    let paraStart = textoCuento.indexOf(paraText, globalCharIndex);
    if (paraStart === -1) {
        paraStart = globalCharIndex;
    }

    let paraHtml = "<p style='margin-bottom: 20px;'>";
    
    // Separamos por palabras y espacios para no perder el formato original
    const tokens = paraText.split(/(\s+)/);
    let paraOffset = 0;

    tokens.forEach(token => {
        if (token.trim().length === 0) {
            // Es espacio en blanco, lo insertamos directo al HTML
            paraHtml += token;
            paraOffset += token.length;
        } else {
            // Es una palabra
            const absoluteStart = paraStart + paraOffset;
            const absoluteEnd = absoluteStart + token.length;
            const wordId = `word-${wordCounter}`;

            paraHtml += `<span id="${wordId}">${token}</span>`;

            wordMap.push({
                id: wordId,
                start: absoluteStart,
                end: absoluteEnd,
                word: token
            });

            wordCounter++;
            paraOffset += token.length;
        }
    });

    paraHtml += "</p>";
    htmlContent += paraHtml;
    globalCharIndex = paraStart + paraText.length;
});

cuentoContainer.innerHTML = htmlContent;

// ==========================================================================
// SINTETIZADOR DE VOZ
// ==========================================================================
function leerTexto() {
    detenerVozSilencioso();

    isPlaying = true;
    
    // Crear la instancia de lectura
    const voz = new SpeechSynthesisUtterance(textoCuento);
    voz.lang = "es-ES";
    voz.rate = velocidad;
    voz.pitch = 1.15; // Tono ligeramente infantil/amigable
    
    // Buscar voz adecuada en español
    const voces = speechSynthesis.getVoices();
    let vozEspanola = voces.find(v => 
        v.lang.startsWith("es") && (
            v.name.includes("Helena") ||
            v.name.includes("Laura") ||
            v.name.includes("Sabina") ||
            v.name.includes("Google") ||
            v.name.includes("Microsoft")
        )
    );
    
    if (!vozEspanola) {
        vozEspanola = voces.find(v => v.lang.startsWith("es"));
    }
    
    if (vozEspanola) {
        voz.voice = vozEspanola;
    }

    // EVENTO CLAVE: Sincronización palabra por palabra
    voz.onboundary = function(event) {
        if (event.name === "word") {
            const charIndex = event.charIndex;
            
            // Buscar la palabra que cubre el índice de carácter actual
            const currentWord = wordMap.find(w => charIndex >= w.start && charIndex < w.end);
            
            if (currentWord) {
                // Remover clase de resaltado anterior
                document.querySelectorAll("#cuento span").forEach(span => {
                    span.classList.remove("resaltado");
                });

                // Resaltar la palabra activa
                const activeSpan = document.getElementById(currentWord.id);
                if (activeSpan) {
                    activeSpan.classList.add("resaltado");
                    
                    // Hacer scroll automático suave si es necesario
                    activeSpan.scrollIntoView({
                        behavior: "smooth",
                        block: "nearest"
                    });
                }
            }
        }
    };

    voz.onend = function() {
        limpiarResaltado();
        isPlaying = false;
        document.getElementById("btn-leer").innerHTML = "🔊 Iniciar Lectura";
    };

    voz.onerror = function() {
        limpiarResaltado();
        isPlaying = false;
        document.getElementById("btn-leer").innerHTML = "🔊 Iniciar Lectura";
    };

    currentUtterance = voz;
    document.getElementById("btn-leer").innerHTML = "🔊 Reproduciendo...";
    speechSynthesis.speak(voz);
}

function detener() {
    detenerVozSilencioso();
    limpiarResaltado();
    isPlaying = false;
    document.getElementById("btn-leer").innerHTML = "🔊 Iniciar Lectura";
}

function detenerVozSilencioso() {
    speechSynthesis.cancel();
}

function limpiarResaltado() {
    document.querySelectorAll("#cuento span").forEach(span => {
        span.classList.remove("resaltado");
    });
}

// ==========================================================================
// CONTROLES DE VELOCIDAD
// ==========================================================================
function actualizarActivoVelocidad(idBoton) {
    document.querySelectorAll(".btn-velocidad").forEach(btn => {
        btn.classList.remove("activo");
    });
    document.getElementById(idBoton).classList.add("activo");
}

function velocidadLenta() {
    velocidad = 0.6;
    document.getElementById("estado").innerHTML = "🐢 Velocidad Lenta";
    actualizarActivoVelocidad("btn-vel-05");
    
    // Si estaba reproduciéndose, reinicia con la nueva velocidad
    if (isPlaying) {
        leerTexto();
    }
}

function velocidadNormal() {
    velocidad = 1.0;
    document.getElementById("estado").innerHTML = "🙂 Velocidad Normal";
    actualizarActivoVelocidad("btn-vel-1");
    
    if (isPlaying) {
        leerTexto();
    }
}

function velocidadRapida() {
    velocidad = 1.5;
    document.getElementById("estado").innerHTML = "⚡ Velocidad Rápida";
    actualizarActivoVelocidad("btn-vel-15");
    
    if (isPlaying) {
        leerTexto();
    }
}

// Inicializar voces para navegadores que las cargan de forma asíncrona
speechSynthesis.onvoiceschanged = function() {
    speechSynthesis.getVoices();
};
