/* ============================================
   iOS OTA Distribution - Install Page Logic
   ============================================ */

const InstallPage = {
  releaseData: null,

  async init() {
    BrowserDetect.init();
    this.initTheme();
    this.renderAppInfo();
    this.setupInstallButton();
    this.detectEnvironment();
    this.loadVersionInfo();
    this.bindEvents();
  },

  renderAppInfo() {
    document.querySelectorAll("[data-app-name]").forEach((el) => {
      el.textContent = APP_CONFIG.appName;
    });

    document.title = `安装 ${APP_CONFIG.appName}`;

    const iconEl = document.querySelector(".app-icon-placeholder");
    if (iconEl) {
      iconEl.textContent = APP_CONFIG.appIconInitial || APP_CONFIG.appName.charAt(0);
    }
  },

  detectEnvironment() {
    const info = BrowserDetect.getDeviceInfo();
    const overlay = document.getElementById("unsupportedOverlay");
    const installBtn = document.getElementById("installBtn");

    if (!overlay || !installBtn) return;

    // WeChat / QQ
    if (info.isWeChat || info.isQQ) {
      overlay.style.display = "flex";
      installBtn.style.display = "none";
      document.getElementById("overlayIcon").textContent = info.isWeChat ? "💬" : "💻";
      document.getElementById("overlayTitle").textContent = "请使用 Safari 打开";
      document.getElementById("overlayDesc").textContent =
        "检测到你正在使用应用内浏览器，请点击右上角「...」或「···」，选择「在 Safari 中打开」以安装应用。";
      return;
    }

    // Android
    if (info.isAndroid) {
      overlay.style.display = "flex";
      installBtn.style.display = "none";
      document.getElementById("overlayIcon").textContent = "📱";
      document.getElementById("overlayTitle").textContent = "仅支持 iOS 设备";
      document.getElementById("overlayDesc").textContent =
        "此应用为 iOS 应用，无法在 Android 设备上安装。请在 iPhone 或 iPad 上使用 Safari 浏览器打开此页面。";
      return;
    }

    // Desktop (not iOS)
    if (info.isDesktop) {
      overlay.style.display = "flex";
      installBtn.style.display = "none";
      document.getElementById("overlayIcon").textContent = "💻";
      document.getElementById("overlayTitle").textContent = "请使用 iPhone 打开";
      document.getElementById("overlayDesc").textContent =
        "请在 iPhone 或 iPad 的 Safari 浏览器中打开此页面以安装应用。";
      return;
    }

    // iOS but not Safari
    if (info.isIOS && !info.isSafari) {
      overlay.style.display = "flex";
      installBtn.style.display = "none";
      document.getElementById("overlayIcon").textContent = "🌐";
      document.getElementById("overlayTitle").textContent = "请使用 Safari 安装";
      document.getElementById("overlayDesc").textContent =
        "iOS 应用安装需要在 Safari 浏览器中进行。请复制链接后在 Safari 中打开。";
      return;
    }
  },

  async loadVersionInfo() {
    const versionParam = Utils.getUrlParam("version");

    // Update version display from URL param or GitHub API
    if (versionParam) {
      document.querySelectorAll("[data-version]").forEach((el) => {
        el.textContent = versionParam.startsWith("v") ? versionParam : `v${versionParam}`;
      });
    }

    if (!APP_CONFIG.repo || APP_CONFIG.repo === "username/repo") return;

    try {
      const release = await VersionManager.getLatestRelease(versionParam);
      this.releaseData = release;
      VersionManager.setCache(release);

      document.querySelectorAll("[data-version]").forEach((el) => {
        el.textContent = `v${release.version}`;
      });

      // Release notes
      const notesEl = document.getElementById("releaseNotes");
      if (notesEl) {
        notesEl.innerHTML = Utils.parseReleaseNotes(release.body);
      }
    } catch (err) {
      console.warn("Failed to load release info:", err.message);
    }
  },

  setupInstallButton() {
    const btn = document.getElementById("installBtn");
    if (!btn) return;

    const manifestUrl = `https://${APP_CONFIG.repo.split("/")[0]}.github.io/${APP_CONFIG.repo.split("/")[1]}/manifest.plist`;
    const installUrl = `itms-services://?action=download-manifest&url=${encodeURIComponent(manifestUrl)}`;

    btn.addEventListener("click", (e) => {
      if (!BrowserDetect.canInstallOTA()) {
        e.preventDefault();
        return;
      }

      btn.classList.add("loading");
      btn.querySelector(".btn-text").textContent = "正在安装...";

      window.location.href = installUrl;

      setTimeout(() => {
        btn.classList.remove("loading");
        btn.querySelector(".btn-text").textContent = "立即安装";
      }, 10000);
    });

    btn.removeAttribute("disabled");
  },

  // Theme
  initTheme() {
    const saved = localStorage.getItem("ota_theme") || "light";
    document.documentElement.setAttribute("data-theme", saved);
    this.updateThemeIcon(saved);
  },

  toggleTheme() {
    const current = localStorage.getItem("ota_theme") || "light";
    const next = current === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("ota_theme", next);
    this.updateThemeIcon(next);
  },

  updateThemeIcon(theme) {
    const btn = document.getElementById("themeToggle");
    if (!btn) return;
    btn.textContent = theme === "dark" ? "☀️" : "🌙";
  },

  bindEvents() {
    const themeBtn = document.getElementById("themeToggle");
    if (themeBtn) {
      themeBtn.addEventListener("click", () => this.toggleTheme());
    }

    const retryBtn = document.getElementById("retryBtn");
    if (retryBtn) {
      retryBtn.addEventListener("click", () => {
        VersionManager.clearCache();
        window.location.reload();
      });
    }
  },
};

document.addEventListener("DOMContentLoaded", () => InstallPage.init());
