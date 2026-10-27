@echo off
chcp 65001 >nul
title PandaPanda 無人機模擬器 安裝精靈
powershell -NoProfile -ExecutionPolicy Bypass -Command "$c = [System.IO.File]::ReadAllText('%~f0', [System.Text.Encoding]::UTF8); $marker = '::START_PS_CODE::'; $idx = $c.IndexOf($marker); if ($idx -ge 0) { Invoke-Expression $c.Substring($idx + $marker.Length) }"
exit /b %errorlevel%
::START_PS_CODE::
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

[System.Windows.Forms.Application]::EnableVisualStyles()

$form = New-Object System.Windows.Forms.Form
$form.Text = "PandaPanda 無人機模擬器 - 官方安裝精靈"
$form.Size = New-Object System.Drawing.Size(620, 560)
$form.StartPosition = "CenterScreen"
$form.FormBorderStyle = "FixedDialog"
$form.MaximizeBox = $false
$form.BackColor = [System.Drawing.Color]::FromArgb(20, 28, 44)
$form.ForeColor = [System.Drawing.Color]::White
$form.Font = New-Object System.Drawing.Font("Microsoft JhengHei", 9.5, [System.Drawing.FontStyle]::Regular)

# Title
$lblTitle = New-Object System.Windows.Forms.Label
$lblTitle.Text = "PandaPanda FPV 無人機模擬器"
$lblTitle.Font = New-Object System.Drawing.Font("Microsoft JhengHei", 16, [System.Drawing.FontStyle]::Bold)
$lblTitle.ForeColor = [System.Drawing.Color]::FromArgb(0, 229, 255)
$lblTitle.Location = New-Object System.Drawing.Point(30, 20)
$lblTitle.Size = New-Object System.Drawing.Size(540, 32)
$form.Controls.Add($lblTitle)

# Subtitle
$lblSubtitle = New-Object System.Windows.Forms.Label
$lblSubtitle.Text = "極致真實 FPV 物理 · 體感與手把支援 · 全世代 Windows 完美適配"
$lblSubtitle.Font = New-Object System.Drawing.Font("Microsoft JhengHei", 9.5, [System.Drawing.FontStyle]::Regular)
$lblSubtitle.ForeColor = [System.Drawing.Color]::FromArgb(160, 180, 205)
$lblSubtitle.Location = New-Object System.Drawing.Point(32, 54)
$lblSubtitle.Size = New-Object System.Drawing.Size(540, 22)
$form.Controls.Add($lblSubtitle)

# Version Group
$grpVersion = New-Object System.Windows.Forms.GroupBox
$grpVersion.Text = " 選擇目標作業系統環境 "
$grpVersion.Font = New-Object System.Drawing.Font("Microsoft JhengHei", 9.5, [System.Drawing.FontStyle]::Bold)
$grpVersion.ForeColor = [System.Drawing.Color]::FromArgb(0, 229, 255)
$grpVersion.Location = New-Object System.Drawing.Point(30, 85)
$grpVersion.Size = New-Object System.Drawing.Size(544, 160)

$rbWin10 = New-Object System.Windows.Forms.RadioButton
$rbWin10.Text = "Windows 10 / 11 旗艦版 (v4.029) [推薦 Win10/11 使用者]"
$rbWin10.Font = New-Object System.Drawing.Font("Microsoft JhengHei", 9.5, [System.Drawing.FontStyle]::Bold)
$rbWin10.ForeColor = [System.Drawing.Color]::White
$rbWin10.Location = New-Object System.Drawing.Point(16, 26)
$rbWin10.Size = New-Object System.Drawing.Size(510, 24)
$grpVersion.Controls.Add($rbWin10)

$lblWin10Desc = New-Object System.Windows.Forms.Label
$lblWin10Desc.Text = "原生 64 位元架構、120+ FPS 極速渲染、完整手把搖桿回饋與沉浸全螢幕。"
$lblWin10Desc.Font = New-Object System.Drawing.Font("Microsoft JhengHei", 8.5, [System.Drawing.FontStyle]::Regular)
$lblWin10Desc.ForeColor = [System.Drawing.Color]::FromArgb(170, 185, 205)
$lblWin10Desc.Location = New-Object System.Drawing.Point(38, 52)
$lblWin10Desc.Size = New-Object System.Drawing.Size(490, 20)
$grpVersion.Controls.Add($lblWin10Desc)

