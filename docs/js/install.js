/* ============================================
   iOS OTA Distribution - Install Page Logic
   ============================================ */

const InstallPage = {
  releaseData: null,

  async init() {
    BrowserDetect.init();
    this.initTheme();
    this.renderAppInfo();
    this.renderInstallGuide();
    this.detectEnvironment();
    await this.loadVersionInfo();
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

  renderInstallGuide() {
    // Show install area (hidden by default, shown when supported)
    // Show unsupported overlay (hidden by default, shown when needed)
  },

  detectEnvironment() {
    const info = BrowserDetect.getDeviceInfo();
    const overlay = document.getElementById("unsupportedOverlay");
    const overlayTitle = document.getElementById("overlayTitle");
    const overlayDesc = document.getElementById("overlayDesc");
    const overlayIcon = document.getElementById("overlayIcon");
    const installArea = document.getElementById("installArea");
    const androidMsg = document.getElementById("androidMessage");
    const installBtn = document.getElementById("installBtn");

    if (!overlay || !installArea) return;

    // WeChat / QQ
    if (info.isWeChat || info.isQQ) {
      overlay.style.display = "flex";
      installArea.style.display = "none";
      overlayIcon.textContent = info.isWeChat ? "💬" : "💻";
      overlayTitle.textContent = info.isWeChat
        ? "请使用 Safari 打开"
        : "请使用 Safari 打开";
      overlayDesc.textContent =
        "检测到你正在使用应用内浏览器，请点击右上角「...」或「···」，选择「在 Safari 中打开」以安装应用。";
      return;
    }

    // Android
    if (info.isAndroid) {
      overlay.style.display = "flex";
      installArea.style.display = "none";
      overlayIcon.textContent = "📱";
      overlayTitle.textContent = "仅支持 iOS 设备";
      overlayDesc.textContent =
        "此应用为 iOS 应用，无法在 Android 设备上安装。请在 iPhone 或 iPad 上使用 Safari 浏览器打开此页面。";
      return;
    }

    // Desktop (not iOS)
    if (info.isDesktop) {
      overlay.style.display = "flex";
      installArea.style.display = "none";
      overlayIcon.textContent = "💻";
      overlayTitle.textContent = "请使用 iPhone 打开";
      overlayDesc.textContent =
        "请在 iPhone 或 iPad 的 Safari 浏览器中打开此页面以安装应用。你也可以将此链接分享给其他 iOS 用户。";
      return;
    }

    // iOS but not Safari (e.g., Chrome on iOS)
    if (info.isIOS && !info.isSafari) {
      overlay.style.display = "flex";
      installArea.style.display = "none";
      overlayIcon.textContent = "🌐";
      overlayTitle.textContent = "请使用 Safari 安装";
      overlayDesc.textContent =
        "iOS 应用安装需要在 Safari 浏览器中进行。请复制链接后在 Safari 中打开。";
      return;
    }

    // iOS Safari - can install
    installArea.style.display = "block";
    // Bounce in
    requestAnimationFrame(() => {
      installArea.classList.add("animate-fade-in-up");
    });
  },

  async loadVersionInfo() {
    const versionParam = Utils.getUrlParam("version");
    const infoEl = document.getElementById("versionInfo");
    if (!infoEl) return;

    if (!APP_CONFIG.repo || APP_CONFIG.repo === "username/repo") {
      this.renderOfflineInfo(infoEl);
      return;
    }

    infoEl.innerHTML = `
      <div class="skeleton skeleton-line"></div>
      <div class="skeleton skeleton-line"></div>
    `;

    try {
      const release = await VersionManager.getLatestRelease(versionParam);
      this.releaseData = release;
      VersionManager.setCache(release);

      // Update version displays
      document.querySelectorAll("[data-version]").forEach((el) => {
        el.textContent = `v${release.version}`;
      });

      infoEl.innerHTML = `
        <ul class="info-list">
          <li class="info-item">
            <span class="info-label">版本</span>
            <span class="info-value">${Utils.sanitizeHTML(release.version)}</span>
          </li>
          <li class="info-item">
            <span class="info-label">Build</span>
            <span class="info-value">${Utils.sanitizeHTML(release.tagName)}</span>
          </li>
          <li class="info-item">
            <span class="info-label">大小</span>
            <span class="info-value">${this.formatAssetSize(release)}</span>
          </li>
          <li class="info-item">
            <span class="info-label">更新于</span>
            <span class="info-value">${Utils.formatDate(release.publishedAt)}</span>
          </li>
        </ul>
      `;

      // Release notes
      const notesEl = document.getElementById("releaseNotes");
      if (notesEl) {
        notesEl.innerHTML = Utils.parseReleaseNotes(release.body);
      }

      // Setup install button
      this.setupInstallButton(release);

      // Show install area if supported
      if (BrowserDetect.canInstallOTA()) {
        this.showInstallArea();
      }
    } catch (err) {
      console.warn("Failed to load release:", err.message);
      this.renderOfflineInfo(infoEl);
      this.setupInstallButtonOffline(versionParam);
    }
  },

  renderOfflineInfo(container) {
    const cached = VersionManager.getCache();
    if (cached) {
      container.innerHTML = `
        <ul class="info-list">
          <li class="info-item">
            <span class="info-label">版本</span>
            <span class="info-value">${Utils.sanitizeHTML(cached.version)}</span>
          </li>
          <li class="info-item">
            <span class="info-label">Build</span>
            <span class="info-value">${Utils.sanitizeHTML(cached.tagName)}</span>
          </li>
        </ul>
      `;
      this.setupInstallButton(cached);
      return;
    }

    container.innerHTML = `
      <div class="error-state">
        <div class="error-icon">⚠️</div>
        <p>无法获取版本信息</p>
        <p style="margin-top:8px;font-size:13px;color:var(--color-text-tertiary)">请确保 APP_CONFIG.repo 已正确配置</p>
      </div>
    `;
    this.showManualInstall();
  },

  formatAssetSize(release) {
    if (!release.ipaDownloadUrl) return "-";
    // Could fetch HEAD to get size, but skip for simplicity
    return "下载后显示";
  },

  setupInstallButton(release) {
    const btn = document.getElementById("installBtn");
    if (!btn) return;

    const pagesManifestUrl = this.getPagesManifestUrl();
    const installUrl = `itms-services://?action=download-manifest&url=${encodeURIComponent(pagesManifestUrl)}`;

    btn.addEventListener("click", (e) => {
      if (!BrowserDetect.canInstallOTA()) {
        e.preventDefault();
        return;
      }

      // Show installing state
      btn.classList.add("loading");
      const textEl = btn.querySelector(".btn-text");
      textEl.textContent = "正在安装...";

      // Navigate to itms-services
      window.location.href = installUrl;

      // Reset after timeout (in case user returns to page)
      setTimeout(() => {
        btn.classList.remove("loading");
        textEl.textContent = "立即安装";
      }, 10000);
    });

    btn.removeAttribute("disabled");
  },

  setupInstallButtonOffline(versionParam) {
    const btn = document.getElementById("installBtn");
    if (!btn || !versionParam) return;

    const pagesManifestUrl = this.getPagesManifestUrl();
    const installUrl = `itms-services://?action=download-manifest&url=${encodeURIComponent(pagesManifestUrl)}`;

    btn.addEventListener("click", (e) => {
      if (!BrowserDetect.canInstallOTA()) {
        e.preventDefault();
        return;
      }
      btn.classList.add("loading");
      const textEl = btn.querySelector(".btn-text");
      textEl.textContent = "正在安装...";
      window.location.href = installUrl;
      setTimeout(() => {
        btn.classList.remove("loading");
        textEl.textContent = "立即安装";
      }, 10000);
    });

    btn.removeAttribute("disabled");
  },

  getPagesManifestUrl() {
    const [owner, repo] = APP_CONFIG.repo.split("/");
    return `https://${owner}.github.io/${repo}/manifest.plist`;
  },

  showInstallArea() {
    const area = document.getElementById("installArea");
    if (area) {
      area.style.display = "block";
      area.classList.add("animate-fade-in-up", "delay-3");
    }
  },

  showManualInstall() {
    // Show install anyway as long as it's iOS
    if (BrowserDetect.canInstallOTA()) {
      this.showInstallArea();
    }
  },

  // Theme (same pattern as app.js)
  initTheme() {
    const saved = localStorage.getItem("ota_theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    let theme = saved || "auto";
    if (theme === "auto") {
      theme = prefersDark ? "dark" : "light";
    }
    document.documentElement.setAttribute("data-theme", saved || "auto");
    this.updateThemeIcon(saved || "auto");
  },

  toggleTheme() {
    const current = document.documentElement.getAttribute("data-theme");
    let newTheme, savedTheme;
    if (current === "dark") {
      newTheme = "light";
      savedTheme = "light";
    } else if (current === "light") {
      newTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      savedTheme = "auto";
    } else {
      newTheme = "dark";
      savedTheme = "dark";
    }
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("ota_theme", savedTheme);
    this.updateThemeIcon(savedTheme);
  },

  updateThemeIcon(theme) {
    const btn = document.getElementById("themeToggle");
    if (!btn) return;
    if (theme === "dark") btn.textContent = "☀️";
    else if (theme === "light") btn.textContent = "🌙";
    else btn.textContent = "🌓";
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
