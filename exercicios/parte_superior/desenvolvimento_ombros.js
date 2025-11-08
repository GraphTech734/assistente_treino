import { POSE_LANDMARKS, calculateAngle } from '../../utils.js';

// A palavra 'export' aqui na frente da função é a correção
export function analisarDesenvolvimentoOmbros(landmarks) {
    const feedback = [];
    const p = POSE_LANDMARKS;

    const l_wrist = landmarks[p.LEFT_WRIST];
    const r_wrist = landmarks[p.RIGHT_WRIST];
    const l_elbow = landmarks[p.LEFT_ELBOW];
    const r_elbow = landmarks[p.RIGHT_ELBOW];
    const l_shoulder = landmarks[p.LEFT_SHOULDER];
    // CORREÇÃO: Adiciona a definição do quadril
    const l_hip = landmarks[p.LEFT_HIP]; 

    // CORREÇÃO: Adiciona o quadril na verificação
    if (!l_wrist || !r_wrist || !l_elbow || !r_elbow || !l_shoulder || !l_hip) {
        feedback.push("Visão incompleta. Mostre os ombros, cotovelos, pulsos e quadril.");
        return feedback;
    }

    // Simetria (Plano Frontal)
    const wrist_diff_y = Math.abs(l_wrist.y - r_wrist.y);
    if (wrist_diff_y > 0.05) {
        feedback.push("Assimetria: um braço está subindo mais que o outro.");
    }

    // Amplitude (Plano Lateral)
    const shoulder_angle = calculateAngle(l_elbow, l_shoulder, l_hip); // Agora 'l_hip' está definido
    
    // Na descida, cotovelo deve passar de 90 graus (ou linha do ombro)
    if (l_wrist.y > l_elbow.y && shoulder_angle < 80) {
         feedback.push("Amplitude limitada na descida. Tente descer mais.");
    }
    // Na subida, deve estender
    if (l_wrist.y < l_shoulder.y && shoulder_angle < 160) {
        feedback.push("Falta extensão completa no topo.");
    }

    return feedback;
}