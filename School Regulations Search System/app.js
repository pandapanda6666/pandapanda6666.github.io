import * as webllm from "https://esm.run/@mlc-ai/web-llm";

const modelId = "Phi-3-mini-4k-instruct-q4f16_1-MLC";
let engine;
let fileTree = {};
let currentSchoolFiles = [];
let schoolDataChunks = [];

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

document.getElementById('folder-input').addEventListener('change', async (e) => {
    const files = e.target.files;
    fileTree = {};
    
    for (let f of files) {
        if (f.name.toLowerCase().endsWith('.pdf')) {
            const pathParts = f.webkitRelativePath.split('/');
            if (pathParts.length >= 6) {
                const school = pathParts[pathParts.length - 2];
                const district = pathParts[pathParts.length - 3];
                const city = pathParts[pathParts.length - 4];
                const level = pathParts[pathParts.length - 5];
                const type = pathParts[pathParts.length - 6];
                
                if(!fileTree[type]) fileTree[type] = {};
                if(!fileTree[type][level]) fileTree[type][level] = {};
                if(!fileTree[type][level][city]) fileTree[type][level][city] = {};
                if(!fileTree[type][level][city][district]) fileTree[type][level][city][district] = {};
                if(!fileTree[type][level][city][district][school]) fileTree[type][level][city][district][school] = [];
                
                fileTree[type][level][city][district][school].push(f);
            }
        }
    }
    updateDropdowns();
});

const selType = document.getElementById('sel-type');
const selLevel = document.getElementById('sel-level');
const selCity = document.getElementById('sel-city');
const selDistrict = document.getElementById('sel-district');
const selSchool = document.getElementById('sel-school');

function updateDropdowns() {
    selType.innerHTML = '<option value="">選擇公私立</option>';
    Object.keys(fileTree).forEach(t => selType.innerHTML += `<option value="${t}">${t}</option>`);
    
    selType.onchange = () => {
        selLevel.innerHTML = '<option value="">選擇學制</option>';
        if(selType.value) Object.keys(fileTree[selType.value]).forEach(l => selLevel.innerHTML += `<option value="${l}">${l}</option>`);
        selLevel.onchange();
    };
    
    selLevel.onchange = () => {
        selCity.innerHTML = '<option value="">選擇縣市</option>';
        if(selType.value && selLevel.value) Object.keys(fileTree[selType.value][selLevel.value]).forEach(c => selCity.innerHTML += `<option value="${c}">${c}</option>`);
        selCity.onchange();
    };
    
    selCity.onchange = () => {
        selDistrict.innerHTML = '<option value="">選擇鄉鎮市區</option>';
        if(selType.value && selLevel.value && selCity.value) Object.keys(fileTree[selType.value][selLevel.value][selCity.value]).forEach(d => selDistrict.innerHTML += `<option value="${d}">${d}</option>`);
        selDistrict.onchange();
    };
    
    selDistrict.onchange = () => {
        selSchool.innerHTML = '<option value="">選擇學校</option>';
        if(selType.value && selLevel.value && selCity.value && selDistrict.value) Object.keys(fileTree[selType.value][selLevel.value][selCity.value][selDistrict.value]).forEach(s => selSchool.innerHTML += `<option value="${s}">${s}</option>`);
        selSchool.onchange();
    };
    
    selSchool.onchange = async () => {
        if(selSchool.value) {
            currentSchoolFiles = fileTree[selType.value][selLevel.value][selCity.value][selDistrict.value][selSchool.value];
            document.getElementById('chat-box').innerHTML = '<p class="text-primary">正在讀取校規 PDF 檔案內容...</p>';
            let fullText = "";
            for(let f of currentSchoolFiles) {
                fullText += await extractTextFromPDF(f) + "\n\n";
            }
            // Chunking
            schoolDataChunks = fullText.split(/\n\n|\n第/).map(c => c.trim()).filter(c => c.length > 20);
            document.getElementById('chat-box').innerHTML = '<p class="text-success">校規讀取完成，可以開始查詢囉！</p>';
            document.getElementById('query-input').disabled = false;
            document.getElementById('btn-search').disabled = false;
        } else {
            document.getElementById('query-input').disabled = true;
            document.getElementById('btn-search').disabled = true;
        }
    };
}

