export const levelHeights: Record<number, number> = {};

export const setLevelHeight = (levelId: number, height: number) => {
    levelHeights[levelId] = height;
};

export const getTotalHeightUpTo = (levelId: number): number => {
    let total = 0;
    for (let i = 1; i < levelId; i++) {
        total += levelHeights[i] || 580; // fallback a 580 si no está medido
    }
    return total;
};