/* ============================================
   iOS OTA Distribution - Main App (Index Page)
   ============================================ */

const APP_CONFIG = {
  // ==== 必填配置 ====
  repo: "username/repo",           // GitHub 仓库 (owner/repo)
  appName: "应用名称",              // App 显示名称
  bundleId: "com.example.app",     // Bundle Identifier
  ipaFileName: "app.ipa",          // IPA 文件名 (上传到 Release 时的文件名)

  // ==== 可选配置 ====
  appIconInitial: "应",            // 无图标时显示的备选文字
  basePath: "",                    // 子路径 (仓库型 Pages: /repo-name, 自定义域名: 空)
};

const App = {
  async init() {
    BrowserDetect.init();
    this.initTheme();
    this.renderAppInfo();
    await this.loadVersionInfo();
    this.bindEvents();
  },

  renderAppInfo() {
    // Set app name
    document.querySelectorAll("[data-app-name]").forEach((el) => {
      el.textContent = APP_CONFIG.appName;
    });

    // Set page title
    document.title = `${APP_CONFIG.appName} - OTA 安装`;

    // Set app icon initial
    const iconEl = document.querySelector(".app-icon-placeholder");
    if (iconEl) {
      iconEl.textContent = APP_CONFIG.appIconInitial || APP_CONFIG.appName.charAt(0);
    }
  },

  async loadVersionInfo() {
    const versionContainer = document.getElementById("versionInfo");
    if (!versionContainer) return;

    // Show skeleton
    versionContainer.innerHTML = `
      <div class="skeleton skeleton-line"></div>
      <div class="skeleton skeleton-line"></div>
      <div class="skeleton skeleton-line" style="width: 60%"></div>
    `;

    try {
      const release = await VersionManager.getLatestRelease();
      VersionManager.setCache(release);

      // Update version display
      document.querySelectorAll("[data-version]").forEach((el) => {
        el.textContent = `v${release.version}`;
      });

      // Build info list
      const now = new Date();
      versionContainer.innerHTML = `
        <ul class="info-list">
          <li class="info-item">
            <span class="info-label">最新版本</span>
            <span class="info-value">${Utils.sanitizeHTML(release.version)}</span>
          </li>
          <li class="info-item">
            <span class="info-label">更新时间</span>
            <span class="info-value">${Utils.formatDateRelative(release.publishedAt)}</span>
          </li>
          <li class="info-item">
            <span class="info-label">Build</span>
            <span class="info-value">${Utils.sanitizeHTML(release.tagName)}</span>
          </li>
        </ul>
      `;

      // Release notes
      const notesContainer = document.getElementById("releaseNotes");
      if (notesContainer) {
        notesContainer.innerHTML = Utils.parseReleaseNotes(release.body);
      }

      // Update install button link
      const installBtn = document.getElementById("installBtn");
      if (installBtn) {
        installBtn.href = `${Utils.getBasePath()}/install.html?version=${encodeURIComponent(release.tagName)}`;
      }
    } catch (err) {
      versionContainer.innerHTML = `
        <div class="error-state">
          <div class="error-icon">⚠️</div>
          <p>${Utils.sanitizeHTML(err.message)}</p>
          <p style="margin-top:8px;font-size:13px;color:var(--color-text-tertiary)">请检查网络连接或刷新重试</p>
        </div>
      `;
    }
  },

  // Theme
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
    if (theme === "dark") {
      btn.textContent = "☀️";
    } else if (theme === "light") {
      btn.textContent = "🌙";
    } else {
      btn.textContent = "🌓";
    }
  },

  bindEvents() {
    const themeBtn = document.getElementById("themeToggle");
    if (themeBtn) {
      themeBtn.addEventListener("click", () => this.toggleTheme());
    }
  },
};

document.addEventListener("DOMContentLoaded", () => App.init());
