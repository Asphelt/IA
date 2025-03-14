// Referencias a los elementos del DOM
const output = document.getElementById("output");
const startScreen = document.getElementById("start-screen");
const startBtn = document.getElementById("start-btn");
const gameOptions = document.getElementById("game-options");
const option1Btn = document.getElementById("option1");
const option2Btn = document.getElementById("option2");
const statusMessage = document.getElementById("status-message");

// API de IA - Reemplaza con tu clave válida
const API_ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";
const API_KEY = "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"; 

// JSON de la historia
const historia = {
    "titulo": "Historia ZombIA",
    "prologo": {
        "personaje": "Daniel",
        "descripcion": "Daniel, un joven ingeniero recién egresado, está de vacaciones en Austin, Texas, con la esperanza de trabajar en una ciudad emergente en tecnología."
    },
    "escenarios": [
        {
            "id": 1,
            "nombre": "Downtown de Austin",
            "descripcion": "Mientras exploras la ciudad, notas un accidente de ambulancia que explota. De entre las llamas, una persona en llamas ataca con furia inhumana.",
            "decisiones": [
                { "opcion": "A", "accion": "Escapar", "resultado": 2 },
                { "opcion": "B", "accion": "Ayudar a las víctimas", "resultado": 2 }
            ]
        },
        {
            "id": 2,
            "nombre": "Refugio",
            "descripcion": "Dentro del edificio, el grupo de sobrevivientes discute sobre quedarse o huir antes de la noche.",
            "decisiones": [
                { "opcion": "A", "accion": "Pasar la noche en el refugio", "resultado": 3 },
                { "opcion": "B", "accion": "Escapar antes de que anochezca", "resultado": 3 }
            ]
        },
        {
            "id": 3,
            "nombre": "Alcantarillas",
            "descripcion": "El grupo está atrapado en un laberinto subterráneo. Un ingeniero sugiere el camino correcto.",
            "decisiones": [
                { "opcion": "A", "accion": "Tomar el túnel ascendente", "resultado": 4 },
                { "opcion": "B", "accion": "Seguir al ingeniero por el túnel descendente", "resultado": 4 }
            ]
        }
    ]
};

// Variables de juego
let escenarioActual = 1;
let loadingMessageElement = null; // Elemento del mensaje de carga

// Función para mostrar texto en la terminal
function addText(text) {
    const paragraph = document.createElement("p");
    paragraph.textContent = text;
    output.appendChild(paragraph);
    output.scrollTop = output.scrollHeight;
    return paragraph; // Retorna el elemento creado
}

// Función para consultar la IA y obtener una narración mejorada
async function consultarIA(escenario) {
    // Mostrar mensaje de carga y guardar su referencia
    loadingMessageElement = addText("\n🧠 Consultando la IA para mejorar la narración...\n");

    try {
        const response = await fetch(API_ENDPOINT, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "deepseek/deepseek-r1:free",
                messages: [
                    {
                        role: "system",
                        content: "Eres un narrador experto en historias de supervivencia zombie. Tu tarea es transformar el siguiente escenario en una narración envolvente, rica en detalles y cargada de suspenso. Cada descripción debe ser breve pero intensa, manteniendo la tensión en todo momento.\n\nNo avances la historia sin que el jugador tome una decisión. Siempre debes ofrecer exactamente dos opciones, cada una con consecuencias significativas. Evita elecciones triviales. Haz que cada decisión impacte en la supervivencia del personaje.\n\nUsa un lenguaje visual y sensorial que sumerja al jugador en el peligro y la desesperación del apocalipsis zombie. Mantén un ritmo ágil y atrapante, asegurando que cada elección sea un dilema real."
                    },
                    { role: "user", content: `Escenario: ${escenario.nombre}. Descripción: ${escenario.descripcion}` }
                ],
            }),
        });

        if (!response.ok) throw new Error(`Error del servidor: ${response.status}`);

        const data = await response.json();
        const aiResponse = data.choices?.[0]?.message?.content || "No se recibió respuesta.";

        // Eliminar mensaje de carga
        if (loadingMessageElement) {
            output.removeChild(loadingMessageElement);
            loadingMessageElement = null;
        }

        addText(aiResponse);
        mostrarOpciones(escenario);

    } catch (error) {
        // Eliminar mensaje de carga en caso de error
        if (loadingMessageElement) {
            output.removeChild(loadingMessageElement);
            loadingMessageElement = null;
        }
        
        addText(`⚠️ Error al consultar la IA: ${error.message}`);
    }
}

// Función para mostrar las opciones de un escenario
function mostrarOpciones(escenario) {
    gameOptions.classList.remove("hidden");
    option1Btn.textContent = `1️ ${escenario.decisiones[0].accion}`;
    option2Btn.textContent = `2️ ${escenario.decisiones[1].accion}`;

    option1Btn.onclick = () => avanzarHistoria(escenario.decisiones[0].resultado);
    option2Btn.onclick = () => avanzarHistoria(escenario.decisiones[1].resultado);
}

// Función para avanzar la historia tras elegir una opción
function avanzarHistoria(siguienteEscenario) {
    if (siguienteEscenario === "final") {
        addText("\n🔚 La historia ha terminado. Gracias por jugar.\n");
        gameOptions.classList.add("hidden");
    } else {
        escenarioActual = siguienteEscenario;
        const nuevoEscenario = historia.escenarios.find(e => e.id === escenarioActual);
        consultarIA(nuevoEscenario);
    }
}

// Evento para iniciar el juego
startBtn.addEventListener("click", () => {
    startScreen.classList.add("hidden");
    addText(`Bienvenido a ${historia.titulo}\n`);
    addText(historia.prologo.descripcion);
    
    const primerEscenario = historia.escenarios.find(e => e.id === escenarioActual);
    consultarIA(primerEscenario);
});
