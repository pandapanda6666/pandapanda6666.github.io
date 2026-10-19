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
$form.Text = "PandaPanda 無人機模擬器 - 安裝精靈"
$form.Size = New-Object System.Drawing.Size(580, 440)
$form.StartPosition = "CenterScreen"
$form.FormBorderStyle = "FixedDialog"
$form.MaximizeBox = $false
$form.BackColor = [System.Drawing.Color]::FromArgb(26, 29, 36)
$form.ForeColor = [System.Drawing.Color]::White

$fontTitle = New-Object System.Drawing.Font("Microsoft JhengHei", 16, [System.Drawing.FontStyle]::Bold)
$fontSub = New-Object System.Drawing.Font("Microsoft JhengHei", 10, [System.Drawing.FontStyle]::Regular)
$fontBold = New-Object System.Drawing.Font("Microsoft JhengHei", 10, [System.Drawing.FontStyle]::Bold)

# Header
$lblTitle = New-Object System.Windows.Forms.Label
$lblTitle.Text = "PandaPanda FPV 無人機模擬器"
$lblTitle.Font = $fontTitle
$lblTitle.ForeColor = [System.Drawing.Color]::FromArgb(0, 229, 255)
$lblTitle.Location = New-Object System.Drawing.Point(30, 20)
$lblTitle.Size = New-Object System.Drawing.Size(500, 32)
$form.Controls.Add($lblTitle)

$lblDesc = New-Object System.Windows.Forms.Label
$lblDesc.Text = "本安裝精靈將自動從 GitHub 抓取最新檔案並安裝至您的電腦，且在桌面建立捷徑。"
$lblDesc.Font = $fontSub
$lblDesc.ForeColor = [System.Drawing.Color]::FromArgb(180, 190, 200)
$lblDesc.Location = New-Object System.Drawing.Point(32, 58)
$lblDesc.Size = New-Object System.Drawing.Size(500, 40)
$form.Controls.Add($lblDesc)

# Path Selection Group
$lblPathTitle = New-Object System.Windows.Forms.Label
$lblPathTitle.Text = "安裝目的地資料夾 (結尾固定為 \PandaPanda UAV Simulator)："
$lblPathTitle.Font = $fontBold
$lblPathTitle.Location = New-Object System.Drawing.Point(32, 115)
$lblPathTitle.Size = New-Object System.Drawing.Size(500, 22)
$form.Controls.Add($lblPathTitle)

# Default path is $env:USERPROFILE\PandaPanda UAV Simulator
$defaultParent = $env:USERPROFILE
$fixedFolderName = "PandaPanda UAV Simulator"
$txtPath = New-Object System.Windows.Forms.TextBox
$txtPath.Font = $fontSub
$txtPath.Text = Join-Path $defaultParent $fixedFolderName
$txtPath.Location = New-Object System.Drawing.Point(32, 142)
$txtPath.Size = New-Object System.Drawing.Size(400, 26)
$txtPath.BackColor = [System.Drawing.Color]::FromArgb(38, 42, 52)
$txtPath.ForeColor = [System.Drawing.Color]::White
$txtPath.BorderStyle = "FixedSingle"
$form.Controls.Add($txtPath)

$btnBrowse = New-Object System.Windows.Forms.Button
$btnBrowse.Text = "瀏覽..."
$btnBrowse.Font = $fontSub
$btnBrowse.Location = New-Object System.Drawing.Point(442, 140)
$btnBrowse.Size = New-Object System.Drawing.Size(90, 30)
$btnBrowse.BackColor = [System.Drawing.Color]::FromArgb(50, 56, 70)
$btnBrowse.ForeColor = [System.Drawing.Color]::White
$btnBrowse.FlatStyle = "Flat"
$btnBrowse.Cursor = [System.Windows.Forms.Cursors]::Hand
$form.Controls.Add($btnBrowse)

