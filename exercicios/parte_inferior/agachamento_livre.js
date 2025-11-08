import { POSE_LANDMARKS, calculateAngle } from '../../utils.js';

/**
 * Lógica de análise para AGAGACHAMENTO LIVRE (Visão Lateral)
 * @param {Array} landmarks - Os landmarks detectados pelo MediaPipe.
 * @returns {Array} - Uma lista de strings de feedback.
 */
export function analisarAgachamentoLivre(landmarks) {
    const feedback = [];
    
    const p = POSE_LANDMARKS;
    const shoulder = landmarks[p.LEFT_SHOULDER];
    const hip = landmarks[p.LEFT_HIP];
    const knee = landmarks[p.LEFT_KNEE];
    const ankle = landmarks[p.LEFT_ANKLE];

    if (!shoulder || !hip || !knee || !ankle) {
        feedback.push("Visão lateral incompleta.");
        return feedback;
    }

    const anguloQuadril = calculateAngle(shoulder, hip, knee);
    const anguloJoelho = calculateAngle(hip, knee, ankle);

    if (anguloQuadril < 150 && anguloJoelho < 160) {
        if (anguloQuadril < 90) {
            feedback.push("Boa profundidade (quadril abaixo do joelho).");
        } else {
            feedback.push("Profundidade insuficiente (tente agachar mais).");
        }

        if (anguloQuadril < 60) {
            feedback.push("Inclinação excessiva do tronco para frente.");
        }
        
        if (anguloJoelho < 70) {
             feedback.push("Joelho fechando em ângulo muito agudo.");
        }

    } else {
        feedback.push("Fase de subida ou descida.");
    }
    
    return feedback;
}