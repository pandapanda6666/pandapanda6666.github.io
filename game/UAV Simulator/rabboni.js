// =========================================================================
// PandaPanda UAV Simulator - Controller & Sensor Input System (v4.025)
// 支援 Switch 搖桿 (藍牙連線 / ZR ZL 翻滾 / 雙搖桿) & Rabboni 六軸體感 & 鍵盤
// =========================================================================

// --- 1. Switch 搖桿 (HTML5 Gamepad API) 管理器 ---
let switchGamepadConnected = false;
let lastGamepadStatusCheck = 0;

function getSwitchGamepad() {
    if (!navigator.getGamepads) return null;
    try {
        const gamepads = navigator.getGamepads();
        for (let i = 0; i < gamepads.length; i++) {
            const gp = gamepads[i];
            if (gp && gp.connected) {
                return gp;
            }
        }
    } catch (e) {}
    return null;
}

window.addEventListener('gamepadconnected', (e) => {
    switchGamepadConnected = true;
    console.log('[手把連線] 偵測到控制器已連接:', e.gamepad.id);
    updateRabboniDropdowns();
    updateControllerStatusHud();
});

window.addEventListener('gamepaddisconnected', (e) => {
    console.log('[手把斷線] 控制器已中斷連線:', e.gamepad.id);
    switchGamepadConnected = (getSwitchGamepad() !== null);
    updateRabboniDropdowns();
    updateControllerStatusHud();
});

// 定時掃描手把連線狀態
setInterval(() => {
    const gp = getSwitchGamepad();
    const isConn = (gp !== null);
    if (isConn !== switchGamepadConnected) {
        switchGamepadConnected = isConn;
        updateRabboniDropdowns();
        updateControllerStatusHud();
    }
}, 1000);

// --- 2. Rabboni WebSocket 通訊層 ---
let rabboniDevices = {};
let rabboniSocket = null;

class Rabboni {
    constructor() {
        this.connected = false;
        this.ax = 0; this.ay = 0; this.az = 0;
        this.gx = 0; this.gy = 0; this.gz = 0;
        this.pitch = 0; this.roll = 0; this.yaw = 0; this.trigger = false;
        this.lastTime = performance.now();
    }

