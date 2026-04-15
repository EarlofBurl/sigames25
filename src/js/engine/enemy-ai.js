import { getEnemyUnits, getPlayerUnits, setEnemyUnitPosition, setEnemyUnitMp, setEnemyUnitMana, setEnemyHasCast, applyEffectToEnemy } from '../entities/units.js';
import { log } from '../engine/console.js';
import { findPathAndCost } from '../engine/movement-system.js';
import { executeEnemyCombat, predictCombat } from '../engine/combat-system.js';
import { isPassable } from '../engine/terrain.js';

const WEAPON_TRIANGLE = {
    sword: 'axe',
    axe: 'lance',
    lance: 'sword'
};

const TERRAIN_SCORE = {
    fortress: 5,
    city: 4,
    hills: 3,
    forest: 3,
    plains: 0,
    road: -1,
    swamp: -5,
    water: -999,
    bridge: 0,
    mountain: -999
};

function isOccupiedByAnyUnit(row, col, excludeEnemyIndex = -1) {
    const players = getPlayerUnits();
    const enemies = getEnemyUnits();
    return players.some(p => p.row === row && p.col === col) ||
           enemies.some((e, idx) => e.row === row && e.col === col && idx !== excludeEnemyIndex);
}

function hasFlankingAlly(enemy, target, allEnemies) {
    const dRow = target.row - enemy.row;
    const dCol = target.col - enemy.col;
    const oppositeRow = target.row + dRow;
    const oppositeCol = target.col + dCol;
    return allEnemies.some(ally =>
        ally.id !== enemy.id &&
        ally.row === oppositeRow &&
        ally.col === oppositeCol
    );
}

function getTerrainScoreAt(row, col, grid) {
    const cell = grid[row] && grid[row][col];
    if (!cell) return -999;
    return TERRAIN_SCORE[cell.type] !== undefined ? TERRAIN_SCORE[cell.type] : 0;
}

function scoreTarget(enemy, player, distance, grid, allEnemies) {
    let score = 0;
    const enemyWeapon = enemy.weapon || null;
    const playerWeapon = player.weapon || null;

    if (enemyWeapon && playerWeapon) {
        if (WEAPON_TRIANGLE[enemyWeapon] === playerWeapon) {
            score += 30;
        } else if (WEAPON_TRIANGLE[playerWeapon] === enemyWeapon) {
            score -= 20;
        }
    }

    const hpRatio = player.hp / player.maxHp;
    if (hpRatio < 0.3) {
        score += 40;
    } else if (hpRatio < 0.5) {
        score += 15;
    }

    if (hasFlankingAlly(enemy, player, allEnemies)) {
        score += 25;
    }

    const pred = predictCombat(enemy, player, distance, grid, allEnemies);
    score += pred.attackDmg * 2;
    if (pred.canCounter) {
        score -= pred.counterDmg * 1.5;
    } else {
        score += 10;
    }

    if (distance <= (enemy.range || 1)) {
        score += 20;
    } else if (distance <= (enemy.range || 1) + 1) {
        score += 5;
    }

    return score;
}

function getAggroRadius(enemy) {
    return enemy.baseSight + Math.ceil(enemy.maxMp);
}

function findBestTarget(enemy, players, grid, allEnemies) {
    let bestTarget = null;
    let bestScore = -Infinity;
    const aggroRadius = getAggroRadius(enemy);

    for (const player of players) {
        const path = findPathAndCost(
            { row: enemy.row, col: enemy.col },
            { row: player.row, col: player.col },
            grid,
            enemy.maxMp * 2,
            enemy
        );

        if (!path.path) continue;

        const distance = Math.abs(enemy.row - player.row) + Math.abs(enemy.col - player.col);

        if (path.cost > enemy.maxMp && distance > aggroRadius) continue;

        const effectiveDistance = path.cost <= enemy.maxMp ? path.cost : distance;
        const score = scoreTarget(enemy, player, effectiveDistance, grid, allEnemies);

        if (score > bestScore) {
            bestScore = score;
            bestTarget = player;
        }
    }

    return bestTarget;
}

