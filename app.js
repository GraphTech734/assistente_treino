// Importações do MediaPipe (da CDN)
import {
    PoseLandmarker,
    FilesetResolver,
    DrawingUtils
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.10";

// --- NOVAS IMPORTAÇÕES ---
// Módulos de análise (Inferiores)
import { analisarAgachamentoLivre } from './exercicios/parte_inferior/agachamento_livre.js';
import { analisarAgachamentoSumo } from './exercicios/parte_inferior/agachamento_sumo.js';

// Módulos de análise (Superiores)
import { analisarSupinoBarra } from './exercicios/parte_superior/supino_barra.js';
import { analisarSupinoHalteres } from './exercicios/parte_superior/supino_halteres.js';
import { analisarDesenvolvimentoOmbros } from './exercicios/parte_superior/desenvolvimento_ombros.js';
import { analisarRoscaBiceps } from './exercicios/parte_superior/rosca_biceps.js';
// --- FIM DAS NOVAS IMPORTAÇÕES ---


// === CONSTANTES E VARIÁVEIS GLOBAIS ===
const COHERE_API_KEY = "ek9WqUvcwC7jB2rc0V3JY7a4E09bQ2vyixEOz7KE";

// Referências aos Elementos DOM
// (código existente)
const videoPlayer = document.getElementById("video-player");
const canvasElement = document.getElementById("output-canvas");
const canvasCtx = canvasElement.getContext("2d");
const feedbackList = document.getElementById("feedback-list");
const loadingSection = document.getElementById("loading-section");
const uploadSection = document.getElementById("upload-section");
const resultSection = document.getElementById("result-section");
const startAnalysisBtn = document.getElementById("start-analysis-btn");
const videoUpload = document.getElementById("video-upload");
const videoContainer = document.getElementById("analysis-output");
const exerciseListContainer = document.getElementById("exercise-list"); // <-- ADD

// Estado da Aplicação
// (código existente)
let poseLandmarker = null;
let drawingUtils = null;
let currentExerciseId = null;
let lastVideoTime = -1;
let animationFrameId = null;
let isAnalyzing = false; 
let collectedFeedback = new Set(); 

// --- NOVA ESTRUTURA DE DADOS DE EXERCÍCIOS ---
const exerciseDatabase = {
    inferior: [
        { id: 'agachamento_livre', nome: 'Agachamento Livre', desc: 'Análise de joelhos, quadril e coluna.', visao: 'Visão Lateral', tag: 'tag-blue' },
        { id: 'agachamento_sumo', nome: 'Agachamento Sumô', desc: 'Análise de alinhamento de joelhos e pés.', visao: 'Visão Frontal', tag: 'tag-green' }
    ],
    superior: [
        { id: 'supino_barra', nome: 'Supino com Barra', desc: 'Análise de simetria e cotovelos.', visao: 'Visão 45° Diagonal', tag: 'tag-red' },
        { id: 'supino_halteres', nome: 'Supino com Halteres', desc: 'Análise de simetria e amplitude.', visao: 'Visão Frontal/45°', tag: 'tag-red' },
        { id: 'desenvolvimento_ombros', nome: 'Desenvolvimento', desc: 'Análise de simetria e amplitude.', visao: 'Visão Frontal/Lateral', tag: 'tag-yellow' },
        { id: 'rosca_biceps', nome: 'Rosca Bíceps', desc: 'Análise de balanço do ombro.', visao: 'Visão Frontal/Lateral', tag: 'tag-yellow' }
    ]
};

// Mapeia IDs para as funções importadas
const analysisFunctions = {
    'agachamento_livre': analisarAgachamentoLivre,
    'agachamento_sumo': analisarAgachamentoSumo,
    'supino_barra': analisarSupinoBarra,
    'supino_halteres': analisarSupinoHalteres,
    'desenvolvimento_ombros': analisarDesenvolvimentoOmbros,
    'rosca_biceps': analisarRoscaBiceps
};
// --- FIM DAS NOVAS ESTRUTURAS ---

// === INICIALIZAÇÃO ===
document.addEventListener("DOMContentLoaded", () => {
    bindNavigationEvents();
    setupMediaPipe();
});

async function setupMediaPipe() {
    // ... (código existente sem alteração)
    try {
        const vision = await FilesetResolver.forVisionTasks(
            "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.10/wasm" 
        );
        poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
            baseOptions: {
                modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_heavy/float16/1/pose_landmarker_heavy.task`,
                delegate: "GPU"
            },
            runningMode: "VIDEO",
            numPoses: 1,
        });

        drawingUtils = new DrawingUtils(canvasCtx);
        console.log("✅ Pose Landmarker (heavy) carregado com sucesso.");
    } catch (error) {
        console.error("❌ Erro ao inicializar o PoseLandmarker:", error);
    }
}

// === LÓGICA DE NAVEGAÇÃO (MODIFICADA) ===

function bindNavigationEvents() {
    // --- LÓGICA DE CATEGORIA ATUALIZADA ---
    document.getElementById("cat-inferior").addEventListener("click", () => {
        populateExerciseList('inferior');
        showView("exercise-view");
    });
    
    document.getElementById("cat-superior").addEventListener("click", () => {
        populateExerciseList('superior');
        showView("exercise-view");
    });
    // --- FIM DA ATUALIZAÇÃO ---

    document.getElementById("back-to-categories").addEventListener("click", () => showView("category-view"));
    document.getElementById("back-to-exercises").addEventListener("click", () => showView("exercise-view"));
    
    videoUpload.addEventListener("change", (e) => {
        startAnalysisBtn.disabled = !(e.target.files && e.target.files[0]);
    });
    startAnalysisBtn.addEventListener("click", handleVideoAnalysis);
}

/**
 * [NOVA FUNÇÃO] Preenche a lista de exercícios dinamicamente.
 */
function populateExerciseList(category) {
    exerciseListContainer.innerHTML = ""; // Limpa a lista
    const exercises = exerciseDatabase[category];

    if (!exercises) return;

    exercises.forEach(ex => {
        const card = document.createElement('div');
        card.className = 'exercise-card card';
        // Guarda os dados no elemento
        card.dataset.exerciseId = ex.id;
        card.dataset.viewRequired = ex.visao;
        card.dataset.exerciseName = ex.nome;

        card.innerHTML = `
            <h3 class="text-xl font-bold text-blue-700">${ex.nome}</h3>
            <p class="text-gray-600 mt-2">${ex.desc}</p>
            <span class="tag ${ex.tag}">${ex.visao}</span>
        `;
        
        // Adiciona o evento de clique para este novo card
        card.addEventListener("click", () => handleExerciseClick(card));
        
        exerciseListContainer.appendChild(card);
    });
}

/**
 * [NOVA FUNÇÃO] Lida com o clique no card de exercício.
 */
function handleExerciseClick(card) {
    if (!poseLandmarker) {
        alert("O MediaPipe ainda está carregando. Por favor, aguarde.");
        return;
    }
    currentExerciseId = card.dataset.exerciseId;
    const viewRequired = card.dataset.viewRequired;
    const exerciseName = card.dataset.exerciseName;
    
    document.getElementById("analysis-title").innerText = `Análise: ${exerciseName}`;
    document.getElementById("upload-instructions").innerHTML = `Por favor, carregue um vídeo com <strong>${viewRequired}</strong>.`;
    showView("analysis-view");
}


function showView(viewId) {
    // ... (código existente sem alteração)
    document.querySelectorAll(".view").forEach(view => view.classList.remove("active"));
    document.getElementById(viewId).classList.add("active");
    if (viewId !== 'analysis-view') resetAnalysisUI();
}

function resetAnalysisUI() {
    // ... (código existente sem alteração)
    videoUpload.value = '';
    startAnalysisBtn.disabled = true;
    startAnalysisBtn.innerText = "Iniciar Análise";
    uploadSection.style.display = 'block';
    loadingSection.style.display = 'none';
    resultSection.style.display = 'none';
    videoPlayer.src = '';
    videoPlayer.style.display = 'none';
    if (canvasCtx) canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    clearFeedback();
    isAnalyzing = false;
    collectedFeedback.clear();
}

// === LÓGICA DE VÍDEO E MEDIAPIPE ===

function handleVideoAnalysis() {
    // ... (código existente sem alteração)
    const videoFile = videoUpload.files[0];
    if (!videoFile) return;

    collectedFeedback.clear();
    isAnalyzing = true;
    startAnalysisBtn.disabled = true;
    startAnalysisBtn.innerText = "Analisando...";
    clearFeedback();
    addFeedback("Analisando vídeo quadro a quadro...", "info");

    uploadSection.style.display = 'none';
    loadingSection.style.display = 'block';
    resultSection.style.display = 'none';

    const videoUrl = URL.createObjectURL(videoFile);
    videoPlayer.src = videoUrl;

    videoPlayer.onended = () => {
        if (isAnalyzing) {
            console.log("Vídeo terminou. Parando análise e chamando Cohere.");
            stopVideoAnalysis();
            generateCohereReport(); 
        }
    };

    videoPlayer.onloadeddata = () => {
        canvasElement.width = videoPlayer.videoWidth;
        canvasElement.height = videoPlayer.videoHeight;
        videoContainer.style.aspectRatio = `${videoPlayer.videoWidth} / ${videoPlayer.videoHeight}`;
        
        loadingSection.style.display = 'none';
        resultSection.style.display = 'block';
        videoPlayer.style.display = 'block';
        
        videoPlayer.play();
        startVideoAnalysis();
    };
}

function startVideoAnalysis() {
    // ... (código existente sem alteração)
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    lastVideoTime = -1;
    isAnalyzing = true;
    predictVideoFrame();
}

function stopVideoAnalysis() {
    // ... (código existente sem alteração)
    isAnalyzing = false;
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
}

async function predictVideoFrame() {
    // ... (código existente sem alteração)
    if (!isAnalyzing) return;
    
    if (!poseLandmarker) {
        animationFrameId = requestAnimationFrame(predictVideoFrame);
        return;
    }

    const videoTimeInSeconds = videoPlayer.currentTime;

    if (videoTimeInSeconds < lastVideoTime) {
        lastVideoTime = videoTimeInSeconds;
    }

    if (videoTimeInSeconds > lastVideoTime) {
        lastVideoTime = videoTimeInSeconds; 
        const frameTimeInMs = videoTimeInSeconds * 1000;
        
        poseLandmarker.detectForVideo(videoPlayer, frameTimeInMs, (result) => {
            canvasCtx.save();
            canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
            
            if (result.landmarks && result.landmarks.length > 0) {
                const landmarks = result.landmarks[0];
                drawingUtils.drawLandmarks(landmarks, { radius: 3, color: '#FF0000', fillColor: '#FF0000' });
                drawingUtils.drawConnectors(landmarks, PoseLandmarker.POSE_CONNECTIONS, { color: '#00FF00', lineWidth: 2 });
                dispatchExerciseAnalysis(landmarks);
            }
            canvasCtx.restore();
        });
    }
    
    if (isAnalyzing) {
        animationFrameId = requestAnimationFrame(predictVideoFrame);
    }
}

// === LÓGICA DE COLETA E RELATÓRIO ===

function dispatchExerciseAnalysis(landmarks) {
    // Esta função agora suporta todos os novos exercícios
    const analysisFn = analysisFunctions[currentExerciseId]; 
    if (analysisFn) {
        const feedbackMessages = analysisFn(landmarks); 
        feedbackMessages.forEach(msg => {
            if (!msg.includes("Fase de") && !msg.includes("Bom alinhamento")) {
                collectedFeedback.add(msg);
            }
        });
    }
}

async function generateCohereReport() {
    // ... (código existente sem alteração)
    console.log("Iniciando geração de relatório Cohere.");
    clearFeedback();
    addFeedback("Análise de vídeo concluída. Gerando relatório com IA...", "info");

    const exerciseName = document.getElementById("analysis-title").innerText;
    const feedbackArray = Array.from(collectedFeedback);

    if (feedbackArray.length === 0) {
        clearFeedback();
        addFeedback("Nenhum desvio significativo foi detectado durante a análise. Ótimo trabalho!", "success");
        startAnalysisBtn.disabled = false;
        startAnalysisBtn.innerText = "Analisar Novamente";
        return;
    }

    const prompt = `
        Você é um personal trainer e fisioterapeuta especialista em biomecânica.
        Um aluno acabou de realizar o exercício: ${exerciseName}.
        Durante a execução, eu (o assistente de IA) notei os seguintes desvios principais:
        ${feedbackArray.map(f => `- ${f}`).join('\n')}

        Com base *apenas* nesta lista de desvios, gere um relatório para o aluno. O relatório deve ser:
        1.  **Encorajador:** Comece com uma frase positiva.
        2.  **Direto:** Explique quais foram os principais desvios (use a lista acima).
        3.  **Acionável:** Dê 2-3 dicas claras e práticas em formato de lista (bullet points) sobre "o que precisa mudar" para corrigir esses desvios na próxima série.
        4.  **Formatado em Markdown:** Use listas e negrito para ser fácil de ler.
    `;

    try {
        const response = await fetch('https://api.cohere.com/v1/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${COHERE_API_KEY}` },
            body: JSON.stringify({ message: prompt, model: 'command-r-08-2024', temperature: 0.3 }),
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(`Erro na API Cohere: ${err.message || response.statusText}`);
        }

        const result = await response.json();
        
        if (result.text) {
            clearFeedback();
            const formattedReport = marked.parse(result.text);
            const li = document.createElement('li');
            li.innerHTML = formattedReport;
            feedbackList.appendChild(li);
        } else {
            throw new Error("Resposta da API Cohere não continha o campo 'text'.");
        }

    } catch (error) {
        console.error("Erro ao chamar Cohere:", error);
        clearFeedback();
        addFeedback(`Erro ao gerar relatório: ${error.message}`, "error");
    } finally {
        startAnalysisBtn.disabled = false;
        startAnalysisBtn.innerText = "Analisar Novamente";
        isAnalyzing = false;
    }
}

// === FUNÇÕES AUXILIARES DE FEEDBACK ===

function clearFeedback() {
    // ... (código existente sem alteração)
    feedbackList.innerHTML = "";
}

function addFeedback(message, type = "info") {
    // ... (código existente sem alteração)
    const li = document.createElement("li");
    let icon = "ℹ️";
    let colorClass = "fb-info";

    switch (type) {
        case "success": icon = "✅"; colorClass = "fb-success"; break;
        case "warning": icon = "⚠️"; colorClass = "fb-warning"; break;
        case "error": icon = "❌"; colorClass = "fb-error"; break;
    }
    
    li.className = colorClass;
    li.innerHTML = `${icon} ${message}`;
    feedbackList.appendChild(li);

}