    update(data) {
        this.connected = true;
        if (data.acc) {
            this.ax = data.acc[0];
            this.ay = data.acc[1];
            this.az = data.acc[2];
            // 根據重力加速度計計算前後俯仰 (Pitch) 與左右橫滾 (Roll)
            this.pitch = -Math.atan2(this.ay, Math.sqrt(this.ax * this.ax + this.az * this.az)) * 180 / Math.PI;
            this.roll = -Math.atan2(-this.ax, this.az) * 180 / Math.PI;
        }
        if (data.gyr) {
            this.gx = data.gyr[0];
            this.gy = data.gyr[1];
            this.gz = data.gyr[2];
            
            let now = performance.now();
            let dt = (now - this.lastTime) / 1000.0;
            
            if (Math.abs(this.gz) > 1.0) {
                this.yaw += this.gz * dt * 0.5; // active turning
            } else {
                this.yaw *= 0.92; // 零點自動回中/消除漂移
                if (Math.abs(this.yaw) < 0.1) this.yaw = 0;
            }
            
            if (data.trigger !== undefined) this.trigger = data.trigger;
            this.lastTime = now;
        }

        // 即時更新 Debug HUD
        let selA = document.getElementById('r-device-a') ? document.getElementById('r-device-a').value : '';
        let selB = document.getElementById('r-device-b') ? document.getElementById('r-device-b').value : '';
        let devName = Object.keys(rabboniDevices).find(key => rabboniDevices[key] === this);
        
        let hudText = `前後: ${this.pitch.toFixed(1)}° | 左右: ${this.roll.toFixed(1)}° | 旋轉: ${this.yaw.toFixed(1)}° | Z軸G: ${this.az.toFixed(2)}`;
        
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
    try {
        rabboniSocket = new WebSocket('ws://localhost:50500/rab');
    } catch(e) {
        setTimeout(initRabboniWS, 3000);
        return;
    }
    
    rabboniSocket.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            if (data.type === 'scan_results') {
                let container = document.getElementById('r-scan-results');
                if (!container) return;
                let scanBtn = document.getElementById('r-scan-btn');
                if (scanBtn) {
                    scanBtn.innerText = '重新尋找';
                    scanBtn.disabled = false;
                }
                if (data.devices.length === 0) {
                    container.innerHTML = '找不到任何 Rabboni 裝置。請確定設備已開機並處於藍牙配對狀態。';
                    return;
                }
                container.innerHTML = '';
                data.devices.forEach(d => {
                    let div = document.createElement('div');
                    div.style.display = 'flex';
                    div.style.justifyContent = 'space-between';
                    div.style.padding = '5px 0';
                    div.style.borderBottom = '1px solid #444';
                    
                    let nameSpan = document.createElement('span');
                    nameSpan.innerText = d.name + ' (' + d.address + ')';
                    
                    let connBtn = document.createElement('button');
                    connBtn.innerText = '連線';
                    connBtn.style.padding = '2px 8px';
                    connBtn.style.background = '#4CAF50';
                    connBtn.style.color = 'white';
                    connBtn.style.border = 'none';
                    connBtn.style.borderRadius = '3px';
                    connBtn.style.cursor = 'pointer';
                    connBtn.onclick = () => {
                        connBtn.innerText = '連線中...';
                        connBtn.disabled = true;
                        rabboniSocket.send(JSON.stringify({cmd: 'connect', address: d.address, name: d.name}));
                    };
                    
                    div.appendChild(nameSpan);
                    div.appendChild(connBtn);
                    container.appendChild(div);
                });
            } else if (data.type === 'connected') {
                let container = document.getElementById('r-scan-results');
                if (container) {
                    let msg = document.createElement('div');
                    msg.style.color = '#4CAF50';
                    msg.innerText = '[成功] 已連線至: ' + data.name;
                    container.appendChild(msg);
                }
                if (!rabboniDevices[data.name]) {
                    rabboniDevices[data.name] = new Rabboni();
                    updateRabboniDropdowns();
                }
            } else if (data.type === 'disconnected') {
                let container = document.getElementById('r-scan-results');
                if (container) {
                    let msg = document.createElement('div');
                    msg.style.color = '#f44336';
                    msg.innerText = '[斷開] 已斷線: ' + data.name;
                    container.appendChild(msg);
                }
                if (rabboniDevices[data.name]) {
                    delete rabboniDevices[data.name];
                    updateRabboniDropdowns();
                }
            } else if (data && data.name && data.acc) {
                if (!rabboniDevices[data.name]) {
                    rabboniDevices[data.name] = new Rabboni();
                    updateRabboniDropdowns();
                }
                rabboniDevices[data.name].update(data);
            }
        } catch(e) {}
    };
    
    window.startRabboniScan = function() {
        let res = document.getElementById('r-scan-results');
        if (rabboniSocket && rabboniSocket.readyState === WebSocket.OPEN) {
            let btn = document.getElementById('r-scan-btn');
            if (btn) {
                btn.innerText = '掃描中...';
                btn.disabled = true;
            }
            if (res) res.innerHTML = '<span style="color:#00E5FF;">正在透過桌面中介伺服器掃描 Rabboni...<br><span style="color:#FFB300;">[提示] 請按一下 Rabboni 右邊按鍵，並確保正面綠燈閃爍一下以喚醒藍牙廣播！</span></span>';
            rabboniSocket.send(JSON.stringify({cmd: 'scan'}));
        } else {
            let msg = "[提示] 桌面端中介伺服器未啟動。\n\n• 若您在 Chrome / Edge 瀏覽器（HTTPS 安全連線），請直接點擊【網頁版藍牙直連】即可免軟體連線！\n• 若需使用桌面中介，請先啟動「啟動模擬器.bat」或執行桌面版主程式。";
            if (res) res.innerHTML = `<span style="color:#FFB300;">${msg.replace(/\n/g, '<br>')}</span>`;
            alert(msg);
        }
    };

    rabboniSocket.onclose = () => {
        rabboniSocket = null;
        setTimeout(initRabboniWS, 3000);
    };
}
initRabboniWS();

