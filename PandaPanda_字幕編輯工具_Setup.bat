@echo off
chcp 65001 >nul
title PandaPanda 字幕編輯工具 安裝精靈
powershell -NoProfile -ExecutionPolicy Bypass -Command "$c = [System.IO.File]::ReadAllText('%~f0', [System.Text.Encoding]::UTF8); $marker = '::START_PS_CODE::'; $idx = $c.IndexOf($marker); if ($idx -ge 0) { Invoke-Expression $c.Substring($idx + $marker.Length) }"
exit /b %errorlevel%
::START_PS_CODE::
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

[System.Windows.Forms.Application]::EnableVisualStyles()

$form = New-Object System.Windows.Forms.Form
$form.Text = "PandaPanda 字幕編輯工具 - 官方安裝精靈"
$form.Size = New-Object System.Drawing.Size(620, 530)
$form.StartPosition = "CenterScreen"
$form.FormBorderStyle = "FixedDialog"
$form.MaximizeBox = $false
$form.BackColor = [System.Drawing.Color]::FromArgb(20, 28, 44)
$form.ForeColor = [System.Drawing.Color]::White
$form.Font = New-Object System.Drawing.Font("Microsoft JhengHei", 9.5, [System.Drawing.FontStyle]::Regular)

# Title
$lblTitle = New-Object System.Windows.Forms.Label
$lblTitle.Text = "PandaPanda AI日常 字幕編輯工具"
$lblTitle.Font = New-Object System.Drawing.Font("Microsoft JhengHei", 16, [System.Drawing.FontStyle]::Bold)
$lblTitle.ForeColor = [System.Drawing.Color]::FromArgb(0, 229, 255)
$lblTitle.Location = New-Object System.Drawing.Point(30, 22)
$lblTitle.Size = New-Object System.Drawing.Size(540, 32)
$form.Controls.Add($lblTitle)

# Subtitle
$lblSubtitle = New-Object System.Windows.Forms.Label
$lblSubtitle.Text = "雙語字幕智慧對齊 · 專業 ASS 特效渲染 · 獨立高效本機轉檔核心"
$lblSubtitle.Font = New-Object System.Drawing.Font("Microsoft JhengHei", 9.5, [System.Drawing.FontStyle]::Regular)
$lblSubtitle.ForeColor = [System.Drawing.Color]::FromArgb(160, 180, 205)
$lblSubtitle.Location = New-Object System.Drawing.Point(32, 58)
$lblSubtitle.Size = New-Object System.Drawing.Size(540, 22)
$form.Controls.Add($lblSubtitle)

# Path Group
$grpPath = New-Object System.Windows.Forms.GroupBox
$grpPath.Text = " 安裝位置設定 "
$grpPath.Font = New-Object System.Drawing.Font("Microsoft JhengHei", 9.5, [System.Drawing.FontStyle]::Bold)
$grpPath.ForeColor = [System.Drawing.Color]::FromArgb(0, 229, 255)
$grpPath.Location = New-Object System.Drawing.Point(30, 95)
$grpPath.Size = New-Object System.Drawing.Size(544, 115)

$lblPathHint = New-Object System.Windows.Forms.Label
$lblPathHint.Text = "程式將安裝於下列目錄 (將自動建立 PandaSubtitleEditor 資料夾)："
$lblPathHint.Font = New-Object System.Drawing.Font("Microsoft JhengHei", 9, [System.Drawing.FontStyle]::Regular)
$lblPathHint.ForeColor = [System.Drawing.Color]::FromArgb(200, 215, 235)
$lblPathHint.Location = New-Object System.Drawing.Point(16, 26)
$lblPathHint.Size = New-Object System.Drawing.Size(510, 20)
$grpPath.Controls.Add($lblPathHint)

$userProfile = [Environment]::GetFolderPath('UserProfile')
$fixedFolder = "PandaSubtitleEditor"
$defaultPath = Join-Path $userProfile $fixedFolder

$txtPath = New-Object System.Windows.Forms.TextBox
$txtPath.Text = $defaultPath
$txtPath.Location = New-Object System.Drawing.Point(16, 52)
$txtPath.Size = New-Object System.Drawing.Size(410, 26)
$txtPath.BackColor = [System.Drawing.Color]::FromArgb(30, 40, 60)
$txtPath.ForeColor = [System.Drawing.Color]::White
$txtPath.BorderStyle = "FixedSingle"
$grpPath.Controls.Add($txtPath)

