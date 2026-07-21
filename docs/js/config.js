/* ============================================
   iOS OTA Distribution - Configuration
   ============================================
   使用前请修改以下配置项
   ============================================ */

const APP_CONFIG = {
  // ==== 必填配置 ====
  repo: "izven/zhipa",            // GitHub 仓库 (owner/repo)
  appName: "智慧强安",              // App 显示名称
  bundleId: "com.demlution.iatianfangyetan",     // Bundle Identifier
  ipaFileName: "zhqa.ipa",          // IPA 文件名 (上传到 Release 时的文件名)

  // ==== 可选配置 ====
  appIconInitial: "应",            // 无图标时显示的备选文字
  fallbackVersion: "1.0.0",         // API 不可用时显示的版本号
};
