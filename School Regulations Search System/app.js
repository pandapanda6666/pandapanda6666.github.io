import * as webllm from "https://esm.run/@mlc-ai/web-llm";

const modelId = "Phi-3-mini-4k-instruct-q4f16_1-MLC";
let engine;
let fileTree = {};
let schoolDataChunks = [];
let fullSchoolText = "";
let currentPdfUrl = "";

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

const selType = document.getElementById('sel-type');
const selLevel = document.getElementById('sel-level');
const selCity = document.getElementById('sel-city');
const selDistrict = document.getElementById('sel-district');
const selSchool = document.getElementById('sel-school');
const btnViewPdf = document.getElementById('btn-view-pdf');

// Fetch file tree directly from GitHub API
async function loadGitHubTree() {
    try {
        const repoUrl = 'https://api.github.com/repos/pandapanda6666/pandapanda6666.github.io/git/trees/main?recursive=1';
        const res = await fetch(repoUrl);
        const data = await res.json();
        
        fileTree = {};
        
        const prefix = 'School Regulations Search System/校規/';
        for (let item of data.tree) {
            if (item.type === 'blob' && item.path.startsWith(prefix) && item.path.toLowerCase().endsWith('.pdf')) {
                // Ignore backup folders
                if(item.path.includes('【備份】')) continue;
                
                const relativePath = item.path.substring(prefix.length);
                const parts = relativePath.split('/');
                
                if (parts.length >= 6) {
                    const type_name = parts[0];
                    const level = parts[1];
                    const city = parts[2];
                    const district = parts[3];
                    const school = parts[4];
                    
                    if (!fileTree[type_name]) fileTree[type_name] = {};
                    if (!fileTree[type_name][level]) fileTree[type_name][level] = {};
                    if (!fileTree[type_name][level][city]) fileTree[type_name][level][city] = {};
                    if (!fileTree[type_name][level][city][district]) fileTree[type_name][level][city][district] = {};
                    if (!fileTree[type_name][level][city][district][school]) fileTree[type_name][level][city][district][school] = [];
                    
                    fileTree[type_name][level][city][district][school].push(item.path);
                }
            }
        }
        
        selType.disabled = false;
        selLevel.disabled = false;
        selCity.disabled = false;
        selDistrict.disabled = false;
        selSchool.disabled = false;
        
        updateDropdowns();
    } catch(e) {
        console.error("Failed to load GitHub tree", e);
        document.getElementById('chat-box').innerHTML = '<p class="text-danger">無法載入 GitHub 目錄結構，請確認網路連線或 API 限制。</p>';
    }
}

let savedSelection = {
    type: localStorage.getItem('selType'),
    level: localStorage.getItem('selLevel'),
    city: localStorage.getItem('selCity'),
    district: localStorage.getItem('selDistrict'),
    school: localStorage.getItem('selSchool')
};