$btnBrowse = New-Object System.Windows.Forms.Button
$btnBrowse.Text = "瀏覽..."
$btnBrowse.Location = New-Object System.Drawing.Point(434, 50)
$btnBrowse.Size = New-Object System.Drawing.Size(94, 28)
$btnBrowse.BackColor = [System.Drawing.Color]::FromArgb(45, 55, 80)
$btnBrowse.ForeColor = [System.Drawing.Color]::White
$btnBrowse.FlatStyle = "Flat"
$btnBrowse.Cursor = [System.Windows.Forms.Cursors]::Hand
$btnBrowse.Add_Click({
    $fbd = New-Object System.Windows.Forms.FolderBrowserDialog
    $fbd.Description = "請選擇安裝目錄"
    $fbd.SelectedPath = $userProfile
    if ($fbd.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK) {
        $p = $fbd.SelectedPath
        if (-not $p.EndsWith($fixedFolder, [System.StringComparison]::OrdinalIgnoreCase)) {
            $p = Join-Path $p $fixedFolder
        }
        $txtPath.Text = $p
    }
})
$grpPath.Controls.Add($btnBrowse)

$form.Controls.Add($grpPath)

# Options Group
$grpOptions = New-Object System.Windows.Forms.GroupBox
$grpOptions.Text = " 捷徑與附加設定 "
$grpOptions.Font = New-Object System.Drawing.Font("Microsoft JhengHei", 9.5, [System.Drawing.FontStyle]::Bold)
$grpOptions.ForeColor = [System.Drawing.Color]::FromArgb(0, 229, 255)
$grpOptions.Location = New-Object System.Drawing.Point(30, 225)
$grpOptions.Size = New-Object System.Drawing.Size(544, 75)

$chkShortcut = New-Object System.Windows.Forms.CheckBox
$chkShortcut.Text = "在桌面建立「字幕編輯工具」捷徑 (推薦)"
$chkShortcut.Font = New-Object System.Drawing.Font("Microsoft JhengHei", 9.5, [System.Drawing.FontStyle]::Regular)
$chkShortcut.ForeColor = [System.Drawing.Color]::White
$chkShortcut.Checked = $true
$chkShortcut.Location = New-Object System.Drawing.Point(18, 30)
$chkShortcut.Size = New-Object System.Drawing.Size(500, 24)
$grpOptions.Controls.Add($chkShortcut)
$form.Controls.Add($grpOptions)

# Progress Bar & Status
$lblStatus = New-Object System.Windows.Forms.Label
$lblStatus.Text = "準備就緒，請點擊「開始安裝」。"
$lblStatus.ForeColor = [System.Drawing.Color]::FromArgb(0, 229, 255)
$lblStatus.Location = New-Object System.Drawing.Point(30, 320)
$lblStatus.Size = New-Object System.Drawing.Size(544, 22)
$form.Controls.Add($lblStatus)

$progressBar = New-Object System.Windows.Forms.ProgressBar
$progressBar.Location = New-Object System.Drawing.Point(32, 348)
$progressBar.Size = New-Object System.Drawing.Size(542, 22)
$progressBar.Minimum = 0
$progressBar.Maximum = 100
$progressBar.Value = 0
$form.Controls.Add($progressBar)

# Action Buttons
$btnInstall = New-Object System.Windows.Forms.Button
$btnInstall.Text = "開始安裝"
$btnInstall.Font = New-Object System.Drawing.Font("Microsoft JhengHei", 10.5, [System.Drawing.FontStyle]::Bold)
$btnInstall.Location = New-Object System.Drawing.Point(300, 410)
$btnInstall.Size = New-Object System.Drawing.Size(150, 42)
$btnInstall.BackColor = [System.Drawing.Color]::FromArgb(0, 200, 230)
$btnInstall.ForeColor = [System.Drawing.Color]::Black
$btnInstall.FlatStyle = "Flat"
$btnInstall.Cursor = [System.Windows.Forms.Cursors]::Hand
$form.Controls.Add($btnInstall)

$btnCancel = New-Object System.Windows.Forms.Button
$btnCancel.Text = "取消"
$btnCancel.Font = New-Object System.Drawing.Font("Microsoft JhengHei", 10, [System.Drawing.FontStyle]::Regular)
$btnCancel.Location = New-Object System.Drawing.Point(464, 410)
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
$targetLauncher = "PandaPanda的AI日常___字幕編輯工具.exe"

