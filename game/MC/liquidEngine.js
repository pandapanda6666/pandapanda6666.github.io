/**
 * liquidEngine.js - 獨立後端高性能流體（水與岩漿）物理運算模組
 * 採用階梯非同步掃描演算法，防堵 CPU 阻塞
 */

const MAX_WATER_LEVEL = 8;
const MAX_LAVA_LEVEL = 4;

/**
 * 取得特定座標的方塊（整合伺服器主記憶體世界資料）
 */
function getBlock(world, x, y, z) {
    const key = `${x},${y},${z}`;
    if (world.modifiedBlocks[key] !== undefined) {
        return world.modifiedBlocks[key];
    }
    // 地底預設為石頭
    if (y === 0) return 7; // 基岩
    if (y < 8) return 3; // 石頭
    return null; // 空氣
}

/**
 * 更新伺服器端的方塊狀態
 */
function setBlock(world, x, y, z, type) {
    const key = `${x},${y},${z}`;
    if (type === null) {
        delete world.modifiedBlocks[key];
    } else {
        world.modifiedBlocks[key] = type;
    }
}

/**
 * 伺服器端流體運算進入點 (由主伺服器定時循環呼叫)
 * @param {Object} world - 當前房間的世界資料
 * @param {Object} io - Socket.io 實例，用來廣播變更
 * @param {string} roomId - 房間 ID
 */
function processLiquids(world, io, roomId) {
    if (!world) return;
    world.liquidQueue = world.liquidQueue || new Set();
    world.liquidMeta = world.liquidMeta || {};

    if (world.liquidQueue.size === 0) return;

    const nextQueue = new Set();
    const batchUpdates = [];

    // 每次 Tick 限制最大運算方塊數，防止單一 Tick 耗時過長
    const list = Array.from(world.liquidQueue).slice(0, 2000);
    for (let key of list) {
        world.liquidQueue.delete(key);
        const [x, y, z] = key.split(',').map(Number);
        const type = getBlock(world, x, y, z);

        // 如果該方塊已經不再是液體，則不處理
        if (type !== 6 && type !== 50) {
            delete world.liquidMeta[key];
            continue;
        }

        const maxLevel = type === 6 ? MAX_WATER_LEVEL : MAX_LAVA_LEVEL;
        let currentLevel = world.liquidMeta[key] || maxLevel;

        // 1. 向下流動
        const downY = y - 1;
        if (downY >= 0) {
            const downBlock = getBlock(world, x, downY, z);
            if (downBlock === null) {
                // 下方是空氣，直接流下，重設為最大高度
                const downKey = `${x},${downY},${z}`;
                setBlock(world, x, downY, z, type);
                world.liquidMeta[downKey] = maxLevel;
                
                batchUpdates.push({ x, y: downY, z, type });
                nextQueue.add(downKey);
                nextQueue.add(key); // 本身繼續流動
                continue;
            }
        }

        // 2. 水平擴散 (如果下方遇到阻礙)
        if (currentLevel > 1) {
            const adj = [
                [1, 0, 0], [-1, 0, 0],
                [0, 0, 1], [0, 0, -1]
            ];
            for (let [dx, dy, dz] of adj) {
                const nx = x + dx;
                const nz = z + dz;
                const nBlock = getBlock(world, nx, y, nz);

                if (nBlock === null) {
                    const nKey = `${nx},${y},${nz}`;
                    setBlock(world, nx, y, nz, type);
                    // 高度遞減
                    world.liquidMeta[nKey] = currentLevel - 1;

                    batchUpdates.push({ x: nx, y, z: nz, type });
                    nextQueue.add(nKey);
                }
            }
        }
    }

    // 將本次有變更的方塊批次廣播給前端，減少 Socket 頻寬佔用
    if (batchUpdates.length > 0) {
        io.to(roomId).emit("appDataBatch", {
            action: "setBlockBatch",
            updates: batchUpdates
        });
    }

    // 繼承下一波更新佇列
    for (let nk of nextQueue) {
        world.liquidQueue.add(nk);
    }
}

module.exports = { processLiquids };