// --- 2.1 瀏覽器原生 Web Bluetooth API 直連 (免安裝任何外部軟體) ---
async function connectRabboniWebBluetooth() {
    let res = document.getElementById('r-scan-results');
    if (!navigator.bluetooth) {
        let msg = "[提示] 您的瀏覽器不支援 Web Bluetooth，或當前正在使用 file:/// 本地檔案開啟。\n\n提示：請使用 Google Chrome 或 Microsoft Edge，並於線上網頁版 (https://...) 執行；若在本地離線環境，請執行桌面版主程式。";
        if (res) res.innerHTML = `<span style="color:#f44336;">${msg.replace(/\n/g, '<br>')}</span>`;
        alert(msg);
        return;
    }

    if (res) {
        res.innerHTML = '<span style="color:#FFB300;">[提示] 請按一下 Rabboni 右邊按鍵，並確保正面綠燈閃爍一下！正在呼叫瀏覽器配對視窗...</span>';
    }

    try {
        const device = await navigator.bluetooth.requestDevice({
            filters: [
                { namePrefix: 'Rabboni' },
                { namePrefix: 'rabboni' }
            ],
            optionalServices: [
                '00001600-0000-1000-8000-00805f9b34fb',
                '00001700-0000-1000-8000-00805f9b34fb',
                '00001601-0000-1000-8000-00805f9b34fb',
                '00001701-0000-1000-8000-00805f9b34fb',
                '00001702-0000-1000-8000-00805f9b34fb',
                '00001800-0000-1000-8000-00805f9b34fb'
            ]
        });

        if (res) res.innerHTML = `<span style="color:#00E5FF;">正在連線至 ${device.name}...</span>`;
        const server = await device.gatt.connect();
        const devName = device.name || 'Rabboni_BLE';

        // 搜尋特徵值
        let notifyChar = null;
        let writeChar1 = null;
        let writeChar2 = null;

        const services = await server.getPrimaryServices().catch(() => []);
        for (const s of services) {
            const chars = await s.getCharacteristics().catch(() => []);
            for (const c of chars) {
                const uuid = c.uuid.toLowerCase();
                if (uuid.includes('1601')) notifyChar = c;
                if (uuid.includes('1701')) writeChar1 = c;
                if (uuid.includes('1702')) writeChar2 = c;
            }
        }

        // 發送激活命令
        if (writeChar1) await writeChar1.writeValue(new Uint8Array([0x01])).catch(() => {});
        if (writeChar2) await writeChar2.writeValue(new Uint8Array([0xFF])).catch(() => {});

        // 啟動資料通知監聽 (16 bytes 姿態與加速度串流)
        if (notifyChar) {
            await notifyChar.startNotifications();
            notifyChar.addEventListener('characteristicvaluechanged', (e) => {
                const v = e.target.value;
                if (v.byteLength >= 12) {
                    const ax = (v.getInt16(0, false) / 32768.0) * 16 * 9.81;
                    const ay = (v.getInt16(2, false) / 32768.0) * 16 * 9.81;
                    const az = (v.getInt16(4, false) / 32768.0) * 16 * 9.81;
                    const gx = (v.getInt16(6, false) / 32768.0) * 2000;
                    const gy = (v.getInt16(8, false) / 32768.0) * 2000;
                    const gz = (v.getInt16(10, false) / 32768.0) * 2000;

                    if (!rabboniDevices[devName]) {
                        rabboniDevices[devName] = new Rabboni();
                        updateRabboniDropdowns();
                    }
                    rabboniDevices[devName].update({
                        name: devName,
                        acc: [ax, ay, az],
                        gyr: [gx, gy, gz]
                    });
                }
            });
        }

        device.addEventListener('gattserverdisconnected', () => {
            if (rabboniDevices[devName]) {
                delete rabboniDevices[devName];
                updateRabboniDropdowns();
                updateControllerStatusHud();
            }
            if (res) res.innerHTML = `<span style="color:#f44336;">[已斷線] 裝置 ${devName}</span>`;
        });

        if (!rabboniDevices[devName]) {
            rabboniDevices[devName] = new Rabboni();
            updateRabboniDropdowns();
        }
        updateControllerStatusHud();
        if (res) res.innerHTML = `<span style="color:#4CAF50; font-weight:bold;">[已連線] 網頁原生藍牙成功連線: ${devName}！</span>`;
    } catch (err) {
        if (err.name !== 'NotFoundError') {
            console.error('Web Bluetooth error:', err);
            if (res) res.innerHTML = `<span style="color:#f44336;">藍牙連線失敗: ${err.message || err}</span>`;
        } else {
            if (res) res.innerHTML = '<span style="color:#888;">使用者已取消藍牙選取。</span>';
        }
    }
}
window.connectRabboniWebBluetooth = connectRabboniWebBluetooth;

