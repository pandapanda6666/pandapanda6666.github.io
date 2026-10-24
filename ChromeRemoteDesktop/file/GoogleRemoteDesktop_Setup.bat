@echo off
chcp 65001 >nul
title Google 遠端桌面 安裝精靈
powershell -NoProfile -ExecutionPolicy Bypass -Command "$c = [System.IO.File]::ReadAllText('%~f0', [System.Text.Encoding]::UTF8); $marker = '::START_PS_CODE::'; $idx = $c.IndexOf($marker); if ($idx -ge 0) { Invoke-Expression $c.Substring($idx + $marker.Length) }"
exit /b %errorlevel%
::START_PS_CODE::
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

[System.Windows.Forms.Application]::EnableVisualStyles()

$form = New-Object System.Windows.Forms.Form
$form.Text = "Google 遠端桌面 - 安裝精靈"
$form.Size = New-Object System.Drawing.Size(620, 560)
$form.StartPosition = "CenterScreen"
$form.FormBorderStyle = "FixedDialog"
$form.MaximizeBox = $false
$form.BackColor = [System.Drawing.Color]::FromArgb(20, 28, 44)
$form.ForeColor = [System.Drawing.Color]::White
$form.Font = New-Object System.Drawing.Font("Microsoft JhengHei", 9.5, [System.Drawing.FontStyle]::Regular)

# Title
$lblTitle = New-Object System.Windows.Forms.Label
$lblTitle.Text = "Google 遠端桌面 軟體版"
$lblTitle.Font = New-Object System.Drawing.Font("Microsoft JhengHei", 16, [System.Drawing.FontStyle]::Bold)
$lblTitle.ForeColor = [System.Drawing.Color]::FromArgb(0, 229, 255)
$lblTitle.Location = New-Object System.Drawing.Point(30, 20)
$lblTitle.Size = New-Object System.Drawing.Size(540, 32)
$form.Controls.Add($lblTitle)

# Subtitle
$lblSubtitle = New-Object System.Windows.Forms.Label
$lblSubtitle.Text = "突破瀏覽器限制 · 高效能獨立客戶端 · 全版本相容支援"
$lblSubtitle.Font = New-Object System.Drawing.Font("Microsoft JhengHei", 9.5, [System.Drawing.FontStyle]::Regular)
$lblSubtitle.ForeColor = [System.Drawing.Color]::FromArgb(160, 180, 205)
$lblSubtitle.Location = New-Object System.Drawing.Point(32, 54)
$lblSubtitle.Size = New-Object System.Drawing.Size(540, 22)
$form.Controls.Add($lblSubtitle)

# Version Group
$grpVersion = New-Object System.Windows.Forms.GroupBox
$grpVersion.Text = " 選擇要安裝的軟體版本 "
$grpVersion.Font = New-Object System.Drawing.Font("Microsoft JhengHei", 9.5, [System.Drawing.FontStyle]::Bold)
$grpVersion.ForeColor = [System.Drawing.Color]::FromArgb(0, 229, 255)
$grpVersion.Location = New-Object System.Drawing.Point(30, 85)
$grpVersion.Size = New-Object System.Drawing.Size(544, 160)

$rbWin10 = New-Object System.Windows.Forms.RadioButton
$rbWin10.Text = "🌟 Windows 10 / 11 旗艦版 (v1.46) [推薦 Win10/11 使用者]"
$rbWin10.Font = New-Object System.Drawing.Font("Microsoft JhengHei", 9.5, [System.Drawing.FontStyle]::Bold)
$rbWin10.ForeColor = [System.Drawing.Color]::White
$rbWin10.Location = New-Object System.Drawing.Point(16, 26)
$rbWin10.Size = New-Object System.Drawing.Size(510, 24)
$grpVersion.Controls.Add($rbWin10)

$lblWin10Desc = New-Object System.Windows.Forms.Label
$lblWin10Desc.Text = "原生 64 位元高性能架構、極速渲染、全域快捷鍵穿透、多螢幕流暢切換。"
$lblWin10Desc.Font = New-Object System.Drawing.Font("Microsoft JhengHei", 8.5, [System.Drawing.FontStyle]::Regular)
$lblWin10Desc.ForeColor = [System.Drawing.Color]::FromArgb(170, 185, 205)
$lblWin10Desc.Location = New-Object System.Drawing.Point(38, 52)
$lblWin10Desc.Size = New-Object System.Drawing.Size(490, 20)
$grpVersion.Controls.Add($lblWin10Desc)

