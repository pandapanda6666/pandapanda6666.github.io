// 版權所有 © 2026 PandaPanda的AI日常 (https://pandapanda6666.github.io) All Rights Reserved.
const { execSync } = require('child_process');
try { require('express'); require('socket.io'); } catch(e) { console.log('正在自動安裝所需套件...'); execSync('npm install express socket.io', { stdio: 'inherit' }); }

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*', methods: ['GET', 'POST'] } });

app.use(express.static(path.join(__dirname, 'public')));

const blockTypes = { 1: { name: '草地', t: 'grass_side' }, 2: { name: '泥土', t: 'dirt' }, 3: { name: '石頭', t: 'stone' }, 4: { name: '木頭', t: 'wood_side' }, 5: { name: '樹葉', t: 'leaves' }, 6: { name: '水', t: 'water' }, 7: { name: '基岩', t: 'bedrock' }, 8: { name: '寶箱', t: 'chest_front' }, 9: { name: '磚塊', t: 'brick' }, 10: { name: '沙子', t: 'sand' }, 11: { name: '玻璃', t: 'glass' }, 12: { name: '木板', t: 'planks' }, 13: { name: '鵝卵石', t: 'cobblestone' }, 14: { name: '金礦', t: 'gold_ore' }, 15: { name: '工作台', t: 'crafting_side' }, 16: { name: '木棍', t: 'stick', isItem: true }, 17: { name: '煤礦', t: 'coal_ore' }, 18: { name: '煤炭', t: 'coal', isItem: true }, 19: { name: '鐵礦', t: 'iron_ore' }, 20: { name: '鐵錠', t: 'iron_ingot', isItem: true }, 21: { name: '熔爐', t: 'furnace_front' }, 22: { name: '木鎬', t: 'wood_pickaxe', isItem: true }, 23: { name: '石鎬', t: 'stone_pickaxe', isItem: true }, 24: { name: '鐵鎬', t: 'iron_pickaxe', isItem: true }, 25: { name: '石磚', t: 'stone_bricks' }, 26: { name: '木劍', t: 'wood_sword', isItem: true }, 27: { name: '石劍', t: 'stone_sword', isItem: true }, 28: { name: '鐵劍', t: 'iron_sword', isItem: true }, 29: { name: '木鋤', t: 'wood_hoe', isItem: true }, 30: { name: '石鋤', t: 'stone_hoe', isItem: true }, 31: { name: '鐵鋤', t: 'iron_hoe', isItem: true }, 32: { name: '羊毛', t: 'wool' }, 33: { name: '床', t: 'bed_top' }, 34: { name: '鐵桶', t: 'bucket', isItem: true }, 35: { name: '水桶', t: 'water_bucket', isItem: true }, 36: { name: '梯子', t: 'ladder' }, 37: { name: '木門', t: 'door_top' }, 38: { name: '木階梯', t: 'planks' }, 39: { name: '石階梯', t: 'cobblestone' }, 40: { name: '地板門', t: 'trapdoor' }, 41: { name: '生肉', t: 'raw_meat', isItem: true }, 42: { name: '熟肉', t: 'cooked_meat', isItem: true }, 43: { name: '陷阱箱', t: 'trapped_chest_front' }, 44: { name: '木斧', t: 'wood_axe', isItem: true }, 45: { name: '石斧', t: 'stone_axe', isItem: true }, 46: { name: '鐵斧', t: 'iron_axe', isItem: true }, 47: { name: '木鏟', t: 'wood_shovel', isItem: true }, 48: { name: '石鏟', t: 'stone_shovel', isItem: true }, 49: { name: '鐵鏟', t: 'iron_shovel', isItem: true }, 50: { name: '岩漿', t: 'lava' }, 51: { name: '仙人掌', t: 'cactus_side' }, 52: { name: '岩漿桶', t: 'lava_bucket', isItem: true }, 53: { name: '蘋果', t: 'apple', isItem: true }, 54: { name: '樹苗', t: 'sapling', isItem: true }, 55: { name: '箭矢', t: 'arrow', isItem: true }, 100: { name: '生怪蛋(豬)', t: 'egg_pig', isItem: true, entity: 'pig' }, 101: { name: '生怪蛋(羊)', t: 'egg_sheep', isItem: true, entity: 'sheep' }, 102: { name: '生怪蛋(牛)', t: 'egg_cow', isItem: true, entity: 'cow' }, 103: { name: '生怪蛋(雞)', t: 'egg_chicken', isItem: true, entity: 'chicken' }, 104: { name: '生怪蛋(殭屍)', t: 'egg_zombie', isItem: true, entity: 'zombie' }, 105: { name: '生怪蛋(骷髏)', t: 'egg_skeleton', isItem: true, entity: 'skeleton' }, 106: { name: '生怪蛋(苦力怕)', t: 'egg_creeper', isItem: true, entity: 'creeper' }, 107: { name: '生怪蛋(蜘蛛)', t: 'egg_spider', isItem: true, entity: 'spider' } };
const RECIPES = [ { id: 'planks', pattern: [[4]], res: 12, resCount: 4 }, { id: 'crafting_table', pattern: [[12, 12], [12, 12]], res: 15, resCount: 1 }, { id: 'chest', pattern: [[12,12,12],[12,null,12],[12,12,12]], res: 8, resCount: 1 }, { id: 'stick', pattern: [[12], [12]], res: 16, resCount: 4 }, { id: 'furnace', pattern: [[13,13,13],[13,null,13],[13,13,13]], res: 21, resCount: 1 }, { id: 'wood_pickaxe', pattern: [[12,12,12],[null,16,null],[null,16,null]], res: 22, resCount: 1 }, { id: 'stone_pickaxe', pattern: [[13,13,13],[null,16,null],[null,16,null]], res: 23, resCount: 1 }, { id: 'iron_pickaxe', pattern: [[20,20,20],[null,16,null],[null,16,null]], res: 24, resCount: 1 }, { id: 'wood_sword', pattern: [[12],[12],[16]], res: 26, resCount: 1 }, { id: 'stone_sword', pattern: [[13],[13],[16]], res: 27, resCount: 1 }, { id: 'iron_sword', pattern: [[20],[20],[16]], res: 28, resCount: 1 } ];

