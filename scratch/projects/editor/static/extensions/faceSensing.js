class FaceSensingExtension {
    constructor(runtime) {
        this.runtime = runtime;
        this.faceLandmarker = null;
        this.faces = [];
        this.videoRunning = false;
        
        this.startVideoSensing();
        this.initMediaPipe();
    }

    async initMediaPipe() {
        if (typeof window === 'undefined') return;
        try {
            const vision = await import('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/vision_bundle.js');
            const filesetResolver = await vision.FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm');
            this.faceLandmarker = await vision.FaceLandmarker.createFromOptions(filesetResolver, {
                baseOptions: {
                    modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
                    delegate: 'GPU'
                },
                outputFaceBlendshapes: false,
                runningMode: 'VIDEO',
                numFaces: 1
            });
            this.detectLoop();
        } catch (err) {
            console.error("Face Sensing: MediaPipe failed to load", err);
        }
    }

    startVideoSensing() {
        if (this.runtime.ioDevices && this.runtime.ioDevices.video) {
            this.runtime.ioDevices.video.enableVideo().then(() => {
                this.runtime.ioDevices.video.mirror = true;
                if (typeof this.runtime.ioDevices.video.setPreviewGhost === 'function') {
                    this.runtime.ioDevices.video.setPreviewGhost(50);
                }
                this.videoRunning = true;
                if (this.faceLandmarker) {
                    this.detectLoop();
                }
            }).catch(err => {});
        }
    }

    async detectLoop() {
        if (!this.videoRunning || !this.faceLandmarker) return;
        try {
            const videoProvider = this.runtime.ioDevices.video.provider;
            if (videoProvider && videoProvider.videoReady && videoProvider.video) {
                const results = await this.faceLandmarker.detectForVideo(videoProvider.video, performance.now());
                if (results && results.faceLandmarks) {
                    this.faces = results.faceLandmarks;
                } else {
                    this.faces = [];
                }
            }
        } catch (e) {}
        requestAnimationFrame(() => this.detectLoop());
    }

    getInfo() {
        return {
            id: 'facesensing',
            name: 'Face Sensing',
            color1: '#4b96ff',
            color2: '#3871c0',
            color3: '#2d5a99',
            blocks: [
                { opcode: 'whenFaceDetected', blockType: 'hat', text: '當偵測到臉部', isEdgeActivated: false },
                { opcode: 'isFaceDetected', blockType: 'Boolean', text: '偵測到臉部?' },
                { opcode: 'getFacePartX', blockType: 'reporter', text: '[PART] 的 X 座標', arguments: { PART: { type: 'string', menu: 'FACE_PARTS', defaultValue: 'nose' } } },
                { opcode: 'getFacePartY', blockType: 'reporter', text: '[PART] 的 Y 座標', arguments: { PART: { type: 'string', menu: 'FACE_PARTS', defaultValue: 'nose' } } },
                { opcode: 'getFacePartWidth', blockType: 'reporter', text: '[PART] 的 寬度', arguments: { PART: { type: 'string', menu: 'FACE_PARTS', defaultValue: 'nose' } } },
                { opcode: 'getFacePartHeight', blockType: 'reporter', text: '[PART] 的 高度', arguments: { PART: { type: 'string', menu: 'FACE_PARTS', defaultValue: 'nose' } } },
                { opcode: 'setVideoTransparency', blockType: 'command', text: '視訊透明度設為 [TRANSPARENCY]', arguments: { TRANSPARENCY: { type: 'number', defaultValue: 50 } } }
            ],
            menus: {
                FACE_PARTS: {
                    acceptReporters: false,
                    items: [
                        {text: '鼻子', value: 'nose'},
                        {text: '左眼', value: 'left_eye'},
                        {text: '右眼', value: 'right_eye'},
                        {text: '嘴巴', value: 'mouth'}
                    ]
                }
            }
        };
    }

    whenFaceDetected(args, util) { return this.faces.length > 0; }
    isFaceDetected() { return this.faces.length > 0; }

    getFacePartX(args) {
        if (this.faces.length === 0) return 0;
        const FACE_PARTS = { nose: 1, left_eye: 33, right_eye: 263, mouth: 14 };
        const partIdx = FACE_PARTS[args.PART];
        if (partIdx === undefined) return 0;
        return Math.round((0.5 - this.faces[0][partIdx].x) * 480);
    }

    getFacePartY(args) {
        if (this.faces.length === 0) return 0;
        const FACE_PARTS = { nose: 1, left_eye: 33, right_eye: 263, mouth: 14 };
        const partIdx = FACE_PARTS[args.PART];
        if (partIdx === undefined) return 0;
        return Math.round((0.5 - this.faces[0][partIdx].y) * 360);
    }
    
    getFaceDistance(idx1, idx2) {
        if (this.faces.length === 0) return 0;
        const p1 = this.faces[0][idx1];
        const p2 = this.faces[0][idx2];
        const dx = (p1.x - p2.x) * 480;
        const dy = (p1.y - p2.y) * 360;
        return Math.round(Math.sqrt(dx*dx + dy*dy));
    }

    getFacePartWidth(args) {
        const part = args.PART;
        if (part === 'nose') return this.getFaceDistance(129, 358);
        if (part === 'left_eye') return this.getFaceDistance(33, 133);
        if (part === 'right_eye') return this.getFaceDistance(362, 263);
        if (part === 'mouth') return this.getFaceDistance(61, 291);
        return 0;
    }

    getFacePartHeight(args) {
        const part = args.PART;
        if (part === 'nose') return this.getFaceDistance(168, 2);
        if (part === 'left_eye') return this.getFaceDistance(159, 145);
        if (part === 'right_eye') return this.getFaceDistance(386, 374);
        if (part === 'mouth') return this.getFaceDistance(0, 17);
        return 0;
    }

    setVideoTransparency(args) {
        let t = Number(args.TRANSPARENCY);
        if (isNaN(t)) t = 50;
        t = Math.max(0, Math.min(100, t));
        if (this.runtime.ioDevices && this.runtime.ioDevices.video && typeof this.runtime.ioDevices.video.setPreviewGhost === 'function') {
            this.runtime.ioDevices.video.setPreviewGhost(t);
        }
    }
}



window.pandaSetStretch = FaceSensingExtension.prototype.setStretch;
