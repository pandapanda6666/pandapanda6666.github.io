class FaceSensingExtension {
    constructor(runtime) {
        this.runtime = runtime;
        this.faceLandmarker = null;
        this.faces = [];
        this.videoRunning = false;
        this.initMediaPipe();
    }

    async initMediaPipe() {
        if (typeof document === 'undefined') return;
        
        // Dynamically load MediaPipe vision tasks
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/vision_bundle.js';
        script.onload = async () => {
            const vision = window;
            const filesetResolver = await vision.FilesetResolver.forVisionTasks(
                'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm'
            );
            this.faceLandmarker = await vision.FaceLandmarker.createFromOptions(filesetResolver, {
                baseOptions: {
                    modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
                    delegate: 'GPU'
                },
                outputFaceBlendshapes: false,
                runningMode: 'VIDEO',
                numFaces: 1
            });
            this.startVideoSensing();
        };
        document.head.appendChild(script);
    }

    startVideoSensing() {
        // Enable Scratch's built-in video system (this will show the video on stage)
        if (this.runtime.ioDevices && this.runtime.ioDevices.video) {
            this.runtime.ioDevices.video.enableVideo().then(() => {
                this.runtime.ioDevices.video.mirror = true; // Typically mirrored for Face Sensing
                this.videoRunning = true;
                this.detectLoop();
            }).catch(err => {
                console.error("Face Sensing: Cannot access camera", err);
            });
        }
    }

    async detectLoop() {
        if (!this.videoRunning || !this.faceLandmarker) return;
        
        try {
            // Get the video element from Scratch's video provider
            const videoProvider = this.runtime.ioDevices.video.provider;
            if (videoProvider && videoProvider.videoReady && videoProvider.video) {
                const videoElement = videoProvider.video;
                const results = await this.faceLandmarker.detectForVideo(videoElement, performance.now());
                if (results && results.faceLandmarks) {
                    this.faces = results.faceLandmarks;
                } else {
                    this.faces = [];
                }
            }
        } catch (e) {
            console.error("FaceSensing detect error:", e);
        }
        
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
                {
                    opcode: 'whenFaceDetected',
                    blockType: 'hat',
                    text: '當偵測到臉部',
                    isEdgeActivated: false
                },
                {
                    opcode: 'isFaceDetected',
                    blockType: 'Boolean',
                    text: '偵測到臉部?'
                },
                {
                    opcode: 'getFacePartX',
                    blockType: 'reporter',
                    text: '[PART] 的 X 座標',
                    arguments: {
                        PART: {
                            type: 'string',
                            menu: 'FACE_PARTS',
                            defaultValue: 'nose'
                        }
                    }
                },
                {
                    opcode: 'getFacePartY',
                    blockType: 'reporter',
                    text: '[PART] 的 Y 座標',
                    arguments: {
                        PART: {
                            type: 'string',
                            menu: 'FACE_PARTS',
                            defaultValue: 'nose'
                        }
                    }
                }
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

    whenFaceDetected(args, util) {
        return this.faces.length > 0;
    }

    isFaceDetected() {
        return this.faces.length > 0;
    }

    getFacePartX(args) {
        if (this.faces.length === 0) return 0;
        const FACE_PARTS = {
            nose: 1,
            left_eye: 33,
            right_eye: 263,
            mouth: 14
        };
        const partIdx = FACE_PARTS[args.PART];
        if (partIdx === undefined) return 0;
        
        const mpX = this.faces[0][partIdx].x;
        // The video is mirrored, so we need to account for it
        return Math.round((0.5 - mpX) * 480);
    }

    getFacePartY(args) {
        if (this.faces.length === 0) return 0;
        const FACE_PARTS = {
            nose: 1,
            left_eye: 33,
            right_eye: 263,
            mouth: 14
        };
        const partIdx = FACE_PARTS[args.PART];
        if (partIdx === undefined) return 0;
        
        const mpY = this.faces[0][partIdx].y;
        return Math.round((0.5 - mpY) * 360);
    }
}

Scratch.extensions.register(new FaceSensingExtension());
