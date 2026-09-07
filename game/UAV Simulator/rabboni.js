// Rabboni Controller Implementation
class Rabboni {
    constructor(name) {
        this.name = name;
        this.device = null;
        this.characteristic = null;
        this.connected = false;
        
        // Sensor Data
        this.ax = 0; this.ay = 0; this.az = 0;
        this.gx = 0; this.gy = 0; this.gz = 0;
        this.pitch = 0; this.roll = 0; this.yaw = 0;
        
        this.onUpdate = null;
    }
    
    async connect() {
        try {
            this.device = await navigator.bluetooth.requestDevice({
                acceptAllDevices: true,
                optionalServices: ['0000ffe0-0000-1000-8000-00805f9b34fb', '6e400001-b5a3-f393-e0a9-e50e24dcca9e'] // Standard BLE UART
            });
            
            const server = await this.device.gatt.connect();
            let service = null;
            try { service = await server.getPrimaryService('0000ffe0-0000-1000-8000-00805f9b34fb'); } catch(e) {}
            if(!service) { service = await server.getPrimaryService('6e400001-b5a3-f393-e0a9-e50e24dcca9e'); }
            
            if (service) {
                const chars = await service.getCharacteristics();
                this.characteristic = chars.find(c => c.properties.notify);
                if (this.characteristic) {
                    await this.characteristic.startNotifications();
                    this.characteristic.addEventListener('characteristicvaluechanged', (e) => this.handleData(e));
                    this.connected = true;
                    console.log(this.name + ' connected!');
                }
            }
        } catch (e) {
            console.error('Rabboni Connect Error:', e);
        }
    }
    
    handleData(event) {
        let value = event.target.value;
        try {
            const dec = new TextDecoder('utf-8');
            const str = dec.decode(value);
            const parts = str.split(',').map(Number);
            if (parts.length >= 6) {
                this.ax = parts[0]; this.ay = parts[1]; this.az = parts[2];
                this.gx = parts[3]; this.gy = parts[4]; this.gz = parts[5];
            } else if (value.byteLength >= 12) {
                this.ax = value.getInt16(0, true) / 16384.0;
                this.ay = value.getInt16(2, true) / 16384.0;
                this.az = value.getInt16(4, true) / 16384.0;
                this.gx = value.getInt16(6, true) / 131.0;
                this.gy = value.getInt16(8, true) / 131.0;
                this.gz = value.getInt16(10, true) / 131.0;
            }
            
            // Calculate angles
            this.pitch = Math.atan2(this.ay, Math.sqrt(this.ax*this.ax + this.az*this.az)) * 180 / Math.PI;
            this.roll = Math.atan2(-this.ax, this.az) * 180 / Math.PI;
            this.yaw += this.gz * 0.05; // naive integration
            
            if (this.onUpdate) this.onUpdate(this);
        } catch (e) {}
    }
}

const rabboniA = new Rabboni('Rabboni A');
const rabboniB = new Rabboni('Rabboni B');

let controlConfig = {
    pitch: { stick: 'A', mode: 'fixed', sens: 1.0 },
    roll: { stick: 'A', mode: 'fixed', sens: 1.0 },
    thrust: { stick: 'B', mode: 'fixed', sens: 1.0 },
    yaw: { stick: 'B', mode: 'fixed', sens: 1.0 }
};

function getStickValue(axis) {
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

    let rabboni = stickName === 'A' ? rabboniA : rabboniB;
    
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
    if (rabboni.connected) {
        if (config.mode === 'sync') {
            if (axis === 'pitch') return rabboni.pitch * config.sens;
            if (axis === 'roll') return rabboni.roll * config.sens;
            if (axis === 'yaw') return rabboni.yaw * config.sens;
            if (axis === 'thrust') return rabboni.az * config.sens; // Z-axis Accel
        } else {
            // Threshold / Fixed Mode from Rabboni tilt
            let rVal = 0;
            if (axis === 'pitch' && Math.abs(rabboni.pitch) > 15) rVal = Math.sign(rabboni.pitch);
            if (axis === 'roll' && Math.abs(rabboni.roll) > 15) rVal = Math.sign(rabboni.roll);
            if (axis === 'yaw' && Math.abs(rabboni.yaw % 360) > 15) rVal = Math.sign(rabboni.yaw);
            if (axis === 'thrust' && Math.abs(rabboni.az) > 1.2) rVal = Math.sign(rabboni.az);
            val = rVal || val; // prioritize rabboni
        }
    }
    
    return val * config.sens;
}