function updateDropdowns() {
    selType.innerHTML = '<option value="">選擇公私立</option>';
    Object.keys(fileTree).forEach(t => selType.innerHTML += `<option value="${t}">${t}</option>`);
    
    if (savedSelection.type && fileTree[savedSelection.type]) {
        selType.value = savedSelection.type;
    }
    
    selType.onchange = (e) => {
        if (e && e.isTrusted) savedSelection = {}; 
        localStorage.setItem('selType', selType.value);
        
        selLevel.innerHTML = '<option value="">選擇學制</option>';
        if(selType.value) Object.keys(fileTree[selType.value]).forEach(l => selLevel.innerHTML += `<option value="${l}">${l}</option>`);
        
        if (savedSelection.level && selType.value === savedSelection.type && fileTree[selType.value][savedSelection.level]) {
            selLevel.value = savedSelection.level;
        }
        selLevel.onchange(e);
    };
    
    selLevel.onchange = (e) => {
        if (e && e.isTrusted) savedSelection = {}; 
        localStorage.setItem('selLevel', selLevel.value);
        
        selCity.innerHTML = '<option value="">選擇縣市</option>';
        if(selType.value && selLevel.value) Object.keys(fileTree[selType.value][selLevel.value]).forEach(c => selCity.innerHTML += `<option value="${c}">${c}</option>`);
        
        if (savedSelection.city && fileTree[selType.value] && fileTree[selType.value][selLevel.value] && fileTree[selType.value][selLevel.value][savedSelection.city]) {
            selCity.value = savedSelection.city;
        }
        selCity.onchange(e);
    };
    
    selCity.onchange = (e) => {
        if (e && e.isTrusted) savedSelection = {};
        localStorage.setItem('selCity', selCity.value);
        
        selDistrict.innerHTML = '<option value="">選擇鄉鎮市區</option>';
        if(selType.value && selLevel.value && selCity.value) Object.keys(fileTree[selType.value][selLevel.value][selCity.value]).forEach(d => selDistrict.innerHTML += `<option value="${d}">${d}</option>`);
        
        if (savedSelection.district && fileTree[selType.value] && fileTree[selType.value][selLevel.value] && fileTree[selType.value][selLevel.value][selCity.value] && fileTree[selType.value][selLevel.value][selCity.value][savedSelection.district]) {
            selDistrict.value = savedSelection.district;
        }
        selDistrict.onchange(e);
    };
    
    selDistrict.onchange = (e) => {
        if (e && e.isTrusted) savedSelection = {};
        localStorage.setItem('selDistrict', selDistrict.value);
        
        selSchool.innerHTML = '<option value="">選擇學校</option>';
        if(selType.value && selLevel.value && selCity.value && selDistrict.value) Object.keys(fileTree[selType.value][selLevel.value][selCity.value][selDistrict.value]).forEach(s => selSchool.innerHTML += `<option value="${s}">${s}</option>`);
        
        if (savedSelection.school && fileTree[selType.value] && fileTree[selType.value][selLevel.value] && fileTree[selType.value][selLevel.value][selCity.value] && fileTree[selType.value][selLevel.value][selCity.value][selDistrict.value] && fileTree[selType.value][selLevel.value][selCity.value][selDistrict.value][savedSelection.school]) {
            selSchool.value = savedSelection.school;
        }
        selSchool.onchange(e);
    };
    
    selSchool.onchange = async (e) => {
        if (e && e.isTrusted) savedSelection = {};
        localStorage.setItem('selSchool', selSchool.value);
        if(selSchool.value) {
            let pdfPaths = fileTree[selType.value][selLevel.value][selCity.value][selDistrict.value][selSchool.value];
            
            // Check for all.pdf prioritization
            const allPdf = pdfPaths.find(p => p.toLowerCase().endsWith('all.pdf'));
            if(allPdf) {
                pdfPaths = [allPdf]; // Only read all.pdf if it exists
            }
            
            // For viewing manually
            currentPdfUrl = 'https://pandapanda6666.github.io/' + pdfPaths[0].split('/').map(encodeURIComponent).join('/');
            btnViewPdf.disabled = false;
            
            document.getElementById('chat-box').innerHTML = '<div class="text-center text-primary mt-4"><div class="spinner-border mb-3"></div><p>正在下載並解析校規 PDF 檔案內容...</p></div>';
            
            fullSchoolText = "";
            for(let path of pdfPaths) {
                const url = 'https://pandapanda6666.github.io/' + path.split('/').map(encodeURIComponent).join('/');
                fullSchoolText += await extractTextFromPDFUrl(url) + "\n\n";
            }
            
            // Chunking
            schoolDataChunks = [];
            const chunkSize = 500;
            const overlap = 50;
            let currentIdx = 0;
            while(currentIdx < fullSchoolText.length) {
                let chunk = fullSchoolText.slice(currentIdx, currentIdx + chunkSize);
                if (chunk.trim().length > 20) {
                    schoolDataChunks.push(chunk.trim());
                }
                currentIdx += (chunkSize - overlap);
            }

            document.getElementById('chat-box').innerHTML = '<div class="text-center text-success mt-4"><i class="fas fa-check-circle fa-3x mb-3"></i><p>校規讀取完成，請在上方輸入問題開始查詢！</p></div>';
            document.getElementById('query-input').disabled = false;
            document.getElementById('btn-search').disabled = false;
        } else {
            document.getElementById('query-input').disabled = true;
            document.getElementById('btn-search').disabled = true;
            btnViewPdf.disabled = true;
        }
    };
    
    // Trigger the initial cascade if we have a saved type
    if (selType.value) {
        selType.onchange();
    }
}

