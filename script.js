const output = document.getElementById("output");
const startScreen = document.getElementById("start-screen");
const startBtn = document.getElementById("start-btn");
const gameOptions = document.getElementById("game-options");
const option1Btn = document.getElementById("option1");
const option2Btn = document.getElementById("option2");
const statusMessage = document.getElementById("status-message");

const API_ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";
const API_KEY = "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";

let historia = {
    titulo: "Historia ZombIA",
    prologo: {
        personaje: "Daniel",
        descripcion: "Daniel, un joven ingeniero recién egresado, está de vacaciones en Austin, Texas, con la esperanza de trabajar en una ciudad emergente en tecnología."
    },
    escenarios: []
};

let escenarioActual = 1;
let loadingMessageElement = null;

function addText(text) {
    const paragraph = document.createElement("p");
    paragraph.textContent = text;
    output.appendChild(paragraph);
    output.scrollTop = output.scrollHeight;
    return paragraph;
}

async function consultarIA(escenario) {
    loadingMessageElement = addText("\n🧠 Consultando...\n");

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
                        content: "Eres un narrador experto en historias de supervivencia zombie. Tu tarea es transformar el siguiente escenario en una narración envolvente, rica en detalles y cargada de suspenso. Cada descripción debe ser breve pero intensa, manteniendo la tensión en todo momento. No avances la historia sin que el jugador tome una decisión. Siempre debes ofrecer exactamente dos opciones, cada una con consecuencias significativas."
                    },
                    {
                        role: "user",
                        content: `Escenario: ${escenario.nombre}. Descripción: ${escenario.descripcion}`
                    }
                ]
            }),
        });

        if (!response.ok) throw new Error(`Error del servidor: ${response.status}`);
        const data = await response.json();
        const aiResponse = data.choices?.[0]?.message?.content || "No se recibió respuesta.";

        if (loadingMessageElement) {
            output.removeChild(loadingMessageElement);
            loadingMessageElement = null;
        }

        addText(aiResponse);
        mostrarOpciones(escenario);

    } catch (error) {
        if (loadingMessageElement) {
            output.removeChild(loadingMessageElement);
            loadingMessageElement = null;
        }
        addText(`⚠️ Error al consultar la IA: ${error.message}`);
    }
}

function mostrarOpciones(escenario) {
    gameOptions.classList.remove("hidden");
    option1Btn.textContent = `1️ ${escenario.decisiones[0].accion}`;
    option2Btn.textContent = `2️ ${escenario.decisiones[1].accion}`;

    option1Btn.onclick = () => avanzarHistoria(escenario.decisiones[0].resultado);
    option2Btn.onclick = () => avanzarHistoria(escenario.decisiones[1].resultado);
}

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

startBtn.addEventListener("click", async () => {
    startScreen.classList.add("hidden");
    addText(`Bienvenido a ${historia.titulo}\n`);
    addText(historia.prologo.descripcion);

    try {
        const response = await fetch('http://localhost:3001/api/escenarios');
        const data = await response.json();
        historia.escenarios = data;

        const primerEscenario = historia.escenarios.find(e => e.id === escenarioActual);
        consultarIA(primerEscenario);
    } catch (err) {
        addText(`❌ Error al cargar escenarios: ${err.message}`);
    }
});
