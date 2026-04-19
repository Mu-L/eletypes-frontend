# Eletypes 打字

> **一款优雅、开源的打字测试工具，内置匿名排行榜、成就徽章，和 3D 键盘设计工坊。** 无需注册、无广告、所有数据仅保存在你的浏览器。

**🌐 [English](./README.md) · [中文](./README.zh-CN.md)**

[![线上](https://img.shields.io/badge/www-eletypes.com-6ec6ff)](https://www.eletypes.com)
![版本](https://img.shields.io/github/v/release/gamer-ai/eletype-frontend?include_prereleases)
![Stars](https://img.shields.io/github/stars/gamer-ai/eletype-frontend?style=social)
![Discord](https://img.shields.io/discord/993567075589181621)
[![许可](https://img.shields.io/badge/license-GPL--3.0-blue)](LICENSE)

<img width="1000" alt="Eletypes" src="https://user-images.githubusercontent.com/39578778/187084111-97d69aa7-53e4-46b9-b156-3ecc4d180d08.png" />

## 为什么选择 Eletypes？

一个尊重你时间的打字工具 —— 快、干净、好看。由一个受够臃肿打字平台的键盘爱好者打造。灵感来自 [monkeytype.com](https://www.monkeytype.com/)，基于 React 18 + Vite，排行榜使用 Supabase。

## 功能

### 模式
- **打字测试** —— 支持英文与中文拼音，单词与句子模式，15/30/60/90 秒计时，可叠加数字 / 符号，脉冲与光标两种节奏样式
- **词卡** —— GRE、TOEFL、CET4/6，边打边记
- **Markdown 编辑器**（`/markdown`）—— 实时预览、语法高亮、导出 `.md`
- **键盘实验室**（`/keyboardlab`，*Beta*）—— 在浏览器里设计 3D 键盘：7 种布局、8 种键帽轮廓、参数化外壳编辑器、KLE 导入、完整 JSON Schema 编辑。→ [详细文档](src/components/features/KeyboardLab/KEYBOARD_LAB.md)
- **QWERTY 练习** —— 盲打训练

### 社交与进阶
- **匿名排行榜** —— 各模式前 50 名，基于浏览器指纹身份，无需注册
- **徽章与段位** —— 30+ 成就，覆盖速度、准确率、稳定性、探索
- **统计面板** —— 活动热力图、WPM 趋势、异常检测、历史会话
- **挑战链接** —— 基于种子的确定性词序，和朋友打完全一样的测试
- **战绩分享卡** —— 一键生成图片，分享到 X / Discord / WhatsApp / LinkedIn / 微博 / 微信

### 体验
- **18 种主题**，包含 WebGL 动态背景（Tranquiluxe、Lumiflex、Opulento、Velustro）
- **打字音效** —— 樱桃青轴、机械键盘、打字机
- **专注 / 超静 模式** —— 无干扰界面
- **PWA** —— 可安装、可离线
- **中英双语 UI**
- **键盘快捷键** —— `Tab+Space` 重做 · `Tab+Enter` 重开

### 隐私
无账号、无广告、无追踪。历史与设置仅存在浏览器 localStorage。排行榜仅用浏览器指纹防刷。

## 快速开始

```bash
npm install
npm run dev      # localhost:3000
npm run build    # 生产构建
npm run deploy   # Firebase Hosting 部署
```

## 文档

- [键盘实验室 —— 架构与路线图](src/components/features/KeyboardLab/KEYBOARD_LAB.md)
- [Claude / Agent 协作指南](CLAUDE.md)

## 社区

- **Discord** —— 在应用页脚点击 Discord 图标加入
- **[问题反馈 / 需求提交](https://github.com/gamer-ai/eletype-frontend/issues)**

## 许可

[GPL-3.0](LICENSE) —— 可自由使用、修改、再分发。派生作品须以同样的许可保持开源。