// --- 3. 操控架構配置 (Control Configuration Schema) ---
// 1.X, 2.Y, 3.Z 軸轉動: A. 同步角度 (sync), B. 定速 (fixed) [可設定靈敏度及固定的角度]
// 4. 油門: A. 定速 (fixed), B. 根據角度來控制速度 (angle)
// 1.B: 翻滾動作 (flip) 不可與 1.B 設定同一裝置 (具有獨立靈敏度)
let controlConfig = {
    pitch:  { stick: 'B', mode: 'sync',  fixedAngle: 15.0, sens: 1.0, invert: false }, // 1. X 軸
    yaw:    { stick: 'A', mode: 'fixed', fixedAngle: 15.0, sens: 1.0, invert: false }, // 2. Y 軸
    roll:   { stick: 'B', mode: 'sync',  fixedAngle: 15.0, sens: 1.0, invert: false }, // 3. Z 軸
    thrust: { stick: 'A', mode: 'fixed', fixedAngle: 15.0, sens: 1.0, invert: false }, // 4. 油門
    flip:   { stick: 'B', sens: 1.0 } // 1.B 翻滾
};

let rabboniSelection = { A: '', B: '' };

function saveRabboniSettings() {
    let settings = {
        selection: rabboniSelection,
        config: controlConfig
    };
    try {
        localStorage.setItem('uav_control_settings_v4', JSON.stringify(settings));
    } catch(e) {}
}

function loadRabboniSettings() {
    try {
        let saved = localStorage.getItem('uav_control_settings_v4');
        if (saved) {
            let settings = JSON.parse(saved);
            if (settings.selection) rabboniSelection = settings.selection;
            if (settings.config) {
                // 合併預設值
                Object.keys(controlConfig).forEach(k => {
                    if (settings.config[k]) {
                        controlConfig[k] = Object.assign({}, controlConfig[k], settings.config[k]);
                    }
                });
            }
        }
    } catch(e) {}
}
loadRabboniSettings();

function updateRabboniDropdowns() {
    let selA = document.getElementById('r-device-a');
    let selB = document.getElementById('r-device-b');
    if (!selA || !selB) return;
    
    let devices = Object.keys(rabboniDevices);
    let hasGamepad = (getSwitchGamepad() !== null);
    
    let valA = selA.value || rabboniSelection.A;
    let valB = selB.value || rabboniSelection.B;
    
    let baseOptions = '<option value="">-- 無 (使用鍵盤) --</option>';
    if (hasGamepad) {
        baseOptions += '<option value="SWITCH">[Switch] 搖桿 (藍牙連線)</option>';
    }
    
    selA.innerHTML = baseOptions;
    selB.innerHTML = baseOptions;
    
    devices.forEach(d => {
        selA.innerHTML += `<option value="${d}">[Rabboni] ${d}</option>`;
        selB.innerHTML += `<option value="${d}">[Rabboni] ${d}</option>`;
    });
    
    if (hasGamepad && valA === 'SWITCH') selA.value = 'SWITCH';
    else if (devices.includes(valA)) selA.value = valA;
    else if (!valA) selA.value = '';

    if (hasGamepad && valB === 'SWITCH') selB.value = 'SWITCH';
    else if (devices.includes(valB)) selB.value = valB;
    else if (!valB) selB.value = '';

    rabboniSelection.A = selA.value;
    rabboniSelection.B = selB.value;
}

function updateRabboniSelection() {
    let selA = document.getElementById('r-device-a');
    let selB = document.getElementById('r-device-b');
    if (selA) rabboniSelection.A = selA.value;
    if (selB) rabboniSelection.B = selB.value;
    saveRabboniSettings();
    updateControllerStatusHud();
}

