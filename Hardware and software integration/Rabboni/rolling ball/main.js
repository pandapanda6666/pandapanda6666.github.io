import * as THREE from 'three';
import * as CANNON from 'cannon-es';

// --- Global Variables ---
let scene, camera, renderer, world;
let mazeBody, ballBody;
let mazeVisual, ballVisual, exitVisual;
let winZoneLight;

let socket;
const WS_URL = 'ws://localhost:50500/rab';

// IMU Data
let rawPitch = 0, rawRoll = 0;
let filteredPitch = 0, filteredRoll = 0;
let calibPitch = 0, calibRoll = 0;

// Game State
let currentLevel = 0; // 0, 1, 2
let isGameOver = false;
let score = 0;
let timeLeft = 0;
let timerInterval;

// Collectibles
let collectibles = []; // { mesh, body, type: 'main'|'side', collected: false }
let mainQuestTotal = 0, mainQuestCollected = 0;
let sideQuestTotal = 0, sideQuestCollected = 0;

// UI Elements
const statusBadge = document.getElementById('statusBadge');
const valPitch = document.getElementById('valPitch');
const valRoll = document.getElementById('valRoll');
const calibrateBtn = document.getElementById('calibrateBtn');
const cameraBtn = document.getElementById('cameraBtn');
const cameraFollowLabel = document.getElementById('cameraFollowLabel');
const cameraFollowToggle = document.getElementById('cameraFollowToggle');
const overlayScreen = document.getElementById('overlayScreen');
const overlayTitle = document.getElementById('overlayTitle');
const overlayMessage = document.getElementById('overlayMessage');
const nextLevelBtn = document.getElementById('nextLevelBtn');
const restartBtn = document.getElementById('restartBtn');

const levelDisplay = document.getElementById('levelDisplay');
const timeDisplay = document.getElementById('timeDisplay');
const scoreDisplay = document.getElementById('scoreDisplay');
const mainQuestProgress = document.getElementById('mainQuestProgress');
const sideQuestProgress = document.getElementById('sideQuestProgress');

// Levels Configuration
const levels = [
    {
        width: 15, depth: 15,
        time: 60,
        startPos: [-5, 5], // x, z
        exitPos: [5, -5],
        walls: [
            { w: 6, h: 2, d: 0.5, x: 0, z: -3 },
            { w: 0.5, h: 2, d: 6, x: -3, z: 2 }
        ],
        items: [
            { type: 'main', x: -5, z: -5 },
            { type: 'main', x: 5, z: 5 },
            { type: 'side', x: 0, z: 0 }
        ]
    },
    {
        width: 25, depth: 25,
        time: 90,
        startPos: [-10, 10],
        exitPos: [10, -10],
        walls: [
            { w: 10, h: 2, d: 0.5, x: -5, z: -5 },
            { w: 0.5, h: 2, d: 10, x: 5, z: 0 },
            { w: 10, h: 2, d: 0.5, x: 5, z: 5 },
            { w: 0.5, h: 2, d: 8, x: -5, z: 6 }
        ],
        items: [
            { type: 'main', x: -10, z: -10 },
            { type: 'main', x: 0, z: -8 },
            { type: 'main', x: 10, z: 10 },
            { type: 'side', x: -8, z: 0 },
            { type: 'side', x: 8, z: 0 }
        ]
    },
    {
        width: 35, depth: 35,
        time: 120,
        startPos: [-15, 15],
        exitPos: [15, -15],
        walls: [
            { w: 15, h: 2, d: 0.5, x: -5, z: -10 },
            { w: 0.5, h: 2, d: 20, x: 10, z: -5 },
            { w: 20, h: 2, d: 0.5, x: 0, z: 5 },
            { w: 0.5, h: 2, d: 15, x: -10, z: 5 },
            { w: 10, h: 2, d: 0.5, x: 5, z: 12 }
        ],
        items: [
            { type: 'main', x: -15, z: -15 },
            { type: 'main', x: 5, z: -12 },
            { type: 'main', x: 15, z: 15 },
            { type: 'main', x: -12, z: -2 },
            { type: 'side', x: 0, z: 0 },
            { type: 'side', x: -10, z: 10 },
            { type: 'side', x: 12, z: 0 }
        ]
    }
];

