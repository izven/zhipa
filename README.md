# iOS OTA Distribution

通过 GitHub Pages + GitHub Release 实现 iOS 应用 OTA 无线分发。

## 目录结构

```
├── docs/                      ← GitHub Pages 根目录
│   ├── index.html             ← 首页
│   ├── install.html           ← 安装页面
│   ├── 404.html               ← 404 页面
│   ├── CNAME                  ← 自定义域名 (可选)
│   ├── .nojekyll              ← 禁用 Jekyll
│   ├── manifest.plist         ← iOS OTA 安装清单
│   ├── css/
│   │   ├── app.css            ← 主样式
│   │   ├── dark.css           ← 暗黑模式
│   │   └── animation.css      ← 动画
│   ├── js/
│   │   ├── config.js          ← 配置文件
│   │   ├── app.js             ← 首页逻辑
│   │   ├── install.js         ← 安装页逻辑 (浏览器检测、itms-services)
│   │   ├── version.js         ← GitHub Release API 版本获取
│   │   ├── browser.js         ← 浏览器/设备检测
│   │   └── utils.js           ← 工具函数
│   └── images/                ← 存放 app-icon.png, banner.png
│
├── .github/workflows/
│   └── release.yml            ← GitHub Actions: 自动更新 manifest + 部署 Pages
│
├── README.md
└── LICENSE
```

## 快速开始

### 1. Fork / Clone 本仓库

```bash
git clone https://github.com/izven/zhipa.git
cd zhipa
```

### 2. 修改配置

编辑 [docs/js/config.js](docs/js/config.js)：

```javascript
const APP_CONFIG = {
  repo: "izven/zhipa",               // GitHub 仓库
  appName: "智慧强安",                 // App 名称
  bundleId: "com.demlution.iatianfangyetan",       // Bundle Identifier
  ipaFileName: "app.ipa",            // IPA 文件名
};
```

### 3. 启用 GitHub Pages

- 仓库 → Settings → Pages
- **Source**: Deploy from a branch
- **Branch**: `main` → `/docs`
- 或使用 GitHub Actions 方式部署 (推荐)

### 4. 添加应用图标 (可选)

将 `app-icon.png` (1024x1024) 和 `banner.png` 放入 `docs/images/` 目录。

### 5. 发布新版本

**发布流程：**

```mermaid
graph LR
    A[导出 IPA] --> B[上传 GitHub Release]
    B --> C[完成 ✓]
```

1. 在 Xcode 中 Archive 并 Export 为 IPA
2. 前往 GitHub 仓库 → Releases → Create a new release
3. 输入 tag (例如 `v1.2.3`)，上传 IPA 文件
4. 点击 "Publish release"
5. **(可选)** 手动更新 `docs/manifest.plist` 中的 IPA 下载链接和版本号
6. 使用 GitHub Actions workflow 可自动完成步骤 5

**你的分发链接为：**
```
https://izven.github.io/zhipa/
```

## GitHub Pages 访问地址

| 类型 | 地址 |
|------|------|
| 首页 | `https://izven.github.io/zhipa/` |
| 安装页 | `https://izven.github.io/zhipa/install.html?version=v1.2.3` |
| 清单 | `https://izven.github.io/zhipa/manifest.plist` |

## 安装说明

用户通过 Safari 打开安装页面后：

1. 点击「立即安装」，弹出提示后点击「允许」
2. 前往 **设置 → 通用 → VPN 与设备管理**
3. 找到开发者证书，点击「信任」
4. 返回桌面即可打开应用

### 浏览器兼容性

| 浏览器/环境 | 支持状态 |
|------------|---------|
| iOS Safari | ✅ 支持安装 |
| iOS Chrome/Firefox | ❌ 提示切换到 Safari |
| 微信 / QQ | ❌ 提示在 Safari 中打开 |
| Android | ❌ 提示使用 iOS 设备 |
| 桌面浏览器 | ❌ 提示使用 iPhone |

## 工作原理

iOS OTA 分发基于 `itms-services` 协议：

1. 用户访问安装页，点击「立即安装」
2. 页面生成 `itms-services://?action=download-manifest&url=manifest.plist` 链接
3. iOS 下载 `manifest.plist`，获取 IPA 下载地址
4. iOS 下载 IPA 并提示用户安装
5. 用户需要在设置中信任开发者证书

## GitHub Actions 自动部署

本仓库包含一个 workflow，当创建 Release 时会自动：

1. 根据 tag 生成正确的 `manifest.plist`
2. 提交更新到仓库
3. 部署到 GitHub Pages

### 手动触发

```bash
gh workflow run release.yml -f tag=v1.2.3
```

## License

MIT
