import { POSE_LANDMARKS, calculateAngle } from '../../utils.js';

export function analisarRoscaBiceps(landmarks) {
    const feedback = [];
    const p = POSE_LANDMARKS;

    const l_shoulder = landmarks[p.LEFT_SHOULDER];
    const l_elbow = landmarks[p.LEFT_ELBOW];
    const l_wrist = landmarks[p.LEFT_WRIST];
    const l_hip = landmarks[p.LEFT_HIP];

    if (!l_shoulder || !l_elbow || !l_wrist || !l_hip) {
        feedback.push("Visão incompleta. Mostre o ombro, cotovelo, pulso e quadril.");
        return feedback;
    }
    
    // Checa o ângulo Quadril-Ombro-Cotovelo (visão lateral)
    // Se esse ângulo mudar muito, o ombro está "balançando"
    const shoulder_swing_angle = calculateAngle(l_hip, l_shoulder, l_elbow);
    
    if (shoulder_swing_angle > 30) { // Um valor pequeno é normal, mais que 30 é balanço
        feedback.push("Movimento excessivo do ombro. Mantenha o cotovelo fixo ao lado do corpo.");
    }

    // Checa amplitude
    const elbow_angle = calculateAngle(l_shoulder, l_elbow, l_wrist);
    if (elbow_angle > 160) {
        feedback.push("Fase de descida (braço estendido).");
    } else if (elbow_angle < 35) {
        feedback.push("Fase de contração máxima.");
    }

    return feedback;
}