function getToolTier(type) { if([22, 26, 29, 44, 47].includes(type)) return 1; if([23, 27, 30, 45, 48].includes(type)) return 2; if([24, 28, 31, 46, 49].includes(type)) return 3; return 0; }
function getBlockHardnessAndDrop(type, toolType) {
    const tier = getToolTier(toolType); let base = 0.5; let reqTier = 0; let isPickaxeBlock = false;
    if (type === 7) return {time: Infinity, drop: null};
    if (type === 3 || type === 13 || type === 25 || type === 39 || type === 21) { base = 1.5; reqTier = 1; isPickaxeBlock = true; }
    if (type === 17 || type === 21) { base = 3.0; reqTier = 1; isPickaxeBlock = true; }
    if (type === 19) { base = 3.0; reqTier = 2; isPickaxeBlock = true; }
    if (type === 14) { base = 3.0; reqTier = 3; isPickaxeBlock = true; }
    if (type === 4 || type === 12 || type === 15 || type === 8 || type === 43 || type === 37 || type === 38 || type === 40) { base = 1.0; if([44,45,46].includes(toolType)) base = base/(tier*2); }
    if (type === 1 || type === 2 || type === 10 || type === 50 || type === 51) { base = 0.5; if ([47, 48, 49].includes(toolType)) base = base / (tier * 2); }
    if (type === 5 || type === 11 || type === 36 || type === 32 || type === 33) base = 0.2;
    let time = base; if (isPickaxeBlock) { if (tier >= reqTier && tier > 0) time = base / (tier * 2); else time = base * 3; }
    let drop = type; if (type === 3 && tier >= reqTier) drop = 13; if (type === 3 && tier < reqTier) drop = null; if (isPickaxeBlock && tier < reqTier) drop = null;
    if (type === 17 && tier >= reqTier) drop = 18; if (type === 11 || type === 50) drop = null; 
    if (type === 5) { let rnd = Math.random(); if (rnd < 0.05) drop = 53; else if (rnd < 0.1) drop = 54; else drop = null; }
    return { time: time, drop: drop };
}

const activeWorlds = {};

