
// Rabboni WebSocket Implementation
let rabboniDevices = {};
let rabboniSocket = null;

class Rabboni {
    constructor() {
        this.connected = false;
        this.ax = 0; this.ay = 0; this.az = 0;
        this.gx = 0; this.gy = 0; this.gz = 0;
        this.pitch = 0; this.roll = 0; this.yaw = 0;
        this.lastTime = performance.now();
    }

    update(data) {
        this.connected = true;
        if (data.acc) {
            this.ax = data.acc[0];
            this.ay = data.acc[1];
            this.az = data.acc[2];
            // Calculate Pitch/Roll from gravity (Accel)
            this.pitch = -Math.atan2(this.ay, Math.sqrt(this.ax*this.ax + this.az*this.az)) * 180 / Math.PI;
            this.roll = -Math.atan2(-this.ax, this.az) * 180 / Math.PI;
        }
        if (data.gyr) {
            this.gx = data.gyr[0];
            this.gy = data.gyr[1];
            this.gz = data.gyr[2];
            
            // Integrate Yaw
            let now = performance.now();
            let dt = (now - this.lastTime) / 1000.0;
            if (Math.abs(this.gz) > 1.0) this.yaw += this.gz * dt * 0.5; // added deadband and scaled down if too fast
            this.lastTime = now;
        }
        
        // Update HUD
        let selA = document.getElementById('r-device-a') ? document.getElementById('r-device-a').value : '';
        let selB = document.getElementById('r-device-b') ? document.getElementById('r-device-b').value : '';
        let devName = Object.keys(rabboniDevices).find(key => rabboniDevices[key] === this);
        
        let hudText = `前後傾斜: ${this.pitch.toFixed(1)}&deg; | 左右傾斜: ${this.roll.toFixed(1)}&deg; | 左右旋轉: ${this.yaw.toFixed(1)}&deg; | Z軸加速度: ${this.az.toFixed(2)}`;
        
        if (devName === selA) {
            let el = document.getElementById('debug-rabboni-a');
            if (el) el.innerHTML = `Rabboni A: ${hudText}`;
        }
        if (devName === selB) {
            let el = document.getElementById('debug-rabboni-b');
            if (el) el.innerHTML = `Rabboni B: ${hudText}`;
        }
    }
}

function initRabboniWS() {
    if (rabboniSocket) return;
    rabboniSocket = new WebSocket('ws://localhost:50500/rab');
    
    rabboniSocket.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            if (data && data.name) {
                if (!rabboniDevices[data.name]) {
                    rabboniDevices[data.name] = new Rabboni();
                    updateRabboniDropdowns();
                }
                rabboniDevices[data.name].update(data);
            }
        } catch(e) {}
    };
    
    rabboniSocket.onclose = () => {
        rabboniSocket = null;
        setTimeout(initRabboniWS, 3000);
    };
}

let rabboniSelection = { A: '', B: '' };

function updateRabboniDropdowns() {
    let selA = document.getElementById('r-device-a');
    let selB = document.getElementById('r-device-b');
    if (!selA || !selB) return;
    
    let devices = Object.keys(rabboniDevices);
    
    // Save current selection
    let valA = selA.value || rabboniSelection.A;
    let valB = selB.value || rabboniSelection.B;
    
    selA.innerHTML = '<option value="">-- 無 (使用鍵盤) --</option>';
    selB.innerHTML = '<option value="">-- 無 (使用鍵盤) --</option>';
    
    devices.forEach(d => {
        selA.innerHTML += `<option value="${d}">${d}</option>`;
        selB.innerHTML += `<option value="${d}">${d}</option>`;
    });
    
    if (devices.includes(valA)) selA.value = valA;
    if (devices.includes(valB)) selB.value = valB;
}

function updateRabboniSelection() {
    let selA = document.getElementById('r-device-a');
    let selB = document.getElementById('r-device-b');
    if (selA) rabboniSelection.A = selA.value;
    if (selB) rabboniSelection.B = selB.value;
    saveRabboniSettings();
}


// Settings Persistence
function saveRabboniSettings() {
    let settings = {
        selection: rabboniSelection,
        config: controlConfig
    };
    localStorage.setItem('rabboniSettings', JSON.stringify(settings));
}

