import * as THREE from 'three';
import * as CANNON from 'cannon-es';

// --- Global Variables ---
let scene, camera, renderer;
let world;
let mazeBody, ballBody;
let mazeVisual, ballVisual;
let winZoneVisual, startZoneVisual;

let socket;
const WS_URL = 'ws://localhost:50500/rab';

// IMU Data
let rawPitch = 0;
let rawRoll = 0;
let filteredPitch = 0;
let filteredRoll = 0;
let calibPitch = 0;
let calibRoll = 0;

let isGameWon = false;

// UI Elements
const statusBadge = document.getElementById('statusBadge');
const valPitch = document.getElementById('valPitch');
const valRoll = document.getElementById('valRoll');
const calibrateBtn = document.getElementById('calibrateBtn');
const cameraBtn = document.getElementById('cameraBtn');
const winOverlay = document.getElementById('winOverlay');
const restartBtn = document.getElementById('restartBtn');

// --- Initialization ---
function init() {
    initThree();
    initCannon();
    buildMaze();
    connectWebSocket();

    // Event Listeners
    window.addEventListener('resize', onWindowResize);
    calibrateBtn.addEventListener('click', calibrate);
    cameraBtn.addEventListener('click', toggleCamera);
    restartBtn.addEventListener('click', restartGame);

    // Animation Loop
    renderer.setAnimationLoop(animate);
}

function initThree() {
    const container = document.getElementById('game-container');
    
    scene = new THREE.Scene();
    scene.background = null; // Transparent to show CSS gradient

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 20, 20);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(10, 20, 10);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);
    
    const pointLight = new THREE.PointLight(0x3b82f6, 1, 50);
    pointLight.position.set(0, 10, 0);
    scene.add(pointLight);
}

function initCannon() {
    world = new CANNON.World();
    world.gravity.set(0, -20, 0); // slightly stronger gravity for better feel
    world.broadphase = new CANNON.SAPBroadphase(world);
    world.solver.iterations = 20;
    
    // Materials
    const defaultMaterial = new CANNON.Material("default");
    const defaultContactMaterial = new CANNON.ContactMaterial(
        defaultMaterial, defaultMaterial, { friction: 0.1, restitution: 0.3 }
    );
    world.addContactMaterial(defaultContactMaterial);
}

function buildMaze() {
    // --- 1. Physics Static Body for Maze ---
    mazeBody = new CANNON.Body({
        mass: 0, 
        type: CANNON.Body.STATIC,
        position: new CANNON.Vec3(0, 0, 0)
    });

    // --- 2. Visual Group ---
    mazeVisual = new THREE.Group();
    scene.add(mazeVisual);

    // Glass Material for Rabboni look
    const glassMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x88bbff,
        metalness: 0.1,
        roughness: 0.05,
        transmission: 0.8, // glass-like
        thickness: 0.5,
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide
    });
    
    const wallMaterial = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.4
    });

    const floorMaterial = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        roughness: 0.6
    });

    // Helper to add boxes
    function addBox(w, h, d, x, y, z, isGlass=false, isFloor=false) {
        // Physics
        const shape = new CANNON.Box(new CANNON.Vec3(w/2, h/2, d/2));
        mazeBody.addShape(shape, new CANNON.Vec3(x, y, z));

        // Visual
        const geo = new THREE.BoxGeometry(w, h, d);
        let mat = isGlass ? glassMaterial : (isFloor ? floorMaterial : wallMaterial);
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(x, y, z);
        mesh.castShadow = !isGlass;
        mesh.receiveShadow = true;
        mazeVisual.add(mesh);
    }

    // Floor
    addBox(12, 0.5, 12, 0, -0.25, 0, false, true);
    
    // Transparent Outer Cover (Top + Sides)
    addBox(12, 2, 0.5, 0, 1, -5.75, true); // Top edge
    addBox(12, 2, 0.5, 0, 1, 5.75, true);  // Bottom edge
    addBox(0.5, 2, 11, -5.75, 1, 0, true); // Left edge
    addBox(0.5, 2, 11, 5.75, 1, 0, true);  // Right edge
    addBox(12, 0.1, 12, 0, 2, 0, true);    // Top Cover

    // Inner Walls (Simple maze) - Make them height 2 so ball can't jump over
    addBox(6, 2, 0.5, -3, 1, -2);
    addBox(0.5, 2, 6, 2, 1, -2);
    addBox(6, 2, 0.5, 2, 1, 3);
    addBox(0.5, 2, 3, -3, 1, 2);

    // Invisible thick physics boundaries to prevent tunneling
    function addPhysicsBoundary(w, h, d, x, y, z) {
        const shape = new CANNON.Box(new CANNON.Vec3(w/2, h/2, d/2));
        mazeBody.addShape(shape, new CANNON.Vec3(x, y, z));
    }
    addPhysicsBoundary(20, 10, 5, 0, 0, -8.5); // Top
    addPhysicsBoundary(20, 10, 5, 0, 0, 8.5);  // Bottom
    addPhysicsBoundary(5, 10, 20, -8.5, 0, 0); // Left
    addPhysicsBoundary(5, 10, 20, 8.5, 0, 0);  // Right
    addPhysicsBoundary(20, 5, 20, 0, 3.5, 0);  // Ceiling
    addPhysicsBoundary(20, 5, 20, 0, -3.5, 0); // Ground floor

    world.addBody(mazeBody);

    // --- 3. Win Zone & Start Zone ---
    const winGeo = new THREE.PlaneGeometry(3, 3);
    const winMat = new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.5, side: THREE.DoubleSide });
    winZoneVisual = new THREE.Mesh(winGeo, winMat);
    winZoneVisual.rotation.x = -Math.PI / 2;
    winZoneVisual.position.set(4, 0.05, -4); // Top right corner
    mazeVisual.add(winZoneVisual);

    const startGeo = new THREE.PlaneGeometry(2, 2);
    const startMat = new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.5, side: THREE.DoubleSide });
    startZoneVisual = new THREE.Mesh(startGeo, startMat);
    startZoneVisual.rotation.x = -Math.PI / 2;
    startZoneVisual.position.set(-4, 0.05, 4); // Bottom left corner
    mazeVisual.add(startZoneVisual);

    // --- 4. The Ball ---
    const radius = 0.4;
    ballBody = new CANNON.Body({
        mass: 1,
        shape: new CANNON.Sphere(radius),
        position: new CANNON.Vec3(-4, 0.5, 4) // Start position (bottom left)
    });
    ballBody.linearDamping = 0.5;
    ballBody.angularDamping = 0.5;
    world.addBody(ballBody);

    const sphereGeo = new THREE.SphereGeometry(radius, 32, 32);
    const sphereMat = new THREE.MeshStandardMaterial({
        color: 0xf472b6,
        metalness: 0.3,
        roughness: 0.2
    });
    ballVisual = new THREE.Mesh(sphereGeo, sphereMat);
    ballVisual.castShadow = true;
    mazeVisual.add(ballVisual);
}

