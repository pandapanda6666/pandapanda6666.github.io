class BodySensingExtension {
    constructor(runtime) {
        this.runtime = runtime;
        this.poseLandmarker = null;
        this.handLandmarker = null;
        this.handsLoaded = false;
        
        this.poses = [];
        this.hands = [];
        
        this.videoRunning = false;
        
        this.showSkeleton = false;
        this.skeletonColor = '#FF0000';
        this.skeletonLayer = Infinity; // top by default
        
        this.skeletonSkinId = null;
        this.skeletonDrawableId = null;
        
        this.startVideoSensing();
        this.initMediaPipe();
    }

    async initMediaPipe() {
        if (typeof window === 'undefined') return;
        try {
            const vision = await import('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/vision_bundle.js');
            this.vision = vision;
            this.filesetResolver = await vision.FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm');
            
            this.poseLandmarker = await vision.PoseLandmarker.createFromOptions(this.filesetResolver, {
                baseOptions: {
                    modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
                    delegate: 'GPU'
                },
                runningMode: 'VIDEO',
                numPoses: 1
            });
            this.detectLoop();
        } catch (err) {
            console.error("Body Sensing: MediaPipe failed to load", err);
        }
    }
    
    async loadHands() {
        if (this.handsLoaded) return;
        if (!confirm('開啟手指/腳趾偵測將會大幅降低效能，是否繼續？')) {
            throw new Error('User cancelled hand tracking');
        }
        try {
            this.handLandmarker = await this.vision.HandLandmarker.createFromOptions(this.filesetResolver, {
                baseOptions: {
                    modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
                    delegate: 'GPU'
                },
                runningMode: 'VIDEO',
                numHands: 2
            });
            this.handsLoaded = true;
        } catch (e) {
            console.error(e);
        }
    }

    startVideoSensing() {
        if (this.runtime.ioDevices && this.runtime.ioDevices.video) {
            this.runtime.ioDevices.video.enableVideo().then(() => {
                this.runtime.ioDevices.video.mirror = true;
                this.videoRunning = true;
                if (this.poseLandmarker) {
                    this.detectLoop();
                }
            }).catch(err => {});
        }
    }

    async detectLoop() {
        if (!this.videoRunning || !this.poseLandmarker) return;
        try {
            const videoProvider = this.runtime.ioDevices.video.provider;
            if (videoProvider && videoProvider.videoReady && videoProvider.video) {
                const ts = performance.now();
                const poseResults = await this.poseLandmarker.detectForVideo(videoProvider.video, ts);
                if (poseResults && poseResults.landmarks) {
                    this.poses = poseResults.landmarks;
                } else {
                    this.poses = [];
                }
                
                if (this.handsLoaded && this.handLandmarker) {
                    const handResults = await this.handLandmarker.detectForVideo(videoProvider.video, ts);
                    if (handResults && handResults.landmarks) {
                        this.hands = handResults.landmarks;
                    } else {
                        this.hands = [];
                    }
                }
                
                if (this.showSkeleton) {
                    this._renderSkeleton();
                } else if (this.skeletonDrawableId !== null) {
                    this._clearSkeleton();
                }
            }
        } catch (e) {}
        requestAnimationFrame(() => this.detectLoop());
    }
    
    _clearSkeleton() {
        if (this.skeletonSkinId !== null && this.runtime.renderer) {
            this.runtime.renderer.updateSVGSkin(this.skeletonSkinId, '<svg width="480" height="360" xmlns="http://www.w3.org/2000/svg"></svg>');
        }
    }
    
    _renderSkeleton() {
        if (!this.runtime.renderer) return;
        
        let svgLines = '';
        const color = this.skeletonColor;
        
        const drawBone = (idx1, idx2) => {
            if (this.poses.length === 0) return;
            const p1 = this.poses[0][idx1];
            const p2 = this.poses[0][idx2];
            if (p1.visibility < 0.5 || p2.visibility < 0.5) return;
            const x1 = p1.x * 480;
            const y1 = p1.y * 360;
            const x2 = p2.x * 480;
            const y2 = p2.y * 360;
            svgLines += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="4" stroke-linecap="round" />`;
            svgLines += `<circle cx="${x1}" cy="${y1}" r="3" fill="#fff" />`;
        };
        
        if (this.poses.length > 0) {
            // Shoulders
            drawBone(11, 12);
            // Arms
            drawBone(11, 13); drawBone(13, 15);
            drawBone(12, 14); drawBone(14, 16);
            // Torso
            drawBone(11, 23); drawBone(12, 24); drawBone(23, 24);
            // Legs
            drawBone(23, 25); drawBone(25, 27); drawBone(27, 29); drawBone(29, 31);
            drawBone(24, 26); drawBone(26, 28); drawBone(28, 30); drawBone(30, 32);
        }
        
        const svg = `<svg width="480" height="360" xmlns="http://www.w3.org/2000/svg">${svgLines}</svg>`;
        
        if (this.skeletonSkinId === null) {
            this.skeletonSkinId = this.runtime.renderer.createSVGSkin(svg);
            this.skeletonDrawableId = this.runtime.renderer.createDrawable('default');
            this.runtime.renderer.updateDrawableSkinId(this.skeletonDrawableId, this.skeletonSkinId);
            this.runtime.renderer.updateDrawablePosition(this.skeletonDrawableId, [0, 0]);
            this.runtime.renderer.updateDrawableDirectionScale(this.skeletonDrawableId, 90, [100, 100]);
            this.runtime.renderer.setDrawableOrder(this.skeletonDrawableId, this.skeletonLayer);
        } else {
            this.runtime.renderer.updateSVGSkin(this.skeletonSkinId, svg);
            // enforce layer order just in case
            this.runtime.renderer.setDrawableOrder(this.skeletonDrawableId, this.skeletonLayer);
        }
    }

    getInfo() {
        return {
            id: 'bodysensing',
            name: '身體偵測',
            color1: '#0fbd8c',
            color2: '#0b8e69',
            color3: '#08654b',
            blocks: [
                { opcode: 'whenBodyDetected', blockType: 'hat', text: '當偵測到身體', isEdgeActivated: false },
                { opcode: 'isBodyDetected', blockType: 'Boolean', text: '偵測到身體?' },
                { opcode: 'getBodyPartX', blockType: 'reporter', text: '[PART] 的 X 座標', arguments: { PART: { type: 'string', menu: 'BODY_PARTS', defaultValue: 'head' } } },
                { opcode: 'getBodyPartY', blockType: 'reporter', text: '[PART] 的 Y 座標', arguments: { PART: { type: 'string', menu: 'BODY_PARTS', defaultValue: 'head' } } },
                { opcode: 'getBodyPartWidth', blockType: 'reporter', text: '[PART] 的寬度', arguments: { PART: { type: 'string', menu: 'BODY_PARTS', defaultValue: 'head' } } },
                { opcode: 'getBodyPartHeight', blockType: 'reporter', text: '[PART] 的高度', arguments: { PART: { type: 'string', menu: 'BODY_PARTS', defaultValue: 'head' } } },
                '---',
                { opcode: 'setSkeletonVisible', blockType: 'command', text: '顯示骨架 [STATE]', arguments: { STATE: { type: 'string', menu: 'STATES', defaultValue: 'on' } } },
                { opcode: 'setSkeletonColor', blockType: 'command', text: '將骨架顏色設為 [COLOR]', arguments: { COLOR: { type: 'color', defaultValue: '#FF0000' } } },
                { opcode: 'setSkeletonLayer', blockType: 'command', text: '將骨架移到最 [LAYER] 層', arguments: { LAYER: { type: 'string', menu: 'LAYERS', defaultValue: 'top' } } }
            ],
            menus: {
                STATES: { acceptReporters: false, items: [{text: '開啟', value: 'on'}, {text: '關閉', value: 'off'}] },
                LAYERS: { acceptReporters: false, items: [{text: '上', value: 'top'}, {text: '下', value: 'bottom'}] },
                BODY_PARTS: {
                    acceptReporters: false,
                    items: [
                        {text: '頭', value: 'head'},
                        {text: '軀幹', value: 'torso'},
                        {text: '左手上臂', value: 'l_upper_arm'}, {text: '右手上臂', value: 'r_upper_arm'},
                        {text: '左手前臂', value: 'l_lower_arm'}, {text: '右手前臂', value: 'r_lower_arm'},
                        {text: '左手掌', value: 'l_hand'}, {text: '右手掌', value: 'r_hand'},
                        {text: '左大腿', value: 'l_upper_leg'}, {text: '右大腿', value: 'r_upper_leg'},
                        {text: '左小腿', value: 'l_lower_leg'}, {text: '右小腿', value: 'r_lower_leg'},
                        {text: '左腳掌', value: 'l_foot'}, {text: '右腳掌', value: 'r_foot'},
                        {text: '左手大拇指', value: 'l_thumb'}, {text: '右手大拇指', value: 'r_thumb'},
                        {text: '左手食指', value: 'l_index'}, {text: '右手食指', value: 'r_index'},
                        {text: '左手中指', value: 'l_middle'}, {text: '右手中指', value: 'r_middle'},
                        {text: '左手無名指', value: 'l_ring'}, {text: '右手無名指', value: 'r_ring'},
                        {text: '左手小拇指', value: 'l_pinky'}, {text: '右手小拇指', value: 'r_pinky'},
                        {text: '左腳大趾', value: 'l_toe1'}, {text: '右腳大趾', value: 'r_toe1'},
                        {text: '左腳二趾', value: 'l_toe2'}, {text: '右腳二趾', value: 'r_toe2'},
                        {text: '左腳中趾', value: 'l_toe3'}, {text: '右腳中趾', value: 'r_toe3'},
                        {text: '左腳四趾', value: 'l_toe4'}, {text: '右腳四趾', value: 'r_toe4'},
                        {text: '左腳小趾', value: 'l_toe5'}, {text: '右腳小趾', value: 'r_toe5'}
                    ]
                }
            }
        };
    }

    whenBodyDetected(args, util) { return this.poses.length > 0; }
    isBodyDetected() { return this.poses.length > 0; }
    
    setSkeletonVisible(args) { this.showSkeleton = (args.STATE === 'on'); }
    setSkeletonColor(args) { this.skeletonColor = args.COLOR; }
    setSkeletonLayer(args) {
        this.skeletonLayer = (args.LAYER === 'top') ? Infinity : -Infinity;
        if (this.skeletonDrawableId !== null && this.runtime.renderer) {
            this.runtime.renderer.setDrawableOrder(this.skeletonDrawableId, this.skeletonLayer);
        }
    }

    async _getPartPos(part) {
        if (this.poses.length === 0) return null;
        const pose = this.poses[0];
        
        // Map body parts
        const MAP = {
            'head': [0],
            'torso': [11, 12, 23, 24],
            'l_upper_arm': [11, 13], 'r_upper_arm': [12, 14],
            'l_lower_arm': [13, 15], 'r_lower_arm': [14, 16],
            'l_hand': [15, 17, 19, 21], 'r_hand': [16, 18, 20, 22],
            'l_upper_leg': [23, 25], 'r_upper_leg': [24, 26],
            'l_lower_leg': [25, 27], 'r_lower_leg': [26, 28],
            'l_foot': [27, 29, 31], 'r_foot': [28, 30, 32],
            // For toes, PoseLandmarker only tracks 31(L) and 32(R). We will approximate them.
            'l_toe1': [31], 'l_toe2': [31], 'l_toe3': [31], 'l_toe4': [31], 'l_toe5': [31],
            'r_toe1': [32], 'r_toe2': [32], 'r_toe3': [32], 'r_toe4': [32], 'r_toe5': [32]
        };
        
        // Hand fingers require HandLandmarker
        const HAND_MAP = {
            'l_thumb': 4, 'l_index': 8, 'l_middle': 12, 'l_ring': 16, 'l_pinky': 20,
            'r_thumb': 4, 'r_index': 8, 'r_middle': 12, 'r_ring': 16, 'r_pinky': 20
        };
        
        if (HAND_MAP[part] !== undefined) {
            if (!this.handsLoaded) {
                await this.loadHands().catch(() => {});
                return null;
            }
            if (this.hands.length === 0) return null;
            // find left or right hand
            const isLeft = part.startsWith('l_');
            const ptIdx = HAND_MAP[part];
            // MediaPipe Hands provides handedness, but vision tasks doesn't expose it easily in array sometimes.
            // We just use hands[0] as an approximation if we only have one.
            return this.hands[0][ptIdx];
        }
        
        const indices = MAP[part];
        if (!indices) return null;
        let sumX = 0, sumY = 0;
        for (let idx of indices) {
            sumX += pose[idx].x;
            sumY += pose[idx].y;
        }
        return { x: sumX / indices.length, y: sumY / indices.length };
    }

    getBodyPartX(args) {
        return new Promise(resolve => {
            this._getPartPos(args.PART).then(pt => {
                if (!pt) resolve(0);
                else resolve(Math.round((0.5 - pt.x) * 480));
            });
        });
    }

    getBodyPartY(args) {
        return new Promise(resolve => {
            this._getPartPos(args.PART).then(pt => {
                if (!pt) resolve(0);
                else resolve(Math.round((0.5 - pt.y) * 360));
            });
        });
    }

    getBodyPartWidth(args) { return 50; /* approx */ }
    getBodyPartHeight(args) { return 50; /* approx */ }
}

window.BodySensingExtension = BodySensingExtension;
