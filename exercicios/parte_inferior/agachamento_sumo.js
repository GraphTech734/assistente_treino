import { POSE_LANDMARKS } from '../../utils.js';

/**
 * Lógica de análise para AGAGACHAMENTO SUMÔ (Visão Frontal)
 * @param {Array} landmarks - Os landmarks detectados pelo MediaPipe.
 * @returns {Array} - Uma lista de strings de feedback.
 */
export function analisarAgachamentoSumo(landmarks) {
    const feedback = [];
    const p = POSE_LANDMARKS;
    const leftHip = landmarks[p.LEFT_HIP];
    const leftKnee = landmarks[p.LEFT_KNEE];
    const leftAnkle = landmarks[p.LEFT_ANKLE];
    const rightHip = landmarks[p.RIGHT_HIP];
    const rightKnee = landmarks[p.RIGHT_KNEE];
    // A LINHA ABAIXO FOI CORRIGIDA (ANKLE em vez de ANLE)
    const rightAnkle = landmarks[p.RIGHT_ANKLE];

    if (!leftKnee || !leftAnkle || !rightKnee || !rightAnkle || !leftHip || !rightHip) {
        feedback.push("Visão frontal incompleta.");
        return feedback;
    }

    const isSquatting = leftKnee.y > leftHip.y && rightKnee.y > rightHip.y;

    if (isSquatting) {
        if (leftKnee.x > leftAnkle.x) {
            feedback.push("Joelho esquerdo caindo para dentro (valgo).");
        } else {
            feedback.push("Bom alinhamento do joelho esquerdo.");
        }
        
        if (rightKnee.x < rightAnkle.x) {
            feedback.push("Joelho direito caindo para dentro (valgo).");
        } else {
            feedback.push("Bom alinhamento do joelho direito.");
        }
        
        const kneeDiff = Math.abs(leftKnee.y - rightKnee.y);
        if (kneeDiff > 0.05) {
            feedback.push("Desequilíbrio na altura dos joelhos (quadril desalinhado).");
        }

    } else {
        feedback.push("Fase de subida ou descida.");
    }
    
    return feedback;
}