using System;
using System.IO;
using System.Net;
using System.Drawing;
using System.Diagnostics;
using System.Windows.Forms;
using Microsoft.Win32;

public class InstallerForm : Form {
    private TextBox txtPath;
    private CheckBox chkShortcut;
    private ProgressBar progressBar;
    private Label lblStatus;
    private Button btnInstall;
    private Button btnCancel;
    private bool isFinished = false;

    private const string FixedFolder = "PandaSubtitleEditor";
    private const string TargetLauncher = "PandaPanda的AI日常___字幕編輯工具.exe";

    public InstallerForm() {
        this.Text = "PandaPanda 字幕編輯工具 - 官方安裝精靈";
        this.Size = new Size(620, 530);
        this.StartPosition = FormStartPosition.CenterScreen;
        this.FormBorderStyle = FormBorderStyle.FixedDialog;
        this.MaximizeBox = false;
        this.BackColor = Color.FromArgb(20, 28, 44);
        this.ForeColor = Color.White;
        this.Font = new Font("Microsoft JhengHei", 9.5f, FontStyle.Regular);

        // Header Title
        Label lblTitle = new Label();
        lblTitle.Text = "PandaPanda AI日常 字幕編輯工具";
        lblTitle.Font = new Font("Microsoft JhengHei", 16f, FontStyle.Bold);
        lblTitle.ForeColor = Color.FromArgb(0, 229, 255);
        lblTitle.Location = new Point(30, 22);
        lblTitle.Size = new Size(540, 32);
        this.Controls.Add(lblTitle);

        // Subtitle
        Label lblSubtitle = new Label();
        lblSubtitle.Text = "雙語字幕智慧對齊 · 專業 ASS 特效渲染 · 獨立高效本機轉檔核心";
        lblSubtitle.Font = new Font("Microsoft JhengHei", 9.5f, FontStyle.Regular);
        lblSubtitle.ForeColor = Color.FromArgb(160, 180, 205);
        lblSubtitle.Location = new Point(32, 58);
        lblSubtitle.Size = new Size(540, 22);
        this.Controls.Add(lblSubtitle);

        // Path Group
        GroupBox grpPath = new GroupBox();
        grpPath.Text = " 安裝位置設定 ";
        grpPath.Font = new Font("Microsoft JhengHei", 9.5f, FontStyle.Bold);
        grpPath.ForeColor = Color.FromArgb(0, 229, 255);
        grpPath.Location = new Point(30, 95);
        grpPath.Size = new Size(544, 115);

        Label lblPathHint = new Label();
        lblPathHint.Text = "程式將安裝於下列目錄 (將自動建立 PandaSubtitleEditor 資料夾)：";
        lblPathHint.Font = new Font("Microsoft JhengHei", 9f, FontStyle.Regular);
        lblPathHint.ForeColor = Color.FromArgb(200, 215, 235);
        lblPathHint.Location = new Point(16, 26);
        lblPathHint.Size = new Size(510, 20);
        grpPath.Controls.Add(lblPathHint);

        string userProfile = Environment.GetFolderPath(Environment.SpecialFolder.UserProfile);
        string defaultPath = Path.Combine(userProfile, FixedFolder);

        txtPath = new TextBox();
        txtPath.Text = defaultPath;
        txtPath.Location = new Point(16, 52);
        txtPath.Size = new Size(410, 26);
        txtPath.BackColor = Color.FromArgb(30, 40, 60);
        txtPath.ForeColor = Color.White;
        txtPath.BorderStyle = BorderStyle.FixedSingle;
        grpPath.Controls.Add(txtPath);

        Button btnBrowse = new Button();
        btnBrowse.Text = "瀏覽...";
        btnBrowse.Location = new Point(434, 50);
        btnBrowse.Size = new Size(94, 28);
        btnBrowse.BackColor = Color.FromArgb(45, 55, 80);
        btnBrowse.ForeColor = Color.White;
        btnBrowse.FlatStyle = FlatStyle.Flat;
        btnBrowse.Cursor = Cursors.Hand;
        btnBrowse.Click += (s, e) => {
            using (FolderBrowserDialog fbd = new FolderBrowserDialog()) {
                fbd.Description = "請選擇安裝目錄";
                fbd.SelectedPath = userProfile;
                if (fbd.ShowDialog() == DialogResult.OK) {
                    string p = fbd.SelectedPath;
                    if (!p.EndsWith(FixedFolder, StringComparison.OrdinalIgnoreCase)) {
                        p = Path.Combine(p, FixedFolder);
                    }
                    txtPath.Text = p;
                }
            }
        };
        grpPath.Controls.Add(btnBrowse);
        this.Controls.Add(grpPath);

        // Options Group
        GroupBox grpOptions = new GroupBox();
        grpOptions.Text = " 捷徑與附加設定 ";
        grpOptions.Font = new Font("Microsoft JhengHei", 9.5f, FontStyle.Bold);
        grpOptions.ForeColor = Color.FromArgb(0, 229, 255);
        grpOptions.Location = new Point(30, 225);
        grpOptions.Size = new Size(544, 75);

        chkShortcut = new CheckBox();
        chkShortcut.Text = "在桌面建立「字幕編輯工具」捷徑 (推薦)";
        chkShortcut.Font = new Font("Microsoft JhengHei", 9.5f, FontStyle.Regular);
        chkShortcut.ForeColor = Color.White;
        chkShortcut.Checked = true;
        chkShortcut.Location = new Point(18, 30);
        chkShortcut.Size = new Size(500, 24);
        grpOptions.Controls.Add(chkShortcut);
        this.Controls.Add(grpOptions);

        // Progress & Status
        lblStatus = new Label();
        lblStatus.Text = "準備就緒，請點擊「開始安裝」。";
        lblStatus.ForeColor = Color.FromArgb(0, 229, 255);
        lblStatus.Location = new Point(30, 320);
        lblStatus.Size = new Size(544, 22);
        this.Controls.Add(lblStatus);

        progressBar = new ProgressBar();
        progressBar.Location = new Point(32, 348);
        progressBar.Size = new Size(542, 22);
        progressBar.Minimum = 0;
        progressBar.Maximum = 100;
        progressBar.Value = 0;
        this.Controls.Add(progressBar);

        // Buttons
        btnInstall = new Button();
        btnInstall.Text = "開始安裝";
        btnInstall.Font = new Font("Microsoft JhengHei", 10.5f, FontStyle.Bold);
        btnInstall.Location = new Point(300, 410);
        btnInstall.Size = new Size(150, 42);
        btnInstall.BackColor = Color.FromArgb(0, 200, 230);
        btnInstall.ForeColor = Color.Black;
        btnInstall.FlatStyle = FlatStyle.Flat;
        btnInstall.Cursor = Cursors.Hand;
        btnInstall.Click += BtnInstall_Click;
        this.Controls.Add(btnInstall);

        btnCancel = new Button();
        btnCancel.Text = "取消";
        btnCancel.Font = new Font("Microsoft JhengHei", 10f, FontStyle.Regular);
        btnCancel.Location = new Point(464, 410);
        btnCancel.Size = new Size(110, 42);
        btnCancel.BackColor = Color.FromArgb(45, 52, 68);
        btnCancel.ForeColor = Color.FromArgb(200, 210, 225);
        btnCancel.FlatStyle = FlatStyle.Flat;
        btnCancel.Cursor = Cursors.Hand;
        btnCancel.Click += (s, e) => this.Close();
        this.Controls.Add(btnCancel);
    }