btnViewPdf.addEventListener('click', () => {
    if(currentPdfUrl) {
        window.open(currentPdfUrl, '_blank');
    }
});

async function extractTextFromPDFUrl(url) {
    try {
        const res = await fetch(url);
        const arrayBuffer = await res.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({data: arrayBuffer}).promise;
        let texts = [];
        for (let j = 1; j <= pdf.numPages; j++) {
            let page = await pdf.getPage(j);
            let textContent = await page.getTextContent();
            texts.push(textContent.items.map(s => s.str).join(' '));
        }
        return texts.join('\n');
    } catch(e) {
        console.error("Error reading PDF", e);
        return "";
    }
}

async function initModel() {
    document.getElementById('loading-overlay').style.display = 'block';
    const progressEl = document.getElementById('loading-progress');
    const pBar = document.getElementById('progress-bar');
    const pSize = document.getElementById('progress-size');
    const pTime = document.getElementById('progress-time');
    
    try {
        engine = new webllm.MLCEngine();
        engine.setInitProgressCallback((report) => {
            progressEl.innerText = report.text;
            
            const percent = Math.round(report.progress * 100);
            pBar.style.width = percent + '%';
            pBar.innerText = percent + '%';
            
            let timeElapsed = report.timeElapsed;
            if (report.progress > 0 && report.progress < 1) {
                const totalTime = timeElapsed / report.progress;
                const remainTime = totalTime - timeElapsed;
                pTime.innerHTML = `<i class="fas fa-clock"></i> 剩餘: ${Math.round(remainTime)}s / 總: ${Math.round(totalTime)}s`;
            } else if (report.progress >= 1) {
                pTime.innerHTML = `<i class="fas fa-check"></i> 完成`;
            }
            
            let match = report.text.match(/(\d+(?:\.\d+)?[KMGB]+)\s*\/\s*(\d+(?:\.\d+)?[KMGB]+)/i);
            if(match) {
                pSize.innerHTML = `<i class="fas fa-download"></i> 大小: ${match[1]} / ${match[2]}`;
            }
        });
        await engine.reload(modelId);
        document.getElementById('loading-overlay').style.display = 'none';
    } catch (e) {
        console.error(e);
        progressEl.innerText = "模型載入失敗: " + e.message;
        pBar.classList.replace('progress-bar-animated', 'bg-danger');
    }
}

document.getElementById('btn-delete-model').addEventListener('click', async () => {
    if (confirm('確定要刪除已下載的模型快取嗎？')) {
        try {
            const cacheNames = await caches.keys();
            let deleted = false;
            for (const name of cacheNames) {
                if (name.includes('webllm') || name.includes('tvm')) {
                    await caches.delete(name);
                    deleted = true;
                }
            }
            if(deleted) {
                alert('模型已成功刪除。下次查詢將會重新下載。');
                engine = null;
            } else {
                alert('沒有找到模型快取，可能是尚未下載。');
            }
        } catch(e) {
            alert('刪除失敗: ' + e.message);
        }
    }
});