function findHealTarget(enemy, enemies, grid) {
    if (!enemy.spells || enemy.spells.length === 0) return null;

    const healSpell = enemy.spells.find(s => s.effect === 'heal');
    if (!healSpell) return null;
    if (enemy.mana < healSpell.manaCost) return null;

    let bestAlly = null;
    let bestWoundRatio = 0;

    for (const ally of enemies) {
        if (ally.id === enemy.id) continue;
        const dist = Math.abs(enemy.row - ally.row) + Math.abs(enemy.col - ally.col);
        if (dist > (healSpell.range || 1)) continue;
        if (ally.hp >= ally.maxHp) continue;

        const woundRatio = 1 - (ally.hp / ally.maxHp);
        if (woundRatio > bestWoundRatio) {
            bestWoundRatio = woundRatio;
            bestAlly = ally;
        }
    }

    return bestAlly ? { target: bestAlly, spell: healSpell } : null;
}

function findDebuffTarget(enemy, players, grid) {
    if (!enemy.spells || enemy.spells.length === 0) return null;

    const debuffSpell = enemy.spells.find(s => s.effect === 'debuff_attack' || s.effect === 'debuff_defense');
    if (!debuffSpell) return null;
    if (enemy.mana < debuffSpell.manaCost) return null;

    let bestTarget = null;
    let bestScore = -Infinity;

    for (const player of players) {
        const dist = Math.abs(enemy.row - player.row) + Math.abs(enemy.col - player.col);
        if (dist > (debuffSpell.range || 1)) continue;

        let targetScore = 0;
        const hpRatio = player.hp / player.maxHp;
        if (hpRatio < 0.3) targetScore += 30;
        else if (hpRatio < 0.5) targetScore += 15;

        if (debuffSpell.effect === 'debuff_attack') targetScore += player.attack * 3;
        if (debuffSpell.effect === 'debuff_defense') targetScore += player.defense * 3;

        if (targetScore > bestScore) {
            bestScore = targetScore;
            bestTarget = player;
        }
    }

    return bestTarget ? { target: bestTarget, spell: debuffSpell } : null;
}

async function executeEnemySpell(enemy, target, spell, onAction, onEnemyAction, weiterBtn) {
    const healAmount = spell.effect === 'heal' ? spell.value : 0;
    const targetName = spell.target === 'ally' ? 'Verbündeten' : 'Feind';

    applyEffectToEnemy(target.id, {
        effect: spell.effect,
        value: spell.value,
        duration: spell.duration,
        caster: enemy.name
    });

    setEnemyUnitMana(enemy.id, enemy.mana - spell.manaCost);
    setEnemyHasCast(enemy.id, true);

    if (healAmount > 0) {
        log(`${enemy.name} heilt ${target.name} um ${healAmount} HP! (${target.hp}/${target.maxHp})`, 'enemy');
    } else {
        log(`${enemy.name} wirkt ${spell.name} auf ${target.name}!`, 'enemy');
    }

    if (onEnemyAction) {
        onEnemyAction('spell', enemy, target, { spell, healAmount });
    } else {
        waitForMs(2000);
    }

    if (onAction) onAction();
}

function findKitingPosition(enemy, target, grid, enemyIndex) {
    const enemyRange = enemy.range || 1;
    const directions = [
        { r: -1, c: 0 }, { r: 1, c: 0 }, { r: 0, c: -1 }, { r: 0, c: 1 },
        { r: -2, c: 0 }, { r: 2, c: 0 }, { r: 0, c: -2 }, { r: 0, c: 2 },
        { r: -1, c: -1 }, { r: -1, c: 1 }, { r: 1, c: -1 }, { r: 1, c: 1 }
    ];

    let bestPos = null;
    let bestScore = -Infinity;

    for (const dir of directions) {
        const row = enemy.row + dir.r;
        const col = enemy.col + dir.c;

        if (!isPassable(row, col, grid, enemy) || isOccupiedByAnyUnit(row, col, enemyIndex)) continue;

        const res = findPathAndCost(
            { row: enemy.row, col: enemy.col },
            { row, col },
            grid,
            enemy.maxMp,
            enemy
        );

        if (!res.path || res.cost > enemy.maxMp) continue;

        const distAfter = Math.abs(row - target.row) + Math.abs(col - target.col);

        if (distAfter > enemyRange) {
            let posScore = getTerrainScoreAt(row, col, grid) * 2;
            posScore += distAfter * 2;
            posScore -= res.cost;

            if (posScore > bestScore || bestPos === null) {
                bestScore = posScore;
                bestPos = { row, col, cost: res.cost };
            }
        }
    }

    return bestPos;
}

