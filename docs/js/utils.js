/* ============================================
   iOS OTA Distribution - Utility Functions
   ============================================ */

const Utils = {
  formatDate(dateStr) {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    } catch {
      return dateStr;
    }
  },

  formatDateRelative(dateStr) {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const diff = now - d;
      const days = Math.floor(diff / 86400000);
      if (days === 0) return "今天";
      if (days === 1) return "昨天";
      if (days < 7) return `${days} 天前`;
      if (days < 30) return `${Math.floor(days / 7)} 周前`;
      return this.formatDate(dateStr);
    } catch {
      return dateStr;
    }
  },

  getUrlParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
  },

  getBasePath() {
    const path = window.location.pathname;
    // For GitHub Pages project sites: /repo/
    const segments = path.split("/").filter(Boolean);
    if (segments.length > 1) {
      return "/" + segments[0];
    }
    return "";
  },

  showToast(message, duration = 3000) {
    let toast = document.getElementById("toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "toast";
      toast.className = "toast";
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add("visible");
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
      toast.classList.remove("visible");
    }, duration);
  },

  sanitizeHTML(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  },

  debounce(fn, delay = 300) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  },

  // Parse markdown-style release notes to HTML
  parseReleaseNotes(text) {
    if (!text) return '<p class="text-secondary">暂无更新内容</p>';

    // Normalize line endings: CRLF → LF, then clean standalone CR
    const normalized = text.trim().replace(/\r\n/g, "\n").replace(/\r/g, "");
    const lines = normalized.split("\n").filter(Boolean);

    // If lines start with - or *, wrap in ul
    if (lines.some((l) => /^[-*]\s/.test(l.trim()))) {
      const items = lines
        .map((l) => {
          const content = l.replace(/^[-*]\s/, "").trim();
          return content ? `<li>${content}</li>` : "";
        })
        .filter(Boolean);
      return `<ul>${items.join("")}</ul>`;
    }

    // Otherwise wrap each line in p
    return lines
      .map((l) => `<p>${l}</p>`)
      .join("");
  },
};