$rbWin7 = New-Object System.Windows.Forms.RadioButton
$rbWin7.Text = "🛡️ Windows 7 / 8 / 10 / 11 全相容版 (v1.47) [推薦 Win7/8 使用者]"
$rbWin7.Font = New-Object System.Drawing.Font("Microsoft JhengHei", 9.5, [System.Drawing.FontStyle]::Bold)
$rbWin7.ForeColor = [System.Drawing.Color]::White
$rbWin7.Location = New-Object System.Drawing.Point(16, 78)
$rbWin7.Size = New-Object System.Drawing.Size(510, 24)
$grpVersion.Controls.Add($rbWin7)

$lblWin7Desc = New-Object System.Windows.Forms.Label
$lblWin7Desc.Text = "深度相容舊版系統 API、自動檢測 .NET / WebView2 執行環境、長效穩定。"
$lblWin7Desc.Font = New-Object System.Drawing.Font("Microsoft JhengHei", 8.5, [System.Drawing.FontStyle]::Regular)
$lblWin7Desc.ForeColor = [System.Drawing.Color]::FromArgb(170, 185, 205)
$lblWin7Desc.Location = New-Object System.Drawing.Point(38, 104)
$lblWin7Desc.Size = New-Object System.Drawing.Size(490, 20)
$grpVersion.Controls.Add($lblWin7Desc)

$lblDetectHint = New-Object System.Windows.Forms.Label
$lblDetectHint.Font = New-Object System.Drawing.Font("Microsoft JhengHei", 8.5, [System.Drawing.FontStyle]::Regular)
$lblDetectHint.Location = New-Object System.Drawing.Point(16, 130)
$lblDetectHint.Size = New-Object System.Drawing.Size(510, 20)
$grpVersion.Controls.Add($lblDetectHint)

# Detect OS
$os = [Environment]::OSVersion
if ($os.Version.Major -eq 6) {
    $rbWin7.Checked = $true
    $lblDetectHint.Text = "💡 系統檢測：偵測到 Windows 7/8 系統，已自動選取「全相容版 (v1.47)」！"
    $lblDetectHint.ForeColor = [System.Drawing.Color]::FromArgb(255, 200, 80)
} else {
    $rbWin10.Checked = $true
    $lblDetectHint.Text = "💡 系統檢測：偵測到 Windows 10/11 系統，已自動選取「旗艦版 (v1.46)」！"
    $lblDetectHint.ForeColor = [System.Drawing.Color]::FromArgb(100, 230, 150)
}
$form.Controls.Add($grpVersion)

# Destination Path
$lblPathTitle = New-Object System.Windows.Forms.Label
$lblPathTitle.Text = "安裝目的地資料夾："
$lblPathTitle.Font = New-Object System.Drawing.Font("Microsoft JhengHei", 9.5, [System.Drawing.FontStyle]::Bold)
$lblPathTitle.ForeColor = [System.Drawing.Color]::White
$lblPathTitle.Location = New-Object System.Drawing.Point(30, 256)
$lblPathTitle.Size = New-Object System.Drawing.Size(540, 20)
$form.Controls.Add($lblPathTitle)

$defaultPath = Join-Path $env:USERPROFILE "GoogleRemoteDesktop"
$txtPath = New-Object System.Windows.Forms.TextBox
$txtPath.Text = $defaultPath
$txtPath.Location = New-Object System.Drawing.Point(32, 280)
$txtPath.Size = New-Object System.Drawing.Size(440, 26)
$txtPath.BackColor = [System.Drawing.Color]::FromArgb(32, 42, 60)
$txtPath.ForeColor = [System.Drawing.Color]::White
$txtPath.BorderStyle = "FixedSingle"
$form.Controls.Add($txtPath)