function findRetreatPosition(enemy, grid, enemyIndex) {
    const directions = [
        { r: -1, c: 0 }, { r: 1, c: 0 }, { r: 0, c: -1 }, { r: 0, c: 1 },
        { r: -2, c: 0 }, { r: 2, c: 0 }, { r: 0, c: -2 }, { r: 0, c: 2 },
        { r: -1, c: -1 }, { r: -1, c: 1 }, { r: 1, c: -1 }, { r: 1, c: 1 }
    ];

    let bestPos = null;
    let bestScore = -Infinity;

    for (const dir of directions) {
        const row = enemy.row + dir.r;
        const col = enemy.col + dir.c;

        if (!isPassable(row, col, grid, enemy) || isOccupiedByAnyUnit(row, col, enemyIndex)) continue;

        const res = findPathAndCost(
            { row: enemy.row, col: enemy.col },
            { row, col },
            grid,
            enemy.maxMp,
            enemy
        );

        if (!res.path || res.cost > enemy.maxMp) continue;

        let posScore = getTerrainScoreAt(row, col, grid) * 3;
        posScore -= res.cost;

        if (posScore > bestScore || bestPos === null) {
            bestScore = posScore;
            bestPos = { row, col, cost: res.cost };
        }
    }

    return bestPos;
}

function createWeiterButton() {
    const btn = document.createElement('button');
    btn.textContent = 'Weiter ▶';
    btn.style.cssText = 'position:fixed;bottom:180px;right:20px;padding:10px 20px;font-size:16px;background:#e53935;color:#fff;border:none;border-radius:5px;cursor:pointer;z-index:100;';
    document.body.appendChild(btn);
    return btn;
}

function removeWeiterButton(btn) {
    if (btn && btn.parentNode) btn.parentNode.removeChild(btn);
}

function waitOrSkip(btn, ms) {
    return new Promise(resolve => {
        let resolved = false;
        const timeout = setTimeout(() => {
            if (!resolved) { resolved = true; resolve(); }
        }, ms);
        if (btn) {
            btn.onclick = () => {
                if (!resolved) {
                    clearTimeout(timeout);
                    resolved = true;
                    resolve();
                }
            };
        }
    });
}