$btnBrowse.Add_Click({
    $fbd = New-Object System.Windows.Forms.FolderBrowserDialog
    $fbd.Description = "請選擇安裝的上層目錄（將自動在此目錄下建立 \PandaPanda UAV Simulator）："
    $fbd.SelectedPath = $defaultParent
    if ($fbd.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK) {
        $selected = $fbd.SelectedPath.TrimEnd('\', '/')
        if (-not $selected.EndsWith($fixedFolderName, [System.StringComparison]::OrdinalIgnoreCase)) {
            $txtPath.Text = Join-Path $selected $fixedFolderName
        } else {
            $txtPath.Text = $selected
        }
    }
})

# Progress & Status
$lblStatus = New-Object System.Windows.Forms.Label
$lblStatus.Text = "準備就緒，請點擊「開始安裝」。"
$lblStatus.Font = $fontSub
$lblStatus.ForeColor = [System.Drawing.Color]::FromArgb(0, 229, 255)
$lblStatus.Location = New-Object System.Drawing.Point(32, 210)
$lblStatus.Size = New-Object System.Drawing.Size(500, 25)
$form.Controls.Add($lblStatus)

$progressBar = New-Object System.Windows.Forms.ProgressBar
$progressBar.Location = New-Object System.Drawing.Point(32, 240)
$progressBar.Size = New-Object System.Drawing.Size(500, 20)
$progressBar.Minimum = 0
$progressBar.Maximum = 100
$progressBar.Value = 0
$form.Controls.Add($progressBar)

# Action Buttons
$btnInstall = New-Object System.Windows.Forms.Button
$btnInstall.Text = "🚀 開始安裝"
$btnInstall.Font = $fontBold
$btnInstall.Location = New-Object System.Drawing.Point(260, 320)
$btnInstall.Size = New-Object System.Drawing.Size(140, 42)
$btnInstall.BackColor = [System.Drawing.Color]::FromArgb(0, 200, 230)
$btnInstall.ForeColor = [System.Drawing.Color]::Black
$btnInstall.FlatStyle = "Flat"
$btnInstall.Cursor = [System.Windows.Forms.Cursors]::Hand
$form.Controls.Add($btnInstall)

$btnCancel = New-Object System.Windows.Forms.Button
$btnCancel.Text = "取消"
$btnCancel.Font = $fontSub
$btnCancel.Location = New-Object System.Drawing.Point(415, 320)
$btnCancel.Size = New-Object System.Drawing.Size(115, 42)
$btnCancel.BackColor = [System.Drawing.Color]::FromArgb(45, 50, 60)
$btnCancel.ForeColor = [System.Drawing.Color]::FromArgb(200, 200, 200)
$btnCancel.FlatStyle = "Flat"
$btnCancel.Cursor = [System.Windows.Forms.Cursors]::Hand
$form.Controls.Add($btnCancel)

$btnCancel.Add_Click({
    $form.Close()
})

$installedTargetDir = ""

$btnInstall.Add_Click({
    if ($btnInstall.Text -like "*立即啟動*") {
        if (Test-Path (Join-Path $installedTargetDir "啟動模擬器.bat")) {
            Start-Process (Join-Path $installedTargetDir "啟動模擬器.bat")
        } elseif (Test-Path (Join-Path $installedTargetDir "index.html")) {
            Start-Process (Join-Path $installedTargetDir "index.html")
        }
        $form.Close()
        return
    }

    $rawPath = $txtPath.Text.Trim().TrimEnd('\', '/')
    if ([string]::IsNullOrWhiteSpace($rawPath)) {
        [System.Windows.Forms.MessageBox]::Show("請輸入有效的安裝路徑！", "提示", [System.Windows.Forms.MessageBoxButtons]::OK, [System.Windows.Forms.MessageBoxIcon]::Warning)
        return
    }

    # 強制確保結尾一定是 \PandaPanda UAV Simulator
    if (-not $rawPath.EndsWith($fixedFolderName, [System.StringComparison]::OrdinalIgnoreCase)) {
        $rawPath = Join-Path $rawPath $fixedFolderName
        $txtPath.Text = $rawPath
    }

    $installedTargetDir = $rawPath
    $btnInstall.Enabled = $false
    $btnBrowse.Enabled = $false
    $txtPath.ReadOnly = $true

    $baseUrl = "https://raw.githubusercontent.com/PandaPanda6666/PandaPanda6666.github.io/main/game/UAV%20Simulator/file/"
    $files = @(
        "index.html",
        "super_combined_main.py",
        "drone_blueprints.js",
        "drone_configs.js",
        "hx115_model.js",
        "rabboni.js",
        "version.json",
        "啟動模擬器.bat"
    )

    try {
        if (-not (Test-Path $rawPath)) {
            New-Item -ItemType Directory -Force -Path $rawPath | Out-Null
        }

        [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12 -bor [System.Net.SecurityProtocolType]::Tls13
        $webClient = New-Object System.Net.WebClient
        $webClient.Headers.Add("User-Agent", "Mozilla/5.0")
        $webClient.Encoding = [System.Text.Encoding]::UTF8

        $total = $files.Count
        $currentIdx = 0

        foreach ($file in $files) {
            $currentIdx++
            $lblStatus.Text = "正在下載 ($currentIdx/$total): $file ..."
            $progressBar.Value = [int](($currentIdx / ($total + 1)) * 100)
            $form.Refresh()

            $targetFile = Join-Path $rawPath $file
            $fileUrl = $baseUrl + [System.Uri]::EscapeDataString($file)
            try {
                $webClient.DownloadFile($fileUrl, $targetFile)
            } catch {
                # 備用嘗試
            }
        }

        # 確保「啟動模擬器.bat」存在
        $launcherBat = Join-Path $rawPath "啟動模擬器.bat"
        if (-not (Test-Path $launcherBat)) {
            $batContent = "@echo off`r`nchcp 65001 >nul`r`ncd /d `"%~dp0`"`r`ntitle PandaPanda 無人機模擬器`r`nwhere python >nul 2>nul`r`nif %errorlevel% equ 0 (`r`n    python super_combined_main.py`r`n) else (`r`n    start `"`" `"%~dp0index.html`"`r`n)"
            [System.IO.File]::WriteAllText($launcherBat, $batContent, [System.Text.Encoding]::UTF8)
        }

        # 在桌面建立捷徑
        $lblStatus.Text = "正在建立桌面捷徑..."
        $progressBar.Value = 95
        $form.Refresh()

        $desktop = [Environment]::GetFolderPath('Desktop')
        $shortcutPath = Join-Path $desktop "PandaPanda 無人機模擬器.lnk"
        $wshShell = New-Object -ComObject WScript.Shell
        $shortcut = $wshShell.CreateShortcut($shortcutPath)
        $shortcut.TargetPath = $launcherBat
        $shortcut.WorkingDirectory = $rawPath
        $shortcut.Description = "PandaPanda 無人機模擬器"
        $shortcut.Save()

        $progressBar.Value = 100
        $lblStatus.ForeColor = [System.Drawing.Color]::FromArgb(76, 175, 80)
        $lblStatus.Text = "🎉 安裝完成！已在桌面建立「PandaPanda 無人機模擬器」捷徑！"
        
        $btnInstall.Text = "🎮 立即啟動"
        $btnInstall.BackColor = [System.Drawing.Color]::FromArgb(76, 175, 80)
        $btnInstall.ForeColor = [System.Drawing.Color]::White
        $btnInstall.Enabled = $true

        $btnCancel.Text = "完成"
    } catch {
        $lblStatus.ForeColor = [System.Drawing.Color]::FromArgb(244, 67, 54)
        $lblStatus.Text = "安裝過程發生錯誤: " + $_.Exception.Message
        $btnInstall.Enabled = $true
        $btnInstall.Text = "重試安裝"
    }
})

$form.ShowDialog() | Out-Null