$btnBrowse = New-Object System.Windows.Forms.Button
$btnBrowse.Text = "瀏覽..."
$btnBrowse.Location = New-Object System.Drawing.Point(480, 278)
$btnBrowse.Size = New-Object System.Drawing.Size(94, 29)
$btnBrowse.BackColor = [System.Drawing.Color]::FromArgb(45, 58, 80)
$btnBrowse.ForeColor = [System.Drawing.Color]::White
$btnBrowse.FlatStyle = "Flat"
$btnBrowse.Cursor = [System.Windows.Forms.Cursors]::Hand
$btnBrowse.Add_Click({
    $fbd = New-Object System.Windows.Forms.FolderBrowserDialog
    $fbd.Description = "請選擇安裝的目的地上層目錄："
    if ($fbd.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK) {
        $p = $fbd.SelectedPath.TrimEnd('\', '/')
        if (-not $p.EndsWith("GoogleRemoteDesktop", [System.StringComparison]::OrdinalIgnoreCase)) {
            $txtPath.Text = Join-Path $p "GoogleRemoteDesktop"
        } else {
            $txtPath.Text = $p
        }
    }
})
$form.Controls.Add($btnBrowse)

# Options
$chkShortcut = New-Object System.Windows.Forms.CheckBox
$chkShortcut.Text = "在桌面建立「Google 遠端桌面」捷徑"
$chkShortcut.Checked = $true
$chkShortcut.Location = New-Object System.Drawing.Point(32, 320)
$chkShortcut.Size = New-Object System.Drawing.Size(270, 24)
$form.Controls.Add($chkShortcut)

$chkWebView2 = New-Object System.Windows.Forms.CheckBox
$chkWebView2.Text = "自動檢測並安裝 WebView2 執行階段 (Win7/8 建議)"
$chkWebView2.Checked = $true
$chkWebView2.Location = New-Object System.Drawing.Point(310, 320)
$chkWebView2.Size = New-Object System.Drawing.Size(280, 24)
$form.Controls.Add($chkWebView2)

# Progress Bar & Status
$lblStatus = New-Object System.Windows.Forms.Label
$lblStatus.Text = "準備就緒，請點擊「🚀 開始安裝」。"
$lblStatus.ForeColor = [System.Drawing.Color]::FromArgb(0, 229, 255)
$lblStatus.Location = New-Object System.Drawing.Point(30, 360)
$lblStatus.Size = New-Object System.Drawing.Size(544, 22)
$form.Controls.Add($lblStatus)

$progressBar = New-Object System.Windows.Forms.ProgressBar
$progressBar.Location = New-Object System.Drawing.Point(32, 388)
$progressBar.Size = New-Object System.Drawing.Size(542, 22)
$progressBar.Minimum = 0
$progressBar.Maximum = 100
$progressBar.Value = 0
$form.Controls.Add($progressBar)

# Action Buttons
$btnInstall = New-Object System.Windows.Forms.Button
$btnInstall.Text = "🚀 開始安裝"
$btnInstall.Font = New-Object System.Drawing.Font("Microsoft JhengHei", 10.5, [System.Drawing.FontStyle]::Bold)
$btnInstall.Location = New-Object System.Drawing.Point(300, 440)
$btnInstall.Size = New-Object System.Drawing.Size(150, 42)
$btnInstall.BackColor = [System.Drawing.Color]::FromArgb(0, 200, 230)
$btnInstall.ForeColor = [System.Drawing.Color]::Black
$btnInstall.FlatStyle = "Flat"
$btnInstall.Cursor = [System.Windows.Forms.Cursors]::Hand
$form.Controls.Add($btnInstall)

$btnCancel = New-Object System.Windows.Forms.Button
$btnCancel.Text = "取消"
$btnCancel.Font = New-Object System.Drawing.Font("Microsoft JhengHei", 10, [System.Drawing.FontStyle]::Regular)
$btnCancel.Location = New-Object System.Drawing.Point(464, 440)
$btnCancel.Size = New-Object System.Drawing.Size(110, 42)
$btnCancel.BackColor = [System.Drawing.Color]::FromArgb(45, 52, 68)
$btnCancel.ForeColor = [System.Drawing.Color]::FromArgb(200, 210, 225)
$btnCancel.FlatStyle = "Flat"
$btnCancel.Cursor = [System.Windows.Forms.Cursors]::Hand
$btnCancel.Add_Click({ $form.Close() })
$form.Controls.Add($btnCancel)

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
if ([string]::IsNullOrEmpty($scriptDir)) { $scriptDir = (Get-Location).Path }
$isFinished = $false
$targetExe = "Google遠端桌面.exe"

$btnInstall.Add_Click({
    if ($isFinished) {
        $runPath = Join-Path $txtPath.Text $targetExe
        if (Test-Path $runPath) {
            Start-Process $runPath -WorkingDirectory $txtPath.Text
        }
        $form.Close()
        return
    }

    $dest = $txtPath.Text.Trim()
    if ([string]::IsNullOrEmpty($dest)) {
        [System.Windows.Forms.MessageBox]::Show("請輸入有效的安裝路徑！", "提示", [System.Windows.Forms.MessageBoxButtons]::OK, [System.Windows.Forms.MessageBoxIcon]::Warning)
        return
    }

    $btnInstall.Enabled = $false
    $btnCancel.Enabled = $false
    $btnBrowse.Enabled = $false
    $txtPath.ReadOnly = $true
    $grpVersion.Enabled = $false
    $chkShortcut.Enabled = $false
    $chkWebView2.Enabled = $false

    try {
        if (-not (Test-Path $dest)) {
            New-Item -ItemType Directory -Force -Path $dest | Out-Null
        }

        $useWin10 = $rbWin10.Checked
        $fileName = if ($useWin10) { "GoogleRemoteDesktop_v1.46_Win10_11.exe" } else { "GoogleRemoteDesktop_v1.47_Win7_8_10_11.exe" }
        $finalExePath = Join-Path $dest $targetExe

        $lblStatus.Text = "準備部署主程式檔案..."
        $progressBar.Value = 15
        $form.Refresh()

        $local1 = Join-Path $scriptDir $fileName
        $local2 = Join-Path (Join-Path $scriptDir "file") $fileName

        if (Test-Path $local1) {
            $lblStatus.Text = "正在從本機複製主程式..."
            Copy-Item $local1 $finalExePath -Force
        } elseif (Test-Path $local2) {
            $lblStatus.Text = "正在從本機 file/ 目錄複製主程式..."
            Copy-Item $local2 $finalExePath -Force
        } else {
            $lblStatus.Text = "正在從伺服器下載主程式..."
            $form.Refresh()
            [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12 -bor [System.Net.SecurityProtocolType]::Tls13
            $wc = New-Object System.Net.WebClient
            $wc.Headers.Add("User-Agent", "PandaPanda-RemoteDesktop-Installer")
            $url = "https://raw.githubusercontent.com/PandaPanda6666/PandaPanda6666.github.io/main/ChromeRemoteDesktop/file/" + $fileName
            $wc.DownloadFile($url, $finalExePath)
        }

        $progressBar.Value = 70
        $form.Refresh()

        # Copy icon if present
        $ico1 = Join-Path (Join-Path $scriptDir "file") "app.ico"
        $icoDest = Join-Path $dest "app.ico"
        if (Test-Path $ico1) {
            Copy-Item $ico1 $icoDest -Force
        }

        # Check WebView2
        if (-not $useWin10 -and $chkWebView2.Checked) {
            $lblStatus.Text = "正在檢查 WebView2 執行階段..."
            $wv2Key = "HKLM:\SOFTWARE\WOW6432Node\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}"
            if (-not (Test-Path $wv2Key)) {
                $lblStatus.Text = "正在安裝微軟官方 WebView2 核心組件..."
                $form.Refresh()
                $wv2Src = Join-Path (Join-Path $scriptDir "file") "MicrosoftEdgeWebview2Setup.exe"
                $wv2Dest = Join-Path $dest "MicrosoftEdgeWebview2Setup.exe"
                if (Test-Path $wv2Src) {
                    Copy-Item $wv2Src $wv2Dest -Force
                } else {
                    $wc2 = New-Object System.Net.WebClient
                    $wc2.DownloadFile("https://raw.githubusercontent.com/PandaPanda6666/PandaPanda6666.github.io/main/ChromeRemoteDesktop/file/MicrosoftEdgeWebview2Setup.exe", $wv2Dest)
                }
                Start-Process $wv2Dest -ArgumentList "/silent /install" -Wait
            }
        }

        # Desktop shortcut
        if ($chkShortcut.Checked) {
            $lblStatus.Text = "正在建立桌面捷徑..."
            $progressBar.Value = 90
            $form.Refresh()

            $desktop = [Environment]::GetFolderPath('Desktop')
            $lnkPath = Join-Path $desktop "Google 遠端桌面.lnk"
            $wsh = New-Object -ComObject WScript.Shell
            $sc = $wsh.CreateShortcut($lnkPath)
            $sc.TargetPath = $finalExePath
            $sc.WorkingDirectory = $dest
            $sc.Description = "Google 遠端桌面 軟體版"
            if (Test-Path $icoDest) {
                $sc.IconLocation = $icoDest
            } else {
                $sc.IconLocation = "$finalExePath,0"
            }
            $sc.Save()
        }

        $progressBar.Value = 100
        $lblStatus.ForeColor = [System.Drawing.Color]::FromArgb(100, 230, 150)
        $lblStatus.Text = "🎉 安裝成功！已在桌面建立「Google 遠端桌面」捷徑！"
        
        $btnInstall.Text = "🚀 立即啟動"
        $btnInstall.BackColor = [System.Drawing.Color]::FromArgb(76, 175, 80)
        $btnInstall.ForeColor = [System.Drawing.Color]::White
        $btnInstall.Enabled = $true

        $btnCancel.Text = "完成"
        $btnCancel.Enabled = $true
        $isFinished = $true
    } catch {
        $lblStatus.ForeColor = [System.Drawing.Color]::FromArgb(255, 90, 90)
        $lblStatus.Text = "安裝過程發生錯誤: " + $_.Exception.Message
        $btnInstall.Enabled = $true
        $btnInstall.Text = "重試安裝"
        $btnCancel.Enabled = $true
    }
})

$form.ShowDialog() | Out-Null