function updateControllerStatusHud() {
    const elSwitch = document.getElementById('status-switch-gamepad');
    const elRabboni = document.getElementById('status-rabboni-ble');
    const gp = getSwitchGamepad();
    if (elSwitch) {
        if (gp && gp.connected) {
            elSwitch.innerHTML = `<span style="color:#00E5FF; font-weight:bold;"><span class="status-dot status-dot-green"></span>Switch 搖桿已連線:</span> <span style="color:#fff;">${gp.id.substring(0, 28)}...</span> <span style="color:#aaa; font-size:11px;">(已支援雙類比搖桿 & ZR/ZL 特技翻滾)</span>`;
        } else {
            elSwitch.innerHTML = `<span style="color:#888;"><span class="status-dot status-dot-gray"></span>Switch 搖桿未連線</span> <span style="font-size:11px; color:#aaa;">(配對後按任意鍵即可喚醒)</span>`;
        }
    }
    if (elRabboni) {
        const devs = Object.keys(rabboniDevices);
        if (devs.length > 0) {
            elRabboni.innerHTML = `<span style="color:#4CAF50; font-weight:bold;"><span class="status-dot status-dot-green"></span>Rabboni 體感裝置已連線 (${devs.length} 台):</span> <span style="color:#fff;">${devs.join(', ')}</span>`;
        } else {
            elRabboni.innerHTML = `<span style="color:#888;"><span class="status-dot status-dot-gray"></span>Rabboni 體感裝置未連線</span>`;
        }
    }
}

// 翻滾不可與 1.B (Pitch 軸定速) 設定同一裝置的校驗與自動避讓機制
function handleFlipStickChange() {
    const pitchStick = controlConfig.pitch ? controlConfig.pitch.stick : 'A';
    const flipSel = document.getElementById('r-flip-stick');
    if (!flipSel) return;
    
    if (flipSel.value === pitchStick) {
        const alt = (pitchStick === 'A') ? 'B' : 'A';
        flipSel.value = alt;
        if (controlConfig.flip) controlConfig.flip.stick = alt;
        if (typeof showAlert === 'function') {
            showAlert(`[規則限制] 1.B (前後傾斜定速) 已指派給「搖桿 ${pitchStick}」，翻滾動作不可設定在同一裝置！已自動切換為「搖桿 ${alt}」。`);
        }
    } else {
        if (controlConfig.flip) controlConfig.flip.stick = flipSel.value;
    }
    saveRabboniSettings();
}

function updateRabboniConf() {
    if (!controlConfig) return;

    ['pitch', 'yaw', 'roll', 'thrust'].forEach(axis => {
        let stickEl = document.getElementById(`r-${axis}-stick`);
        let modeEl = document.getElementById(`r-${axis}-mode`);
        let angleEl = document.getElementById(`r-${axis}-angle`);
        let sensEl = document.getElementById(`r-${axis}-sens`);
        let invEl = document.getElementById(`r-${axis}-inv`);
        
        if (stickEl && controlConfig[axis]) controlConfig[axis].stick = stickEl.value;
        if (modeEl && controlConfig[axis]) controlConfig[axis].mode = modeEl.value;
        if (angleEl && controlConfig[axis]) controlConfig[axis].fixedAngle = Math.max(1.0, parseFloat(angleEl.value) || 15.0);
        if (sensEl && controlConfig[axis]) controlConfig[axis].sens = parseFloat(sensEl.value) || 1.0;
        if (invEl && controlConfig[axis]) controlConfig[axis].invert = invEl.checked;
        
        // 即時數值標籤更新
        let sensValEl = document.getElementById(`r-${axis}-sens-val`);
        if (sensValEl && sensEl) sensValEl.innerText = parseFloat(sensEl.value).toFixed(1);
    });

    // 翻滾項目更新
    let flipStickEl = document.getElementById('r-flip-stick');
    let flipSensEl = document.getElementById('r-flip-sens');
    if (flipStickEl && controlConfig.flip) controlConfig.flip.stick = flipStickEl.value;
    if (flipSensEl && controlConfig.flip) {
        controlConfig.flip.sens = parseFloat(flipSensEl.value) || 1.0;
        let flipSensVal = document.getElementById('r-flip-sens-val');
        if (flipSensVal) flipSensVal.innerText = controlConfig.flip.sens.toFixed(1);
    }

    // 1.B 翻滾與角度閥值 UI 聯動邏輯
    const isPitchFixed = (controlConfig.pitch.mode === 'fixed');
    const rowFlip = document.getElementById('row-flip');
    if (rowFlip) {
        rowFlip.style.display = isPitchFixed ? 'table-row' : 'none';
    }

    // 當 1.X 為 B (定速) 時，強制確保翻滾不與 1.B 同裝置
    if (isPitchFixed) {
        handleFlipStickChange();
    }

    // 顯示/隱藏各軸「固定的角度」輸入框
    ['pitch', 'yaw', 'roll'].forEach(axis => {
        const isFixed = (controlConfig[axis].mode === 'fixed');
        const inputAngle = document.getElementById(`r-${axis}-angle`);
        const unitAngle = document.getElementById(`r-${axis}-angle-unit`);
        const naAngle = document.getElementById(`r-${axis}-angle-na`);
        if (inputAngle) inputAngle.style.display = isFixed ? 'inline-block' : 'none';
        if (unitAngle) unitAngle.style.display = isFixed ? 'inline' : 'none';
        if (naAngle) naAngle.style.display = isFixed ? 'none' : 'inline';
    });

    saveRabboniSettings();
}

