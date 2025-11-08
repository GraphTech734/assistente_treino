import { POSE_LANDMARKS } from '../../utils.js';

export function analisarSupinoHalteres(landmarks) {
    const feedback = [];
    const p = POSE_LANDMARKS;

    const l_wrist = landmarks[p.LEFT_WRIST];
    const r_wrist = landmarks[p.RIGHT_WRIST];
    const l_shoulder = landmarks[p.LEFT_SHOULDER];
    const r_shoulder = landmarks[p.RIGHT_SHOULDER];

    if (!l_wrist || !r_wrist || !l_shoulder || !r_shoulder) {
        feedback.push("Visão incompleta. Mostre os ombros e pulsos.");
        return feedback;
    }

    if (l_wrist.y > l_shoulder.y && r_wrist.y > r_shoulder.y) {
        const wrist_diff_y = Math.abs(l_wrist.y - r_wrist.y);
        const wrist_diff_x = Math.abs((l_wrist.x - l_shoulder.x) - (r_shoulder.x - r_wrist.x));

        if (wrist_diff_y > 0.06) { // Tolerância um pouco maior
            feedback.push("Assimetria vertical: um braço está mais baixo que o outro.");
        }
        if (wrist_diff_x > 0.07) {
            feedback.push("Assimetria horizontal: um braço está mais aberto que o outro.");
        }
    }
    
    return feedback;
}