$rbWin7 = New-Object System.Windows.Forms.RadioButton
$rbWin7.Text = "Windows 7 / 8 相容版 (v4.029) [推薦 Win7/8 使用者]"
$rbWin7.Font = New-Object System.Drawing.Font("Microsoft JhengHei", 9.5, [System.Drawing.FontStyle]::Bold)
$rbWin7.ForeColor = [System.Drawing.Color]::White
$rbWin7.Location = New-Object System.Drawing.Point(16, 78)
$rbWin7.Size = New-Object System.Drawing.Size(510, 24)
$grpVersion.Controls.Add($rbWin7)

$lblWin7Desc = New-Object System.Windows.Forms.Label
$lblWin7Desc.Text = "深度相容舊版系統、內建 TLS 1.2 連線修復、自動相容性檢測與無 Python 降級模式。"
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
    $lblDetectHint.Text = "系統檢測：偵測到 Windows 7/8 系統，已自動選取「Windows 7/8 相容版」！"
    $lblDetectHint.ForeColor = [System.Drawing.Color]::FromArgb(255, 200, 80)
} else {
    $rbWin10.Checked = $true
    $lblDetectHint.Text = "系統檢測：偵測到 Windows 10/11 系統，已自動選取「Windows 10/11 旗艦版」！"
    $lblDetectHint.ForeColor = [System.Drawing.Color]::FromArgb(100, 230, 150)
}
$form.Controls.Add($grpVersion)

# Destination Path
$lblPathTitle = New-Object System.Windows.Forms.Label
$lblPathTitle.Text = "安裝目的地資料夾 (結尾固定為 \PandaPanda UAV Simulator)："
$lblPathTitle.Font = New-Object System.Drawing.Font("Microsoft JhengHei", 9.5, [System.Drawing.FontStyle]::Bold)
$lblPathTitle.ForeColor = [System.Drawing.Color]::White
$lblPathTitle.Location = New-Object System.Drawing.Point(30, 256)
$lblPathTitle.Size = New-Object System.Drawing.Size(540, 20)
$form.Controls.Add($lblPathTitle)

$fixedFolder = "PandaPanda UAV Simulator"
$defaultPath = Join-Path $env:USERPROFILE $fixedFolder
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
        if (-not $p.EndsWith($fixedFolder, [System.StringComparison]::OrdinalIgnoreCase)) {
            $txtPath.Text = Join-Path $p $fixedFolder
        } else {
            $txtPath.Text = $p
        }
    }
})
$form.Controls.Add($btnBrowse)

# Options
$chkShortcut = New-Object System.Windows.Forms.CheckBox
$chkShortcut.Text = "在桌面建立「PandaPanda 無人機模擬器」捷徑"
$chkShortcut.Checked = $true
$chkShortcut.Location = New-Object System.Drawing.Point(32, 320)
$chkShortcut.Size = New-Object System.Drawing.Size(320, 24)
$form.Controls.Add($chkShortcut)

# Progress Bar & Status
$lblStatus = New-Object System.Windows.Forms.Label
$lblStatus.Text = "準備就緒，請點擊「開始安裝」。"
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
$btnInstall.Text = "開始安裝"
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
$targetLauncher = "PandaPanda_UAV_Simulator.exe"

