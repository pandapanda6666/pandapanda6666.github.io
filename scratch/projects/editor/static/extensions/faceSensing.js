class FaceSensingExtension {
    constructor(runtime) {
        this.runtime = runtime;
        window.scratchVM = runtime; // Expose VM for stretchUI.js
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
            name: '臉部偵測',
            color1: '#4b96ff',
            color2: '#3871c0',
            color3: '#2d5a99',
            blocks: [
                { opcode: 'whenFaceDetected', blockType: 'hat', text: '當偵測到臉部', isEdgeActivated: false },
                { opcode: 'isFaceDetected', blockType: 'Boolean', text: '偵測到臉部?' },
                { opcode: 'getFacePartX', blockType: 'reporter', text: '[PART] 的 X 座標', arguments: { PART: { type: 'string', menu: 'FACE_PARTS', defaultValue: 'nose' } } },
                { opcode: 'getFacePartY', blockType: 'reporter', text: '[PART] 的 Y 座標', arguments: { PART: { type: 'string', menu: 'FACE_PARTS', defaultValue: 'nose' } } },
                { opcode: 'getFacePartWidth', blockType: 'reporter', text: '[PART] 的寬度', arguments: { PART: { type: 'string', menu: 'FACE_PARTS', defaultValue: 'nose' } } },
                { opcode: 'getFacePartHeight', blockType: 'reporter', text: '[PART] 的高度', arguments: { PART: { type: 'string', menu: 'FACE_PARTS', defaultValue: 'nose' } } },
                { opcode: 'setVideoTransparency', blockType: 'command', text: '視訊透明度設為 [TRANSPARENCY]', arguments: { TRANSPARENCY: { type: 'number', defaultValue: 50 } } }
            ],
            menus: {
                FACE_PARTS: {
                    acceptReporters: false,
                    items: [
                        {text: '臉', value: 'face'},
                        {text: '鼻子', value: 'nose'},
                        {text: '嘴巴', value: 'mouth'},
                        {text: '左眼', value: 'left_eye'},
                        {text: '右眼', value: 'right_eye'},
                        {text: '兩眼之間', value: 'between_eyes'},
                        {text: '左耳', value: 'left_ear'},
                        {text: '右耳', value: 'right_ear'},
                        {text: '頭頂', value: 'top_of_head'}
                    ]
                }
            }
        };
    }

    whenFaceDetected(args, util) { return this.faces.length > 0; }
    isFaceDetected() { return this.faces.length > 0; }
    
    // 取得特徵點平均座標
    _getAveragePoint(indices) {
        if (this.faces.length === 0) return null;
        let sumX = 0, sumY = 0;
        for (let idx of indices) {
            sumX += this.faces[0][idx].x;
            sumY += this.faces[0][idx].y;
        }
        return { x: sumX / indices.length, y: sumY / indices.length };
    }

    _getPartPos(part) {
        // MediaPipe Face Mesh indices
        const mapping = {
            'face': [152, 10, 234, 454], // chin, top, left, right edge
            'nose': [1],
            'mouth': [13, 14], // upper and lower lip inner
            'left_eye': [33, 133],
            'right_eye': [362, 263],
            'between_eyes': [168],
            'left_ear': [234], // approx left cheek/ear edge
            'right_ear': [454], // approx right cheek/ear edge
            'top_of_head': [10] // top of face mesh
        };
        const indices = mapping[part];
        if (!indices) return null;
        return this._getAveragePoint(indices);
    }

    getFacePartX(args) {
        const pt = this._getPartPos(args.PART);
        if (!pt) return 0;
        return Math.round((0.5 - pt.x) * 480);
    }

    getFacePartY(args) {
        const pt = this._getPartPos(args.PART);
        if (!pt) return 0;
        return Math.round((0.5 - pt.y) * 360);
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
        if (part === 'face') return this.getFaceDistance(234, 454);
        if (part === 'nose') return this.getFaceDistance(129, 358);
        if (part === 'mouth') return this.getFaceDistance(61, 291);
        if (part === 'left_eye') return this.getFaceDistance(33, 133);
        if (part === 'right_eye') return this.getFaceDistance(362, 263);
        if (part === 'between_eyes') return this.getFaceDistance(33, 362);
        if (part === 'left_ear' || part === 'right_ear') return 20;
        if (part === 'top_of_head') return this.getFaceDistance(109, 338);
        return 0;
    }

    getFacePartHeight(args) {
        const part = args.PART;
        if (part === 'face') return this.getFaceDistance(10, 152);
        if (part === 'nose') return this.getFaceDistance(168, 2);
        if (part === 'mouth') return this.getFaceDistance(0, 17);
        if (part === 'left_eye') return this.getFaceDistance(159, 145);
        if (part === 'right_eye') return this.getFaceDistance(386, 374);
        if (part === 'between_eyes') return 20;
        if (part === 'left_ear' || part === 'right_ear') return 40;
        if (part === 'top_of_head') return 20;
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

    _patchStretch(target) {
        if (!target._pandaStretchPatched) {
            target._pandaStretchPatched = true;
            const originalGet = target._getRenderedDirectionAndScale;
            target._getRenderedDirectionAndScale = function() {
                const res = originalGet.call(this);
                let signX = res.scale[0] < 0 ? -1 : 1;
                let signY = res.scale[1] < 0 ? -1 : 1;
                let w = this.stretchWidth !== undefined ? this.stretchWidth : this.size;
                let h = this.stretchHeight !== undefined ? this.stretchHeight : this.size;
                res.scale = [signX * w, signY * h];
                return res;
            };
            const originalSetSize = target.setSize;
            target.setSize = function(size) {
                this.stretchWidth = undefined;
                this.stretchHeight = undefined;
                originalSetSize.call(this, size);
            };
        }
    }

    setStretch(args, util) {
        const target = util ? util.target : args.target; // allow direct call from UI
        if (target.isStage) return;
        
        const costumes = target.getCostumes ? target.getCostumes() : target.sprite.costumes;
        const costume = costumes[target.currentCostume];
        const [cw, ch] = costume.size;
        
        let targetW = Number(args.WIDTH) || 0;
        let targetH = Number(args.HEIGHT) || 0;
        
        if (args.UNIT_W === 'PIXEL' && cw > 0) {
            targetW = (targetW / cw) * 100;
        }
        if (args.UNIT_H === 'PIXEL' && ch > 0) {
            targetH = (targetH / ch) * 100;
        }
        
        target.stretchWidth = targetW;
        target.stretchHeight = targetH;
        
        this._patchStretch(target);
        
        if (target.renderer) {
            const {direction, scale} = target._getRenderedDirectionAndScale();
            target.renderer.updateDrawableDirectionScale(target.drawableID, direction, scale);
            if (target.visible) {
                target.runtime.requestRedraw();
            }
        }
    }

    stretchBy(args, util) {
        const target = util.target;
        if (target.isStage) return;
        
        const costumes = target.getCostumes ? target.getCostumes() : target.sprite.costumes;
        const costume = costumes[target.currentCostume];
        const [cw, ch] = costume.size;
        
        if (cw === 0 || ch === 0) return;
        
        let pixelValue = Number(args.VALUE) || 0;
        
        let targetW, targetH;
        if (args.DIMENSION === 'WIDTH') {
            targetW = (pixelValue / cw) * 100;
            targetH = targetW; // equal percentage scale
        } else {
            targetH = (pixelValue / ch) * 100;
            targetW = targetH;
        }
        
        target.stretchWidth = targetW;
        target.stretchHeight = targetH;
        
        this._patchStretch(target);
        
        if (target.renderer) {
            const {direction, scale} = target._getRenderedDirectionAndScale();
            target.renderer.updateDrawableDirectionScale(target.drawableID, direction, scale);
            if (target.visible) {
                target.runtime.requestRedraw();
            }
        }
    }
}

window.FaceSensingExtension = FaceSensingExtension;
window.pandaSetStretch = function(a, u) { FaceSensingExtension.prototype.setStretch.call(FaceSensingExtension.prototype, a, u); };
window.pandaStretchBy = function(a, u) { FaceSensingExtension.prototype.stretchBy.call(FaceSensingExtension.prototype, a, u); };