function initWorld(roomId, config) {
    if (!activeWorlds[roomId]) {
        activeWorlds[roomId] = {
            seed: Math.random() * 10000,
            mode: config.mode || '生存',
            type: config.type || '普通',
            modifiedBlocks: {},
            liquids: {},
            players: {},
            entities: [],
            drops: [],
            timeOfDay: 0
        };
    }
    return activeWorlds[roomId];
}

function pseudoHash(x, z, seed) { let h = Math.sin(x * 12.9898 + z * 78.233 + seed) * 43758.5453123; return h - Math.floor(h); }
function pseudoNoise(x, z, seed) { const ix = Math.floor(x), iz = Math.floor(z); const fx = x - ix, fz = z - iz; const a = pseudoHash(ix, iz, seed), b = pseudoHash(ix+1, iz, seed), c = pseudoHash(ix, iz+1, seed), d = pseudoHash(ix+1, iz+1, seed); const ux = fx * fx * (3 - 2 * fx), uz = fz * fz * (3 - 2 * fz); return a + (b - a)*ux + (c - a)*uz + (a - b - c + d)*ux*uz; }
function getBiome(x, z, seed) { let n = pseudoNoise(x/150, z/150, seed); if (n < 0.35) return 'desert'; if (n > 0.65) return 'jungle'; return 'plains'; }
function getNoiseHeight(x, z, world) { 
    if(world.type === '超平坦') return 4; 
    const biome = getBiome(x, z, world.seed); const scale = world.type === '超巨大' ? 50 : 25; 
    let base = pseudoNoise(x/scale, z/scale, world.seed) * (world.type === '超巨大' ? 24 : 12); let detail = pseudoNoise(x/(scale/2), z/(scale/2), world.seed) * 6; 
    if (biome === 'desert') base = base * 0.5; else if (biome === 'jungle') base = base * 1.5; 
    let riverNoise = Math.abs(pseudoNoise(x/40 + 100, z/40 + 100, world.seed) - 0.5) * 2; let riverDrop = 0; if (riverNoise < 0.15) riverDrop = (0.15 - riverNoise) * 40; 
    let finalH = Math.floor(base + detail - riverDrop) + 12; if (finalH < 1) finalH = 1; return finalH; 
}
function isCave(x, y, z, world) { if (y > getNoiseHeight(x, z, world) - 3) return false; let cx = x * 0.05, cy = y * 0.1, cz = z * 0.05; let n1 = Math.sin(cx * 10 + cy * 5 + cz * 10); let n2 = Math.cos(cx * 8 - cy * 7 + cz * 8); let noise = pseudoNoise(x/20, z/20, world.seed); return (n1 * n2) + noise > 0.8; }
function getStructureBlock(x, y, z, terrainH, biome, world) {
    let cx = Math.floor(x / 32) * 32; let cz = Math.floor(z / 32) * 32; let h = pseudoHash(cx, cz, world.seed);
    if (h > 0.95) { 
        let sx = cx + 16; let sz = cz + 16; let sy = getNoiseHeight(sx, sz, world); if (sy < 10) return null; let dx = x - sx; let dy = y - sy; let dz = z - sz;
        if (biome === 'desert') { if (dx >= -4 && dx <= 4 && dz >= -4 && dz <= 4 && dy >= 0 && dy < 6) { if (dy === 0) return 25; if (dx === -4 || dx === 4 || dz === -4 || dz === 4) { if (dy === 1 && dx === 0 && dz === 4) return -1; return 10; } if (dy === 5 && dx >= -3 && dx <= 3 && dz >= -3 && dz <= 3) return 10; if (dx === 0 && dz === 0 && dy === 1) return 8; return -1; } } 
        else { if (dx >= -3 && dx <= 3 && dz >= -3 && dz <= 3 && dy >= 0 && dy < 5) { if (dy === 0) return 13; if (dx === -3 || dx === 3 || dz === -3 || dz === 3) { if (Math.abs(dx) === 3 && Math.abs(dz) === 3) return 4; if (dy === 1 && dx === 0 && dz === 3) return -1; if (dy === 2 && (dx === 0 || dz === 0)) return 11; return 12; } if (dy === 4) return 12; if (dx === 2 && dz === -2 && dy === 1) return 8; if (dx === -2 && dz === -2 && dy === 1) return 15; return -1; } }
    } return null;
}
function getTreeBlock(x, y, z, terrainH, biome, world) {
    if (world.type === '超平坦' || terrainH < 10 || biome === 'desert') return null; let density = biome === 'jungle' ? 0.85 : 0.98;
    for (let dx = -2; dx <= 2; dx++) { for (let dz = -2; dz <= 2; dz++) { const tx = x + dx; const tz = z + dz; const th = getNoiseHeight(tx, tz, world); if (th >= 10 && pseudoHash(tx, tz, world.seed) > density) { let baseHeight = biome === 'jungle' ? 7 : 4; const tHeight = baseHeight + Math.floor(pseudoHash(tx+1, tz, world.seed)*4); if (dx === 0 && dz === 0 && y > th && y <= th + tHeight) return 4; if (y >= th + tHeight - 2 && y <= th + tHeight + 2) { if (Math.abs(dx) <= 2 && Math.abs(dz) <= 2) { if (Math.abs(dx) === 2 && Math.abs(dz) === 2 && y >= th + tHeight) continue; if (dx === 0 && dz === 0 && y <= th + tHeight) continue; return 5; } } } }} return null;
}
function getBlockServer(x, y, z, world) {
    const key = `${x},${y},${z}`; if(world.modifiedBlocks[key] !== undefined) return world.modifiedBlocks[key];
    if(y === 0) return 7; const biome = getBiome(x, z, world.seed); const h = getNoiseHeight(x, z, world);
    let struct = getStructureBlock(x, y, z, h, biome, world); if (struct === -1) return null; if (struct !== null) return struct;
    if(y > h) { const tree = getTreeBlock(x, y, z, h, biome, world); if (tree) return tree; if(h < 10 && y <= 10 && y > 0) return 6; if (biome === 'desert' && y === h + 1 && pseudoHash(x*3, z*3, world.seed) > 0.99 && y > 10) { let cHeight = 1 + Math.floor(pseudoHash(x*4, z*4, world.seed)*3); if (y <= h + cHeight) return 51; } return null; }
    if (isCave(x, y, z, world)) { if (y <= 4) return 50; return null; }
    if(y === h) { if (h < 10) return 10; if (biome === 'desert') return 10; if (biome === 'jungle') return 1; return world.type === '超平坦' ? 1 : 1; }
    if(y > h - 3) { if (biome === 'desert') return 10; return 2; } let hash = pseudoHash(x*1.5, z*1.5 + y*2.0, world.seed); if (hash > 0.95 && y < h - 5) return 14; if (hash < 0.08 && y < h - 4) return 19; if (hash > 0.45 && hash < 0.5 && y < h - 3) return 17; return 3;
}