// --- WebSocket & Sensor Fusion ---
function connectWebSocket() {
    statusBadge.textContent = '連線中...';
    statusBadge.className = 'status-badge';
    
    socket = new WebSocket(WS_URL);

    socket.addEventListener('open', () => {
        statusBadge.textContent = '已連線 (Connected)';
        statusBadge.className = 'status-badge connected';
    });

    socket.addEventListener('close', () => {
        statusBadge.textContent = '連線中斷，嘗試重新連線...';
        statusBadge.className = 'status-badge disconnected';
        setTimeout(connectWebSocket, 3000);
    });

    socket.addEventListener('message', (event) => {
        try {
            const data = JSON.parse(event.data);
            if (data && data.acc) {
                processSensorData(data.acc);
            }
        } catch (e) {
            // ignore
        }
    });
}

function processSensorData(acc) {
    // raw acc data: [x, y, z]
    // Calculate pitch and roll from accelerometer
    // We use a simple gravity vector approach.
    const ax = acc[0];
    const ay = acc[1];
    const az = acc[2];

    // standard tilt formulas based on accelerometer
    let p = -(Math.atan2(ay, Math.sqrt(ax*ax + az*az)));
    let r = -(Math.atan2(ax, az));

    // Low pass filter to smooth out noise
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
    restartGame(); // Reset ball position
}

let currentView = 1;
function toggleCamera() {
    if (currentView === 1) {
        currentView = 2;
        cameraBtn.textContent = "切換視角 (俯視固定)";
    } else {
        currentView = 1;
        cameraBtn.textContent = "切換視角 (預設)";
    }
}

// --- Game Logic ---
function restartGame() {
    // Reset ball position
    ballBody.position.set(-4, 0.5, 4);
    ballBody.velocity.set(0, 0, 0);
    ballBody.angularVelocity.set(0, 0, 0);
    isGameWon = false;
    winOverlay.classList.add('hidden');
}

function checkWinCondition() {
    if (isGameWon) return;

    // The ball is in world space which is identical to maze local space 
    // because the physics maze is STATIC at origin!
    const localPos = ballBody.position;

    // Check distance to win zone center (4, 0, -4)
    const targetX = 4;
    const targetZ = -4;
    const dx = localPos.x - targetX;
    const dz = localPos.z - targetZ;
    const dist = Math.sqrt(dx*dx + dz*dz);

    if (dist < 1.5 && localPos.y < 1.0) { // close enough and not flying
        isGameWon = true;
        winOverlay.classList.remove('hidden');
    }
}

// --- Main Loop ---
function animate() {
    // Apply Rabboni rotation to Maze
    const finalPitch = filteredPitch - calibPitch;
    const finalRoll = filteredRoll - calibRoll;

    const euler = new THREE.Euler(finalPitch, 0, finalRoll, 'XYZ');
    const quat = new THREE.Quaternion().setFromEuler(euler);

    // Instead of rotating the kinematic body, we rotate the GRAVITY!
    // The physics maze is static. Gravity rotates inversely.
    const invQuat = quat.clone().invert();
    const gravity = new THREE.Vector3(0, -20, 0).applyQuaternion(invQuat);
    world.gravity.set(gravity.x, gravity.y, gravity.z);

    // Update UI text
    valPitch.textContent = (finalPitch * 180 / Math.PI).toFixed(2) + '°';
    valRoll.textContent = (finalRoll * 180 / Math.PI).toFixed(2) + '°';

    // 1. Update Physics / Game State
    world.step(1 / 60);

    checkWinCondition();

    // 2. Sync Visuals
    mazeVisual.quaternion.copy(quat);
    // Since ballVisual is a child of mazeVisual, copying physics position maps it perfectly!
    ballVisual.position.copy(ballBody.position);
    ballVisual.quaternion.copy(ballBody.quaternion);

    // Camera view handling
    if (currentView === 2) {
        // Camera locked to maze local top (moves with the maze)
        const localCamPos = new THREE.Vector3(0, 30, 0);
        camera.position.copy(localCamPos.applyQuaternion(quat));
        
        const localUp = new THREE.Vector3(0, 0, -1);
        camera.up.copy(localUp.applyQuaternion(quat));
        
        camera.lookAt(0, 0, 0);
    } else {
        // Default View
        camera.position.set(0, 20, 20);
        camera.up.set(0, 1, 0);
        camera.lookAt(0, 0, 0);
    }

    // 3. Render
    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Run!
init();