function syncSettingsToUI() {
    loadRabboniSettings();
    updateRabboniDropdowns();

    ['pitch', 'yaw', 'roll', 'thrust'].forEach(axis => {
        let stickEl = document.getElementById(`r-${axis}-stick`);
        let modeEl = document.getElementById(`r-${axis}-mode`);
        let angleEl = document.getElementById(`r-${axis}-angle`);
        let sensEl = document.getElementById(`r-${axis}-sens`);
        let sensValEl = document.getElementById(`r-${axis}-sens-val`);
        let invEl = document.getElementById(`r-${axis}-inv`);
        
        if (controlConfig[axis]) {
            if (stickEl) stickEl.value = controlConfig[axis].stick;
            if (modeEl) modeEl.value = controlConfig[axis].mode;
            if (angleEl) angleEl.value = controlConfig[axis].fixedAngle || 15.0;
            if (sensEl) sensEl.value = controlConfig[axis].sens || 1.0;
            if (sensValEl) sensValEl.innerText = (controlConfig[axis].sens || 1.0).toFixed(1);
            if (invEl) invEl.checked = !!controlConfig[axis].invert;
        }
    });

    let flipStickEl = document.getElementById('r-flip-stick');
    let flipSensEl = document.getElementById('r-flip-sens');
    let flipSensVal = document.getElementById('r-flip-sens-val');
    if (controlConfig.flip) {
        if (flipStickEl) flipStickEl.value = controlConfig.flip.stick || 'B';
        if (flipSensEl) flipSensEl.value = controlConfig.flip.sens || 1.0;
        if (flipSensVal) flipSensVal.innerText = (controlConfig.flip.sens || 1.0).toFixed(1);
    }

    // 觸發 UI 聯動調整
    updateRabboniConf();
    updateControllerStatusHud();
}

window.addEventListener('DOMContentLoaded', () => {
    setTimeout(syncSettingsToUI, 400);
});