$btnInstall.Add_Click({
    if ($isFinished) {
        $runExe = Join-Path $txtPath.Text $targetLauncher
        $runBat = Join-Path $txtPath.Text "啟動字幕編輯器.bat"
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
    $chkShortcut.Enabled = $false

    try {
        if (-not (Test-Path $dest)) {
            New-Item -ItemType Directory -Force -Path $dest | Out-Null
        }

        $filesToInstall = @(
            "PandaPanda的AI日常___字幕編輯工具.exe",
            "run.pyw",
            "index.html",
            "tailwindcss.js",
            "啟動字幕編輯器.bat"
        )

        $baseUrls = @(
            "https://raw.githubusercontent.com/pandapanda6666/pandapanda6666.github.io/main/",
            "https://raw.githubusercontent.com/pandapanda6666/pandapanda6666.github.io/main/Edit/Video/Add%20subtitles/"
        )

        [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12 -bor [System.Net.SecurityProtocolType]::Tls13
        $wc = New-Object System.Net.WebClient
        $wc.Headers.Add("User-Agent", "PandaPanda-SubtitleEditor-Installer")
        $wc.Encoding = [System.Text.Encoding]::UTF8

        $total = $filesToInstall.Count
        $cur = 0

        foreach ($file in $filesToInstall) {
            $cur++
            $lblStatus.Text = "正在部署核心檔案 ($cur/$total): $file ..."
            $progressBar.Value = [int](($cur / ($total + 1)) * 80)
            $form.Refresh()

            $destFile = Join-Path $dest $file
            $localFile1 = Join-Path $scriptDir $file
            $localFile2 = Join-Path (Join-Path $scriptDir "Edit\Video\Add subtitles") $file
            $localFile3 = Join-Path "L:\我的雲端硬碟\硬體及自製軟體\自製軟體\字幕編輯工具" $file

            if (Test-Path $localFile1) {
                Copy-Item $localFile1 $destFile -Force
            } elseif (Test-Path $localFile2) {
                Copy-Item $localFile2 $destFile -Force
            } elseif (Test-Path $localFile3) {
                Copy-Item $localFile3 $destFile -Force
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

        # 檢查 ffmpeg.exe
        $destFfmpeg = Join-Path $dest "ffmpeg.exe"
        if (-not (Test-Path $destFfmpeg)) {
            $localFfmpeg1 = Join-Path $scriptDir "ffmpeg.exe"
            $localFfmpeg2 = "L:\我的雲端硬碟\硬體及自製軟體\自製軟體\字幕編輯工具\ffmpeg.exe"
            if (Test-Path $localFfmpeg1) {
                Copy-Item $localFfmpeg1 $destFfmpeg -Force
            } elseif (Test-Path $localFfmpeg2) {
                Copy-Item $localFfmpeg2 $destFfmpeg -Force
            }
        }

        # 建立解除安裝腳本 (uninstall.bat)
        $uninstBat = Join-Path $dest "uninstall.bat"
        $desktopPath = [Environment]::GetFolderPath('Desktop')
        $lnkDesktop = Join-Path $desktopPath "字幕編輯工具.lnk"
        $uninstContent = "@echo off`r`nchcp 65001 >nul`r`necho 正在解除安裝 PandaPanda 字幕編輯工具...`r`nif exist `"$lnkDesktop`" del /f /q `"$lnkDesktop`"`r`nreg delete `"HKCU\Software\Microsoft\Windows\CurrentVersion\Uninstall\PandaSubtitleEditor`" /f >nul 2>nul`r`ntimeout /t 1 >nul`r`ncd ..`r`nrd /s /q `"$dest`"`r`necho 解除安裝完成！`r`npause`r`n"
        [System.IO.File]::WriteAllText($uninstBat, $uninstContent, [System.Text.Encoding]::GetEncoding("BIG5"))

        # 寫入 Windows 控制台解除安裝註冊表
        $lblStatus.Text = "正在註冊系統資訊..."
        $progressBar.Value = 90
        $form.Refresh()

        $regPath = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\PandaSubtitleEditor"
        if (-not (Test-Path $regPath)) {
            New-Item -Path $regPath -Force | Out-Null
        }
        $exePath = Join-Path $dest $targetLauncher
        Set-ItemProperty -Path $regPath -Name "DisplayName" -Value "字幕編輯工具 (PandaPanda的AI日常)" -Force
        Set-ItemProperty -Path $regPath -Name "DisplayVersion" -Value "1.0.0" -Force
        Set-ItemProperty -Path $regPath -Name "Publisher" -Value "PandaPanda" -Force
        Set-ItemProperty -Path $regPath -Name "InstallLocation" -Value $dest -Force
        Set-ItemProperty -Path $regPath -Name "UninstallString" -Value "`"$uninstBat`"" -Force
        Set-ItemProperty -Path $regPath -Name "DisplayIcon" -Value "`"$exePath`"" -Force
        Set-ItemProperty -Path $regPath -Name "NoModify" -Value 1 -Type DWord -Force
        Set-ItemProperty -Path $regPath -Name "NoRepair" -Value 1 -Type DWord -Force

        # 建立桌面捷徑
        if ($chkShortcut.Checked) {
            $lblStatus.Text = "正在建立桌面捷徑..."
            $progressBar.Value = 95
            $form.Refresh()

            $wsh = New-Object -ComObject WScript.Shell
            $sc = $wsh.CreateShortcut($lnkDesktop)
            $sc.TargetPath = $exePath
            $sc.WorkingDirectory = $dest
            $sc.Description = "PandaPanda 字幕編輯工具"
            $sc.IconLocation = $exePath
            $sc.Save()
        }

        $progressBar.Value = 100
        $lblStatus.ForeColor = [System.Drawing.Color]::FromArgb(100, 230, 150)
        $lblStatus.Text = "安裝成功！已在桌面建立「字幕編輯工具」捷徑與註冊資訊！"
        
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