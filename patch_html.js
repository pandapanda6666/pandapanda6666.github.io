const fs = require('fs');
let html = fs.readFileSync('Edit/Video/Add subtitles/index.html', 'utf-8');

// Inject Desktop API check at the start of DOMContentLoaded
const domLoadRegex = /document\.addEventListener\('DOMContentLoaded', \(\) => \{/;
const desktopInit = document.addEventListener('DOMContentLoaded', async () => {
    window.isDesktop = false;
    try {
        let res = await fetch('/api/is_desktop');
        if (res.ok) {
            window.isDesktop = true;
            console.log("Desktop mode enabled!");
        }
    } catch(e) {}
;
html = html.replace(domLoadRegex, desktopInit);

// Replace Video Upload
const videoUploadRegex = /btnUploadVideo\.addEventListener\('click', \(\) => \{[\s\S]*?videoInput\.click\(\);\s*\}\);/;
const newVideoUpload = tnUploadVideo.addEventListener('click', async () => {
        if (window.isDesktop) {
            try {
                let res = await fetch('/api/select_video');
                let data = await res.json();
                if (data.path) {
                    mediaFile = { type: 'video', name: data.filename, file: null, url: '/media?path=' + encodeURIComponent(data.path), path: data.path, offset: 0, isMissing: false };
                    document.getElementById('videoNameDisplay').innerText = data.filename;
                    mainVideo.src = mediaFile.url;
                    mainVideo.classList.remove('hidden');
                    if (window.showToast) window.showToast("已載入影片");
                    initTimeline();
                    document.getElementById('initialHelp').classList.add('hidden');
                }
            } catch(e) { console.error(e); }
        } else {
            videoInput.click();
        }
    });;
html = html.replace(videoUploadRegex, newVideoUpload);

// Replace Audio Upload
const audioUploadRegex = /btnUploadAudio\.addEventListener\('click', \(\) => \{[\s\S]*?audioInput\.click\(\);\s*\}\);/;
const newAudioUpload = tnUploadAudio.addEventListener('click', async () => {
        if (window.isDesktop) {
            try {
                let res = await fetch('/api/select_audio');
                let data = await res.json();
                if (data.path) {
                    mediaFile = { type: 'audio', name: data.filename, file: null, url: '/media?path=' + encodeURIComponent(data.path), path: data.path, offset: 0, isMissing: false };
                    document.getElementById('videoNameDisplay').innerText = data.filename;
                    mainAudio.src = mediaFile.url;
                    document.getElementById('audioPlaceholder').classList.remove('hidden');
                    if (window.showToast) window.showToast("已載入音檔");
                    initTimeline();
                    document.getElementById('initialHelp').classList.add('hidden');
                }
            } catch(e) { console.error(e); }
        } else {
            audioInput.click();
        }
    });;
html = html.replace(audioUploadRegex, newAudioUpload);

// Replace Export Video
const exportVidRegex = /const scaleFilter = \scale=-2:\$\{resolution\}\;([\s\S]*?)const data = await ffmpeg\.readFile\('output\.mp4'\);/;
const newExportVid = const scaleFilter = \scale=-2:\\;
                
                if (window.isDesktop && mediaFile.path) {
                    // Python Backend Export
                    let res = await fetch('/api/export_video', {
                        method: 'POST',
                        body: JSON.stringify({ video_path: mediaFile.path, ass_content: assContent, resolution: resolution, crf: 28 })
                    });
                    let data = await res.json();
                    let taskId = data.task_id;
                    
                    // Poll progress
                    while (true) {
                        await new Promise(r => setTimeout(r, 1000));
                        let statRes = await fetch('/api/export_status?task_id=' + taskId);
                        let stat = await statRes.json();
                        if (stat.status === 'error') throw new Error(stat.error);
                        if (stat.status === 'done') {
                            if(window.showToast) window.showToast("影片匯出成功！(已儲存至原影片同目錄)");
                            hideLoading();
                            return; // Done!
                        }
                        // Update UI
                        if (window.updateLoadingProgress && stat.progress) {
                            let prog = stat.progress; 
                            let percent = prog * 100;
                            let elapsed = (Date.now() - window.ffmpegExportStartTime) / 1000;
                            let eta = -1;
                            if (prog > 0 && elapsed > 5) {
                                eta = (1/ (prog / elapsed)) - elapsed;
                            }
                            window.updateLoadingProgress(percent, eta, stat.size, prog);
                        }
                    }
                } else {
                    // WASM Export (Fallback for Web)
                    await ffmpeg.exec(['-i', vidName, '-vf', \\,ass=subs.ass\, '-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '28', '-c:a', 'copy', 'output.mp4']);
                    const data = await ffmpeg.readFile('output.mp4');
;
html = html.replace(exportVidRegex, newExportVid);

// Replace the fallback WASM export bracket closure
const exportCatchRegex = /const a = document\.createElement\('a'\);\s*a\.href = url;\s*a\.download = \exported_\$\{resolution\}p\.mp4\;\s*a\.click\(\);\s*if\(window\.showToast\) window\.showToast\("影片匯出成功！"\); \s*hideLoading\(\);\s*\} catch \(err\)/;
const newExportCatch = const a = document.createElement('a');
                a.href = url;
                a.download = \exported_\p.mp4\;
                a.click();
                if(window.showToast) window.showToast("影片匯出成功！"); 
                hideLoading();
                } // End of WASM else block
            } catch (err);
html = html.replace(exportCatchRegex, newExportCatch);

// Replace file downloading to use desktop save API (for SRT and JSON)
// We inject a global helper for saving files
const saveHelper = 
        window.saveFileToDisk = async function(filename, content, type = 'text') {
            if (window.isDesktop) {
                try {
                    await fetch('/api/save_file', {
                        method: 'POST',
                        body: JSON.stringify({ filename: filename, content: type === 'text' ? content : btoa(String.fromCharCode.apply(null, new Uint8Array(content))), type: type })
                    });
                    if(window.showToast) window.showToast("檔案已儲存");
                    return true;
                } catch(e) { console.error(e); return false; }
            }
            return false;
        };
;
html = html.replace(/window\.formatSrtTime = /, saveHelper + '\n        window.formatSrtTime = ');

// Inject it into exportDraftBtn
const draftExpRegex = /const a = document\.createElement\('a'\);\s*a\.href = URL\.createObjectURL\(blob\);\s*a\.download = \\$\{title\}\.json\;\s*a\.click\(\);/;
const newDraftExp = if (await window.saveFileToDisk(\\.json\, JSON.stringify(exportData, null, 2))) { return; }
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = \\.json\;
            a.click();;
html = html.replace(draftExpRegex, newDraftExp);

// Inject into SRT download
const srtExpRegex = /a\.href = url;\s*a\.download = \\$\{title\}\$\{suffix\}\.srt\;\s*a\.click\(\);\s*URL\.revokeObjectURL\(url\);/;
const newSrtExp = if (await window.saveFileToDisk(\\\.srt\, content)) { return; }
                  a.href = url;
                  a.download = \\\.srt\;
                  a.click();
                  URL.revokeObjectURL(url);;
html = html.replace(srtExpRegex, newSrtExp);

fs.writeFileSync('Edit/Video/Add subtitles/index.html', html, 'utf-8');
console.log("Success");