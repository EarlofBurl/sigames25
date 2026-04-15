// scoring-system.js
// Berechnet die Reputation nach Missionsende

export function calculateReputation(mission, missionState, turnCount, defeatedEnemies) {
    const base = mission.baseReputation || 100;
    const targetRounds = mission.targetRounds || 20;

    const warTrophy = defeatedEnemies.reduce((sum, e) => sum + (e.maxHp || e.hp || 0), 0);

    const strategicPoints = Object.values(missionState.capturedLocations || {})
        .filter(owner => owner === 'player').length * 25;

    const golfBonus = Math.max(0, (targetRounds - turnCount) * 10);

    const total = base + warTrophy + strategicPoints + golfBonus;

    return { base, warTrophy, strategicPoints, golfBonus, total };
}

export function checkVictoryCondition(mission, missionState, playerUnits, enemyUnits, turnCount) {
    const condition = mission.defeatCondition || 'defeat_all';
    const alivePlayers = playerUnits.filter(u => u.hp > 0);
    const aliveEnemies = enemyUnits.filter(u => u.hp > 0);

    switch (condition) {
        case 'defeat_all':
            return aliveEnemies.length === 0 ? 'victory' : null;

        case 'defeat_boss': {
            const bossAlive = aliveEnemies.some(e => e.traits && e.traits.includes('boss'));
            if (!bossAlive) return 'victory';
            break;
        }

        case 'survive_turns':
            if (alivePlayers.length > 0 && turnCount >= (mission.targetRounds || 20)) {
                return 'victory';
            }
            break;

        case 'occupy_location': {
            const target = mission.occupyTarget;
            if (target && missionState.capturedLocations && missionState.capturedLocations[`${target.row},${target.col}`] === 'player') {
                return 'victory';
            }
            break;
        }

        case 'victory_points': {
            const heldLocations = Object.values(missionState.capturedLocations || {}).filter(o => o === 'player').length;
            if (heldLocations >= (mission.requiredVictoryPoints || 2)) {
                return 'victory';
            }
            break;
        }
    }

    if (alivePlayers.length === 0) return 'defeat';

    return null;
}