// --- Initialization ---
function init() {
    initThree();
    initCannon();
    connectWebSocket();

    window.addEventListener('resize', onWindowResize);
    calibrateBtn.addEventListener('click', calibrate);
    cameraBtn.addEventListener('click', toggleCamera);
    nextLevelBtn.addEventListener('click', () => loadLevel(currentLevel + 1));
    restartBtn.addEventListener('click', () => { score = 0; loadLevel(0); });

    loadLevel(0);
    renderer.setAnimationLoop(animate);
}

function initThree() {
    const container = document.getElementById('game-container');
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 200);
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(20, 40, 20);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 100;
    dirLight.shadow.camera.left = -30;
    dirLight.shadow.camera.right = 30;
    dirLight.shadow.camera.top = 30;
    dirLight.shadow.camera.bottom = -30;
    scene.add(dirLight);
}

function initCannon() {
    world = new CANNON.World();
    world.gravity.set(0, -30, 0); // Stronger gravity for crisp movement
    world.broadphase = new CANNON.SAPBroadphase(world);
    world.solver.iterations = 20;
    const defaultMat = new CANNON.Material("default");
    const contactMat = new CANNON.ContactMaterial(defaultMat, defaultMat, { friction: 0.1, restitution: 0.3 });
    world.addContactMaterial(contactMat);
}

function clearLevel() {
    if (mazeVisual) scene.remove(mazeVisual);
    if (mazeBody) world.removeBody(mazeBody);
    if (ballBody) world.removeBody(ballBody);
    collectibles.forEach(c => {
        if (c.mesh && c.mesh.parent) c.mesh.parent.remove(c.mesh);
    });
    collectibles = [];
    clearInterval(timerInterval);
}

function loadLevel(idx) {
    clearLevel();
    currentLevel = idx;
    const cfg = levels[idx];
    isGameOver = false;

    levelDisplay.textContent = idx + 1;
    timeLeft = cfg.time;
    timeDisplay.textContent = timeLeft;
    scoreDisplay.textContent = score;

    mainQuestTotal = 0; mainQuestCollected = 0;
    sideQuestTotal = 0; sideQuestCollected = 0;

    buildLevel(cfg);
    updateQuestUI();
    overlayScreen.classList.add('hidden');
    nextLevelBtn.classList.add('hidden');
    restartBtn.classList.add('hidden');

    timerInterval = setInterval(() => {
        if(isGameOver) return;
        timeLeft--;
        timeDisplay.textContent = timeLeft;
        if(timeLeft <= 0) {
            timeLeft = 0;
            gameOver("時間到！", false);
        }
    }, 1000);
}