    private void BtnInstall_Click(object sender, EventArgs e) {
        if (isFinished) {
            string runExe = Path.Combine(txtPath.Text, TargetLauncher);
            string runBat = Path.Combine(txtPath.Text, "啟動字幕編輯器.bat");
            if (File.Exists(runExe)) {
                Process.Start(new ProcessStartInfo(runExe) { WorkingDirectory = txtPath.Text });
            } else if (File.Exists(runBat)) {
                Process.Start(new ProcessStartInfo(runBat) { WorkingDirectory = txtPath.Text });
            }
            this.Close();
            return;
        }

        string dest = txtPath.Text.Trim();
        if (string.IsNullOrEmpty(dest)) {
            MessageBox.Show("請輸入有效的安裝路徑！", "提示", MessageBoxButtons.OK, MessageBoxIcon.Warning);
            return;
        }

        if (!dest.EndsWith(FixedFolder, StringComparison.OrdinalIgnoreCase)) {
            dest = Path.Combine(dest, FixedFolder);
            txtPath.Text = dest;
        }

        btnInstall.Enabled = false;
        btnCancel.Enabled = false;
        txtPath.ReadOnly = true;
        chkShortcut.Enabled = false;

        System.Threading.ThreadPool.QueueUserWorkItem((state) => {
            DoInstall(dest);
        });
    }