// --- 4. 核心實時搖桿數據解算 (High-Rate Physics Input Processor) ---
function getStickValue(axis) {
    if (!controlConfig || !controlConfig[axis]) return 0;
    
    let config = controlConfig[axis];
    let stickName = config.stick; // 'A' or 'B'
    let targetDeviceName = rabboniSelection[stickName];
    
    let sourceVal = 0.0;    // 標準化值 (-1.0 ~ +1.0)
    let angleDeg = 0.0;     // 物理傾角 (度)

    // A. Switch 搖桿 (Bluetooth Gamepad) 輸入源
    let gp = getSwitchGamepad();
    if (targetDeviceName === 'SWITCH' && gp && gp.connected) {
        // Stick A (左搖桿): axes[0] = X, axes[1] = Y
        // Stick B (右搖桿): axes[2] = X, axes[3] = Y
        let rawAxisX = (stickName === 'A') ? (gp.axes[0] || 0) : (gp.axes[2] || 0);
        let rawAxisY = (stickName === 'A') ? (gp.axes[1] || 0) : (gp.axes[3] || 0);
        
        // 0.08 死區濾除搖桿漂移
        let axisX = Math.abs(rawAxisX) > 0.08 ? rawAxisX : 0;
        let axisY = Math.abs(rawAxisY) > 0.08 ? rawAxisY : 0;

        if (axis === 'pitch' || axis === 'thrust') {
            sourceVal = -axisY; // 搖桿向上推為正向
            angleDeg = sourceVal * 30.0; // 映射標準全行程為 30 度
        } else {
            sourceVal = axisX; // 搖桿向右推為正向
            angleDeg = sourceVal * 30.0;
        }
    } 
    // B. Rabboni 六軸體感輸入源
    else if (targetDeviceName && rabboniDevices[targetDeviceName] && rabboniDevices[targetDeviceName].connected) {
        let rabboni = rabboniDevices[targetDeviceName];
        if (axis === 'pitch') {
            angleDeg = rabboni.pitch;
            sourceVal = rabboni.pitch / 30.0;
        } else if (axis === 'roll') {
            angleDeg = rabboni.roll;
            sourceVal = rabboni.roll / 30.0;
        } else if (axis === 'yaw') {
            angleDeg = rabboni.yaw;
            sourceVal = (rabboni.yaw * Math.PI / 180) / Math.PI;
        } else if (axis === 'thrust') {
            sourceVal = rabboni.az;
            angleDeg = Math.abs(rabboni.pitch);
        }
    } 
    // C. 鍵盤保底輸入源 (直接依據美國手/日本手標準佈局映射，確保鍵盤操作百分之百精確無誤)
    else {
        let modeUS = (typeof controlMode !== 'undefined') ? (controlMode === 'american') : false;
        if (modeUS) {
            // 美國手 (Mode 2): 左手 (W/S=油門, A/D=偏航) | 右手 (Up/Down=俯仰, Left/Right=橫滾)
            if (axis === 'thrust') {
                if (keys.w) sourceVal += 1.0;
                if (keys.s) sourceVal -= 1.0;
            } else if (axis === 'yaw') {
                if (keys.a) sourceVal -= 1.0;
                if (keys.d) sourceVal += 1.0;
            } else if (axis === 'pitch') {
                if (keys.up) sourceVal += 1.0;
                if (keys.down) sourceVal -= 1.0;
            } else if (axis === 'roll') {
                if (keys.left) sourceVal -= 1.0;
                if (keys.right) sourceVal += 1.0;
            }
        } else {
            // 日本手 (Mode 1): 右手 (Up/Down=油門, Left/Right=橫滾) | 左手 (W/S=俯仰, A/D=偏航)
            if (axis === 'thrust') {
                if (keys.up) sourceVal += 1.0;
                if (keys.down) sourceVal -= 1.0;
            } else if (axis === 'yaw') {
                if (keys.a) sourceVal -= 1.0;
                if (keys.d) sourceVal += 1.0;
            } else if (axis === 'pitch') {
                if (keys.w) sourceVal += 1.0;
                if (keys.s) sourceVal -= 1.0;
            } else if (axis === 'roll') {
                if (keys.left) sourceVal -= 1.0;
                if (keys.right) sourceVal += 1.0;
            }
        }
        angleDeg = sourceVal * 30.0;
    }

    let outVal = 0.0;
    let sens = (typeof config.sens === 'number') ? config.sens : 1.0;
    let fixedThreshold = (typeof config.fixedAngle === 'number') ? config.fixedAngle : 15.0;

    // --- 4. 油門 (Thrust / Throttle) 運算模式 ---
    if (axis === 'thrust') {
        // 下鍵、S鍵或無正向油門時，油門強制歸零！絕對不會往上飛！
        if (sourceVal <= 0.05 && (!targetDeviceName || angleDeg <= fixedThreshold)) {
            outVal = 0.0;
        } else if (config.mode === 'fixed') {
            // A. 定速模式：只有正向推動或向上傾斜超過閾值才給予油門
            if (sourceVal > 0.05 || (targetDeviceName && angleDeg > fixedThreshold)) {
                outVal = 1.0 * sens;
            } else {
                outVal = 0.0;
            }
        } else {
            // B. 根據角度來控制速度模式 (負值強制歸零)
            let normalizedAngle = targetDeviceName ? Math.min(Math.max(angleDeg / 30.0, 0), 1.5) : Math.max(sourceVal, 0);
            outVal = normalizedAngle * sens;
        }
    } 
    // --- 1.X, 2.Y, 3.Z 軸旋轉運算模式 ---
    else {
        if (config.mode === 'sync') {
            // A. 同步角度模式：無人機角度實時與設備傾角保持一致
            outVal = sourceVal * sens;
        } else {
            // B. 定速模式：當設備傾斜角度超過設定之「固定的角度」時，以固定角速度旋轉
            if (Math.abs(angleDeg) >= fixedThreshold) {
                outVal = Math.sign(sourceVal) * 1.0 * sens;
            } else {
                outVal = 0.0;
            }
        }
    }

    if (config.invert) {
        outVal = -outVal;
    }

    return outVal;
}