function checkRecipes(gridArr, size) { 
    let minR = size, maxR = -1, minC = size, maxC = -1; 
    for(let r=0; r<size; r++) for(let c=0; c<size; c++) { if(gridArr[r*size+c]) { minR=Math.min(minR,r); maxR=Math.max(maxR,r); minC=Math.min(minC,c); maxC=Math.max(maxC,c); } } 
    if(maxR === -1) return null; 
    const w = maxC - minC + 1; const h = maxR - minR + 1; const pattern = []; 
    for(let r=0; r<h; r++) { const row = []; for(let c=0; c<w; c++) { const item = gridArr[(minR+r)*size + (minC+c)]; row.push(item ? item.type : null); } pattern.push(row); } 
    for(const rec of RECIPES) { if(rec.pattern.length === h && rec.pattern[0].length === w) { let match = true; for(let r=0; r<h; r++) for(let c=0; c<w; c++) { if(rec.pattern[r][c] !== pattern[r][c]) match = false; } if(match) return {type: rec.res, count: rec.resCount}; } } return null; 
}

io.on('connection', (socket) => {
    socket.on('joinRoom', (data) => {
        socket.join(data.room);
        const world = initWorld(data.room, data.config || {});
        world.players[socket.id] = {
            id: socket.id, name: data.name, x: 0, y: 30, z: 0, rot: 0, pitch: 0,
            health: 20, hunger: 20, breath: 10,
            inventory: new Array(36).fill(null),
            craft2x2: new Array(4).fill(null), craft3x3: new Array(9).fill(null),
            cursor: null
        };
        if(world.mode === '創造') {
            world.players[socket.id].inventory[0] = {type:1, count:64}; world.players[socket.id].inventory[1] = {type:2, count:64};
            world.players[socket.id].inventory[2] = {type:3, count:64}; world.players[socket.id].inventory[3] = {type:4, count:64};
            world.players[socket.id].inventory[4] = {type:12, count:64}; world.players[socket.id].inventory[5] = {type:15, count:64};
            world.players[socket.id].inventory[6] = {type:22, count:1};
        }
        socket.emit('worldInit', { seed: world.seed, modifiedBlocks: world.modifiedBlocks, playerState: world.players[socket.id], mode: world.mode });
        io.to(data.room).emit('chat', {msg: `${data.name} 加入了遊戲`, color: '#2ecc71'});
    });

    socket.on('reqChunk', (data) => {
        const world = activeWorlds[data.room]; if(!world) return;
        const {cx, cz} = data; let chunkBlocks = {};
        for(let x=cx*16; x<cx*16+16; x++) { for(let z=cz*16; z<cz*16+16; z++) {
            let h = getNoiseHeight(x,z,world); for(let y=0; y<=h+15; y++) {
                let t = getBlockServer(x,y,z,world); if(t) chunkBlocks[`${x},${y},${z}`] = t;
            }
        }}
        socket.emit('chunkData', {cx, cz, blocks: chunkBlocks});
    });

    socket.on('playerMove', (data) => {
        const world = activeWorlds[data.room]; if(!world || !world.players[socket.id]) return;
        world.players[socket.id].x = data.x; world.players[socket.id].y = data.y; world.players[socket.id].z = data.z;
        world.players[socket.id].rot = data.rot; world.players[socket.id].pitch = data.pitch;
        socket.to(data.room).emit('playerStateUpdated', { id: socket.id, x: data.x, y: data.y, z: data.z, rot: data.rot, pitch: data.pitch });
    });

    socket.on('mineBlock', (data) => {
        const world = activeWorlds[data.room]; if(!world || !world.players[socket.id]) return;
        const p = world.players[socket.id];
        const bType = getBlockServer(data.x, data.y, data.z, world);
        if(bType) {
            world.modifiedBlocks[`${data.x},${data.y},${data.z}`] = null;
            io.to(data.room).emit('blockUpdate', {x: data.x, y: data.y, z: data.z, type: null});
            if(world.mode === '生存' || world.mode === '冒險') {
                const dropInfo = getBlockHardnessAndDrop(bType, p.inventory[data.slot] ? p.inventory[data.slot].type : null);
                if(dropInfo.drop) {
                    const dropId = Math.random().toString();
                    world.drops.push({ id: dropId, type: dropInfo.drop, x: data.x, y: data.y+0.5, z: data.z, age: 0 });
                    io.to(data.room).emit('dropSpawned', world.drops[world.drops.length-1]);
                }
            }
        }
    });

    socket.on('placeBlock', (data) => {
        const world = activeWorlds[data.room]; if(!world || !world.players[socket.id]) return;
        const p = world.players[socket.id]; const item = p.inventory[data.slot];
        if(item && item.count > 0 && !blockTypes[item.type].isItem) {
            world.modifiedBlocks[`${data.nx},${data.ny},${data.nz}`] = item.type;
            if(world.mode !== '創造') { item.count--; if(item.count <= 0) p.inventory[data.slot] = null; socket.emit('invUpdate', p.inventory); }
            io.to(data.room).emit('blockUpdate', {x: data.nx, y: data.ny, z: data.nz, type: item.type});
        }
    });

    socket.on('invAction', (data) => {
        const world = activeWorlds[data.room]; if(!world || !world.players[socket.id]) return;
        const p = world.players[socket.id];
        const isCraftingRes = data.type === 'craftRes';
        let targetArr = data.grid === 'main' ? p.inventory : (data.grid === 'craft2' ? p.craft2x2 : p.craft3x3);
        
        if (isCraftingRes) {
            let res = data.grid === 'craft2' ? checkRecipes(p.craft2x2, 2) : checkRecipes(p.craft3x3, 3);
            if (res && (!p.cursor || (p.cursor.type === res.type && p.cursor.count + res.count <= 64))) {
                if(!p.cursor) p.cursor = {type: res.type, count: res.count}; else p.cursor.count += res.count;
                let arrToConsume = data.grid === 'craft2' ? p.craft2x2 : p.craft3x3;
                for(let i=0; i<arrToConsume.length; i++) { if(arrToConsume[i]) { arrToConsume[i].count--; if(arrToConsume[i].count <= 0) arrToConsume[i] = null; } }
            }
        } else {
            let slotItem = targetArr[data.idx]; const rightClick = data.rightClick;
            if(!p.cursor && slotItem) {
                if(rightClick && slotItem.count > 1) { const half = Math.floor(slotItem.count / 2); p.cursor = {type: slotItem.type, count: half}; slotItem.count -= half; } 
                else { p.cursor = {type: slotItem.type, count: slotItem.count}; targetArr[data.idx] = null; }
            } else if(p.cursor && !slotItem) {
                if(rightClick) { targetArr[data.idx] = {type: p.cursor.type, count: 1}; p.cursor.count--; if(p.cursor.count <= 0) p.cursor = null; } 
                else { targetArr[data.idx] = {type: p.cursor.type, count: p.cursor.count}; p.cursor = null; }
            } else if(p.cursor && slotItem) {
                if(p.cursor.type === slotItem.type) {
                    if(rightClick) { if(slotItem.count < 64) { slotItem.count++; p.cursor.count--; } } 
                    else { const space = 64 - slotItem.count; const add = Math.min(space, p.cursor.count); slotItem.count += add; p.cursor.count -= add; }
                    if(p.cursor.count <= 0) p.cursor = null;
                } else { if(!rightClick) { const temp = targetArr[data.idx]; targetArr[data.idx] = p.cursor; p.cursor = temp; } }
            }
        }
        socket.emit('invUpdate', { main: p.inventory, c2: p.craft2x2, c3: p.craft3x3, cursor: p.cursor, res2: checkRecipes(p.craft2x2, 2), res3: checkRecipes(p.craft3x3, 3) });
    });

    socket.on('disconnect', () => {
        for(let room in activeWorlds) {
            if(activeWorlds[room].players[socket.id]) {
                io.to(room).emit('chat', {msg: `${activeWorlds[room].players[socket.id].name} 離開了遊戲`, color: '#e74c3c'});
                delete activeWorlds[room].players[socket.id];
                io.to(room).emit('playerLeft', { id: socket.id });
            }
        }
    });
});

