import { POSE_LANDMARKS, calculateAngle } from '../../utils.js';

export function analisarSupinoBarra(landmarks) {
    const feedback = [];
    const p = POSE_LANDMARKS;

    const l_wrist = landmarks[p.LEFT_WRIST];
    const r_wrist = landmarks[p.RIGHT_WRIST];
    const l_elbow = landmarks[p.LEFT_ELBOW];
    const r_elbow = landmarks[p.RIGHT_ELBOW];
    const l_shoulder = landmarks[p.LEFT_SHOULDER];
    
    if (!l_wrist || !r_wrist || !l_elbow || !r_elbow || !l_shoulder) {
        feedback.push("Visão incompleta. Mostre os ombros, cotovelos e pulsos.");
        return feedback;
    }

    // Só analisa na fase de descida (pulsos abaixo dos ombros)
    if (l_wrist.y > l_shoulder.y && r_wrist.y > r_shoulder.y) {
        
        // 1. Simetria (Plano Frontal)
        const wrist_diff_y = Math.abs(l_wrist.y - r_wrist.y);
        if (wrist_diff_y > 0.05) { // 5% de diferença na altura
            feedback.push("Assimetria na barra: um lado está descendo mais rápido.");
        }

        // 2. Ângulo Cotovelo (Visão 45°)
        // Um ângulo muito aberto (>100) ou muito fechado (<70) pode ser lesivo
        const elbow_angle_l = calculateAngle(l_shoulder, l_elbow, l_wrist);
        if (elbow_angle_l > 100) {
            feedback.push("Cotovelo esquerdo muito aberto (flare).");
        } else if (elbow_angle_l < 70) {
            feedback.push("Cotovelo esquerdo muito fechado (tuck).");
        }
    }

    return feedback;
}