    private void DoInstall(string dest) {
        try {
            if (!Directory.Exists(dest)) {
                Directory.CreateDirectory(dest);
            }

            string[] filesToInstall = new string[] {
                TargetLauncher,
                "run.pyw",
                "index.html",
                "tailwindcss.js",
                "favicon.ico",
                "啟動字幕編輯器.bat"
            };

            string[] baseUrls = new string[] {
                "https://raw.githubusercontent.com/pandapanda6666/pandapanda6666.github.io/main/",
                "https://raw.githubusercontent.com/pandapanda6666/pandapanda6666.github.io/main/Edit/Video/Add%20subtitles/"
            };

            string scriptDir = AppDomain.CurrentDomain.BaseDirectory;
            ServicePointManager.SecurityProtocol = (SecurityProtocolType)3072 | (SecurityProtocolType)768; // Tls12 | Tls11
            WebClient wc = new WebClient();
            wc.Headers.Add("User-Agent", "PandaPanda-SubtitleEditor-Installer");
            wc.Encoding = System.Text.Encoding.UTF8;

            int total = filesToInstall.Length;
            for (int i = 0; i < total; i++) {
                string file = filesToInstall[i];
                UpdateProgress(string.Format("正在部署核心檔案 ({0}/{1}): {2} ...", i + 1, total, file), (int)(((i + 1.0) / (total + 1)) * 80));

                string destFile = Path.Combine(dest, file);
                string localFile1 = Path.Combine(scriptDir, file);
                string localFile2 = Path.Combine(Path.Combine(scriptDir, @"Edit\Video\Add subtitles"), file);
                string localFile3 = Path.Combine(@"L:\我的雲端硬碟\硬體及自製軟體\自製軟體\字幕編輯工具", file);

                if (File.Exists(localFile1)) {
                    File.Copy(localFile1, destFile, true);
                } else if (File.Exists(localFile2)) {
                    File.Copy(localFile2, destFile, true);
                } else if (File.Exists(localFile3)) {
                    File.Copy(localFile3, destFile, true);
                } else {
                    bool downloaded = false;
                    foreach (string baseU in baseUrls) {
                        try {
                            string url = baseU + Uri.EscapeDataString(file);
                            wc.DownloadFile(url, destFile);
                            downloaded = true;
                            break;
                        } catch { }
                    }
                }
            }

            // Copy ffmpeg.exe if available locally
            string destFfmpeg = Path.Combine(dest, "ffmpeg.exe");
            if (!File.Exists(destFfmpeg)) {
                string localFfmpeg1 = Path.Combine(scriptDir, "ffmpeg.exe");
                string localFfmpeg2 = @"L:\我的雲端硬碟\硬體及自製軟體\自製軟體\字幕編輯工具\ffmpeg.exe";
                if (File.Exists(localFfmpeg1)) {
                    File.Copy(localFfmpeg1, destFfmpeg, true);
                } else if (File.Exists(localFfmpeg2)) {
                    File.Copy(localFfmpeg2, destFfmpeg, true);
                }
            }

            // Write uninstall.bat
            string uninstBat = Path.Combine(dest, "uninstall.bat");
            string desktopPath = Environment.GetFolderPath(Environment.SpecialFolder.Desktop);
            string lnkDesktop = Path.Combine(desktopPath, "字幕編輯工具.lnk");
            string uninstContent = string.Format(
                "@echo off\r\nchcp 65001 >nul\r\necho 正在解除安裝 PandaPanda 字幕編輯工具...\r\nif exist \"{0}\" del /f /q \"{0}\"\r\nreg delete \"HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\PandaSubtitleEditor\" /f >nul 2>nul\r\ntimeout /t 1 >nul\r\ncd ..\r\nrd /s /q \"{1}\"\r\necho 解除安裝完成！\r\npause\r\n",
                lnkDesktop, dest
            );
            File.WriteAllText(uninstBat, uninstContent, System.Text.Encoding.GetEncoding(950)); // Big5

            // Register in Windows Registry
            UpdateProgress("正在註冊系統資訊...", 90);
            string exePath = Path.Combine(dest, TargetLauncher);
            using (RegistryKey key = Registry.CurrentUser.CreateSubKey(@"Software\Microsoft\Windows\CurrentVersion\Uninstall\PandaSubtitleEditor")) {
                if (key != null) {
                    key.SetValue("DisplayName", "字幕編輯工具 (PandaPanda的AI日常)");
                    key.SetValue("DisplayVersion", "1.0.0");
                    key.SetValue("Publisher", "PandaPanda");
                    key.SetValue("InstallLocation", dest);
                    key.SetValue("UninstallString", "\"" + uninstBat + "\"");
                    key.SetValue("DisplayIcon", "\"" + exePath + "\"");
                    key.SetValue("NoModify", 1, RegistryValueKind.DWord);
                    key.SetValue("NoRepair", 1, RegistryValueKind.DWord);
                }
            }

            // Create desktop shortcut
            if (chkShortcut.Checked) {
                UpdateProgress("正在建立桌面捷徑...", 95);
                CreateShortcut(lnkDesktop, exePath, dest, "PandaPanda 字幕編輯工具");
            }

            this.Invoke((MethodInvoker)delegate {
                progressBar.Value = 100;
                lblStatus.ForeColor = Color.FromArgb(100, 230, 150);
                lblStatus.Text = "安裝成功！已在桌面建立「字幕編輯工具」捷徑與註冊資訊！";
                btnInstall.Text = "立即啟動";
                btnInstall.BackColor = Color.FromArgb(76, 175, 80);
                btnInstall.ForeColor = Color.White;
                btnInstall.Enabled = true;
                btnCancel.Text = "完成";
                btnCancel.Enabled = true;
                isFinished = true;
            });
        } catch (Exception ex) {
            this.Invoke((MethodInvoker)delegate {
                lblStatus.ForeColor = Color.FromArgb(255, 90, 90);
                lblStatus.Text = "安裝過程發生錯誤: " + ex.Message;
                btnInstall.Enabled = true;
                btnInstall.Text = "重試安裝";
                btnCancel.Enabled = true;
            });
        }
    }

    private void UpdateProgress(string text, int percent) {
        if (this.InvokeRequired) {
            this.Invoke((MethodInvoker)delegate {
                lblStatus.Text = text;
                progressBar.Value = Math.Min(percent, 100);
            });
        } else {
            lblStatus.Text = text;
            progressBar.Value = Math.Min(percent, 100);
        }
    }

    private void CreateShortcut(string shortcutPath, string targetPath, string workingDir, string description) {
        Type t = Type.GetTypeFromProgID("WScript.Shell");
        dynamic shell = Activator.CreateInstance(t);
        var sc = shell.CreateShortcut(shortcutPath);
        sc.TargetPath = targetPath;
        sc.WorkingDirectory = workingDir;
        sc.Description = description;
        sc.IconLocation = targetPath;
        sc.Save();
    }

    [STAThread]
    public static void Main() {
        Application.EnableVisualStyles();
        Application.SetCompatibleTextRenderingDefault(false);
        Application.Run(new InstallerForm());
    }
}