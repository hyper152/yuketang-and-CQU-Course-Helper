# cqu-Course-Helper

重庆大学课程平台 · 视频强制后台持续播放 · Tampermonkey 用户脚本

> 基于 [NJU_Auto-Course-Helper](https://github.com/xiaoch669/NJU_Auto-Course-Helper) 修改适配，感谢原作者的思路。

## 功能特点

本脚本专为重庆大学在线课程平台设计，解决视频学习中的后台暂停问题，实现无人值守的自动播放体验。

- **强制后台播放** — 切换到其他标签页、窗口被遮挡或浏览器最小化时，视频仍然持续播放，不会暂停
- **自动播放** — 页面加载后自动检测并播放视频，无需手动点击
- **暂停行为拦截** — 阻止平台脚本通过 `pause()`、`visibilitychange` 等机制暂停视频
- **动态内容支持** — 通过 `MutationObserver` 监听 DOM 变化，自动处理异步加载的视频元素（兼容 SPA 架构的课程平台）
- **多平台兼容** — 同时支持重庆大学课程平台、学堂在线、雨课堂等多个教育平台

## 适用范围

| 平台 | 匹配 URL |
|------|----------|
| 重庆大学课程平台 | `https://courses.cqu.edu.cn/*` |
| 学堂在线（视频页） | `https://www.xuetangx.com/learn/*/video/*` |
| 雨课堂 | `https://*.yuketang.cn/*` |

## 安装方法

### 1. 安装用户脚本管理器

在你的浏览器中安装 **Tampermonkey** 扩展：

| 浏览器 | 安装地址 |
|--------|----------|
| Chrome / Edge | [Chrome 网上应用店](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) |
| Firefox | [Firefox Add-ons](https://addons.mozilla.org/firefox/addon/tampermonkey/) |

> 如果使用 Edge，也可以直接在 Edge 扩展商店搜索 "Tampermonkey" 安装。

### 2. 安装脚本

**方式一：直接复制代码（推荐）**

1. 打开 [`cqu-Course-Helper.js`](cqu-Course-Helper.js) 文件
2. 复制全部代码
3. 点击浏览器工具栏中的 Tampermonkey 图标 → **添加新脚本**
4. 粘贴代码，按 `Ctrl+S` 保存

**方式二：手动创建**

打开 Tampermonkey 管理面板 → 添加新脚本 → 将 `cqu-Course-Helper.js` 中的代码完整复制进去 → 保存。

## 使用说明

1. 安装脚本后无需任何额外配置，脚本会在匹配的 URL 下自动激活
2. 正常访问课程平台的视频页面，打开任意课程视频
3. 视频将自动开始播放，你可以放心切换到其他标签页或应用

### 常见问题

**脚本未生效？**

- 确保浏览器已开启 **开发者模式**（Tampermonkey 在 Chrome Manifest V3 下需要此模式）
- Edge 用户请访问 `edge://extensions/`，打开 "开发人员模式"
- Chrome 用户请访问 `chrome://extensions/`，打开 "开发者模式"
- 保存脚本后刷新课程页面

**切换到后台后视频仍然暂停？**

- 刷新页面即可
- 某些平台可能会在播放一段时间后重新检测页面可见性，刷新可重置状态

**视频没有自动播放？**

- 脚本会自动将视频静音以绕过浏览器的自动播放策略（现代浏览器只允许静音视频自动播放）
- 如果仍未自动播放，请确认浏览器是否阻止了该页面的自动播放权限

## 技术原理

脚本通过以下机制实现后台持续播放：

1. **视频属性覆盖** — 强制设置 `muted`、`autoplay`、`preload` 属性，移除平台自定义的暂停相关属性（如 `data-pause-on-blur`）
2. **CSS 强制可见** — 覆盖 `display`、`visibility`、`opacity` 样式确保视频元素不被隐藏
3. **事件拦截** — 在捕获阶段拦截 `pause` 和 `visibilitychange` 事件，阻止平台脚本的暂停行为
4. **播放恢复** — 检测到视频暂停后立即调用 `play()` 恢复播放
5. **动态监听** — 使用 `MutationObserver` 监听 DOM 变化，自动处理异步加载的视频元素

## 脚本信息

- **版本**：v1.1
- **作者**：hyper152
- **技术栈**：原生 JavaScript（无外部依赖）
- **运行环境**：Tampermonkey / Greasemonkey / Violentmonkey

## 免责声明

- 本脚本仅用于辅助学习，请合理使用
- 脚本不会修改课程平台的服务端数据，所有操作均在浏览器端完成
- 使用本脚本产生的任何后果由用户自行承担