function loadRabboniSettings() {
    try {
        let saved = localStorage.getItem('rabboniSettings');
        if (saved) {
            let settings = JSON.parse(saved);
            if (settings.selection) rabboniSelection = settings.selection;
            if (settings.config) controlConfig = settings.config;
        }
    } catch(e) {}
}
loadRabboniSettings();

let controlConfig = {
    pitch: { stick: 'A', mode: 'fixed', sens: 1.0 },
    roll: { stick: 'A', mode: 'fixed', sens: 1.0 },
    thrust: { stick: 'B', mode: 'fixed', sens: 1.0 },
    yaw: { stick: 'B', mode: 'fixed', sens: 1.0 }
};

function getStickValue(axis) {
    if (!controlConfig || !controlConfig[axis]) return 0;
    
    let stickName = controlConfig[axis].stick;
    let modeUS = typeof isUSMode !== 'undefined' ? isUSMode : true;
    let keysMap = {};
    if (modeUS) {
        keysMap = { 
            A: { up: keys.w, down: keys.s, left: keys.a, right: keys.d }, 
            B: { up: keys.up, down: keys.down, left: keys.left, right: keys.right } 
        };
    } else {
        keysMap = { 
            A: { up: keys.up, down: keys.down, left: keys.left, right: keys.right }, 
            B: { up: keys.w, down: keys.s, left: keys.a, right: keys.d } 
        };
    }
    
    let targetDeviceName = rabboniSelection[stickName];
    let rabboni = (targetDeviceName && rabboniDevices[targetDeviceName]) ? rabboniDevices[targetDeviceName] : null;
    
    // Keyboard inputs
    let val = 0;
    if (axis === 'pitch' || axis === 'thrust') {
        if (keysMap[stickName].up) val += 1;
        if (keysMap[stickName].down) val -= 1;
    } else {
        if (keysMap[stickName].left) val += 1;
        if (keysMap[stickName].right) val -= 1;
    }
    
    let config = controlConfig[axis];
    
    // Merge Rabboni logic if connected
    if (rabboni && rabboni.connected) {
        if (config.mode === 'sync') {
            // Normalize angles (assume +-30 degrees is max stick throw)
            if (axis === 'pitch') return (rabboni.pitch / 30.0) * config.sens;
            if (axis === 'roll') return (rabboni.roll / 30.0) * config.sens;
            if (axis === 'yaw') return typeof maxYaw !== 'undefined' ? ((rabboni.yaw * Math.PI / 180) / maxYaw) * config.sens : (rabboni.yaw / 45.0) * config.sens;
            if (axis === 'thrust') {
                if (config.mode === 'sync') return (rabboni.az) * config.sens; // Z-axis Accel
                if (config.mode === 'sync-pitch') return (rabboni.pitch / 30.0) * config.sens;
                if (config.mode === 'sync-roll') return (rabboni.roll / 30.0) * config.sens;
            }
        } else {
            // Threshold / Fixed Mode from Rabboni tilt
            let rVal = 0;
            if (axis === 'pitch' && Math.abs(rabboni.pitch) > 15) rVal = Math.sign(rabboni.pitch);
            if (axis === 'roll' && Math.abs(rabboni.roll) > 15) rVal = Math.sign(rabboni.roll);
            if (axis === 'yaw' && Math.abs(rabboni.gz) > 10) rVal = Math.sign(rabboni.gz); // Threshold on gyro
            if (axis === 'thrust' && Math.abs(rabboni.az) > 1.2) rVal = Math.sign(rabboni.az);
            val = rVal || val; // prioritize rabboni
        }
    }
    
    return val * config.sens;
}

// Init immediately
initRabboniWS();


function syncSettingsToUI() {
    ['pitch', 'roll', 'thrust', 'yaw'].forEach(axis => {
        let modeSel = document.getElementById(`r-${axis}-mode`);
        let sensInput = document.getElementById(`r-${axis}-sens`);
        let stickSel = document.getElementById(`r-${axis}-stick`);
        if (modeSel && controlConfig[axis]) modeSel.value = controlConfig[axis].mode;
        if (sensInput && controlConfig[axis]) sensInput.value = controlConfig[axis].sens;
        if (stickSel && controlConfig[axis]) stickSel.value = controlConfig[axis].stick;
    });
}
window.addEventListener('DOMContentLoaded', () => {
    setTimeout(syncSettingsToUI, 500); // Wait for UI to be ready
});