function waitForMs(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function executeEnemyTurn(grid, onAction = null, onEnemyAction = null) {
    const enemies = getEnemyUnits();
    const players = getPlayerUnits();
    const weiterBtn = createWeiterButton();

    log('Feindliche Phase startet...', 'enemy');
    await waitOrSkip(weiterBtn, 800);

    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        if (!enemy) continue;

        const enemyRange = enemy.range || 1;
        const hpRatio = enemy.hp / enemy.maxHp;
        const isBoss = enemy.traits && enemy.traits.includes('boss');
        const hasHealSpell = enemy.spells && enemy.spells.some(s => s.effect === 'heal');
        const hasDebuffSpell = enemy.spells && enemy.spells.some(s => s.effect === 'debuff_attack' || s.effect === 'debuff_defense');

        if (hpRatio < 0.25) {
            const retreatPos = findRetreatPosition(enemy, grid, i);
            if (retreatPos) {
                const fromPos = { row: enemy.row, col: enemy.col };
                setEnemyUnitPosition(enemy.id, retreatPos.row, retreatPos.col);
                setEnemyUnitMp(enemy.id, enemy.mp - retreatPos.cost);
                if (onAction) onAction();
                if (onEnemyAction) await onEnemyAction('move', enemy, null, { from: fromPos, to: retreatPos });
                else await waitOrSkip(weiterBtn, 2000);
                log(`${enemy.name} zieht sich auf ein sicheres Feld zurück! (${enemy.hp}/${enemy.maxHp} HP)`, 'enemy');
                await waitOrSkip(weiterBtn, 500);
                continue;
            }
        }

        if (isBoss) {
            const bossTarget = findBestTarget(enemy, players, grid, enemies);
            if (bossTarget) {
                const distToTarget = Math.abs(enemy.row - bossTarget.row) + Math.abs(enemy.col - bossTarget.col);

                if (hasDebuffSpell && enemy.mana > 0) {
                    const debuffAction = findDebuffTarget(enemy, players, grid);
                    if (debuffAction) {
                        await executeEnemySpell(enemy, debuffAction.target, debuffAction.spell, onAction, onEnemyAction, weiterBtn);
                        await waitOrSkip(weiterBtn, 2000);
                    }
                }

                if (distToTarget <= enemyRange) {
                    const pred = predictCombat(enemy, bossTarget, distToTarget, grid, enemies);
                    executeEnemyCombat(enemy, i, bossTarget, distToTarget);
                    if (onAction) onAction();
                    if (onEnemyAction) await onEnemyAction('attack', enemy, bossTarget, pred);
                    else await waitOrSkip(weiterBtn, 2000);
                }
            } else {
                log(`${enemy.name} hält die Stellung.`, 'enemy');
            }
            await waitOrSkip(weiterBtn, 500);
            continue;
        }

        if (hasHealSpell && enemy.mana > 0 && !enemy.hasCast) {
            const healAction = findHealTarget(enemy, enemies, grid);
            if (healAction) {
                await executeEnemySpell(enemy, healAction.target, healAction.spell, onAction, onEnemyAction, weiterBtn);
                await waitOrSkip(weiterBtn, 2000);

                const dist = Math.abs(enemy.row - healAction.target.row) + Math.abs(enemy.col - healAction.target.col);
                if (dist <= 1) {
                    await waitOrSkip(weiterBtn, 500);
                    continue;
                }

                const moveToward = findPathAndCost(
                    { row: enemy.row, col: enemy.col },
                    { row: healAction.target.row, col: healAction.target.col },
                    grid,
                    enemy.maxMp,
                    enemy
                );

                if (moveToward.path && moveToward.cost <= enemy.maxMp) {
                    const step = moveToward.path[Math.min(1, moveToward.path.length - 1)];
                    if (step && (step.row !== enemy.row || step.col !== enemy.col)) {
                        const fromPos = { row: enemy.row, col: enemy.col };
                        setEnemyUnitPosition(enemy.id, step.row, step.col);
                        setEnemyUnitMp(enemy.id, enemy.mp - moveToward.cost);
                        if (onAction) onAction();
                        if (onEnemyAction) await onEnemyAction('move', enemy, null, { from: fromPos, to: step });
                        else await waitOrSkip(weiterBtn, 2000);
                    }
                }
                await waitOrSkip(weiterBtn, 500);
                continue;
            }
        }

        const target = findBestTarget(enemy, players, grid, enemies);

        if (!target) {
            if (hpRatio < 0.25) {
                log(`${enemy.name} ist zu verwundet und sieht keine Ziele.`, 'enemy');
            } else {
                log(`${enemy.name} sieht keine lohnenden Ziele.`, 'enemy');
            }
            await waitOrSkip(weiterBtn, 500);
            continue;
        }

        const distance = Math.abs(enemy.row - target.row) + Math.abs(enemy.col - target.col);

        if (enemyRange > 1) {
            if (distance === 1) {
                const kitePos = findKitingPosition(enemy, target, grid, i);
                if (kitePos) {
                    const fromPos = { row: enemy.row, col: enemy.col };
                    setEnemyUnitPosition(enemy.id, kitePos.row, kitePos.col);
                    setEnemyUnitMp(enemy.id, enemy.mp - kitePos.cost);
                    if (onAction) onAction();
                    if (onEnemyAction) await onEnemyAction('move', enemy, null, { from: fromPos, to: kitePos });
                    else await waitOrSkip(weiterBtn, 2000);
                    log(`${enemy.name} weicht zurück und schiesst aus der Distanz!`, 'enemy');

                    const newDist = Math.abs(enemy.row - target.row) + Math.abs(enemy.col - target.col);
                    if (newDist <= enemyRange) {
                        const pred = predictCombat(enemy, target, newDist, grid, enemies);
                        executeEnemyCombat(enemy, i, target, newDist);
                        if (onAction) onAction();
                        if (onEnemyAction) await onEnemyAction('attack', enemy, target, pred);
                        else await waitOrSkip(weiterBtn, 2000);
                    }
                    continue;
                }
            }

            if (distance <= enemyRange) {
                const pred = predictCombat(enemy, target, distance, grid, enemies);
                executeEnemyCombat(enemy, i, target, distance);
                if (onAction) onAction();
                if (onEnemyAction) await onEnemyAction('attack', enemy, target, pred);
                else await waitOrSkip(weiterBtn, 2000);
                continue;
            }

            let bestPos = null;
            let bestScore = -Infinity;

            for (let r = target.row - enemyRange; r <= target.row + enemyRange; r++) {
                for (let c = target.col - enemyRange; c <= target.col + enemyRange; c++) {
                    const distToTarget = Math.abs(r - target.row) + Math.abs(c - target.col);
                    if (distToTarget <= enemyRange && isPassable(r, c, grid, enemy) && !isOccupiedByAnyUnit(r, c, i)) {
                        const res = findPathAndCost({ row: enemy.row, col: enemy.col }, { row: r, col: c }, grid, enemy.maxMp, enemy);
                        if (res.path && res.cost <= enemy.maxMp) {
                            const terrainScore = getTerrainScoreAt(r, c, grid) * 2;
                            const distScore = distToTarget === enemyRange ? 5 : 0;
                            const posScore = res.cost + terrainScore - distScore;

                            if (posScore < bestScore || bestPos === null) {
                                bestScore = posScore;
                                bestPos = { row: r, col: c, cost: res.cost };
                            }
                        }
                    }
                }
            }

            if (bestPos) {
                const fromPos = { row: enemy.row, col: enemy.col };
                setEnemyUnitPosition(enemy.id, bestPos.row, bestPos.col);
                setEnemyUnitMp(enemy.id, enemy.mp - bestPos.cost);
                if (onAction) onAction();
                if (onEnemyAction) await onEnemyAction('move', enemy, null, { from: fromPos, to: bestPos });
                else await waitOrSkip(weiterBtn, 2000);

                const newDist = Math.abs(enemy.row - target.row) + Math.abs(enemy.col - target.col);
                if (newDist <= enemyRange) {
                    const pred = predictCombat(enemy, target, newDist, grid, enemies);
                    executeEnemyCombat(enemy, i, target, newDist);
                    if (onAction) onAction();
                    if (onEnemyAction) await onEnemyAction('attack', enemy, target, pred);
                    else await waitOrSkip(weiterBtn, 2000);
                }
                continue;
            }
        }

        if (distance === 1) {
            const pred = predictCombat(enemy, target, 1, grid, enemies);
            executeEnemyCombat(enemy, i, target, 1);
            if (onAction) onAction();
            if (onEnemyAction) await onEnemyAction('attack', enemy, target, pred);
            else await waitOrSkip(weiterBtn, 2000);
            continue;
        }

        const adjacents = [
            { r: -1, c: 0 }, { r: 1, c: 0 }, { r: 0, c: -1 }, { r: 0, c: 1 }
        ];

        let bestTargetPos = null;
        let bestMoveScore = -Infinity;

        for (let adj of adjacents) {
            const targetRow = target.row + adj.r;
            const targetCol = target.col + adj.c;

            if (isPassable(targetRow, targetCol, grid, enemy) && !isOccupiedByAnyUnit(targetRow, targetCol, i)) {
                const res = findPathAndCost(
                    { row: enemy.row, col: enemy.col },
                    { row: targetRow, col: targetCol },
                    grid,
                    enemy.maxMp,
                    enemy
                );

                if (res.path && res.cost <= enemy.maxMp) {
                    const terrainScore = getTerrainScoreAt(targetRow, targetCol, grid) * 2;
                    const moveScore = res.cost + terrainScore;

                    if (moveScore < bestMoveScore || bestTargetPos === null) {
                        bestMoveScore = moveScore;
                        bestTargetPos = { row: targetRow, col: targetCol, cost: res.cost };
                    }
                }
            }
        }

        if (bestTargetPos) {
            const fromPos = { row: enemy.row, col: enemy.col };
            setEnemyUnitPosition(enemy.id, bestTargetPos.row, bestTargetPos.col);
            setEnemyUnitMp(enemy.id, enemy.mp - bestTargetPos.cost);
            if (onAction) onAction();
            if (onEnemyAction) await onEnemyAction('move', enemy, null, { from: fromPos, to: bestTargetPos });
            else await waitOrSkip(weiterBtn, 2000);

            log(`${enemy.name} rückt auf ${target.name} vor.`, 'enemy');

            const newDist = Math.abs(enemy.row - target.row) + Math.abs(enemy.col - target.col);
            if (newDist === 1) {
                const pred = predictCombat(enemy, target, 1, grid, enemies);
                executeEnemyCombat(enemy, i, target, 1);
                if (onAction) onAction();
                if (onEnemyAction) await onEnemyAction('attack', enemy, target, pred);
                else await waitOrSkip(weiterBtn, 2000);
            }
        } else {
            log(`${enemy.name} findet keinen Weg zu ${target.name}.`, 'default');
        }

        await waitOrSkip(weiterBtn, 500);
    }

    removeWeiterButton(weiterBtn);
    log('Feindliche Phase beendet.');
}