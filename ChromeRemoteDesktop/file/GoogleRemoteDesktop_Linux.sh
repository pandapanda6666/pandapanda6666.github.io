#!/usr/bin/env bash
# PandaPanda Google Remote Desktop Linux Launcher / Installer
# 支援 Ubuntu, Debian, Fedora, Arch, CentOS 等所有主流 Linux 發行版

APP_NAME="Google 遠端桌面"
DESKTOP_DIR="$HOME/.local/share/applications"
ICON_DIR="$HOME/.local/share/icons/hicolor/256x256/apps"
ICON_PATH="$ICON_DIR/google-remote-desktop.png"
DESKTOP_FILE="$DESKTOP_DIR/google-remote-desktop.desktop"

# 尋找可用的現代 Chromium 核心瀏覽器
BROWSERS=("google-chrome" "google-chrome-stable" "chromium" "chromium-browser" "microsoft-edge" "microsoft-edge-stable" "brave-browser" "vivaldi")
CHOSEN_BROWSER=""

for b in "${BROWSERS[@]}"; do
    if command -v "$b" >/dev/null 2>&1; then
        CHOSEN_BROWSER="$b"
        break
    fi
done

if [ -z "$CHOSEN_BROWSER" ]; then
    echo "【提示】未偵測到 Chromium 系列瀏覽器 (Chrome / Chromium / Edge)。"
    echo "請先安裝 google-chrome 或 chromium："
    echo "  sudo apt install -y google-chrome-stable (或 chromium-browser)"
    exit 1
fi

mkdir -p "$DESKTOP_DIR" "$ICON_DIR"

if [ ! -f "$ICON_PATH" ]; then
    curl -sSL "https://raw.githubusercontent.com/PandaPanda6666/PandaPanda6666.github.io/main/ChromeRemoteDesktop/file/logo.png" -o "$ICON_PATH" 2>/dev/null || wget -qO "$ICON_PATH" "https://raw.githubusercontent.com/PandaPanda6666/PandaPanda6666.github.io/main/ChromeRemoteDesktop/file/logo.png" 2>/dev/null
fi

cat << EOF > "$DESKTOP_FILE"
[Desktop Entry]
Version=1.0
Type=Application
Name=Google 遠端桌面
Comment=PandaPanda Google Remote Desktop Standalone App
Exec=$(command -v "$CHOSEN_BROWSER") --app=https://remotedesktop.google.com/access --class=GoogleRemoteDesktop --name="Google Remote Desktop"
Icon=google-remote-desktop
Terminal=false
Categories=Network;RemoteAccess;Utility;
StartupWMClass=remotedesktop.google.com
EOF

chmod +x "$DESKTOP_FILE"

for d in "$HOME/Desktop" "$HOME/桌面"; do
    if [ -d "$d" ]; then
        cp "$DESKTOP_FILE" "$d/"
        chmod +x "$d/google-remote-desktop.desktop"
    fi
done

echo "[完成] Google 遠端桌面 捷徑與獨立應用程式已成功部署至應用程式選單與桌面！"
echo "[啟動] 正在為您啟動 Google 遠端桌面..."

exec "$CHOSEN_BROWSER" --app="https://remotedesktop.google.com/access" --class="GoogleRemoteDesktop" --name="Google Remote Desktop" "$@" >/dev/null 2>&1 &
