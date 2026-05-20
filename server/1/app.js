import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  getRedirectResult,
  signInWithPopup,
  signInWithRedirect,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyD4ucouGkSQ4zoYsr60ozsPnyhW9ZUGVMs",
  authDomain: "iian66-website.firebaseapp.com",
  projectId: "iian66-website",
  storageBucket: "iian66-website.firebasestorage.app",
  messagingSenderId: "207841656207",
  appId: "1:207841656207:web:673a48aa548320d94b5ffa",
  measurementId: "G-DKF7FVCG8T"
};

const ADMIN_EMAIL = "ianother6993@gmail.com";
const ADMIN_PASSWORD = "admin6993";
const USERS_KEY = "panda_arcade_users";
const SESSION_KEY = "panda_arcade_session";
const GOOGLE_INTENT_KEY = "panda_arcade_google_intent";

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const googleProvider = new GoogleAuthProvider();

const $ = (selector) => document.querySelector(selector);
const authView = $("#authView");
const appView = $("#appView");
const authTitle = $("#authTitle");
const authSubtitle = $("#authSubtitle");
const loginPanel = $("#loginPanel");
const registerPanel = $("#registerPanel");
const loginForm = $("#loginForm");
const registerForm = $("#registerForm");
const loginError = $("#loginError");
const registerError = $("#registerError");
const googleLogin = $("#googleLogin");
const showRegister = $("#showRegister");
const backToLogin = $("#backToLogin");
const normalTab = $("#normalTab");
const googleTab = $("#googleTab");
const googleRegisterBox = $("#googleRegisterBox");
const normalRegisterFields = $("#normalRegisterFields");
const linkGoogle = $("#linkGoogle");
const linkedGoogle = $("#linkedGoogle");
const linkedGoogleEmail = $("#linkedGoogleEmail");
const clearGoogleLink = $("#clearGoogleLink");
const avatarButton = $("#avatarButton");
const avatarInput = $("#avatarInput");
const avatarPreview = $("#avatarPreview");
const currentUser = $("#currentUser");
const gameNav = $("#gameNav");
const gameTitle = $("#gameTitle");
const gamePanel = $("#gamePanel");
const resetGame = $("#resetGame");
const logoutBtn = $("#logoutBtn");
const gameCountLabel = document.querySelector(".stage-header .eyebrow");

let registerMode = "normal";
let pendingGoogleUser = null;
let avatarData = "";
let activeGame = "ttt";
let cleanup = () => {};
let currentSessionUser = null;
let adminUsersButton = null;
let arcadePaused = false;
let pauseButton = null;
let themePanel = null;

const defaultAvatar = "data:image/svg+xml;utf8," + encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <rect width="120" height="120" rx="60" fill="#dbe4ef"/>
  <circle cx="60" cy="43" r="15" fill="#f8fafc"/>
  <path d="M28 94c6-19 58-19 64 0a47 47 0 0 1-64 0z" fill="#f8fafc"/>
  <circle cx="60" cy="60" r="50" fill="none" stroke="#f8fafc" stroke-width="8"/>
