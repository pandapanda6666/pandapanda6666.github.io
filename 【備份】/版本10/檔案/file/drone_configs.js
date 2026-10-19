
window.allDrones = [
    { id: 'default', name: '預設無人機 (Procedural)', image: '', hasModel: true, modelStr: 'Procedural', tilt: 45, yaw: 10, thr: 1.0, elasticity: 0.4 },
    { id: 'hx115', name: 'BetaFPV HX115', image: '', hasModel: true, modelStr: 'hx115', tilt: 50, yaw: 12, thr: 1.2, elasticity: 0.3 },
    { id: 'tello', name: 'Tello EDU (懸停)', image: '', hasModel: true, modelStr: 'tello', tilt: 15, yaw: 8, thr: 0.8, elasticity: 0.6 },
    { id: 'soccer', name: '無人機足球 (護罩)', image: '', hasModel: true, modelStr: 'soccer', tilt: 20, yaw: 8, thr: 0.9, elasticity: 0.85 },
    { id: 'tbs_oblivion', name: 'TBS Oblivion', image: '', hasModel: true, modelStr: 'tbs_oblivion', tilt: 40, yaw: 8, thr: 1.0, elasticity: 0.35 },
    { id: 'iflight_nazgul', name: 'iFlight Nazgul5', image: '', hasModel: true, modelStr: 'iflight_nazgul', tilt: 55, yaw: 15, thr: 1.5, elasticity: 0.25 },
    { id: 'five33', name: 'Five33 Light Switch', image: '', hasModel: true, modelStr: 'five33', tilt: 60, yaw: 14, thr: 1.4, elasticity: 0.2 }
];

window.DroneConfigs = {
    'nazgul': { tpuColor: 0x00ff00, propColor: 0x00ff00, armWidth: 0.045 },
    'cetus': { class: 'whoop', scale: 0.4, isCetus: true, isPlastic: true, frameColor: 0xffffff, hasDucts: true, hasCanopy: true, hasActionCam: false, hasTopPlate: false, propBlades: 4 },
    'mobula': { class: 'whoop', scale: 0.3, isPlastic: true, frameColor: 0x111111, tpuColor: 0xff0000, hasDucts: true, hasCanopy: true, hasActionCam: false, hasTopPlate: false, propColor: 0xff0000 },
    'tiny hawk': { class: 'whoop', scale: 0.35, isPlastic: true, frameColor: 0xffffff, tpuColor: 0xff0000, armLayout: 'stretched', hasDucts: true, hasCanopy: true, hasActionCam: false, hasTopPlate: false, propBlades: 4 },
    'tinyhawk': { class: 'whoop', scale: 0.35, isPlastic: true, frameColor: 0xffffff, tpuColor: 0xff0000, armLayout: 'stretched', hasDucts: true, hasCanopy: true, hasActionCam: false, hasTopPlate: false, propBlades: 4 },
    'five33': { class: 'racing', scale: 0.9, armWidth: 0.015, tpuColor: 0x00ffff, propColor: 0x00ffff, hasSharkFin: true, hasActionCam: false, stackHeight: 0.04 },
    'switchback': { class: 'racing', scale: 0.9, armWidth: 0.015, tpuColor: 0x00ffff, propColor: 0x00ffff, hasSharkFin: true, hasActionCam: false, stackHeight: 0.04 },
    'spec 7': { class: 'racing', scale: 0.9, armWidth: 0.015, tpuColor: 0x00ffff, propColor: 0x00ffff, hasSharkFin: true, hasActionCam: false, stackHeight: 0.04 },
    'source one': { class: 'longrange', scale: 1.4, armLayout: 'deadcat', propBlades: 2, armWidth: 0.04, tpuColor: 0x222222 },
    'cannonball': { class: 'longrange', scale: 1.4, armLayout: 'deadcat', propBlades: 2, armWidth: 0.04, tpuColor: 0x222222 },
    '70': { class: 'longrange', scale: 1.4, armLayout: 'deadcat', propBlades: 2, armWidth: 0.04, tpuColor: 0x222222 },
    'armattan': { isArmattan: true, tpuColor: 0xff5500, hasTopPlate: false },
    'chameleon': { isArmattan: true, tpuColor: 0xff5500, hasTopPlate: false },
    'marmotte': { isArmattan: true, tpuColor: 0xff5500, hasTopPlate: false },
    'badger': { isArmattan: true, tpuColor: 0xff5500, hasTopPlate: false },
    'tbs': { isPlastic: true, frameColor: 0x333333, tpuColor: 0x222222, propColor: 0x111111 },
    'oblivion': { isPlastic: true, frameColor: 0x333333, tpuColor: 0x222222, propColor: 0x111111 },
    'hx115': { scale: 0.65, class: 'freestyle', frameColor: 0x222222, hasTopPlate: false, hasCanopy: true, hasActionCam: false, armWidth: 0.015, tpuColor: 0x111111, propColor: 0x00aaff },
    'tello': { scale: 0.4, isPlastic: true, frameColor: 0xffffff, hasActionCam: false, hasTopPlate: false, propBlades: 2 },
    'soccer': { isSoccer: true, scale: 1.0, isPlastic: true, frameColor: 0x111111, hasActionCam: false, hasTopPlate: false, tpuColor: 0x00aaff }
};