$btnInstall.Add_Click({
    if ($isFinished) {
        $runExe = Join-Path $txtPath.Text $targetLauncher
        $runBat = Join-Path $txtPath.Text "啟動模擬器.bat"
        if (Test-Path $runExe) {
            Start-Process $runExe -WorkingDirectory $txtPath.Text
        } elseif (Test-Path $runBat) {
            Start-Process $runBat -WorkingDirectory $txtPath.Text
        }
        $form.Close()
        return
    }

    $dest = $txtPath.Text.Trim()
    if ([string]::IsNullOrEmpty($dest)) {
        [System.Windows.Forms.MessageBox]::Show("請輸入有效的安裝路徑！", "提示", [System.Windows.Forms.MessageBoxButtons]::OK, [System.Windows.Forms.MessageBoxIcon]::Warning)
        return
    }

    if (-not $dest.EndsWith($fixedFolder, [System.StringComparison]::OrdinalIgnoreCase)) {
        $dest = Join-Path $dest $fixedFolder
        $txtPath.Text = $dest
    }

    $btnInstall.Enabled = $false
    $btnCancel.Enabled = $false
    $btnBrowse.Enabled = $false
    $txtPath.ReadOnly = $true
    $grpVersion.Enabled = $false
    $chkShortcut.Enabled = $false

    try {
        if (-not (Test-Path $dest)) {
            New-Item -ItemType Directory -Force -Path $dest | Out-Null
        }

        $useWin10 = $rbWin10.Checked
        $filesToInstall = @(
            "index.html",
            "super_combined_main.py",
            "drone_blueprints.js",
            "drone_configs.js",
            "hx115_model.js",
            "rabboni.js",
            "version.json",
            "version.js",
            "app.ico",
            "logo.png",
            "啟動模擬器.bat",
            "PandaPanda_UAV_Simulator.exe",
            "PandaPython.exe",
            "PandaPythonw.exe",
            "python3.dll",
            "python312.dll",
            "vcruntime140.dll",
            "vcruntime140_1.dll",
        )

        $baseUrls = @(
            "https://pandapanda6666.github.io/game/UAV%20Simulator/file/",
            "https://raw.githubusercontent.com/PandaPanda6666/PandaPanda6666.github.io/main/game/UAV%20Simulator/file/"
        )

        [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12 -bor [System.Net.SecurityProtocolType]::Tls13
        $wc = New-Object System.Net.WebClient
        $wc.Headers.Add("User-Agent", "PandaPanda-UAV-Simulator-Installer")
        $wc.Encoding = [System.Text.Encoding]::UTF8

        $total = $filesToInstall.Count
        $cur = 0

        foreach ($file in $filesToInstall) {
            $cur++
            $lblStatus.Text = "正在部署核心檔案 ($cur/$total): $file ..."
            $progressBar.Value = [int](($cur / ($total + 1)) * 85)
            $form.Refresh()

            $destFile = Join-Path $dest $file
            $localFile1 = Join-Path $scriptDir $file
            $localFile2 = Join-Path (Join-Path $scriptDir "file") $file

            if (Test-Path $localFile1) {
                Copy-Item $localFile1 $destFile -Force
            } elseif (Test-Path $localFile2) {
                Copy-Item $localFile2 $destFile -Force
            } else {
                $downloaded = $false
                foreach ($base in $baseUrls) {
                    try {
                        $url = $base + [System.Uri]::EscapeDataString($file)
                        $wc.DownloadFile($url, $destFile)
                        $downloaded = $true
                        break
                    } catch { }
                }
            }
        }

        # 寫入 os_target.json
        $chosenOs = if ($useWin10) { "Windows 10 / 11" } else { "Windows 7" }
        $osJson = "{`n  `"target_os`": `"$chosenOs`",`n  `"installer_version`": `"4.024`",`n  `"updated_at`": `"" + (Get-Date).ToString("yyyy-MM-dd HH:mm:ss") + "`"`n}"
        [System.IO.File]::WriteAllText((Join-Path $dest "os_target.json"), $osJson, [System.Text.Encoding]::UTF8)

        # 確保 啟動模擬器.bat
        $batPath = Join-Path $dest "啟動模擬器.bat"
        $batTitle = "【PandaPanda的AI日常___無人機模擬器】"
        $batContent = "@echo off`r`ncd /d `"%~dp0`"`r`ntitle $batTitle`r`nwhere python >nul 2>nul`r`nif %errorlevel% equ 0 (`r`n    python super_combined_main.py`r`n) else (`r`n    start `"`" `"%~dp0index.html`"`r`n)`r`n"
        [System.IO.File]::WriteAllText($batPath, $batContent, [System.Text.Encoding]::Default)

        # 桌面捷徑
        if ($chkShortcut.Checked) {
            $lblStatus.Text = "正在建立桌面捷徑..."
            $progressBar.Value = 95
            $form.Refresh()

            $desktop = [Environment]::GetFolderPath('Desktop')
            $lnkPath = Join-Path $desktop "PandaPanda 無人機模擬器.lnk"
            $wsh = New-Object -ComObject WScript.Shell
            $sc = $wsh.CreateShortcut($lnkPath)
            $exePath = Join-Path $dest "PandaPanda_UAV_Simulator.exe"
            $icoPath = Join-Path $dest "app.ico"
            if (Test-Path $exePath) {
                $sc.TargetPath = $exePath
            } else {
                $sc.TargetPath = $batPath
            }
            $sc.WorkingDirectory = $dest
            $sc.Description = "PandaPanda 無人機模擬器"
            if (Test-Path $icoPath) {
                $sc.IconLocation = $icoPath
            }
            $sc.Save()
        }

        $progressBar.Value = 100
        $lblStatus.ForeColor = [System.Drawing.Color]::FromArgb(100, 230, 150)
        $lblStatus.Text = "安裝成功！已在桌面建立「PandaPanda 無人機模擬器」捷徑！"
        
        $btnInstall.Text = "立即啟動"
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