setInterval(() => {
    for (let roomId in activeWorlds) {
        let world = activeWorlds[roomId];
        for (let i = world.drops.length - 1; i >= 0; i--) {
            let drop = world.drops[i]; drop.age += 0.05;
            for (let pid in world.players) {
                let p = world.players[pid];
                let dist = Math.sqrt(Math.pow(p.x - drop.x, 2) + Math.pow(p.y - drop.y, 2) + Math.pow(p.z - drop.z, 2));
                if (dist < 1.5 && drop.age > 0.5) {
                    let given = false;
                    for(let j=0; j<36; j++) { if(p.inventory[j] && p.inventory[j].type === drop.type && p.inventory[j].count < 64) { p.inventory[j].count++; given=true; break; } }
                    if(!given) { for(let j=0; j<36; j++) { if(!p.inventory[j]) { p.inventory[j] = {type: drop.type, count: 1}; given=true; break; } } }
                    if(given) { io.to(pid).emit('invUpdate', {main: p.inventory, c2: p.craft2x2, c3: p.craft3x3, cursor: p.cursor}); io.to(roomId).emit('dropCollected', {id: drop.id}); world.drops.splice(i, 1); break; }
                }
            }
            if(drop.age > 300) { io.to(roomId).emit('dropCollected', {id: drop.id}); world.drops.splice(i, 1); }
        }
    }
}, 50);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => { console.log(`[核心啟動] 請打開瀏覽器並前往 http://localhost:${PORT}`); });