// --- 5. 翻滾觸發檢測 (Switch ZR/ZL & Rabboni Trigger) ---
function pollFlipTriggers() {
    if (typeof flipState === 'undefined' || flipState !== 0) return 0;
    if (typeof currentPage !== 'undefined' && currentPage !== 'page-D') return 0;
    if (window.droneCrashed) return 0;

    // A. Switch 搖桿 ZR / ZL 實體鍵檢測
    const gp = getSwitchGamepad();
    if (gp && gp.connected && gp.buttons) {
        // ZL: buttons[6] (Left Trigger)
        const btnZL = (gp.buttons[6] && (gp.buttons[6].pressed || gp.buttons[6].value > 0.5)) || (gp.buttons[4] && gp.buttons[4].pressed);
        // ZR: buttons[7] (Right Trigger)
        const btnZR = (gp.buttons[7] && (gp.buttons[7].pressed || gp.buttons[7].value > 0.5)) || (gp.buttons[5] && gp.buttons[5].pressed);
        
        if (btnZL) return -1; // 向左翻滾
        if (btnZR) return 1;  // 向右翻滾
    }

    // B. Rabboni 體感板按鈕觸發
    let flipStick = controlConfig.flip ? controlConfig.flip.stick : 'B';
    let targetDeviceName = rabboniSelection[flipStick];
    let rabboni = (targetDeviceName && rabboniDevices[targetDeviceName]) ? rabboniDevices[targetDeviceName] : null;
    if (rabboni && rabboni.connected && rabboni.trigger) {
        return 1; // 體感按鈕翻滾
    }

    return 0;
}

function isRabboniTriggerPressed() {
    return pollFlipTriggers() !== 0;
}

window.getStickValue = getStickValue;
window.pollFlipTriggers = pollFlipTriggers;
window.isRabboniTriggerPressed = isRabboniTriggerPressed;
window.updateRabboniConf = updateRabboniConf;
window.updateRabboniSelection = updateRabboniSelection;
window.handleFlipStickChange = handleFlipStickChange;
window.resetAll設定 = function() {
    controlConfig = {
        pitch:  { stick: 'A', mode: 'sync',  fixedAngle: 15.0, sens: 1.0, invert: false },
        yaw:    { stick: 'B', mode: 'fixed', fixedAngle: 15.0, sens: 1.0, invert: false },
        roll:   { stick: 'A', mode: 'sync',  fixedAngle: 15.0, sens: 1.0, invert: false },
        thrust: { stick: 'B', mode: 'fixed', fixedAngle: 15.0, sens: 1.0, invert: false },
        flip:   { stick: 'B', sens: 1.0 }
    };
    rabboniSelection = { A: '', B: '' };
    saveRabboniSettings();
    syncSettingsToUI();
    if (typeof showAlert === 'function') showAlert('所有搖桿與控制器設定已恢復預設值！');
};
