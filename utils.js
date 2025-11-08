/**
 * Constantes para os índices dos landmarks do MediaPipe Pose.
 */
export const POSE_LANDMARKS = {
    LEFT_SHOULDER: 11,
    RIGHT_SHOULDER: 12,
    LEFT_ELBOW: 13,    // <-- ADICIONADO
    RIGHT_ELBOW: 14,   // <-- ADICIONADO
    LEFT_WRIST: 15,    // <-- ADICIONADO
    RIGHT_WRIST: 16,   // <-- ADICIONADO
    LEFT_HIP: 23,
    RIGHT_HIP: 24,
    LEFT_KNEE: 25,
    RIGHT_KNEE: 26,
    LEFT_ANKLE: 27,
    RIGHT_ANKLE: 28,
    LEFT_FOOT_INDEX: 31,
    RIGHT_FOOT_INDEX: 32,
};

/**
 * Calcula o ângulo entre três pontos (a, b, c) onde 'b' é o vértice.
 * Os pontos devem ser objetos {x, y, z}.
 */
export function calculateAngle(a, b, c) {
    try {
        // Vetor v1 = a - b
        const v1 = { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
        // Vetor v2 = c - b
        const v2 = { x: c.x - b.x, y: c.y - b.y, z: c.z - b.z };

        // Produto escalar
        const dot = v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
        
        // Magnitudes
        const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y + v1.z * v1.z);
        const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y + v2.z * v2.z);
        
        // Cosseno do ângulo
        let cosTheta = dot / (mag1 * mag2);
        
        // Clamp para evitar erros de precisão do float
        cosTheta = Math.min(Math.max(cosTheta, -1), 1);

        // Converte de radianos para graus
        const angle = Math.acos(cosTheta) * (180.0 / Math.PI);
        return angle;
    
    } catch (error) {
        return null; // Retorna null se algum ponto não estiver visível
    }
}