</svg>`);

const games = [
  { id: "ttt", title: "圈圈叉叉", render: ticTacToe },
  { id: "memory", title: "記憶翻牌", render: memoryGame },
  { id: "snake", title: "貪食蛇", render: snakeGame },
  { id: "pong", title: "彈球擋板", render: pongGame },
  { id: "mole", title: "打地鼠", render: whackMole },
  { id: "rps", title: "剪刀石頭布", render: rpsGame },
  { id: "guess", title: "猜數字", render: guessGame },
  { id: "reaction", title: "反應速度", render: reactionGame },
  { id: "simon", title: "記憶節奏", render: simonGame },
  { id: "twenty", title: "2048", render: game2048 },
  { id: "shooter", title: "槍戰訓練", render: shootingRangeGame },
  { id: "space", title: "太空射擊", render: spaceShooterGame },
  { id: "dodge", title: "閃避彈幕", render: dodgeGame },
  { id: "clicker", title: "狂點挑戰", render: clickerGame },
  { id: "math", title: "算術快打", render: mathRushGame },
  { id: "color", title: "顏色反應", render: colorMatchGame },
  { id: "type", title: "打字衝刺", render: typingSprintGame },
  { id: "maze", title: "迷宮逃脫", render: mazeEscapeGame },
  { id: "slots", title: "幸運拉霸", render: slotMachineGame },
  { id: "sequence", title: "數字記憶", render: numberSequenceGame },
  { id: "online", title: "連線對戰", render: onlineBattleGame }
];

function readUsers() {
  const saved = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
  const hasAdmin = saved.some((user) => user.email === ADMIN_EMAIL || user.account === ADMIN_EMAIL);
  if (!hasAdmin) {
    saved.push({
      account: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email: ADMIN_EMAIL,
      nickname: "管理員",
      googleEmail: ADMIN_EMAIL,
      avatar: defaultAvatar
    });
    localStorage.setItem(USERS_KEY, JSON.stringify(saved));
  }
  return saved;
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function highScoreKey(gameId) {
  return `iian666_high_score_${gameId}`;
}

function getHighScore(gameId) {
  return Number(localStorage.getItem(highScoreKey(gameId)) || 0);
}

function setHighScore(gameId, value) {
  const score = Math.max(0, Math.floor(Number(value) || 0));
  const current = getHighScore(gameId);
  if (score > current) {
    localStorage.setItem(highScoreKey(gameId), String(score));
    return score;
  }
  return current;
}

function updateHighScore(gameId, value, node) {
  const best = setHighScore(gameId, value);
  if (node) node.textContent = best;
  return best;
}

function setMessage(node, text, type = "error") {
  node.textContent = text;
  node.className = `message ${type}`;
}

function googleErrorText(error) {
  if (error.code === "auth/unauthorized-domain") {
    return "Google 登入失敗：目前網址尚未加入 Firebase 授權網域，請到 Firebase Console > Authentication > Settings > Authorized domains 加入這個網域。";
  }
  return error.message;
}

function showAuth(mode) {
  cleanup();
  currentSessionUser = null;
  authView.classList.remove("hidden");
  appView.classList.add("hidden");
  loginError.textContent = "";
  registerError.textContent = "";
  if (mode === "register") {
    loginPanel.classList.add("hidden");
    registerPanel.classList.remove("hidden");
    authTitle.textContent = "註冊新帳號";
    authSubtitle.textContent = "填寫下方資料以建立您的帳號";
    $(".auth-header").classList.add("register");
  } else {
    registerPanel.classList.add("hidden");
    loginPanel.classList.remove("hidden");
    authTitle.textContent = "登入系統";
    authSubtitle.textContent = "輸入帳號密碼以進入";
    $(".auth-header").classList.remove("register");
  }
}

function showApp(user) {
  currentSessionUser = user;
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
  currentUser.textContent = user.email || user.googleEmail || user.account;
  authView.classList.add("hidden");
  appView.classList.remove("hidden");
  if (gameCountLabel) gameCountLabel.textContent = `${games.length} 個小遊戲`;
  ensurePauseControl();
  ensureThemeControls();
  ensureAdminControls();
  renderGame(activeGame);
}

function setRegisterMode(mode) {
  registerMode = mode;
  const google = mode === "google";
  normalTab.classList.toggle("active", !google);
  googleTab.classList.toggle("active", google);
  normalRegisterFields.classList.toggle("hidden", google);
  googleRegisterBox.classList.toggle("hidden", !google);
  googleTab.style.color = google ? "var(--indigo)" : "";
}

async function googlePopup() {
  const result = await signInWithPopup(auth, googleProvider);
  return normalizeGoogleUser(result);
}

function normalizeGoogleUser(result) {
  return {
    email: result.user.email,
    nickname: result.user.displayName || result.user.email.split("@")[0],
    avatar: result.user.photoURL || defaultAvatar
  };
}

async function beginGoogleAuth(intent) {
  sessionStorage.setItem(GOOGLE_INTENT_KEY, intent);
  try {
    return await googlePopup();
  } catch (error) {
    if (error.code === "auth/popup-blocked" || error.code === "auth/popup-closed-by-user") {
      await signInWithRedirect(auth, googleProvider);
      return null;
    }
    sessionStorage.removeItem(GOOGLE_INTENT_KEY);
    throw error;
  }
}

function prepareGoogleRegistration(googleUser) {
  showAuth("register");
  setRegisterMode("google");
  pendingGoogleUser = googleUser;
  linkedGoogleEmail.textContent = googleUser.email;
  linkGoogle.classList.add("hidden");
  linkedGoogle.classList.remove("hidden");
  $("#regEmail").value = googleUser.email;
  $("#regNickname").value = googleUser.nickname;
  avatarPreview.src = googleUser.avatar;
  avatarData = googleUser.avatar;
}

function handleGoogleUser(googleUser) {
  const user = readUsers().find((item) =>
    (item.googleEmail || "").toLowerCase() === googleUser.email.toLowerCase() ||
    (item.email || "").toLowerCase() === googleUser.email.toLowerCase()
  );
  if (!user) {
    setMessage(loginError, "此 Google 帳號尚未註冊，請先進行 Google 註冊。");
    prepareGoogleRegistration(googleUser);
    return;
  }
  loginWithUser({ ...user, avatar: user.avatar || googleUser.avatar });
}

function loginWithUser(user) {
  showApp({
    account: user.account || user.email || user.googleEmail,
    email: user.email || user.googleEmail,
    nickname: user.nickname,
    avatar: user.avatar || defaultAvatar
  });
}

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const account = $("#loginAccount").value.trim().toLowerCase();
  const password = $("#loginPassword").value;
  const user = readUsers().find((item) =>
    (item.account || "").toLowerCase() === account ||
    (item.email || "").toLowerCase() === account
  );
  if (!user || user.password !== password) {
    setMessage(loginError, "帳號或密碼不正確，請重新輸入。");
    return;
  }
  loginWithUser(user);
});

googleLogin.addEventListener("click", async () => {
  try {
    setMessage(loginError, "正在開啟 Google 驗證...", "success");
    const googleUser = await beginGoogleAuth("login");
    if (googleUser) handleGoogleUser(googleUser);
  } catch (error) {
    setMessage(loginError, "Google 登入失敗：" + googleErrorText(error));
  }
});

showRegister.addEventListener("click", () => showAuth("register"));
backToLogin.addEventListener("click", () => showAuth("login"));
normalTab.addEventListener("click", () => setRegisterMode("normal"));
googleTab.addEventListener("click", () => setRegisterMode("google"));
avatarButton.addEventListener("click", () => avatarInput.click());

avatarInput.addEventListener("change", () => {
  const file = avatarInput.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    avatarData = reader.result;
    avatarPreview.src = avatarData;
  };
  reader.readAsDataURL(file);
});

linkGoogle.addEventListener("click", async () => {
  try {
    setMessage(registerError, "正在連結 Google 帳號...", "success");
    const googleUser = await beginGoogleAuth("register");
    if (googleUser) {
      prepareGoogleRegistration(googleUser);
      setMessage(registerError, "已成功連結 Google 帳號，請填寫下方資料。", "success");
    }
  } catch (error) {
    setMessage(registerError, "Google 連結失敗：" + googleErrorText(error));
  }
});

clearGoogleLink.addEventListener("click", async () => {
  pendingGoogleUser = null;
  linkedGoogleEmail.textContent = "";
  linkGoogle.classList.remove("hidden");
  linkedGoogle.classList.add("hidden");
  await signOut(auth).catch(() => {});
});

registerForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const users = readUsers();
  const nickname = $("#regNickname").value.trim();
  const lastName = $("#regLastName").value.trim();
  const firstName = $("#regFirstName").value.trim();
  const gender = $("#regGender").value;
  const birthday = $("#regBirthday").value;
  const phone = $("#regPhone").value.trim();
  const email = ($("#regEmail").value.trim() || pendingGoogleUser?.email || "").toLowerCase();

  if (!nickname || !lastName || !firstName || !gender || !birthday) {
    setMessage(registerError, "請填寫所有標示星號的必填項目。");
    return;
  }
  if (!email && !phone) {
    setMessage(registerError, "電子郵件與聯絡電話至少需要填寫一項。");
    return;
  }

  const user = {
    nickname,
    realName: lastName + firstName,
    gender,
    birthday,
    phone,
    email,
    avatar: avatarData || defaultAvatar
  };

  if (registerMode === "google") {
    if (!pendingGoogleUser) {
      setMessage(registerError, "請先連結 Google 帳號。");
      return;
    }
    user.account = pendingGoogleUser.email;
    user.googleEmail = pendingGoogleUser.email;
    user.password = "GOOGLE_AUTH";
  } else {
    const account = $("#regAccount").value.trim().toLowerCase();
    const password = $("#regPassword").value;
    if (!account || !password) {
      setMessage(registerError, "請輸入註冊帳號與密碼。");
      return;
    }
    user.account = account;
    user.password = password;
  }

  const duplicate = users.some((item) =>
    item.account?.toLowerCase() === user.account.toLowerCase() ||
    (email && item.email?.toLowerCase() === email) ||
    (user.googleEmail && item.googleEmail?.toLowerCase() === user.googleEmail.toLowerCase())
  );
  if (duplicate) {
    setMessage(registerError, "此帳號、信箱或 Google 帳號已經註冊。");
    return;
  }

  users.push(user);
  saveUsers(users);
  setMessage(registerError, "註冊成功，已為您登入。", "success");
  setTimeout(() => loginWithUser(user), 500);
});

resetGame.addEventListener("click", () => renderGame(activeGame));
logoutBtn.addEventListener("click", async () => {
  cleanup();
  currentSessionUser = null;
  sessionStorage.removeItem(SESSION_KEY);
  await signOut(auth).catch(() => {});
  showAuth("login");
});

function ensurePauseControl() {
  if (!pauseButton) {
    pauseButton = button("暫停", "secondary-btn pause-btn");
    resetGame.after(pauseButton);
    pauseButton.addEventListener("click", () => setArcadePaused(!arcadePaused));
  }
}

function setArcadePaused(paused) {
  arcadePaused = paused;
  if (!pauseButton) return;
  pauseButton.textContent = arcadePaused ? "繼續" : "暫停";
  pauseButton.classList.toggle("paused", arcadePaused);
}

window.addEventListener("keydown", (event) => {
  if (event.key !== "Escape" || appView.classList.contains("hidden")) return;
  event.preventDefault();
  setArcadePaused(!arcadePaused);
});

function pressedKey(event) {
  return event.code || event.key;
}

function moveVectorFromKey(event) {
  const key = pressedKey(event);
  const map = {
    ArrowLeft: [-1, 0],
    KeyA: [-1, 0],
    a: [-1, 0],
    A: [-1, 0],
    ArrowRight: [1, 0],
    KeyD: [1, 0],
    d: [1, 0],
    D: [1, 0],
    ArrowUp: [0, -1],
    KeyW: [0, -1],
    w: [0, -1],
    W: [0, -1],
    ArrowDown: [0, 1],
    KeyS: [0, 1],
    s: [0, 1],
    S: [0, 1]
  };
  return map[key] || null;
}

function moveNameFromKey(event) {
  const move = moveVectorFromKey(event);
  if (!move) return "";
  const [x, y] = move;
  if (x < 0) return "left";
  if (x > 0) return "right";
  if (y < 0) return "up";
  return "down";
}

function keySetHas(keys, ...values) {
  return values.some((value) => keys.has(value));
}

function ensureThemeControls() {
  if (themePanel) return;
  const sidebar = document.querySelector(".sidebar");
  themePanel = document.createElement("section");
  themePanel.className = "theme-panel";
  themePanel.innerHTML = `
    <label for="themeSelect">個人化風格</label>
    <select id="themeSelect">
      <option value="classic">經典深色</option>
      <option value="neon">霓虹電競</option>
      <option value="forest">森林綠光</option>
      <option value="candy">糖果亮色</option>
    </select>
  `;
  sidebar.insertBefore(themePanel, logoutBtn);
  const select = themePanel.querySelector("#themeSelect");
  const savedTheme = localStorage.getItem("iian666_theme") || "classic";
  select.value = savedTheme;
  document.body.dataset.theme = savedTheme;
  select.addEventListener("change", () => {
    document.body.dataset.theme = select.value;
    localStorage.setItem("iian666_theme", select.value);
  });
}

function isAdminUser(user = currentSessionUser) {
  const value = (user?.email || user?.googleEmail || user?.account || "").toLowerCase();
  return value === ADMIN_EMAIL;
}

function ensureAdminControls() {
  if (!adminUsersButton) {
    adminUsersButton = button("管理帳密", "nav-btn admin-only-btn");
    adminUsersButton.dataset.id = "admin-users";
    adminUsersButton.addEventListener("click", renderAdminUsers);
    gameNav.after(adminUsersButton);
  }
  adminUsersButton.classList.toggle("hidden", !isAdminUser());
}

function renderAdminUsers() {
  if (!isAdminUser()) {
    renderGame(activeGame);
    return;
  }
  cleanup();
  cleanup = () => {};
  [...gameNav.children].forEach((navButton) => navButton.classList.remove("active"));
  adminUsersButton.classList.add("active");
  gameTitle.textContent = "管理帳密";
  gamePanel.innerHTML = "";

  const users = readUsers();
  const section = document.createElement("section");
  section.className = "admin-panel";
  section.innerHTML = `
    <div class="admin-panel-head">
      <div>
        <p class="eyebrow">Admin Only</p>
        <h2>使用者帳號密碼</h2>
      </div>
      <span class="badge">只有 ${ADMIN_EMAIL} 可見</span>
    </div>
    <div class="admin-table-wrap">
      <table class="admin-table">
        <thead>
          <tr>
            <th>暱稱</th>
            <th>帳號</th>
            <th>電子郵件</th>
            <th>密碼</th>
            <th>Google</th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
    </div>
  `;

  const body = section.querySelector("tbody");
  users.forEach((user) => {
    const row = document.createElement("tr");
    const password = user.password === "GOOGLE_AUTH" ? "Google 登入" : user.password || "";
    [user.nickname || "", user.account || "", user.email || "", password, user.googleEmail || ""].forEach((value) => {
      const cell = document.createElement("td");
      cell.textContent = value || "-";
      row.append(cell);
    });
    body.append(row);
  });

  gamePanel.append(section);
}

function renderGame(id) {
  cleanup();
  cleanup = () => {};
  setArcadePaused(false);
  activeGame = id;
  const game = games.find((item) => item.id === id);
  gameTitle.textContent = game.title;
  [...gameNav.children].forEach((button) => button.classList.toggle("active", button.dataset.id === id));
  if (adminUsersButton) adminUsersButton.classList.remove("active");
  gamePanel.innerHTML = "";
  cleanup = game.render(gamePanel) || (() => {});
}

function tools(html) {
  const wrap = document.createElement("div");
  wrap.className = "game-tools";
  wrap.innerHTML = html;
  return wrap;
}

function button(text, className = "mini-btn") {
  const element = document.createElement("button");
  element.type = "button";
  element.className = className;
  element.textContent = text;
  return element;
}

games.forEach((game) => {
  const navButton = button(game.title, "nav-btn");
  navButton.dataset.id = game.id;
  navButton.addEventListener("click", () => renderGame(game.id));
  gameNav.append(navButton);
});

avatarPreview.src = defaultAvatar;
readUsers();
const savedSession = sessionStorage.getItem(SESSION_KEY);
if (savedSession) {
  showApp(JSON.parse(savedSession));
} else {
  showAuth("login");
  getRedirectResult(auth).then((result) => {
    if (!result) return;
    const intent = sessionStorage.getItem(GOOGLE_INTENT_KEY) || "login";
    sessionStorage.removeItem(GOOGLE_INTENT_KEY);
    const googleUser = normalizeGoogleUser(result);
    if (intent === "register") {
      prepareGoogleRegistration(googleUser);
      setMessage(registerError, "已成功連結 Google 帳號，請填寫下方資料。", "success");
    } else {
      handleGoogleUser(googleUser);
    }
  }).catch((error) => {
    sessionStorage.removeItem(GOOGLE_INTENT_KEY);
    setMessage(loginError, "Google 驗證失敗：" + googleErrorText(error));
  });
}

function ticTacToeBigWinner(root) {
  let board = Array(9).fill("");
  let player = "X";
  let over = false;
  const info = tools(`<span class="badge">輪到：<b id="turn">X</b></span><span class="muted" id="tttStatus">先連成一線就獲勝</span>`);
  const grid = document.createElement("div");
  grid.className = "board ttt";
  root.append(info, grid);

  function winner() {
    const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    return lines.find(([a, b, c]) => board[a] && board[a] === board[b] && board[a] === board[c]);
  }
  function draw() {
    grid.innerHTML = "";
    board.forEach((value, index) => {
      const cell = button(value, "cell");
      cell.addEventListener("click", () => {
        if (board[index] || over) return;
        board[index] = player;
        if (winner()) {
          over = true;
          info.querySelector("#tttStatus").textContent = `${player} 獲勝！`;
        } else if (board.every(Boolean)) {
          over = true;
          info.querySelector("#tttStatus").textContent = "平手！";
        } else {
          player = player === "X" ? "O" : "X";
          info.querySelector("#turn").textContent = player;
        }
        draw();
      });
      grid.append(cell);
    });
  }
  draw();
}

function memoryGame(root) {
  const icons = ["A", "B", "C", "D", "E", "F", "G", "H"];
  let deck = [...icons, ...icons].sort(() => Math.random() - 0.5).map((icon) => ({ icon, open: false, done: false }));
  let picks = [];
  let moves = 0;
  const info = tools(`<span class="badge">步數：<b id="moves">0</b></span><span class="muted">找出所有相同字母</span>`);
  const grid = document.createElement("div");
  grid.className = "board memory";
  root.append(info, grid);
  function draw() {
    info.querySelector("#moves").textContent = moves;
    grid.innerHTML = "";
    deck.forEach((card) => {
      const cell = button(card.open || card.done ? card.icon : "?", "cell");
      cell.addEventListener("click", () => {
        if (card.open || card.done || picks.length === 2) return;
        card.open = true;
        picks.push(card);
        if (picks.length === 2) {
          moves += 1;
          const [a, b] = picks;
          if (a.icon === b.icon) {
            a.done = b.done = true;
            picks = [];
          } else {
            setTimeout(() => {
              a.open = b.open = false;
              picks = [];
              draw();
            }, 650);
          }
        }
        draw();
      });
      grid.append(cell);
    });
  }
  draw();
}

function snakeGame(root) {
  const info = tools(`<span class="badge">分數：<b id="score">0</b></span><span class="muted">方向鍵或 WASD 控制</span>`);
  const canvas = document.createElement("canvas");
  canvas.width = 560;
  canvas.height = 420;
  info.insertAdjacentHTML("beforeend", `<span class="badge">最高：<b id="snakeBest">${getHighScore("snake")}</b></span>`);
  root.append(info, wrapCanvas(canvas));
  const ctx = canvas.getContext("2d");
  const snakeShop = document.createElement("div");
  snakeShop.className = "shop-panel";
  snakeShop.innerHTML = `
    <div>
      <strong>貪食蛇商店</strong>
      <span>金幣：<b id="snakeCoins">${Number(localStorage.getItem("snake_coins") || 0)}</b></span>
    </div>
    <label>蛇皮膚
      <select id="snakeSkin">
        <option value="#10b981">綠蛇</option>
        <option value="#38bdf8">藍電蛇</option>
        <option value="#f59e0b">黃金蛇</option>
        <option value="#ec4899">粉紅蛇</option>
      </select>
    </label>
    <button class="mini-btn" id="buySnakeSkin" type="button">購買/使用 20 金幣</button>
    <p id="snakeShopMsg" class="muted">吃到食物會得到 1 金幣。</p>
  `;
  root.append(snakeShop);
  const skinSelect = snakeShop.querySelector("#snakeSkin");
  const buySkin = snakeShop.querySelector("#buySnakeSkin");
  const coinText = snakeShop.querySelector("#snakeCoins");
  const shopMsg = snakeShop.querySelector("#snakeShopMsg");
  snakeShop.insertAdjacentHTML("beforeend", `
    <div class="snake-items">
      <article>
        <strong>護盾</strong>
        <span>撞到時保命一次</span>
        <button class="mini-btn" id="buyShield" type="button">買 15</button>
        <button class="mini-btn" id="useShield" type="button">使用 (<b id="shieldCount">0</b>)</button>
      </article>
      <article>
        <strong>慢速</strong>
        <span>讓蛇短時間變慢</span>
        <button class="mini-btn" id="buySlow" type="button">買 10</button>
        <button class="mini-btn" id="useSlow" type="button">使用 (<b id="slowCount">0</b>)</button>
      </article>
      <article>
        <strong>雙倍金幣</strong>
        <span>短時間吃食物加倍</span>
        <button class="mini-btn" id="buyDouble" type="button">買 12</button>
        <button class="mini-btn" id="useDouble" type="button">使用 (<b id="doubleCount">0</b>)</button>
      </article>
    </div>
    <p class="muted" id="snakeEffectText">目前沒有啟用道具。</p>
  `);
  let shieldItems = Number(localStorage.getItem("snake_item_shield") || 0);
  let slowItems = Number(localStorage.getItem("snake_item_slow") || 0);
  let doubleItems = Number(localStorage.getItem("snake_item_double") || 0);
  let shieldActive = Number(localStorage.getItem("snake_active_shield") || 0);
  let slowTicks = 0;
  let slowFrame = 0;
  let doubleTicks = 0;
  const shieldCount = snakeShop.querySelector("#shieldCount");
  const slowCount = snakeShop.querySelector("#slowCount");
  const doubleCount = snakeShop.querySelector("#doubleCount");
  const effectText = snakeShop.querySelector("#snakeEffectText");
  function syncSnakeShop() {
    localStorage.setItem("snake_item_shield", String(shieldItems));
    localStorage.setItem("snake_item_slow", String(slowItems));
    localStorage.setItem("snake_item_double", String(doubleItems));
    localStorage.setItem("snake_active_shield", String(shieldActive));
    shieldCount.textContent = shieldItems;
    slowCount.textContent = slowItems;
    doubleCount.textContent = doubleItems;
    const effects = [];
    if (shieldActive > 0) effects.push(`護盾 x${shieldActive}`);
    if (slowTicks > 0) effects.push("慢速中");
    if (doubleTicks > 0) effects.push("雙倍金幣中");
    effectText.textContent = effects.length ? `啟用道具：${effects.join(" / ")}` : "目前沒有啟用道具。";
  }
  function spendCoins(cost) {
    const coins = Number(localStorage.getItem("snake_coins") || 0);
    if (coins < cost) {
      shopMsg.textContent = "金幣不夠，先多吃一點食物。";
      return false;
    }
    localStorage.setItem("snake_coins", String(coins - cost));
    coinText.textContent = coins - cost;
    return true;
  }
  snakeShop.querySelector("#buyShield").addEventListener("click", () => {
    if (!spendCoins(15)) return;
    shieldItems += 1;
    shopMsg.textContent = "已購買護盾。";
    syncSnakeShop();
  });
  snakeShop.querySelector("#useShield").addEventListener("click", () => {
    if (shieldItems <= 0) return;
    shieldItems -= 1;
    shieldActive += 1;
    shopMsg.textContent = "護盾已啟用。";
    syncSnakeShop();
  });
  snakeShop.querySelector("#buySlow").addEventListener("click", () => {
    if (!spendCoins(10)) return;
    slowItems += 1;
    shopMsg.textContent = "已購買慢速。";
    syncSnakeShop();
  });
  snakeShop.querySelector("#useSlow").addEventListener("click", () => {
    if (slowItems <= 0) return;
    slowItems -= 1;
    slowTicks = 180;
    shopMsg.textContent = "慢速已啟用。";
    syncSnakeShop();
  });
  snakeShop.querySelector("#buyDouble").addEventListener("click", () => {
    if (!spendCoins(12)) return;
    doubleItems += 1;
    shopMsg.textContent = "已購買雙倍金幣。";
    syncSnakeShop();
  });
  snakeShop.querySelector("#useDouble").addEventListener("click", () => {
    if (doubleItems <= 0) return;
    doubleItems -= 1;
    doubleTicks = 220;
    shopMsg.textContent = "雙倍金幣已啟用。";
    syncSnakeShop();
  });
  syncSnakeShop();
  const ownedSkins = new Set(JSON.parse(localStorage.getItem("snake_skins") || '["#10b981"]'));
  let snakeColor = localStorage.getItem("snake_skin") || "#10b981";
  skinSelect.value = snakeColor;
  buySkin.addEventListener("click", () => {
    const selected = skinSelect.value;
    let coins = Number(localStorage.getItem("snake_coins") || 0);
    if (!ownedSkins.has(selected)) {
      if (coins < 20) {
        shopMsg.textContent = "金幣不夠，先多吃一點食物。";
        return;
      }
      coins -= 20;
      ownedSkins.add(selected);
      localStorage.setItem("snake_skins", JSON.stringify([...ownedSkins]));
      localStorage.setItem("snake_coins", String(coins));
      coinText.textContent = coins;
    }
    snakeColor = selected;
    localStorage.setItem("snake_skin", selected);
    shopMsg.textContent = "已套用皮膚。";
  });
  let snake = [{ x: 8, y: 8 }];
  let dir = { x: 1, y: 0 };
  let nextDir = dir;
  let food = { x: 14, y: 10 };
  let score = 0;
  const size = 20;
  const key = (event) => {
    const move = moveVectorFromKey(event);
    if (!move) return;
    event.preventDefault();
    const [x, y] = move;
    if (x !== -dir.x || y !== -dir.y) nextDir = { x, y };
  };
  window.addEventListener("keydown", key);
  function placeFood() {
    food = { x: Math.floor(Math.random() * 28), y: Math.floor(Math.random() * 21) };
  }
  function tick() {
    if (arcadePaused) return;
    if (slowTicks > 0) {
      slowTicks -= 1;
      slowFrame += 1;
      syncSnakeShop();
      if (slowFrame % 2 === 1) return;
    }
    if (doubleTicks > 0) {
      doubleTicks -= 1;
      syncSnakeShop();
    }
    dir = nextDir;
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
    const hit = head.x < 0 || head.y < 0 || head.x >= 28 || head.y >= 21 || snake.some((part) => part.x === head.x && part.y === head.y);
    if (hit) {
      if (shieldActive > 0) {
        shieldActive -= 1;
        snake = [{ x: 8, y: 8 }];
        dir = nextDir = { x: 1, y: 0 };
        shopMsg.textContent = "護盾擋住了一次撞擊。";
        syncSnakeShop();
        return;
      }
      snake = [{ x: 8, y: 8 }];
      score = 0;
      dir = nextDir = { x: 1, y: 0 };
      placeFood();
    } else {
      snake.unshift(head);
      if (head.x === food.x && head.y === food.y) {
        score += 1;
        updateHighScore("snake", score, info.querySelector("#snakeBest"));
        const coins = Number(localStorage.getItem("snake_coins") || 0) + (doubleTicks > 0 ? 2 : 1);
        localStorage.setItem("snake_coins", String(coins));
        coinText.textContent = coins;
        placeFood();
      } else snake.pop();
    }
    info.querySelector("#score").textContent = score;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = snakeColor;
    snake.forEach((part) => ctx.fillRect(part.x * size + 2, part.y * size + 2, size - 4, size - 4));
    ctx.fillStyle = "#e14d63";
    ctx.fillRect(food.x * size + 2, food.y * size + 2, size - 4, size - 4);
    if (shieldActive > 0) {
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 3;
      const headPart = snake[0];
      ctx.strokeRect(headPart.x * size, headPart.y * size, size, size);
    }
  }
  const timer = setInterval(tick, 120);
  return () => {
    clearInterval(timer);
    window.removeEventListener("keydown", key);
  };
}

function pongGame(root) {
  const info = tools(`<span class="badge">分數：<b id="pongScore">0</b></span><span class="muted">滑鼠移動或方向鍵控制擋板</span>`);
  const canvas = document.createElement("canvas");
  canvas.width = 640;
  canvas.height = 420;
  info.insertAdjacentHTML("beforeend", `<span class="badge">最高：<b id="pongBest">${getHighScore("pong")}</b></span>`);
  root.append(info, wrapCanvas(canvas));
  const ctx = canvas.getContext("2d");
  let paddle = 250;
  let ball = { x: 320, y: 210, vx: 4, vy: 3 };
  let score = 0;
  const move = (event) => {
    const rect = canvas.getBoundingClientRect();
    paddle = Math.max(0, Math.min(520, ((event.clientX - rect.left) / rect.width) * canvas.width - 60));
  };
  const key = (event) => {
    const move = moveVectorFromKey(event);
    if (!move) return;
    if (move[0] < 0) paddle = Math.max(0, paddle - 36);
    if (move[0] > 0) paddle = Math.min(520, paddle + 36);
    if (move[0] !== 0) event.preventDefault();
  };
  canvas.addEventListener("mousemove", move);
  window.addEventListener("keydown", key);
  function tick() {
    if (arcadePaused) return;
    ball.x += ball.vx;
    ball.y += ball.vy;
    if (ball.x < 10 || ball.x > 630) ball.vx *= -1;
    if (ball.y < 10) ball.vy *= -1;
    if (ball.y > 372 && ball.x > paddle && ball.x < paddle + 120) {
      ball.vy = -Math.abs(ball.vy) - 0.15;
      score += 1;
      updateHighScore("pong", score, info.querySelector("#pongBest"));
    }
    if (ball.y > 430) {
      ball = { x: 320, y: 210, vx: 4, vy: 3 };
      score = 0;
    }
    info.querySelector("#pongScore").textContent = score;
    ctx.clearRect(0, 0, 640, 420);
    ctx.fillStyle = "#f3b432";
    ctx.fillRect(paddle, 386, 120, 14);
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, 10, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
  }
  const timer = setInterval(tick, 16);
  return () => {
    clearInterval(timer);
    canvas.removeEventListener("mousemove", move);
    window.removeEventListener("keydown", key);
  };
}

function whackMole(root) {
  let active = 0;
  let score = 0;
  let time = 30;
  const info = tools(`<span class="badge">分數：<b id="moleScore">0</b></span><span class="badge">時間：<b id="moleTime">30</b></span>`);
  const grid = document.createElement("div");
  grid.className = "board mole";
  info.insertAdjacentHTML("beforeend", `<span class="badge">最高：<b id="moleBest">${getHighScore("mole")}</b></span>`);
  root.append(info, grid);
  function draw() {
    grid.innerHTML = "";
    for (let i = 0; i < 9; i += 1) {
      const cell = button(i === active ? "●" : "", "cell");
      cell.addEventListener("click", () => {
        if (i === active && time > 0) {
          score += 1;
          active = Math.floor(Math.random() * 9);
          info.querySelector("#moleScore").textContent = score;
          updateHighScore("mole", score, info.querySelector("#moleBest"));
          draw();
        }
      });
      grid.append(cell);
    }
  }
  const hop = setInterval(() => {
    active = Math.floor(Math.random() * 9);
    draw();
  }, 700);
  const clock = setInterval(() => {
    time -= 1;
    info.querySelector("#moleTime").textContent = time;
    if (time <= 0) {
      clearInterval(hop);
      clearInterval(clock);
    }
  }, 1000);
  draw();
  return () => {
    clearInterval(hop);
    clearInterval(clock);
  };
}

function rpsGame(root) {
  const choices = [["剪刀", "剪"], ["石頭", "石"], ["布", "布"]];
  let wins = 0;
  const info = tools(`<span class="badge">勝場：<b id="wins">0</b></span><span class="muted" id="rpsResult">選一個開始</span>`);
  const row = document.createElement("div");
  row.className = "rps-row";
  root.append(info, row);
  choices.forEach(([name, icon], index) => {
    const choice = button(icon, "big-choice");
    choice.title = name;
    choice.addEventListener("click", () => {
      const cpu = Math.floor(Math.random() * 3);
      const result = index === cpu ? "平手" : (index - cpu + 3) % 3 === 1 ? "你贏了" : "你輸了";
      if (result === "你贏了") wins += 1;
      info.querySelector("#wins").textContent = wins;
      info.querySelector("#rpsResult").textContent = `你出 ${choices[index][0]}，電腦出 ${choices[cpu][0]}：${result}`;
    });
    row.append(choice);
  });
}

function guessGame(root) {
  const answer = Math.floor(Math.random() * 100) + 1;
  let tries = 0;
  const info = tools(`<span class="badge">次數：<b id="tries">0</b></span><span class="muted" id="hint">猜 1 到 100</span>`);
  const input = document.createElement("input");
  input.className = "number-input";
  input.type = "number";
  input.min = "1";
  input.max = "100";
  input.placeholder = "輸入數字";
  const send = button("送出");
  const row = document.createElement("div");
  row.className = "game-tools";
  row.append(input, send);
  root.append(info, row);
  send.addEventListener("click", () => {
    const value = Number(input.value);
    if (!value) return;
    tries += 1;
    info.querySelector("#tries").textContent = tries;
    info.querySelector("#hint").textContent = value === answer ? `答對了！答案是 ${answer}` : value > answer ? "太大了" : "太小了";
  });
}

function reactionGame(root) {
  let ready = false;
  let start = 0;
  let timer = 0;
  const info = tools(`<span class="badge">最佳：<b id="best">--</b></span><span class="muted">變綠時立刻點擊</span>`);
  const box = button("點我開始", "reaction-box");
  root.append(info, box);
  function arm() {
    ready = false;
    box.classList.remove("ready");
    box.textContent = "等待綠色...";
    timer = setTimeout(() => {
      ready = true;
      start = performance.now();
      box.classList.add("ready");
      box.textContent = "點！";
    }, 900 + Math.random() * 2200);
  }
  box.addEventListener("click", () => {
    if (!timer) return arm();
    if (!ready) {
      clearTimeout(timer);
      timer = 0;
      box.textContent = "太早了，再點一次開始";
      return;
    }
    const ms = Math.round(performance.now() - start);
    const best = info.querySelector("#best");
    best.textContent = best.textContent === "--" ? `${ms}ms` : `${Math.min(parseInt(best.textContent, 10), ms)}ms`;
    timer = 0;
    box.classList.remove("ready");
    box.textContent = `${ms}ms，再點一次開始`;
  });
  return () => clearTimeout(timer);
}

function simonGame(root) {
  const colors = ["#e14d63", "#10b981", "#2988e6", "#f3b432"];
  let seq = [];
  let index = 0;
  let locked = true;
  const info = tools(`<span class="badge">關卡：<b id="level">0</b></span><button class="mini-btn" id="startSimon" type="button">開始</button><span class="muted" id="simonStatus">記住亮起順序</span>`);
  const row = document.createElement("div");
  row.className = "simon-row";
  root.append(info, row);
  const buttons = colors.map((color, i) => {
    const tile = button("", "simon-btn");
    tile.style.background = color;
    tile.addEventListener("click", () => press(i));
    row.append(tile);
    return tile;
  });
  function flash(i) {
    buttons[i].classList.add("on");
    setTimeout(() => buttons[i].classList.remove("on"), 260);
  }
  function next() {
    locked = true;
    index = 0;
    seq.push(Math.floor(Math.random() * 4));
    info.querySelector("#level").textContent = seq.length;
    seq.forEach((value, i) => setTimeout(() => flash(value), 500 * i + 200));
    setTimeout(() => { locked = false; }, 500 * seq.length + 250);
  }
  function press(i) {
    if (locked) return;
    flash(i);
    if (seq[index] !== i) {
      info.querySelector("#simonStatus").textContent = "順序錯了，按開始重來";
      locked = true;
      seq = [];
      return;
    }
    index += 1;
    if (index === seq.length) next();
  }
  info.querySelector("#startSimon").addEventListener("click", () => {
    seq = [];
    next();
  });
}

function game2048(root) {
  let board = Array(16).fill(0);
  const info = tools(`<span class="badge">分數：<b id="score2048">0</b></span><span class="muted">方向鍵移動方塊</span>`);
  const grid = document.createElement("div");
  grid.className = "grid2048";
  info.insertAdjacentHTML("beforeend", `<span class="badge">最高：<b id="best2048">${getHighScore("2048")}</b></span>`);
  root.append(info, grid);
  function add() {
    const empty = board.map((value, i) => value ? -1 : i).filter((i) => i >= 0);
    if (empty.length) board[empty[Math.floor(Math.random() * empty.length)]] = Math.random() > 0.85 ? 4 : 2;
  }
  function draw() {
    const total = board.reduce((sum, value) => sum + value, 0);
    info.querySelector("#score2048").textContent = total;
    updateHighScore("2048", total, info.querySelector("#best2048"));
    grid.innerHTML = "";
    board.forEach((value) => {
      const tile = document.createElement("div");
      tile.className = "tile";
      tile.textContent = value || "";
      tile.style.background = value ? `hsl(${45 + Math.log2(value) * 18}, 78%, ${88 - Math.min(Math.log2(value) * 4, 38)}%)` : "#dbe2eb";
      grid.append(tile);
    });
  }
  function slide(line) {
    const values = line.filter(Boolean);
    for (let i = 0; i < values.length - 1; i += 1) {
      if (values[i] === values[i + 1]) {
        values[i] *= 2;
        values.splice(i + 1, 1);
      }
    }
    return [...values, ...Array(4 - values.length).fill(0)];
  }
  function move(dir) {
    const before = board.join(",");
    const next = Array(16).fill(0);
    for (let i = 0; i < 4; i += 1) {
      let line = [0, 1, 2, 3].map((j) => dir === "left" || dir === "right" ? board[i * 4 + j] : board[j * 4 + i]);
      if (dir === "right" || dir === "down") line.reverse();
      line = slide(line);
      if (dir === "right" || dir === "down") line.reverse();
      line.forEach((value, j) => {
        if (dir === "left" || dir === "right") next[i * 4 + j] = value;
        else next[j * 4 + i] = value;
      });
    }
    board = next;
    if (board.join(",") !== before) add();
    draw();
  }
  const key = (event) => {
    const dir = moveNameFromKey(event);
    if (!dir) return;
    event.preventDefault();
    move(dir);
  };
  add();
  add();
  draw();
  window.addEventListener("keydown", key);
  return () => window.removeEventListener("keydown", key);
}

function shootingRangeGame(root) {
  const info = tools(`<span class="badge">分數：<b id="shootScore">0</b></span><span class="badge">時間：<b id="shootTime">45</b></span><span class="muted">滑鼠點擊靶心射擊</span>`);
  const canvas = document.createElement("canvas");
  canvas.width = 720;
  canvas.height = 420;
  info.insertAdjacentHTML("beforeend", `<span class="badge">最高：<b id="shootBest">${getHighScore("shooter")}</b></span>`);
  root.append(info, wrapCanvas(canvas));
  const ctx = canvas.getContext("2d");
  let score = 0;
  let time = 45;
  let flash = 0;
  let target = newTarget();

  function newTarget() {
    return {
      x: 70 + Math.random() * 580,
      y: 60 + Math.random() * 270,
      r: 22 + Math.random() * 18,
      vx: (Math.random() > 0.5 ? 1 : -1) * (1.2 + Math.random() * 1.7),
      vy: (Math.random() > 0.5 ? 1 : -1) * (0.8 + Math.random() * 1.2)
    };
  }

  function drawTarget(t) {
    ctx.beginPath();
    ctx.arc(t.x, t.y, t.r, 0, Math.PI * 2);
    ctx.fillStyle = "#f8fafc";
    ctx.fill();
    ctx.lineWidth = 5;
    ctx.strokeStyle = "#e14d63";
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(t.x, t.y, t.r * 0.55, 0, Math.PI * 2);
    ctx.strokeStyle = "#25334b";
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(t.x, t.y, t.r * 0.18, 0, Math.PI * 2);
    ctx.fillStyle = "#f3b432";
    ctx.fill();
  }

  function draw() {
    if (arcadePaused) return;
    target.x += target.vx;
    target.y += target.vy;
    if (target.x < target.r || target.x > canvas.width - target.r) target.vx *= -1;
    if (target.y < target.r || target.y > canvas.height - target.r) target.vy *= -1;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#101827";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#1e293b";
    for (let x = 0; x < canvas.width; x += 40) ctx.fillRect(x, 0, 1, canvas.height);
    for (let y = 0; y < canvas.height; y += 40) ctx.fillRect(0, y, canvas.width, 1);
    drawTarget(target);
    if (flash > 0) {
      ctx.fillStyle = "rgba(255,255,255,0.18)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      flash -= 1;
    }
  }

  const click = (event) => {
    if (time <= 0) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((event.clientY - rect.top) / rect.height) * canvas.height;
    const distance = Math.hypot(x - target.x, y - target.y);
    if (distance <= target.r) {
      score += distance < target.r * 0.28 ? 5 : 2;
      target = newTarget();
      flash = 4;
    } else {
      score = Math.max(0, score - 1);
      flash = 2;
    }
    info.querySelector("#shootScore").textContent = score;
    updateHighScore("shooter", score, info.querySelector("#shootBest"));
  };

  canvas.addEventListener("click", click);
  const frame = setInterval(draw, 16);
  const clock = setInterval(() => {
    time -= 1;
    info.querySelector("#shootTime").textContent = time;
    if (time <= 0) {
      clearInterval(clock);
      target.vx = 0;
      target.vy = 0;
    }
  }, 1000);
  return () => {
    clearInterval(frame);
    clearInterval(clock);
    canvas.removeEventListener("click", click);
  };
}

function spaceShooterGame(root) {
  const info = tools(`<span class="badge">分數：<b id="spaceScore">0</b></span><span class="badge">生命：<b id="spaceLives">3</b></span><span class="muted">左右移動，空白鍵射擊</span>`);
  const canvas = document.createElement("canvas");
  canvas.width = 720;
  canvas.height = 420;
  info.insertAdjacentHTML("beforeend", `<span class="badge">最高：<b id="spaceBest">${getHighScore("space")}</b></span>`);
  root.append(info, wrapCanvas(canvas));
  const ctx = canvas.getContext("2d");
  const keys = new Set();
  let player = { x: 360, y: 370, w: 42, h: 22 };
  let bullets = [];
  let enemies = [];
  let score = 0;
  let lives = 3;
  let cooldown = 0;
  let spawn = 0;

  const keyDown = (event) => {
    if (["ArrowLeft", "ArrowRight", "a", "d", " "].includes(event.key)) event.preventDefault();
    keys.add(event.key);
  };
  const keyUp = (event) => keys.delete(event.key);
  window.addEventListener("keydown", keyDown);
  window.addEventListener("keyup", keyUp);

  function tick() {
    if (arcadePaused) return;
    if (lives > 0) {
      if (keys.has("ArrowLeft") || keys.has("a")) player.x -= 7;
      if (keys.has("ArrowRight") || keys.has("d")) player.x += 7;
      player.x = Math.max(22, Math.min(canvas.width - 22, player.x));
      if (keys.has(" ") && cooldown <= 0) {
        bullets.push({ x: player.x, y: player.y - 18 });
        cooldown = 10;
      }
    }
    cooldown -= 1;
    spawn -= 1;
    if (spawn <= 0) {
      enemies.push({ x: 30 + Math.random() * 660, y: -20, r: 16, vy: 1.4 + Math.random() * 1.8 });
      spawn = Math.max(18, 55 - Math.floor(score / 10));
    }
    bullets.forEach((b) => b.y -= 8);
    enemies.forEach((e) => e.y += e.vy);
    bullets = bullets.filter((b) => b.y > -20);

    enemies.forEach((enemy) => {
      bullets.forEach((shot) => {
        if (!enemy.dead && Math.hypot(enemy.x - shot.x, enemy.y - shot.y) < enemy.r + 6) {
          enemy.dead = true;
          shot.dead = true;
          score += 1;
          updateHighScore("space", score, info.querySelector("#spaceBest"));
        }
      });
      if (!enemy.dead && enemy.y > canvas.height + 20) {
        enemy.dead = true;
        lives -= 1;
      }
      if (!enemy.dead && Math.abs(enemy.x - player.x) < 34 && Math.abs(enemy.y - player.y) < 28) {
        enemy.dead = true;
        lives -= 1;
      }
    });
    bullets = bullets.filter((b) => !b.dead);
    enemies = enemies.filter((e) => !e.dead);
    info.querySelector("#spaceScore").textContent = score;
    info.querySelector("#spaceLives").textContent = Math.max(0, lives);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#f8fafc";
    bullets.forEach((b) => ctx.fillRect(b.x - 2, b.y - 10, 4, 16));
    ctx.fillStyle = "#10b981";
    ctx.beginPath();
    ctx.moveTo(player.x, player.y - 24);
    ctx.lineTo(player.x - player.w / 2, player.y + player.h / 2);
    ctx.lineTo(player.x + player.w / 2, player.y + player.h / 2);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#e14d63";
    enemies.forEach((e) => {
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
      ctx.fill();
    });
    if (lives <= 0) {
      ctx.fillStyle = "rgba(15, 23, 42, 0.78)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 36px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("遊戲結束", canvas.width / 2, canvas.height / 2);
      ctx.font = "bold 18px sans-serif";
      ctx.fillText("按重新開始再挑戰", canvas.width / 2, canvas.height / 2 + 36);
    }
  }

  const timer = setInterval(tick, 16);
  return () => {
    clearInterval(timer);
    window.removeEventListener("keydown", keyDown);
    window.removeEventListener("keyup", keyUp);
  };
}

function dodgeGame(root) {
  const info = tools(`<span class="badge">生存：<b id="dodgeTime">0</b>s</span><span class="muted">方向鍵或 WASD 閃避紅色彈幕</span>`);
  const canvas = document.createElement("canvas");
  canvas.width = 720;
  canvas.height = 420;
  root.append(info, wrapCanvas(canvas));
  const ctx = canvas.getContext("2d");
  const keys = new Set();
  let player = { x: 360, y: 210, r: 12 };
  let bullets = [];
  let frames = 0;
  let alive = true;

  const keyName = (event) => event.code || event.key;
  const keyDown = (event) => {
    const key = keyName(event);
    if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "KeyW", "KeyA", "KeyS", "KeyD", "w", "a", "s", "d", "W", "A", "S", "D"].includes(key)) event.preventDefault();
    keys.add(key);
  };
  const keyUp = (event) => keys.delete(keyName(event));
  window.addEventListener("keydown", keyDown);
  window.addEventListener("keyup", keyUp);

  function spawnBullet() {
    const side = Math.floor(Math.random() * 4);
    const speed = 2.1 + Math.min(3.2, frames / 1200);
    let x = 0;
    let y = 0;
    if (side === 0) { x = Math.random() * canvas.width; y = -10; }
    if (side === 1) { x = canvas.width + 10; y = Math.random() * canvas.height; }
    if (side === 2) { x = Math.random() * canvas.width; y = canvas.height + 10; }
    if (side === 3) { x = -10; y = Math.random() * canvas.height; }
    const angle = Math.atan2(player.y - y, player.x - x) + (Math.random() - 0.5) * 0.7;
    bullets.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, r: 7 });
  }

  function tick() {
    if (arcadePaused) return;
    if (alive) {
      frames += 1;
      if (keys.has("ArrowLeft") || keys.has("KeyA") || keys.has("a") || keys.has("A")) player.x -= 5;
      if (keys.has("ArrowRight") || keys.has("KeyD") || keys.has("d") || keys.has("D")) player.x += 5;
      if (keys.has("ArrowUp") || keys.has("KeyW") || keys.has("w") || keys.has("W")) player.y -= 5;
      if (keys.has("ArrowDown") || keys.has("KeyS") || keys.has("s") || keys.has("S")) player.y += 5;
      player.x = Math.max(player.r, Math.min(canvas.width - player.r, player.x));
      player.y = Math.max(player.r, Math.min(canvas.height - player.r, player.y));
      if (frames % Math.max(8, 24 - Math.floor(frames / 450)) === 0) spawnBullet();
      bullets.forEach((b) => {
        b.x += b.vx;
        b.y += b.vy;
        if (Math.hypot(b.x - player.x, b.y - player.y) < b.r + player.r) alive = false;
      });
      bullets = bullets.filter((b) => b.x > -40 && b.x < canvas.width + 40 && b.y > -40 && b.y < canvas.height + 40);
      info.querySelector("#dodgeTime").textContent = Math.floor(frames / 60);
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#111827";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#e14d63";
    bullets.forEach((b) => {
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.fillStyle = "#38bdf8";
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.r, 0, Math.PI * 2);
    ctx.fill();
    if (!alive) {
      ctx.fillStyle = "rgba(15, 23, 42, 0.78)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 34px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`撐了 ${Math.floor(frames / 60)} 秒`, canvas.width / 2, canvas.height / 2);
    }
  }

  const timer = setInterval(tick, 16);
  return () => {
    clearInterval(timer);
    window.removeEventListener("keydown", keyDown);
    window.removeEventListener("keyup", keyUp);
  };
}

function ticTacToe(root) {
  let board = Array(9).fill("");
  let player = "X";
  let over = false;
  const info = tools(`<span class="badge">輪到：<b id="turn">X</b></span><span class="muted" id="tttStatus">先連成一線就獲勝</span>`);
  const result = document.createElement("div");
  result.className = "winner-banner hidden";
  const grid = document.createElement("div");
  grid.className = "board ttt";
  root.append(info, result, grid);

  function winner() {
    const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    return lines.find(([a, b, c]) => board[a] && board[a] === board[b] && board[a] === board[c]);
  }

  function showResult(text) {
    result.textContent = text;
    result.classList.remove("hidden");
  }

  function draw() {
    grid.innerHTML = "";
    board.forEach((value, index) => {
      const cell = button(value, "cell");
      cell.addEventListener("click", () => {
        if (board[index] || over) return;
        board[index] = player;
        if (winner()) {
          over = true;
          info.querySelector("#tttStatus").textContent = `${player} 獲勝！`;
          showResult(`${player} 獲勝`);
        } else if (board.every(Boolean)) {
          over = true;
          info.querySelector("#tttStatus").textContent = "平手！";
          showResult("平手");
        } else {
          player = player === "X" ? "O" : "X";
          info.querySelector("#turn").textContent = player;
        }
        draw();
      });
      grid.append(cell);
    });
  }

  draw();
}

ticTacToe = ticTacToeBigWinner;

function wrapCanvas(canvas) {
  const wrap = document.createElement("div");
  wrap.className = "canvas-wrap";
  wrap.append(canvas);
  return wrap;
}

function clickerGame(root) {
  let score = 0;
  let time = 20;
  const info = tools(`<span class="badge">分數：<b id="clickScore">0</b></span><span class="badge">最高：<b id="clickBest">${getHighScore("clicker")}</b></span><span class="badge">時間：<b id="clickTime">20</b></span>`);
  const arena = document.createElement("button");
  arena.type = "button";
  arena.className = "reaction-box";
  arena.textContent = "狂點我！";
  root.append(info, arena);
  const tick = setInterval(() => {
    time -= 1;
    info.querySelector("#clickTime").textContent = time;
    if (time <= 0) {
      clearInterval(tick);
      arena.textContent = `結束！${score} 分`;
      arena.disabled = true;
    }
  }, 1000);
  arena.addEventListener("click", () => {
    if (time <= 0) return;
    score += 1;
    info.querySelector("#clickScore").textContent = score;
    updateHighScore("clicker", score, info.querySelector("#clickBest"));
  });
  return () => clearInterval(tick);
}

function mathRushGame(root) {
  let score = 0;
  let time = 45;
  let answer = 0;
  const info = tools(`<span class="badge">分數：<b id="mathScore">0</b></span><span class="badge">最高：<b id="mathBest">${getHighScore("math")}</b></span><span class="badge">時間：<b id="mathTime">45</b></span>`);
  const question = document.createElement("div");
  question.className = "winner-banner";
  const input = document.createElement("input");
  input.className = "number-input";
  input.type = "number";
  input.placeholder = "答案";
  const send = button("送出");
  const row = document.createElement("div");
  row.className = "game-tools";
  row.append(input, send);
  root.append(info, question, row);
  function next() {
    const a = Math.floor(Math.random() * 18) + 2;
    const b = Math.floor(Math.random() * 18) + 2;
    const op = Math.random() > 0.5 ? "+" : "×";
    answer = op === "+" ? a + b : a * b;
    question.textContent = `${a} ${op} ${b}`;
    input.value = "";
    input.focus();
  }
  function submit() {
    if (time <= 0) return;
    if (Number(input.value) === answer) {
      score += 1;
      info.querySelector("#mathScore").textContent = score;
      updateHighScore("math", score, info.querySelector("#mathBest"));
      next();
    }
  }
  send.addEventListener("click", submit);
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") submit();
  });
  const tick = setInterval(() => {
    time -= 1;
    info.querySelector("#mathTime").textContent = time;
    if (time <= 0) {
      clearInterval(tick);
      question.textContent = `結束：${score} 題`;
    }
  }, 1000);
  next();
  return () => clearInterval(tick);
}

function colorMatchGame(root) {
  const names = ["紅", "藍", "綠", "黃", "紫"];
  const colors = ["#ef4444", "#3b82f6", "#22c55e", "#f59e0b", "#a855f7"];
  let score = 0;
  let time = 30;
  let answer = 0;
  const info = tools(`<span class="badge">分數：<b id="colorScore">0</b></span><span class="badge">最高：<b id="colorBest">${getHighScore("color")}</b></span><span class="badge">時間：<b id="colorTime">30</b></span>`);
  const prompt = document.createElement("div");
  prompt.className = "winner-banner";
  const row = document.createElement("div");
  row.className = "rps-row";
  root.append(info, prompt, row);
  function next() {
    answer = Math.floor(Math.random() * names.length);
    const display = Math.floor(Math.random() * names.length);
    prompt.textContent = names[display];
    prompt.style.color = colors[answer];
    row.innerHTML = "";
    names.forEach((name, index) => {
      const choice = button(name, "big-choice");
      choice.style.color = colors[index];
      choice.addEventListener("click", () => {
        if (time <= 0) return;
        if (index === answer) {
          score += 1;
          info.querySelector("#colorScore").textContent = score;
          updateHighScore("color", score, info.querySelector("#colorBest"));
        } else {
          score = Math.max(0, score - 1);
          info.querySelector("#colorScore").textContent = score;
        }
        next();
      });
      row.append(choice);
    });
  }
  const tick = setInterval(() => {
    time -= 1;
    info.querySelector("#colorTime").textContent = time;
    if (time <= 0) {
      clearInterval(tick);
      prompt.textContent = `結束：${score} 分`;
      row.innerHTML = "";
    }
  }, 1000);
  next();
  return () => clearInterval(tick);
}

function typingSprintGame(root) {
  const words = ["laser", "winner", "arcade", "rocket", "battle", "target", "speed", "combo", "shield", "storm"];
  let score = 0;
  let time = 45;
  let word = "";
  const info = tools(`<span class="badge">分數：<b id="typeScore">0</b></span><span class="badge">最高：<b id="typeBest">${getHighScore("type")}</b></span><span class="badge">時間：<b id="typeTime">45</b></span>`);
  const prompt = document.createElement("div");
  prompt.className = "winner-banner";
  const input = document.createElement("input");
  input.className = "number-input";
  input.type = "text";
  input.placeholder = "照著打";
  root.append(info, prompt, input);
  function next() {
    word = words[Math.floor(Math.random() * words.length)];
    prompt.textContent = word;
    input.value = "";
    input.focus();
  }
  input.addEventListener("input", () => {
    if (time <= 0) return;
    if (input.value.trim().toLowerCase() === word) {
      score += 1;
      info.querySelector("#typeScore").textContent = score;
      updateHighScore("type", score, info.querySelector("#typeBest"));
      next();
    }
  });
  const tick = setInterval(() => {
    time -= 1;
    info.querySelector("#typeTime").textContent = time;
    if (time <= 0) {
      clearInterval(tick);
      prompt.textContent = `結束：${score} 字`;
      input.disabled = true;
    }
  }, 1000);
  next();
  return () => clearInterval(tick);
}

function mazeEscapeGame(root) {
  const info = tools(`<span class="badge">步數：<b id="mazeSteps">0</b></span><span class="badge">最佳：<b id="mazeBest">${getHighScore("maze") || "--"}</b></span><span class="muted">方向鍵或 WASD 走到右下角</span>`);
  const layout = [
    "S....#....",
    "###..#.##.",
    "...#...#..",
    ".#.###.#.#",
    ".#.....#.#",
    ".#####...#",
    "...#..##.#",
    "##.#.....#",
    "...###.#..",
    ".#.....#.E"
  ];
  const grid = document.createElement("div");
  grid.className = "maze-grid";
  let pos = { x: 0, y: 0 };
  let steps = 0;
  let won = false;
  root.append(info, grid);
  function draw() {
    grid.innerHTML = "";
    layout.forEach((row, y) => {
      [...row].forEach((cell, x) => {
        const tile = document.createElement("div");
        tile.className = "maze-tile";
        if (cell === "#") tile.classList.add("wall");
        if (cell === "E") tile.classList.add("goal");
        if (pos.x === x && pos.y === y) tile.classList.add("player");
        grid.append(tile);
      });
    });
  }
  function move(dx, dy) {
    if (won) return;
    const nx = pos.x + dx;
    const ny = pos.y + dy;
    if (!layout[ny] || layout[ny][nx] === "#" || layout[ny][nx] === undefined) return;
    pos = { x: nx, y: ny };
    steps += 1;
    info.querySelector("#mazeSteps").textContent = steps;
    if (layout[ny][nx] === "E") {
      won = true;
      const current = getHighScore("maze");
      if (!current || steps < current) localStorage.setItem(highScoreKey("maze"), String(steps));
      info.querySelector("#mazeBest").textContent = localStorage.getItem(highScoreKey("maze"));
    }
    draw();
  }
  const key = (event) => {
    const map = { ArrowLeft: [-1,0], a: [-1,0], ArrowRight: [1,0], d: [1,0], ArrowUp: [0,-1], w: [0,-1], ArrowDown: [0,1], s: [0,1] };
    if (!map[event.key]) return;
    event.preventDefault();
    move(...map[event.key]);
  };
  window.addEventListener("keydown", key);
  draw();
  return () => window.removeEventListener("keydown", key);
}

function slotMachineGame(root) {
  const symbols = ["7", "★", "$", "BAR", "♦"];
  let coins = 50;
  const info = tools(`<span class="badge">金幣：<b id="slotCoins">50</b></span><span class="badge">最高：<b id="slotBest">${getHighScore("slots")}</b></span>`);
  const display = document.createElement("div");
  display.className = "slot-display";
  const spin = button("拉霸", "primary-btn indigo slot-spin");
  root.append(info, display, spin);
  function draw(values = ["?", "?", "?"]) {
    display.innerHTML = "";
    values.forEach((value) => {
      const box = document.createElement("div");
      box.textContent = value;
      display.append(box);
    });
  }
  spin.addEventListener("click", () => {
    if (coins <= 0) return;
    coins -= 5;
    const values = [0, 0, 0].map(() => symbols[Math.floor(Math.random() * symbols.length)]);
    if (values[0] === values[1] && values[1] === values[2]) coins += 40;
    else if (values[0] === values[1] || values[1] === values[2] || values[0] === values[2]) coins += 12;
    info.querySelector("#slotCoins").textContent = coins;
    updateHighScore("slots", coins, info.querySelector("#slotBest"));
    draw(values);
  });
  draw();
}

function numberSequenceGame(root) {
  let level = 1;
  let sequence = "";
  let showing = false;
  const info = tools(`<span class="badge">關卡：<b id="seqLevel">1</b></span><span class="badge">最高：<b id="seqBest">${getHighScore("sequence")}</b></span>`);
  const prompt = document.createElement("div");
  prompt.className = "winner-banner";
  const input = document.createElement("input");
  input.className = "number-input";
  input.type = "text";
  input.placeholder = "輸入數字";
  const start = button("開始");
  const row = document.createElement("div");
  row.className = "game-tools";
  row.append(input, start);
  root.append(info, prompt, row);
  function makeSequence() {
    sequence = "";
    for (let i = 0; i < level + 2; i += 1) sequence += Math.floor(Math.random() * 10);
  }
  function showSequence() {
    showing = true;
    input.value = "";
    input.disabled = true;
    makeSequence();
    prompt.textContent = sequence;
    setTimeout(() => {
      prompt.textContent = "輸入剛剛的數字";
      input.disabled = false;
      input.focus();
      showing = false;
    }, 1100 + level * 260);
  }
  start.addEventListener("click", showSequence);
  input.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" || showing) return;
    if (input.value.trim() === sequence) {
      level += 1;
      info.querySelector("#seqLevel").textContent = level;
      updateHighScore("sequence", level, info.querySelector("#seqBest"));
      showSequence();
    } else {
      prompt.textContent = `錯了，答案是 ${sequence}`;
      level = 1;
      info.querySelector("#seqLevel").textContent = level;
    }
  });
  prompt.textContent = "按開始記憶數字";
}

function onlineBattleGame(root) {
  const info = tools(`<span class="badge">區網模式</span><span class="muted">朋友使用同一網址進來，先用同一個房間碼集合。</span>`);
  const panel = document.createElement("section");
  panel.className = "admin-panel";
  panel.innerHTML = `
    <div class="admin-panel-head">
      <div>
        <p class="eyebrow">Online Room</p>
        <h2>連線對戰準備室</h2>
      </div>
      <span class="badge">測試版</span>
    </div>
    <div class="game-tools">
      <input class="number-input" id="roomCodeInput" type="text" placeholder="房間碼，例如 6666" value="6666" />
      <button class="mini-btn" id="joinRoomBtn" type="button">加入房間</button>
    </div>
    <div class="winner-banner hidden" id="roomStatus"></div>
    <p class="muted">目前先提供房間入口。下一步可接 Node 伺服器，做真正雙人同步圈圈叉叉、槍戰或排行榜。</p>
  `;
  root.append(info, panel);
  const status = panel.querySelector("#roomStatus");
  panel.querySelector("#joinRoomBtn").addEventListener("click", () => {
    const code = panel.querySelector("#roomCodeInput").value.trim() || "6666";
    status.textContent = `已加入房間 ${code}`;
    status.classList.remove("hidden");
  });
}

function onlineBattleGameReal(root) {
  const clientId = localStorage.getItem("iian666_client_id") || crypto.randomUUID();
  localStorage.setItem("iian666_client_id", clientId);
  let roomCode = "6666";
  let state = null;
  let timer = null;
  const info = tools(`<span class="badge">即時連線</span><span class="muted">朋友輸入同一個房間碼，就能同步玩圈圈叉叉。</span>`);
  const panel = document.createElement("section");
  panel.className = "admin-panel";
  panel.innerHTML = `
    <div class="admin-panel-head">
      <div>
        <p class="eyebrow">Online Room</p>
        <h2>連線圈圈叉叉</h2>
      </div>
      <span class="badge" id="onlineSymbol">等待加入</span>
    </div>
    <div class="game-tools">
      <input class="number-input" id="roomCodeInput" type="text" placeholder="房間碼，例如 6666" value="6666" />
      <button class="mini-btn" id="joinRoomBtn" type="button">加入房間</button>
      <button class="mini-btn" id="onlineResetBtn" type="button">重開</button>
    </div>
    <div class="winner-banner hidden" id="onlineResult"></div>
    <div class="board ttt" id="onlineBoard"></div>
    <p class="muted">同學請開你的網址，例如 http://10.32.13.51:4173/index.html，進入「連線對戰」後輸入同一個房間碼。</p>
  `;
  root.append(info, panel);
  const board = panel.querySelector("#onlineBoard");
  const result = panel.querySelector("#onlineResult");
  const symbolLabel = panel.querySelector("#onlineSymbol");

  async function api(path, payload) {
    const options = payload ? { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) } : {};
    const response = await fetch(path, options);
    if (!response.ok) throw new Error("連線伺服器沒有回應");
    return response.json();
  }

  function render() {
    if (!state) return;
    symbolLabel.textContent = `你是 ${state.symbol}`;
    result.classList.toggle("hidden", !state.winner);
    result.textContent = state.winner ? (state.winner === "平手" ? "平手" : `${state.winner} 獲勝`) : "";
    board.innerHTML = "";
    state.board.forEach((value, index) => {
      const cell = button(value, "cell");
      cell.disabled = Boolean(value) || state.winner || state.symbol !== state.turn;
      cell.addEventListener("click", async () => {
        state = await api("/api/move", { room: roomCode, client: clientId, index });
        render();
      });
      board.append(cell);
    });
  }

  async function poll() {
    try {
      state = await api(`/api/room?room=${encodeURIComponent(roomCode)}&client=${encodeURIComponent(clientId)}`);
      render();
    } catch (error) {
      result.textContent = "請用 server.js 啟動網站，才可連線對戰。";
      result.classList.remove("hidden");
    }
  }

  panel.querySelector("#joinRoomBtn").addEventListener("click", () => {
    roomCode = panel.querySelector("#roomCodeInput").value.trim() || "6666";
    poll();
  });
  panel.querySelector("#onlineResetBtn").addEventListener("click", async () => {
    state = await api("/api/reset", { room: roomCode, client: clientId });
    render();
  });
  timer = setInterval(poll, 900);
  poll();
  return () => clearInterval(timer);
}

onlineBattleGame = onlineBattleGameReal;
const onlineGameEntry = games.find((game) => game.id === "online");
if (onlineGameEntry) onlineGameEntry.render = onlineBattleGameReal;

function mazeEscapeGameHard(root) {
  const info = tools(`<span class="badge">關卡：<b id="mazeLevel">1</b>/6</span><span class="badge">本關步數：<b id="mazeSteps">0</b></span><span class="badge">總步數：<b id="mazeTotal">0</b></span><span class="badge">最佳總步數：<b id="mazeBest">${getHighScore("maze") || "--"}</b></span><span class="muted" id="mazeHint">方向鍵或 WASD 移動，迷霧外看不到路。</span>`);
  const grid = document.createElement("div");
  grid.className = "maze-grid hard-maze";
  const levelSizes = [11, 13, 15, 17, 21, 25];
  let level = 0;
  let layout = [];
  let pos = { x: 1, y: 1 };
  let steps = 0;
  let totalSteps = 0;
  let visited = new Set();
  let finished = false;
  root.append(info, grid);

  function seededRandom(seed) {
    let value = seed;
    return () => {
      value = (value * 1664525 + 1013904223) >>> 0;
      return value / 4294967296;
    };
  }

  function makeMaze(size, seed) {
    const random = seededRandom(seed);
    const cells = Array.from({ length: size }, () => Array(size).fill("#"));
    const stack = [{ x: 1, y: 1 }];
    cells[1][1] = ".";
    while (stack.length) {
      const current = stack[stack.length - 1];
      const dirs = [[2, 0], [-2, 0], [0, 2], [0, -2]]
        .map((dir) => ({ dir, order: random() }))
        .sort((a, b) => a.order - b.order)
        .map((item) => item.dir);
      let carved = false;
      for (const [dx, dy] of dirs) {
        const nx = current.x + dx;
        const ny = current.y + dy;
        if (ny <= 0 || ny >= size - 1 || nx <= 0 || nx >= size - 1 || cells[ny][nx] !== "#") continue;
        cells[current.y + dy / 2][current.x + dx / 2] = ".";
        cells[ny][nx] = ".";
        stack.push({ x: nx, y: ny });
        carved = true;
        break;
      }
      if (!carved) stack.pop();
    }
    cells[1][1] = "S";
    cells[size - 2][size - 2] = "E";
    return cells.map((row) => row.join(""));
  }

  function draw() {
    grid.innerHTML = "";
    layout.forEach((row, y) => {
      [...row].forEach((cell, x) => {
        const tile = document.createElement("div");
        tile.className = "maze-tile";
        const distance = Math.abs(pos.x - x) + Math.abs(pos.y - y);
        const seen = visited.has(`${x},${y}`) || distance <= 2;
        if (!seen) tile.classList.add("fog");
        if (seen && cell === "#") tile.classList.add("wall");
        if (seen && cell === "E") tile.classList.add("goal");
        if (pos.x === x && pos.y === y) tile.classList.add("player");
        grid.append(tile);
      });
    });
  }

  function loadLevel(nextLevel) {
    level = nextLevel;
    layout = makeMaze(levelSizes[level], 6993 + level * 97);
    grid.style.gridTemplateColumns = `repeat(${layout[0].length}, minmax(15px, 1fr))`;
    pos = { x: 1, y: 1 };
    steps = 0;
    visited = new Set(["1,1"]);
    info.querySelector("#mazeLevel").textContent = level + 1;
    info.querySelector("#mazeSteps").textContent = steps;
    info.querySelector("#mazeHint").textContent = level >= 4 ? "最後兩關是大迷宮，迷霧很厚，記路很重要。" : "方向鍵或 WASD 移動，迷霧外看不到路。";
    draw();
  }

  function move(dx, dy) {
    if (finished || arcadePaused) return;
    const nx = pos.x + dx;
    const ny = pos.y + dy;
    if (!layout[ny] || layout[ny][nx] === "#" || layout[ny][nx] === undefined) return;
    pos = { x: nx, y: ny };
    steps += 1;
    totalSteps += 1;
    visited.add(`${nx},${ny}`);
    info.querySelector("#mazeSteps").textContent = steps;
    info.querySelector("#mazeTotal").textContent = totalSteps;
    if (layout[ny][nx] === "E") {
      if (level < levelSizes.length - 1) {
        info.querySelector("#mazeHint").textContent = `第 ${level + 1} 關通過，進入下一關。`;
        setTimeout(() => loadLevel(level + 1), 550);
      } else {
        finished = true;
        const current = getHighScore("maze");
        if (!current || totalSteps < current) localStorage.setItem(highScoreKey("maze"), String(totalSteps));
        info.querySelector("#mazeBest").textContent = localStorage.getItem(highScoreKey("maze"));
        info.querySelector("#mazeHint").textContent = `全 6 關完成，總步數 ${totalSteps}！`;
      }
    }
    draw();
  }

  const key = (event) => {
    const map = { ArrowLeft: [-1, 0], a: [-1, 0], ArrowRight: [1, 0], d: [1, 0], ArrowUp: [0, -1], w: [0, -1], ArrowDown: [0, 1], s: [0, 1] };
    const moveDir = map[event.key] || map[event.key.toLowerCase()];
    if (!moveDir) return;
    event.preventDefault();
    move(...moveDir);
  };

  window.addEventListener("keydown", key);
  loadLevel(0);
  return () => window.removeEventListener("keydown", key);
}

const mazeGameEntry = games.find((game) => game.id === "maze");
if (mazeGameEntry) mazeGameEntry.render = mazeEscapeGameHard;
