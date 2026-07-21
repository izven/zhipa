/* ============================================
   iOS OTA Distribution - GitHub Release Version Fetcher
   ============================================ */

const VersionManager = {
  cacheKey: "ota_release_cache",
  cacheTTL: 10 * 60 * 1000, // 10 minutes

  getRepoFull() {
    return window.APP_CONFIG?.repo || "";
  },

  getRepoOwner() {
    return this.getRepoFull().split("/")[0] || "";
  },

  getRepoName() {
    return this.getRepoFull().split("/")[1] || "";
  },

  getApiUrl(version) {
    const [owner, repo] = this.getRepoFull().split("/");
    if (!owner || !repo) return null;
    if (version) {
      return `https://api.github.com/repos/${owner}/${repo}/releases/tags/${version}`;
    }
    return `https://api.github.com/repos/${owner}/${repo}/releases/latest`;
  },

  async fetchRelease(version) {
    const apiUrl = this.getApiUrl(version);
    if (!apiUrl) {
      throw new Error("Repository not configured");
    }

    const response = await fetch(apiUrl, {
      headers: {
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("未找到发布版本");
      }
      if (response.status === 403) {
        throw new Error("API 限流，请稍后再试");
      }
      throw new Error(`请求失败 (${response.status})`);
    }

    return response.json();
  },

  async getLatestRelease(version) {
    try {
      const data = await this.fetchRelease(version);
      return this.parseReleaseData(data);
    } catch (err) {
      console.warn("Version fetch failed:", err.message);
      // Try cache
      const cached = this.getCache();
      if (cached) {
        return { ...cached, fromCache: true };
      }
      throw err;
    }
  },

  parseReleaseData(data) {
    const tagName = data.tag_name || "";
    const releaseName = data.name || tagName;
    const version = releaseName.startsWith("v") ? releaseName.substring(1) : releaseName;

    // Find IPA asset
    const ipaAsset = (data.assets || []).find(
      (a) => a.name && a.name.endsWith(".ipa")
    );

    return {
      version: version,
      tagName: tagName,
      name: releaseName,
      body: data.body || "",
      publishedAt: data.published_at || data.created_at,
      htmlUrl: data.html_url,
      ipaDownloadUrl: ipaAsset?.browser_download_url || null,
      ipaName: ipaAsset?.name || null,
      assetCount: data.assets?.length || 0,
      prerelease: data.prerelease || false,
      fromCache: false,
    };
  },

  getIPAUrl(tag, ipaFileName) {
    const [owner, repo] = this.getRepoFull().split("/");
    if (!owner || !repo) return "";
    const file = ipaFileName || window.APP_CONFIG?.ipaFileName || "app.ipa";
    return `https://github.com/${owner}/${repo}/releases/download/${tag}/${file}`;
  },

  // Cache
  setCache(data) {
    try {
      const cache = {
        data: data,
        timestamp: Date.now(),
      };
      localStorage.setItem(this.cacheKey, JSON.stringify(cache));
    } catch {}
  },

  getCache() {
    try {
      const raw = localStorage.getItem(this.cacheKey);
      if (!raw) return null;
      const cache = JSON.parse(raw);
      if (Date.now() - cache.timestamp > this.cacheTTL) {
        localStorage.removeItem(this.cacheKey);
        return null;
      }
      return cache.data;
    } catch {
      return null;
    }
  },

  clearCache() {
    try {
      localStorage.removeItem(this.cacheKey);
    } catch {}
  },
};