function buildLevel(cfg) {
    mazeBody = new CANNON.Body({ mass: 0, type: CANNON.Body.STATIC, position: new CANNON.Vec3(0, 0, 0) });
    mazeVisual = new THREE.Group();
    scene.add(mazeVisual);

    const wallMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 });
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.6 });
    const glassMat = new THREE.MeshPhysicalMaterial({ color: 0x88bbff, transmission: 0.8, opacity: 0.6, transparent: true, side: THREE.DoubleSide });

    function addBox(w, h, d, x, y, z, mat, isGhost = false) {
        if(!isGhost) {
            mazeBody.addShape(new CANNON.Box(new CANNON.Vec3(w/2, h/2, d/2)), new CANNON.Vec3(x, y, z));
        }
        if(mat) {
            const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
            mesh.position.set(x, y, z);
            mesh.castShadow = (mat !== glassMat);
            mesh.receiveShadow = true;
            mazeVisual.add(mesh);
        }
    }

    // Floor
    addBox(cfg.width, 0.5, cfg.depth, 0, -0.25, 0, floorMat);
    // Outer walls
    addBox(cfg.width, 2, 0.5, 0, 1, -cfg.depth/2, glassMat);
    addBox(cfg.width, 2, 0.5, 0, 1, cfg.depth/2, glassMat);
    addBox(0.5, 2, cfg.depth, -cfg.width/2, 1, 0, glassMat);
    addBox(0.5, 2, cfg.depth, cfg.width/2, 1, 0, glassMat);
    // Cover
    addBox(cfg.width, 0.1, cfg.depth, 0, 2, 0, glassMat);

    // Inner Walls
    cfg.walls.forEach(w => addBox(w.w, w.h, w.d, w.x, 1, w.z, wallMat));

    // Physics bounds to prevent falling out
    const bx = cfg.width/2 + 2, bz = cfg.depth/2 + 2;
    addBox(cfg.width*2, 10, 5, 0, 0, -bz, null);
    addBox(cfg.width*2, 10, 5, 0, 0, bz, null);
    addBox(5, 10, cfg.depth*2, -bx, 0, 0, null);
    addBox(5, 10, cfg.depth*2, bx, 0, 0, null);

    world.addBody(mazeBody);

    // Exit Zone
    const exitGeo = new THREE.PlaneGeometry(4, 4);
    const exitMat = new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.6, side: THREE.DoubleSide });
    exitVisual = new THREE.Mesh(exitGeo, exitMat);
    exitVisual.rotation.x = -Math.PI / 2;
    exitVisual.position.set(cfg.exitPos[0], 0.05, cfg.exitPos[1]);
    mazeVisual.add(exitVisual);
    
    // Add text on exit using simple sprite or just wait for color change. Color change is enough.

    // Ball
    const radius = 0.5;
    ballBody = new CANNON.Body({
        mass: 2, shape: new CANNON.Sphere(radius),
        position: new CANNON.Vec3(cfg.startPos[0], 1, cfg.startPos[1])
    });
    ballBody.linearDamping = 0.4; ballBody.angularDamping = 0.4;
    world.addBody(ballBody);

    const sphereMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.5, roughness: 0.1 });
    ballVisual = new THREE.Mesh(new THREE.SphereGeometry(radius, 32, 32), sphereMat);
    ballVisual.castShadow = true;
    mazeVisual.add(ballVisual);

    // Items
    const mainGeo = new THREE.BoxGeometry(0.8, 0.8, 0.8);
    const mainMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x38bdf8, emissiveIntensity: 0.5 });
    const sideGeo = new THREE.ConeGeometry(0.5, 1, 4);
    const sideMat = new THREE.MeshStandardMaterial({ color: 0xa78bfa, emissive: 0xa78bfa, emissiveIntensity: 0.5 });

    cfg.items.forEach(item => {
        let mesh;
        if(item.type === 'main') {
            mesh = new THREE.Mesh(mainGeo, mainMat);
            mainQuestTotal++;
        } else {
            mesh = new THREE.Mesh(sideGeo, sideMat);
            sideQuestTotal++;
        }
        mesh.position.set(item.x, 0.5, item.z);
        mesh.castShadow = true;
        mazeVisual.add(mesh);
        collectibles.push({ mesh, type: item.type, x: item.x, z: item.z, collected: false });
    });
}

function updateQuestUI() {
    mainQuestProgress.textContent = ${mainQuestCollected}/;
    sideQuestProgress.textContent = ${sideQuestCollected}/;
    
    if (mainQuestCollected === mainQuestTotal && mainQuestTotal > 0) {
        exitVisual.material.color.setHex(0x10b981); // Green unlocked
    }
}

// --- WebSocket & Sensor Fusion ---
function connectWebSocket() {
    statusBadge.textContent = '連線中...';
    socket = new WebSocket(WS_URL);
    socket.addEventListener('open', () => {
        statusBadge.textContent = '已連線';
        statusBadge.className = 'status-badge connected';
    });
    socket.addEventListener('close', () => {
        statusBadge.textContent = '連線中斷';
        statusBadge.className = 'status-badge disconnected';
        setTimeout(connectWebSocket, 3000);
    });
    socket.addEventListener('message', (event) => {
        try {
            const data = JSON.parse(event.data);
            if (data && data.acc) processSensorData(data.acc);
        } catch (e) {}
    });
}

function processSensorData(acc) {
    const ax = acc[0], ay = acc[1], az = acc[2];
    let p = Math.atan2(ay, Math.sqrt(ax*ax + az*az));
    let r = Math.atan2(ax, az);
    const alpha = 0.1;
    filteredPitch = filteredPitch * (1 - alpha) + p * alpha;
    filteredRoll = filteredRoll * (1 - alpha) + r * alpha;
}

