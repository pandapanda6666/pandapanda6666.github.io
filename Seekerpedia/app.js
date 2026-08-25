// 假設伺服器的 API 位置在相同的 origin，如果使用 cloudflared 會自動映射
const API_BASE = ""; 

let db = { works: [] };

async function loadData() {
    try {
        const res = await fetch(`${API_BASE}/api/seekerpedia/get`);
        if (res.ok) {
            const data = await res.json();
            if(data && data.works) db = data;
        }
    } catch (e) { console.error("Load failed", e); }
    renderEditSelect();
    renderBrowseList();
}

async function saveData() {
    try {
        const res = await fetch(`${API_BASE}/api/seekerpedia/save`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(db)
        });
        if(res.ok) alert('儲存成功！');
        else alert('儲存失敗！');
    } catch (e) { alert('儲存失敗！'); console.error(e); }
}

// Navigation
const pages = ['home', 'about', 'create', 'edit', 'browse'];
function showPage(id) {
    pages.forEach(p => document.getElementById(`page-${p}`).classList.add('hidden'));
    document.getElementById(`page-${id}`).classList.remove('hidden');
}

document.getElementById('aboutBtn').onclick = () => showPage('about');
document.querySelector('.logo').onclick = () => showPage('home');

document.getElementById('browseModeBtn').onclick = (e) => {
    e.target.classList.add('active');
    document.getElementById('createModeBtn').classList.remove('active');
    showPage('browse');
    loadData();
};
document.getElementById('createModeBtn').onclick = (e) => {
    e.target.classList.add('active');
    document.getElementById('browseModeBtn').classList.remove('active');
    showPage('create');
};

// Create Work
document.getElementById('createForm').onsubmit = async (e) => {
    e.preventDefault();
    const wName = document.getElementById('workName').value;
    db.works.push({
        id: Date.now(),
        name: wName,
        intro: document.getElementById('workIntro').value,
        category: document.getElementById('workCategory').value,
        settings: document.getElementById('workSettings').value,
        entries: []
    });
    await saveData();
    document.getElementById('createForm').reset();
    showPage('edit');
    renderEditSelect();
};

// Edit Work
function renderEditSelect() {
    const sel = document.getElementById('editWorkSelect');
    sel.innerHTML = '<option value="">選擇要編輯的作品</option>';
    db.works.forEach(w => sel.innerHTML += `<option value="${w.id}">${w.name}</option>`);
}

document.getElementById('editWorkSelect').onchange = (e) => {
    const val = e.target.value;
    const panel = document.getElementById('editWorkPanel');
    if (!val) { panel.classList.add('hidden'); return; }
    panel.classList.remove('hidden');
    renderEditEntries(val);
};

document.getElementById('addEntryBtn').onclick = async () => {
    const workId = document.getElementById('editWorkSelect').value;
    const work = db.works.find(w => w.id == workId);
    if (!work) return;
    
    work.entries.push({
        id: Date.now(),
        category: document.getElementById('entryCategory').value || '未分類',
        title: document.getElementById('entryTitle').value || '未命名',
        content: document.getElementById('entryContent').value || ''
    });
    await saveData();
    
    // Clear inputs
    document.getElementById('entryCategory').value = '';
    document.getElementById('entryTitle').value = '';
    document.getElementById('entryContent').value = '';
    
    renderEditEntries(workId);
};

function renderEditEntries(workId) {
    const work = db.works.find(w => w.id == workId);
    const list = document.getElementById('editEntryList');
    if(work.entries.length === 0) {
        list.innerHTML = '<p style="color:#777;">目前無任何條目。</p>';
        return;
    }
    list.innerHTML = work.entries.map(e => `
        <div style="border:1px solid #ddd; padding:15px; margin-top:10px; border-radius:5px; background:#fff;">
            <div style="color: #666; font-size:0.9em; margin-bottom:5px;">[分類: ${e.category}]</div>
            <h4 style="margin:0 0 10px 0; color:#333;">${e.title}</h4>
            <p style="margin:0; white-space:pre-wrap; color:#555;">${e.content}</p>
        </div>
    `).join('');
}

// Browse Mode
function renderBrowseList() {
    const ul = document.getElementById('browseWorkList');
    if(db.works.length === 0) {
        ul.innerHTML = '<li style="background:transparent;">目前無百科作品</li>';
        return;
    }
    ul.innerHTML = db.works.map(w => `<li onclick="showWork(${w.id})">${w.name}</li>`).join('');
}

function showWork(workId) {
    const work = db.works.find(w => w.id == workId);
    document.getElementById('browseWorkDetail').classList.remove('hidden');
    document.getElementById('bEntryDetail').classList.add('hidden');
    document.getElementById('bTitle').innerText = work.name;
    document.getElementById('bIntro').innerText = work.intro;
    document.getElementById('bMeta').innerText = `分類: ${work.category} | 世界觀設定: ${work.settings}`;
    
    const cats = {};
    work.entries.forEach(e => {
        if (!cats[e.category]) cats[e.category] = [];
        cats[e.category].push(e);
    });
    
    const catList = document.getElementById('bCategoryList');
    catList.innerHTML = '';
    
    if(Object.keys(cats).length === 0) {
        catList.innerHTML = '<li>尚無條目</li>';
        return;
    }
    
    Object.keys(cats).forEach(c => {
        const li = document.createElement('li');
        li.innerText = c;
        li.onclick = () => renderBrowseEntries(workId, c);
        catList.appendChild(li);
    });
}

function renderBrowseEntries(workId, category) {
    const work = db.works.find(w => w.id == workId);
    const entries = work.entries.filter(e => e.category === category);
    
    const catList = document.getElementById('bCategoryList');
    catList.innerHTML = entries.map(e => `<li onclick="showEntry(${e.id}, ${workId})">${e.title}</li>`).join('');
    
    const backLi = document.createElement('li');
    backLi.innerText = '← 返回作品首頁';
    backLi.style.background = '#4a6c42';
    backLi.style.color = 'white';
    backLi.onclick = () => showWork(workId);
    catList.prepend(backLi);
}

function showEntry(entryId, workId) {
    const work = db.works.find(w => w.id == workId);
    const entry = work.entries.find(e => e.id == entryId);
    document.getElementById('bEntryDetail').classList.remove('hidden');
    document.getElementById('bEntryTitle').innerText = entry.title;
    document.getElementById('bEntryContent').innerText = entry.content;
}

// Init
window.onload = loadData;
