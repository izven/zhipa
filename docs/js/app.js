/* ============================================
   iOS OTA Distribution - Main App (Index Page)
   ============================================ */

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
    try {
      const release = await VersionManager.getLatestRelease();
      VersionManager.setCache(release);

      // Update version display
      document.querySelectorAll("[data-version]").forEach((el) => {
        el.textContent = `v${release.version}`;
      });

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
      console.warn("Failed to load release info:", err.message);
    }
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
  },
};

document.addEventListener("DOMContentLoaded", () => App.init());