function searchRelevantChunks(query, topK = 10) {
    let scoredChunks = schoolDataChunks.map(chunk => {
        let score = 0;
        const keywords = query.split('');
        keywords.forEach(kw => {
            if (kw.trim() && chunk.includes(kw)) score++;
        });
        const words = query.split(' ');
        words.forEach(w => {
            if (w.trim() && chunk.includes(w)) score += 5;
        });
        return { chunk, score };
    });
    scoredChunks.sort((a, b) => b.score - a.score);
    return scoredChunks.slice(0, topK).map(sc => sc.chunk);
}

function highlightFullText(usedChunks) {
    let highlightedText = fullSchoolText.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    
    // Sort chunks by length descending so longer chunks are highlighted first
    usedChunks.sort((a, b) => b.length - a.length);
    
    for(let chunk of usedChunks) {
        // Escape special regex chars
        const safeChunk = chunk.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(${safeChunk})`, 'g');
        highlightedText = highlightedText.replace(regex, '<mark class="highlight">$1</mark>');
    }
    
    return highlightedText;
}

document.getElementById('btn-search').addEventListener('click', async () => {
    const query = document.getElementById('query-input').value.trim();
    if (!query) return;
    
    if (!engine) {
        await initModel();
    }
    
    const chatBox = document.getElementById('chat-box');
    chatBox.innerHTML = '<div class="text-center text-primary mt-4"><div class="spinner-border mb-3"></div><p>檢索校規資料中...</p></div>';
    
    let relevantChunks = searchRelevantChunks(query, 10);
    
    let context = "";
    let usedChunks = [];
    const MAX_CONTEXT_LENGTH = 1500;
    for(let chunk of relevantChunks) {
        if(context.length + chunk.length > MAX_CONTEXT_LENGTH) {
            break;
        }
        context += chunk + '\n---\n';
        usedChunks.push(chunk);
    }
    
    const isCasual = document.getElementById('tone-casual').checked;
    const toneInstruction = isCasual 
        ? "請用非常白話、輕鬆且生活化的口吻回答，如果原文中有像是『不啃不消』這種太抽象的詞，請一定要轉換成現代人(或國高中生)也能輕鬆看懂的白話文。" 
        : "請使用正式、嚴謹的口吻與專業的詞彙回答。";

    const systemPrompt = `你是一個專業的校規查詢助理。請根據以下【校規資料】回答使用者的問題。如果資料中沒有提及，請直接回答「根據提供的校規資料，無法找到相關規定。」${toneInstruction}請一律使用繁體中文回答。\n\n【校規資料】\n${context}`;
    
    chatBox.innerHTML = '<div class="text-center text-primary mt-4"><div class="spinner-grow mb-3"></div><p>AI正在思考並生成回覆...</p></div>';
    
    const messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: query }
    ];
    
    try {
        const reply = await engine.chat.completions.create({
            messages: messages,
            temperature: 0.1,
            repetition_penalty: 1.1,
            frequency_penalty: 0.5
        });
        
        let responseHtml = `<div class="mb-3"><strong><i class="fas fa-robot text-primary"></i> AI 回覆：</strong><br><div class="p-3 bg-white rounded border mt-2">${reply.choices[0].message.content.replace(/\n/g, '<br>')}</div></div>`;
        
        const highlightedFullDoc = highlightFullText(usedChunks);
        
        responseHtml += `<hr><h5 class="text-secondary"><i class="fas fa-highlighter"></i> 完整參考來源 (黃色高光為 AI 使用到的段落)：</h5>`;
        responseHtml += `
            <div class="source-box" onclick="const content = this.querySelector('.source-content'); content.style.display = content.style.display === 'block' ? 'none' : 'block'">
                <i class="fas fa-book"></i> 點擊此處展開 / 收合整份校規文件
                <div class="source-content" onclick="event.stopPropagation();">${highlightedFullDoc}</div>
            </div>
        `;
        
        chatBox.innerHTML = responseHtml;
        
    } catch (e) {
        chatBox.innerHTML = `<div class="alert alert-danger"><i class="fas fa-exclamation-triangle"></i> 發生錯誤: ${e.message}</div>`;
    }
});

// Load the file index dynamically
loadGitHubTree();
