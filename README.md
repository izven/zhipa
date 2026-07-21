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
│   └── images/                ← 存放 app-logo.png, banner.png
│
├── .github/workflows/
│   └── release.yml            ← GitHub Actions: 自动更新 manifest + 部署 Pages
│
├── README.md
└── LICENSE
```