async function extractTextFromPDF(file) {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({data: arrayBuffer}).promise;
        let texts = [];
        for (let j = 1; j <= pdf.numPages; j++) {
            let page = await pdf.getPage(j);
            let textContent = await page.getTextContent();
            texts.push(textContent.items.map(s => s.str).join(' '));
        }
        return texts.join('\n');
    } catch(e) {
        console.error(e);
        return "";
    }
}

async function initModel() {
    document.getElementById('loading-overlay').style.display = 'block';
    const progressEl = document.getElementById('loading-progress');
    try {
        engine = new webllm.MLCEngine();
        engine.setInitProgressCallback((report) => {
            progressEl.innerText = report.text;
        });
        await engine.reload(modelId);
        document.getElementById('loading-overlay').style.display = 'none';
    } catch (e) {
        console.error(e);
        progressEl.innerText = "模型載入失敗: " + e.message;
    }
}

document.getElementById('btn-delete-model').addEventListener('click', async () => {
    if (confirm('確定要刪除已下載的模型快取嗎？')) {
        try {
            const cacheNames = await caches.keys();
            for (const name of cacheNames) {
                if (name.includes('webllm')) {
                    await caches.delete(name);
                }
            }
            alert('模型已刪除。下次查詢將會重新下載。');
            engine = null;
        } catch(e) {
            alert('刪除失敗: ' + e.message);
        }
    }
});

function searchRelevantChunks(query, topK = 3) {
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

function highlightText(text, query) {
    let highlighted = text;
    const words = query.split(/[ \u3000]+/); 
    words.forEach(w => {
        if(w.trim().length >= 2) { 
            const regex = new RegExp(`(${w.trim()})`, 'gi');
            highlighted = highlighted.replace(regex, '<span class="highlight">$1</span>');
        }
    });
    return highlighted;
}

document.getElementById('btn-search').addEventListener('click', async () => {
    const query = document.getElementById('query-input').value.trim();
    if (!query) return;
    
    if (!engine) {
        await initModel();
    }
    
    const chatBox = document.getElementById('chat-box');
    chatBox.innerHTML = '<p class="text-primary">檢索校規資料中...</p>';
    
    const relevantChunks = searchRelevantChunks(query, 4);
    const context = relevantChunks.join('\n---\n');
    
    chatBox.innerHTML = '<p class="text-primary">AI正在思考並生成回覆...</p>';
    
    const systemPrompt = `你是一個專業的校規查詢助理。請根據以下【校規資料】回答使用者的問題。如果資料中沒有提及，請直接回答「根據提供的校規資料，無法找到相關規定。」請使用繁體中文回答。\n\n【校規資料】\n${context}`;
    
    const messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: query }
    ];
    
    try {
        const reply = await engine.chat.completions.create({
            messages: messages,
            temperature: 0.1
        });
        
        let responseHtml = `<div><strong>AI 回覆：</strong><br>${reply.choices[0].message.content.replace(/\n/g, '<br>')}</div>`;
        
        responseHtml += `<hr><h5>來源資料：</h5>`;
        relevantChunks.forEach((chunk, index) => {
            const highlightedChunk = highlightText(chunk, query);
            responseHtml += `
                <div class="source-box" onclick="this.querySelector('.source-content').style.display = this.querySelector('.source-content').style.display === 'block' ? 'none' : 'block'">
                    📄 來源段落 ${index + 1} (點擊展開/收合)
                    <div class="source-content">${highlightedChunk.replace(/\n/g, '<br>')}</div>
                </div>
            `;
        });
        
        chatBox.innerHTML = responseHtml;
        
    } catch (e) {
        chatBox.innerHTML = `<p class="text-danger">發生錯誤: ${e.message}</p>`;
    }
});