function calibrate() {
    calibPitch = filteredPitch;
    calibRoll = filteredRoll;
    calibrateBtn.textContent = "已校準 ✓";
    calibrateBtn.style.background = "linear-gradient(135deg, #10b981, #059669)";
    setTimeout(() => {
        calibrateBtn.textContent = "校準 (平放後點擊)";
        calibrateBtn.style.background = "";
    }, 2000);
    if(ballBody) {
        ballBody.position.set(levels[currentLevel].startPos[0], 1, levels[currentLevel].startPos[1]);
        ballBody.velocity.set(0, 0, 0);
    }
}

let currentView = 1;
function toggleCamera() {
    if (currentView === 1) {
        currentView = 2;
        cameraBtn.textContent = "切換視角 (俯視)";
        cameraFollowLabel.style.display = "block";
    } else {
        currentView = 1;
        cameraBtn.textContent = "切換視角 (預設)";
        cameraFollowLabel.style.display = "none";
    }
}

function gameOver(msg, win) {
    isGameOver = true;
    clearInterval(timerInterval);
    overlayTitle.textContent = win ? "過關！" : "失敗";
    overlayTitle.style.background = win ? "linear-gradient(135deg, #10b981, #34d399)" : "linear-gradient(135deg, #ef4444, #f87171)";
    overlayMessage.textContent = msg + (win ?  總分:  : "");
    
    overlayScreen.classList.remove('hidden');
    if (win && currentLevel < levels.length - 1) {
        nextLevelBtn.classList.remove('hidden');
    } else {
        restartBtn.classList.remove('hidden');
        if(win) restartBtn.textContent = "重新開始全部";
    }
}

function animate() {
    if (isGameOver) { renderer.render(scene, camera); return; }

    let finalPitch = filteredPitch - calibPitch;
    let finalRoll = filteredRoll - calibRoll;

    valPitch.textContent = (finalPitch * 180 / Math.PI).toFixed(2) + '°';
    valRoll.textContent = (finalRoll * 180 / Math.PI).toFixed(2) + '°';

    const quat = new THREE.Quaternion().setFromEuler(new THREE.Euler(finalPitch, 0, finalRoll, 'XYZ'));
    const invQuat = quat.clone().invert();
    const gravity = new THREE.Vector3(0, -30, 0).applyQuaternion(invQuat);
    world.gravity.set(gravity.x, gravity.y, gravity.z);

    world.step(1 / 60);

    mazeVisual.quaternion.copy(quat);
    ballVisual.position.copy(ballBody.position);
    ballVisual.quaternion.copy(ballBody.quaternion);

    // Item Collection
    const bPos = ballBody.position;
    collectibles.forEach(c => {
        if (!c.collected) {
            c.mesh.rotation.y += 0.05;
            const dx = bPos.x - c.x;
            const dz = bPos.z - c.z;
            if (dx*dx + dz*dz < 2.5) { // 1.5 radius threshold squared
                c.collected = true;
                c.mesh.visible = false;
                if(c.type === 'main') { mainQuestCollected++; score += 100; }
                else { sideQuestCollected++; score += 50; }
                scoreDisplay.textContent = score;
                updateQuestUI();
            }
        }
    });

    // Exit check
    if (mainQuestCollected === mainQuestTotal) {
        const target = levels[currentLevel].exitPos;
        const dx = bPos.x - target[0], dz = bPos.z - target[1];
        if (dx*dx + dz*dz < 4) { // inside exit zone
            gameOver("抵達出口！", true);
        }
    }

    // Camera view
    if (currentView === 2) {
        // Top View
        const follow = cameraFollowToggle.checked;
        const cfg = levels[currentLevel];
        // Height relative to map size so we can see all
        const camHeight = Math.max(cfg.width, cfg.depth) * 0.9 + 10;
        
        if (follow) {
            // World pos of ball
            const wPos = ballBody.position.clone().applyQuaternion(quat);
            camera.position.set(wPos.x, camHeight, wPos.z);
            camera.lookAt(wPos.x, 0, wPos.z);
        } else {
            camera.position.set(0, camHeight, 0);
            camera.lookAt(0, 0, 0);
        }
        camera.up.set(0, 0, -1);
    } else {
        // Default View - fixed behind/above
        const cfg = levels[currentLevel];
        const dist = Math.max(cfg.width, cfg.depth) * 0.7;
        camera.position.set(0, dist*0.8, dist);
        camera.up.set(0, 1, 0);
        camera.lookAt(0, 0, 0);
    }

    renderer.render(scene, camera);
}

// Run!
init();
