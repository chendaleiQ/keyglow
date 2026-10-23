# KeyGlow

[English](README.md) · **简体中文**

[![Build](https://github.com/chendaleiQ/keyglow/actions/workflows/build.yml/badge.svg)](https://github.com/chendaleiQ/keyglow/actions/workflows/build.yml)

一个轻量的 macOS 菜单栏工具，用热力图查看常用按键、鼠标移动和点击分布。

![KeyGlow 英文界面，展示示例活动数据](docs/preview.png)

*截图使用示例数据。需要 macOS 13 或更新版本。*

## 功能

- 按 macOS ANSI 键盘布局显示各按键的使用次数。
- 鼠标移动密度、点击分布，按实际多显示器排列展示。
- 今日、近 7 天、全部记录，以及最近 60 秒的按键速度。
- 支持英文和简体中文，默认跟随设备语言。可在面板或菜单栏右键菜单中选择「跟随系统」「English」「简体中文」。
- 跟随系统浅色 / 深色外观，可暂停记录、设置登录时启动。

## 安装

从 [Releases](https://github.com/chendaleiQ/keyglow/releases) 下载 Apple Silicon + Intel 通用版 DMG，打开后将 **KeyGlow.app** 拖入「应用程序」。开发版可在 [Actions](https://github.com/chendaleiQ/keyglow/actions/workflows/build.yml) 下载构建产物压缩包，其中包含 DMG。

应用使用 ad-hoc 签名，尚未经过 Apple 公证。首次启动可能被 macOS 拦截；确认下载来自本仓库后，可在「系统设置 → 隐私与安全性」中选择「仍要打开」（如系统提供该选项）。

首次运行：

1. 在面板中点击「授予权限」。
2. 在「系统设置 → 隐私与安全性 → 输入监控」中启用 KeyGlow。没有弹出提示时，点击「打开系统设置」。
3. 授权后监听仍未启动时，点击「重启应用」。

点击菜单栏的键盘图标打开面板；右键图标可暂停 / 继续记录、切换语言、设置登录时启动、打开数据文件夹或退出。

## 隐私和存储

仅保存每天的按键次数、鼠标点击次数、滚动次数、移动距离，以及粗粒度的移动 / 点击网格。**不记录**输入文字、按键顺序、单次按键时间、窗口标题或屏幕内容。无网络请求、数据分析服务或账号系统。

数据保存在 `~/Library/Application Support/InputHeat/stats.json`。内部名称沿用 `InputHeat`，以保留历史统计。面板每 1.5 秒刷新，数据每 15 秒及退出时保存。移动距离由屏幕坐标估算，并非实际物理距离。

## 本地构建

使用 Swift、AppKit 和 WKWebView，无第三方依赖，无需 Xcode 工程。请先安装 Xcode 命令行工具（`xcode-select --install`）。

```sh
git clone https://github.com/chendaleiQ/keyglow.git
cd keyglow
./build.sh
open dist/KeyGlow.app
```

构建 Apple Silicon + Intel 通用版：

```sh
UNIVERSAL=1 ./build.sh
./package.sh  # 生成含「应用程序」快捷入口的 DMG
```

重新构建会改变 ad-hoc 签名，macOS 可能要求重新授予「输入监控」权限。

## 自动构建

[GitHub Actions](.github/workflows/build.yml) 在 push、pull request 和手动触发时构建通用版，检查应用包、双架构和签名，并上传带版本号的 DMG 及 SHA-256 校验文件。

推送到 `main` 且构建通过后，Actions 会读取 `Info.plist` 中的 `CFBundleShortVersionString`，自动创建对应标签（例如 `v1.2.0`），并将 DMG 和校验文件发布到 GitHub Release。已发布版本自动跳过；发布下一版前请更新 `Info.plist` 的版本号。已有标签不会被移动。仍支持手动推送与应用版本一致的 `v*` 标签。发布需要仓库的 Actions 工作流权限允许写入 Release。

## 平台与许可

目前仅支持 macOS，通过只读 `CGEventTap` 监听输入。暂不支持 Windows 和 Linux。

[Apache License 2.0](LICENSE) · Copyright 2026 chendaleiQ
