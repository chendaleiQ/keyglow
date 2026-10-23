# KeyGlow

[![Build](https://github.com/chendaleiQ/keyglow/actions/workflows/build.yml/badge.svg)](https://github.com/chendaleiQ/keyglow/actions/workflows/build.yml)

A local-first macOS menu bar app that turns keyboard and mouse activity into live heatmaps.

![KeyGlow dashboard preview](docs/preview.png)

KeyGlow counts key presses and pointer activity on your Mac and renders them as a keyboard heatmap plus mouse movement/click heatmaps. It never records typed text, key sequences, window titles, or screen content.

## Features

- Keyboard heatmap based on the macOS ANSI layout, including modifiers, arrows, and function keys.
- Mouse movement density and click distribution heatmaps, with multi-display layouts merged automatically.
- Time ranges: today, last 7 days, or all time.
- Live refresh every 1.5 seconds; stats are written to disk every 15 seconds and on quit.
- Local-only storage: `~/Library/Application Support/InputHeat/stats.json`.
- No third-party dependencies. Pure Swift + AppKit + WKWebView.

## Requirements

macOS 13 or later.

## Prebuilt builds

GitHub Actions builds a universal app (Apple Silicon + Intel) on every push and pull request. Builds from tags matching `v*` are published automatically to [Releases](https://github.com/chendaleiQ/keyglow/releases).

Release builds are ad-hoc signed and not notarized. On first launch, right-click `KeyGlow.app` and choose **Open** (or run `xattr -cr /Applications/KeyGlow.app`).

## Build from source

```bash
git clone https://github.com/chendaleiQ/keyglow.git
cd keyglow
./build.sh                    # build for the current Mac architecture
# UNIVERSAL=1 ./build.sh      # optional: build arm64 + x86_64 universal app
open dist/KeyGlow.app
```

The build script compiles the Swift sources, assembles `dist/KeyGlow.app`, and applies an ad-hoc signature. There is no Xcode project or package dependency to install.

The workflow in `.github/workflows/build.yml` builds the universal app, verifies the bundle, uploads a zip artifact, and publishes a GitHub Release when a `v*` tag is pushed.

## Permissions

KeyGlow needs macOS **Input Monitoring** permission to observe global key and mouse events:

1. Open the panel and click **授予权限** (Grant Permission).
2. If no system prompt appears, click **打开系统设置** and enable the app under **System Settings › Privacy & Security › Input Monitoring**.
3. If the listener is still not active after granting permission, click **重启应用** (Restart App).

The app only listens via `CGEvent.tapCreate` with `listenOnly`; it does not intercept or modify system input.

## Privacy

- Stored data: per-key press counts, mouse click counts, pointer grid samples, scroll counts, and total pointer distance.
- Not stored: typed text, key sequences, timestamps of individual keystrokes, window titles, or screen content.
- No network requests, analytics, accounts, or cloud sync. Everything stays on the local machine.

## Platform support

Currently macOS only. The UI and statistics layer are portable, but global input monitoring is implemented with macOS-specific APIs. A Windows build would require a separate native hook layer and is not supported yet.

## License

Licensed under the [Apache License 2.0](LICENSE). Copyright 2026 chendaleiQ.

---

# 中文说明

一个本地运行的 macOS 菜单栏小工具：统计键盘按键次数、鼠标点击与移动轨迹，并在面板里生成键盘 / 鼠标热力图。

> 应用已由「输入热力图」更名为 **KeyGlow**。内部 bundle id、可执行文件与数据目录仍沿用 `InputHeat`，因此历史统计不会因改名而丢失。

## 安装与使用

1. 运行 `./build.sh` 生成 `dist/KeyGlow.app`。
2. 首次打开时，面板会提示授予「输入监控」权限：
   - 点「授予权限」，在弹出的系统提示中允许；
   - 如果没弹出，点「打开系统设置」，在 **隐私与安全性 › 输入监控** 中打开本 App。
   - 权限切换后若监听仍未生效，点面板里的「重启应用」。
3. 之后它会常驻菜单栏（键盘图标）：
   - **左键**图标：打开热力图面板；
   - **右键**图标：暂停记录、登录时启动、打开数据文件夹、退出等。

## 窗口交互

- 面板内容会随窗口高度自适应，**不需要竖向滚动**。
- 按住窗口顶部约 46px 的空白区域即可拖动窗口，顶部中央有拖动提示条。
- 双击顶部区域可快速最大化 / 还原窗口。

## 记录了什么

- 键盘：每个物理键被按下的**次数**（含修饰键、方向键、F 区），忽略长按自动重复。
- 鼠标：左/右/其他点击次数、滚轮次数、移动距离，以及按屏幕坐标划分的移动 / 点击网格。
- **不记录**输入的文字、按键时序、窗口标题或任何屏幕内容。
- 数据只保存在本机：`~/Library/Application Support/InputHeat/stats.json`。

## 热力图说明

- **键盘热力图**：按 macOS ANSI 键位映射，颜色根据选定时间范围内的按键次数相对着色。
- **鼠标热力图**：左图为移动密度（停留/经过越频繁越亮），右图为点击分布；多显示器按比例合并到同一张屏幕地图中。
- 时间范围支持：今日 / 近 7 天 / 全部。
- 面板每 1.5 秒自动刷新；数据每 15 秒及退出时落盘。
- 窗口高度较小时，统计副标题、图例和页脚会自动收起，保证键盘与鼠标热力图同屏可见。

## 开发

- 纯 Swift + AppKit + WKWebView，无第三方依赖。
- 监听通过 `CGEvent.tapCreate`（`listenOnly`）实现；鼠标移动不拦截，不改写系统输入。
- 重新构建会改变 ad-hoc 签名，macOS 可能要求重新授予「输入监控」权限。若打算长期使用，建议先移入 `/Applications` 再授权，之后不要随意重签。
- `./build.sh` 默认构建当前架构；`UNIVERSAL=1 ./build.sh` 会构建 Apple Silicon + Intel 通用版。

## 自动构建

- GitHub Actions 会在每次 push 和 pull request 时构建 macOS 通用版，并在 Actions 页面提供 zip 产物。
- 推送 `v*` 标签（例如 `v1.1.0`）会自动创建 GitHub Release 并附上通用版 zip。
- Release 中的 App 是 ad-hoc 签名、未公证；首次打开请右键选择「打开」，或执行 `xattr -cr /Applications/KeyGlow.app`。

需要 macOS 13+。
