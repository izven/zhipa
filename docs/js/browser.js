/* ============================================
   iOS OTA Distribution - Browser / Device Detection
   ============================================ */

const BrowserDetect = {
  ua: "",

  init() {
    this.ua = navigator.userAgent.toLowerCase();
  },

  isWeChat() {
    return /micromessenger/.test(this.ua);
  },

  isQQ() {
    return /qq\b/.test(this.ua);
  },

  isWeChatOrQQ() {
    return this.isWeChat() || this.isQQ();
  },

  isIOS() {
    return /iphone|ipad|ipod/.test(this.ua);
  },

  isIPad() {
    return /ipad/.test(this.ua) || (this.isIOS() && window.innerWidth >= 768);
  },

  isAndroid() {
    return /android/.test(this.ua);
  },

  isMobile() {
    return this.isIOS() || this.isAndroid();
  },

  isDesktop() {
    return !this.isMobile();
  },

  isSafari() {
    return (
      /safari/.test(this.ua) &&
      !/chrome|crios|fxios|edge|edg|opios|opr\//.test(this.ua)
    );
  },

  isChrome() {
    return /chrome/.test(this.ua) && !/edge|edg|opr\//.test(this.ua);
  },

  getBrowserName() {
    if (this.isWeChat()) return "WeChat";
    if (this.isQQ()) return "QQ";
    if (this.isSafari()) return "Safari";
    if (this.isChrome()) return "Chrome";
    if (/firefox/.test(this.ua)) return "Firefox";
    if (/edge|edg/.test(this.ua)) return "Edge";
    return "Unknown";
  },

  getOS() {
    if (this.isIOS()) return "iOS";
    if (this.isAndroid()) return "Android";
    if (/mac os/.test(this.ua)) return "macOS";
    if (/windows/.test(this.ua)) return "Windows";
    if (/linux/.test(this.ua)) return "Linux";
    return "Unknown";
  },

  getDeviceInfo() {
    return {
      browser: this.getBrowserName(),
      os: this.getOS(),
      isIOS: this.isIOS(),
      isAndroid: this.isAndroid(),
      isWeChat: this.isWeChat(),
      isQQ: this.isQQ(),
      isMobile: this.isMobile(),
      isDesktop: this.isDesktop(),
      isSafari: this.isSafari(),
    };
  },

  // Can install via itms-services (iOS only, not WeChat/QQ)
  canInstallOTA() {
    return this.isIOS() && !this.isWeChatOrQQ() && this.isSafari();
  },
};
